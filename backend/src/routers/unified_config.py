"""
Unified Crawler Config Router
통합 크롤러 설정 API - 모든 크롤러를 단일 API로 관리
"""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional, Dict, Any
from pydantic import BaseModel
from datetime import datetime

from src.core.database import get_db
from src.models.crawler_config import CrawlerConfig


router = APIRouter(prefix="/crawling/configs", tags=["통합 크롤링 설정"])


# ============================================================================
# Request/Response Models
# ============================================================================

class CrawlerConfigCreate(BaseModel):
    """크롤러 설정 생성 요청"""
    source_id: str
    crawler_type: str
    name: str
    url: Optional[str] = None
    config_data: Dict[str, Any] = {}
    keywords: List[str] = []
    date_range_days: int = 30
    enabled: bool = True


class CrawlerConfigUpdate(BaseModel):
    """크롤러 설정 업데이트 요청"""
    name: Optional[str] = None
    url: Optional[str] = None
    config_data: Optional[Dict[str, Any]] = None
    keywords: Optional[List[str]] = None
    date_range_days: Optional[int] = None
    enabled: Optional[bool] = None


# ============================================================================
# API Endpoints
# ============================================================================

@router.get("")
async def get_all_configs(
    crawler_type: Optional[str] = None,
    enabled: Optional[bool] = None,
    db: Session = Depends(get_db)
):
    """
    모든 크롤러 설정 조회 (필터링 옵션)

    Query Parameters:
        - crawler_type: 크롤러 타입으로 필터링 ('jbtp', 'rss', 'web', 'binet')
        - enabled: 활성화 상태로 필터링 (true/false)

    Returns:
        {
            "items": [...],
            "total": 10
        }
    """
    query = db.query(CrawlerConfig)

    if crawler_type:
        query = query.filter(CrawlerConfig.crawler_type == crawler_type)
    if enabled is not None:
        query = query.filter(CrawlerConfig.enabled == enabled)

    configs = query.order_by(CrawlerConfig.id).all()

    return {
        "items": [config.to_dict() for config in configs],
        "total": len(configs)
    }


@router.get("/{source_id}")
async def get_config(source_id: str, db: Session = Depends(get_db)):
    """
    특정 크롤러 설정 조회

    Path Parameters:
        - source_id: 소스 식별자 (예: 'source:jbtp:local', 'source:news:mfds')

    Returns:
        크롤러 설정 객체
    """
    config = db.query(CrawlerConfig).filter(
        CrawlerConfig.source_id == source_id
    ).first()

    if not config:
        raise HTTPException(
            status_code=404,
            detail=f"Config not found: {source_id}"
        )

    return config.to_dict()


@router.post("")
async def create_config(data: CrawlerConfigCreate, db: Session = Depends(get_db)):
    """
    새 크롤러 설정 생성

    Body:
        - source_id: 소스 식별자 (유니크)
        - crawler_type: 크롤러 타입
        - name: 표시 이름
        - url: URL (선택)
        - config_data: 타입별 설정 (선택)
        - keywords: 키워드 필터
        - date_range_days: 검색 기간 (일)
        - enabled: 활성화 상태

    Returns:
        생성된 설정 객체
    """
    # Check for duplicates
    existing = db.query(CrawlerConfig).filter(
        CrawlerConfig.source_id == data.source_id
    ).first()

    if existing:
        raise HTTPException(
            status_code=400,
            detail=f"Config already exists: {data.source_id}"
        )

    # Create new config
    config = CrawlerConfig(
        source_id=data.source_id,
        crawler_type=data.crawler_type,
        name=data.name,
        url=data.url,
        config_data=data.config_data,
        keywords=data.keywords,
        date_range_days=data.date_range_days,
        enabled=data.enabled
    )

    db.add(config)
    db.commit()
    db.refresh(config)

    return config.to_dict()


@router.put("/{source_id}")
async def update_config(
    source_id: str,
    data: CrawlerConfigUpdate,
    db: Session = Depends(get_db)
):
    """
    크롤러 설정 업데이트

    Path Parameters:
        - source_id: 소스 식별자

    Body:
        업데이트할 필드들 (선택적)

    Returns:
        업데이트된 설정 객체
    """
    config = db.query(CrawlerConfig).filter(
        CrawlerConfig.source_id == source_id
    ).first()

    if not config:
        raise HTTPException(
            status_code=404,
            detail=f"Config not found: {source_id}"
        )

    # Update fields
    if data.name is not None:
        config.name = data.name
    if data.url is not None:
        config.url = data.url
    if data.config_data is not None:
        config.config_data = data.config_data
    if data.keywords is not None:
        config.keywords = data.keywords
    if data.date_range_days is not None:
        config.date_range_days = data.date_range_days
    if data.enabled is not None:
        config.enabled = data.enabled

    # Update timestamp
    config.updated_at = datetime.now()

    db.commit()
    db.refresh(config)

    return config.to_dict()


@router.delete("/{source_id}")
async def delete_config(source_id: str, db: Session = Depends(get_db)):
    """
    크롤러 설정 삭제

    Path Parameters:
        - source_id: 소스 식별자

    Returns:
        삭제 확인 메시지
    """
    config = db.query(CrawlerConfig).filter(
        CrawlerConfig.source_id == source_id
    ).first()

    if not config:
        raise HTTPException(
            status_code=404,
            detail=f"Config not found: {source_id}"
        )

    db.delete(config)
    db.commit()

    return {"message": f"Config deleted: {source_id}"}


# ============================================================================
# Utility Endpoints
# ============================================================================

@router.get("/{source_id}/keywords")
async def get_keywords(source_id: str, db: Session = Depends(get_db)):
    """
    특정 소스의 키워드만 조회

    Returns:
        {
            "source_id": "...",
            "keywords": [...]
        }
    """
    config = db.query(CrawlerConfig).filter(
        CrawlerConfig.source_id == source_id
    ).first()

    if not config:
        raise HTTPException(
            status_code=404,
            detail=f"Config not found: {source_id}"
        )

    return {
        "source_id": source_id,
        "keywords": config.keywords or []
    }


@router.put("/{source_id}/keywords")
async def update_keywords(
    source_id: str,
    keywords: List[str],
    db: Session = Depends(get_db)
):
    """
    키워드만 업데이트

    Body:
        ["키워드1", "키워드2", ...]

    Returns:
        업데이트된 설정 객체
    """
    config = db.query(CrawlerConfig).filter(
        CrawlerConfig.source_id == source_id
    ).first()

    if not config:
        raise HTTPException(
            status_code=404,
            detail=f"Config not found: {source_id}"
        )

    config.keywords = keywords
    config.updated_at = datetime.now()

    db.commit()
    db.refresh(config)

    return config.to_dict()


@router.get("/{source_id}/enabled")
async def get_enabled_status(source_id: str, db: Session = Depends(get_db)):
    """
    활성화 상태 조회

    Returns:
        {
            "source_id": "...",
            "enabled": true/false
        }
    """
    config = db.query(CrawlerConfig).filter(
        CrawlerConfig.source_id == source_id
    ).first()

    if not config:
        raise HTTPException(
            status_code=404,
            detail=f"Config not found: {source_id}"
        )

    return {
        "source_id": source_id,
        "enabled": config.enabled
    }


@router.put("/{source_id}/enabled")
async def update_enabled_status(
    source_id: str,
    enabled: bool,
    db: Session = Depends(get_db)
):
    """
    활성화 상태만 업데이트

    Body:
        true 또는 false

    Returns:
        업데이트된 설정 객체
    """
    config = db.query(CrawlerConfig).filter(
        CrawlerConfig.source_id == source_id
    ).first()

    if not config:
        raise HTTPException(
            status_code=404,
            detail=f"Config not found: {source_id}"
        )

    config.enabled = enabled
    config.updated_at = datetime.now()

    db.commit()
    db.refresh(config)

    return config.to_dict()
