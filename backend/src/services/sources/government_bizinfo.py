"""
Bizinfo Crawler
기업마당 API 크롤러
"""

import asyncio
from typing import Callable, Optional, List, Dict

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
            # DB에서 config 로드
            config = ConfigRepository.get_config(self.source_id)
            date_range_days = config['date_range_days'] if config else 30

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

    async def get_notices_preview(
        self,
        count: int = 100,
        apply_keyword_filter: bool = False,
        date_range_days: int = 30
    ) -> List[Dict]:
        """
        키워드 필터 적용 여부를 선택하여 공고 미리보기 (DB 저장 없음)

        Args:
            count: 수집할 최대 공고 개수
            apply_keyword_filter: 키워드 필터 적용 여부
            date_range_days: 검색 기간 (일)

        Returns:
            [{
                'title': str,
                'published_date': str,
                'source': str,
                'board': str,
                'link': str,
                'matched_keywords': List[str]
            }]
        """
        try:
            keywords = self.get_keywords() if apply_keyword_filter else []

            # Helper 클래스 사용하여 리스트 수집 (Phase 1만)
            list_collector = BizinfoListCollector(
                source_id=self.source_id,
                stop_flag_checker=lambda: False,
                event_sender=self.send_event,
                status_dict=self.status
            )

            # 리스트 페이지에서 공고 수집
            notice_rows = await list_collector.collect_notice_list(
                callback=None,
                max_pages=10,  # 미리보기는 최대 10페이지
                date_range_days=date_range_days
            )

            notices_preview = []
            for row in notice_rows:
                if len(notices_preview) >= count:
                    break

                title = row.get('title', '')
                ministry = row.get('ministry', '')
                organization = row.get('organization', '')
                published_date = row.get('published_date', '')
                link = row.get('link', '')

                # 키워드 필터링 (제목 + 소관부처 + 사업수행기관)
                matched_keywords = []
                if apply_keyword_filter:
                    search_text = f"{title} {ministry} {organization}"
                    matched_keywords = self.match_keywords(search_text, keywords)
                    if not matched_keywords:
                        continue

                # 공고 추가
                notice_preview = {
                    'title': title,
                    'published_date': published_date,
                    'source': 'Bizinfo',
                    'board': '기업마당',
                    'link': link,
                    'matched_keywords': matched_keywords
                }
                notices_preview.append(notice_preview)

            return notices_preview

        except Exception as e:
            print(f"[GovernmentBizinfoAdapter] get_notices_preview 오류: {str(e)}")
            import traceback
            traceback.print_exc()
            return []
