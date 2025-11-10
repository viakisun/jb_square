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

    Note: bi_center는 이 enum에 포함되지 않습니다.
    bi_center는 공고가 아닌 창업보육센터 디렉토리 정보를 수집하며,
    BICenter/BICompany 모델을 사용하고 별도의 API 엔드포인트(/api/bi-centers)를 가집니다.
    """
    NTIS_RSS = "source:ntis:rss"           # 정부공고 - NTIS
    JBTP_LOCAL = "source:jbtp:local"       # 지자체 공고 - (재)전북테크노파크
    JBTP_EXTERNAL = "source:jbtp:external" # 유관기관 공고 - (재)전북테크노파크
    JBTP_EVENTS = "source:jbtp:events"     # 교육/행사 - (재)전북테크노파크
    BIZINFO_API = "source:bizinfo:api"     # 기업마당 정보 - 기업마당
    NEWS_MFDS = "source:news:mfds"         # 뉴스 - 식품의약품안전처
    NEWS_MOHW = "source:news:mohw"         # 뉴스 - 보건복지부


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
    NoticeSource.JBTP_EVENTS: {
        "display_name": "JBTP 행사",
        "organization": "(재)전북테크노파크",
        "organization_full": "재단법인 전북테크노파크",
        "type": "Crawling",
        "description": "전북테크노파크 교육/행사 정보"
    },
    NoticeSource.BIZINFO_API: {
        "display_name": "기업마당 정보",
        "organization": "기업마당",
        "organization_full": "중소기업 종합정보시스템",
        "type": "API",
        "description": "중소기업 지원 사업 정보"
    },
    NoticeSource.NEWS_MFDS: {
        "display_name": "식약처 뉴스",
        "organization": "식품의약품안전처",
        "organization_full": "식품의약품안전처",
        "type": "RSS",
        "description": "의약품 승인, 안전 규제, 식품 위생 관련 공지사항"
    },
    NoticeSource.NEWS_MOHW: {
        "display_name": "복지부 뉴스",
        "organization": "보건복지부",
        "organization_full": "보건복지부",
        "type": "RSS",
        "description": "보건의료 정책, R&D 지원, 바이오 산업 보도자료"
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
