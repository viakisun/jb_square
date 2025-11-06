"""
KSIC Codes Router - Manages Korean Standard Industry Classification codes
Provides bio industry classification management
"""

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import func, or_
from typing import Optional, List
from pydantic import BaseModel

from src.core.database import get_db
from src.models.ksic_code import KsicCode
from src.models.organization import Organization

router = APIRouter()


# ========================================
# Pydantic Schemas
# ========================================

class KsicCodeCreate(BaseModel):
    """KSIC 코드 생성 스키마"""
    code: str
    name: str
    description: Optional[str] = None
    category: str = 'NON_BIO'  # BIO_CORE, BIO_RELATED, NON_BIO
    is_active: bool = True


class KsicCodeUpdate(BaseModel):
    """KSIC 코드 수정 스키마"""
    name: Optional[str] = None
    description: Optional[str] = None
    category: Optional[str] = None
    is_active: Optional[bool] = None


# ========================================
# Endpoints
# ========================================

@router.get("")
async def list_ksic_codes(
    category: Optional[str] = Query(None, description="카테고리 필터 (BIO_CORE/BIO_RELATED/NON_BIO)"),
    is_active: Optional[bool] = Query(None, description="활성 상태 필터"),
    search: Optional[str] = Query(None, description="검색어 (코드 또는 이름)"),
    bio_only: bool = Query(False, description="바이오 코드만 조회 (BIO_CORE + BIO_RELATED)"),
    skip: int = Query(0, ge=0, description="건너뛸 항목 수"),
    limit: int = Query(100, ge=1, le=1000, description="조회할 항목 수"),
    db: Session = Depends(get_db)
):
    """
    KSIC 코드 목록 조회

    - **category**: BIO_CORE, BIO_RELATED, NON_BIO로 필터링
    - **bio_only**: True일 경우 바이오 관련 코드만 조회
    - **search**: 코드 또는 이름으로 검색
    """
    query = db.query(KsicCode)

    # Apply filters
    if category:
        query = query.filter(KsicCode.category == category)

    if is_active is not None:
        query = query.filter(KsicCode.is_active == is_active)

    if bio_only:
        query = query.filter(KsicCode.category.in_(['BIO_CORE', 'BIO_RELATED']))

    if search:
        search_term = f"%{search}%"
        query = query.filter(
            or_(
                KsicCode.code.ilike(search_term),
                KsicCode.name.ilike(search_term)
            )
        )

    total = query.count()
    ksic_codes = query.order_by(KsicCode.category, KsicCode.code).offset(skip).limit(limit).all()

    return {
        "total": total,
        "skip": skip,
        "limit": limit,
        "items": [code.to_dict() for code in ksic_codes]
    }


@router.get("/stats")
async def get_ksic_statistics(db: Session = Depends(get_db)):
    """
    KSIC 코드 통계 조회
    각 카테고리별 코드 수 및 기업 수 반환
    """
    # Category distribution
    category_stats = db.query(
        KsicCode.category,
        func.count(KsicCode.code).label('code_count')
    ).filter(
        KsicCode.is_active == True
    ).group_by(
        KsicCode.category
    ).all()

    # Get company counts per category
    company_counts = db.query(
        Organization.industry_type,
        func.count(Organization.id).label('company_count')
    ).group_by(
        Organization.industry_type
    ).all()

    company_count_dict = {row[0]: row[1] for row in company_counts}

    stats = {
        "by_category": {},
        "total_codes": 0,
        "total_bio_codes": 0,
        "total_companies": sum(company_count_dict.values())
    }

    for category, code_count in category_stats:
        stats["by_category"][category] = {
            "code_count": code_count,
            "company_count": company_count_dict.get(category, 0)
        }
        stats["total_codes"] += code_count
        if category in ('BIO_CORE', 'BIO_RELATED'):
            stats["total_bio_codes"] += code_count

    return stats


@router.get("/bio-codes")
async def get_bio_codes(db: Session = Depends(get_db)):
    """
    바이오 관련 KSIC 코드만 조회 (BIO_CORE + BIO_RELATED)
    각 코드별 사용 기업 수 포함
    """
    bio_codes = db.query(
        KsicCode.code,
        KsicCode.name,
        KsicCode.category,
        KsicCode.description,
        func.count(Organization.id).label('company_count')
    ).outerjoin(
        Organization,
        KsicCode.code == Organization.ksic_10th_code
    ).filter(
        KsicCode.category.in_(['BIO_CORE', 'BIO_RELATED']),
        KsicCode.is_active == True
    ).group_by(
        KsicCode.code,
        KsicCode.name,
        KsicCode.category,
        KsicCode.description
    ).order_by(
        KsicCode.category,
        KsicCode.code
    ).all()

    return {
        "total": len(bio_codes),
        "items": [
            {
                "code": code,
                "name": name,
                "category": category,
                "description": description,
                "company_count": company_count
            }
            for code, name, category, description, company_count in bio_codes
        ]
    }


@router.get("/with-company-counts")
async def get_ksic_codes_with_counts(
    category: Optional[str] = Query(None, description="카테고리 필터"),
    db: Session = Depends(get_db)
):
    """
    KSIC 코드 목록과 각 코드별 사용 기업 수 조회
    """
    query = db.query(
        KsicCode.code,
        KsicCode.name,
        KsicCode.category,
        KsicCode.description,
        KsicCode.is_active,
        func.count(Organization.id).label('company_count')
    ).outerjoin(
        Organization,
        KsicCode.code == Organization.ksic_10th_code
    )

    if category:
        query = query.filter(KsicCode.category == category)

    query = query.group_by(
        KsicCode.code,
        KsicCode.name,
        KsicCode.category,
        KsicCode.description,
        KsicCode.is_active
    ).order_by(
        KsicCode.category,
        KsicCode.code
    )

    results = query.all()

    return {
        "total": len(results),
        "items": [
            {
                "code": code,
                "name": name,
                "category": category,
                "description": description,
                "is_active": is_active,
                "company_count": company_count
            }
            for code, name, category, description, is_active, company_count in results
        ]
    }


@router.get("/{code}")
async def get_ksic_code(code: str, db: Session = Depends(get_db)):
    """
    특정 KSIC 코드의 상세 정보 조회
    """
    ksic_code = db.query(KsicCode).filter(KsicCode.code == code).first()
    if not ksic_code:
        raise HTTPException(status_code=404, detail=f"KSIC 코드 '{code}'를 찾을 수 없습니다.")

    # Get company count
    company_count = db.query(func.count(Organization.id)).filter(
        Organization.ksic_10th_code == code
    ).scalar()

    result = ksic_code.to_dict()
    result['company_count'] = company_count

    return result


@router.post("")
async def create_ksic_code(
    ksic_data: KsicCodeCreate,
    db: Session = Depends(get_db)
):
    """
    새 KSIC 코드 추가
    """
    # Check if code already exists
    existing = db.query(KsicCode).filter(KsicCode.code == ksic_data.code).first()
    if existing:
        raise HTTPException(status_code=400, detail=f"KSIC 코드 '{ksic_data.code}'는 이미 존재합니다.")

    # Validate category
    if ksic_data.category not in ('BIO_CORE', 'BIO_RELATED', 'NON_BIO'):
        raise HTTPException(status_code=400, detail="카테고리는 BIO_CORE, BIO_RELATED, NON_BIO 중 하나여야 합니다.")

    ksic_code = KsicCode(**ksic_data.model_dump())

    try:
        db.add(ksic_code)
        db.commit()
        db.refresh(ksic_code)
        return {
            "message": f"KSIC 코드 '{ksic_code.code}'가 성공적으로 추가되었습니다.",
            "ksic_code": ksic_code.to_dict()
        }
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=400, detail=f"KSIC 코드 추가 실패: {str(e)}")


@router.put("/{code}")
async def update_ksic_code(
    code: str,
    ksic_data: KsicCodeUpdate,
    db: Session = Depends(get_db)
):
    """
    KSIC 코드 정보 수정 (카테고리 변경 포함)

    카테고리를 변경하면 해당 코드를 사용하는 모든 기업의 industry_type이 자동으로 업데이트됩니다.
    """
    ksic_code = db.query(KsicCode).filter(KsicCode.code == code).first()
    if not ksic_code:
        raise HTTPException(status_code=404, detail=f"KSIC 코드 '{code}'를 찾을 수 없습니다.")

    # Validate category if provided
    if ksic_data.category and ksic_data.category not in ('BIO_CORE', 'BIO_RELATED', 'NON_BIO'):
        raise HTTPException(status_code=400, detail="카테고리는 BIO_CORE, BIO_RELATED, NON_BIO 중 하나여야 합니다.")

    update_data = ksic_data.model_dump(exclude_unset=True)
    category_changed = False

    for field, value in update_data.items():
        if field == 'category' and ksic_code.category != value:
            category_changed = True
        setattr(ksic_code, field, value)

    try:
        db.commit()
        db.refresh(ksic_code)

        # If category changed, update all organizations with this KSIC code
        if category_changed:
            affected_orgs = db.query(Organization).filter(
                Organization.ksic_10th_code == code
            ).update(
                {"industry_type": ksic_code.category},
                synchronize_session=False
            )
            db.commit()

            return {
                "message": f"KSIC 코드 '{code}'가 수정되었습니다. {affected_orgs}개 기업의 분류가 업데이트되었습니다.",
                "ksic_code": ksic_code.to_dict(),
                "affected_organizations": affected_orgs
            }

        return {
            "message": f"KSIC 코드 '{code}'가 성공적으로 수정되었습니다.",
            "ksic_code": ksic_code.to_dict()
        }
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=400, detail=f"KSIC 코드 수정 실패: {str(e)}")


@router.delete("/{code}")
async def delete_ksic_code(
    code: str,
    force: bool = Query(False, description="강제 삭제 (사용 중인 코드도 삭제)"),
    db: Session = Depends(get_db)
):
    """
    KSIC 코드 삭제 (비활성화)

    기본적으로 is_active를 False로 설정합니다.
    force=True일 경우 물리적으로 삭제하지만, 사용 중인 코드는 삭제할 수 없습니다.
    """
    ksic_code = db.query(KsicCode).filter(KsicCode.code == code).first()
    if not ksic_code:
        raise HTTPException(status_code=404, detail=f"KSIC 코드 '{code}'를 찾을 수 없습니다.")

    # Check if code is in use
    company_count = db.query(func.count(Organization.id)).filter(
        Organization.ksic_10th_code == code
    ).scalar()

    if company_count > 0 and force:
        raise HTTPException(
            status_code=400,
            detail=f"KSIC 코드 '{code}'는 {company_count}개 기업에서 사용 중입니다. 삭제할 수 없습니다."
        )

    try:
        if force and company_count == 0:
            # Physical delete
            db.delete(ksic_code)
            db.commit()
            return {"message": f"KSIC 코드 '{code}'가 삭제되었습니다."}
        else:
            # Soft delete (deactivate)
            ksic_code.is_active = False
            db.commit()
            return {
                "message": f"KSIC 코드 '{code}'가 비활성화되었습니다.",
                "company_count": company_count
            }
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=400, detail=f"KSIC 코드 삭제 실패: {str(e)}")
