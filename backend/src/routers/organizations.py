"""
기업·기관 관리 API 라우터
"""
from fastapi import APIRouter, Query
from typing import Optional
import json
from pathlib import Path

router = APIRouter()

CRAWLER_PATH = Path(__file__).parent.parent.parent.parent / "crawler"


@router.get("/centers")
async def get_centers(
    city: Optional[str] = Query(None, description="시/군/구 필터"),
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100)
):
    """창업보육센터 목록"""

    filepath = CRAWLER_PATH / "jeonbuk_bi_centers.json"
    with open(filepath, 'r', encoding='utf-8') as f:
        centers = json.load(f)

    # 필터링
    if city:
        centers = [c for c in centers if c.get("city") == city]

    # 페이지네이션
    start = (page - 1) * limit
    end = start + limit

    return {
        "total": len(centers),
        "page": page,
        "limit": limit,
        "items": centers[start:end]
    }


@router.get("/companies")
async def get_companies(
    center: Optional[str] = Query(None, description="센터명 필터"),
    industry: Optional[str] = Query(None, description="업종 필터"),
    page: int = Query(1, ge=1),
    limit: int = Query(50, ge=1, le=200)
):
    """입주기업 목록"""

    filepath = CRAWLER_PATH / "jeonbuk_bi_companies.json"
    with open(filepath, 'r', encoding='utf-8') as f:
        companies = json.load(f)

    # 필터링
    if center:
        companies = [c for c in companies if center in c.get("center_name", "")]
    if industry:
        companies = [c for c in companies if industry in c.get("industry", "")]

    # 페이지네이션
    start = (page - 1) * limit
    end = start + limit

    return {
        "total": len(companies),
        "page": page,
        "limit": limit,
        "items": companies[start:end]
    }
