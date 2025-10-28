"""
Bizinfo Crawler
기업마당 API 크롤러
"""

import os
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

    async def execute(self, callback: Optional[Callable] = None):
        """크롤링 실행"""
        try:
            # API 키 확인
            api_key = os.getenv('BIZINFO_API_KEY', '').strip()

            if not api_key:
                raise ValueError(
                    "기업마당 API 키가 설정되지 않았습니다. "
                    ".env 파일에 BIZINFO_API_KEY를 입력해주세요. "
                    "API 키 신청: https://www.bizinfo.go.kr/web/lay1/program/S1T175C174/apiDetail.do"
                )

            await self.send_event(callback, "start", {
                "source_id": self.source_id,
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

            self.status["total"] = 1

            # 중단 체크
            if self.stop_flag:
                await self.send_event(callback, "stopped", {
                    "source_id": self.source_id,
                    "message": "데이터 수집이 사용자에 의해 중단되었습니다."
                })
                self.status["status"] = CrawlerStatus.STOPPED
                return

            rate_limiter.wait()

            await self.send_event(callback, "log", {
                "source_id": self.source_id,
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

                                await self.send_event(callback, "log", {
                                    "source_id": self.source_id,
                                    "message": f"  ✓ [{notice['board']}] {notice['title'][:60]}{'...' if len(notice['title']) > 60 else ''}"
                                })

                        if notices:
                            all_notices.extend(notices)
                            self.status["success"] += 1

                            await self.send_event(callback, "log", {
                                "source_id": self.source_id,
                                "message": f"  → {len(notices)}개 공고 수집 완료"
                            })
                        else:
                            self.status["failed"] += 1
                            await self.send_event(callback, "log", {
                                "source_id": self.source_id,
                                "message": f"  ⚠ 데이터가 없습니다"
                            })

                    except (ValueError, KeyError) as e:
                        # 파싱 오류
                        self.status["failed"] += 1
                        await self.send_event(callback, "log", {
                            "source_id": self.source_id,
                            "message": f"  ✗ API 응답 파싱 오류: {str(e)}"
                        })
                else:
                    self.status["failed"] += 1
                    await self.send_event(callback, "log", {
                        "source_id": self.source_id,
                        "message": f"  ✗ HTTP {response.status_code} 오류"
                    })

            except requests.exceptions.Timeout:
                self.status["failed"] += 1
                await self.send_event(callback, "log", {
                    "source_id": self.source_id,
                    "message": f"  ✗ API 요청 시간 초과"
                })
            except requests.exceptions.RequestException as e:
                self.status["failed"] += 1
                await self.send_event(callback, "log", {
                    "source_id": self.source_id,
                    "message": f"  ✗ 네트워크 오류: {str(e)}"
                })
            except Exception as e:
                self.status["failed"] += 1
                await self.send_event(callback, "log", {
                    "source_id": self.source_id,
                    "message": f"  ✗ 오류: {str(e)}"
                })

            # Progress update
            self.status["progress"] = 1
            await self.send_event(callback, "progress", {
                "source_id": self.source_id,
                "progress": 1,
                "total": 1,
                "percentage": 100,
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

        except ValueError as e:
            # API 키 누락 오류
            self.status["status"] = CrawlerStatus.ERROR
            self.status["error_message"] = str(e)

            await self.send_event(callback, "error", {
                "source_id": self.source_id,
                "message": str(e)
            })

        except Exception as e:
            self.status["status"] = CrawlerStatus.ERROR
            self.status["error_message"] = str(e)

            await self.send_event(callback, "error", {
                "source_id": self.source_id,
                "message": f"데이터 수집 중 오류 발생: {str(e)}"
            })
