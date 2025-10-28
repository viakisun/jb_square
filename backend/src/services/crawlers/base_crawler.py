"""
Base Crawler
모든 크롤러의 기본 클래스
"""

import asyncio
import json
from abc import ABC, abstractmethod
from datetime import datetime
from typing import Callable, Dict, List, Optional
from enum import Enum

from src.core.database import SessionLocal, CrawlerConfig
from src.models.notice import CrawlQueue
from src.services.rate_limiter import RateLimiter
from src.services.utils import match_keywords, parse_date


class CrawlerStatus(str, Enum):
    """크롤러 상태"""
    IDLE = "idle"
    RUNNING = "running"
    COMPLETED = "completed"
    ERROR = "error"
    STOPPED = "stopped"


class BaseCrawler(ABC):
    """
    모든 크롤러의 기본 추상 클래스

    각 크롤러는 이 클래스를 상속받아 execute() 메서드를 구현해야 합니다.
    """

    def __init__(self, source_id: str):
        """
        Args:
            source_id: 크롤러 식별자 (예: 'jbtp', 'ntis', 'bizinfo')
        """
        self.source_id = source_id
        self.status: Dict = {
            "status": CrawlerStatus.IDLE,
            "progress": 0,
            "total": 0,
            "success": 0,
            "failed": 0,
            "last_run": None,
            "error_message": None
        }
        self.stop_flag = False

    def get_status(self) -> Dict:
        """현재 크롤러 상태 반환"""
        return self.status.copy()

    def stop(self):
        """크롤러 중단"""
        self.stop_flag = True

    def reset_status(self):
        """크롤러 상태 초기화"""
        self.status = {
            "status": CrawlerStatus.RUNNING,
            "progress": 0,
            "total": 0,
            "success": 0,
            "failed": 0,
            "last_run": datetime.now().isoformat(),
            "error_message": None
        }
        self.stop_flag = False

    async def send_event(self, callback: Optional[Callable], event_type: str, data: Dict):
        """
        WebSocket을 통해 이벤트 전송

        Args:
            callback: WebSocket 콜백 함수
            event_type: 이벤트 타입 ('start', 'progress', 'complete', 'error', 'log')
            data: 이벤트 데이터
        """
        if not callback:
            return

        event = {
            "type": event_type,
            "timestamp": datetime.now().isoformat(),
            **data
        }

        if asyncio.iscoroutinefunction(callback):
            await callback(json.dumps(event))
        else:
            callback(json.dumps(event))

    def get_keywords(self) -> List[str]:
        """
        DB에서 크롤러의 키워드 가져오기

        Returns:
            키워드 리스트
        """
        db = SessionLocal()
        try:
            config = db.query(CrawlerConfig).filter(
                CrawlerConfig.source_id == self.source_id
            ).first()
            if config and config.keywords:
                return config.keywords
            return []
        finally:
            db.close()

    def match_keywords(self, text: str, keywords: List[str]) -> List[str]:
        """
        텍스트에서 키워드 매칭

        Args:
            text: 검색할 텍스트
            keywords: 키워드 리스트

        Returns:
            매칭된 키워드 리스트
        """
        return match_keywords(text, keywords)

    def parse_date(self, date_str: str) -> Optional[datetime]:
        """
        날짜 문자열 파싱

        Args:
            date_str: 날짜 문자열

        Returns:
            datetime 객체 또는 None
        """
        return parse_date(date_str)

    def save_results(self, notices: List[dict], keywords: List[str]):
        """
        크롤링 결과를 notice_crawl_queue에 저장합니다 (검토 대기).
        중복 및 거부된 항목은 스킵합니다.
        키워드 필터링: keywords가 있으면, 제목에 키워드가 포함된 공고만 저장합니다.

        Args:
            notices: 공고 리스트
            keywords: 키워드 리스트
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
                    matched = self.match_keywords(title, keywords)
                    if not matched:
                        skipped_filtered += 1
                        continue  # 키워드 매칭 안되면 저장하지 않음

                # 1. 이미 존재하는지 확인 (title + crawler_source_id로 중복 체크)
                existing = db.query(CrawlQueue).filter(
                    CrawlQueue.crawler_source_id == self.source_id,
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
                        crawler_source_id=self.source_id,
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
            print(f"[{self.source_id}] 저장 완료: 신규={added_new}, 업데이트={updated_existing}, "
                  f"키워드 필터={skipped_filtered}, 거부됨 스킵={skipped_rejected}, 중복 스킵={skipped_duplicates}")

        except Exception as e:
            print(f"Error saving crawl results: {str(e)}")
            db.rollback()
        finally:
            db.close()

    @abstractmethod
    async def execute(self, callback: Optional[Callable] = None):
        """
        크롤링 실행 (하위 클래스에서 구현 필수)

        Args:
            callback: WebSocket 콜백 함수
        """
        pass

    async def run(self, callback: Optional[Callable] = None):
        """
        크롤링 실행 래퍼 (에러 처리 포함)

        Args:
            callback: WebSocket 콜백 함수
        """
        try:
            self.reset_status()
            await self.send_event(callback, "start", {
                "source_id": self.source_id,
                "message": f"{self.source_id} 크롤링을 시작합니다..."
            })

            await self.execute(callback)

            self.status["status"] = CrawlerStatus.COMPLETED
            await self.send_event(callback, "complete", {
                "source_id": self.source_id,
                "message": f"{self.source_id} 크롤링이 완료되었습니다.",
                "total_collected": self.status["success"],
                "failed": self.status["failed"]
            })

        except Exception as e:
            self.status["status"] = CrawlerStatus.ERROR
            self.status["error_message"] = str(e)
            await self.send_event(callback, "error", {
                "source_id": self.source_id,
                "message": f"크롤링 중 오류 발생: {str(e)}"
            })
