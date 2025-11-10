"""
JBTP Local Adapter
전북테크노파크 사업공고 크롤러 (7-column table with deadline)
"""

from typing import Dict, Optional
from .jbtp_base import JBTPBaseAdapter


class JBTPLocalAdapter(JBTPBaseAdapter):
    """
    JBTP 사업공고 어댑터

    전북테크노파크의 사업공고를 수집합니다.

    테이블 구조 (7 columns):
    [번호] [제목] [마감일] [파일] [작성자] [작성일] [조회]
    """

    # 사업공고는 항상 전북테크노파크가 발행 기관
    DEFAULT_ORGANIZATION = '(재)전북테크노파크'

    def __init__(self):
        super().__init__("source:jbtp:local")

    def parse_table_row(self, row) -> Optional[Dict[str, str]]:
        """
        사업공고 테이블 행 파싱

        Column structure:
        0: 번호
        1: 제목 (with <a> tag)
        2: 마감일 (YYYY-MM-DD HH:MM-D-X)
        3: 파일
        4: 작성자
        5: 작성일 (YYYY-MM-DD)
        6: 조회
        """
        cols = row.find_all('td')

        if len(cols) < 7:
            return None

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

        # Extract dates
        deadline = cols[2].get_text(strip=True)  # May include "-D-X" suffix
        posted_date = cols[5].get_text(strip=True)

        return {
            'title': title,
            'link': link,
            'posted_date': posted_date,
            'deadline': deadline
        }

    def get_organization(self, notice_data: dict, detail: dict) -> str:
        """
        사업공고의 발행 기관을 반환합니다.

        사업공고는 항상 전북테크노파크가 발행하므로 고정값을 반환합니다.

        Args:
            notice_data: 테이블에서 파싱한 공고 데이터 (사용 안 함)
            detail: 상세 페이지에서 추출한 데이터 (사용 안 함)

        Returns:
            "(재)전북테크노파크"
        """
        return self.DEFAULT_ORGANIZATION
