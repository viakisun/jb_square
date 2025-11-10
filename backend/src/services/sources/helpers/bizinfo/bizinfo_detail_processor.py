"""
Bizinfo Detail Processor
상세 페이지 크롤링 + 실시간 저장 로직 (Phase 2)
"""

import asyncio
from datetime import datetime
from typing import Callable, Optional, List, Dict, Any

from src.core.database import SessionLocal
from src.services.rate_limiter import RateLimiter
from ..._base import CrawlerStatus
from ...strategies import BizinoExtractionStrategy
from .bizinfo_notice_saver import BizinfoNoticeSaver


class BizinfoDetailProcessor:
    """
    기업마당 상세 페이지 프로세서
    Phase 2: 키워드 매칭된 공고의 상세 페이지 크롤링 + 실시간 저장
    """

    def __init__(
        self,
        source_id: str,
        stop_flag_checker,
        event_sender,
        status_dict: dict,
        keyword_matcher_func
    ):
        """
        Args:
            source_id: 크롤러 소스 ID
            stop_flag_checker: stop_flag 체크 함수
            event_sender: 이벤트 전송 함수
            status_dict: 상태 딕셔너리
            keyword_matcher_func: 키워드 매칭 함수 (BaseAdapter.match_keywords)
        """
        self.source_id = source_id
        self.stop_flag_checker = stop_flag_checker
        self.send_event = event_sender
        self.status = status_dict
        self.match_keywords = keyword_matcher_func
        self.notice_saver = BizinfoNoticeSaver(source_id)

    def _create_notice_dict(
        self,
        notice_row: Dict[str, Any],
        detail_data: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """
        공고 딕셔너리 생성

        Args:
            notice_row: 리스트 페이지에서 수집한 기본 정보
            detail_data: 상세 페이지 데이터 (optional)

        Returns:
            CrawlQueue에 저장할 공고 딕셔너리
        """
        notice = {
            'title': notice_row['title'],
            'link': notice_row['link'],
            'date': notice_row['end_date'],
            'board': notice_row['category'],
            'source': 'Bizinfo',
            'extracted_at': datetime.now().isoformat(),
            'deadline': notice_row['end_date'] if notice_row['end_date'] else None,
            'published_date': notice_row['published_date'] if notice_row['published_date'] else None,
            'organization': notice_row['organization'] if notice_row['organization'] else None,
            'department': notice_row['ministry'] if notice_row['ministry'] else None,
            'views': int(notice_row['views']) if notice_row['views'] and notice_row['views'].isdigit() else 0,
            'status': '접수중',
            'list': notice_row
        }

        # 상세 페이지 데이터 추가 (있는 경우)
        if detail_data:
            notice['contact'] = detail_data.get('contact_phone')
            notice['detail'] = detail_data

        return notice

    async def _process_single_notice(
        self,
        notice_row: Dict[str, Any],
        keywords: List[str],
        session,
        rate_limiter: RateLimiter,
        db,
        callback: Optional[Callable] = None
    ) -> tuple:
        """
        개별 공고 처리 (상세 크롤링 + DB 저장)

        Args:
            notice_row: 리스트 페이지에서 수집한 기본 정보
            keywords: 키워드 리스트
            session: HTTP 세션
            rate_limiter: Rate limiter
            db: 데이터베이스 세션
            callback: WebSocket 콜백

        Returns:
            tuple: (is_saved: bool, crawled_detail: bool)
        """
        # Step 1: 리스트 정보(제목 + 소관부처 + 사업수행기관)로 키워드 매칭 체크
        list_search_text = f"{notice_row['title']} {notice_row.get('ministry', '')} {notice_row.get('organization', '')}"
        matched_keywords = self.match_keywords(list_search_text, keywords)

        # Step 2: 제목에서 매칭 안 되면 상세 내용까지 크롤링하여 체크
        detail_data = None
        if not matched_keywords:
            # 상세 페이지 크롤링하여 내용 확인
            try:
                detail_data = await BizinoExtractionStrategy.fetch_detail(
                    session,
                    notice_row['link'],
                    rate_limiter
                )

                # 상세 내용이 있으면 제목 + 상세 내용으로 다시 키워드 매칭
                if detail_data and detail_data.get('content'):
                    from bs4 import BeautifulSoup
                    # HTML 태그 제거하여 순수 텍스트 추출
                    soup = BeautifulSoup(detail_data.get('content_html', ''), 'html.parser')
                    content_text = soup.get_text(separator=' ', strip=True)

                    # 제목 + 상세 내용으로 키워드 매칭
                    search_text = f"{notice_row['title']} {content_text}"
                    matched_keywords = self.match_keywords(search_text, keywords)

                    await self.send_event(callback, "log", {
                        "source_id": self.source_id,
                        "message": f"  처리 중: {notice_row['title'][:80]}..."
                    })

                    if matched_keywords:
                        await self.send_event(callback, "log", {
                            "source_id": self.source_id,
                            "message": f"    → 매칭된 키워드 (상세 내용): {matched_keywords}"
                        })
                    else:
                        await self.send_event(callback, "log", {
                            "source_id": self.source_id,
                            "message": f"    → 키워드 매칭 안됨, 스킵"
                        })
            except Exception as e:
                await self.send_event(callback, "log", {
                    "source_id": self.source_id,
                    "message": f"  ⚠ 상세 페이지 크롤링 실패: {str(e)}"
                })
        else:
            await self.send_event(callback, "log", {
                "source_id": self.source_id,
                "message": f"  처리 중: {notice_row['title'][:80]}..."
            })
            await self.send_event(callback, "log", {
                "source_id": self.source_id,
                "message": f"    → 매칭된 키워드 (리스트 정보): {matched_keywords}"
            })

        # 키워드 매칭 안됨 - 저장하지 않음
        if not matched_keywords:
            return False, False

        # 키워드 매칭됨 - 상세 페이지 크롤링 (아직 안 했으면)
        try:
            if detail_data is None:
                # 상세 페이지 크롤링
                detail_data = await BizinoExtractionStrategy.fetch_detail(
                    session,
                    notice_row['link'],
                    rate_limiter
                )

            # 리스트 데이터 + 상세 데이터 병합
            notice = self._create_notice_dict(notice_row, detail_data)

            # DB 저장
            status, _, queue_item = self.notice_saver.save_single_notice(
                notice, keywords, db, self.match_keywords
            )

            if status == 'added' or status == 'updated':
                # DB 커밋 및 리프레시
                db.commit()
                db.refresh(queue_item)

                # 실시간 item_added 이벤트 전송
                await self.send_event(callback, "item_added", {
                    "source_id": self.source_id,
                    "item": queue_item.to_dict()
                })

            if 'error' in detail_data:
                await self.send_event(callback, "log", {
                    "source_id": self.source_id,
                    "message": f"  ⚠ 상세 크롤링 실패: {detail_data['error']}"
                })
                return status in ['added', 'updated'], False  # saved, but detail failed
            else:
                await self.send_event(callback, "log", {
                    "source_id": self.source_id,
                    "message": f"  ✓ 상세 크롤링 완료 (첨부파일: {len(detail_data.get('attachments', []))}개)"
                })
                return status in ['added', 'updated'], True  # saved and crawled

        except Exception as e:
            await self.send_event(callback, "log", {
                "source_id": self.source_id,
                "message": f"  ✗ 상세 크롤링 오류: {str(e)}"
            })

            # 오류 발생 시에도 리스트 정보로 공고 생성 + DB 저장
            notice = self._create_notice_dict(notice_row)
            notice['raw_data']['detail'] = {'error': str(e)}

            status, _, queue_item = self.notice_saver.save_single_notice(
                notice, keywords, db, self.match_keywords
            )

            if status == 'added' or status == 'updated':
                # DB 커밋 및 리프레시
                db.commit()
                db.refresh(queue_item)

                # 실시간 item_added 이벤트 전송
                await self.send_event(callback, "item_added", {
                    "source_id": self.source_id,
                    "item": queue_item.to_dict()
                })

                return True, False  # saved=True, crawled_detail=False

            return False, False

    async def process_notices_with_realtime_save(
        self,
        notice_rows: List[Dict[str, Any]],
        keywords: List[str],
        rate_limiter: RateLimiter,
        callback: Optional[Callable] = None
    ) -> Dict[str, int]:
        """
        Phase 2: 상세 페이지 크롤링 + 실시간 저장

        Args:
            notice_rows: Phase 1에서 수집한 공고 리스트
            keywords: 키워드 리스트
            rate_limiter: Rate limiter
            callback: WebSocket 콜백

        Returns:
            통계 딕셔너리 {saved_count, detail_crawled_count, detail_failed_count}
        """
        await self.send_event(callback, "log", {
            "source_id": self.source_id,
            "message": "========== Phase 2: 상세 페이지 크롤링 + 실시간 저장 =========="
        })

        # Initialize Phase 2 progress tracking
        self.status["total"] = len(notice_rows)
        self.status["progress"] = 0
        detail_crawled_count = 0
        detail_failed_count = 0
        saved_count = 0
        keyword_filtered_count = 0  # 키워드 매칭 실패로 필터링된 공고 수

        # HTTP Session 생성
        import requests
        session = requests.Session()
        session.headers.update({
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        })

        # DB 세션 생성 (실시간 저장용)
        db = SessionLocal()

        try:
            for idx, notice_row in enumerate(notice_rows, 1):
                # 중단 체크
                if self.stop_flag_checker():
                    await self.send_event(callback, "stopped", {
                        "source_id": self.source_id,
                        "message": "데이터 수집이 사용자에 의해 중단되었습니다."
                    })
                    self.status["status"] = CrawlerStatus.STOPPED
                    break

                # 로그
                matched_keywords = self.match_keywords(notice_row['title'], keywords)
                if matched_keywords:
                    await self.send_event(callback, "log", {
                        "source_id": self.source_id,
                        "message": f"[{idx}/{len(notice_rows)}] 상세 크롤링: {notice_row['title'][:50]}..."
                    })

                # 개별 공고 처리
                is_saved, crawled_detail = await self._process_single_notice(
                    notice_row,
                    keywords,
                    session,
                    rate_limiter,
                    db,
                    callback
                )

                if is_saved:
                    saved_count += 1
                else:
                    # 키워드 매칭 실패로 필터링됨
                    keyword_filtered_count += 1

                if crawled_detail:
                    detail_crawled_count += 1
                elif matched_keywords and not crawled_detail:
                    detail_failed_count += 1

                # Update progress
                self.status["progress"] += 1
                await self.send_event(callback, "progress", {
                    "source_id": self.source_id,
                    "progress": self.status["progress"],
                    "total": self.status["total"],
                    "success": saved_count,
                    "failed": detail_failed_count,
                    "percentage": int((self.status["progress"] / self.status["total"]) * 100) if self.status["total"] > 0 else 0
                })

                # WebSocket flush
                await asyncio.sleep(0)

            # Phase 2 완료 로그
            await self.send_event(callback, "log", {
                "source_id": self.source_id,
                "message": "=========================================="
            })

            await self.send_event(callback, "log", {
                "source_id": self.source_id,
                "message": f"Phase 2 완료 통계:"
            })

            await self.send_event(callback, "log", {
                "source_id": self.source_id,
                "message": f"  • 총 처리: {len(notice_rows)}개"
            })

            await self.send_event(callback, "log", {
                "source_id": self.source_id,
                "message": f"  • 키워드 매칭: {saved_count}개"
            })

            await self.send_event(callback, "log", {
                "source_id": self.source_id,
                "message": f"  • 키워드 필터링: {keyword_filtered_count}개"
            })

            await self.send_event(callback, "log", {
                "source_id": self.source_id,
                "message": f"  • 상세 크롤링 성공: {detail_crawled_count}개"
            })

            await self.send_event(callback, "log", {
                "source_id": self.source_id,
                "message": f"  • 상세 크롤링 실패: {detail_failed_count}개"
            })

            await self.send_event(callback, "log", {
                "source_id": self.source_id,
                "message": "=========================================="
            })

            return {
                'saved_count': saved_count,
                'detail_crawled_count': detail_crawled_count,
                'detail_failed_count': detail_failed_count,
                'keyword_filtered_count': keyword_filtered_count
            }

        except Exception as e:
            db.rollback()
            raise e
        finally:
            db.close()
