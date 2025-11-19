"""
Crawl Queue Repository
크롤링 큐 데이터 저장을 담당하는 저장소
"""

from datetime import datetime
from typing import List, Optional

from src.core.database import SessionLocal
from src.models.notice import CrawlQueue, Notice
from src.services.sources.services.keyword_service import KeywordService
from src.services.utils.crawler_utils import parse_date


class CrawlQueueRepository:
    """
    크롤링 큐 저장소

    CrawlQueue에 대한 모든 데이터베이스 작업을 중앙화합니다.
    """

    @staticmethod
    def find_existing(
        source_id: str,
        title: str
    ) -> Optional[CrawlQueue]:
        """
        기존 항목 찾기 (title + source_id, notice_id가 NULL인 것만)

        Args:
            source_id: 크롤러 소스 ID
            title: 공고 제목

        Returns:
            기존 항목 또는 None
        """
        session = SessionLocal()
        try:
            return session.query(CrawlQueue).filter(
                CrawlQueue.crawler_source_id == source_id,
                CrawlQueue.title == title,
                CrawlQueue.published_notice_id.is_(None)
            ).first()
        finally:
            session.close()

    @staticmethod
    def is_rejected(item: CrawlQueue) -> bool:
        """
        항목이 거부되었는지 확인

        Args:
            item: CrawlQueue 항목

        Returns:
            거부되었으면 True
        """
        return item and item.approval_status == 'rejected'

    @staticmethod
    def is_already_registered(source_id: str, title: str) -> bool:
        """
        Notice 테이블에 이미 등록된 공고인지 확인

        Args:
            source_id: 크롤러 소스 ID
            title: 공고 제목

        Returns:
            이미 등록되어 있으면 True
        """
        session = SessionLocal()
        try:
            existing = session.query(Notice).filter(
                Notice.crawler_source_id == source_id,
                Notice.title == title
            ).first()
            return existing is not None
        finally:
            session.close()

    @staticmethod
    def save_results(
        notices: List[dict],
        keywords: List[str],
        source_id: str
    ) -> dict:
        """
        크롤링 결과를 CrawlQueue에 저장합니다.

        이미 등록된 공고, 중복 및 거부된 항목은 스킵합니다.
        키워드 필터링: keywords가 있으면, 제목에 키워드가 포함된 공고만 저장합니다.

        Args:
            notices: 공고 리스트
            keywords: 키워드 리스트
            source_id: 크롤러 소스 ID

        Returns:
            저장 통계 dict
        """
        session = SessionLocal()
        stats = {
            'added': 0,
            'updated': 0,
            'skipped_rejected': 0,
            'skipped_filtered': 0,
            'skipped_registered': 0
        }

        try:
            print(f"\n[{source_id}] save_results 시작")
            print(f"  - 공고 개수: {len(notices)}")
            print(f"  - 키워드: {keywords}")

            for notice in notices:
                title = notice['title']
                print(f"\n  처리 중: {title[:50]}...")

                # 1. 키워드 필터링
                matched_keywords = []
                if keywords:
                    matched_keywords = KeywordService.match_keywords(title, keywords)
                    if not matched_keywords:
                        print(f"    → 키워드 매칭 안됨, 스킵")
                        stats['skipped_filtered'] += 1
                        continue
                    print(f"    → 매칭된 키워드: {matched_keywords}")

                # 2. 기존 CrawlQueue 항목 확인
                existing = CrawlQueueRepository.find_existing(source_id, title)
                print(f"    → 기존 큐 항목 존재 여부: {existing is not None}")

                if existing:
                    # 3. 거부된 항목이면 스킵
                    if CrawlQueueRepository.is_rejected(existing):
                        print(f"    → 거부된 항목, 스킵")
                        stats['skipped_rejected'] += 1
                        continue

                    # 4. 기존 항목 업데이트
                    print(f"    → 기존 항목 업데이트 (ID: {existing.id})")
                    CrawlQueueRepository._update_item(existing, notice, matched_keywords)
                    stats['updated'] += 1
                else:
                    # 5. 새로운 항목 추가
                    try:
                        print(f"    → 신규 항목 추가 시도")
                        CrawlQueueRepository._create_item(
                            session,
                            source_id,
                            notice,
                            matched_keywords
                        )
                        stats['added'] += 1
                        print(f"    → 신규 항목 추가 성공!")
                    except Exception as error:
                        # 트리거에 의한 중복 업데이트인 경우 무시
                        print(f"    → 예외 발생: {str(error)}")
                        session.rollback()
                        stats['updated'] += 1
                        continue

            print(f"\n  commit 전 상태: 신규={stats['added']}, 업데이트={stats['updated']}")
            session.commit()
            print(f"  commit 성공!")

            print(f"[{source_id}] 저장 완료: 신규={stats['added']}, "
                  f"업데이트={stats['updated']}, 키워드 필터={stats['skipped_filtered']}, "
                  f"거부됨 스킵={stats['skipped_rejected']}, 이미 등록됨 스킵={stats['skipped_registered']}")

            return stats

        except Exception as error:
            print(f"Error saving crawl results: {str(error)}")
            session.rollback()
            raise
        finally:
            session.close()

    @staticmethod
    def _update_item(
        existing: CrawlQueue,
        notice: dict,
        matched_keywords: List[str]
    ) -> None:
        """기존 항목 업데이트"""
        existing.source_url = notice.get('link')
        existing.source_board_name = notice.get('board')
        existing.raw_data = notice.get('raw_data', notice)
        existing.crawler_extracted_at = datetime.now()

        # 구조화된 필드 업데이트
        CrawlQueueRepository._set_deadline(existing, notice.get('deadline'))
        CrawlQueueRepository._set_published_date(existing, notice.get('published_date'))

        existing.organization = notice.get('organization')
        existing.department = notice.get('department')
        existing.contact_info = notice.get('contact')
        existing.source_view_count = CrawlQueueRepository._parse_views(notice.get('views', 0))
        existing.source_status = notice.get('status')
        existing.matched_keywords = matched_keywords
        existing.suggested_tags = []

    @staticmethod
    def _create_item(
        session,
        source_id: str,
        notice: dict,
        matched_keywords: List[str]
    ) -> None:
        """새 항목 생성"""
        deadline = CrawlQueueRepository._parse_deadline(notice.get('deadline'))
        published_date = CrawlQueueRepository._parse_published_date(
            notice.get('published_date')
        )
        views = CrawlQueueRepository._parse_views(notice.get('views', 0))

        queue_item = CrawlQueue(
            crawler_source_id=source_id,
            title=notice['title'],
            source_url=notice.get('link'),
            source_board_name=notice.get('board'),
            raw_data=notice.get('raw_data', notice),
            crawler_extracted_at=datetime.now(),
            approval_status='pending',
            application_deadline=deadline,
            source_published_date=published_date.date() if published_date else None,
            organization=notice.get('organization'),
            department=notice.get('department'),
            contact_info=notice.get('contact'),
            source_view_count=views,
            source_status=notice.get('status'),
            matched_keywords=matched_keywords,
            suggested_tags=[]
        )

        session.add(queue_item)
        session.flush()

    @staticmethod
    def _set_deadline(item: CrawlQueue, deadline_value) -> None:
        """application_deadline 필드 설정"""
        if deadline_value:
            if isinstance(deadline_value, datetime):
                item.application_deadline = deadline_value
            else:
                item.application_deadline = parse_date(deadline_value)
        else:
            item.application_deadline = None

    @staticmethod
    def _set_published_date(item: CrawlQueue, published_value) -> None:
        """source_published_date 필드 설정"""
        if published_value:
            if isinstance(published_value, datetime):
                item.source_published_date = published_value.date()
            else:
                parsed = parse_date(published_value)
                item.source_published_date = parsed.date() if parsed else None
        else:
            item.source_published_date = None

    @staticmethod
    def _parse_deadline(deadline_value) -> Optional[datetime]:
        """deadline 값 파싱"""
        if not deadline_value:
            return None
        if isinstance(deadline_value, datetime):
            return deadline_value
        return parse_date(deadline_value)

    @staticmethod
    def _parse_published_date(published_value) -> Optional[datetime]:
        """published_date 값 파싱"""
        if not published_value:
            return None
        if isinstance(published_value, datetime):
            return published_value
        return parse_date(published_value)

    @staticmethod
    def _parse_views(views_value) -> int:
        """views 값 파싱"""
        try:
            return int(views_value) if views_value else 0
        except (ValueError, TypeError):
            return 0
