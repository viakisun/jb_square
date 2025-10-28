"""
JBTP External Crawler
JBTP 유관기관공고 크롤러
"""

import asyncio
import re
import requests
from bs4 import BeautifulSoup
from datetime import datetime, date, timedelta
from typing import Callable, List, Optional
from dateutil import parser

from src.core.database import SessionLocal
from src.models.crawler_config import JBTPConfig
from src.models.notice import CrawlQueue, Notice
from src.services.rate_limiter import RateLimiter
from .base_crawler import BaseCrawler, CrawlerStatus


class JBTPExternalCrawler(BaseCrawler):
    """
    JBTP 유관기관공고 크롤러

    JBTP 웹사이트의 유관기관공고 게시판에서 공고를 수집합니다.
    """

    def __init__(self):
        super().__init__("jbtp_external")

    def _load_jbtp_external_configs(self) -> List[tuple]:
        """JBTP 유관기관공고 설정을 DB에서 로드합니다. (게시판명, URL, 키워드, date_range_days) 반환"""
        db = SessionLocal()
        try:
            configs = db.query(JBTPConfig).filter(
                JBTPConfig.config_type == 'external_notices',
                JBTPConfig.enabled == True
            ).all()
            return [(c.name, c.board_url, c.keywords or [], c.date_range_days or 30) for c in configs]
        finally:
            db.close()

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

        # 3. Extract other fields (유관기관공고의 경우 organization이 제공됨)
        parsed['organization'] = notice.get('organization') or detail.get('writer')
        parsed['department'] = None  # Not available in JBTP
        parsed['contact'] = None  # Not available in JBTP
        parsed['views'] = detail.get('views', 0)
        parsed['status'] = detail.get('status')  # '접수중', '마감'

        return parsed

    def _save_single_notice(self, notice: dict, keywords: List[str], db) -> tuple:
        """
        단일 공고를 notice_crawl_queue에 저장합니다.

        Args:
            notice: 공고 데이터
            keywords: 키워드 리스트
            db: 데이터베이스 세션

        Returns:
            tuple[str, List[str], Optional[CrawlQueue]]: (상태, 매칭된 키워드 리스트, 저장된 객체)
            상태: 'added', 'updated', 'rejected', 'duplicate', 'no_match'
        """
        title = notice['title']

        # 키워드 매칭 확인
        matched_keywords = []
        if keywords:
            matched_keywords = self.match_keywords(title, keywords)

        # Parse structured data from raw_data
        parsed_data = self._parse_jbtp_data(notice)

        # 1. 이미 존재하는지 확인 (title + crawler_source_id로 중복 체크)
        existing = db.query(CrawlQueue).filter(
            CrawlQueue.crawler_source_id == self.source_id,
            CrawlQueue.title == title
        ).first()

        if existing:
            # 2. 거부된 항목이면 스킵 (다시 추가하지 않음)
            if existing.rejection_status == 'rejected':
                return ('rejected', matched_keywords, None)

            # 3. 기존 항목 업데이트 (최신 정보 반영)
            existing.link = notice.get('link')
            existing.source_board_name = notice.get('board')
            existing.raw_data = notice
            existing.matched_keywords = matched_keywords
            existing.crawler_extracted_at = datetime.now()
            # Update parsed fields
            existing.deadline = parsed_data.get('deadline')
            existing.published_date = parsed_data.get('published_date')
            existing.organization = parsed_data.get('organization')
            existing.department = parsed_data.get('department')
            existing.contact = parsed_data.get('contact')
            existing.views = parsed_data.get('views', 0)
            existing.status = parsed_data.get('status')
            return ('updated', matched_keywords, existing)
        else:
            # 4. 새로운 항목 추가
            queue_item = CrawlQueue(
                crawler_source_id=self.source_id,
                title=title,
                link=notice.get('link'),
                source_board_name=notice.get('board'),
                raw_data=notice,
                matched_keywords=matched_keywords,
                crawler_extracted_at=datetime.now(),
                rejection_status=None,  # NULL = pending review
                # Structured fields
                deadline=parsed_data.get('deadline'),
                published_date=parsed_data.get('published_date'),
                organization=parsed_data.get('organization'),
                department=parsed_data.get('department'),
                contact=parsed_data.get('contact'),
                views=parsed_data.get('views', 0),
                status=parsed_data.get('status')
            )
            db.add(queue_item)
            return ('added', matched_keywords, queue_item)

    def _extract_jbtp_meta_info(self, bbs_view, detail: dict) -> None:
        """
        JBTP 상세 페이지에서 메타 정보를 추출합니다.

        Args:
            bbs_view: BeautifulSoup 객체 (.bbs_view 영역)
            detail: 추출된 정보를 저장할 딕셔너리
        """
        try:
            # 제목 추출
            title_elem = bbs_view.select_one('.bbs_vtop h4')
            if title_elem:
                detail['full_title'] = title_elem.get_text(strip=True)

            # 메타 정보 추출 (작성자, 작성일, 조회수, 상태, 마감일)
            txt_list = bbs_view.select('.bbs_vtop ul.txt_list li')
            for li in txt_list:
                strong = li.find('strong')
                span = li.find('span')

                if not strong or not span:
                    continue

                label = strong.get_text(strip=True).rstrip(':').strip()
                value = span.get_text(strip=True)

                if label == '작성자':
                    detail['writer'] = value
                elif label == '작성일':
                    detail['published_date'] = value
                elif label == '조회수':
                    # 숫자로 변환 시도 (실패 시 문자열 그대로)
                    try:
                        detail['views'] = int(value.replace(',', ''))
                    except ValueError:
                        detail['views'] = value
                elif label == '상태':
                    detail['status'] = value
                elif label == '마감일':
                    detail['deadline'] = value
                    # D-day 정보 추출
                    em = span.find('em', class_='dday')
                    if em:
                        detail['d_day'] = em.get_text(strip=True)
        except Exception as e:
            print(f"Error extracting meta info: {str(e)}")

    def _extract_jbtp_attachments(self, bbs_view, detail: dict) -> None:
        """
        JBTP 상세 페이지에서 첨부파일 정보를 추출합니다.

        Args:
            bbs_view: BeautifulSoup 객체 (.bbs_view 영역)
            detail: 추출된 정보를 저장할 딕셔너리
        """
        try:
            file_dl = bbs_view.select('.bbs_filedown dl dd')
            if not file_dl:
                return

            detail['attachments'] = []
            for dd in file_dl:
                # 파일명 추출 (불필요한 텍스트 제거)
                filename = dd.get_text(strip=True)
                filename = filename.replace('미리보기', '').replace('다운로드', '').strip()

                if not filename:
                    continue

                # 다운로드 링크 추출
                download_link = dd.select_one('a.sbtn_down')
                if download_link:
                    file_url = download_link.get('href', '')

                    # 상대 URL을 절대 URL로 변환
                    if file_url and not file_url.startswith('http'):
                        file_url = 'https://www.jbtp.or.kr' + file_url

                    if file_url:
                        detail['attachments'].append({
                            'filename': filename,
                            'url': file_url
                        })
        except Exception as e:
            print(f"Error extracting attachments: {str(e)}")

    def _extract_jbtp_content_viewer(self, bbs_view, detail: dict) -> None:
        """
        JBTP 상세 페이지에서 콘텐츠 뷰어 정보를 추출합니다.

        Args:
            bbs_view: BeautifulSoup 객체 (.bbs_view 영역)
            detail: 추출된 정보를 저장할 딕셔너리
        """
        try:
            content_iframe = bbs_view.select_one('.bbs_con iframe')
            if content_iframe:
                iframe_src = content_iframe.get('src', '')
                if iframe_src:
                    # 상대 URL을 절대 URL로 변환
                    if iframe_src.startswith('/'):
                        detail['content_viewer_url'] = 'https://www.jbtp.or.kr' + iframe_src
                    else:
                        detail['content_viewer_url'] = iframe_src
                    detail['content_type'] = 'pdf_viewer'
        except Exception as e:
            print(f"Error extracting content viewer: {str(e)}")

    async def _fetch_jbtp_detail(self, session, url: str, rate_limiter) -> dict:
        """
        JBTP 상세 페이지에서 정보를 추출합니다.

        Args:
            session: requests.Session
            url: 상세 페이지 URL
            rate_limiter: RateLimiter 인스턴스

        Returns:
            dict: 상세 정보 (오류 발생 시 'error' 키 포함)
        """
        detail = {}

        try:
            # Rate limiting 적용
            rate_limiter.wait()

            # HTTP 요청
            response = session.get(url, timeout=10)

            if response.status_code != 200:
                detail['error'] = f"HTTP {response.status_code}"
                return detail

            # HTML 파싱
            soup = BeautifulSoup(response.text, 'html.parser')

            # .bbs_view 영역 찾기
            bbs_view = soup.find('div', class_='bbs_view')
            if not bbs_view:
                detail['error'] = 'bbs_view not found'
                return detail

            # 메타 정보 추출
            self._extract_jbtp_meta_info(bbs_view, detail)

            # 첨부파일 추출
            self._extract_jbtp_attachments(bbs_view, detail)

            # 콘텐츠 뷰어 정보 추출
            self._extract_jbtp_content_viewer(bbs_view, detail)

        except requests.exceptions.Timeout:
            detail['error'] = 'Timeout'
        except requests.exceptions.RequestException as e:
            detail['error'] = f'RequestException: {str(e)}'
        except Exception as e:
            detail['error'] = f'Unexpected error: {str(e)}'

        return detail

    async def execute(self, callback: Optional[Callable] = None):
        """크롤링 실행"""
        try:
            await self.send_event(callback, "start", {
                "source_id": self.source_id,
                "message": "JBTP 유관기관공고 크롤링을 시작합니다..."
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
            board_configs = self._load_jbtp_external_configs()

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

                    # 날짜 기준 계산
                    cutoff_date = datetime.now() - timedelta(days=date_range_days)

                    await self.send_event(callback, "log", {
                        "source_id": self.source_id,
                        "message": f"\n[{board_name}] 수집 시작 (최근 {date_range_days}일간 데이터)... (대기: {waited:.2f}s)"
                    })

                    board_saved_count = 0
                    board_checked_count = 0

                    # 1단계: 날짜 기준까지 페이지 수집
                    notice_rows = []
                    seen_titles = set()  # 중복 제거용
                    found_old_notices = False
                    page = 1
                    MAX_PAGES = 100  # 안전장치

                    while not found_old_notices and page <= MAX_PAGES:
                        # 중단 체크
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
                            for row in rows:
                                cols = row.find_all('td')
                                if len(cols) >= 6:  # 유관기관공고는 6개 컬럼 (0-5)
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

                                            # 중복 체크 (공지는 한 번만 수집)
                                            if title in seen_titles:
                                                continue
                                            seen_titles.add(title)

                                            link = title_tag.get('href', '')

                                            # 상대 경로를 절대 경로로 변환
                                            if link and not link.startswith('http'):
                                                if link.startswith('/'):
                                                    link = 'https://www.jbtp.or.kr' + link
                                                else:
                                                    link = 'https://www.jbtp.or.kr/' + link

                                            # 제목에서 [유관기관명] 추출
                                            org_match = re.match(r'^\[([^\]]+)\]', title)
                                            organization = org_match.group(1) if org_match else 'JBTP'

                                            # 작성일 추출 (컬럼 4: 등록일)
                                            posted_date = cols[4].get_text(strip=True) if len(cols) > 4 else ''

                                            # 작성일 기준으로 날짜 체크 (유관기관공고는 마감일 없음)
                                            posted_datetime = self.parse_date(posted_date)
                                            if posted_datetime and posted_datetime < cutoff_date:
                                                found_old_notices = True
                                                await self.send_event(callback, "log", {
                                                    "source_id": self.source_id,
                                                    "message": f"  → 작성일 {posted_date}이 기준 날짜({cutoff_date.strftime('%Y-%m-%d')}) 이전, 수집 중단"
                                                })
                                                break

                                            notice_rows.append({
                                                'title': title,
                                                'link': link,
                                                'posted_date': posted_date,
                                                'deadline': '',  # 유관기관공고는 마감일 없음
                                                'organization': organization
                                            })
                                            page_notice_count += 1

                            # 페이지별 진행 로그
                            await self.send_event(callback, "log", {
                                "source_id": self.source_id,
                                "message": f"  → 페이지 {page}: {page_notice_count}개 발견 (누적: {len(notice_rows)}개)"
                            })

                            # 페이지별 진행 상태 전송
                            await self.send_event(callback, "page_progress", {
                                "source_id": self.source_id,
                                "board_name": board_name,
                                "page": page,
                                "page_count": page_notice_count,
                                "accumulated": len(notice_rows)
                            })

                            # 공고가 없으면 다음 페이지 없음
                            if page_notice_count == 0:
                                await self.send_event(callback, "log", {
                                    "source_id": self.source_id,
                                    "message": f"  → 페이지 {page}에 공고 없음, 수집 중단"
                                })
                                break

                            # 기준 날짜 이전 공고를 만났으면 수집 중단
                            if found_old_notices:
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

                            # 2) 대기 중?
                            in_queue = db.query(CrawlQueue).filter(
                                CrawlQueue.crawler_source_id == self.source_id,
                                CrawlQueue.title == title
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

                        # 전체 공고 개수 업데이트 (신규만)
                        self.status["total"] += stats_new

                        # 3단계: 신규 공고만 상세 페이지 크롤링
                        if stats_new > 0:
                            await self.send_event(callback, "log", {
                                "source_id": self.source_id,
                                "message": f"\n  → {stats_new}개 신규 공고 상세 정보 크롤링 시작...\n"
                            })

                            # 수집 완료 이벤트 전송
                            await self.send_event(callback, "collection_complete", {
                                "source_id": self.source_id,
                                "board_name": board_name,
                                "total_collected": stats_new
                            })

                            for notice_row in new_notices:
                                board_checked_count += 1

                                # 상세 페이지 크롤링
                                detail_data = await self._fetch_jbtp_detail(session, notice_row['link'], rate_limiter)

                                notice_data = {
                                    'title': notice_row['title'],
                                    'link': notice_row['link'],
                                    'posted_date': notice_row['posted_date'],
                                    'deadline': notice_row['deadline'],
                                    'organization': notice_row['organization'],
                                    'board': board_name,
                                    'source': 'JBTP',
                                    'extracted_at': datetime.now().isoformat(),
                                    'detail': detail_data
                                }

                                # 키워드 매칭된 항목만 DB에 저장
                                matched_keywords = notice_row['matched_keywords']
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
                    "message": "JBTP 유관기관공고 크롤링이 완료되었습니다.",
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
