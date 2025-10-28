"""
Crawler Utilities
크롤러에서 공통으로 사용하는 유틸리티 함수들
"""

from datetime import datetime
from typing import List, Optional


def match_keywords(text: str, keywords: List[str]) -> List[str]:
    """
    텍스트에서 키워드 매칭을 수행합니다.

    Args:
        text: 검색할 텍스트
        keywords: 매칭할 키워드 리스트

    Returns:
        매칭된 키워드 리스트
    """
    if not keywords or not text:
        return []

    matched = []
    text_lower = text.lower()
    for keyword in keywords:
        if keyword.lower() in text_lower:
            matched.append(keyword)
    return matched


def parse_date(date_str: str) -> Optional[datetime]:
    """
    날짜 문자열을 datetime 객체로 파싱

    지원 형식:
    - YYYY-MM-DD
    - YYYY.MM.DD
    - YYYY/MM/DD

    Args:
        date_str: 날짜 문자열

    Returns:
        datetime 객체 또는 None
    """
    if not date_str:
        return None

    # 구분자 정규화
    normalized = date_str.replace('.', '-').replace('/', '-')

    date_formats = [
        '%Y-%m-%d',
        '%Y-%m-%d %H:%M:%S',
        '%Y-%m-%d %H:%M',
    ]

    for fmt in date_formats:
        try:
            return datetime.strptime(normalized[:len(fmt)], fmt)
        except ValueError:
            continue

    return None


def truncate_text(text: str, max_length: int = 500) -> str:
    """
    텍스트를 지정된 길이로 자릅니다.

    Args:
        text: 원본 텍스트
        max_length: 최대 길이

    Returns:
        잘린 텍스트
    """
    if not text:
        return ""

    if len(text) <= max_length:
        return text

    return text[:max_length] + "..."


def clean_html_text(text: str) -> str:
    """
    HTML 태그와 불필요한 공백을 제거합니다.

    Args:
        text: 원본 텍스트

    Returns:
        정제된 텍스트
    """
    if not text:
        return ""

    import re
    # HTML 태그 제거
    text = re.sub(r'<[^>]+>', '', text)
    # 연속된 공백을 하나로
    text = re.sub(r'\s+', ' ', text)
    # 앞뒤 공백 제거
    return text.strip()
