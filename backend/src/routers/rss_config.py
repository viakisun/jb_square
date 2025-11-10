"""
RSS Config Router
RSS 뉴스 설정 관리 API
"""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional

from src.core.database import get_db
from src.models.crawler_config import RSSConfig
from pydantic import BaseModel


router = APIRouter(prefix="/crawling/configs/rss", tags=["RSS Config"])


class RSSConfigCreate(BaseModel):
    """RSS 설정 생성 요청"""
    source_id: str
    name: str
    feed_url: str
    keywords: List[str] = []
    date_range_days: int = 30
    enabled: bool = True


class RSSConfigUpdate(BaseModel):
    """RSS 설정 업데이트 요청"""
    name: Optional[str] = None
    feed_url: Optional[str] = None
    keywords: Optional[List[str]] = None
    date_range_days: Optional[int] = None
    enabled: Optional[bool] = None


@router.get("")
async def get_all_rss_configs(db: Session = Depends(get_db)):
    """
    모든 RSS 설정 조회
    """
    configs = db.query(RSSConfig).all()
    return [config.to_dict() for config in configs]


@router.get("/{source_id}")
async def get_rss_config(source_id: str, db: Session = Depends(get_db)):
    """
    특정 RSS 설정 조회
    """
    config = db.query(RSSConfig).filter(RSSConfig.source_id == source_id).first()

    if not config:
        raise HTTPException(status_code=404, detail=f"RSS config not found: {source_id}")

    return config.to_dict()


@router.post("")
async def create_rss_config(data: RSSConfigCreate, db: Session = Depends(get_db)):
    """
    RSS 설정 생성
    """
    # 중복 확인
    existing = db.query(RSSConfig).filter(RSSConfig.source_id == data.source_id).first()
    if existing:
        raise HTTPException(status_code=400, detail=f"RSS config already exists: {data.source_id}")

    # 새 설정 생성
    config = RSSConfig(
        source_id=data.source_id,
        name=data.name,
        feed_url=data.feed_url,
        keywords=data.keywords,
        date_range_days=data.date_range_days,
        enabled=data.enabled
    )

    db.add(config)
    db.commit()
    db.refresh(config)

    return config.to_dict()


@router.put("/{source_id}")
async def update_rss_config(
    source_id: str,
    data: RSSConfigUpdate,
    db: Session = Depends(get_db)
):
    """
    RSS 설정 업데이트
    """
    config = db.query(RSSConfig).filter(RSSConfig.source_id == source_id).first()

    if not config:
        raise HTTPException(status_code=404, detail=f"RSS config not found: {source_id}")

    # 업데이트
    if data.name is not None:
        config.name = data.name
    if data.feed_url is not None:
        config.feed_url = data.feed_url
    if data.keywords is not None:
        config.keywords = data.keywords
    if data.date_range_days is not None:
        config.date_range_days = data.date_range_days
    if data.enabled is not None:
        config.enabled = data.enabled

    db.commit()
    db.refresh(config)

    return config.to_dict()


@router.delete("/{source_id}")
async def delete_rss_config(source_id: str, db: Session = Depends(get_db)):
    """
    RSS 설정 삭제
    """
    config = db.query(RSSConfig).filter(RSSConfig.source_id == source_id).first()

    if not config:
        raise HTTPException(status_code=404, detail=f"RSS config not found: {source_id}")

    db.delete(config)
    db.commit()

    return {"message": f"RSS config deleted: {source_id}"}
