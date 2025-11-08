"""
크롤링 설정 관리 API
운영자가 크롤링 소스와 설정을 관리할 수 있는 API
"""
from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from typing import List, Optional
from pydantic import BaseModel

from src.core.database import get_db
from src.models.crawler_config import JBTPConfig, BinetConfig, NTISConfig, BizinfoConfig

router = APIRouter()


# ============================================
# Pydantic Schemas
# ============================================

class JBTPConfigCreate(BaseModel):
    config_type: str
    name: str
    board_url: str
    keywords: List[str] = []
    date_range_days: int = 30
    enabled: bool = True


class JBTPConfigUpdate(BaseModel):
    name: Optional[str] = None
    board_url: Optional[str] = None
    keywords: Optional[List[str]] = None
    date_range_days: Optional[int] = None
    enabled: Optional[bool] = None


class BinetConfigCreate(BaseModel):
    region_name: str
    region_code: str
    keywords: List[str] = []
    enabled: bool = True


class BinetConfigUpdate(BaseModel):
    region_name: Optional[str] = None
    region_code: Optional[str] = None
    keywords: Optional[List[str]] = None
    enabled: Optional[bool] = None


class NTISConfigUpdate(BaseModel):
    api_key: Optional[str] = None
    search_keywords: Optional[List[str]] = None
    keywords: Optional[List[str]] = None  # 프론트엔드 호환성을 위한 별칭
    date_range_days: Optional[int] = None
    enabled: Optional[bool] = None


class BizinfoConfigUpdate(BaseModel):
    api_key: Optional[str] = None
    search_keywords: Optional[List[str]] = None
    date_range_days: Optional[int] = None
    enabled: Optional[bool] = None


# ============================================
# JBTP 설정 API
# ============================================

@router.get("/jbtp/configs")
async def get_jbtp_configs(
    config_type: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """JBTP 크롤링 설정 목록 조회"""
    query = db.query(JBTPConfig)
    if config_type:
        query = query.filter(JBTPConfig.config_type == config_type)

    configs = query.order_by(JBTPConfig.id).all()
    return {
        "items": [config.to_dict() for config in configs],
        "total": len(configs)
    }


@router.get("/jbtp/configs/{config_id}")
async def get_jbtp_config(config_id: int, db: Session = Depends(get_db)):
    """JBTP 크롤링 설정 상세 조회"""
    config = db.query(JBTPConfig).filter(JBTPConfig.id == config_id).first()
    if not config:
        raise HTTPException(status_code=404, detail="설정을 찾을 수 없습니다")
    return config.to_dict()


@router.post("/jbtp/configs")
async def create_jbtp_config(
    config: JBTPConfigCreate,
    db: Session = Depends(get_db)
):
    """JBTP 크롤링 설정 생성 (새 게시판 추가)"""
    new_config = JBTPConfig(
        config_type=config.config_type,
        name=config.name,
        board_url=config.board_url,
        keywords=config.keywords,
        date_range_days=config.date_range_days,
        enabled=config.enabled
    )
    db.add(new_config)
    db.commit()
    db.refresh(new_config)
    return new_config.to_dict()


@router.put("/jbtp/configs/{config_id}")
async def update_jbtp_config(
    config_id: int,
    config: JBTPConfigUpdate,
    db: Session = Depends(get_db)
):
    """JBTP 크롤링 설정 수정"""
    db_config = db.query(JBTPConfig).filter(JBTPConfig.id == config_id).first()
    if not db_config:
        raise HTTPException(status_code=404, detail="설정을 찾을 수 없습니다")

    if config.name is not None:
        db_config.name = config.name
    if config.board_url is not None:
        db_config.board_url = config.board_url
    if config.keywords is not None:
        db_config.keywords = config.keywords
    if config.date_range_days is not None:
        db_config.date_range_days = config.date_range_days
    if config.enabled is not None:
        db_config.enabled = config.enabled

    db.commit()
    db.refresh(db_config)
    return db_config.to_dict()


@router.delete("/jbtp/configs/{config_id}")
async def delete_jbtp_config(config_id: int, db: Session = Depends(get_db)):
    """JBTP 크롤링 설정 삭제"""
    db_config = db.query(JBTPConfig).filter(JBTPConfig.id == config_id).first()
    if not db_config:
        raise HTTPException(status_code=404, detail="설정을 찾을 수 없습니다")

    db.delete(db_config)
    db.commit()
    return {"message": "설정이 삭제되었습니다"}


# ============================================
# BI Center 설정 API
# ============================================

@router.get("/binet/configs")
async def get_binet_configs(db: Session = Depends(get_db)):
    """BI Center 크롤링 설정 목록 조회"""
    configs = db.query(BinetConfig).order_by(BinetConfig.id).all()
    return {
        "items": [config.to_dict() for config in configs],
        "total": len(configs)
    }


@router.get("/binet/configs/{config_id}")
async def get_binet_config(config_id: int, db: Session = Depends(get_db)):
    """BI Center 크롤링 설정 상세 조회"""
    config = db.query(BinetConfig).filter(BinetConfig.id == config_id).first()
    if not config:
        raise HTTPException(status_code=404, detail="설정을 찾을 수 없습니다")
    return config.to_dict()


@router.post("/binet/configs")
async def create_binet_config(
    config: BinetConfigCreate,
    db: Session = Depends(get_db)
):
    """BI Center 크롤링 설정 생성 (새 지역 추가)"""
    new_config = BinetConfig(
        region_name=config.region_name,
        region_code=config.region_code,
        keywords=config.keywords,
        enabled=config.enabled
    )
    db.add(new_config)
    db.commit()
    db.refresh(new_config)
    return new_config.to_dict()


@router.put("/binet/configs/{config_id}")
async def update_binet_config(
    config_id: int,
    config: BinetConfigUpdate,
    db: Session = Depends(get_db)
):
    """BI Center 크롤링 설정 수정"""
    db_config = db.query(BinetConfig).filter(BinetConfig.id == config_id).first()
    if not db_config:
        raise HTTPException(status_code=404, detail="설정을 찾을 수 없습니다")

    if config.region_name is not None:
        db_config.region_name = config.region_name
    if config.region_code is not None:
        db_config.region_code = config.region_code
    if config.keywords is not None:
        db_config.keywords = config.keywords
    if config.enabled is not None:
        db_config.enabled = config.enabled

    db.commit()
    db.refresh(db_config)
    return db_config.to_dict()


@router.delete("/binet/configs/{config_id}")
async def delete_binet_config(config_id: int, db: Session = Depends(get_db)):
    """BI Center 크롤링 설정 삭제"""
    db_config = db.query(BinetConfig).filter(BinetConfig.id == config_id).first()
    if not db_config:
        raise HTTPException(status_code=404, detail="설정을 찾을 수 없습니다")

    db.delete(db_config)
    db.commit()
    return {"message": "설정이 삭제되었습니다"}


# ============================================
# NTIS API 설정
# ============================================

@router.get("/ntis/config")
async def get_ntis_config(db: Session = Depends(get_db)):
    """NTIS API 설정 조회"""
    config = db.query(NTISConfig).first()
    if not config:
        # 기본 설정 생성
        config = NTISConfig(api_key="", search_keywords=[], date_range_days=30, enabled=True)
        db.add(config)
        db.commit()
        db.refresh(config)
    return config.to_dict()


@router.put("/ntis/config")
async def update_ntis_config(
    config: NTISConfigUpdate,
    db: Session = Depends(get_db)
):
    """NTIS API 설정 수정"""
    db_config = db.query(NTISConfig).first()
    if not db_config:
        # 없으면 생성
        db_config = NTISConfig(api_key="", search_keywords=[], date_range_days=30, enabled=True)
        db.add(db_config)

    if config.api_key is not None:
        db_config.api_key = config.api_key
    if config.search_keywords is not None:
        db_config.search_keywords = config.search_keywords
    # 프론트엔드에서 keywords를 보낼 경우 search_keywords로 처리
    if config.keywords is not None:
        db_config.search_keywords = config.keywords
    if config.date_range_days is not None:
        db_config.date_range_days = config.date_range_days
    if config.enabled is not None:
        db_config.enabled = config.enabled

    db.commit()
    db.refresh(db_config)
    return db_config.to_dict()


# ============================================
# Bizinfo API 설정
# ============================================

@router.get("/bizinfo/config")
async def get_bizinfo_config(db: Session = Depends(get_db)):
    """Bizinfo API 설정 조회"""
    config = db.query(BizinfoConfig).first()
    if not config:
        # 기본 설정 생성
        config = BizinfoConfig(
            api_key="",
            search_keywords=[],
            date_range_days=30,
            enabled=True
        )
        db.add(config)
        db.commit()
        db.refresh(config)
    return config.to_dict()


@router.put("/bizinfo/config")
async def update_bizinfo_config(
    config: BizinfoConfigUpdate,
    db: Session = Depends(get_db)
):
    """Bizinfo API 설정 수정"""
    db_config = db.query(BizinfoConfig).first()
    if not db_config:
        # 없으면 생성
        db_config = BizinfoConfig(
            api_key="",
            search_keywords=[],
            date_range_days=30,
            enabled=True
        )
        db.add(db_config)

    if config.api_key is not None:
        db_config.api_key = config.api_key
    if config.search_keywords is not None:
        db_config.search_keywords = config.search_keywords
    if config.date_range_days is not None:
        db_config.date_range_days = config.date_range_days
    if config.enabled is not None:
        db_config.enabled = config.enabled

    db.commit()
    db.refresh(db_config)
    return db_config.to_dict()
