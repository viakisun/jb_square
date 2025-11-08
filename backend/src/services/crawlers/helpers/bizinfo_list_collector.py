"""
Bizinfo List Collector
리스트 페이지 크롤링 로직 (Phase 1)
"""

import requests
from datetime import datetime, timedelta
from typing import Callable, Optional, List, Dict, Any
from bs4 import BeautifulSoup

from src.services.rate_limiter import RateLimiter
from src.services.utils.crawler_utils import parse_date
from ..base_crawler import CrawlerStatus


class BizinfoListCollector:
    """
    기업마당 리스트 페이지 크롤러
    Phase 1: 여러 페이지의 공고 리스트를 수집합니다.
    """

    def __init__(
        self,
        source_id: str,
        stop_flag_checker,
        event_sender,
        status_dict: dict
    ):
        """
        Args:
            source_id: 크롤러 소스 ID
            stop_flag_checker: stop_flag 체크 함수 (self.stop_flag 체크용)
            event_sender: 이벤트 전송 함수 (self.send_event)
            status_dict: 상태 딕셔너리 (self.status)
        """
        self.source_id = source_id
        self.stop_flag_checker = stop_flag_checker
        self.send_event = event_sender
        self.status = status_dict

    def _parse_date_range(self, date_str: str) -> tuple:
        """접수기간 파싱 (예: '2025-10-27 ~ 2025-11-04')"""
        try:
            if '~' in date_str:
                parts = date_str.split('~')
                start_date = parts[0].strip()
                end_date = parts[1].strip() if len(parts) > 1 else start_date
                return start_date, end_date
            return date_str.strip(), date_str.strip()
        except Exception:
            return '', ''

    def _is_within_date_range(self, published_date_str: str, date_range_days: int) -> bool:
        """
        게시일이 date_range_days 이내인지 확인

        Args:
            published_date_str: 게시일 문자열 (예: '2025-01-08')
            date_range_days: 검색 기간 (일)

        Returns:
            기간 내 공고면 True, 아니면 False
        """
        try:
            published_date = parse_date(published_date_str)
            if not published_date:
                return True  # 파싱 실패하면 포함

            # 오늘부터 date_range_days 일 전까지
            today = datetime.now()
            cutoff_date = today - timedelta(days=date_range_days)

            return published_date >= cutoff_date
        except Exception:
            return True  # 오류 발생시 포함

    def _parse_list_row(self, row) -> Optional[Dict[str, Any]]:
        """
        리스트 페이지의 단일 행 파싱

        Args:
            row: BeautifulSoup row element

        Returns:
            공고 기본 정보 딕셔너리 또는 None (파싱 실패 시)
        """
        try:
            cells = row.find_all('td')
            if len(cells) < 8:
                return None

            # 컬럼 파싱
            category = cells[1].get_text(strip=True)
            title_cell = cells[2]
            title_link = title_cell.find('a')
            date_range = cells[3].get_text(strip=True)
            ministry = cells[4].get_text(strip=True)
            organization = cells[5].get_text(strip=True)
            published = cells[6].get_text(strip=True)
            views = cells[7].get_text(strip=True)

            if not title_link:
                return None

            title = title_link.get_text(strip=True)
            link_href = title_link.get('href', '')

            # 상대 경로를 절대 경로로 변환
            if link_href and not link_href.startswith('http'):
                link_href = f"https://www.bizinfo.go.kr/web/lay1/bbs/S1T122C128/AS/74/{link_href}"

            # 접수기간 파싱
            start_date, end_date = self._parse_date_range(date_range)

            # notice_row에 기본 정보 저장 (나중에 상세 페이지 크롤링)
            return {
                'title': title,
                'link': link_href,
                'category': category,
                'date_range': date_range,
                'start_date': start_date,
                'end_date': end_date,
                'ministry': ministry,
                'organization': organization,
                'published_date': published,
                'views': views,
            }

        except Exception as e:
            return None

    async def collect_notice_list(
        self,
        callback: Optional[Callable] = None,
        max_pages: int = 5,
        date_range_days: int = 30
    ) -> List[Dict[str, Any]]:
        """
        리스트 페이지 크롤링 (Phase 1)

        Args:
            callback: WebSocket 이벤트 콜백
            max_pages: 최대 페이지 수
            date_range_days: 검색 기간 (일)

        Returns:
            수집된 공고 리스트 (기본 정보만)
        """
        notice_rows = []
        filtered_count = 0

        # 기업마당 웹 페이지 URL
        base_url = "https://www.bizinfo.go.kr/web/lay1/bbs/S1T122C128/AS/74/list.do"

        # HTTP Session 생성
        session = requests.Session()
        session.headers.update({
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        })

        # Rate limiter
        rate_limiter = RateLimiter(0.5)

        # 크롤링 파라미터
        params = {
            'rows': '100',  # 페이지당 100개
            'cpage': '1',
            'schAreaDetailCodes': '6450000',  # 전북
            'schEndAt': 'N',  # 진행 중인 공고만
        }

        # 최대 페이지 설정
        self.status["total"] = max_pages

        await self.send_event(callback, "log", {
            "source_id": self.source_id,
            "message": f"========== Phase 1: 리스트 페이지 크롤링 (최근 {date_range_days}일) =========="
        })

        for page in range(1, max_pages + 1):
            # 중단 체크
            if self.stop_flag_checker():
                await self.send_event(callback, "stopped", {
                    "source_id": self.source_id,
                    "message": "데이터 수집이 사용자에 의해 중단되었습니다."
                })
                self.status["status"] = CrawlerStatus.STOPPED
                break

            await rate_limiter.wait()

            params['cpage'] = str(page)

            await self.send_event(callback, "log", {
                "source_id": self.source_id,
                "message": f"페이지 {page} 크롤링 중..."
            })

            try:
                response = requests.get(base_url, params=params, timeout=30)

                if response.status_code == 200:
                    soup = BeautifulSoup(response.text, 'html.parser')

                    # tbody에서 tr 찾기
                    tbody = soup.find('tbody')
                    if not tbody:
                        await self.send_event(callback, "log", {
                            "source_id": self.source_id,
                            "message": f"  ⚠ 페이지 {page}: 데이터 없음 (크롤링 종료)"
                        })
                        break

                    rows = tbody.find_all('tr')
                    if not rows:
                        await self.send_event(callback, "log", {
                            "source_id": self.source_id,
                            "message": f"  ⚠ 페이지 {page}: 공고 없음 (크롤링 종료)"
                        })
                        break

                    page_count = 0
                    page_filtered = 0
                    for row in rows:
                        notice_row = self._parse_list_row(row)
                        if notice_row:
                            # 게시일 기준 필터링
                            if self._is_within_date_range(notice_row['published_date'], date_range_days):
                                notice_rows.append(notice_row)
                                page_count += 1
                            else:
                                page_filtered += 1
                                filtered_count += 1
                        else:
                            await self.send_event(callback, "log", {
                                "source_id": self.source_id,
                                "message": f"  ⚠ 행 파싱 실패"
                            })

                    if page_count > 0:
                        self.status["success"] += 1
                        filter_msg = f" (필터: {page_filtered}개)" if page_filtered > 0 else ""
                        await self.send_event(callback, "log", {
                            "source_id": self.source_id,
                            "message": f"  ✓ 페이지 {page}: {page_count}개 공고 수집 완료{filter_msg}"
                        })
                    else:
                        await self.send_event(callback, "log", {
                            "source_id": self.source_id,
                            "message": f"  ⚠ 페이지 {page}: 공고 없음 (크롤링 종료)"
                        })
                        break

                else:
                    self.status["failed"] += 1
                    await self.send_event(callback, "log", {
                        "source_id": self.source_id,
                        "message": f"  ✗ 페이지 {page}: HTTP {response.status_code} 오류"
                    })

            except requests.exceptions.Timeout:
                self.status["failed"] += 1
                await self.send_event(callback, "log", {
                    "source_id": self.source_id,
                    "message": f"  ✗ 페이지 {page}: 요청 시간 초과"
                })
            except Exception as e:
                self.status["failed"] += 1
                await self.send_event(callback, "log", {
                    "source_id": self.source_id,
                    "message": f"  ✗ 페이지 {page}: {str(e)}"
                })

            # Send page_progress event for Phase 1
            await self.send_event(callback, "page_progress", {
                "source_id": self.source_id,
                "page": page,
                "accumulated": len(notice_rows)
            })

        # Phase 1 완료 로그
        filter_summary = f" (기간 필터: {filtered_count}개 제외)" if filtered_count > 0 else ""
        await self.send_event(callback, "log", {
            "source_id": self.source_id,
            "message": f"Phase 1 완료: 총 {len(notice_rows)}개 공고 수집{filter_summary}"
        })

        return notice_rows
