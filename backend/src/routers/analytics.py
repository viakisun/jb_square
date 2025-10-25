"""
통계 분석 API 라우터
"""
from fastapi import APIRouter
from collections import Counter
import json
from pathlib import Path

router = APIRouter()

CRAWLER_PATH = Path(__file__).parent.parent.parent.parent / "crawler"


@router.get("/content-stats")
async def get_content_statistics():
    """콘텐츠 통계"""

    filepath = CRAWLER_PATH / "jeonbuk_all_notices.json"
    with open(filepath, 'r', encoding='utf-8') as f:
        notices = json.load(f)

    # 출처별 통계
    sources = Counter(n.get("source") for n in notices)

    return {
        "total_notices": len(notices),
        "by_source": dict(sources),
        "bio_related": len([n for n in notices if n.get("matched_keywords")])
    }


@router.get("/organization-stats")
async def get_organization_statistics():
    """기업 통계"""

    companies_path = CRAWLER_PATH / "jeonbuk_bi_companies.json"
    centers_path = CRAWLER_PATH / "jeonbuk_bi_centers.json"

    with open(companies_path, 'r', encoding='utf-8') as f:
        companies = json.load(f)

    with open(centers_path, 'r', encoding='utf-8') as f:
        centers = json.load(f)

    # 시/군/구별 통계
    city_stats = Counter(c.get("city") for c in companies)

    # 업종별 통계
    industry_stats = Counter(c.get("industry") for c in companies)

    return {
        "total_centers": len(centers),
        "total_companies": len(companies),
        "by_city": dict(city_stats),
        "by_industry": dict(industry_stats.most_common(10))
    }
