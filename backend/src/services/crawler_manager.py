"""
Crawler Manager
모든 크롤러를 관리하고 실시간 상태를 WebSocket으로 전송
"""

import asyncio
import json
import requests
from datetime import datetime, timedelta
from pathlib import Path
from typing import Callable, Dict, Optional, List
from enum import Enum

import sys
sys.path.append(str(Path(__file__).parent.parent.parent.parent / "crawler"))

from src.services.rate_limiter import RateLimiter
from src.core.database import SessionLocal, CrawlerConfig, CrawlResult
from src.models.notice import CrawlQueue
from src.models.crawler_config import JBTPConfig, BinetConfig


class CrawlerStatus(str, Enum):
    """크롤러 상태"""
    IDLE = "idle"
    RUNNING = "running"
    COMPLETED = "completed"
    ERROR = "error"
    STOPPED = "stopped"


class CrawlerManager:
    """
    크롤러 실행 및 상태 관리를 담당하는 매니저 클래스
    """

    def __init__(self):
        self.crawlers_status: Dict[str, dict] = {
            "jbtp": {
                "status": CrawlerStatus.IDLE,
                "progress": 0,
                "total": 0,
                "success": 0,
                "failed": 0,
                "last_run": None,
                "error_message": None
            },
            "ntis": {
                "status": CrawlerStatus.IDLE,
                "progress": 0,
                "total": 0,
                "success": 0,
                "failed": 0,
                "last_run": None,
                "error_message": None
            },
            "bizinfo": {
                "status": CrawlerStatus.IDLE,
                "progress": 0,
                "total": 0,
                "success": 0,
                "failed": 0,
                "last_run": None,
                "error_message": None
            },
            "bi_center": {
                "status": CrawlerStatus.IDLE,
                "progress": 0,
                "total": 0,
                "success": 0,
                "failed": 0,
                "last_run": None,
                "error_message": None
            }
        }

        self.stop_flags: Dict[str, bool] = {
            "jbtp": False,
            "ntis": False,
            "bizinfo": False,
            "bi_center": False
        }

    def get_status(self, source_id: str) -> dict:
        """특정 크롤러의 현재 상태를 반환합니다."""
        return self.crawlers_status.get(source_id, {})

    def get_all_status(self) -> dict:
        """모든 크롤러의 상태를 반환합니다."""
        return self.crawlers_status

    def stop_crawler(self, source_id: str):
        """크롤러 중단 플래그를 설정합니다."""
        if source_id in self.stop_flags:
            self.stop_flags[source_id] = True

    def _reset_status(self, source_id: str):
        """크롤러 상태를 초기화합니다."""
        self.crawlers_status[source_id] = {
            "status": CrawlerStatus.RUNNING,
            "progress": 0,
            "total": 0,
            "success": 0,
            "failed": 0,
            "last_run": datetime.now().isoformat(),
            "error_message": None
        }
        self.stop_flags[source_id] = False

    async def _send_event(self, callback: Optional[Callable], event_type: str, data: dict):
        """WebSocket을 통해 이벤트를 전송합니다."""
        if callback:
            event = {
                "type": event_type,
                "timestamp": datetime.now().isoformat(),
                **data
            }

            if asyncio.iscoroutinefunction(callback):
                await callback(json.dumps(event))
            else:
                callback(json.dumps(event))

    def _get_keywords(self, source_id: str) -> List[str]:
        """DB에서 크롤러의 키워드를 가져옵니다."""
        db = SessionLocal()
        try:
            config = db.query(CrawlerConfig).filter(CrawlerConfig.source_id == source_id).first()
            if config and config.keywords:
                return config.keywords
            return []
        finally:
            db.close()

    def _match_keywords(self, text: str, keywords: List[str]) -> List[str]:
        """텍스트에서 키워드 매칭을 수행합니다."""
        if not keywords:
            return []

        matched = []
        text_lower = text.lower()
        for keyword in keywords:
            if keyword.lower() in text_lower:
                matched.append(keyword)
        return matched

    def _parse_date(self, date_str: str) -> Optional[datetime]:
        """날짜 문자열을 datetime 객체로 파싱"""
        if not date_str:
            return None

        try:
            # "2025-01-15" 형식
            if '-' in date_str and len(date_str) >= 10:
                return datetime.strptime(date_str[:10], '%Y-%m-%d')
        except:
            pass

        return None

    def _load_jbtp_configs(self, config_type: str = 'notices') -> List[tuple]:
        """JBTP 설정을 DB에서 로드합니다. (게시판명, URL, 키워드, date_range_days) 반환"""
        db = SessionLocal()
        try:
            configs = db.query(JBTPConfig).filter(
                JBTPConfig.config_type == config_type,
                JBTPConfig.enabled == True
            ).all()
            return [(c.name, c.board_url, c.keywords or [], c.date_range_days or 30) for c in configs]
        finally:
            db.close()

    def _load_binet_configs(self) -> List[tuple]:
        """BI Center 설정을 DB에서 로드합니다."""
        db = SessionLocal()
        try:
            configs = db.query(BinetConfig).filter(BinetConfig.enabled == True).all()
            return [(c.region_name, c.region_code) for c in configs]
        finally:
            db.close()

    def _parse_jbtp_data(self, notice: dict) -> dict:
        """
        Parse JBTP raw_data and extract typed fields.

        Returns dict with parsed deadline, published_date, organization, etc.
        """
        import re
        from datetime import datetime, date
        from dateutil import parser

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

    def _save_single_notice(self, source_id: str, notice: dict, keywords: List[str], db) -> tuple[str, List[str], Optional[CrawlQueue]]:
        """
        단일 공고를 notice_crawl_queue에 저장합니다.

        Args:
            source_id: 크롤러 소스 ID
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
            matched_keywords = self._match_keywords(title, keywords)

        # Parse structured data from raw_data
        parsed_data = self._parse_jbtp_data(notice) if source_id == 'jbtp' else {}

        # 1. 이미 존재하는지 확인 (title + crawler_source_id로 중복 체크)
        existing = db.query(CrawlQueue).filter(
            CrawlQueue.crawler_source_id == source_id,
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
                crawler_source_id=source_id,
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

    def _save_results(self, source_id: str, notices: List[dict], keywords: List[str]):
        """
        크롤링 결과를 notice_crawl_queue에 저장합니다 (검토 대기).
        중복 및 거부된 항목은 스킵합니다.
        키워드 필터링: keywords가 있으면, 제목에 키워드가 포함된 공고만 저장합니다.
        """
        db = SessionLocal()
        try:
            skipped_rejected = 0
            skipped_duplicates = 0
            skipped_filtered = 0
            added_new = 0
            updated_existing = 0

            for notice in notices:
                title = notice['title']

                # 0. 키워드 필터링 (키워드가 설정되어 있으면)
                if keywords:
                    matched = self._match_keywords(title, keywords)
                    if not matched:
                        skipped_filtered += 1
                        continue  # 키워드 매칭 안되면 저장하지 않음

                # 1. 이미 존재하는지 확인 (title + crawler_source_id로 중복 체크)
                existing = db.query(CrawlQueue).filter(
                    CrawlQueue.crawler_source_id == source_id,
                    CrawlQueue.title == title
                ).first()

                if existing:
                    # 2. 거부된 항목이면 스킵 (다시 추가하지 않음)
                    if existing.rejection_status == 'rejected':
                        skipped_rejected += 1
                        continue

                    # 3. 기존 항목이 있으면 데이터 업데이트 (최신 정보 반영)
                    existing.link = notice.get('link')
                    existing.source_board_name = notice.get('board')
                    existing.raw_data = notice
                    existing.crawler_extracted_at = datetime.now()
                    updated_existing += 1
                else:
                    # 4. 새로운 항목 추가
                    queue_item = CrawlQueue(
                        crawler_source_id=source_id,
                        title=title,
                        link=notice.get('link'),
                        source_board_name=notice.get('board'),
                        raw_data=notice,
                        crawler_extracted_at=datetime.now(),
                        rejection_status=None  # NULL = pending review
                    )
                    db.add(queue_item)
                    added_new += 1

            db.commit()

            # 통계 출력 (로깅용)
            print(f"[{source_id}] 저장 완료: 신규={added_new}, 업데이트={updated_existing}, "
                  f"키워드 필터={skipped_filtered}, 거부됨 스킵={skipped_rejected}, 중복 스킵={skipped_duplicates}")

        except Exception as e:
            print(f"Error saving crawl results: {str(e)}")
            db.rollback()
        finally:
            db.close()

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

            from bs4 import BeautifulSoup

            # HTTP 요청
            response = session.get(url, timeout=10)

            # 응답 상태 확인
            if response.status_code != 200:
                detail['error'] = f"HTTP {response.status_code}"
                return detail

            # HTML 파싱
            soup = BeautifulSoup(response.text, 'html.parser')
            bbs_view = soup.select_one('.bbs_view')

            if not bbs_view:
                detail['error'] = "상세 페이지 구조를 찾을 수 없습니다"
                return detail

            # 각 섹션별 정보 추출
            self._extract_jbtp_meta_info(bbs_view, detail)
            self._extract_jbtp_attachments(bbs_view, detail)
            self._extract_jbtp_content_viewer(bbs_view, detail)

        except requests.exceptions.Timeout:
            detail['error'] = "요청 시간 초과"
        except requests.exceptions.RequestException as e:
            detail['error'] = f"네트워크 오류: {str(e)}"
        except Exception as e:
            detail['error'] = f"예상치 못한 오류: {str(e)}"
            print(f"Error fetching JBTP detail from {url}: {str(e)}")

        return detail

    async def execute_jbtp(self, callback: Optional[Callable] = None):
        """
        JBTP 크롤러를 실행합니다.

        Args:
            callback: 실시간 업데이트를 전송할 콜백 함수 (WebSocket send)
        """
        source_id = "jbtp"
        self._reset_status(source_id)

        try:
            await self._send_event(callback, "start", {
                "source_id": source_id,
                "message": "JBTP 크롤링을 시작합니다..."
            })

            # requests와 BeautifulSoup import
            import requests
            from bs4 import BeautifulSoup

            rate_limiter = RateLimiter(0.5)

            # HTTP session 생성
            session = requests.Session()
            session.headers.update({
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9',
                'Accept-Language': 'ko-KR,ko;q=0.9,en-US;q=0.8,en;q=0.7',
            })

            # 크롤링할 게시판 목록 (DB에서 로드)
            board_configs = self._load_jbtp_configs('notices')

            # 초기값: 아직 공고 개수를 모르므로 0으로 시작
            self.crawlers_status[source_id]["total"] = 0
            self.crawlers_status[source_id]["progress"] = 0

            # 데이터베이스 세션 생성 (실시간 저장용)
            db = SessionLocal()

            try:
                total_saved = 0
                total_matched = 0

                for idx, (board_name, url, keywords, date_range_days) in enumerate(board_configs):
                    # 중단 체크
                    if self.stop_flags[source_id]:
                        await self._send_event(callback, "stopped", {
                            "source_id": source_id,
                            "message": "크롤링이 사용자에 의해 중단되었습니다."
                        })
                        self.crawlers_status[source_id]["status"] = CrawlerStatus.STOPPED
                        db.close()
                        return

                    # Rate limiting
                    waited = rate_limiter.wait()

                    # 날짜 기준 계산
                    cutoff_date = datetime.now() - timedelta(days=date_range_days)

                    await self._send_event(callback, "log", {
                        "source_id": source_id,
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
                        if self.stop_flags[source_id]:
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

                                            # 마감일 추출 (컬럼 2)
                                            deadline = cols[2].get_text(strip=True) if len(cols) > 2 else ''

                                            # 작성일 추출 (컬럼 6)
                                            posted_date = cols[6].get_text(strip=True) if len(cols) > 6 else ''

                                            # 마감일 기준으로 날짜 체크 (작성일 대신 마감일 사용)
                                            deadline_datetime = self._parse_date(deadline)
                                            if deadline_datetime and deadline_datetime < cutoff_date:
                                                found_old_notices = True
                                                await self._send_event(callback, "log", {
                                                    "source_id": source_id,
                                                    "message": f"  → 마감일 {deadline}이 기준 날짜({cutoff_date.strftime('%Y-%m-%d')}) 이전, 수집 중단"
                                                })
                                                break

                                            notice_rows.append({
                                                'title': title,
                                                'link': link,
                                                'posted_date': posted_date,
                                                'deadline': deadline
                                            })
                                            page_notice_count += 1

                            # 페이지별 진행 로그
                            await self._send_event(callback, "log", {
                                "source_id": source_id,
                                "message": f"  → 페이지 {page}: {page_notice_count}개 발견 (누적: {len(notice_rows)}개)"
                            })

                            # 페이지별 진행 상태 전송
                            await self._send_event(callback, "page_progress", {
                                "source_id": source_id,
                                "board_name": board_name,
                                "page": page,
                                "page_count": page_notice_count,
                                "accumulated": len(notice_rows)
                            })

                            # 공고가 없으면 다음 페이지 없음
                            if page_notice_count == 0:
                                await self._send_event(callback, "log", {
                                    "source_id": source_id,
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
                            await self._send_event(callback, "log", {
                                "source_id": source_id,
                                "message": f"  ✗ 페이지 {page} 수집 실패: {str(e)}"
                            })
                            break

                    # 모든 페이지 수집 완료 후 처리
                    total_notices = len(notice_rows)

                    # 2단계: 중복 체크 및 통계 생성
                    if total_notices > 0:
                        await self._send_event(callback, "log", {
                            "source_id": source_id,
                            "message": f"\n  → 총 {total_notices}개 공고 수집 완료. 중복 체크 중...\n"
                        })

                        # 중복 체크: 게시됨 vs 대기 중 vs 신규
                        from src.models.notice import Notice
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
                                CrawlQueue.crawler_source_id == source_id,
                                CrawlQueue.title == title
                            ).first()
                            if in_queue:
                                stats_in_queue += 1
                                continue

                            # 3) 신규!
                            stats_new += 1

                            # 키워드 매칭 확인
                            matched_keywords = self._match_keywords(title, keywords) if keywords else []
                            if matched_keywords:
                                stats_matched += 1
                            else:
                                stats_unmatched += 1

                            new_notices.append({
                                **notice_row,
                                'matched_keywords': matched_keywords
                            })

                        # 통계 출력
                        await self._send_event(callback, "statistics", {
                            "source_id": source_id,
                            "board_name": board_name,
                            "total": total_notices,
                            "already_published": stats_already_published,
                            "in_queue": stats_in_queue,
                            "new_items": stats_new,
                            "matched": stats_matched,
                            "unmatched": stats_unmatched
                        })

                        await self._send_event(callback, "log", {
                            "source_id": source_id,
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
                        self.crawlers_status[source_id]["total"] += stats_new

                        # 3단계: 신규 공고만 상세 페이지 크롤링
                        if stats_new > 0:
                            await self._send_event(callback, "log", {
                                "source_id": source_id,
                                "message": f"\n  → {stats_new}개 신규 공고 상세 정보 크롤링 시작...\n"
                            })

                            # 수집 완료 이벤트 전송
                            await self._send_event(callback, "collection_complete", {
                                "source_id": source_id,
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
                                    'board': board_name,
                                    'source': 'JBTP',
                                    'extracted_at': datetime.now().isoformat(),
                                    'detail': detail_data
                                }

                                # 키워드 매칭된 항목만 DB에 저장
                                matched_keywords = notice_row['matched_keywords']
                                if matched_keywords:
                                    status, _, queue_item = self._save_single_notice(
                                        source_id, notice_data, keywords, db
                                    )
                                    if status == 'added' or status == 'updated':
                                        board_saved_count += 1
                                        total_saved += 1
                                        total_matched += 1

                                        # DB 커밋 (즉시 저장하여 ID 생성)
                                        db.commit()
                                        db.refresh(queue_item)

                                        # 실시간으로 저장된 항목 전송 (item_added 이벤트)
                                        await self._send_event(callback, "item_added", {
                                            "source_id": source_id,
                                            "item": queue_item.to_dict()
                                        })

                                    # 로그 출력 (매칭된 경우만)
                                    keyword_str = ', '.join(matched_keywords)
                                    log_msg = f"  ✓ [매칭: {keyword_str}] {notice_row['title'][:50]}{'...' if len(notice_row['title']) > 50 else ''}"

                                    await self._send_event(callback, "log", {
                                        "source_id": source_id,
                                        "message": log_msg
                                    })
                                else:
                                    # 매칭 안된 경우도 커밋 (혹시 다른 변경사항이 있을 수 있음)
                                    db.commit()

                                # progress 상태 업데이트
                                self.crawlers_status[source_id]["progress"] += 1

                                # progress 이벤트 전송 (전체 진행률)
                                await self._send_event(callback, "progress", {
                                    "source_id": source_id,
                                    "progress": self.crawlers_status[source_id]["progress"],
                                    "total": self.crawlers_status[source_id]["total"],
                                    "success": board_saved_count,
                                    "failed": board_checked_count - board_saved_count,
                                    "percentage": int((self.crawlers_status[source_id]["progress"] / self.crawlers_status[source_id]["total"]) * 100) if self.crawlers_status[source_id]["total"] > 0 else 0
                                })

                                # 0.5초 대기 + WebSocket flush
                                rate_limiter.wait()
                                await asyncio.sleep(0)

                            # 게시판 완료 요약
                            self.crawlers_status[source_id]["success"] += 1
                            await self._send_event(callback, "log", {
                                "source_id": source_id,
                                "message": f"  → [{board_name}] 완료: {board_checked_count}개 확인, {board_saved_count}개 저장\n"
                            })
                        else:
                            await self._send_event(callback, "log", {
                                "source_id": source_id,
                                "message": f"  → 신규 공고 없음 (모두 중복)\n"
                            })
                    else:
                        self.crawlers_status[source_id]["failed"] += 1
                        await self._send_event(callback, "log", {
                            "source_id": source_id,
                            "message": f"  ✗ 공고를 찾을 수 없습니다\n"
                        })

                    # 게시판별 완료는 board_progress로만 표시 (progress 이벤트 제거)

                # 최종 요약
                await self._send_event(callback, "log", {
                    "source_id": source_id,
                    "message": f"\n✓ 전체 저장 완료: {total_saved}개 공고 (키워드 매칭: {total_matched}개)"
                })

                # 완료
                self.crawlers_status[source_id]["status"] = CrawlerStatus.COMPLETED
                await self._send_event(callback, "complete", {
                    "source_id": source_id,
                    "message": "JBTP 크롤링이 완료되었습니다.",
                    "total_collected": total_saved,
                    "total_matched": total_matched,
                    "success": self.crawlers_status[source_id]["success"],
                    "failed": self.crawlers_status[source_id]["failed"],
                    "rate_limit_stats": rate_limiter.get_stats()
                })

            except Exception as e:
                db.rollback()
                raise e
            finally:
                db.close()

        except Exception as e:
            self.crawlers_status[source_id]["status"] = CrawlerStatus.ERROR
            self.crawlers_status[source_id]["error_message"] = str(e)

            await self._send_event(callback, "error", {
                "source_id": source_id,
                "message": f"크롤링 중 오류 발생: {str(e)}"
            })

    async def execute_ntis(self, callback: Optional[Callable] = None):
        """
        NTIS API를 통해 R&D 공고를 수집합니다.

        Note: NTIS는 웹 크롤링을 금지하고 있으며, 공식 OpenAPI를 제공합니다.
        API 키는 .env 파일의 NTIS_API_KEY에 설정해야 합니다.

        API 신청: https://www.ntis.go.kr/rndopen/api/mng/apiMain.do
        또는: https://www.data.go.kr/data/15077315/openapi.do
        """
        source_id = "ntis"
        self._reset_status(source_id)

        try:
            import os

            # API 키 확인
            api_key = os.getenv('NTIS_API_KEY', '').strip()

            if not api_key:
                raise ValueError(
                    "NTIS API 키가 설정되지 않았습니다. "
                    ".env 파일에 NTIS_API_KEY를 입력해주세요. "
                    "API 키 신청: https://www.ntis.go.kr/rndopen/api/mng/apiMain.do"
                )

            await self._send_event(callback, "start", {
                "source_id": source_id,
                "message": "NTIS API 데이터 수집을 시작합니다..."
            })

            rate_limiter = RateLimiter(0.5)
            all_notices = []

            # NTIS OpenAPI 엔드포인트
            # TODO: 실제 API 엔드포인트와 파라미터는 API 문서 확인 후 수정 필요
            api_endpoints = [
                {
                    "name": "R&D 공고",
                    "url": "https://www.ntis.go.kr/openapi/service/getRnDTaskList",
                    "params": {
                        "serviceKey": api_key,
                        "numOfRows": 100,
                        "pageNo": 1,
                        "_type": "json"  # 또는 "xml"
                    }
                }
            ]

            self.crawlers_status[source_id]["total"] = len(api_endpoints)

            for idx, endpoint in enumerate(api_endpoints):
                # 중단 체크
                if self.stop_flags[source_id]:
                    await self._send_event(callback, "stopped", {
                        "source_id": source_id,
                        "message": "데이터 수집이 사용자에 의해 중단되었습니다."
                    })
                    self.crawlers_status[source_id]["status"] = CrawlerStatus.STOPPED
                    return

                rate_limiter.wait()

                await self._send_event(callback, "log", {
                    "source_id": source_id,
                    "message": f"[{endpoint['name']}] API 호출 중..."
                })

                try:
                    response = requests.get(
                        endpoint["url"],
                        params=endpoint["params"],
                        timeout=30
                    )

                    if response.status_code == 200:
                        # JSON 응답 파싱
                        try:
                            data = response.json()

                            # TODO: 실제 응답 구조에 맞게 파싱 로직 수정 필요
                            # 예시 구조 (실제와 다를 수 있음):
                            items = data.get('response', {}).get('body', {}).get('items', {}).get('item', [])

                            if not isinstance(items, list):
                                items = [items] if items else []

                            notices = []
                            for item in items:
                                notice = {
                                    'title': item.get('taskName', item.get('title', '')),
                                    'link': item.get('link', ''),
                                    'date': item.get('startDate', item.get('regDate', '')),
                                    'board': endpoint['name'],
                                    'source': 'NTIS',
                                    'extracted_at': datetime.now().isoformat(),
                                    'raw_data': {
                                        'detail': {
                                            'organization': item.get('organization', ''),
                                            'department': item.get('department', ''),
                                            'budget': item.get('budget', ''),
                                            'period': item.get('period', '')
                                        }
                                    }
                                }
                                notices.append(notice)

                                await self._send_event(callback, "log", {
                                    "source_id": source_id,
                                    "message": f"  ✓ [{notice['board']}] {notice['title'][:60]}{'...' if len(notice['title']) > 60 else ''}"
                                })

                            if notices:
                                all_notices.extend(notices)
                                self.crawlers_status[source_id]["success"] += 1

                                await self._send_event(callback, "log", {
                                    "source_id": source_id,
                                    "message": f"  → {len(notices)}개 공고 수집 완료"
                                })
                            else:
                                self.crawlers_status[source_id]["failed"] += 1
                                await self._send_event(callback, "log", {
                                    "source_id": source_id,
                                    "message": f"  ⚠ 데이터가 없습니다"
                                })

                        except (ValueError, KeyError) as e:
                            # JSON 파싱 오류
                            self.crawlers_status[source_id]["failed"] += 1
                            await self._send_event(callback, "log", {
                                "source_id": source_id,
                                "message": f"  ✗ API 응답 파싱 오류: {str(e)}"
                            })
                    else:
                        self.crawlers_status[source_id]["failed"] += 1
                        await self._send_event(callback, "log", {
                            "source_id": source_id,
                            "message": f"  ✗ HTTP {response.status_code} 오류"
                        })

                except requests.exceptions.Timeout:
                    self.crawlers_status[source_id]["failed"] += 1
                    await self._send_event(callback, "log", {
                        "source_id": source_id,
                        "message": f"  ✗ API 요청 시간 초과"
                    })
                except requests.exceptions.RequestException as e:
                    self.crawlers_status[source_id]["failed"] += 1
                    await self._send_event(callback, "log", {
                        "source_id": source_id,
                        "message": f"  ✗ 네트워크 오류: {str(e)}"
                    })
                except Exception as e:
                    self.crawlers_status[source_id]["failed"] += 1
                    await self._send_event(callback, "log", {
                        "source_id": source_id,
                        "message": f"  ✗ 오류: {str(e)}"
                    })

                # Progress update
                self.crawlers_status[source_id]["progress"] = idx + 1
                await self._send_event(callback, "progress", {
                    "source_id": source_id,
                    "progress": idx + 1,
                    "total": len(api_endpoints),
                    "percentage": int((idx + 1) / len(api_endpoints) * 100),
                    "success": self.crawlers_status[source_id]["success"],
                    "failed": self.crawlers_status[source_id]["failed"]
                })

            # DB에서 키워드 로드
            keywords = self._get_keywords(source_id)

            # DB에 저장
            self._save_results(source_id, all_notices, keywords)

            # 키워드 매칭 통계
            keyword_matched_count = sum(1 for notice in all_notices if self._match_keywords(notice['title'], keywords))

            await self._send_event(callback, "log", {
                "source_id": source_id,
                "message": f"결과 저장 완료: {len(all_notices)}개 공고 (키워드 매칭: {keyword_matched_count}개)"
            })

            # 완료
            self.crawlers_status[source_id]["status"] = CrawlerStatus.COMPLETED
            await self._send_event(callback, "complete", {
                "source_id": source_id,
                "message": "NTIS API 데이터 수집이 완료되었습니다.",
                "total_collected": len(all_notices),
                "success": self.crawlers_status[source_id]["success"],
                "failed": self.crawlers_status[source_id]["failed"],
                "rate_limit_stats": rate_limiter.get_stats()
            })

        except ValueError as e:
            # API 키 누락 오류
            self.crawlers_status[source_id]["status"] = CrawlerStatus.ERROR
            self.crawlers_status[source_id]["error_message"] = str(e)

            await self._send_event(callback, "error", {
                "source_id": source_id,
                "message": str(e)
            })

        except Exception as e:
            self.crawlers_status[source_id]["status"] = CrawlerStatus.ERROR
            self.crawlers_status[source_id]["error_message"] = str(e)
            await self._send_event(callback, "error", {
                "source_id": source_id,
                "message": f"크롤링 중 오류 발생: {str(e)}"
            })

    async def execute_bizinfo(self, callback: Optional[Callable] = None):
        """
        기업마당 API를 통해 지원사업 공고를 수집합니다.

        API: https://www.bizinfo.go.kr/web/lay1/program/S1T175C174/apiDetail.do
        """
        source_id = "bizinfo"
        self._reset_status(source_id)

        try:
            import os

            # API 키 확인
            api_key = os.getenv('BIZINFO_API_KEY', '').strip()

            if not api_key:
                raise ValueError(
                    "기업마당 API 키가 설정되지 않았습니다. "
                    ".env 파일에 BIZINFO_API_KEY를 입력해주세요. "
                    "API 키 신청: https://www.bizinfo.go.kr/web/lay1/program/S1T175C174/apiDetail.do"
                )

            await self._send_event(callback, "start", {
                "source_id": source_id,
                "message": "기업마당 API 데이터 수집을 시작합니다..."
            })

            rate_limiter = RateLimiter(0.5)
            all_notices = []

            # 기업마당 API 엔드포인트
            api_url = "https://www.bizinfo.go.kr/uss/rss/bizinfoApi.do"

            # API 파라미터
            # crtfcKey는 필수 파라미터, 미입력 시 XML 형태로 반환, 조회건수 미입력시 전체 조회
            params = {
                "crtfcKey": api_key
            }

            self.crawlers_status[source_id]["total"] = 1

            # 중단 체크
            if self.stop_flags[source_id]:
                await self._send_event(callback, "stopped", {
                    "source_id": source_id,
                    "message": "데이터 수집이 사용자에 의해 중단되었습니다."
                })
                self.crawlers_status[source_id]["status"] = CrawlerStatus.STOPPED
                return

            rate_limiter.wait()

            await self._send_event(callback, "log", {
                "source_id": source_id,
                "message": "API 호출 중..."
            })

            try:
                response = requests.get(api_url, params=params, timeout=30)

                if response.status_code == 200:
                    # 응답 파싱 (XML/RSS 형식)
                    try:
                        from bs4 import BeautifulSoup

                        soup = BeautifulSoup(response.text, 'xml')

                        # 에러 체크
                        req_err = soup.find('reqErr')
                        if req_err and req_err.get_text(strip=True):
                            error_msg = req_err.get_text(strip=True)
                            raise ValueError(f"API 인증 오류: {error_msg}")

                        # RSS item 파싱
                        items = soup.find_all('item')

                        notices = []
                        for item in items:
                            title = item.find('title')
                            link = item.find('link')
                            pub_date = item.find('pubDate')
                            description = item.find('description')
                            category = item.find('category')

                            notice = {
                                'title': title.get_text(strip=True) if title else '',
                                'link': link.get_text(strip=True) if link else '',
                                'date': pub_date.get_text(strip=True) if pub_date else '',
                                'board': category.get_text(strip=True) if category else '지원사업',
                                'source': 'Bizinfo',
                                'extracted_at': datetime.now().isoformat(),
                                'raw_data': {
                                    'detail': {
                                        'description': description.get_text(strip=True) if description else ''
                                    }
                                }
                            }

                            if notice['title']:  # 제목이 있는 경우만 추가
                                notices.append(notice)

                                await self._send_event(callback, "log", {
                                    "source_id": source_id,
                                    "message": f"  ✓ [{notice['board']}] {notice['title'][:60]}{'...' if len(notice['title']) > 60 else ''}"
                                })

                        if notices:
                            all_notices.extend(notices)
                            self.crawlers_status[source_id]["success"] += 1

                            await self._send_event(callback, "log", {
                                "source_id": source_id,
                                "message": f"  → {len(notices)}개 공고 수집 완료"
                            })
                        else:
                            self.crawlers_status[source_id]["failed"] += 1
                            await self._send_event(callback, "log", {
                                "source_id": source_id,
                                "message": f"  ⚠ 데이터가 없습니다"
                            })

                    except (ValueError, KeyError) as e:
                        # 파싱 오류
                        self.crawlers_status[source_id]["failed"] += 1
                        await self._send_event(callback, "log", {
                            "source_id": source_id,
                            "message": f"  ✗ API 응답 파싱 오류: {str(e)}"
                        })
                else:
                    self.crawlers_status[source_id]["failed"] += 1
                    await self._send_event(callback, "log", {
                        "source_id": source_id,
                        "message": f"  ✗ HTTP {response.status_code} 오류"
                    })

            except requests.exceptions.Timeout:
                self.crawlers_status[source_id]["failed"] += 1
                await self._send_event(callback, "log", {
                    "source_id": source_id,
                    "message": f"  ✗ API 요청 시간 초과"
                })
            except requests.exceptions.RequestException as e:
                self.crawlers_status[source_id]["failed"] += 1
                await self._send_event(callback, "log", {
                    "source_id": source_id,
                    "message": f"  ✗ 네트워크 오류: {str(e)}"
                })
            except Exception as e:
                self.crawlers_status[source_id]["failed"] += 1
                await self._send_event(callback, "log", {
                    "source_id": source_id,
                    "message": f"  ✗ 오류: {str(e)}"
                })

            # Progress update
            self.crawlers_status[source_id]["progress"] = 1
            await self._send_event(callback, "progress", {
                "source_id": source_id,
                "progress": 1,
                "total": 1,
                "percentage": 100,
                "success": self.crawlers_status[source_id]["success"],
                "failed": self.crawlers_status[source_id]["failed"]
            })

            # DB에서 키워드 로드
            keywords = self._get_keywords(source_id)

            # DB에 저장
            self._save_results(source_id, all_notices, keywords)

            # 키워드 매칭 통계
            keyword_matched_count = sum(1 for notice in all_notices if self._match_keywords(notice['title'], keywords))

            await self._send_event(callback, "log", {
                "source_id": source_id,
                "message": f"결과 저장 완료: {len(all_notices)}개 공고 (키워드 매칭: {keyword_matched_count}개)"
            })

            # 완료
            self.crawlers_status[source_id]["status"] = CrawlerStatus.COMPLETED
            await self._send_event(callback, "complete", {
                "source_id": source_id,
                "message": "기업마당 API 데이터 수집이 완료되었습니다.",
                "total_collected": len(all_notices),
                "success": self.crawlers_status[source_id]["success"],
                "failed": self.crawlers_status[source_id]["failed"],
                "rate_limit_stats": rate_limiter.get_stats()
            })

        except ValueError as e:
            # API 키 누락 오류
            self.crawlers_status[source_id]["status"] = CrawlerStatus.ERROR
            self.crawlers_status[source_id]["error_message"] = str(e)

            await self._send_event(callback, "error", {
                "source_id": source_id,
                "message": str(e)
            })

        except Exception as e:
            self.crawlers_status[source_id]["status"] = CrawlerStatus.ERROR
            self.crawlers_status[source_id]["error_message"] = str(e)

            await self._send_event(callback, "error", {
                "source_id": source_id,
                "message": f"데이터 수집 중 오류 발생: {str(e)}"
            })

    async def execute_bi_center(self, callback: Optional[Callable] = None):
        """
        전북 창업보육센터 크롤러를 실행합니다.

        1. https://www.smes.go.kr/binet/incu/center/list.do에서 전북 BI 센터 목록 수집
        2. 각 센터의 입주기업 정보 수집
        3. bi_centers, bi_companies 테이블에 저장
        """
        source_id = "bi_center"
        self._reset_status(source_id)

        driver = None

        try:
            await self._send_event(callback, "start", {
                "source_id": source_id,
                "message": "전북 창업보육센터 데이터 수집을 시작합니다..."
            })

            # Selenium WebDriver 설정
            from selenium import webdriver
            from selenium.webdriver.chrome.service import Service
            from selenium.webdriver.chrome.options import Options
            from selenium.webdriver.common.by import By
            from selenium.webdriver.support.select import Select
            from selenium.webdriver.support.ui import WebDriverWait
            from selenium.webdriver.support import expected_conditions as EC
            from webdriver_manager.chrome import ChromeDriverManager
            from src.models.bi_center import BICenter, BICompany

            chrome_options = Options()
            chrome_options.add_argument('--headless')
            chrome_options.add_argument('--no-sandbox')
            chrome_options.add_argument('--disable-dev-shm-usage')
            chrome_options.add_argument('--disable-gpu')
            chrome_options.add_argument('--window-size=1920,1080')

            driver = webdriver.Chrome(
                service=Service(ChromeDriverManager().install()),
                options=chrome_options
            )

            # 1. BI 센터 목록 페이지로 이동
            url = "https://www.smes.go.kr/binet/incu/center/list.do"
            driver.get(url)

            await self._send_event(callback, "log", {
                "source_id": source_id,
                "message": "페이지 로드 완료. 전북 지역 선택 중..."
            })

            # 지역 설정 로드 (DB에서)
            region_configs = self._load_binet_configs()
            if not region_configs:
                raise Exception("설정된 지역이 없습니다")

            # 첫 번째 지역 선택 (현재는 전북만 지원)
            region_name, region_code = region_configs[0]

            await self._send_event(callback, "log", {
                "source_id": source_id,
                "message": f"{region_name} 지역 선택 중..."
            })

            # 지역 선택 (JavaScript 함수 호출)
            driver.execute_script(f"fncSelectArea('{region_code}');")
            await asyncio.sleep(3)

            await self._send_event(callback, "log", {
                "source_id": source_id,
                "message": f"{region_name} 지역 데이터 로드 완료. BI 센터 파싱 중..."
            })

            # 두 번째 테이블이 센터 목록 (첫 번째는 통계)
            tables = driver.find_elements(By.TAG_NAME, 'table')
            if len(tables) < 2:
                raise Exception("센터 목록 테이블을 찾을 수 없습니다")

            table = tables[1]  # 두 번째 테이블
            rows = table.find_elements(By.TAG_NAME, 'tr')[1:]  # 헤더 제외

            centers_data = []
            for row in rows:
                cols = row.find_elements(By.TAG_NAME, 'td')
                if len(cols) >= 11:
                    # 센터 데이터 추출
                    org_name = cols[3].text.strip()
                    center_name_elem = cols[4]
                    center_name = center_name_elem.text.strip()
                    specialization = cols[6].text.strip()
                    vacant_rooms = cols[7].text.strip()  # 공실 정보

                    # 센터 ID 추출 (여러 링크에서 시도)
                    center_seq = None
                    try:
                        # 1. 입주기업 링크에서
                        company_link = cols[9].find_element(By.TAG_NAME, 'a')
                        onclick = company_link.get_attribute('onclick')
                        if onclick and 'fncCreateView' in onclick:
                            import re
                            match = re.search(r"fncCreateView\('([^']+)'\)", onclick)
                            if match:
                                center_seq = match.group(1)
                    except:
                        pass

                    # 2. 센터명 링크에서도 시도
                    if not center_seq:
                        try:
                            center_link = cols[4].find_element(By.TAG_NAME, 'a')
                            onclick = center_link.get_attribute('onclick')
                            if onclick and 'fncEditView' in onclick:
                                import re
                                match = re.search(r"fncEditView\('([^']+)'\)", onclick)
                                if match:
                                    center_seq = match.group(1)
                        except:
                            pass

                    # 지도보기 링크에서 위치 좌표 추출
                    location_coords = ''
                    try:
                        map_link = cols[8].find_element(By.TAG_NAME, 'a')
                        onclick = map_link.get_attribute('onclick')
                        if onclick and 'OpenWindow1' in onclick:
                            import re
                            match = re.search(r"OpenWindow1\('([^']+)','([^']+)'\)", onclick)
                            if match:
                                location_coords = match.group(2)
                    except:
                        pass

                    center_data = {
                        'region': '전북특별자치도',
                        'city': '',
                        'org_name': org_name,
                        'center_name': center_name,
                        'contact': '',  # 상세 페이지에서 수집
                        'specialization': specialization,
                        'vacant_rooms': vacant_rooms,
                        'location': location_coords,
                        'center_seq': center_seq,
                        'center_url': '',  # 상세 페이지에서 수집
                        'companies': []
                    }
                    centers_data.append(center_data)

                    await self._send_event(callback, "log", {
                        "source_id": source_id,
                        "message": f"  ✓ {center_name}"
                    })

            await self._send_event(callback, "log", {
                "source_id": source_id,
                "message": f"총 {len(centers_data)}개 BI 센터 발견. 입주기업 정보 수집 중..."
            })

            self.crawlers_status[source_id]["total"] = len(centers_data)

            # 2. 각 센터의 입주기업 정보 수집
            for idx, center in enumerate(centers_data):
                # 중단 체크
                if self.stop_flags[source_id]:
                    await self._send_event(callback, "stopped", {
                        "source_id": source_id,
                        "message": "크롤링이 사용자에 의해 중단되었습니다."
                    })
                    self.crawlers_status[source_id]["status"] = CrawlerStatus.STOPPED
                    return

                if not center['center_seq']:
                    await self._send_event(callback, "log", {
                        "source_id": source_id,
                        "message": f"  ⚠ [{center['center_name']}] 입주기업 링크 없음"
                    })
                    self.crawlers_status[source_id]["progress"] = idx + 1
                    continue

                try:
                    # 입주기업 상세 페이지로 이동
                    driver.execute_script(f"fncCreateView('{center['center_seq']}');")
                    await asyncio.sleep(2)

                    # 팝업 윈도우로 전환
                    driver.switch_to.window(driver.window_handles[-1])

                    # 입주기업 테이블 파싱
                    try:
                        company_table = driver.find_element(By.TAG_NAME, 'table')
                        company_rows = company_table.find_elements(By.TAG_NAME, 'tr')[1:]

                        companies = []
                        for company_row in company_rows:
                            company_cols = company_row.find_elements(By.TAG_NAME, 'td')
                            if len(company_cols) >= 5:
                                company = {
                                    'company_name': company_cols[0].text.strip(),
                                    'business_field': company_cols[1].text.strip(),
                                    'product': company_cols[2].text.strip(),
                                    'entry_date': company_cols[3].text.strip(),
                                    'status': company_cols[4].text.strip()
                                }
                                companies.append(company)

                        center['companies'] = companies

                        await self._send_event(callback, "log", {
                            "source_id": source_id,
                            "message": f"  ✓ [{center['center_name']}] {len(companies)}개 입주기업 수집"
                        })

                        self.crawlers_status[source_id]["success"] += 1

                    except Exception as e:
                        await self._send_event(callback, "log", {
                            "source_id": source_id,
                            "message": f"  ✗ [{center['center_name']}] 입주기업 파싱 오류: {str(e)}"
                        })
                        self.crawlers_status[source_id]["failed"] += 1

                    # 팝업 닫고 원래 창으로 복귀
                    driver.close()
                    driver.switch_to.window(driver.window_handles[0])

                except Exception as e:
                    await self._send_event(callback, "log", {
                        "source_id": source_id,
                        "message": f"  ✗ [{center['center_name']}] 오류: {str(e)}"
                    })
                    self.crawlers_status[source_id]["failed"] += 1

                    # 팝업이 열렸으면 닫기
                    try:
                        if len(driver.window_handles) > 1:
                            driver.close()
                            driver.switch_to.window(driver.window_handles[0])
                    except:
                        pass

                # Progress update
                self.crawlers_status[source_id]["progress"] = idx + 1
                await self._send_event(callback, "progress", {
                    "source_id": source_id,
                    "progress": idx + 1,
                    "total": len(centers_data),
                    "percentage": int((idx + 1) / len(centers_data) * 100),
                    "success": self.crawlers_status[source_id]["success"],
                    "failed": self.crawlers_status[source_id]["failed"]
                })

            # 3. DB에 저장
            await self._send_event(callback, "log", {
                "source_id": source_id,
                "message": "데이터베이스에 저장 중..."
            })

            db = SessionLocal()
            try:
                total_centers = 0
                total_companies = 0

                for center_data in centers_data:
                    # 센터 중복 체크 (org_name + center_name으로)
                    existing = db.query(BICenter).filter(
                        BICenter.org_name == center_data['org_name'],
                        BICenter.center_name == center_data['center_name']
                    ).first()

                    if existing:
                        # 기존 센터 업데이트
                        existing.region = center_data['region']
                        existing.city = center_data['city']
                        existing.contact = center_data['contact']
                        existing.specialization = center_data['specialization']
                        existing.vacant_rooms = center_data['vacant_rooms']
                        existing.location = center_data['location']
                        existing.companies_count = len(center_data['companies'])
                        center_obj = existing
                    else:
                        # 새 센터 추가
                        center_obj = BICenter(
                            region=center_data['region'],
                            city=center_data['city'],
                            org_name=center_data['org_name'],
                            center_name=center_data['center_name'],
                            contact=center_data['contact'],
                            specialization=center_data['specialization'],
                            vacant_rooms=center_data['vacant_rooms'],
                            location=center_data['location'],
                            companies_count=len(center_data['companies'])
                        )
                        db.add(center_obj)
                        total_centers += 1

                    db.flush()  # center_obj.id를 얻기 위해

                    # 기존 입주기업 삭제 (최신 데이터로 교체)
                    db.query(BICompany).filter(BICompany.center_id == center_obj.id).delete()

                    # 입주기업 저장
                    for company_data in center_data['companies']:
                        company_obj = BICompany(
                            center_id=center_obj.id,
                            company_name=company_data['company_name'],
                            business_field=company_data['business_field'],
                            product=company_data['product'],
                            entry_date=company_data['entry_date'],
                            status=company_data['status']
                        )
                        db.add(company_obj)
                        total_companies += 1

                db.commit()

                await self._send_event(callback, "log", {
                    "source_id": source_id,
                    "message": f"저장 완료: {total_centers}개 센터, {total_companies}개 입주기업"
                })

            except Exception as e:
                db.rollback()
                raise Exception(f"DB 저장 오류: {str(e)}")
            finally:
                db.close()

            # 완료
            self.crawlers_status[source_id]["status"] = CrawlerStatus.COMPLETED
            await self._send_event(callback, "complete", {
                "source_id": source_id,
                "message": "전북 창업보육센터 데이터 수집이 완료되었습니다.",
                "total_centers": len(centers_data),
                "total_companies": sum(len(c['companies']) for c in centers_data)
            })

        except Exception as e:
            self.crawlers_status[source_id]["status"] = CrawlerStatus.ERROR
            self.crawlers_status[source_id]["error_message"] = str(e)

            await self._send_event(callback, "error", {
                "source_id": source_id,
                "message": f"크롤링 중 오류 발생: {str(e)}"
            })

        finally:
            if driver:
                driver.quit()


# Singleton instance
crawler_manager = CrawlerManager()
