"""
JBTP Events Adapter
전북테크노파크 교육/행사 크롤러
"""

from typing import Dict, Optional
from .jbtp_base import JBTPBaseAdapter


class JBTPEventsAdapter(JBTPBaseAdapter):
    """
    JBTP 교육/행사 어댑터

    전북테크노파크의 교육/행사 정보를 수집합니다.

    테이블 구조 (6 columns, assumed - similar to external):
    [번호] [제목] [파일] [작성자] [등록일] [조회수]

    TODO: Verify actual HTML structure if events board behaves differently
    """

    # 교육/행사는 항상 전북테크노파크가 발행 기관
    DEFAULT_ORGANIZATION = '(재)전북테크노파크'

    def __init__(self):
        super().__init__("source:jbtp:events")

    def parse_table_row(self, row) -> Optional[Dict[str, str]]:
        """
        교육/행사 테이블 행 파싱

        ASSUMED Column structure (similar to external board):
        0: 번호
        1: 제목 (with <a> tag)
        2: 파일
        3: 작성자
        4: 등록일 (YYYY-MM-DD)
        5: 조회수

        TODO: Manually verify if the actual structure differs
        """
        cols = row.find_all('td')

        # Try 6-column structure first (similar to external)
        if len(cols) >= 6:
            # Find title column (has <a> tag)
            title_tag = cols[1].find('a')
            if not title_tag:
                return None

            title = title_tag.get_text(strip=True)
            link = title_tag.get('href', '')

            # Convert to absolute URL
            if link and not link.startswith('http'):
                if link.startswith('/'):
                    link = 'https://www.jbtp.or.kr' + link
                else:
                    link = 'https://www.jbtp.or.kr/' + link

            # Assume no deadline column (similar to external)
            posted_date = cols[4].get_text(strip=True)

            return {
                'title': title,
                'link': link,
                'posted_date': posted_date,
                'deadline': ''  # Assumed no deadline
            }

        # Fallback: Try 7-column structure with deadline (if events have deadlines)
        elif len(cols) >= 7:
            title_tag = cols[1].find('a')
            if not title_tag:
                return None

            title = title_tag.get_text(strip=True)
            link = title_tag.get('href', '')

            if link and not link.startswith('http'):
                if link.startswith('/'):
                    link = 'https://www.jbtp.or.kr' + link
                else:
                    link = 'https://www.jbtp.or.kr/' + link

            return {
                'title': title,
                'link': link,
                'posted_date': cols[5].get_text(strip=True),
                'deadline': cols[2].get_text(strip=True)
            }

        return None

    def get_organization(self, notice_data: dict, detail: dict) -> str:
        """
        교육/행사의 발행 기관을 반환합니다.

        교육/행사는 항상 전북테크노파크가 주최하므로 고정값을 반환합니다.

        Args:
            notice_data: 테이블에서 파싱한 공고 데이터 (사용 안 함)
            detail: 상세 페이지에서 추출한 데이터 (사용 안 함)

        Returns:
            "(재)전북테크노파크"
        """
        return self.DEFAULT_ORGANIZATION
