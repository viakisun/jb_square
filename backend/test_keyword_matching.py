#!/usr/bin/env python3
"""
키워드 매칭 효과 테스트
확장 전후 키워드로 매칭되는 공고 수를 비교합니다.
"""

import requests
from bs4 import BeautifulSoup
from datetime import datetime, timedelta
import re
from typing import List, Dict

# ============================================
# 설정
# ============================================

BUSINESS_BOARD_URL = "https://www.jbtp.or.kr/board/list.jbtp?boardId=BBS_0000006&menuCd=DOM_000000102001000000&paging=ok"
EXTERNAL_BOARD_URL = "https://www.jbtp.or.kr/board/list.jbtp?boardId=BBS_0000007&listRow=10&listCel=1&menuCd=DOM_000000102002000000&paging=ok"

DATE_RANGE_DAYS = 30  # 최근 30일만 테스트
MAX_PAGES = 3  # 테스트용으로 3페이지만

# 확장 전 키워드
OLD_BUSINESS_KEYWORDS = [
    "바이오", "bio", "생명공학", "제약", "의료기기",
    "헬스케어", "healthcare", "바이오헬스",
    "의약품", "임상", "진단", "치료제",
    "스타트업", "창업", "R&D", "연구개발",
    "기술개발", "사업화", "실증", "특허",
    "중소기업", "벤처", "예비창업", "초기창업",
    "시제품", "테스트베드"
]

OLD_EXTERNAL_KEYWORDS = [
    "바이오", "bio", "생명공학", "제약", "의료기기",
    "헬스케어", "healthcare", "바이오헬스",
    "의약품", "임상", "진단", "치료제"
]

# 확장 후 키워드 (현재)
NEW_BUSINESS_KEYWORDS = [
    "바이오", "bio", "생명공학", "제약", "의료기기",
    "헬스케어", "healthcare", "바이오헬스",
    "의약품", "임상", "진단", "치료제",
    "스타트업", "창업", "R&D", "연구개발",
    "기술개발", "사업화", "실증", "특허",
    "중소기업", "벤처", "예비창업", "초기창업",
    "시제품", "테스트베드",
    "인공지능", "AI", "디지털", "디지털헬스",
    "농생명", "식품", "농업", "농산물", "농식품",
    "ICT", "IoT", "첨단", "혁신",
    "이차전지"
]

NEW_EXTERNAL_KEYWORDS = [
    "바이오", "bio", "생명공학", "제약", "의료기기",
    "헬스케어", "healthcare", "바이오헬스",
    "의약품", "임상", "진단", "치료제",
    "인공지능", "AI", "디지털", "디지털헬스",
    "농생명", "식품", "농업", "농산물", "농식품",
    "ICT", "IoT", "전자",
    "이차전지", "반도체",
    "스타트업", "창업", "R&D", "연구개발",
    "기술개발", "사업화"
]

# ============================================
# 크롤링 함수
# ============================================

def parse_date(date_str: str) -> datetime:
    """날짜 문자열을 datetime 객체로 변환"""
    try:
        date_str = date_str.replace('.', '-').strip()
        return datetime.strptime(date_str, '%Y-%m-%d')
    except:
        return None


def crawl_board(board_url: str, board_name: str, is_external: bool = False) -> List[Dict]:
    """특정 게시판의 공고를 크롤링"""
    print(f"\n[{board_name}] 크롤링 중...")

    session = requests.Session()
    session.headers.update({
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9',
        'Accept-Language': 'ko-KR,ko;q=0.9,en-US;q=0.8,en;q=0.7',
    })

    cutoff_date = datetime.now() - timedelta(days=DATE_RANGE_DAYS)
    notices = []
    seen_titles = set()
    found_old_notices = False
    page = 1

    while not found_old_notices and page <= MAX_PAGES:
        if '?' in board_url:
            page_url = f"{board_url}&pageNo={page}"
        else:
            page_url = f"{board_url}?pageNo={page}"

        try:
            response = session.get(page_url, timeout=10)
            if response.status_code != 200:
                break

            soup = BeautifulSoup(response.text, 'html.parser')
            table = soup.find('table')
            if not table:
                break

            tbody = table.find('tbody')
            if tbody:
                rows = tbody.find_all('tr')
            else:
                rows = table.find_all('tr')

            for row in rows:
                cols = row.find_all('td')
                min_cols = 5 if is_external else 7

                if len(cols) >= min_cols:
                    title_col = None
                    for col in cols:
                        if col.find('a'):
                            title_col = col
                            break

                    if title_col:
                        title_tag = title_col.find('a')
                        if title_tag:
                            title = title_tag.get_text(strip=True)

                            if title in seen_titles:
                                continue
                            seen_titles.add(title)

                            if is_external:
                                posted_date = cols[4].get_text(strip=True) if len(cols) > 4 else ''
                            else:
                                posted_date = cols[6].get_text(strip=True) if len(cols) > 6 else ''

                            posted_datetime = parse_date(posted_date)
                            if posted_datetime and posted_datetime < cutoff_date:
                                found_old_notices = True
                                break

                            notices.append({
                                'title': title,
                                'posted_date': posted_date,
                                'board_name': board_name
                            })

            page += 1

        except Exception as e:
            print(f"오류: {e}")
            break

    print(f"  → {len(notices)}개 수집")
    return notices


# ============================================
# 키워드 매칭 함수
# ============================================

def match_keywords(title: str, keywords: List[str]) -> List[str]:
    """제목에서 매칭되는 키워드 찾기"""
    matched = []
    title_lower = title.lower()

    for keyword in keywords:
        keyword_lower = keyword.lower()
        if keyword_lower in title_lower:
            matched.append(keyword)

    return matched


def test_keywords(notices: List[Dict], old_keywords: List[str], new_keywords: List[str], board_name: str):
    """키워드 매칭 효과 테스트"""
    print(f"\n{'='*60}")
    print(f"[{board_name}] 키워드 매칭 효과 테스트")
    print(f"{'='*60}\n")

    old_matched_count = 0
    new_matched_count = 0
    newly_matched = []

    for notice in notices:
        title = notice['title']

        old_match = match_keywords(title, old_keywords)
        new_match = match_keywords(title, new_keywords)

        if old_match:
            old_matched_count += 1

        if new_match:
            new_matched_count += 1

            # 확장 전에는 안 매칭되었지만 확장 후 매칭된 공고
            if not old_match:
                newly_matched.append({
                    'title': title,
                    'keywords': new_match
                })

    print(f"총 공고 수: {len(notices)}개")
    print(f"\n확장 전 매칭: {old_matched_count}개 ({old_matched_count/len(notices)*100:.1f}%)")
    print(f"확장 후 매칭: {new_matched_count}개 ({new_matched_count/len(notices)*100:.1f}%)")
    print(f"신규 매칭: {len(newly_matched)}개")

    if newly_matched:
        print(f"\n신규 매칭 공고 (최대 10개):")
        print("-" * 60)
        for i, item in enumerate(newly_matched[:10], 1):
            print(f"{i:2d}. [{', '.join(item['keywords'])}] {item['title']}")


# ============================================
# 메인 실행
# ============================================

def main():
    """메인 실행 함수"""
    print("\n" + "=" * 60)
    print("JBTP 키워드 확장 효과 테스트")
    print("=" * 60)
    print(f"테스트 기간: 최근 {DATE_RANGE_DAYS}일")
    print(f"페이지 수: {MAX_PAGES}페이지")

    # 1. 데이터 수집
    print("\n" + "=" * 60)
    print("1단계: 데이터 수집")
    print("=" * 60)

    business_notices = crawl_board(BUSINESS_BOARD_URL, "사업공고", is_external=False)
    external_notices = crawl_board(EXTERNAL_BOARD_URL, "유관기관공고", is_external=True)

    # 2. 키워드 매칭 테스트
    print("\n" + "=" * 60)
    print("2단계: 키워드 매칭 효과 분석")
    print("=" * 60)

    test_keywords(business_notices, OLD_BUSINESS_KEYWORDS, NEW_BUSINESS_KEYWORDS, "사업공고")
    test_keywords(external_notices, OLD_EXTERNAL_KEYWORDS, NEW_EXTERNAL_KEYWORDS, "유관기관공고")

    print("\n" + "=" * 60)
    print("테스트 완료")
    print("=" * 60)


if __name__ == "__main__":
    main()
