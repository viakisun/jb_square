"""
Crawler Manager
모든 크롤러를 관리하고 실시간 상태를 WebSocket으로 전송
"""

import asyncio
import json
from datetime import datetime
from pathlib import Path
from typing import Callable, Dict, Optional, List
from enum import Enum

import sys
sys.path.append(str(Path(__file__).parent.parent.parent.parent / "crawler"))

from app.services.rate_limiter import RateLimiter
from app.database import SessionLocal, CrawlerConfig, CrawlResult


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
        """크롤링 결과를 DB에 저장합니다."""
        db = SessionLocal()
        try:
            for notice in notices:
                # 키워드 매칭
                matched_keywords = self._match_keywords(notice['title'], keywords)

                # DB에 저장
                result = CrawlResult(
                    source_id=source_id,
                    title=notice['title'],
                    link=notice.get('link'),
                    date=notice.get('date'),
                    board=notice.get('board'),
                    keywords_matched=matched_keywords,
                    crawled_at=datetime.now()
                )
                db.add(result)

            db.commit()
        except Exception as e:
            print(f"Error saving crawl results: {str(e)}")
            db.rollback()
        finally:
            db.close()

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

                                            notices.append({
                                                'title': title,
                                                'link': link,
                                                'date': date,
                                                'board': board_name,
                                                'source': 'JBTP',
                                                'extracted_at': datetime.now().isoformat()
                                            })

                        if notices:
                            all_notices.extend(notices)
                            self.crawlers_status[source_id]["success"] += 1

                            await self._send_event(callback, "log", {
                                "source_id": source_id,
                                "message": f"  ✓ {len(notices)}개 공고 수집 완료"
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

            # 결과 저장 (JSON + DB)
            output_dir = Path(__file__).parent.parent.parent.parent / "crawler"
            output_file = output_dir / "jbtp_all_notices.json"

            with open(output_file, 'w', encoding='utf-8') as f:
                json.dump(all_notices, f, ensure_ascii=False, indent=2)

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
        """NTIS 크롤러를 실행합니다."""
        source_id = "ntis"
        self._reset_status(source_id)

        try:
            await self._send_event(callback, "start", {
                "source_id": source_id,
                "message": "NTIS 크롤링을 시작합니다..."
            })

            # TODO: 실제 NTIS 크롤러 구현
            # 현재는 간단한 시뮬레이션

            for i in range(5):
                if self.stop_flags[source_id]:
                    break

                await asyncio.sleep(0.5)  # Rate limiting

                self.crawlers_status[source_id]["progress"] = i + 1
                self.crawlers_status[source_id]["total"] = 5

                await self._send_event(callback, "progress", {
                    "source_id": source_id,
                    "progress": i + 1,
                    "total": 5,
                    "percentage": int((i + 1) / 5 * 100)
                })

            self.crawlers_status[source_id]["status"] = CrawlerStatus.COMPLETED
            await self._send_event(callback, "complete", {
                "source_id": source_id,
                "message": "NTIS 크롤링이 완료되었습니다."
            })

        except Exception as e:
            self.crawlers_status[source_id]["status"] = CrawlerStatus.ERROR
            await self._send_event(callback, "error", {
                "source_id": source_id,
                "message": f"오류: {str(e)}"
            })

    async def execute_bizinfo(self, callback: Optional[Callable] = None):
        """BizInfo 크롤러를 실행합니다."""
        source_id = "bizinfo"
        self._reset_status(source_id)

        try:
            await self._send_event(callback, "start", {
                "source_id": source_id,
                "message": "기업마당 크롤링을 시작합니다..."
            })

            # TODO: 실제 BizInfo 크롤러 구현

            self.crawlers_status[source_id]["status"] = CrawlerStatus.COMPLETED
            await self._send_event(callback, "complete", {
                "source_id": source_id,
                "message": "기업마당 크롤링이 완료되었습니다."
            })

        except Exception as e:
            self.crawlers_status[source_id]["status"] = CrawlerStatus.ERROR
            await self._send_event(callback, "error", {
                "source_id": source_id,
                "message": f"오류: {str(e)}"
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
