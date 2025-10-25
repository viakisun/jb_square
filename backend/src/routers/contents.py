"""
콘텐츠 관리 API 라우터
"""
from fastapi import APIRouter, Query
from typing import List, Optional
import json
from pathlib import Path

router = APIRouter()

CRAWLER_PATH = Path(__file__).parent.parent.parent.parent / "crawler"


@router.get("")
async def get_contents(
    source: Optional[str] = Query(None, description="출처 필터 (JBTP, NTIS, BizInfo)"),
    keyword: Optional[str] = Query(None, description="검색 키워드"),
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100)
):
    """공고 목록 조회"""

    # 데이터 로드
    filepath = CRAWLER_PATH / "jeonbuk_all_notices.json"
    with open(filepath, 'r', encoding='utf-8') as f:
        all_contents = json.load(f)

    # 필터링
    filtered = all_contents
    if source:
        filtered = [c for c in filtered if c.get("source") == source]
    if keyword:
        filtered = [c for c in filtered if keyword in c.get("title", "")]

    # 페이지네이션
    start = (page - 1) * limit
    end = start + limit
    paginated = filtered[start:end]

    return {
        "total": len(filtered),
        "page": page,
        "limit": limit,
        "items": paginated
    }


@router.get("/{content_id}")
async def get_content_detail(content_id: str):
    """공고 상세 조회"""
    # TODO: 실제 ID로 조회
    return {"id": content_id, "message": "상세 정보"}
