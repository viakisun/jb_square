"""
NTIS Crawler
국가과학기술정보서비스(NTIS) RSS 크롤러
"""

import requests
import xml.etree.ElementTree as ET
from datetime import datetime, timedelta
from typing import Callable, Optional
import re
from html import unescape
from bs4 import BeautifulSoup

from src.services.rate_limiter import RateLimiter
from src.constants.sources import NoticeSource
from .base_crawler import BaseCrawler, CrawlerStatus, CrawlerPhase
from .repositories import ConfigRepository


class NTISCrawler(BaseCrawler):
    """
    NTIS RSS 피드 크롤러

    NTIS 국가R&D통합공고 RSS 피드에서 최근 공고를 수집합니다.
    RSS URL: http://www.ntis.go.kr/rndgate/unRndRss.xml?prt=500&bbs=true
    """

    def __init__(self):
        super().__init__(NoticeSource.NTIS_RSS)
        # RSS 피드에서 최대한 많은 항목 가져오기 (기본 100 → 500)
        # prt 파라미터: 한 번에 가져올 항목 수
        self.rss_url = "http://www.ntis.go.kr/rndgate/unRndRss.xml?prt=500&bbs=true"
        self.days_filter = ConfigRepository.get_date_range_days(self.source_id)  # DB 설정에서 기간 가져오기

    def _clean_description(self, html_text: str) -> str:
        """HTML 태그 제거 및 텍스트 정리"""
        if not html_text:
            return ""

        # HTML 태그 제거
        text = re.sub('<[^<]+?>', '', html_text)
        # HTML 엔티티 디코딩
        text = unescape(text)
        # 연속 공백 제거
        text = ' '.join(text.split())

        return text.strip()

    def _parse_ntis_date(self, date_str: str, fmt: str) -> Optional[datetime]:
        """NTIS 날짜 파싱 (에러 핸들링 포함)"""
        if not date_str:
            return None

        try:
            return datetime.strptime(date_str.strip(), fmt)
        except ValueError:
            return None

    def _extract_unique_id(self, link: str) -> Optional[str]:
        """URL에서 고유 ID 추출"""
        if not link:
            return None

        # roRndUid 파라미터 추출
        match = re.search(r'roRndUid=(\d+)', link)
        if match:
            return match.group(1)

        return None

    def _parse_rss_item(self, item) -> Optional[dict]:
        """RSS <item> 요소를 dict로 변환"""
        try:
            data = {}

            # 모든 필드 추출
            for child in item:
                tag = child.tag.split('}')[-1] if '}' in child.tag else child.tag
                data[tag] = child.text if child.text else ""

            # 날짜 파싱
            pub_date = self._parse_ntis_date(data.get('pubDate', ''), "%Y.%m.%d")
            appbegin = self._parse_ntis_date(data.get('appbegin', ''), "%Y-%m-%d")
            appdue = self._parse_ntis_date(data.get('appdue', ''), "%Y-%m-%d")

            # 예산 파싱
            try:
                budget = int(data.get('budget', '0') or '0')
            except ValueError:
                budget = 0

            # 고유 ID 추출
            link = data.get('link', '')
            unique_id = self._extract_unique_id(link)

            # 설명 정리
            description_html = data.get('description', '')
            description_clean = self._clean_description(description_html)

            # CrawlQueue 형식으로 변환
            return {
                'title': data.get('title', ''),
                'link': link,
                'date': pub_date.strftime("%Y-%m-%d") if pub_date else '',
                'board': data.get('category', 'NTIS RSS'),
                'source': 'NTIS',
                'extracted_at': datetime.now().isoformat(),
                'published_date': pub_date,
                'deadline': appdue,
                'organization': data.get('author', ''),
                'raw_data': {
                    'detail': {
                        **data,
                        'unique_id': unique_id,
                        'budget': budget,
                        'appbegin': appbegin.isoformat() if appbegin else None,
                        'description_clean': description_clean[:500],  # 미리보기용
                        'content': description_clean,  # RSS description을 본문으로 사용
                        'content_html': description_html,  # 원본 HTML도 보존
                    }
                }
            }

        except Exception as e:
            print(f"✗ RSS 아이템 파싱 중 오류: {e}")
            return None

    def _filter_by_date(self, notices: list) -> list:
        """최근 N일 이내 데이터만 필터링"""
        if not notices:
            return []

        cutoff_date = datetime.now() - timedelta(days=self.days_filter)
        filtered = []

        for notice in notices:
            pub_date = notice.get('published_date')
            if pub_date and pub_date >= cutoff_date:
                filtered.append(notice)

        return filtered

    def _extract_ntis_content(self, soup, detail: dict) -> None:
        """
        NTIS 상세 페이지에서 본문 내용을 추출합니다.

        Args:
            soup: BeautifulSoup 객체
            detail: 추출된 정보를 저장할 딕셔너리
        """
        try:
            # 공고 내용이 있는 영역 찾기
            # NTIS는 table 구조로 되어 있음
            content_table = soup.find('table', class_='announcement_table1')
            if not content_table:
                content_table = soup.find('table', class_='table')

            if content_table:
                # 모든 행에서 텍스트 추출
                content_parts = []
                for row in content_table.find_all('tr'):
                    cells = row.find_all(['th', 'td'])
                    for cell in cells:
                        text = cell.get_text(strip=True)
                        if text and len(text) > 10:  # 의미있는 텍스트만
                            content_parts.append(text)

                if content_parts:
                    detail['content'] = '\n\n'.join(content_parts)

            # 공고 요약 정보 추출
            view_con = soup.find('div', class_='view_con')
            if view_con:
                detail['summary'] = view_con.get_text(strip=True)

        except Exception as e:
            print(f"Error extracting content: {str(e)}")

    def _extract_ntis_attachments(self, soup, detail: dict) -> None:
        """
        NTIS 상세 페이지에서 첨부파일 정보를 추출합니다.

        Args:
            soup: BeautifulSoup 객체
            detail: 추출된 정보를 저장할 딕셔너리
        """
        try:
            detail['attachments'] = []

            # 첨부파일 링크 찾기 (여러 패턴 시도)
            file_links = soup.find_all('a', href=re.compile(r'download|file|attach', re.I))

            for link in file_links:
                href = link.get('href', '')
                filename = link.get_text(strip=True)

                if not filename or not href:
                    continue

                # 상대 URL을 절대 URL로 변환
                if href and not href.startswith('http'):
                    if href.startswith('/'):
                        file_url = 'https://www.ntis.go.kr' + href
                    else:
                        file_url = 'https://www.ntis.go.kr/' + href
                else:
                    file_url = href

                if file_url and filename:
                    detail['attachments'].append({
                        'filename': filename,
                        'url': file_url
                    })

            # 첨부파일 테이블에서 추출
            file_table = soup.find('table', class_='file')
            if file_table:
                for row in file_table.find_all('tr'):
                    link = row.find('a')
                    if link:
                        href = link.get('href', '')
                        filename = link.get_text(strip=True)

                        if href and filename:
                            if not href.startswith('http'):
                                file_url = 'https://www.ntis.go.kr' + href if href.startswith('/') else 'https://www.ntis.go.kr/' + href
                            else:
                                file_url = href

                            detail['attachments'].append({
                                'filename': filename,
                                'url': file_url
                            })

        except Exception as e:
            print(f"Error extracting attachments: {str(e)}")

    async def _fetch_ntis_detail(self, session, url: str, rate_limiter) -> dict:
        """
        NTIS 상세 페이지에서 정보를 추출합니다.

        Args:
            session: requests.Session
            url: 상세 페이지 URL
            rate_limiter: RateLimiter 인스턴스

        Returns:
            dict: 상세 정보 (오류 발생 시 'error' 키 포함)
        """
        detail = {}

        try:
            # Rate limiting 적용 (0.5초 간격)
            rate_limiter.wait()

            # HTTP 요청
            response = session.get(url, timeout=10)

            # 응답 상태 확인
            if response.status_code != 200:
                detail['error'] = f"HTTP {response.status_code}"
                return detail

            # HTML 파싱
            soup = BeautifulSoup(response.text, 'html.parser')

            # 본문 내용 추출
            self._extract_ntis_content(soup, detail)

            # 첨부파일 추출
            self._extract_ntis_attachments(soup, detail)

        except requests.exceptions.Timeout:
            detail['error'] = "요청 시간 초과"
        except requests.exceptions.RequestException as e:
            detail['error'] = f"네트워크 오류: {str(e)}"
        except Exception as e:
            detail['error'] = f"예상치 못한 오류: {str(e)}"
            print(f"Error fetching NTIS detail from {url}: {str(e)}")

        return detail

    async def execute(self, callback: Optional[Callable] = None):
        """RSS 크롤링 실행"""
        try:
            await self.send_event(callback, "start", {
                "source_id": self.source_id,
                "message": "NTIS RSS 피드 수집을 시작합니다..."
            })

            # Phase 1: RSS 피드 다운로드 및 파싱
            await self.set_phase(callback, CrawlerPhase.LIST_COLLECTION, "RSS 피드 수집 중...")

            await self.send_event(callback, "log", {
                "source_id": self.source_id,
                "message": f"RSS 피드 다운로드 중... ({self.rss_url})"
            })

            response = requests.get(self.rss_url, timeout=30)
            response.raise_for_status()

            await self.send_event(callback, "log", {
                "source_id": self.source_id,
                "message": f"RSS 피드 다운로드 완료 ({len(response.content) / 1024:.1f} KB)"
            })

            # XML 파싱
            await self.send_event(callback, "log", {
                "source_id": self.source_id,
                "message": "RSS XML 파싱 중..."
            })

            root = ET.fromstring(response.content)
            items = root.findall('.//item')

            await self.send_event(callback, "log", {
                "source_id": self.source_id,
                "message": f"RSS 아이템 파싱 완료: {len(items)}개 항목 발견"
            })

            # 아이템 변환
            notices = []
            self.status["total"] = len(items)

            for idx, item in enumerate(items):
                # 중단 체크
                if self.stop_flag:
                    await self.send_event(callback, "stopped", {
                        "source_id": self.source_id,
                        "message": "데이터 수집이 사용자에 의해 중단되었습니다."
                    })
                    self.status["status"] = CrawlerStatus.STOPPED
                    return

                notice = self._parse_rss_item(item)
                if notice:
                    notices.append(notice)
                    self.status["success"] += 1
                else:
                    self.status["failed"] += 1

                # 진행상황 업데이트 (3개마다 - 더 자주 업데이트)
                if (idx + 1) % 3 == 0 or idx + 1 == len(items):
                    self.status["progress"] = idx + 1
                    await self.send_event(callback, "progress", {
                        "source_id": self.source_id,
                        "progress": idx + 1,
                        "total": len(items),
                        "percentage": int((idx + 1) / len(items) * 100),
                        "success": self.status["success"],
                        "failed": self.status["failed"],
                        "message": f"RSS 아이템 파싱 중... ({idx + 1}/{len(items)})"
                    })

            await self.send_event(callback, "log", {
                "source_id": self.source_id,
                "message": f"\n아이템 변환 완료: {len(notices)}개 (성공: {self.status['success']}, 실패: {self.status['failed']})"
            })

            # Phase 2: 날짜 필터링
            await self.set_phase(callback, CrawlerPhase.FILTERING, "날짜 및 키워드 필터링 중...")

            await self.send_event(callback, "log", {
                "source_id": self.source_id,
                "message": f"최근 {self.days_filter}일 이내 데이터 필터링 중..."
            })

            filtered_notices = self._filter_by_date(notices)

            await self.send_event(callback, "log", {
                "source_id": self.source_id,
                "message": f"날짜 필터링 완료: {len(filtered_notices)}개 항목 (총 {len(notices)}개 중)"
            })

            # Phase 3: 상세 페이지 크롤링
            await self.set_phase(callback, CrawlerPhase.DETAIL_CRAWLING, f"상세 정보 수집 중... (0/{len(filtered_notices)})")

            await self.send_event(callback, "log", {
                "source_id": self.source_id,
                "message": f"\n=== 상세 페이지 크롤링 시작 ({len(filtered_notices)}개) ==="
            })

            # HTTP session 생성
            session = requests.Session()
            session.headers.update({
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9',
                'Accept-Language': 'ko-KR,ko;q=0.9,en-US;q=0.8,en;q=0.7',
            })

            # Rate limiter 생성 (0.5초 간격)
            detail_rate_limiter = RateLimiter(0.5)

            # 진행 상황 초기화
            self.status["total"] = len(filtered_notices)
            self.status["progress"] = 0
            detail_success = 0
            detail_failed = 0

            # 각 공고의 상세 페이지 크롤링
            for idx, notice in enumerate(filtered_notices):
                # 중단 체크
                if self.stop_flag:
                    await self.send_event(callback, "stopped", {
                        "source_id": self.source_id,
                        "message": "데이터 수집이 사용자에 의해 중단되었습니다."
                    })
                    self.status["status"] = CrawlerStatus.STOPPED
                    return

                link = notice.get('link', '')
                title = notice.get('title', '')[:50]

                if link:
                    await self.send_event(callback, "log", {
                        "source_id": self.source_id,
                        "message": f"\n[{idx + 1}/{len(filtered_notices)}] {title}..."
                    })

                    # 상세 페이지 크롤링
                    detail = await self._fetch_ntis_detail(session, link, detail_rate_limiter)

                    if 'error' in detail:
                        detail_failed += 1
                        await self.send_event(callback, "log", {
                            "source_id": self.source_id,
                            "message": f"  ✗ 오류: {detail['error']}"
                        })
                    else:
                        detail_success += 1
                        # raw_data에 상세 정보 추가
                        if 'raw_data' not in notice:
                            notice['raw_data'] = {'detail': {}}
                        notice['raw_data']['detail'].update(detail)

                        # 첨부파일 정보 로그
                        attachments = detail.get('attachments', [])
                        content_len = len(detail.get('content', ''))
                        await self.send_event(callback, "log", {
                            "source_id": self.source_id,
                            "message": f"  ✓ 본문: {content_len}자, 첨부파일: {len(attachments)}개"
                        })
                else:
                    detail_failed += 1

                # 진행상황 업데이트 (매 항목마다)
                self.status["progress"] = idx + 1

                # Phase 메시지도 함께 업데이트
                await self.set_phase(callback, CrawlerPhase.DETAIL_CRAWLING, f"상세 정보 수집 중... ({idx + 1}/{len(filtered_notices)})")

                await self.send_event(callback, "progress", {
                    "source_id": self.source_id,
                    "progress": idx + 1,
                    "total": len(filtered_notices),
                    "percentage": int((idx + 1) / len(filtered_notices) * 100),
                    "success": detail_success,
                    "failed": detail_failed,
                    "message": f"상세 크롤링 진행 중... ({idx + 1}/{len(filtered_notices)})"
                })

            await self.send_event(callback, "log", {
                "source_id": self.source_id,
                "message": f"\n상세 페이지 크롤링 완료: 성공 {detail_success}개, 실패 {detail_failed}개"
            })

            # Phase 4: 키워드 매칭 및 DB 저장
            await self.set_phase(callback, CrawlerPhase.SAVING, "키워드 매칭 및 DB 저장 중...")

            keywords = self.get_keywords()

            await self.send_event(callback, "log", {
                "source_id": self.source_id,
                "message": f"\n키워드 매칭 및 DB 저장 중... (키워드: {len(keywords)}개)"
            })

            self.save_results(filtered_notices, keywords)

            await self.send_event(callback, "log", {
                "source_id": self.source_id,
                "message": f"DB 저장 완료"
            })

            # Phase 5: 완료
            await self.set_phase(callback, CrawlerPhase.COMPLETED, "크롤링 완료")

            self.status["status"] = CrawlerStatus.COMPLETED
            await self.send_event(callback, "complete", {
                "source_id": self.source_id,
                "message": "NTIS RSS 피드 수집이 완료되었습니다.",
                "total_collected": len(filtered_notices),
                "success": self.status["success"],
                "failed": self.status["failed"]
            })

        except requests.exceptions.Timeout:
            self.status["status"] = CrawlerStatus.ERROR
            self.status["error_message"] = "RSS 피드 요청 시간 초과"
            await self.send_event(callback, "error", {
                "source_id": self.source_id,
                "message": "RSS 피드 요청 시간 초과"
            })

        except requests.exceptions.RequestException as e:
            self.status["status"] = CrawlerStatus.ERROR
            self.status["error_message"] = f"네트워크 오류: {str(e)}"
            await self.send_event(callback, "error", {
                "source_id": self.source_id,
                "message": f"네트워크 오류: {str(e)}"
            })

        except ET.ParseError as e:
            self.status["status"] = CrawlerStatus.ERROR
            self.status["error_message"] = f"XML 파싱 오류: {str(e)}"
            await self.send_event(callback, "error", {
                "source_id": self.source_id,
                "message": f"XML 파싱 오류: {str(e)}"
            })

        except Exception as e:
            self.status["status"] = CrawlerStatus.ERROR
            self.status["error_message"] = str(e)
            await self.send_event(callback, "error", {
                "source_id": self.source_id,
                "message": f"크롤링 중 오류 발생: {str(e)}"
            })
