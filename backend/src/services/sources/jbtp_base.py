"""
JBTP Base Adapter
전북테크노파크 크롤러 공통 기반 클래스
"""

import asyncio
import re
import requests
from abc import abstractmethod
from bs4 import BeautifulSoup
from datetime import datetime, timedelta
from dateutil import parser
from typing import Callable, Optional, List, Dict, Any

from src.core.database import SessionLocal
from src.models.notice import CrawlQueue, Notice
from src.services.rate_limiter import RateLimiter
from src.services.utils.crawler_utils import parse_date
from ._base import BaseAdapter, CrawlerStatus
from .repositories import ConfigRepository
from .strategies import JBTPExtractionStrategy


class JBTPBaseAdapter(BaseAdapter):
    """
    JBTP 크롤러 공통 기반 클래스

    모든 JBTP 게시판 크롤러가 상속받아 사용합니다.
    동적 source_id를 지원하여 DB 기반으로 게시판을 추가할 수 있습니다.
    """

    def __init__(self, source_id: str):
        """
        Args:
            source_id: 소스 식별자 (예: 'source:jbtp:local:business')
        """
        super().__init__(source_id)

    @abstractmethod
    def parse_table_row(self, row) -> Optional[Dict[str, str]]:
        """
        게시판 테이블의 한 행을 파싱하여 공고 데이터를 추출합니다.

        각 게시판의 테이블 구조가 다르므로, 자식 클래스에서 반드시 구현해야 합니다.

        Args:
            row: BeautifulSoup Tag object representing a <tr> element

        Returns:
            Dict containing:
                - 'title': 공고 제목 (required)
                - 'link': 상세 페이지 링크 (required)
                - 'posted_date': 작성일 (required, format: "YYYY-MM-DD")
                - 'deadline': 마감일 (optional, format: "YYYY-MM-DD HH:MM" or empty string)

            None if:
                - Row should be skipped (e.g., invalid structure)
                - Row doesn't meet minimum requirements

        Example:
            {
                'title': '2025년 바이오 기업 육성 사업 공고',
                'link': 'https://www.jbtp.or.kr/board/view.jbtp?dataSid=12345',
                'posted_date': '2025-11-07',
                'deadline': '2025-11-30 17:00',
            }
        """
        pass

    def get_organization(self, notice_data: dict, detail: dict) -> Optional[str]:
        """
        공고의 발행 기관을 결정합니다.

        기본 구현은 None을 반환합니다.
        각 게시판의 특성에 맞게 자식 클래스에서 오버라이드해야 합니다.

        Args:
            notice_data: 테이블에서 파싱한 공고 데이터 (parse_table_row 반환값)
            detail: 상세 페이지에서 추출한 데이터

        Returns:
            발행 기관명 (예: "(재)전북테크노파크", "한국산업기술진흥원" 등)
            또는 None (기관 정보 없음)

        Example (jbtp_local):
            return "(재)전북테크노파크"  # 항상 고정값

        Example (jbtp_external):
            return notice_data.get('writer') or detail.get('writer')  # 파싱된 값
        """
        return None

    def _parse_jbtp_data(self, notice: dict) -> dict:
        """
        JBTP raw_data 파싱 및 구조화된 필드 추출

        Args:
            notice: 공고 데이터 딕셔너리

        Returns:
            파싱된 데이터 (deadline, published_date, organization 등)
        """
        parsed = {}

        # detail 딕셔너리 가져오기
        detail = notice.get('detail', {}) if isinstance(notice, dict) else {}

        # 1. 마감일 파싱 (D-day suffix 제거)
        deadline_str = detail.get('deadline')
        if deadline_str:
            try:
                # "-D-X" suffix 제거: "2025-11-04 16:00-D-8" -> "2025-11-04 16:00"
                clean_deadline = re.sub(r'-D-\d+$', '', deadline_str).strip()
                parsed['deadline'] = parser.parse(clean_deadline)
            except:
                parsed['deadline'] = None
        else:
            parsed['deadline'] = None

        # 2. 작성일 파싱
        published_date_str = detail.get('published_date')
        if published_date_str:
            try:
                parsed_date = parser.parse(published_date_str).date()
                parsed['published_date'] = parsed_date
                parsed['announcement_date'] = parsed_date
            except:
                parsed['published_date'] = None
                parsed['announcement_date'] = None
        else:
            parsed['published_date'] = None
            parsed['announcement_date'] = None

        # 3. 기타 필드
        parsed['organization'] = self.get_organization(notice, detail)
        parsed['department'] = None
        parsed['contact'] = None
        parsed['views'] = detail.get('views', 0)
        parsed['status'] = detail.get('status')

        return parsed

    def _save_single_notice(self, notice: dict, keywords: List[str], db) -> tuple:
        """
        단일 공고를 CrawlQueue에 저장

        Args:
            notice: 공고 데이터
            keywords: 키워드 리스트
            db: 데이터베이스 세션

        Returns:
            (상태, 매칭된_키워드_리스트, 저장된_객체)
            상태: 'added', 'updated', 'rejected', 'duplicate', 'no_match'
        """
        title = notice['title']

        # 키워드 매칭
        matched_keywords = []
        if keywords:
            matched_keywords = self.match_keywords(title, keywords)

        # 구조화된 데이터 파싱
        parsed_data = self._parse_jbtp_data(notice)

        # 기존 항목 확인
        existing = db.query(CrawlQueue).filter(
            CrawlQueue.crawler_source_id == self.source_id,
            CrawlQueue.title == title,
            CrawlQueue.published_notice_id.is_(None)
        ).first()

        if existing:
            # 거부된 항목은 스킵
            if existing.approval_status == 'rejected':
                return ('rejected', matched_keywords, None)

            # 기존 항목 업데이트
            existing.source_url = notice.get('link')
            existing.source_board_name = notice.get('board')
            existing.raw_data = notice
            existing.matched_keywords = matched_keywords
            existing.crawler_extracted_at = datetime.now()
            existing.application_deadline = parsed_data.get('deadline')
            existing.source_published_date = parsed_data.get('published_date')
            existing.organization = parsed_data.get('organization')
            existing.department = parsed_data.get('department')
            existing.contact_info = parsed_data.get('contact')
            existing.source_view_count = parsed_data.get('views', 0)
            existing.source_status = parsed_data.get('status')
            return ('updated', matched_keywords, existing)
        else:
            # 신규 항목 추가
            try:
                queue_item = CrawlQueue(
                    crawler_source_id=self.source_id,
                    title=title,
                    source_url=notice.get('link'),
                    source_board_name=notice.get('board'),
                    raw_data=notice,
                    matched_keywords=matched_keywords,
                    crawler_extracted_at=datetime.now(),
                    approval_status='pending',
                    application_deadline=parsed_data.get('deadline'),
                    source_published_date=parsed_data.get('published_date'),
                    organization=parsed_data.get('organization'),
                    department=parsed_data.get('department'),
                    contact_info=parsed_data.get('contact'),
                    source_view_count=parsed_data.get('views', 0),
                    source_status=parsed_data.get('status')
                )
                db.add(queue_item)
                db.flush()
                return ('added', matched_keywords, queue_item)
            except Exception as e:
                db.rollback()
                print(f"Item likely updated by trigger: {title[:50]}...")
                print(f"Error details: {type(e).__name__}: {str(e)}")
                import traceback
                traceback.print_exc()
                return ('updated', matched_keywords, None)

    async def _crawl_jbtp_board(
        self,
        board_name: str,
        url: str,
        keywords: List[str],
        date_range_days: int,
        session: requests.Session,
        rate_limiter: RateLimiter,
        db,
        callback: Optional[Callable] = None
    ) -> tuple:
        """
        JBTP 게시판 크롤링 (공통 로직)

        Args:
            board_name: 게시판 이름
            url: 게시판 URL
            keywords: 키워드 리스트
            date_range_days: 검색 기간 (일)
            session: HTTP 세션
            rate_limiter: Rate limiter
            db: DB 세션
            callback: WebSocket 콜백

        Returns:
            (저장된_개수, 확인한_개수)
        """
        # Rate limiting
        waited = await rate_limiter.wait()

        await self.send_event(callback, "log", {
            "source_id": self.source_id,
            "message": f"\n[{board_name}] 수집 시작 (게시일 {date_range_days}일 이내 또는 마감일 미래)... (대기: {waited:.2f}s)"
        })

        board_saved_count = 0
        board_checked_count = 0

        # 1단계: 필터 조건에 맞는 공고 수집
        notice_rows = []
        seen_titles = set()
        consecutive_excluded = 0
        page = 1
        MAX_PAGES = 100

        # 필터 기준 날짜 계산
        now = datetime.now()
        cutoff_date = now - timedelta(days=date_range_days)

        await self.send_event(callback, "log", {
            "source_id": self.source_id,
            "message": f"  📅 필터 설정: 게시일 >= {cutoff_date.strftime('%Y-%m-%d')} OR 마감일 >= {now.strftime('%Y-%m-%d')}"
        })

        # 페이지 루프
        while page <= MAX_PAGES:
            if self.stop_flag:
                break

            # 페이지 URL 생성 (JBTP는 startPage 파라미터 사용)
            if '?' in url:
                page_url = f"{url}&startPage={page}"
            else:
                page_url = f"{url}?startPage={page}"

            try:
                response = session.get(page_url, timeout=10)

                if response.status_code != 200:
                    break

                soup = BeautifulSoup(response.text, 'html.parser')

                # 테이블 파싱
                table = soup.find('table')
                if not table:
                    break

                tbody = table.find('tbody')
                rows = tbody.find_all('tr') if tbody else table.find_all('tr')

                page_notice_count = 0
                page_duplicate_count = 0
                page_total_count = 0

                for row in rows:
                    # Use polymorphic parsing method
                    parsed_row = self.parse_table_row(row)

                    if not parsed_row:
                        continue

                    title = parsed_row['title']
                    link = parsed_row['link']
                    posted_date = parsed_row['posted_date']
                    deadline = parsed_row.get('deadline', '')

                    page_total_count += 1

                    # 중복 체크
                    if title in seen_titles:
                        page_duplicate_count += 1
                        continue
                    seen_titles.add(title)

                    # 날짜 필터링
                    posted_datetime = parse_date(posted_date)
                    deadline_datetime = parse_date(deadline) if deadline else None

                    should_collect = False

                    # 게시일 체크
                    if posted_datetime and posted_datetime >= cutoff_date:
                        should_collect = True

                    # 마감일 체크
                    elif deadline_datetime and deadline_datetime >= now:
                        should_collect = True

                    if not should_collect:
                        consecutive_excluded += 1
                        continue
                    else:
                        consecutive_excluded = 0

                    notice_rows.append({
                        'title': title,
                        'link': link,
                        'posted_date': posted_date,
                        'deadline': deadline
                    })
                    page_notice_count += 1

                # 페이지 진행 로그
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

                # 페이지 진행 이벤트
                await self.send_event(callback, "page_progress", {
                    "source_id": self.source_id,
                    "board_name": board_name,
                    "page": page,
                    "page_count": page_notice_count,
                    "accumulated": len(notice_rows)
                })

                # 종료 조건
                if page_total_count == 0:
                    await self.send_event(callback, "log", {
                        "source_id": self.source_id,
                        "message": f"  → 페이지 {page}에 공고 없음, 수집 중단"
                    })
                    break

                # 페이지 전체가 중복인 경우 (새로운 공고가 하나도 없음)
                if page_total_count > 0 and page_notice_count == 0 and page_duplicate_count == page_total_count:
                    await self.send_event(callback, "log", {
                        "source_id": self.source_id,
                        "message": f"  → 페이지 {page} 전체 중복, 수집 중단"
                    })
                    break

                if consecutive_excluded > 30:
                    await self.send_event(callback, "log", {
                        "source_id": self.source_id,
                        "message": f"  → 연속 {consecutive_excluded}개 필터 제외, 수집 중단"
                    })
                    break

                # Rate limiting
                await rate_limiter.wait()
                await asyncio.sleep(0)

                page += 1

            except Exception as e:
                await self.send_event(callback, "log", {
                    "source_id": self.source_id,
                    "message": f"  ✗ 페이지 {page} 수집 실패: {str(e)}"
                })
                break

        # 2단계: 중복 체크 및 통계
        total_notices = len(notice_rows)

        if total_notices > 0:
            await self.send_event(callback, "log", {
                "source_id": self.source_id,
                "message": f"\n  → 총 {total_notices}개 공고 수집 완료. 중복 체크 중...\n"
            })

            # 중복 체크
            stats_already_published = 0
            stats_in_queue = 0
            stats_new = 0
            stats_matched = 0
            stats_unmatched = 0

            new_notices = []

            for notice_row in notice_rows:
                title = notice_row['title']

                # 이미 게시됨?
                published = db.query(Notice).filter(
                    Notice.title == title,
                    Notice.status == 'published'
                ).first()
                if published:
                    stats_already_published += 1
                    continue

                # 대기 중?
                in_queue = db.query(CrawlQueue).filter(
                    CrawlQueue.crawler_source_id == self.source_id,
                    CrawlQueue.title == title,
                    CrawlQueue.published_notice_id.is_(None),
                    CrawlQueue.approval_status != 'rejected'
                ).first()
                if in_queue:
                    stats_in_queue += 1
                    continue

                # 신규!
                stats_new += 1

                # 키워드 매칭
                matched_keywords = self.match_keywords(title, keywords) if keywords else []
                if matched_keywords:
                    stats_matched += 1
                else:
                    stats_unmatched += 1

                new_notices.append({
                    **notice_row,
                    'matched_keywords': matched_keywords
                })

            # 통계 이벤트
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

            # 전체 공고 개수 업데이트
            self.status["total"] += stats_matched

            # 3단계: 키워드 매칭된 신규 공고만 상세 크롤링
            if stats_matched > 0:
                await self.send_event(callback, "log", {
                    "source_id": self.source_id,
                    "message": f"\n  → {stats_matched}개 키워드 매칭 공고 상세 정보 크롤링 시작...\n"
                })

                await self.send_event(callback, "collection_complete", {
                    "source_id": self.source_id,
                    "board_name": board_name,
                    "total_collected": stats_matched
                })

                for notice_row in new_notices:
                    matched_keywords = notice_row['matched_keywords']
                    if not matched_keywords:
                        continue

                    board_checked_count += 1

                    # 상세 페이지 크롤링
                    detail_data = await JBTPExtractionStrategy.fetch_detail(
                        session, notice_row['link'], rate_limiter
                    )

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

                    # DB 저장
                    if matched_keywords:
                        status, _, queue_item = self._save_single_notice(
                            notice_data, keywords, db
                        )
                        if status == 'added' or status == 'updated':
                            board_saved_count += 1

                            # 즉시 커밋
                            db.commit()
                            db.refresh(queue_item)

                            # 실시간 이벤트
                            await self.send_event(callback, "item_added", {
                                "source_id": self.source_id,
                                "item": queue_item.to_dict()
                            })

                        # 로그
                        keyword_str = ', '.join(matched_keywords)
                        await self.send_event(callback, "log", {
                            "source_id": self.source_id,
                            "message": f"  ✓ [매칭: {keyword_str}] {notice_row['title'][:50]}"
                        })
                    else:
                        db.commit()

                    # Progress 업데이트
                    self.status["progress"] += 1

                    await self.send_event(callback, "progress", {
                        "source_id": self.source_id,
                        "progress": self.status["progress"],
                        "total": self.status["total"],
                        "success": board_saved_count,
                        "failed": board_checked_count - board_saved_count,
                        "percentage": int((self.status["progress"] / self.status["total"]) * 100) if self.status["total"] > 0 else 0
                    })

                    await rate_limiter.wait()
                    await asyncio.sleep(0)

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

        return (board_saved_count, board_checked_count)

    async def execute(self, callback: Optional[Callable] = None):
        """
        크롤링 실행 (단일 게시판)

        DB에서 config를 동적으로 로드하여 크롤링합니다.
        """
        try:
            await self.send_event(callback, "start", {
                "source_id": self.source_id,
                "message": "JBTP 크롤링을 시작합니다..."
            })

            # Config 로드 (통일된 방식)
            config = ConfigRepository.get_config(self.source_id)

            if not config:
                raise ValueError(f"Config not found for source_id: {self.source_id}")

            url = config['url']
            keywords = config['keywords']
            date_range_days = config['date_range_days']
            board_name = self.source_id.split(':')[-1].upper()  # 'source:jbtp:local:business' → 'BUSINESS'

            # HTTP session, rate limiter 생성
            rate_limiter = RateLimiter(0.5)
            session = requests.Session()
            session.headers.update({
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9',
                'Accept-Language': 'ko-KR,ko;q=0.9,en-US;q=0.8,en;q=0.7',
            })

            # DB 세션 생성
            db = SessionLocal()

            try:
                # 게시판 크롤링
                saved_count, checked_count = await self._crawl_jbtp_board(
                    board_name, url, keywords, date_range_days,
                    session, rate_limiter, db, callback
                )

                # 완료
                self.status["status"] = CrawlerStatus.COMPLETED
                await self.send_event(callback, "complete", {
                    "source_id": self.source_id,
                    "message": "JBTP 크롤링이 완료되었습니다.",
                    "total_collected": saved_count,
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
