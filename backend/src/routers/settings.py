"""
설정 관리 API 라우터
"""
from fastapi import APIRouter

router = APIRouter()


@router.get("/crawling-sources")
async def get_crawling_sources():
    """크롤링 소스 설정 조회"""

    return {
        "sources": [
            {"id": "jbtp", "name": "JBTP 전북테크노파크", "enabled": True, "last_run": "2025-10-24T14:30:00"},
            {"id": "ntis", "name": "NTIS 국가R&D", "enabled": True, "last_run": "2025-10-24T14:28:00"},
            {"id": "bizinfo", "name": "기업마당", "enabled": True, "last_run": "2025-10-24T14:25:00"},
            {"id": "bi_center", "name": "창업보육센터", "enabled": True, "last_run": "2025-10-24T15:54:00"}
        ],
        "schedule": "0 9 * * *"  # 매일 09:00
    }


@router.post("/crawling-sources/{source_id}/execute")
async def execute_crawling(source_id: str):
    """크롤링 수동 실행"""

    # TODO: 실제 크롤러 실행 로직
    return {
        "source_id": source_id,
        "status": "started",
        "message": f"{source_id} 크롤링을 시작했습니다."
    }
