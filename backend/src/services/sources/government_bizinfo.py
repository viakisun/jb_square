"""
Bizinfo Crawler
기업마당 API 크롤러
"""

import asyncio
from typing import Callable, Optional

from src.services.rate_limiter import RateLimiter
from src.constants.sources import NoticeSource
from ._base import BaseAdapter, CrawlerStatus
from .helpers.bizinfo.bizinfo_list_collector import BizinfoListCollector
from .helpers.bizinfo.bizinfo_detail_processor import BizinfoDetailProcessor
from .repositories.config_repository import ConfigRepository


class GovernmentBizinfoAdapter(BaseAdapter):
    """
    기업마당 API 크롤러

    API: https://www.bizinfo.go.kr/web/lay1/program/S1T175C174/apiDetail.do
    """

    def __init__(self):
        super().__init__(NoticeSource.BIZINFO_API)

    async def execute(self, callback: Optional[Callable] = None):
        """크롤링 실행"""
        try:
            # DB에서 date_range_days 로드
            date_range_days = ConfigRepository.get_date_range_days(self.source_id)

            await self.send_event(callback, "log", {
                "source_id": self.source_id,
                "message": f"기업마당 설정 로드 완료 (검색 기간: {date_range_days}일)"
            })

            await self.send_event(callback, "start", {
                "source_id": self.source_id,
                "message": "기업마당 웹 크롤링을 시작합니다..."
            })

            # Rate limiter 생성
            rate_limiter = RateLimiter(0.5)

            # Helper 클래스 초기화
            list_collector = BizinfoListCollector(
                source_id=self.source_id,
                stop_flag_checker=lambda: self.stop_flag,
                event_sender=self.send_event,
                status_dict=self.status
            )

            detail_processor = BizinfoDetailProcessor(
                source_id=self.source_id,
                stop_flag_checker=lambda: self.stop_flag,
                event_sender=self.send_event,
                status_dict=self.status,
                keyword_matcher_func=self.match_keywords
            )

            # Phase 1: 리스트 페이지 크롤링
            notice_rows = await list_collector.collect_notice_list(
                callback=callback,
                max_pages=5,
                date_range_days=date_range_days
            )

            # 중단 체크
            if self.stop_flag:
                return

            # 키워드 로드
            keywords = self.get_keywords()

            # Phase 1 통계 계산 (제목 + 소관부처 + 사업수행기관)
            def matches_in_list_fields(row):
                search_text = f"{row['title']} {row.get('ministry', '')} {row.get('organization', '')}"
                return self.match_keywords(search_text, keywords)

            keyword_matched = [row for row in notice_rows if matches_in_list_fields(row)]
            stats_matched = len(keyword_matched)
            stats_unmatched = len(notice_rows) - stats_matched

            # Send statistics event
            await self.send_event(callback, "statistics", {
                "source_id": self.source_id,
                "total": len(notice_rows),
                "matched": stats_matched,
                "unmatched": stats_unmatched
            })

            # Send collection_complete event to signal Phase 1 → Phase 2 transition
            await self.send_event(callback, "collection_complete", {
                "source_id": self.source_id,
                "total_collected": len(notice_rows)
            })

            # Phase 2: 상세 페이지 크롤링 + 실시간 저장
            result = await detail_processor.process_notices_with_realtime_save(
                notice_rows=notice_rows,
                keywords=keywords,
                rate_limiter=rate_limiter,
                callback=callback
            )

            # 중단 체크
            if self.stop_flag:
                return

            # 완료
            self.status["status"] = CrawlerStatus.COMPLETED
            await self.send_event(callback, "complete", {
                "source_id": self.source_id,
                "message": "기업마당 API 데이터 수집이 완료되었습니다.",
                "total_collected": result['saved_count'],
                "success": self.status["success"],
                "failed": self.status["failed"],
                "rate_limit_stats": rate_limiter.get_stats(),
                # Phase 통계 추가
                "phase1_stats": {
                    "total": len(notice_rows),
                    "matched": stats_matched,
                    "unmatched": stats_unmatched
                },
                "phase2_stats": {
                    "saved": result['saved_count'],
                    "keyword_filtered": result['keyword_filtered_count'],
                    "detail_success": result['detail_crawled_count'],
                    "detail_failed": result['detail_failed_count']
                }
            })

        except Exception as e:
            self.status["status"] = CrawlerStatus.ERROR
            self.status["error_message"] = str(e)

            await self.send_event(callback, "error", {
                "source_id": self.source_id,
                "message": f"데이터 수집 중 오류 발생: {str(e)}"
            })
