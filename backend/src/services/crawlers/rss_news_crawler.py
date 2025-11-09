"""
RSS News Crawler
RSS 피드를 통한 뉴스 수집 크롤러
"""

import feedparser
import logging
from datetime import datetime, timedelta
from typing import Callable, Dict, List, Optional
from email.utils import parsedate_to_datetime

from .base_crawler import BaseCrawler, CrawlerPhase, CrawlerStatus
from .services import KeywordService
from .repositories import CrawlQueueRepository


logger = logging.getLogger(__name__)


class RSSNewsCrawler(BaseCrawler):
    """
    RSS 뉴스 크롤러

    MFDS (식약처), MOHW (보건복지부) 등의 RSS 피드를 수집합니다.
    """

    def __init__(self, source_id: str, feed_url: str, config: Dict):
        """
        Args:
            source_id: 'source:news:mfds' 또는 'source:news:mohw'
            feed_url: RSS 피드 URL
            config: 크롤링 설정 (keywords, date_range_days 등)
        """
        super().__init__(source_id)
        self.feed_url = feed_url
        self.config = config
        self.keywords = config.get('keywords', [])
        self.date_range_days = config.get('date_range_days', 30)

    async def execute(
        self,
        callback: Optional[Callable] = None,
        db_session = None
    ) -> Dict:
        """
        RSS 크롤링 실행

        Args:
            callback: WebSocket 이벤트 콜백
            db_session: 데이터베이스 세션

        Returns:
            Dict: 크롤링 결과 통계
        """
        self.reset_status()

        try:
            await self.send_event(callback, "start", {
                "source_id": self.source_id,
                "feed_url": self.feed_url,
                "message": f"RSS 피드 크롤링 시작"
            })

            # Phase 1: RSS 피드 가져오기
            self.status["phase"] = CrawlerPhase.LIST_COLLECTION
            self.status["phase_message"] = "RSS 피드 다운로드 중..."
            await self.send_event(callback, "phase_change", {
                "phase": self.status["phase"],
                "message": self.status["phase_message"]
            })

            feed = feedparser.parse(self.feed_url)

            if feed.bozo:  # RSS 파싱 오류
                error_msg = f"RSS 피드 파싱 오류: {feed.bozo_exception}"
                logger.error(error_msg)
                raise Exception(error_msg)

            entries = feed.entries
            self.status["total"] = len(entries)

            await self.send_event(callback, "log", {
                "message": f"RSS 피드에서 {len(entries)}개 항목 발견"
            })

            # Phase 2: 필터링 (날짜, 키워드)
            self.status["phase"] = CrawlerPhase.FILTERING
            self.status["phase_message"] = "항목 필터링 중..."
            await self.send_event(callback, "phase_change", {
                "phase": self.status["phase"],
                "message": self.status["phase_message"]
            })

            cutoff_date = datetime.now() - timedelta(days=self.date_range_days)
            filtered_items = []

            for entry in entries:
                if self.stop_flag:
                    break

                # 날짜 필터링
                pub_date = self._parse_date(entry)
                if pub_date and pub_date < cutoff_date:
                    continue

                # 키워드 필터링 (키워드가 있는 경우에만)
                if self.keywords:
                    title = entry.get('title', '')
                    content = self._get_content(entry)
                    combined_text = f"{title} {content}"

                    if not KeywordService.matches_keywords(combined_text, self.keywords):
                        continue

                filtered_items.append(entry)

            await self.send_event(callback, "log", {
                "message": f"필터링 완료: {len(filtered_items)}개 항목 선택됨"
            })

            # Phase 3: 크롤 큐에 저장
            self.status["phase"] = CrawlerPhase.SAVING
            self.status["phase_message"] = "항목 저장 중..."
            self.status["total"] = len(filtered_items)
            await self.send_event(callback, "phase_change", {
                "phase": self.status["phase"],
                "message": self.status["phase_message"]
            })

            for idx, entry in enumerate(filtered_items):
                if self.stop_flag:
                    break

                try:
                    await self._save_to_queue(entry, db_session)
                    self.status["success"] += 1
                except Exception as e:
                    logger.error(f"항목 저장 실패: {e}")
                    self.status["failed"] += 1

                self.status["progress"] = idx + 1

                # 진행률 업데이트 (10개마다)
                if (idx + 1) % 10 == 0:
                    await self.send_event(callback, "progress", {
                        "progress": self.status["progress"],
                        "total": self.status["total"],
                        "success": self.status["success"],
                        "failed": self.status["failed"]
                    })

            # Phase 4: 완료
            self.status["status"] = CrawlerStatus.COMPLETED
            self.status["phase"] = CrawlerPhase.COMPLETED
            self.status["phase_message"] = "크롤링 완료"

            result = {
                "source_id": self.source_id,
                "status": "success" if not self.stop_flag else "stopped",
                "total": self.status["total"],
                "success": self.status["success"],
                "failed": self.status["failed"],
                "message": f"RSS 크롤링 완료: {self.status['success']}개 저장, {self.status['failed']}개 실패"
            }

            await self.send_event(callback, "complete", result)

            return result

        except Exception as e:
            logger.exception(f"RSS 크롤링 중 오류: {e}")
            self.status["status"] = CrawlerStatus.ERROR
            self.status["error_message"] = str(e)

            await self.send_event(callback, "error", {
                "source_id": self.source_id,
                "error": str(e)
            })

            return {
                "source_id": self.source_id,
                "status": "error",
                "error": str(e)
            }

    def _parse_date(self, entry: Dict) -> Optional[datetime]:
        """
        RSS 항목의 날짜 파싱

        RFC 822 형식과 커스텀 형식 (YYYY-MM-DD HH:MM) 모두 지원
        """
        pub_date_str = entry.get('published', '') or entry.get('pubDate', '')

        if not pub_date_str:
            return None

        try:
            # RFC 822 형식 시도 (예: "Fri, 07 Nov 2025 05:19:16 GMT")
            return parsedate_to_datetime(pub_date_str)
        except Exception:
            pass

        try:
            # 커스텀 형식 시도 (예: "2025-11-07 16:04")
            return datetime.strptime(pub_date_str, "%Y-%m-%d %H:%M")
        except Exception:
            pass

        logger.warning(f"날짜 파싱 실패: {pub_date_str}")
        return None

    def _get_content(self, entry: Dict) -> str:
        """RSS 항목에서 컨텐츠 추출"""
        # content:encoded 또는 description 사용
        if 'content' in entry and len(entry.content) > 0:
            return entry.content[0].get('value', '')

        if 'summary' in entry:
            return entry.summary

        if 'description' in entry:
            return entry.description

        return ''

    async def _save_to_queue(self, entry: Dict, db_session):
        """
        RSS 항목을 크롤 큐에 저장

        중복 검사: link URL 기준
        """
        title = entry.get('title', '').strip()
        link = entry.get('link', '').strip()
        content = self._get_content(entry)
        pub_date = self._parse_date(entry)

        # 링크가 없으면 저장하지 않음
        if not link:
            logger.warning(f"링크 없는 항목 건너뜀: {title}")
            return

        # 중복 검사
        existing = CrawlQueueRepository.find_by_link(db_session, link)
        if existing:
            logger.debug(f"이미 존재하는 항목: {link}")
            return

        # 키워드 매칭 (키워드가 있는 경우)
        matched_keywords = []
        if self.keywords:
            combined_text = f"{title} {content}"
            matched_keywords = KeywordService.find_matching_keywords(combined_text, self.keywords)

        # 크롤 큐 데이터
        queue_data = {
            "crawler_source_id": self.source_id,
            "source_board_name": self._get_feed_name(),
            "title": title,
            "link": link,
            "crawler_extracted_at": datetime.now(),
            "published_date": pub_date.date() if pub_date else None,
            "organization": entry.get('author', ''),
            "matched_keywords": matched_keywords,
            "raw_data": {
                "title": title,
                "link": link,
                "content": content,
                "published": pub_date.isoformat() if pub_date else None,
                "author": entry.get('author', '')
            }
        }

        CrawlQueueRepository.create(db_session, queue_data)
        logger.info(f"크롤 큐에 저장: {title}")

    def _get_feed_name(self) -> str:
        """소스 ID로부터 피드 이름 가져오기"""
        if 'mfds' in self.source_id:
            return '식약처 공지사항'
        elif 'mohw' in self.source_id:
            return '보건복지부 보도자료'
        else:
            return 'RSS 뉴스'
