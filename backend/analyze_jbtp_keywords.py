#!/usr/bin/env python3
"""
JBTP 공고 키워드 분석 스크립트

전북테크노파크의 사업공고와 유관기관공고 1년치를 크롤링하여
최적의 키워드를 분석하고 추천합니다.
"""

import requests
from bs4 import BeautifulSoup
from datetime import datetime, timedelta
from collections import Counter
import re
import json
from typing import List, Dict, Tuple

# ============================================
# 설정
# ============================================

# 게시판 URL
BUSINESS_BOARD_URL = "https://www.jbtp.or.kr/board/list.jbtp?boardId=BBS_0000006&menuCd=DOM_000000102001000000&paging=ok"
EXTERNAL_BOARD_URL = "https://www.jbtp.or.kr/board/list.jbtp?boardId=BBS_0000007&listRow=10&listCel=1&menuCd=DOM_000000102002000000&paging=ok"

# 수집 기간 (365일)
DATE_RANGE_DAYS = 365
MAX_PAGES = 100  # 안전장치

# ============================================
# 크롤링 함수
# ============================================

def parse_date(date_str: str) -> datetime:
    """날짜 문자열을 datetime 객체로 변환"""
    try:
        # YYYY-MM-DD 또는 YYYY.MM.DD 형식
        date_str = date_str.replace('.', '-').strip()
        return datetime.strptime(date_str, '%Y-%m-%d')
    except:
        return None


def crawl_board(board_url: str, board_name: str, is_external: bool = False) -> List[Dict]:
    """특정 게시판의 공고를 크롤링"""
    print(f"\n{'='*60}")
    print(f"[{board_name}] 크롤링 시작...")
    print(f"URL: {board_url}")
    print(f"{'='*60}\n")

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
        # 페이지 URL 생성
        if '?' in board_url:
            page_url = f"{board_url}&pageNo={page}"
        else:
            page_url = f"{board_url}?pageNo={page}"

        try:
            print(f"  페이지 {page} 수집 중...", end=' ')
            response = session.get(page_url, timeout=10)

            if response.status_code != 200:
                print(f"❌ 실패 (상태 코드: {response.status_code})")
                break

            soup = BeautifulSoup(response.text, 'html.parser')

            # 테이블에서 공고 row 파싱
            table = soup.find('table')
            if not table:
                print("❌ 테이블 없음")
                break

            tbody = table.find('tbody')
            if tbody:
                rows = tbody.find_all('tr')
            else:
                rows = table.find_all('tr')

            page_notice_count = 0
            for row in rows:
                cols = row.find_all('td')

                # 유관기관공고는 6개 컬럼, 사업공고는 7개 컬럼
                min_cols = 5 if is_external else 7
                if len(cols) >= min_cols:
                    # 제목 컬럼 찾기
                    title_col = None
                    for col in cols:
                        if col.find('a'):
                            title_col = col
                            break

                    if title_col:
                        title_tag = title_col.find('a')
                        if title_tag:
                            title = title_tag.get_text(strip=True)

                            # 중복 체크
                            if title in seen_titles:
                                continue
                            seen_titles.add(title)

                            link = title_tag.get('href', '')
                            if link and not link.startswith('http'):
                                if link.startswith('/'):
                                    link = 'https://www.jbtp.or.kr' + link
                                else:
                                    link = 'https://www.jbtp.or.kr/' + link

                            if is_external:
                                # 유관기관공고: 번호(0), 제목(1), 파일(2), 작성자(3), 등록일(4), 조회수(5)
                                deadline = ''
                                posted_date = cols[4].get_text(strip=True) if len(cols) > 4 else ''
                            else:
                                # 사업공고: 마감일 추출 (컬럼 2), 작성일 (컬럼 6)
                                deadline = cols[2].get_text(strip=True) if len(cols) > 2 else ''
                                posted_date = cols[6].get_text(strip=True) if len(cols) > 6 else ''

                            # 날짜 체크
                            deadline_datetime = parse_date(deadline)
                            posted_datetime = parse_date(posted_date)

                            # 마감일 또는 작성일 기준으로 cutoff 체크
                            date_to_check = deadline_datetime or posted_datetime
                            if date_to_check and date_to_check < cutoff_date:
                                found_old_notices = True
                                break

                            notices.append({
                                'title': title,
                                'link': link,
                                'deadline': deadline,
                                'posted_date': posted_date,
                                'board_name': board_name
                            })
                            page_notice_count += 1

            print(f"✅ {page_notice_count}개 수집")

            if page_notice_count == 0:
                print("  → 더 이상 공고가 없습니다.")
                break

            page += 1

        except Exception as e:
            print(f"❌ 오류 발생: {e}")
            break

    print(f"\n[{board_name}] 총 {len(notices)}개 공고 수집 완료\n")
    return notices


# ============================================
# 텍스트 분석 함수
# ============================================

def extract_keywords(text: str) -> List[str]:
    """텍스트에서 키워드 추출 (간단한 명사 추출)"""
    # 한글, 영문, 숫자만 남기기
    text = re.sub(r'[^\w\s가-힣]', ' ', text)

    # 단어 분리 (2글자 이상)
    words = [w for w in text.split() if len(w) >= 2]

    return words


def analyze_keywords(notices: List[Dict], board_name: str) -> Dict:
    """공고 제목에서 키워드 빈도 분석"""
    print(f"\n{'='*60}")
    print(f"[{board_name}] 키워드 분석")
    print(f"{'='*60}\n")

    # 모든 제목 수집
    all_titles = [notice['title'] for notice in notices]

    # 키워드 추출
    all_keywords = []
    for title in all_titles:
        keywords = extract_keywords(title)
        all_keywords.extend(keywords)

    # 빈도 계산
    keyword_freq = Counter(all_keywords)

    # 상위 50개 키워드
    top_keywords = keyword_freq.most_common(50)

    print(f"총 키워드 수: {len(all_keywords)}")
    print(f"고유 키워드 수: {len(keyword_freq)}")
    print(f"\n상위 30개 키워드:")
    print("-" * 60)
    for i, (keyword, count) in enumerate(top_keywords[:30], 1):
        percentage = (count / len(notices)) * 100
        print(f"{i:2d}. {keyword:20s} : {count:4d}회 ({percentage:5.1f}%)")

    return {
        'total_notices': len(notices),
        'total_keywords': len(all_keywords),
        'unique_keywords': len(keyword_freq),
        'top_keywords': top_keywords,
        'all_titles': all_titles[:20]  # 샘플 20개
    }


def categorize_keywords(keyword_freq: List[Tuple[str, int]]) -> Dict:
    """키워드를 카테고리별로 분류"""
    categories = {
        '바이오/의료': ['바이오', 'bio', '생명', '생명공학', '제약', '의료', '의료기기',
                        '헬스케어', 'healthcare', '의약품', '임상', '진단', '치료제',
                        '유전자', 'DNA', 'RNA', '단백질', '백신', '세포', '조직',
                        '약물', '신약', '항체', '면역', '병원', '의학', '보건'],

        '농생명': ['농업', '농산물', '농식품', '식품', '축산', '수산', '양식',
                  '종자', '비료', '농기계', '스마트팜', '원예'],

        '디지털/IT': ['AI', '인공지능', '디지털', 'ICT', 'IoT', '빅데이터',
                     '클라우드', '소프트웨어', '앱', '플랫폼', 'SW', 'IT'],

        '창업/지원': ['창업', '스타트업', '벤처', '예비창업', '초기창업',
                     '기업', '중소기업', '소상공인', '청년', '여성'],

        'R&D/기술': ['R&D', '연구', '개발', '연구개발', '기술개발', '기술',
                    '혁신', '특허', '지식재산', '실증', '테스트베드',
                    '시제품', '프로토타입'],

        '사업화/투자': ['사업화', '상용화', '제품화', '투자', '펀딩', '자금',
                       '금융', '보증', '융자', '지원금', '보조금', '출연'],

        '수출/해외': ['수출', '해외', '글로벌', '국제', '해외진출', '수출입']
    }

    categorized = {cat: [] for cat in categories.keys()}
    categorized['기타'] = []

    for keyword, count in keyword_freq:
        found = False
        for cat, cat_keywords in categories.items():
            if any(ck in keyword.lower() or keyword.lower() in ck.lower()
                   for ck in cat_keywords):
                categorized[cat].append((keyword, count))
                found = True
                break
        if not found:
            categorized['기타'].append((keyword, count))

    return categorized


def recommend_keywords(business_analysis: Dict, external_analysis: Dict):
    """최적의 키워드 추천"""
    print(f"\n{'='*60}")
    print("키워드 추천")
    print(f"{'='*60}\n")

    # 카테고리별 분류
    print("=" * 60)
    print("카테고리별 키워드 분석")
    print("=" * 60)

    print("\n[사업공고]")
    business_cat = categorize_keywords(business_analysis['top_keywords'])
    for cat, keywords in business_cat.items():
        if keywords:
            print(f"\n{cat}:")
            for kw, count in keywords[:10]:
                print(f"  - {kw:20s} : {count:4d}회")

    print("\n" + "=" * 60)
    print("[유관기관공고]")
    external_cat = categorize_keywords(external_analysis['top_keywords'])
    for cat, keywords in external_cat.items():
        if keywords:
            print(f"\n{cat}:")
            for kw, count in keywords[:10]:
                print(f"  - {kw:20s} : {count:4d}회")

    # 현재 키워드
    current_business_keywords = [
        "바이오", "bio", "생명공학", "제약", "의료기기", "헬스케어", "healthcare",
        "바이오헬스", "의약품", "임상", "진단", "치료제", "스타트업", "창업",
        "R&D", "연구개발", "기술개발", "사업화", "실증", "특허",
        "중소기업", "벤처", "예비창업", "초기창업", "시제품", "테스트베드"
    ]

    current_external_keywords = [
        "바이오", "bio", "생명공학", "제약", "의료기기", "헬스케어",
        "healthcare", "바이오헬스", "의약품", "임상", "진단", "치료제"
    ]

    print("\n" + "=" * 60)
    print("추천 키워드")
    print("=" * 60)

    print("\n[사업공고] 추천 키워드:")
    print("현재 키워드:", ", ".join(current_business_keywords))
    print("\n추가 고려 키워드:")

    # 빈도 높은 키워드 중 현재 없는 것 추천
    for keyword, count in business_analysis['top_keywords'][:50]:
        if keyword not in current_business_keywords and len(keyword) >= 2:
            # 너무 일반적인 단어 제외
            if keyword not in ['공고', '지원', '사업', '접수', '모집', '선정',
                               '년도', '2024', '2025', '안내', '신청']:
                percentage = (count / business_analysis['total_notices']) * 100
                if percentage >= 5:  # 5% 이상 등장
                    print(f"  - {keyword:20s} : {count:4d}회 ({percentage:5.1f}%)")

    print("\n[유관기관공고] 추천 키워드:")
    print("현재 키워드:", ", ".join(current_external_keywords))
    print("\n추가 고려 키워드:")

    for keyword, count in external_analysis['top_keywords'][:50]:
        if keyword not in current_external_keywords and len(keyword) >= 2:
            if keyword not in ['공고', '지원', '사업', '접수', '모집', '선정',
                               '년도', '2024', '2025', '안내', '신청']:
                percentage = (count / external_analysis['total_notices']) * 100
                if percentage >= 5:
                    print(f"  - {keyword:20s} : {count:4d}회 ({percentage:5.1f}%)")

    # 샘플 공고 제목
    print("\n" + "=" * 60)
    print("샘플 공고 제목 (최근 20개)")
    print("=" * 60)

    print("\n[사업공고]")
    for i, title in enumerate(business_analysis['all_titles'], 1):
        print(f"{i:2d}. {title}")

    print("\n[유관기관공고]")
    for i, title in enumerate(external_analysis['all_titles'], 1):
        print(f"{i:2d}. {title}")


# ============================================
# 메인 실행
# ============================================

def main():
    """메인 실행 함수"""
    print("\n" + "=" * 60)
    print("JBTP 공고 키워드 분석 시작")
    print("=" * 60)
    print(f"분석 기간: 최근 {DATE_RANGE_DAYS}일")
    print(f"시작 시간: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")

    # 1. 데이터 수집
    print("\n" + "=" * 60)
    print("1단계: 데이터 수집")
    print("=" * 60)

    business_notices = crawl_board(BUSINESS_BOARD_URL, "사업공고", is_external=False)
    external_notices = crawl_board(EXTERNAL_BOARD_URL, "유관기관공고", is_external=True)

    # 2. 키워드 분석
    print("\n" + "=" * 60)
    print("2단계: 키워드 분석")
    print("=" * 60)

    business_analysis = analyze_keywords(business_notices, "사업공고")
    external_analysis = analyze_keywords(external_notices, "유관기관공고")

    # 3. 키워드 추천
    recommend_keywords(business_analysis, external_analysis)

    print("\n" + "=" * 60)
    print("분석 완료")
    print("=" * 60)
    print(f"종료 시간: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")


if __name__ == "__main__":
    main()
