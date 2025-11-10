"""
JBTP External Adapter
JBTP 유관기관공고 크롤러 (6-column table WITHOUT deadline)
"""

from typing import Dict, Optional
from .jbtp_base import JBTPBaseAdapter


class JBTPExternalAdapter(JBTPBaseAdapter):
    """
    JBTP 유관기관공고 어댑터

    JBTP 웹사이트의 유관기관공고 게시판에서 공고를 수집합니다.

    테이블 구조 (6 columns):
    [번호] [제목] [파일] [작성자] [등록일] [조회수]
    """

    def __init__(self):
        super().__init__("source:jbtp:external")

    def parse_table_row(self, row) -> Optional[Dict[str, str]]:
        """
        유관기관공고 테이블 행 파싱

        Column structure:
        0: 번호
        1: 제목 (with <a> tag)
        2: 파일
        3: 작성자 (각 공고의 발행 기관)
        4: 등록일 (YYYY-MM-DD)
        5: 조회수
        """
        cols = row.find_all('td')

        if len(cols) < 6:
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

        # Extract writer (발행 기관) from column 3
        writer = cols[3].get_text(strip=True)

        # NO deadline column in this board!
        posted_date = cols[4].get_text(strip=True)

        return {
            'title': title,
            'link': link,
            'posted_date': posted_date,
            'deadline': '',  # No deadline column
            'writer': writer  # 발행 기관 정보
        }

    def get_organization(self, notice_data: dict, detail: dict) -> Optional[str]:
        """
        유관기관공고의 발행 기관을 반환합니다.

        테이블의 작성자 컬럼 또는 상세 페이지에서 추출한 작성자 정보를 사용합니다.

        Args:
            notice_data: 테이블에서 파싱한 공고 데이터 (writer 포함)
            detail: 상세 페이지에서 추출한 데이터 (writer 포함)

        Returns:
            발행 기관명 (예: "한국산업기술진흥원", "중소벤처기업부" 등)
            또는 None (기관 정보 없음)
        """
        # 우선순위: 테이블의 writer > 상세 페이지의 writer
        return notice_data.get('writer') or detail.get('writer')
