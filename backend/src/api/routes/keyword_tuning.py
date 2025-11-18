"""
Keyword Tuning API Routes
키워드 튜닝을 위한 미리보기 및 테스트 엔드포인트
"""

from fastapi import APIRouter, Query
from typing import List, Dict
from datetime import datetime

# 크롤러 어댑터들
from src.services.sources.government_ntis import GovernmentNTISAdapter
from src.services.sources.jbtp_local import JBTPLocalAdapter
from src.services.sources.jbtp_external import JBTPExternalAdapter
from src.services.sources.jbtp_events import JBTPEventsAdapter
from src.services.sources.government_bizinfo import GovernmentBizinfoAdapter
from src.services.sources.government_mfds import GovernmentMFDSAdapter
from src.services.sources.government_mohw import GovernmentMOHWAdapter

router = APIRouter(prefix="/keyword-tuning", tags=["keyword-tuning"])


# 소스 ID -> 어댑터 매핑
ADAPTER_MAP = {
    "source:ntis:rss": ("NTIS 국가R&D통합공고", GovernmentNTISAdapter),
    "source:jbtp:local": ("지자체 사업공고", JBTPLocalAdapter),
    "source:jbtp:external": ("유관기관 공고", JBTPExternalAdapter),
    "source:jbtp:events": ("바이오 행사/교육", JBTPEventsAdapter),
    "source:bizinfo:api": ("기업마당 정책정보", GovernmentBizinfoAdapter),
    "source:mfds:rss": ("식약처 공지사항", GovernmentMFDSAdapter),
    "source:mohw:rss": ("보건복지부 보도자료", GovernmentMOHWAdapter),
}


def match_keywords_in_title(title: str, keywords: List[str]) -> List[str]:
    """
    제목에서 키워드 매칭

    Args:
        title: 공고 제목
        keywords: 키워드 리스트

    Returns:
        매칭된 키워드 리스트
    """
    if not keywords:
        return []

    matched = []
    title_lower = title.lower()

    for keyword in keywords:
        if keyword.lower() in title_lower:
            matched.append(keyword)

    return matched


@router.get("/sources")
async def get_available_sources():
    """
    사용 가능한 크롤링 소스 목록 반환

    Returns:
        {
            "success": true,
            "data": [
                {"id": "source:ntis:rss", "name": "NTIS 국가R&D통합공고"},
                ...
            ]
        }
    """
    sources = [
        {"id": source_id, "name": name}
        for source_id, (name, _) in ADAPTER_MAP.items()
    ]

    return {
        "success": True,
        "data": sources
    }


@router.get("/preview")
async def get_keyword_tuning_preview(
    source_ids: str = Query(..., description="쉼표로 구분된 소스 ID들 (예: source:ntis:rss,source:jbtp:local)"),
    keywords: str = Query("", description="띄어쓰기로 구분된 키워드들 (예: 바이오 R&D 헬스케어). 빈 문자열이면 전체 공고 반환"),
    date_range_days: int = Query(30, description="검색 기간 (일)"),
    count_per_source: int = Query(100, description="소스당 최대 공고 개수")
):
    """
    실시간으로 각 소스에서 공고를 가져와서 입력받은 키워드로 필터링

    Args:
        source_ids: 쉼표로 구분된 소스 ID들
        keywords: 띄어쓰기로 구분된 키워드들 (빈 문자열이면 키워드 필터 없이 전체 반환)
        date_range_days: 검색 기간 (일)
        count_per_source: 소스당 최대 공고 개수

    Returns:
        {
            "success": true,
            "data": {
                "notices": [...],  # 전체 공고 리스트 (날짜 역순)
                "statistics": {
                    "total": 150,
                    "matched": 89,
                    "unmatched": 61,
                    "by_source": {
                        "NTIS": {"total": 48, "matched": 35, "unmatched": 13},
                        ...
                    },
                    "by_keyword": {
                        "바이오": 45,
                        "R&D": 38,
                        ...
                    }
                }
            }
        }
    """
    try:
        # 소스 ID 파싱
        source_id_list = [s.strip() for s in source_ids.split(",") if s.strip()]

        # 키워드 파싱 (띄어쓰기 기준)
        keyword_list = [k.strip() for k in keywords.split() if k.strip()]
        apply_keyword_filter = len(keyword_list) > 0

        # 전체 공고 수집
        all_notices = []
        source_stats = {}

        for source_id in source_id_list:
            if source_id not in ADAPTER_MAP:
                continue

            source_name, adapter_class = ADAPTER_MAP[source_id]

            try:
                # 어댑터 인스턴스 생성
                adapter = adapter_class()

                # get_notices_preview 호출 (키워드 필터 없이 전체 가져오기)
                source_notices = await adapter.get_notices_preview(
                    count=count_per_source,
                    apply_keyword_filter=False,  # 여기서는 필터링 안 함
                    date_range_days=date_range_days
                )

                # 각 공고에 source_id 추가 및 키워드 매칭
                matched_count = 0
                for notice in source_notices:
                    notice['source_id'] = source_id

                    # 키워드 매칭 (사용자가 입력한 키워드로)
                    if apply_keyword_filter:
                        matched = match_keywords_in_title(notice.get('title', ''), keyword_list)
                        notice['matched_keywords'] = matched

                        if matched:
                            matched_count += 1
                    else:
                        notice['matched_keywords'] = []

                all_notices.extend(source_notices)

                # 소스별 통계
                source_stats[source_name] = {
                    "total": len(source_notices),
                    "matched": matched_count if apply_keyword_filter else len(source_notices),
                    "unmatched": len(source_notices) - matched_count if apply_keyword_filter else 0
                }

            except Exception as e:
                print(f"Error fetching from {source_name}: {str(e)}")
                import traceback
                traceback.print_exc()

                # 에러가 나도 계속 진행
                source_stats[source_name] = {
                    "total": 0,
                    "matched": 0,
                    "unmatched": 0,
                    "error": str(e)
                }

        # 날짜 역순 정렬 (published_date 기준)
        all_notices.sort(
            key=lambda x: x.get('published_date', ''),
            reverse=True
        )

        # 통계 계산
        total_count = len(all_notices)

        if apply_keyword_filter:
            # 매칭된 공고만 필터링
            filtered_notices = [n for n in all_notices if n.get('matched_keywords')]
            matched_count = len(filtered_notices)
            unmatched_count = total_count - matched_count
        else:
            # 키워드 없으면 전체
            filtered_notices = all_notices
            matched_count = total_count
            unmatched_count = 0

        # 키워드별 통계
        keyword_stats = {}
        if apply_keyword_filter:
            for notice in filtered_notices:
                for keyword in notice.get('matched_keywords', []):
                    keyword_stats[keyword] = keyword_stats.get(keyword, 0) + 1

        return {
            "success": True,
            "data": {
                "notices": filtered_notices,
                "statistics": {
                    "total": total_count,
                    "matched": matched_count,
                    "unmatched": unmatched_count,
                    "by_source": source_stats,
                    "by_keyword": keyword_stats
                }
            }
        }

    except Exception as e:
        print(f"Error in keyword tuning preview: {str(e)}")
        import traceback
        traceback.print_exc()

        return {
            "success": False,
            "error": str(e),
            "data": {
                "notices": [],
                "statistics": {
                    "total": 0,
                    "matched": 0,
                    "unmatched": 0,
                    "by_source": {},
                    "by_keyword": {}
                }
            }
        }
