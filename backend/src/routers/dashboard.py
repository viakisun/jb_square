"""
대시보드 API 라우터
"""
from fastapi import APIRouter
from typing import List, Dict, Any
import json
import os
from datetime import datetime, timedelta
from pathlib import Path

router = APIRouter()

# 크롤러 데이터 경로
CRAWLER_PATH = Path(__file__).parent.parent.parent.parent / "crawler"


def load_json_data(filename: str) -> List[Dict[str, Any]]:
    """JSON 파일 로드"""
    filepath = CRAWLER_PATH / filename
    if not filepath.exists():
        return []

    with open(filepath, 'r', encoding='utf-8') as f:
        return json.load(f)


@router.get("/summary")
async def get_dashboard_summary():
    """대시보드 요약 통계"""

    # 공고 데이터 로드
    bio_notices = load_json_data("jeonbuk_bio_notices.json")
    all_notices = load_json_data("jeonbuk_all_notices.json")

    # 창업보육센터 및 기업 데이터 로드
    centers = load_json_data("jeonbuk_bi_centers.json")
    companies = load_json_data("jeonbuk_bi_companies.json")

    # 오늘 날짜
    today = datetime.now().date()

    return {
        "notices": {
            "total": len(all_notices),
            "bio_related": len(bio_notices),
            "today_collected": 0,  # TODO: 날짜 필터링
            "published": len(all_notices)
        },
        "organizations": {
            "total_centers": len(centers),
            "total_companies": len(companies),
            "today_updated": 0
        },
        "crawling": {
            "last_run": "2025-10-24T15:54:32",  # TODO: 실제 로그에서 가져오기
            "status": "success",
            "sources_active": 4
        }
    }


@router.get("/urgent-notices")
async def get_urgent_notices():
    """마감 임박 공고 (D-7 이내)"""

    all_notices = load_json_data("jeonbuk_all_notices.json")

    urgent = []
    today = datetime.now().date()

    for notice in all_notices:
        # deadline 또는 dday 필드 확인
        deadline_str = notice.get("deadline") or notice.get("period", "").split("~")[-1].strip()

        if deadline_str:
            try:
                # 날짜 파싱 시도
                if "-" in deadline_str:
                    deadline = datetime.strptime(deadline_str[:10], "%Y-%m-%d").date()
                    days_left = (deadline - today).days

                    if 0 <= days_left <= 7:
                        urgent.append({
                            **notice,
                            "days_left": days_left,
                            "urgency": "critical" if days_left <= 3 else "warning"
                        })
            except:
                pass

    # 마감일 가까운 순으로 정렬
    urgent.sort(key=lambda x: x.get("days_left", 999))

    return urgent[:10]  # 최대 10개


@router.get("/recent-organizations")
async def get_recent_organizations():
    """최근 업데이트된 기업 목록"""

    companies = load_json_data("jeonbuk_bi_companies.json")
    centers = load_json_data("jeonbuk_bi_centers.json")

    # 센터 정보와 함께 반환
    recent = []
    for center in centers[:5]:  # 최근 5개 센터
        recent.append({
            "type": "center",
            "name": center.get("center_name"),
            "city": center.get("city"),
            "tenant_count": len(center.get("tenant_companies", [])),
            "updated_at": center.get("extracted_at")
        })

    return recent


@router.get("/recent-logs")
async def get_recent_crawling_logs():
    """최근 크롤링 로그"""

    # TODO: 실제 로그 파일 또는 DB에서 가져오기
    return [
        {
            "id": 1,
            "source": "BI Center",
            "status": "success",
            "items_collected": 202,
            "timestamp": "2025-10-24T15:54:32",
            "duration": "8.5s"
        },
        {
            "id": 2,
            "source": "JBTP",
            "status": "success",
            "items_collected": 41,
            "timestamp": "2025-10-24T14:30:15",
            "duration": "3.2s"
        },
        {
            "id": 3,
            "source": "BizInfo",
            "status": "success",
            "items_collected": 1,
            "timestamp": "2025-10-24T14:25:08",
            "duration": "1.8s"
        }
    ]
