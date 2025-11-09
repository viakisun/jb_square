"""
Base Crawler
모든 크롤러의 기본 클래스
"""

from abc import ABC, abstractmethod
from datetime import datetime
from typing import Callable, Dict, List, Optional
from enum import Enum

from .services import EventService, KeywordService
from .repositories import ConfigRepository, CrawlQueueRepository


class CrawlerStatus(str, Enum):
    """크롤러 상태"""
    IDLE = "idle"
    RUNNING = "running"
    COMPLETED = "completed"
    ERROR = "error"
    STOPPED = "stopped"


class CrawlerPhase(str, Enum):
    """크롤러 실행 단계"""
    INITIALIZING = "initializing"
    LIST_COLLECTION = "list_collection"
    FILTERING = "filtering"
    DETAIL_CRAWLING = "detail_crawling"
    SAVING = "saving"
    COMPLETED = "completed"


class BaseCrawler(ABC):
    """
    모든 크롤러의 기본 추상 클래스

    각 크롤러는 이 클래스를 상속받아 execute() 메서드를 구현해야 합니다.
    """

    def __init__(self, source_id: str):
        """
        Args:
            source_id: 크롤러 식별자 (예: 'jbtp', 'ntis_rss', 'bizinfo')
        """
        self.source_id = source_id
        self.status: Dict = {
            "status": CrawlerStatus.IDLE,
            "phase": None,
            "phase_message": None,
            "progress": 0,
            "total": 0,
            "success": 0,
            "failed": 0,
            "last_run": None,
            "error_message": None
        }
        self.stop_flag = False
        self._complete_event_sent = False

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
            "phase": CrawlerPhase.INITIALIZING,
            "phase_message": "초기화 중...",
            "progress": 0,
            "total": 0,
            "success": 0,
            "failed": 0,
            "last_run": datetime.now().isoformat(),
            "error_message": None
        }
        self.stop_flag = False
        self._complete_event_sent = False

    async def send_event(self, callback: Optional[Callable], event_type: str, data: Dict):
        """
        WebSocket을 통해 이벤트 전송

        EventService로 위임합니다.

        Args:
            callback: WebSocket 콜백 함수
            event_type: 이벤트 타입 ('start', 'progress', 'complete', 'error', 'log', 'phase_change')
            data: 이벤트 데이터
        """
        # complete 이벤트가 전송되면 플래그 설정
        if event_type == "complete":
            self._complete_event_sent = True
        await EventService.send_event(callback, event_type, data)

    async def set_phase(self, callback: Optional[Callable], phase: CrawlerPhase, message: str):
        """
        크롤러 실행 단계 변경 및 알림

        Args:
            callback: WebSocket 콜백 함수
            phase: 변경할 단계
            message: 단계 설명 메시지
        """
        self.status["phase"] = phase
        self.status["phase_message"] = message

        await self.send_event(callback, "phase_change", {
            "source_id": self.source_id,
            "phase": phase,
            "message": message
        })

    def get_keywords(self) -> List[str]:
        """
        DB에서 크롤러의 키워드 가져오기

        ConfigRepository로 위임합니다.

        Returns:
            키워드 리스트
        """
        return ConfigRepository.get_keywords(self.source_id)

    def match_keywords(self, text: str, keywords: List[str]) -> List[str]:
        """
        텍스트에서 키워드 매칭

        KeywordService로 위임합니다.

        Args:
            text: 검색할 텍스트
            keywords: 키워드 리스트

        Returns:
            매칭된 키워드 리스트
        """
        return KeywordService.match_keywords(text, keywords)

    def save_results(self, notices: List[dict], keywords: List[str]):
        """
        크롤링 결과를 notice_crawl_queue에 저장합니다.

        CrawlQueueRepository로 위임합니다.

        Args:
            notices: 공고 리스트
            keywords: 키워드 리스트
        """
        CrawlQueueRepository.save_results(notices, keywords, self.source_id)

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

            # execute()에서 이미 complete 이벤트를 보냈다면 중복 전송하지 않음
            if not self._complete_event_sent:
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
