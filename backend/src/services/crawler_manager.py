"""
Crawler Manager
모든 크롤러를 관리하고 실시간 상태를 WebSocket으로 전송
"""

import asyncio
import json
import requests
import xml.etree.ElementTree as ET
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
from src.services.crawlers import BICenterCrawler, BizinfoCrawler


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
            "jbtp_external": {
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
            "jbtp_external": False,
            "ntis": False,
            "bizinfo": False,
            "bi_center": False
        }

        # Refactored crawler instances
        self.crawlers = {
            "bi_center": BICenterCrawler(),
            "bizinfo": BizinfoCrawler(),
        }

    def get_status(self, source_id: str) -> dict:
        """특정 크롤러의 현재 상태를 반환합니다."""
        # Use refactored crawler if available
        if source_id in self.crawlers:
            return self.crawlers[source_id].get_status()
        return self.crawlers_status.get(source_id, {})

    def get_all_status(self) -> dict:
        """모든 크롤러의 상태를 반환합니다."""
        status = self.crawlers_status.copy()
        # Override with refactored crawler status
        for source_id, crawler in self.crawlers.items():
            status[source_id] = crawler.get_status()
        return status

    def stop_crawler(self, source_id: str):
        """크롤러 중단 플래그를 설정합니다."""
        # Use refactored crawler if available
        if source_id in self.crawlers:
            self.crawlers[source_id].stop()
        elif source_id in self.stop_flags:
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

    def _parse_jbtp_external_data(self, notice: dict) -> dict:
        """
        Parse JBTP External raw_data and extract typed fields.

        Returns dict with parsed published_date, organization, etc.
        """
        from datetime import date

        parsed = {}

        # 1. No deadline for external notices
        parsed['deadline'] = None

        # 2. Parse published_date from top-level field
        posted_date_str = notice.get('posted_date')
        if posted_date_str:
            try:
                parsed['published_date'] = date.fromisoformat(posted_date_str)
            except:
                parsed['published_date'] = None
        else:
            parsed['published_date'] = None

        # 3. Get organization from top-level field (extracted from title)
        parsed['organization'] = notice.get('organization', 'JBTP')
        parsed['department'] = None
        parsed['contact'] = None
        parsed['views'] = 0
        parsed['status'] = None

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
        if source_id == 'jbtp':
            parsed_data = self._parse_jbtp_data(notice)
        elif source_id == 'jbtp_external':
            parsed_data = self._parse_jbtp_external_data(notice)
        else:
            parsed_data = {}

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

    async def execute_jbtp_external(self, callback: Optional[Callable] = None):
        """
        JBTP 유관기관공고 크롤러를 실행합니다.

        Args:
            callback: 실시간 업데이트를 전송할 콜백 함수 (WebSocket send)
        """
        source_id = "jbtp_external"
        self._reset_status(source_id)

        try:
            await self._send_event(callback, "start", {
                "source_id": source_id,
                "message": "JBTP 유관기관공고 크롤링을 시작합니다..."
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
            board_configs = self._load_jbtp_external_configs()

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
                                            import re
                                            org_match = re.match(r'^\[([^\]]+)\]', title)
                                            organization = org_match.group(1) if org_match else 'JBTP'

                                            # 작성일 추출 (컬럼 4: 등록일)
                                            posted_date = cols[4].get_text(strip=True) if len(cols) > 4 else ''

                                            # 작성일 기준으로 날짜 체크 (유관기관공고는 마감일 없음)
                                            posted_datetime = self._parse_date(posted_date)
                                            if posted_datetime and posted_datetime < cutoff_date:
                                                found_old_notices = True
                                                await self._send_event(callback, "log", {
                                                    "source_id": source_id,
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
                    "message": "JBTP 유관기관공고 크롤링이 완료되었습니다.",
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
        올바른 API 엔드포인트: https://www.ntis.go.kr/rndopen/openApi/public_project

        API 신청: https://www.ntis.go.kr/rndopen/api/mng/apiMain.do
        """
        source_id = "ntis"
        self._reset_status(source_id)

        def get_xml_text(element, tag, default=''):
            """XML 요소에서 텍스트 추출"""
            child = element.find(tag)
            if child is None:
                return default
            # HTML 태그 제거 (예: <span class="search_word">)
            text = child.text if child.text else ''
            for subchild in child:
                if subchild.text:
                    text += subchild.text
                if subchild.tail:
                    text += subchild.tail
            return text.strip() if text else default

        def parse_project_hit(hit):
            """단일 과제 HIT 파싱"""
            try:
                # ProjectTitle에서 한글/영문 제목 추출
                title_elem = hit.find('ProjectTitle')
                title_korean = ''
                title_english = ''
                if title_elem is not None:
                    title_korean = get_xml_text(title_elem, 'Korean', '')
                    title_english = get_xml_text(title_elem, 'English', '')

                # Manager 정보
                manager_name = ''
                manager_elem = hit.find('Manager')
                if manager_elem is not None:
                    manager_name = get_xml_text(manager_elem, 'Name', '')

                # 키워드 추출
                keyword_korean = ''
                keyword_english = ''
                keyword_elem = hit.find('Keyword')
                if keyword_elem is not None:
                    keyword_korean = get_xml_text(keyword_elem, 'Korean', '')
                    keyword_english = get_xml_text(keyword_elem, 'English', '')

                # 연구기관
                research_agency = ''
                research_elem = hit.find('ResearchAgency')
                if research_elem is not None:
                    research_agency = get_xml_text(research_elem, 'Name', '')

                # 관리기관
                manage_agency = ''
                manage_elem = hit.find('ManageAgency')
                if manage_elem is not None:
                    manage_agency = get_xml_text(manage_elem, 'Name', '')

                # 부처
                ministry = ''
                ministry_elem = hit.find('Ministry')
                if ministry_elem is not None:
                    ministry = get_xml_text(ministry_elem, 'Name', '')

                # 기간 정보
                start_date = ''
                end_date = ''
                period_elem = hit.find('ProjectPeriod')
                if period_elem is not None:
                    start_date = get_xml_text(period_elem, 'Start', '')
                    end_date = get_xml_text(period_elem, 'End', '')

                # 지역
                region = get_xml_text(hit, 'Region', '')

                # 연구비
                gov_funds = get_xml_text(hit, 'GovernmentFunds', '')
                total_funds = get_xml_text(hit, 'TotalFunds', '')

                # Goal, Abstract, Effect
                goal_full = ''
                goal_elem = hit.find('Goal')
                if goal_elem is not None:
                    goal_full = get_xml_text(goal_elem, 'Full', '')

                abstract_full = ''
                abstract_elem = hit.find('Abstract')
                if abstract_elem is not None:
                    abstract_full = get_xml_text(abstract_elem, 'Full', '')

                effect_full = ''
                effect_elem = hit.find('Effect')
                if effect_elem is not None:
                    effect_full = get_xml_text(effect_elem, 'Full', '')

                project = {
                    'title': title_korean or title_english or 'N/A',
                    'title_korean': title_korean,
                    'title_english': title_english,
                    'project_number': get_xml_text(hit, 'ProjectNumber', ''),
                    'project_manager': manager_name,
                    'research_agency': research_agency,
                    'manage_agency': manage_agency,
                    'ministry': ministry,
                    'project_year': get_xml_text(hit, 'ProjectYear', ''),
                    'start_date': start_date,
                    'end_date': end_date,
                    'region': region,
                    'government_funds': gov_funds,
                    'total_funds': total_funds,
                    'keywords_korean': keyword_korean,
                    'keywords_english': keyword_english,
                    'goal': goal_full,
                    'abstract': abstract_full,
                    'effect': effect_full,
                    'six_technology': get_xml_text(hit, 'SixTechnology', ''),
                    'business_name': get_xml_text(hit, 'BusinessName', ''),
                }

                return project

            except Exception as e:
                print(f"✗ 과제 HIT 파싱 중 오류: {e}")
                return None

        def filter_bio_projects(projects):
            """바이오 관련 과제 필터링"""
            bio_keywords = [
                '바이오', '생명', '의료', '제약', '헬스케어', '유전', '건강', '보건',
                '임상', '진단', '치료', '병원', '질병', '의약', '신약', '백신',
                '항체', '세포', '줄기세포', '유전자', '게놈', 'DNA', 'RNA',
                '단백질', '효소', '미생물', '발효', '배양',
                '의료기기', '의료장비', '진단기기', '헬스',
                '식품', '건강기능식품', '뷰티', '화장품', '천연물',
                '농생명', '동물', '수의', '축산',
                'bio', 'Bio', 'BIO', 'biotech', 'Biotech',
                'health', 'Health', 'medical', 'Medical',
                'pharma', 'Pharma', 'drug', 'Drug',
                'clinical', 'Clinical', 'diagnosis', 'Diagnosis',
                'therapy', 'Therapy', 'vaccine', 'Vaccine',
                'antibody', 'cell', 'Cell', 'stem', 'Stem',
                'gene', 'Gene', 'genome', 'Genome',
                'protein', 'Protein', 'enzyme', 'Enzyme'
            ]

            filtered = []
            for project in projects:
                search_text = ' '.join([
                    project.get('title', ''),
                    project.get('title_korean', ''),
                    project.get('title_english', ''),
                    project.get('keywords_korean', ''),
                    project.get('keywords_english', ''),
                    project.get('goal', ''),
                    project.get('abstract', ''),
                    project.get('effect', '')
                ])

                matched_keywords = [kw for kw in bio_keywords if kw in search_text]

                if matched_keywords:
                    project['matched_keywords'] = matched_keywords
                    filtered.append(project)

            return filtered

        try:
            # DB에서 NTIS 설정 로드
            from src.models.crawler_config import NTISConfig
            db = SessionLocal()

            try:
                # API 키는 환경변수에서만 읽기
                api_key = os.getenv('NTIS_API_KEY', '').strip()

                if not api_key:
                    raise ValueError(
                        "NTIS API 키가 설정되지 않았습니다. "
                        ".env 파일에 NTIS_API_KEY를 입력해주세요. "
                        "API 키 신청: https://www.ntis.go.kr/rndopen/api/mng/apiMain.do"
                    )

                # 검색 키워드는 DB에서 읽기 (UI로 관리)
                ntis_config = db.query(NTISConfig).first()
                search_keywords = ntis_config.search_keywords if ntis_config else []

                if not search_keywords:
                    raise ValueError(
                        "검색 키워드가 설정되지 않았습니다. "
                        "관리자 페이지에서 NTIS 검색 키워드를 추가해주세요."
                    )

                await self._send_event(callback, "log", {
                    "source_id": source_id,
                    "message": f"NTIS 설정 로드 완료 (검색 키워드: {len(search_keywords)}개)"
                })
            finally:
                db.close()

            await self._send_event(callback, "start", {
                "source_id": source_id,
                "message": "NTIS API 데이터 수집을 시작합니다..."
            })

            rate_limiter = RateLimiter(0.5)
            all_projects = []

            # 키워드별로 API 호출
            self.crawlers_status[source_id]["total"] = len(search_keywords)

            for idx, keyword in enumerate(search_keywords):
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
                    "message": f"\n[키워드: {keyword}] API 호출 중..."
                })

                try:
                    # 올바른 NTIS OpenAPI 엔드포인트
                    response = requests.get(
                        "https://www.ntis.go.kr/rndopen/openApi/public_project",
                        params={
                            "apprvKey": api_key,
                            "collection": "project",
                            "SRWR": keyword,
                            "searchFd": "BI",  # 전체 검색
                            "searchRnkn": "DATE/DESC",  # 최신순
                            "startPosition": 1,
                            "displayCnt": 50  # 키워드당 최대 50개
                        },
                        timeout=30
                    )

                    if response.status_code == 200:
                        # XML 응답 파싱
                        try:
                            root = ET.fromstring(response.text)

                            # 에러 응답 체크
                            if root.tag == 'RESULT':
                                error = root.find('error')
                                if error is not None:
                                    self.crawlers_status[source_id]["failed"] += 1
                                    await self._send_event(callback, "log", {
                                        "source_id": source_id,
                                        "message": f"  ✗ API 오류: {error.text}"
                                    })
                                    continue

                                error = root.find('ERROR')
                                if error is not None:
                                    error_code = error.find('CODE')
                                    error_msg = error.find('MESSAGE')
                                    code_text = error_code.text if error_code is not None else 'Unknown'
                                    msg_text = error_msg.text if error_msg is not None else 'Unknown error'
                                    self.crawlers_status[source_id]["failed"] += 1
                                    await self._send_event(callback, "log", {
                                        "source_id": source_id,
                                        "message": f"  ✗ API 오류: [코드 {code_text}] {msg_text}"
                                    })
                                    continue

                            # 정상 응답 파싱
                            total_hits = root.find('TOTALHITS')
                            if total_hits is not None:
                                await self._send_event(callback, "log", {
                                    "source_id": source_id,
                                    "message": f"  총 {total_hits.text}건의 과제를 찾았습니다."
                                })

                            # RESULTSET에서 HIT 추출
                            resultset = root.find('RESULTSET')
                            if resultset is None:
                                await self._send_event(callback, "log", {
                                    "source_id": source_id,
                                    "message": f"  ⚠ 검색 결과 없음"
                                })
                                continue

                            projects = []
                            for hit in resultset.findall('HIT'):
                                project = parse_project_hit(hit)
                                if project:
                                    project['search_keyword'] = keyword
                                    projects.append(project)

                            if projects:
                                all_projects.extend(projects)
                                self.crawlers_status[source_id]["success"] += 1

                                await self._send_event(callback, "log", {
                                    "source_id": source_id,
                                    "message": f"  → {len(projects)}개 과제 수집 완료"
                                })
                            else:
                                await self._send_event(callback, "log", {
                                    "source_id": source_id,
                                    "message": f"  ⚠ 파싱된 과제 없음"
                                })

                        except ET.ParseError as e:
                            self.crawlers_status[source_id]["failed"] += 1
                            await self._send_event(callback, "log", {
                                "source_id": source_id,
                                "message": f"  ✗ XML 파싱 오류: {str(e)}"
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
                    "total": len(search_keywords),
                    "percentage": int((idx + 1) / len(search_keywords) * 100),
                    "success": self.crawlers_status[source_id]["success"],
                    "failed": self.crawlers_status[source_id]["failed"]
                })

            # 바이오 필터링 적용
            await self._send_event(callback, "log", {
                "source_id": source_id,
                "message": f"\n바이오 키워드 필터링 중... (총 {len(all_projects)}개 과제)"
            })

            filtered_projects = filter_bio_projects(all_projects)

            await self._send_event(callback, "log", {
                "source_id": source_id,
                "message": f"바이오 관련 과제: {len(filtered_projects)}개"
            })

            # Notice 형식으로 변환하여 DB 저장
            notices = []
            for project in filtered_projects:
                notice = {
                    'title': project['title'],
                    'link': f"https://www.ntis.go.kr/project/pjtInfo.do?pjtId={project.get('project_number', '')}",
                    'date': project.get('start_date', ''),
                    'board': f"R&D 과제 (키워드: {project.get('search_keyword', '')})",
                    'source': 'NTIS',
                    'extracted_at': datetime.now().isoformat(),
                    'raw_data': {
                        'detail': project
                    }
                }
                notices.append(notice)

            # DB에 저장
            self._save_results(source_id, notices, search_keywords)

            await self._send_event(callback, "log", {
                "source_id": source_id,
                "message": f"\n결과 저장 완료: {len(notices)}개 바이오 과제"
            })

            # 완료
            self.crawlers_status[source_id]["status"] = CrawlerStatus.COMPLETED
            await self._send_event(callback, "complete", {
                "source_id": source_id,
                "message": "NTIS API 데이터 수집이 완료되었습니다.",
                "total_collected": len(notices),
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
        return await self.crawlers["bizinfo"].run(callback)

    async def execute_bi_center(self, callback: Optional[Callable] = None):
        """
        전북 창업보육센터 크롤러를 실행합니다.

        1. https://www.smes.go.kr/binet/incu/center/list.do에서 전북 BI 센터 목록 수집
        2. 각 센터의 입주기업 정보 수집
        3. bi_centers, bi_companies 테이블에 저장
        """
        return await self.crawlers["bi_center"].run(callback)


# Singleton instance
crawler_manager = CrawlerManager()
