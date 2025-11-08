"""
Bizinfo Notice Saver
공고를 CrawlQueue에 저장하는 로직
"""

from datetime import datetime
from typing import List, Optional, Tuple

from src.models.notice import CrawlQueue
from src.services.utils.crawler_utils import parse_date


class BizinfoNoticeSaver:
    """Bizinfo 공고 저장 헬퍼 클래스"""

    def __init__(self, source_id: str):
        self.source_id = source_id

    def save_single_notice(
        self,
        notice: dict,
        keywords: List[str],
        db,
        keyword_matcher_func
    ) -> Tuple[str, List[str], Optional[CrawlQueue]]:
        """
        단일 공고를 notice_crawl_queue에 저장합니다.

        Args:
            notice: 공고 데이터
            keywords: 키워드 리스트
            db: 데이터베이스 세션
            keyword_matcher_func: 키워드 매칭 함수 (BaseCrawler.match_keywords)

        Returns:
            tuple[str, list, Optional[CrawlQueue]]: (상태, 매칭된 키워드 리스트, 저장된 객체)
            상태: 'added', 'updated', 'rejected', 'duplicate', 'no_match'
        """
        title = notice['title']

        # 키워드 매칭 확인
        matched_keywords = []
        if keywords:
            matched_keywords = keyword_matcher_func(title, keywords)

        # 1. 이미 존재하는지 확인 (title + crawler_source_id로 중복 체크)
        existing = db.query(CrawlQueue).filter(
            CrawlQueue.crawler_source_id == self.source_id,
            CrawlQueue.title == title,
            CrawlQueue.notice_id.is_(None)
        ).first()

        if existing:
            # 2. 거부된 항목이면 스킵
            if existing.rejection_status == 'rejected':
                return ('rejected', matched_keywords, None)

            # 3. 기존 항목 업데이트
            self._update_existing_item(existing, notice, matched_keywords)
            return ('updated', matched_keywords, existing)
        else:
            # 4. 새로운 항목 추가
            return self._create_new_item(notice, matched_keywords, db)

    def _update_existing_item(
        self,
        existing: CrawlQueue,
        notice: dict,
        matched_keywords: List[str]
    ) -> None:
        """기존 공고 항목 업데이트"""
        existing.link = notice.get('link')
        existing.source_board_name = notice.get('board')
        existing.raw_data = notice
        existing.matched_keywords = matched_keywords
        existing.crawler_extracted_at = datetime.now()
        # Update parsed fields with proper date parsing
        existing.deadline = self._parse_deadline(notice.get('deadline'))
        existing.published_date = self._parse_published_date(notice.get('published_date'))
        existing.organization = notice.get('organization')
        existing.department = notice.get('department')
        existing.contact = notice.get('contact')
        existing.views = self._parse_views(notice.get('views', 0))
        existing.status = notice.get('status')

    def _create_new_item(
        self,
        notice: dict,
        matched_keywords: List[str],
        db
    ) -> Tuple[str, List[str], Optional[CrawlQueue]]:
        """새로운 공고 항목 생성"""
        try:
            queue_item = CrawlQueue(
                crawler_source_id=self.source_id,
                title=notice['title'],
                link=notice.get('link'),
                source_board_name=notice.get('board'),
                raw_data=notice,
                matched_keywords=matched_keywords,
                crawler_extracted_at=datetime.now(),
                rejection_status=None,
                # Structured fields with proper parsing
                deadline=self._parse_deadline(notice.get('deadline')),
                published_date=self._parse_published_date(notice.get('published_date')),
                organization=notice.get('organization'),
                department=notice.get('department'),
                contact=notice.get('contact'),
                views=self._parse_views(notice.get('views', 0)),
                status=notice.get('status')
            )
            db.add(queue_item)
            db.flush()
            return ('added', matched_keywords, queue_item)
        except Exception as e:
            db.rollback()
            print(f"Item likely updated by trigger: {notice['title'][:50]}...")
            return ('updated', matched_keywords, None)

    def _parse_deadline(self, deadline_value) -> Optional[datetime]:
        """deadline 값 파싱"""
        if not deadline_value:
            return None
        if isinstance(deadline_value, datetime):
            return deadline_value
        return parse_date(deadline_value)

    def _parse_published_date(self, published_value) -> Optional[datetime]:
        """published_date 값 파싱 (date 타입으로 변환)"""
        if not published_value:
            return None
        if isinstance(published_value, datetime):
            return published_value.date()
        parsed = parse_date(published_value)
        return parsed.date() if parsed else None

    def _parse_views(self, views_value) -> int:
        """views 값 파싱"""
        try:
            return int(views_value) if views_value else 0
        except (ValueError, TypeError):
            return 0
