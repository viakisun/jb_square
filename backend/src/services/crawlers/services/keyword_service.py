"""
Keyword Service
키워드 매칭을 담당하는 서비스
"""

from typing import List


class KeywordService:
    """
    키워드 매칭 서비스

    텍스트에서 키워드 매칭을 수행합니다.
    """

    @staticmethod
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

    @staticmethod
    def has_any_keyword(text: str, keywords: List[str]) -> bool:
        """
        텍스트에 키워드가 하나라도 포함되어 있는지 확인

        Args:
            text: 검색할 텍스트
            keywords: 키워드 리스트

        Returns:
            키워드가 하나라도 포함되어 있으면 True
        """
        if not keywords or not text:
            return False

        text_lower = text.lower()
        return any(keyword.lower() in text_lower for keyword in keywords)

    @staticmethod
    def filter_by_keywords(
        items: List[dict],
        keywords: List[str],
        text_field: str = 'title'
    ) -> List[dict]:
        """
        키워드를 포함한 항목만 필터링

        Args:
            items: 필터링할 항목 리스트
            keywords: 키워드 리스트
            text_field: 검색할 필드 이름 (기본값: 'title')

        Returns:
            키워드를 포함한 항목 리스트
        """
        if not keywords:
            return items

        filtered = []
        for item in items:
            text = item.get(text_field, '')
            if KeywordService.has_any_keyword(text, keywords):
                filtered.append(item)

        return filtered
