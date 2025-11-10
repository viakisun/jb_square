"""
Event Service
WebSocket 이벤트 전송을 담당하는 서비스
"""

import asyncio
import json
from datetime import datetime
from typing import Callable, Dict, Optional


class EventService:
    """
    WebSocket 이벤트 브로드캐스팅 서비스

    모든 크롤러에서 사용하는 이벤트 전송 로직을 중앙화합니다.
    """

    @staticmethod
    async def send_event(
        callback: Optional[Callable],
        event_type: str,
        data: Dict
    ) -> None:
        """
        WebSocket을 통해 이벤트 전송

        Args:
            callback: WebSocket 콜백 함수
            event_type: 이벤트 타입 ('start', 'progress', 'complete', 'error', 'log', 'stopped')
            data: 이벤트 데이터
        """
        if not callback:
            print(f"[EventService] No callback provided for event: {event_type}")
            return

        event = {
            "type": event_type,
            "timestamp": datetime.now().isoformat(),
            **data
        }

        print(f"[EventService] Sending event: {event_type} - {data.get('message', 'NO MESSAGE')[:50]}")
        print(f"[EventService] callback type: {type(callback)}, is coroutine: {asyncio.iscoroutinefunction(callback)}")

        if asyncio.iscoroutinefunction(callback):
            print(f"[EventService] Calling async callback...")
            await callback(json.dumps(event))
            print(f"[EventService] Async callback completed")
        else:
            print(f"[EventService] Calling sync callback...")
            callback(json.dumps(event))
            print(f"[EventService] Sync callback completed")

    @staticmethod
    async def send_start(
        callback: Optional[Callable],
        source_id: str,
        message: str
    ) -> None:
        """크롤링 시작 이벤트"""
        await EventService.send_event(callback, "start", {
            "source_id": source_id,
            "message": message
        })

    @staticmethod
    async def send_progress(
        callback: Optional[Callable],
        source_id: str,
        progress: int,
        total: int,
        **kwargs
    ) -> None:
        """진행 상황 이벤트"""
        data = {
            "source_id": source_id,
            "progress": progress,
            "total": total,
            "percentage": int((progress / total * 100)) if total > 0 else 0,
            **kwargs
        }
        await EventService.send_event(callback, "progress", data)

    @staticmethod
    async def send_log(
        callback: Optional[Callable],
        source_id: str,
        message: str
    ) -> None:
        """로그 메시지 이벤트"""
        await EventService.send_event(callback, "log", {
            "source_id": source_id,
            "message": message
        })

    @staticmethod
    async def send_complete(
        callback: Optional[Callable],
        source_id: str,
        message: str,
        **kwargs
    ) -> None:
        """완료 이벤트"""
        data = {
            "source_id": source_id,
            "message": message,
            **kwargs
        }
        await EventService.send_event(callback, "complete", data)

    @staticmethod
    async def send_error(
        callback: Optional[Callable],
        source_id: str,
        message: str
    ) -> None:
        """에러 이벤트"""
        await EventService.send_event(callback, "error", {
            "source_id": source_id,
            "message": message
        })

    @staticmethod
    async def send_stopped(
        callback: Optional[Callable],
        source_id: str,
        message: str
    ) -> None:
        """중단 이벤트"""
        await EventService.send_event(callback, "stopped", {
            "source_id": source_id,
            "message": message
        })
