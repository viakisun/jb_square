"""
JBTP Local Adapter
전북테크노파크 사업공고 크롤러 (7-column table with deadline)
"""

import requests
from typing import Dict, Optional, List
from datetime import datetime, timedelta
from bs4 import BeautifulSoup
from .jbtp_base import JBTPBaseAdapter
from src.services.utils.crawler_utils import parse_date


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

        Column structure (8 columns):
        0: 번호
        1: 제목 (with <a> tag)
        2: 마감일 (YYYY-MM-DD HH:MM-D-X)
        3: 파일 (empty)
        4: 파일 (empty)
        5: 작성자
        6: 작성일 (YYYY-MM-DD)
        7: 조회
        """
        cols = row.find_all('td')

        if len(cols) < 8:
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

        # Extract dates
        deadline = cols[2].get_text(strip=True)  # May include "-D-X" suffix
        posted_date = cols[6].get_text(strip=True)  # Fixed: column 6, not 5

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
            # 설정 조회
            from .repositories import ConfigRepository
            config = ConfigRepository.get_config(self.source_id)
            if not config:
                return []

            keywords = self.get_keywords() if apply_keyword_filter else []
            # Use 'board_url' if available, otherwise use 'url' field
            board_url = config.get('board_url') or config.get('url', 'https://www.jbtp.or.kr/board/list.jbtp?boardId=BBS_0000006')

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
                    deadline = parsed_row.get('deadline', '')

                    # 날짜 필터링
                    posted_datetime = parse_date(posted_date)
                    deadline_datetime = parse_date(deadline) if deadline else None

                    should_collect = False
                    if posted_datetime and posted_datetime >= cutoff_date:
                        should_collect = True
                    elif deadline_datetime and deadline_datetime >= now:
                        should_collect = True

                    if not should_collect:
                        continue

                    # 키워드 필터링
                    matched_keywords = []
                    if apply_keyword_filter:
                        matched_keywords = self.match_keywords(title, keywords)
                        if not matched_keywords:
                            continue

                    # 공고 추가
                    notice_preview = {
                        'title': title,
                        'published_date': posted_date,
                        'source': 'JBTP',
                        'board': '지자체 사업공고',
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
            print(f"[JBTPLocalAdapter] get_notices_preview 오류: {str(e)}")
            import traceback
            traceback.print_exc()
            return []
