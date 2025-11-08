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
    has_vacancy: Optional[bool] = None,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    """
    BI 센터 목록을 조회합니다.

    초보자를 위한 설명:
    - 이 엔드포인트는 창업보육센터(BI Center) 데이터를 조회합니다
    - 여러 필터링 옵션을 제공하여 원하는 조건의 센터만 가져올 수 있습니다
    - 페이지네이션(skip, limit)을 지원하여 대량의 데이터를 효율적으로 처리합니다

    Args:
        region: 지역 필터 (선택)
                예: "전북", "서울" 등 특정 지역의 센터만 조회
        has_vacancy: 공실 여부 필터 (선택)
                    True: 공실이 있는 센터만 조회
                    False: 공실이 없는 센터만 조회
                    None: 모든 센터 조회 (기본값)
        skip: 건너뛸 개수 (페이지네이션)
              예: skip=0이면 첫 페이지, skip=10이면 11번째부터 시작
        limit: 가져올 최대 개수
               예: limit=10이면 최대 10개의 센터 정보를 반환
        db: Database session (자동 주입됨, 직접 전달할 필요 없음)

    Returns:
        dict: {
            "total": 전체 센터 개수 (필터 적용 후),
            "items": [센터 정보 딕셔너리 리스트]
        }
    """
    # Step 1: 기본 쿼리 생성
    # SQLAlchemy를 사용하여 BICenter 테이블을 조회하는 쿼리 객체 생성
    query = db.query(BICenter)

    # Step 2: 지역 필터 적용
    # region 파라미터가 제공된 경우, 해당 지역의 센터만 필터링
    if region:
        query = query.filter(BICenter.region == region)

    # Step 3: 공실 필터 적용
    # has_vacancy 파라미터가 True인 경우, 공실이 있는 센터만 필터링
    if has_vacancy is not None:
        if has_vacancy:
            # 공실이 있는 센터 조건:
            # 1. vacant_rooms 필드가 NULL이 아니고
            # 2. 빈 문자열('')이 아니고
            # 3. '0'이 아닌 경우
            query = query.filter(
                BICenter.vacant_rooms.isnot(None),
                BICenter.vacant_rooms != '',
                BICenter.vacant_rooms != '0'
            )
        else:
            # 공실이 없는 센터 조건:
            # vacant_rooms가 NULL이거나 ''이거나 '0'인 경우
            from sqlalchemy import or_
            query = query.filter(
                or_(
                    BICenter.vacant_rooms.is_(None),
                    BICenter.vacant_rooms == '',
                    BICenter.vacant_rooms == '0'
                )
            )

    # Step 4: 정렬 적용
    # 최근에 생성된 센터가 먼저 나오도록 created_at 기준 내림차순 정렬
    query = query.order_by(desc(BICenter.created_at))

    # Step 5: 전체 개수 조회
    # 필터링된 결과의 총 개수를 계산 (페이지네이션에 필요)
    total = query.count()

    # Step 6: 페이지네이션 적용 및 데이터 조회
    # offset(skip): 앞에서 skip개 만큼 건너뜀
    # limit(limit): 최대 limit개까지만 가져옴
    centers = query.offset(skip).limit(limit).all()

    # Step 7: 결과 반환
    # ORM 객체를 딕셔너리로 변환하여 JSON 응답 가능한 형태로 만듦
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
