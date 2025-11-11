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

    테이블 구조 (9 columns):
    [번호] [사업구분] [제목] [마감일] [파일] [작성자] [작성일] [조회수] [공백]
    """

    # 교육/행사는 항상 전북테크노파크가 발행 기관
    DEFAULT_ORGANIZATION = '(재)전북테크노파크'

    def __init__(self):
        super().__init__("source:jbtp:events")

    def parse_table_row(self, row) -> Optional[Dict[str, str]]:
        """
        교육/행사 테이블 행 파싱

        Column structure (9 columns):
        0: 번호
        1: 사업구분 (교육/행사/기타)
        2: 제목 (with <a> tag)
        3: 마감일
        4: 파일
        5: 비어있음
        6: 작성자
        7: 작성일 (YYYY-MM-DD)
        8: 조회수
        """
        cols = row.find_all('td')

        # Events board has 9 columns
        if len(cols) < 8:
            return None

        # Find title column (index 2, has <a> tag)
        title_tag = cols[2].find('a')
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

        # Extract deadline (index 3) and posted date (index 7)
        deadline = cols[3].get_text(strip=True)
        posted_date = cols[7].get_text(strip=True)

        return {
            'title': title,
            'link': link,
            'posted_date': posted_date,
            'deadline': deadline
        }

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
