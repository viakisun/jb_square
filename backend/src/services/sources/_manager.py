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
from src.core.database import SessionLocal, CrawlResult
from src.models.notice import CrawlQueue
from src.models.crawler_config import CrawlerConfig
from src.services.sources.repositories.config_repository import ConfigRepository
from src.services.sources import (
    GovernmentBiCenterAdapter,
    GovernmentBizinfoAdapter,
    JBTPLocalAdapter,
    JBTPExternalAdapter,
    JBTPEventsAdapter,
    GovernmentNTISAdapter,
    GovernmentMFDSAdapter,
    GovernmentMOHWAdapter,
    JBTPBaseAdapter
)
from src.constants.sources import NoticeSource


class CrawlerStatus(str, Enum):
    """크롤러 상태"""
    IDLE = "idle"
    RUNNING = "running"
    COMPLETED = "completed"
    ERROR = "error"
    STOPPED = "stopped"


class SourceManager:
    """
    크롤러 실행 및 상태 관리를 담당하는 매니저 클래스
    """

    def __init__(self):
        self.crawlers_status: Dict[str, dict] = {}
        self.stop_flags: Dict[str, bool] = {}

        # Static adapter instances (for non-JBTP adapters)
        self.crawlers = {
            "bi_center": GovernmentBiCenterAdapter(),
            NoticeSource.BIZINFO_API: GovernmentBizinfoAdapter(),
            NoticeSource.JBTP_LOCAL: JBTPLocalAdapter(),
            NoticeSource.JBTP_EXTERNAL: JBTPExternalAdapter(),
            NoticeSource.JBTP_EVENTS: JBTPEventsAdapter(),
            NoticeSource.NTIS_RSS: GovernmentNTISAdapter(),
            NoticeSource.NEWS_MFDS: GovernmentMFDSAdapter(),
            NoticeSource.NEWS_MOHW: GovernmentMOHWAdapter(),
        }

        # Initialize status for all known adapters
        self._initialize_statuses()

    def _initialize_statuses(self):
        """Initialize status dicts for all adapters"""
        for source_id in self.crawlers.keys():
            self.crawlers_status[source_id] = {
                "status": CrawlerStatus.IDLE,
                "progress": 0,
                "total": 0,
                "success": 0,
                "failed": 0,
                "last_run": None,
                "error_message": None
            }
            self.stop_flags[source_id] = False

    def _create_adapter(self, source_id: str):
        """
        동적으로 Adapter 인스턴스를 생성합니다.

        source_id 패턴:
        - source:jbtp:* → JBTPBaseAdapter(source_id)
        - 기타 → 정적 매핑에서 조회
        """
        # 이미 생성된 adapter가 있으면 재사용
        if source_id in self.crawlers:
            return self.crawlers[source_id]

        # JBTP 패턴 감지: source:jbtp:*
        if source_id.startswith("source:jbtp:"):
            adapter = JBTPBaseAdapter(source_id)
            self.crawlers[source_id] = adapter

            # 상태 초기화
            if source_id not in self.crawlers_status:
                self.crawlers_status[source_id] = {
                    "status": CrawlerStatus.IDLE,
                    "progress": 0,
                    "total": 0,
                    "success": 0,
                    "failed": 0,
                    "last_run": None,
                    "error_message": None
                }
                self.stop_flags[source_id] = False

            return adapter

        # 알 수 없는 source_id
        raise ValueError(f"Unknown source_id: {source_id}")

    def get_status(self, source_id: str) -> dict:
        """특정 크롤러의 현재 상태를 반환합니다."""
        # Try to get or create adapter
        try:
            adapter = self._create_adapter(source_id)
            return adapter.get_status()
        except ValueError:
            # Fallback to static status
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
        # Try to get or create adapter
        try:
            adapter = self._create_adapter(source_id)
            adapter.stop()
        except ValueError:
            # Fallback to static stop flag
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
        if source_id == NoticeSource.JBTP_LOCAL:
            parsed_data = self._parse_jbtp_data(notice)
        elif source_id == NoticeSource.JBTP_EXTERNAL:
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
        return await self.crawlers[NoticeSource.JBTP_LOCAL].run(callback)

    async def execute_jbtp_external(self, callback: Optional[Callable] = None):
        """
        JBTP 유관기관공고 크롤러를 실행합니다.

        Args:
            callback: 실시간 업데이트를 전송할 콜백 함수 (WebSocket send)
        """
        return await self.crawlers[NoticeSource.JBTP_EXTERNAL].run(callback)

    async def execute_jbtp_events(self, callback: Optional[Callable] = None):
        """
        JBTP 바이오행사 크롤러를 실행합니다.

        Args:
            callback: 실시간 업데이트를 전송할 콜백 함수 (WebSocket send)
        """
        return await self.crawlers[NoticeSource.JBTP_EVENTS].run(callback)

    async def execute_ntis_rss(self, callback: Optional[Callable] = None):
        """
        NTIS RSS 피드를 통해 R&D 공고를 수집합니다.

        RSS URL: http://www.ntis.go.kr/rndgate/unRndRss.xml?prt=100&bbs=true
        최근 7일 이내 데이터를 키워드 필터링하여 수집합니다.
        """
        return await self.crawlers[NoticeSource.NTIS_RSS].run(callback)

    async def execute_bizinfo(self, callback: Optional[Callable] = None):
        """
        기업마당 API를 통해 지원사업 공고를 수집합니다.

        API: https://www.bizinfo.go.kr/web/lay1/program/S1T175C174/apiDetail.do
        """
        return await self.crawlers[NoticeSource.BIZINFO_API].run(callback)

    async def execute_bi_center(self, callback: Optional[Callable] = None):
        """
        전북 창업보육센터 크롤러를 실행합니다.

        1. https://www.smes.go.kr/binet/incu/center/list.do에서 전북 BI 센터 목록 수집
        2. 각 센터의 입주기업 정보 수집
        3. bi_centers, bi_companies 테이블에 저장
        """
        return await self.crawlers["bi_center"].run(callback)

    async def execute_mfds_news(self, callback: Optional[Callable] = None):
        """
        식약처 RSS 뉴스를 수집합니다.
        """
        db = SessionLocal()
        try:
            source_id = NoticeSource.NEWS_MFDS

            # DB에서 통합 크롤러 설정 로드
            config = ConfigRepository.get_config_by_source_id(source_id)

            if not config:
                error_msg = f"크롤러 설정을 찾을 수 없습니다: {source_id}"
                if callback:
                    await self._send_event(callback, "error", {
                        "source_id": source_id,
                        "error": error_msg
                    })
                return {
                    "source_id": source_id,
                    "status": "error",
                    "error": error_msg
                }

            if not config.enabled:
                error_msg = f"크롤러가 비활성화되어 있습니다: {source_id}"
                if callback:
                    await self._send_event(callback, "error", {
                        "source_id": source_id,
                        "error": error_msg
                    })
                return {
                    "source_id": source_id,
                    "status": "error",
                    "error": error_msg
                }

            # GovernmentMFDSAdapter 인스턴스 생성 (no-arg constructor)
            # Config is loaded from unified crawler_config table
            crawler = GovernmentMFDSAdapter()

            # 크롤링 실행
            result = await crawler.execute(callback=callback, db_session=db)

            return result

        except Exception as e:
            error_msg = f"식약처 RSS 크롤링 중 오류 발생: {str(e)}"
            if callback:
                await self._send_event(callback, "error", {
                    "source_id": NoticeSource.NEWS_MFDS,
                    "error": error_msg
                })
            return {
                "source_id": NoticeSource.NEWS_MFDS,
                "status": "error",
                "error": error_msg
            }
        finally:
            db.close()

    async def execute_mohw_news(self, callback: Optional[Callable] = None):
        """
        보건복지부 RSS 뉴스를 수집합니다.
        """
        db = SessionLocal()
        try:
            source_id = NoticeSource.NEWS_MOHW

            # DB에서 통합 크롤러 설정 로드
            config = ConfigRepository.get_config_by_source_id(source_id)

            if not config:
                error_msg = f"크롤러 설정을 찾을 수 없습니다: {source_id}"
                if callback:
                    await self._send_event(callback, "error", {
                        "source_id": source_id,
                        "error": error_msg
                    })
                return {
                    "source_id": source_id,
                    "status": "error",
                    "error": error_msg
                }

            if not config.enabled:
                error_msg = f"크롤러가 비활성화되어 있습니다: {source_id}"
                if callback:
                    await self._send_event(callback, "error", {
                        "source_id": source_id,
                        "error": error_msg
                    })
                return {
                    "source_id": source_id,
                    "status": "error",
                    "error": error_msg
                }

            # GovernmentMOHWAdapter 인스턴스 생성 (no-arg constructor)
            # Config is loaded from unified crawler_config table
            crawler = GovernmentMOHWAdapter()

            # 크롤링 실행
            result = await crawler.execute(callback=callback, db_session=db)

            return result

        except Exception as e:
            error_msg = f"보건복지부 RSS 크롤링 중 오류 발생: {str(e)}"
            if callback:
                await self._send_event(callback, "error", {
                    "source_id": NoticeSource.NEWS_MOHW,
                    "error": error_msg
                })
            return {
                "source_id": NoticeSource.NEWS_MOHW,
                "status": "error",
                "error": error_msg
            }
        finally:
            db.close()

    async def execute(self, source_id: str, callback: Optional[Callable] = None):
        """
        통합 실행 메서드 - 동적 Adapter 생성을 지원합니다.

        Args:
            source_id: 실행할 소스 ID (예: "source:jbtp:local", "source:jbtp:business", etc.)
            callback: 실시간 업데이트를 전송할 콜백 함수 (WebSocket send)
        """
        try:
            # 동적으로 Adapter 생성 또는 조회
            adapter = self._create_adapter(source_id)

            # Adapter 실행 (.execute() 메서드 호출)
            await adapter.execute(callback)

        except ValueError as e:
            # 알 수 없는 source_id
            if callback:
                await self._send_event(callback, "error", {
                    "source_id": source_id,
                    "message": f"Unknown source: {str(e)}"
                })
            raise


# Singleton instance
source_manager = SourceManager()
