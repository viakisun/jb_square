"""
JBTP Crawler
전북테크노파크 크롤러
"""

import asyncio
import requests
from bs4 import BeautifulSoup
from datetime import datetime, timedelta
from typing import Callable, Optional

from src.core.database import SessionLocal
from src.models.notice import CrawlQueue, Notice
from src.services.rate_limiter import RateLimiter
from .base_crawler import BaseCrawler, CrawlerStatus, CrawlerPhase
from .repositories import ConfigRepository, CrawlQueueRepository
from .strategies import JBTPExtractionStrategy


class JBTPCrawler(BaseCrawler):
    """
    JBTP 크롤러

    전북테크노파크의 공고를 수집합니다.
    """

    def __init__(self):
        super().__init__("jbtp")

    def _parse_jbtp_data(self, notice: dict) -> dict:
        """
        Parse JBTP raw_data and extract typed fields.

        Returns dict with parsed deadline, published_date, organization, etc.
        """
        parsed = {}

        # Get detail dict from raw_data
        detail = notice.get('detail', {}) if isinstance(notice, dict) else {}

        # 1. Parse deadline (remove D-day suffix)
        deadline_str = detail.get('deadline')
        if deadline_str:
            try:
                # Remove "-D-X" suffix: "2025-11-04 16:00-D-8" -> "2025-11-04 16:00"
                clean_deadline = re.sub(r'-D-\d+$', '', deadline_str).strip()
                parsed['deadline'] = parser.parse(clean_deadline)
            except:
                parsed['deadline'] = None
        else:
            parsed['deadline'] = None

        # 2. Parse published_date
        published_date_str = detail.get('published_date')
        if published_date_str:
            try:
                parsed['published_date'] = date.fromisoformat(published_date_str)
            except:
                parsed['published_date'] = None
        else:
            parsed['published_date'] = None

        # 3. Extract other fields
        parsed['organization'] = detail.get('writer')  # JBTP uses 'writer'
        parsed['department'] = None  # Not available in JBTP
        parsed['contact'] = None  # Not available in JBTP
        parsed['views'] = detail.get('views', 0)
        parsed['status'] = detail.get('status')  # '접수중', '마감'

        return parsed

    async def execute(self, callback: Optional[Callable] = None):
        """크롤링 실행"""
        try:
            await self.send_event(callback, "start", {
                "source_id": self.source_id,
                "message": "JBTP 크롤링을 시작합니다..."
            })

            rate_limiter = RateLimiter(0.5)

            # HTTP session 생성
            session = requests.Session()
            session.headers.update({
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9',
                'Accept-Language': 'ko-KR,ko;q=0.9,en-US;q=0.8,en;q=0.7',
            })

            # 크롤링할 게시판 목록 (DB에서 로드)
            board_configs = ConfigRepository.load_jbtp_configs('notices')

            # 초기값: 아직 공고 개수를 모르므로 0으로 시작
            self.status["total"] = 0
            self.status["progress"] = 0

            # 데이터베이스 세션 생성 (실시간 저장용)
            db = SessionLocal()

            try:
                total_saved = 0
                total_matched = 0

                for idx, (board_name, url, keywords, date_range_days) in enumerate(board_configs):
                    # 중단 체크
                    if self.stop_flag:
                        await self.send_event(callback, "stopped", {
                            "source_id": self.source_id,
                            "message": "크롤링이 사용자에 의해 중단되었습니다."
                        })
                        self.status["status"] = CrawlerStatus.STOPPED
                        db.close()
                        return

                    # Rate limiting
                    waited = rate_limiter.wait()

                    await self.send_event(callback, "log", {
                        "source_id": self.source_id,
                        "message": f"\n[{board_name}] 수집 시작 (게시일 {date_range_days}일 이내 또는 마감일 미래)... (대기: {waited:.2f}s)"
                    })

                    board_saved_count = 0
                    board_checked_count = 0

                    # 1단계: 필터 조건에 맞는 공고 수집
                    # - 게시일 기준 A일 이내 OR 마감일이 미래
                    notice_rows = []
                    seen_titles = set()  # 중복 제거용
                    consecutive_excluded = 0  # 연속으로 제외된 공고 수
                    page = 1
                    MAX_PAGES = 100  # 안전장치

                    # 필터 기준 날짜 계산
                    now = datetime.now()
                    cutoff_date = now - timedelta(days=date_range_days)

                    # 필터 정보 로그
                    await self.send_event(callback, "log", {
                        "source_id": self.source_id,
                        "message": f"  📅 필터 설정: 게시일 >= {cutoff_date.strftime('%Y-%m-%d')} OR 마감일 >= {now.strftime('%Y-%m-%d')}"
                    })

                    while page <= MAX_PAGES:
                        # 중단 체크
                        if self.stop_flag:
                            break

                        # 페이지 URL 생성 (JBTP는 menuCd 파라미터 사용)
                        if '?' in url:
                            page_url = f"{url}&pageNo={page}"
                        else:
                            page_url = f"{url}?pageNo={page}"

                        try:
                            response = session.get(page_url, timeout=10)

                            if response.status_code != 200:
                                break

                            soup = BeautifulSoup(response.text, 'html.parser')

                            # 테이블에서 공고 row 파싱
                            table = soup.find('table')
                            if not table:
                                break

                            tbody = table.find('tbody')
                            if tbody:
                                rows = tbody.find_all('tr')
                            else:
                                rows = table.find_all('tr')

                            page_notice_count = 0
                            page_duplicate_count = 0  # 페이지 내 중복 수
                            page_total_count = 0  # 페이지 내 전체 공고 수

                            for row in rows:
                                cols = row.find_all('td')
                                if len(cols) >= 7:  # 최소 7개 컬럼 필요 (0-6)
                                    # 번호 컬럼 확인 (컬럼 0)
                                    num_col = cols[0].get_text(strip=True)

                                    # 제목이 포함된 컬럼 찾기 (컬럼 1)
                                    title_col = None
                                    for col in cols:
                                        if col.find('a'):
                                            title_col = col
                                            break

                                    if title_col:
                                        title_tag = title_col.find('a')
                                        if title_tag:
                                            title = title_tag.get_text(strip=True)
                                            page_total_count += 1  # 전체 공고 수 증가

                                            # 중복 체크 (공지는 한 번만 수집)
                                            if title in seen_titles:
                                                page_duplicate_count += 1
                                                continue
                                            seen_titles.add(title)

                                            link = title_tag.get('href', '')

                                            # 상대 경로를 절대 경로로 변환
                                            if link and not link.startswith('http'):
                                                if link.startswith('/'):
                                                    link = 'https://www.jbtp.or.kr' + link
                                                else:
                                                    link = 'https://www.jbtp.or.kr/' + link

                                            # 마감일 추출 (컬럼 2)
                                            deadline = cols[2].get_text(strip=True) if len(cols) > 2 else ''

                                            # 작성일 추출 (컬럼 6)
                                            posted_date = cols[6].get_text(strip=True) if len(cols) > 6 else ''

                                            # 날짜 필터링: 게시일 A일 이내 OR 마감일 미래
                                            posted_datetime = self.parse_date(posted_date)
                                            deadline_datetime = self.parse_date(deadline)

                                            should_collect = False
                                            reason = ""

                                            # 1) 게시일이 A일 이내?
                                            if posted_datetime and posted_datetime >= cutoff_date:
                                                should_collect = True
                                                reason = f"게시일({posted_date}) >= cutoff({cutoff_date.strftime('%Y-%m-%d')})"

                                            # 2) 마감일이 미래?
                                            elif deadline_datetime and deadline_datetime >= now:
                                                should_collect = True
                                                reason = f"마감일({deadline}) >= now({now.strftime('%Y-%m-%d')})"

                                            # 디버그 로그 (페이지별 처음 5개 항목만)
                                            if page_total_count <= 5:
                                                debug_msg = f"[P{page} #{page_total_count}] {title[:30]}... | 게시일:{posted_date} | 마감일:{deadline} | 수집:{should_collect}"
                                                if should_collect:
                                                    debug_msg += f" ({reason})"
                                                await self.send_event(callback, "log", {
                                                    "source_id": self.source_id,
                                                    "message": f"  {debug_msg}"
                                                })

                                            # 수집 대상이 아니면 스킵
                                            if not should_collect:
                                                consecutive_excluded += 1
                                                continue
                                            else:
                                                # 수집 대상 발견 → 카운터 리셋
                                                consecutive_excluded = 0

                                            notice_rows.append({
                                                'title': title,
                                                'link': link,
                                                'posted_date': posted_date,
                                                'deadline': deadline
                                            })
                                            page_notice_count += 1

                            # 페이지별 진행 로그 (중복 정보 포함)
                            # 페이지 통계 계산
                            page_excluded_count = page_total_count - page_duplicate_count - page_notice_count

                            log_msg = f"  → 페이지 {page}: 전체 {page_total_count}개"
                            if page_duplicate_count > 0:
                                log_msg += f" | 중복 {page_duplicate_count}개"
                            if page_excluded_count > 0:
                                log_msg += f" | 필터제외 {page_excluded_count}개"
                            log_msg += f" | 수집 {page_notice_count}개 | 누적: {len(notice_rows)}개"

                            await self.send_event(callback, "log", {
                                "source_id": self.source_id,
                                "message": log_msg
                            })

                            # 페이지별 진행 상태 전송
                            await self.send_event(callback, "page_progress", {
                                "source_id": self.source_id,
                                "board_name": board_name,
                                "page": page,
                                "page_count": page_notice_count,
                                "accumulated": len(notice_rows)
                            })

                            # 공고가 전혀 없으면 (중복도 없음) 다음 페이지 없음
                            if page_total_count == 0:
                                await self.send_event(callback, "log", {
                                    "source_id": self.source_id,
                                    "message": f"  → 페이지 {page}에 공고 없음, 수집 중단"
                                })
                                break

                            # 연속으로 30개 이상 제외된 공고가 나오면 수집 중단
                            # (보통 한 페이지에 10~20개 정도 표시되므로 2페이지 정도)
                            if consecutive_excluded > 30:
                                await self.send_event(callback, "log", {
                                    "source_id": self.source_id,
                                    "message": f"  → 연속 {consecutive_excluded}개 필터 제외, 수집 중단"
                                })
                                break

                            # Rate limiting between pages
                            rate_limiter.wait()
                            await asyncio.sleep(0)  # WebSocket flush

                            # 페이지 증가
                            page += 1

                        except Exception as e:
                            await self.send_event(callback, "log", {
                                "source_id": self.source_id,
                                "message": f"  ✗ 페이지 {page} 수집 실패: {str(e)}"
                            })
                            break

                    # 모든 페이지 수집 완료 후 처리
                    total_notices = len(notice_rows)

                    # 2단계: 중복 체크 및 통계 생성
                    if total_notices > 0:
                        await self.send_event(callback, "log", {
                            "source_id": self.source_id,
                            "message": f"\n  → 총 {total_notices}개 공고 수집 완료. 중복 체크 중...\n"
                        })

                        # 중복 체크: 게시됨 vs 대기 중 vs 신규
                        stats_already_published = 0
                        stats_in_queue = 0
                        stats_new = 0
                        stats_matched = 0
                        stats_unmatched = 0

                        new_notices = []  # 신규 공고만 따로 저장

                        for notice_row in notice_rows:
                            title = notice_row['title']

                            # 1) 이미 게시됨?
                            published = db.query(Notice).filter(
                                Notice.title == title,
                                Notice.status == 'published'
                            ).first()
                            if published:
                                stats_already_published += 1
                                continue

                            # 2) 대기 중? (notice_id가 NULL이고 rejected가 아닌 것만)
                            in_queue = db.query(CrawlQueue).filter(
                                CrawlQueue.crawler_source_id == self.source_id,
                                CrawlQueue.title == title,
                                CrawlQueue.notice_id.is_(None),
                                CrawlQueue.rejection_status != 'rejected'
                            ).first()
                            if in_queue:
                                stats_in_queue += 1
                                continue

                            # 3) 신규!
                            stats_new += 1

                            # 키워드 매칭 확인
                            matched_keywords = self.match_keywords(title, keywords) if keywords else []
                            if matched_keywords:
                                stats_matched += 1
                            else:
                                stats_unmatched += 1

                            new_notices.append({
                                **notice_row,
                                'matched_keywords': matched_keywords
                            })

                        # 통계 출력
                        await self.send_event(callback, "statistics", {
                            "source_id": self.source_id,
                            "board_name": board_name,
                            "total": total_notices,
                            "already_published": stats_already_published,
                            "in_queue": stats_in_queue,
                            "new_items": stats_new,
                            "matched": stats_matched,
                            "unmatched": stats_unmatched
                        })

                        await self.send_event(callback, "log", {
                            "source_id": self.source_id,
                            "message": f"""  📊 중복 체크 완료:
    • 총 {total_notices}개
    • 이미 게시됨: {stats_already_published}개
    • 대기 중: {stats_in_queue}개
    • 🆕 신규: {stats_new}개
    • 🔍 키워드 매칭: {stats_matched}개
    • ❌ 매칭 없음: {stats_unmatched}개
"""
                        })

                        # 전체 공고 개수 업데이트 (키워드 매칭된 항목만)
                        self.status["total"] += stats_matched

                        # 3단계: 키워드 매칭된 신규 공고만 상세 페이지 크롤링
                        if stats_matched > 0:
                            await self.send_event(callback, "log", {
                                "source_id": self.source_id,
                                "message": f"\n  → {stats_matched}개 키워드 매칭 공고 상세 정보 크롤링 시작...\n"
                            })

                            # 수집 완료 이벤트 전송
                            await self.send_event(callback, "collection_complete", {
                                "source_id": self.source_id,
                                "board_name": board_name,
                                "total_collected": stats_matched
                            })

                            for notice_row in new_notices:
                                # 키워드 매칭된 항목만 상세 크롤링
                                matched_keywords = notice_row['matched_keywords']
                                if not matched_keywords:
                                    continue  # 매칭 안 된 것은 스킵

                                board_checked_count += 1

                                # 상세 페이지 크롤링 (JBTPExtractionStrategy 사용)
                                detail_data = await JBTPExtractionStrategy.fetch_detail(session, notice_row['link'], rate_limiter)

                                notice_data = {
                                    'title': notice_row['title'],
                                    'link': notice_row['link'],
                                    'posted_date': notice_row['posted_date'],
                                    'deadline': notice_row['deadline'],
                                    'board': board_name,
                                    'source': 'JBTP',
                                    'extracted_at': datetime.now().isoformat(),
                                    'detail': detail_data
                                }

                                # DB에 저장
                                if matched_keywords:
                                    status, _, queue_item = self._save_single_notice(
                                        notice_data, keywords, db
                                    )
                                    if status == 'added' or status == 'updated':
                                        board_saved_count += 1
                                        total_saved += 1
                                        total_matched += 1

                                        # DB 커밋 (즉시 저장하여 ID 생성)
                                        db.commit()
                                        db.refresh(queue_item)

                                        # 실시간으로 저장된 항목 전송 (item_added 이벤트)
                                        await self.send_event(callback, "item_added", {
                                            "source_id": self.source_id,
                                            "item": queue_item.to_dict()
                                        })

                                    # 로그 출력 (매칭된 경우만)
                                    keyword_str = ', '.join(matched_keywords)
                                    log_msg = f"  ✓ [매칭: {keyword_str}] {notice_row['title'][:50]}{'...' if len(notice_row['title']) > 50 else ''}"

                                    await self.send_event(callback, "log", {
                                        "source_id": self.source_id,
                                        "message": log_msg
                                    })
                                else:
                                    # 매칭 안된 경우도 커밋 (혹시 다른 변경사항이 있을 수 있음)
                                    db.commit()

                                # progress 상태 업데이트
                                self.status["progress"] += 1

                                # progress 이벤트 전송 (전체 진행률)
                                await self.send_event(callback, "progress", {
                                    "source_id": self.source_id,
                                    "progress": self.status["progress"],
                                    "total": self.status["total"],
                                    "success": board_saved_count,
                                    "failed": board_checked_count - board_saved_count,
                                    "percentage": int((self.status["progress"] / self.status["total"]) * 100) if self.status["total"] > 0 else 0
                                })

                                # 0.5초 대기 + WebSocket flush
                                rate_limiter.wait()
                                await asyncio.sleep(0)

                            # 게시판 완료 요약
                            self.status["success"] += 1
                            await self.send_event(callback, "log", {
                                "source_id": self.source_id,
                                "message": f"  → [{board_name}] 완료: {board_checked_count}개 확인, {board_saved_count}개 저장\n"
                            })
                        else:
                            await self.send_event(callback, "log", {
                                "source_id": self.source_id,
                                "message": f"  → 신규 공고 없음 (모두 중복)\n"
                            })
                    else:
                        self.status["failed"] += 1
                        await self.send_event(callback, "log", {
                            "source_id": self.source_id,
                            "message": f"  ✗ 공고를 찾을 수 없습니다\n"
                        })

                # 최종 요약
                await self.send_event(callback, "log", {
                    "source_id": self.source_id,
                    "message": f"\n✓ 전체 저장 완료: {total_saved}개 공고 (키워드 매칭: {total_matched}개)"
                })

                # 완료
                self.status["status"] = CrawlerStatus.COMPLETED
                await self.send_event(callback, "complete", {
                    "source_id": self.source_id,
                    "message": "JBTP 크롤링이 완료되었습니다.",
                    "total_collected": total_saved,
                    "total_matched": total_matched,
                    "success": self.status["success"],
                    "failed": self.status["failed"],
                    "rate_limit_stats": rate_limiter.get_stats()
                })

            except Exception as e:
                db.rollback()
                raise e
            finally:
                db.close()

        except Exception as e:
            self.status["status"] = CrawlerStatus.ERROR
            self.status["error_message"] = str(e)

            await self.send_event(callback, "error", {
                "source_id": self.source_id,
                "message": f"크롤링 중 오류 발생: {str(e)}"
            })
