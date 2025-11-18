"""
JBTP External Adapter
JBTP 유관기관공고 크롤러 (6-column table WITHOUT deadline)
"""

import re
import requests
from typing import Dict, Optional, List
from datetime import datetime, timedelta
from bs4 import BeautifulSoup
from .jbtp_base import JBTPBaseAdapter
from src.services.utils.crawler_utils import parse_date


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
        if title_tag is None:
            return None

        title = title_tag.get_text(strip=True)
        link = title_tag.get('href', '')

        # Convert to absolute URL
        if link and not link.startswith('http'):
            if link.startswith('/'):
                link = 'https://www.jbtp.or.kr' + link
            else:
                link = 'https://www.jbtp.or.kr/' + link

        # NO deadline column in this board!
        posted_date = cols[4].get_text(strip=True)

        return {
            'title': title,
            'link': link,
            'posted_date': posted_date,
            'deadline': ''  # No deadline column
        }

    def get_organization(self, notice_data: dict, detail: dict) -> Optional[str]:
        """
        유관기관공고의 발행 기관을 반환합니다.

        제목에서 [기관명] 형식으로 된 발행 기관을 추출합니다.
        예: "[한국산업기술진흥원] 2025년 사업 공고" -> "한국산업기술진흥원"

        Args:
            notice_data: 테이블에서 파싱한 공고 데이터 (title 포함)
            detail: 상세 페이지에서 추출한 데이터 (full_title 포함)

        Returns:
            발행 기관명 (예: "한국산업기술진흥원", "중소벤처기업부" 등)
            또는 None (기관 정보 없음)
        """
        # 우선순위: 상세 페이지의 full_title > 테이블의 title
        title = detail.get('full_title') or notice_data.get('title', '')

        if not title:
            return None

        # 제목에서 [기관명] 패턴 추출
        match = re.match(r'^\[([^\]]+)\]', title)
        if match:
            return match.group(1)

        return None

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
                'board': str,  # 기관명 (제목에서 추출)
                'link': str,
                'matched_keywords': List[str]
            }]
        """
        try:
            # 설정 조회
            from .repositories import ConfigRepository
            config = ConfigRepository.get_config(self.source_id)
            if not config:
                return []

            keywords = self.get_keywords() if apply_keyword_filter else []
            board_url = config.get('board_url') or config.get('url', 'https://www.jbtp.or.kr/board/list.jbtp?boardId=BBS_0000007')

            # 날짜 필터 설정
            now = datetime.now()
            cutoff_date = now - timedelta(days=date_range_days)

            # HTTP 세션 생성
            session = requests.Session()
            session.headers.update({
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            })

            notices_preview = []
            page = 1
            MAX_PAGES = 20

            while len(notices_preview) < count and page <= MAX_PAGES:
                # 페이지 URL 생성
                if '?' in board_url:
                    page_url = f"{board_url}&startPage={page}"
                else:
                    page_url = f"{board_url}?startPage={page}"

                response = session.get(page_url, timeout=10)
                if response.status_code != 200:
                    break

                soup = BeautifulSoup(response.text, 'html.parser')
                table = soup.find('table')
                if not table:
                    break

                tbody = table.find('tbody')
                rows = tbody.find_all('tr') if tbody else table.find_all('tr')

                found_in_page = False
                for row in rows:
                    if len(notices_preview) >= count:
                        break

                    parsed_row = self.parse_table_row(row)
                    if not parsed_row:
                        continue

                    title = parsed_row['title']
                    link = parsed_row['link']
                    posted_date = parsed_row['posted_date']

                    # 날짜 필터링 (유관기관 공고는 마감일 없음, posted_date만 체크)
                    posted_datetime = parse_date(posted_date)
                    if not posted_datetime or posted_datetime < cutoff_date:
                        continue

                    # 키워드 필터링
                    matched_keywords = []
                    if apply_keyword_filter:
                        matched_keywords = self.match_keywords(title, keywords)
                        if not matched_keywords:
                            continue

                    # 기관명 추출 (제목에서 [기관명] 패턴)
                    organization = None
                    match = re.match(r'^\[([^\]]+)\]', title)
                    if match:
                        organization = match.group(1)

                    # 공고 추가
                    notice_preview = {
                        'title': title,
                        'published_date': posted_date,
                        'source': 'JBTP',
                        'board': organization or '유관기관 공고',
                        'link': link,
                        'matched_keywords': matched_keywords
                    }
                    notices_preview.append(notice_preview)
                    found_in_page = True

                # 페이지에서 하나도 못 찾았으면 중단
                if not found_in_page:
                    break

                page += 1

            return notices_preview

        except Exception as e:
            print(f"[JBTPExternalAdapter] get_notices_preview 오류: {str(e)}")
            import traceback
            traceback.print_exc()
            return []
