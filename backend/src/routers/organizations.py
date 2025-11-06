"""
Organizations API Router
기업·기관 관리 API - Database-backed endpoints for biotech companies
"""
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import or_, func
from typing import Optional, List
from pydantic import BaseModel
from datetime import date

from src.core.database import get_db
from src.models.organization import Organization

router = APIRouter()


# ==================== Pydantic Schemas ====================

class OrganizationCreate(BaseModel):
    """Schema for creating an organization"""
    company_name: str
    company_name_with_type: Optional[str] = None
    kedcd: Optional[str] = None
    business_registration_number: Optional[str] = None
    ceo_name: Optional[str] = None
    email: Optional[str] = None
    company_status: Optional[str] = None
    company_scale: Optional[str] = None
    company_type: Optional[str] = None
    ksic_10th_code: Optional[str] = None
    ksic_10th_name: Optional[str] = None
    main_products: Optional[str] = None
    established_date: Optional[date] = None
    has_research_institute: Optional[bool] = False


class OrganizationUpdate(BaseModel):
    """Schema for updating an organization"""
    company_name: Optional[str] = None
    company_name_with_type: Optional[str] = None
    ceo_name: Optional[str] = None
    email: Optional[str] = None
    company_status: Optional[str] = None
    company_scale: Optional[str] = None
    company_type: Optional[str] = None
    ksic_10th_code: Optional[str] = None
    ksic_10th_name: Optional[str] = None
    main_products: Optional[str] = None
    has_research_institute: Optional[bool] = None


# ==================== API Endpoints ====================

@router.get("")
async def list_organizations(
    industry_type: Optional[str] = Query(None, description="산업 분류 (BIO_CORE/BIO_RELATED/NON_BIO)"),
    company_scale: Optional[str] = Query(None, description="기업 규모 (대기업/중견기업/중소기업)"),
    company_status: Optional[str] = Query(None, description="기업 상태 (영업중/폐업/휴업)"),
    ksic_code: Optional[str] = Query(None, description="KSIC 10차 코드"),
    search: Optional[str] = Query(None, description="검색어 (업체명, 대표자명, 주요제품명)"),
    has_research_institute: Optional[bool] = Query(None, description="기업부설연구소 유무"),
    skip: int = Query(0, ge=0, description="건너뛸 항목 수"),
    limit: int = Query(20, ge=1, le=100, description="조회할 항목 수"),
    include_yearly: bool = Query(False, description="연도별 데이터 구조화 여부"),
    db: Session = Depends(get_db)
):
    """
    기업 목록 조회 (필터링, 검색, 페이징 지원)

    - **industry_type**: BIO_CORE (바이오 핵심), BIO_RELATED (전후방 연관), NON_BIO (비바이오)
    - **company_scale**: 대기업, 중견기업, 중소기업
    - **search**: 업체명, 대표자명, 주요제품명 통합 검색
    """
    query = db.query(Organization)

    # Apply filters
    if industry_type:
        query = query.filter(Organization.industry_type == industry_type)

    if company_scale:
        query = query.filter(Organization.company_scale == company_scale)

    if company_status:
        query = query.filter(Organization.company_status == company_status)

    if ksic_code:
        query = query.filter(Organization.ksic_10th_code == ksic_code)

    if has_research_institute is not None:
        query = query.filter(Organization.has_research_institute == has_research_institute)

    if search:
        search_term = f"%{search}%"
        query = query.filter(
            or_(
                Organization.company_name.ilike(search_term),
                Organization.ceo_name.ilike(search_term),
                Organization.main_products.ilike(search_term)
            )
        )

    # Get total count
    total = query.count()

    # Apply pagination
    organizations = query.order_by(Organization.company_name).offset(skip).limit(limit).all()

    return {
        "total": total,
        "skip": skip,
        "limit": limit,
        "items": [org.to_dict(include_yearly=include_yearly) for org in organizations]
    }


@router.get("/stats")
async def get_statistics(
    db: Session = Depends(get_db)
):
    """
    기업 통계 조회

    - 산업 분류별 기업 수
    - 기업 규모별 분포
    - 기업 상태별 분포
    - 기업부설연구소 보유 현황
    """
    stats = {
        "by_industry_type": {},
        "by_company_scale": {},
        "by_company_status": {},
        "research_institute": {
            "has": 0,
            "none": 0
        },
        "total": 0
    }

    # Industry type distribution
    industry_stats = db.query(
        Organization.industry_type,
        func.count(Organization.id)
    ).group_by(Organization.industry_type).all()

    for industry_type, count in industry_stats:
        if industry_type:
            stats["by_industry_type"][industry_type] = count

    # Company scale distribution
    scale_stats = db.query(
        Organization.company_scale,
        func.count(Organization.id)
    ).group_by(Organization.company_scale).all()

    for scale, count in scale_stats:
        if scale:
            stats["by_company_scale"][scale] = count

    # Company status distribution
    status_stats = db.query(
        Organization.company_status,
        func.count(Organization.id)
    ).group_by(Organization.company_status).all()

    for status, count in status_stats:
        if status:
            stats["by_company_status"][status] = count

    # Research institute stats
    ri_stats = db.query(
        Organization.has_research_institute,
        func.count(Organization.id)
    ).group_by(Organization.has_research_institute).all()

    for has_ri, count in ri_stats:
        if has_ri:
            stats["research_institute"]["has"] = count
        else:
            stats["research_institute"]["none"] = count

    # Total count
    stats["total"] = db.query(func.count(Organization.id)).scalar()

    return stats


@router.get("/{organization_id}")
async def get_organization(
    organization_id: int,
    include_yearly: bool = Query(True, description="연도별 데이터 구조화 여부"),
    db: Session = Depends(get_db)
):
    """
    특정 기업의 상세 정보 조회

    - 기본 정보
    - 재무 데이터 (2020-2024)
    - 특허 데이터 (2020-2024)
    """
    organization = db.query(Organization).filter(Organization.id == organization_id).first()

    if not organization:
        raise HTTPException(status_code=404, detail="기업을 찾을 수 없습니다.")

    return organization.to_dict(include_yearly=include_yearly)


@router.post("")
async def create_organization(
    organization_data: OrganizationCreate,
    db: Session = Depends(get_db)
):
    """
    새 기업 등록

    - 기본 정보 입력
    - KSIC 코드 기반 자동 산업 분류 (DB 트리거)
    """
    # Create new organization
    organization = Organization(
        **organization_data.model_dump()
    )

    try:
        db.add(organization)
        db.commit()
        db.refresh(organization)

        return {
            "message": "기업이 성공적으로 등록되었습니다.",
            "organization": organization.to_dict()
        }
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=400, detail=f"기업 등록 실패: {str(e)}")


@router.put("/{organization_id}")
async def update_organization(
    organization_id: int,
    organization_data: OrganizationUpdate,
    db: Session = Depends(get_db)
):
    """
    기업 정보 수정

    - 부분 업데이트 지원
    - KSIC 코드 변경 시 자동 재분류 (DB 트리거)
    """
    organization = db.query(Organization).filter(Organization.id == organization_id).first()

    if not organization:
        raise HTTPException(status_code=404, detail="기업을 찾을 수 없습니다.")

    # Update fields
    update_data = organization_data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(organization, field, value)

    try:
        db.commit()
        db.refresh(organization)

        return {
            "message": "기업 정보가 성공적으로 수정되었습니다.",
            "organization": organization.to_dict()
        }
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=400, detail=f"기업 수정 실패: {str(e)}")


@router.delete("/{organization_id}")
async def delete_organization(
    organization_id: int,
    db: Session = Depends(get_db)
):
    """
    기업 삭제
    """
    organization = db.query(Organization).filter(Organization.id == organization_id).first()

    if not organization:
        raise HTTPException(status_code=404, detail="기업을 찾을 수 없습니다.")

    company_name = organization.company_name

    try:
        db.delete(organization)
        db.commit()

        return {
            "message": f"기업 '{company_name}'이(가) 성공적으로 삭제되었습니다."
        }
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=400, detail=f"기업 삭제 실패: {str(e)}")


@router.get("/ksic-codes/list")
async def list_ksic_codes(
    db: Session = Depends(get_db)
):
    """
    사용 중인 KSIC 코드 목록 조회

    - 고유한 KSIC 10차 코드 및 명칭
    - 산업 분류별 그룹화
    """
    # Get unique KSIC codes with their classifications
    ksic_list = db.query(
        Organization.ksic_10th_code,
        Organization.ksic_10th_name,
        Organization.industry_type,
        func.count(Organization.id).label('company_count')
    ).filter(
        Organization.ksic_10th_code.isnot(None)
    ).group_by(
        Organization.ksic_10th_code,
        Organization.ksic_10th_name,
        Organization.industry_type
    ).order_by(
        Organization.industry_type,
        Organization.ksic_10th_code
    ).all()

    return {
        "total": len(ksic_list),
        "items": [
            {
                "code": code,
                "name": name,
                "industry_type": industry_type,
                "company_count": count
            }
            for code, name, industry_type, count in ksic_list
        ]
    }
