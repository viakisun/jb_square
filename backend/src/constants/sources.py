"""
Notice Source Constants
공고 출처 상수 정의
"""
from enum import Enum
from typing import Dict, Any


class NoticeSource(str, Enum):
    """
    공고 출처 Enum

    명명 규칙: source:organization:type
    """
    NTIS_RSS = "source:ntis:rss"           # 정부공고 - NTIS
    JBTP_LOCAL = "source:jbtp:local"       # 지자체 공고 - (재)전북테크노파크
    JBTP_EXTERNAL = "source:jbtp:external" # 유관기관 공고 - (재)전북테크노파크
    BIZINFO_API = "source:bizinfo:api"     # 기업마당 정보 - 기업마당


# Source 메타데이터
SOURCE_INFO: Dict[str, Dict[str, Any]] = {
    NoticeSource.NTIS_RSS: {
        "display_name": "정부공고",
        "organization": "NTIS",
        "organization_full": "국가과학기술지식정보서비스",
        "type": "RSS",
        "description": "정부 R&D 지원 사업 공고"
    },
    NoticeSource.JBTP_LOCAL: {
        "display_name": "지자체 공고",
        "organization": "(재)전북테크노파크",
        "organization_full": "재단법인 전북테크노파크",
        "type": "Crawling",
        "description": "전북 지역 지자체 지원 사업 공고"
    },
    NoticeSource.JBTP_EXTERNAL: {
        "display_name": "유관기관 공고",
        "organization": "(재)전북테크노파크",
        "organization_full": "재단법인 전북테크노파크",
        "type": "Crawling",
        "description": "유관기관 지원 사업 공고"
    },
    NoticeSource.BIZINFO_API: {
        "display_name": "기업마당 정보",
        "organization": "기업마당",
        "organization_full": "중소기업 종합정보시스템",
        "type": "API",
        "description": "중소기업 지원 사업 정보"
    }
}


def get_source_display_name(source_id: str) -> str:
    """Source ID로 표시명 가져오기"""
    return SOURCE_INFO.get(source_id, {}).get("display_name", source_id)


def get_source_organization(source_id: str) -> str:
    """Source ID로 기관명 가져오기"""
    return SOURCE_INFO.get(source_id, {}).get("organization", "알 수 없음")


def is_valid_source(source_id: str) -> bool:
    """유효한 Source ID인지 확인"""
    try:
        return source_id in [s.value for s in NoticeSource]
    except:
        return False


# 모든 Source ID 리스트
ALL_SOURCES = [s.value for s in NoticeSource]
