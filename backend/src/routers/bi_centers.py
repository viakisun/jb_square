"""
BI Centers (창업보육센터) API 라우터
"""

from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from sqlalchemy import desc
from typing import List, Optional

from src.core.database import get_db
from src.models.bi_center import BICenter, BICompany

router = APIRouter()


@router.get("/list")
async def list_bi_centers(
    region: Optional[str] = None,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    """
    BI 센터 목록을 조회합니다.

    Args:
        region: 지역 필터 (선택)
        skip: 건너뛸 개수
        limit: 가져올 최대 개수
        db: Database session
    """
    query = db.query(BICenter)

    if region:
        query = query.filter(BICenter.region == region)

    query = query.order_by(desc(BICenter.created_at))

    total = query.count()
    centers = query.offset(skip).limit(limit).all()

    return {
        "total": total,
        "items": [center.to_dict() for center in centers]
    }


@router.get("/{center_id}")
async def get_bi_center(center_id: int, db: Session = Depends(get_db)):
    """
    특정 BI 센터의 상세 정보를 조회합니다.

    Args:
        center_id: BI 센터 ID
        db: Database session
    """
    center = db.query(BICenter).filter(BICenter.id == center_id).first()

    if not center:
        raise HTTPException(status_code=404, detail="BI Center not found")

    return center.to_dict()


@router.get("/{center_id}/companies")
async def list_companies_by_center(
    center_id: int,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    """
    특정 BI 센터의 입주기업 목록을 조회합니다.

    Args:
        center_id: BI 센터 ID
        skip: 건너뛸 개수
        limit: 가져올 최대 개수
        db: Database session
    """
    # 센터 존재 확인
    center = db.query(BICenter).filter(BICenter.id == center_id).first()

    if not center:
        raise HTTPException(status_code=404, detail="BI Center not found")

    # 입주기업 조회
    query = db.query(BICompany).filter(BICompany.center_id == center_id)
    query = query.order_by(desc(BICompany.created_at))

    total = query.count()
    companies = query.offset(skip).limit(limit).all()

    return {
        "center": center.to_dict(),
        "total": total,
        "items": [company.to_dict() for company in companies]
    }


@router.get("/companies/search")
async def search_companies(
    query: Optional[str] = None,
    business_field: Optional[str] = None,
    status: Optional[str] = None,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    """
    입주기업을 검색합니다.

    Args:
        query: 검색어 (기업명 또는 제품명)
        business_field: 업종 필터
        status: 상태 필터
        skip: 건너뛸 개수
        limit: 가져올 최대 개수
        db: Database session
    """
    companies_query = db.query(BICompany)

    # 검색어 필터
    if query:
        companies_query = companies_query.filter(
            (BICompany.company_name.contains(query)) |
            (BICompany.product.contains(query))
        )

    # 업종 필터
    if business_field:
        companies_query = companies_query.filter(
            BICompany.business_field.contains(business_field)
        )

    # 상태 필터
    if status:
        companies_query = companies_query.filter(BICompany.status == status)

    companies_query = companies_query.order_by(desc(BICompany.created_at))

    total = companies_query.count()
    companies = companies_query.offset(skip).limit(limit).all()

    # 각 회사의 센터 정보 포함
    items_with_center = []
    for company in companies:
        company_dict = company.to_dict()
        center = db.query(BICenter).filter(BICenter.id == company.center_id).first()
        if center:
            company_dict['center'] = {
                'id': center.id,
                'center_name': center.center_name,
                'org_name': center.org_name,
                'region': center.region,
                'city': center.city
            }
        items_with_center.append(company_dict)

    return {
        "total": total,
        "items": items_with_center
    }


@router.get("/stats/overview")
async def get_bi_stats(db: Session = Depends(get_db)):
    """
    BI 센터 및 입주기업 통계를 조회합니다.
    """
    total_centers = db.query(BICenter).count()
    total_companies = db.query(BICompany).count()

    # 지역별 센터 수
    from sqlalchemy import func
    centers_by_region = db.query(
        BICenter.region,
        func.count(BICenter.id).label('count')
    ).group_by(BICenter.region).all()

    # 상태별 입주기업 수
    companies_by_status = db.query(
        BICompany.status,
        func.count(BICompany.id).label('count')
    ).group_by(BICompany.status).all()

    return {
        "total_centers": total_centers,
        "total_companies": total_companies,
        "centers_by_region": [
            {"region": r, "count": c} for r, c in centers_by_region
        ],
        "companies_by_status": [
            {"status": s, "count": c} for s, c in companies_by_status
        ]
    }
