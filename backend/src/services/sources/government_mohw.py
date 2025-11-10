"""
MOHW News Crawler
보건복지부 RSS 뉴스 수집 크롤러
"""

import feedparser
import logging
import requests
import time
import re
from datetime import datetime, timedelta
from typing import Callable, Dict, List, Optional
from email.utils import parsedate_to_datetime
from bs4 import BeautifulSoup
from urllib.parse import urljoin

from ._base import BaseAdapter, CrawlerPhase, CrawlerStatus
from .services import KeywordService
from .repositories import CrawlQueueRepository, ConfigRepository


logger = logging.getLogger(__name__)


class GovernmentMOHWAdapter(BaseAdapter):
    """
    보건복지부 RSS 뉴스 크롤러

    보건복지부 RSS 피드를 수집하고 원본 페이지를 크롤링하여
    HTML 컨텐츠와 첨부파일을 추출합니다.
    """

    def __init__(self):
        """
        No-arg constructor - loads config from unified crawler_config table
        """
        source_id = 'source:news:mohw'
        super().__init__(source_id)

        # Load config from unified crawler_config table
        config = ConfigRepository.get_config_by_source_id(source_id)

        if not config:
            raise Exception(f"Config not found for {source_id}")

        self.feed_url = config.url
        self.config = config.to_dict()
        self.keywords = config.keywords or []
        self.date_range_days = config.date_range_days or 30

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
                "message": "보건복지부 RSS 피드 크롤링 시작"
            })

            # Phase 1: RSS 피드 가져오기
            self.status["phase"] = CrawlerPhase.LIST_COLLECTION
            self.status["phase_message"] = "RSS 피드 다운로드 중..."
            await self.send_event(callback, "phase_change", {
                "phase": self.status["phase"],
                "message": self.status["phase_message"]
            })

            feed = feedparser.parse(self.feed_url)

            if feed.bozo:
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

            from datetime import timezone
            cutoff_date = datetime.now(timezone.utc) - timedelta(days=self.date_range_days)
            filtered_items = []

            for entry in entries:
                if self.stop_flag:
                    break

                # 날짜 필터링
                pub_date = self._parse_date(entry)
                if pub_date:
                    if pub_date.tzinfo is None:
                        pub_date = pub_date.replace(tzinfo=timezone.utc)
                    if pub_date < cutoff_date:
                        continue

                # 키워드 필터링
                if self.keywords:
                    title = entry.get('title', '')
                    content = self._get_content(entry)
                    combined_text = f"{title} {content}"

                    if not KeywordService.has_any_keyword(combined_text, self.keywords):
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

            notices = []
            for idx, entry in enumerate(filtered_items, 1):
                if self.stop_flag:
                    break

                title = entry.get('title', '').strip()
                link = entry.get('link', '').strip()
                pub_date = self._parse_date(entry)
                organization = entry.get('author', '')

                if not link or not title:
                    continue

                await self.send_event(callback, "log", {
                    "message": f"[{idx}/{len(filtered_items)}] 원본 페이지 크롤링: {title[:50]}..."
                })

                # 원본 페이지 크롤링
                page_detail = self._fetch_detail_page(link)

                # RSS fallback
                rss_content = self._get_content(entry)
                rss_attachments = self._extract_attachments(entry)

                # 최종 데이터 결정
                content_html = page_detail.get('content_html') or rss_content
                attachments = page_detail.get('attachments') or rss_attachments
                images = page_detail.get('images', [])

                detail_data = {
                    'content_html': content_html,
                    'published_date': pub_date.isoformat() if pub_date else None,
                    'organization': organization,
                    'link': link
                }

                if attachments:
                    detail_data['attachments'] = attachments
                if images:
                    detail_data['images'] = images

                notice = {
                    'title': title,
                    'link': link,
                    'board': '보건복지부 보도자료',
                    'published_date': pub_date,
                    'organization': organization,
                    'raw_data': {
                        'detail': detail_data,
                        'rss_entry': dict(entry)
                    }
                }
                notices.append(notice)

                time.sleep(1)  # Rate limiting

            # 저장
            try:
                stats = CrawlQueueRepository.save_results(
                    notices=notices,
                    keywords=self.keywords,
                    source_id=self.source_id
                )

                self.status["success"] = stats['added'] + stats['updated']
                self.status["failed"] = stats['skipped_filtered'] + stats['skipped_rejected']
                self.status["progress"] = len(notices)

                await self.send_event(callback, "progress", {
                    "progress": self.status["progress"],
                    "total": self.status["total"],
                    "success": self.status["success"],
                    "failed": self.status["failed"]
                })

            except Exception as e:
                logger.error(f"항목 저장 실패: {e}")
                self.status["failed"] = len(notices)

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
                "message": f"보건복지부 RSS 크롤링 완료: {self.status['success']}개 저장, {self.status['failed']}개 실패"
            }

            await self.send_event(callback, "complete", result)
            return result

        except Exception as e:
            logger.exception(f"보건복지부 RSS 크롤링 중 오류: {e}")
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
        """RSS 항목의 날짜 파싱"""
        pub_date_str = entry.get('published', '') or entry.get('pubDate', '')

        if not pub_date_str:
            return None

        try:
            return parsedate_to_datetime(pub_date_str)
        except Exception:
            pass

        try:
            return datetime.strptime(pub_date_str, "%Y-%m-%d %H:%M")
        except Exception:
            pass

        logger.warning(f"날짜 파싱 실패: {pub_date_str}")
        return None

    def _get_content(self, entry: Dict) -> str:
        """RSS 항목에서 컨텐츠 추출"""
        if 'content' in entry and len(entry.content) > 0:
            content = entry.content[0].get('value', '')
            if content:
                return content

        if hasattr(entry, 'summary_detail'):
            content_type = entry.summary_detail.get('type', '')
            if content_type == 'text/html' and entry.get('summary'):
                return entry.summary

        if 'summary' in entry and entry.summary:
            return entry.summary

        if 'description' in entry and entry.description:
            return entry.description

        return ''

    def _extract_attachments(self, entry: Dict) -> List[Dict[str, str]]:
        """RSS 항목에서 첨부파일 추출"""
        attachments = []

        if hasattr(entry, 'enclosures') and entry.enclosures:
            for enclosure in entry.enclosures:
                url = enclosure.get('href') or enclosure.get('url', '')
                if url:
                    filename = url.split('/')[-1].split('?')[0] or 'attachment'
                    mime_type = enclosure.get('type', '')

                    if mime_type and '.' not in filename:
                        ext_map = {
                            'application/pdf': '.pdf',
                            'application/msword': '.doc',
                            'application/vnd.openxmlformats-officedocument.wordprocessingml.document': '.docx',
                            'application/vnd.ms-excel': '.xls',
                            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': '.xlsx',
                            'image/jpeg': '.jpg',
                            'image/png': '.png',
                            'application/zip': '.zip'
                        }
                        if mime_type in ext_map:
                            filename += ext_map[mime_type]

                    attachments.append({
                        'filename': filename,
                        'url': url
                    })

        return attachments

    def _fetch_detail_page(self, url: str) -> Dict:
        """원본 페이지를 크롤링하여 상세 정보 추출"""
        try:
            headers = {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            }

            response = requests.get(url, headers=headers, timeout=30)
            response.raise_for_status()
            response.encoding = response.apparent_encoding

            soup = BeautifulSoup(response.text, 'lxml')

            content_html = ''
            attachments = []
            images = []

            # 본문 추출 (보건복지부 게시판 구조)
            # 보건복지부는 class="viewArea" 또는 class="contents" 사용 (게시판 유형에 따라 다름)
            content_area = soup.find('div', class_='viewArea') or \
                          soup.find('div', class_='contents') or \
                          soup.find('div', class_='view_con') or \
                          soup.find('div', id='viewCon') or \
                          soup.find('div', class_='view-content') or \
                          soup.find('div', class_='board_view')

            if content_area:
                content_html = str(content_area)

                # 이미지 URL 추출
                for img in content_area.find_all('img'):
                    img_url = img.get('src', '')
                    if img_url:
                        img_url = urljoin(url, img_url)
                        images.append({
                            'url': img_url,
                            'alt': img.get('alt', '')
                        })

            # 첨부파일 추출
            # 보건복지부는 class="file" 사용 (2025년 구조)
            attach_area = soup.find('div', class_='file') or \
                         soup.find('div', class_='attach') or \
                         soup.find('div', class_='file_list') or \
                         soup.find('ul', class_='attach_list')

            if attach_area:
                for link in attach_area.find_all('a'):
                    href = link.get('href', '')
                    # "다운로드" 링크만 추출 (미리보기 제외)
                    if href and 'download' in href.lower():
                        file_url = urljoin(url, href)

                        # 파일명 추출: 링크 텍스트가 아닌 li 텍스트에서 추출
                        li_parent = link.find_parent('li')
                        if li_parent:
                            # li 전체 텍스트에서 파일명 찾기
                            full_text = li_parent.get_text()
                            # hwpx, pdf 등 확장자 앞까지를 파일명으로
                            filename_match = re.search(r'([^\n]+\.(?:hwpx?|pdf|docx?|xlsx?))', full_text)
                            filename = filename_match.group(1).strip() if filename_match else href.split('/')[-1]
                        else:
                            filename = href.split('/')[-1]

                        attachments.append({
                            'filename': filename,
                            'url': file_url
                        })

            return {
                'content_html': content_html,
                'attachments': attachments,
                'images': images
            }

        except Exception as e:
            logger.warning(f"보건복지부 페이지 크롤링 실패 ({url}): {e}")
            return {
                'content_html': '',
                'attachments': [],
                'images': []
            }
