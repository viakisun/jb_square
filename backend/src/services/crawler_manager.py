"""
Crawler Manager
모든 크롤러를 관리하고 실시간 상태를 WebSocket으로 전송
"""

import asyncio
import json
import requests
from datetime import datetime
from pathlib import Path
from typing import Callable, Dict, Optional, List
from enum import Enum

import sys
sys.path.append(str(Path(__file__).parent.parent.parent.parent / "crawler"))

from src.services.rate_limiter import RateLimiter
from src.core.database import SessionLocal, CrawlerConfig, CrawlResult
from src.models.notice import CrawlQueue


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

    def _save_results(self, source_id: str, notices: List[dict], keywords: List[str]):
        """
        크롤링 결과를 crawl_queue에 저장합니다 (검토 대기).
        중복 및 거부된 항목은 스킵합니다.
        """
        db = SessionLocal()
        try:
            skipped_rejected = 0
            skipped_duplicates = 0
            added_new = 0
            updated_existing = 0

            for notice in notices:
                title = notice['title']

                # 1. 이미 존재하는지 확인 (title + source_id로 중복 체크)
                existing = db.query(CrawlQueue).filter(
                    CrawlQueue.source_id == source_id,
                    CrawlQueue.title == title
                ).first()

                if existing:
                    # 2. 거부된 항목이면 스킵 (다시 추가하지 않음)
                    if existing.rejection_status == 'rejected':
                        skipped_rejected += 1
                        continue

                    # 3. 아직 처리되지 않았으면 데이터 업데이트 (최신 정보 반영)
                    if not existing.processed:
                        existing.link = notice.get('link')
                        existing.date = notice.get('date')
                        existing.board = notice.get('board')
                        existing.raw_data = notice
                        existing.extracted_at = datetime.now()
                        updated_existing += 1
                    else:
                        # 이미 처리된 항목은 스킵
                        skipped_duplicates += 1
                else:
                    # 4. 새로운 항목 추가
                    queue_item = CrawlQueue(
                        source_id=source_id,
                        title=title,
                        link=notice.get('link'),
                        date=notice.get('date'),
                        board=notice.get('board'),
                        raw_data=notice,
                        extracted_at=datetime.now(),
                        selected=False,
                        processed=False,
                        rejection_status=None  # NULL = pending review
                    )
                    db.add(queue_item)
                    added_new += 1

            db.commit()

            # 통계 출력 (로깅용)
            print(f"[{source_id}] 저장 완료: 신규={added_new}, 업데이트={updated_existing}, "
                  f"거부됨 스킵={skipped_rejected}, 중복 스킵={skipped_duplicates}")

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

            # 크롤링할 게시판 목록
            board_urls = [
                ("사업공고", "https://www.jbtp.or.kr/index.jbtp?menuCd=DOM_000000102001000000"),
                ("채용공고", "https://www.jbtp.or.kr/index.jbtp?menuCd=DOM_000000101001000000"),
                ("유관기관공고", "https://www.jbtp.or.kr/index.jbtp?menuCd=DOM_000000102002000000"),
            ]

            self.crawlers_status[source_id]["total"] = len(board_urls)
            all_notices = []

            for idx, (board_name, url) in enumerate(board_urls):
                # 중단 체크
                if self.stop_flags[source_id]:
                    await self._send_event(callback, "stopped", {
                        "source_id": source_id,
                        "message": "크롤링이 사용자에 의해 중단되었습니다."
                    })
                    self.crawlers_status[source_id]["status"] = CrawlerStatus.STOPPED
                    return

                # Rate limiting
                waited = rate_limiter.wait()

                await self._send_event(callback, "log", {
                    "source_id": source_id,
                    "message": f"[{board_name}] 수집 중... (대기: {waited:.2f}s)"
                })

                try:
                    response = session.get(url, timeout=10)

                    if response.status_code == 200:
                        soup = BeautifulSoup(response.text, 'html.parser')

                        # 테이블에서 공고 파싱
                        notices = []
                        table = soup.find('table')
                        if table:
                            tbody = table.find('tbody')
                            if tbody:
                                rows = tbody.find_all('tr')
                            else:
                                rows = table.find_all('tr')

                            for row in rows:
                                cols = row.find_all('td')
                                if len(cols) >= 3:
                                    # 제목이 포함된 컬럼 찾기
                                    title_col = None
                                    for col in cols:
                                        if col.find('a'):
                                            title_col = col
                                            break

                                    if title_col:
                                        title_tag = title_col.find('a')
                                        if title_tag:
                                            title = title_tag.get_text(strip=True)
                                            link = title_tag.get('href', '')

                                            # 상대 경로를 절대 경로로 변환
                                            if link and not link.startswith('http'):
                                                if link.startswith('/'):
                                                    link = 'https://www.jbtp.or.kr' + link
                                                else:
                                                    link = 'https://www.jbtp.or.kr/' + link

                                            # 날짜 추출
                                            date = ''
                                            for col in cols:
                                                text = col.get_text(strip=True)
                                                if text and len(text) >= 10 and '-' in text:
                                                    date = text
                                                    break

                                            # 상세 페이지 크롤링
                                            detail_data = await self._fetch_jbtp_detail(session, link, rate_limiter)

                                            # Debug: 상세 정보 로깅
                                            if detail_data:
                                                print(f"[DEBUG] Detail data for '{title[:50]}': {list(detail_data.keys())}")
                                            else:
                                                print(f"[DEBUG] No detail data for '{title[:50]}'")

                                            notice_data = {
                                                'title': title,
                                                'link': link,
                                                'date': date,
                                                'board': board_name,
                                                'source': 'JBTP',
                                                'extracted_at': datetime.now().isoformat(),
                                                'detail': detail_data  # 상세 정보 추가
                                            }
                                            notices.append(notice_data)

                                            # 각 공고를 즉시 로그로 표시
                                            await self._send_event(callback, "log", {
                                                "source_id": source_id,
                                                "message": f"  ✓ [{board_name}] {title[:60]}{'...' if len(title) > 60 else ''}"
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
                                "message": f"  ✗ 공고를 찾을 수 없습니다"
                            })
                    else:
                        self.crawlers_status[source_id]["failed"] += 1
                        await self._send_event(callback, "log", {
                            "source_id": source_id,
                            "message": f"  ✗ HTTP {response.status_code} 오류"
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
                    "total": len(board_urls),
                    "percentage": int((idx + 1) / len(board_urls) * 100),
                    "success": self.crawlers_status[source_id]["success"],
                    "failed": self.crawlers_status[source_id]["failed"]
                })

            # DB에서 키워드 로드
            keywords = self._get_keywords(source_id)

            # DB에 저장 (JSON 파일 저장 제거)
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
                "message": "JBTP 크롤링이 완료되었습니다.",
                "total_collected": len(all_notices),
                "success": self.crawlers_status[source_id]["success"],
                "failed": self.crawlers_status[source_id]["failed"],
                "rate_limit_stats": rate_limiter.get_stats()
            })

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
        """BI Center 크롤러를 실행합니다."""
        source_id = "bi_center"
        self._reset_status(source_id)

        try:
            await self._send_event(callback, "start", {
                "source_id": source_id,
                "message": "창업보육센터 크롤링을 시작합니다..."
            })

            # TODO: 실제 BI Center 크롤러 구현

            self.crawlers_status[source_id]["status"] = CrawlerStatus.COMPLETED
            await self._send_event(callback, "complete", {
                "source_id": source_id,
                "message": "창업보육센터 크롤링이 완료되었습니다."
            })

        except Exception as e:
            self.crawlers_status[source_id]["status"] = CrawlerStatus.ERROR
            await self._send_event(callback, "error", {
                "source_id": source_id,
                "message": f"오류: {str(e)}"
            })


# Singleton instance
crawler_manager = CrawlerManager()
