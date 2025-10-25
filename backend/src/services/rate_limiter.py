"""
Rate Limiter for Web Crawling
크롤링 요청 간격을 강제하는 RateLimiter 클래스
"""

import time
from datetime import datetime
from typing import Optional


class RateLimiter:
    """
    웹 크롤링 시 서버 부하를 방지하기 위한 Rate Limiter

    각 요청 사이에 최소 interval(초) 만큼의 시간 간격을 강제합니다.
    """

    def __init__(self, interval: float = 0.5):
        """
        Args:
            interval: 요청 간 최소 간격 (초). 기본값 0.5초
        """
        self.interval = interval
        self.last_request: Optional[datetime] = None
        self.total_waits = 0
        self.total_wait_time = 0.0

    def wait(self) -> float:
        """
        마지막 요청 이후 interval 시간이 지나지 않았다면 대기합니다.

        Returns:
            실제로 대기한 시간 (초)
        """
        waited = 0.0

        if self.last_request:
            elapsed = (datetime.now() - self.last_request).total_seconds()

            if elapsed < self.interval:
                wait_time = self.interval - elapsed
                time.sleep(wait_time)
                waited = wait_time
                self.total_waits += 1
                self.total_wait_time += wait_time

        self.last_request = datetime.now()
        return waited

    def reset(self):
        """Rate limiter 상태를 초기화합니다."""
        self.last_request = None
        self.total_waits = 0
        self.total_wait_time = 0.0

    def get_stats(self) -> dict:
        """
        Rate limiting 통계를 반환합니다.

        Returns:
            통계 딕셔너리 (총 대기 횟수, 총 대기 시간, 평균 대기 시간)
        """
        avg_wait = self.total_wait_time / self.total_waits if self.total_waits > 0 else 0

        return {
            "interval": self.interval,
            "total_waits": self.total_waits,
            "total_wait_time": round(self.total_wait_time, 2),
            "avg_wait_time": round(avg_wait, 3)
        }
