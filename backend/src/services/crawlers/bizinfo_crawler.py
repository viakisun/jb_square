"""
Bizinfo Crawler
기업마당 API 크롤러
"""

import requests
from datetime import datetime
from typing import Callable, Optional

from src.services.rate_limiter import RateLimiter
from .base_crawler import BaseCrawler, CrawlerStatus


class BizinfoCrawler(BaseCrawler):
    """
    기업마당 API 크롤러

    API: https://www.bizinfo.go.kr/web/lay1/program/S1T175C174/apiDetail.do
    """

    def __init__(self):
        super().__init__("bizinfo")

    def _parse_date_range(self, date_str: str):
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

    async def execute(self, callback: Optional[Callable] = None):
        """크롤링 실행"""
        try:
            await self.send_event(callback, "log", {
                "source_id": self.source_id,
                "message": "기업마당 설정 로드 완료"
            })

            await self.send_event(callback, "start", {
                "source_id": self.source_id,
                "message": "기업마당 웹 크롤링을 시작합니다..."
            })

            rate_limiter = RateLimiter(0.5)
            all_notices = []

            # 기업마당 웹 페이지 URL
            base_url = "https://www.bizinfo.go.kr/web/lay1/bbs/S1T122C128/AS/74/list.do"

            # 크롤링 파라미터
            params = {
                'rows': '100',  # 페이지당 100개
                'cpage': '1',
                'schAreaDetailCodes': '6450000',  # 전북
                'schEndAt': 'N',  # 진행 중인 공고만
            }

            # 최대 5페이지까지 크롤링
            max_pages = 5
            self.status["total"] = max_pages

            for page in range(1, max_pages + 1):
                # 중단 체크
                if self.stop_flag:
                    await self.send_event(callback, "stopped", {
                        "source_id": self.source_id,
                        "message": "데이터 수집이 사용자에 의해 중단되었습니다."
                    })
                    self.status["status"] = CrawlerStatus.STOPPED
                    return

                rate_limiter.wait()

                params['cpage'] = str(page)

                await self.send_event(callback, "log", {
                    "source_id": self.source_id,
                    "message": f"페이지 {page} 크롤링 중..."
                })

                try:
                    response = requests.get(base_url, params=params, timeout=30)

                    if response.status_code == 200:
                        from bs4 import BeautifulSoup

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

                        page_notices = []
                        for row in rows:
                            try:
                                cells = row.find_all('td')
                                if len(cells) < 8:
                                    continue

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
                                    continue

                                title = title_link.get_text(strip=True)
                                link_href = title_link.get('href', '')

                                # 상대 경로를 절대 경로로 변환
                                if link_href and not link_href.startswith('http'):
                                    link_href = f"https://www.bizinfo.go.kr/web/lay1/bbs/S1T122C128/AS/74/{link_href}"

                                # 접수기간 파싱
                                start_date, end_date = self._parse_date_range(date_range)

                                # 디버깅: 첫 번째 공고의 날짜 정보 로그
                                if len(page_notices) == 0:
                                    await self.send_event(callback, "log", {
                                        "source_id": self.source_id,
                                        "message": f"  [DEBUG] published='{published}', date_range='{date_range}', end_date='{end_date}'"
                                    })

                                notice = {
                                    'title': title,
                                    'link': link_href,
                                    'date': end_date,  # 마감일을 대표 날짜로
                                    'board': category,
                                    'source': 'Bizinfo',
                                    'extracted_at': datetime.now().isoformat(),
                                    # 구조화된 필드 추가
                                    'deadline': end_date if end_date else None,
                                    'published_date': published if published else None,
                                    'organization': organization if organization else None,
                                    'department': ministry if ministry else None,  # 부처명을 department로
                                    'views': int(views) if views and views.isdigit() else 0,
                                    'status': '접수중',  # schEndAt=N이므로 진행 중인 공고만
                                    'raw_data': {
                                        'detail': {
                                            'category': category,
                                            'date_range': date_range,
                                            'start_date': start_date,
                                            'end_date': end_date,
                                            'ministry': ministry,
                                            'organization': organization,
                                            'published_date': published,
                                            'views': views,
                                        }
                                    }
                                }

                                page_notices.append(notice)

                            except Exception as e:
                                await self.send_event(callback, "log", {
                                    "source_id": self.source_id,
                                    "message": f"  ⚠ 행 파싱 오류: {str(e)}"
                                })
                                continue

                        if page_notices:
                            all_notices.extend(page_notices)
                            self.status["success"] += 1

                            await self.send_event(callback, "log", {
                                "source_id": self.source_id,
                                "message": f"  ✓ 페이지 {page}: {len(page_notices)}개 공고 수집 완료"
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

                # Progress update
                self.status["progress"] = page
                await self.send_event(callback, "progress", {
                    "source_id": self.source_id,
                    "progress": page,
                    "total": max_pages,
                    "percentage": int((page / max_pages) * 100),
                    "success": self.status["success"],
                    "failed": self.status["failed"]
                })

            # DB에서 키워드 로드
            keywords = self.get_keywords()

            # DB에 저장
            self.save_results(all_notices, keywords)

            # 키워드 매칭 통계
            keyword_matched_count = sum(1 for notice in all_notices if self.match_keywords(notice['title'], keywords))

            await self.send_event(callback, "log", {
                "source_id": self.source_id,
                "message": f"결과 저장 완료: {len(all_notices)}개 공고 (키워드 매칭: {keyword_matched_count}개)"
            })

            # 완료
            self.status["status"] = CrawlerStatus.COMPLETED
            await self.send_event(callback, "complete", {
                "source_id": self.source_id,
                "message": "기업마당 API 데이터 수집이 완료되었습니다.",
                "total_collected": len(all_notices),
                "success": self.status["success"],
                "failed": self.status["failed"],
                "rate_limit_stats": rate_limiter.get_stats()
            })

        except Exception as e:
            self.status["status"] = CrawlerStatus.ERROR
            self.status["error_message"] = str(e)

            await self.send_event(callback, "error", {
                "source_id": self.source_id,
                "message": f"데이터 수집 중 오류 발생: {str(e)}"
            })
