"""
크롤링 설정 모델
각 도메인별 독립적인 설정 관리
"""
from datetime import datetime
from sqlalchemy import Column, Integer, String, Text, Boolean, DateTime
from sqlalchemy.dialects.postgresql import JSONB
from src.core.database import Base


class JBTPConfig(Base):
    """JBTP 크롤링 설정"""
    __tablename__ = 'jbtp_config'

    id = Column(Integer, primary_key=True)
    config_type = Column(String(50), nullable=False)  # 'notices' or 'news_events'
    name = Column(String(200), nullable=False)         # "사업공고", "바이오 뉴스"
    board_url = Column(Text, nullable=False)           # 게시판 URL
    keywords = Column(JSONB, default=[])               # 필터링 키워드
    max_pages = Column(Integer, default=5)             # 크롤링할 최대 페이지 수
    date_range_days = Column(Integer, default=30)      # 검색 기간 (일)
    enabled = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.now)
    updated_at = Column(DateTime, default=datetime.now, onupdate=datetime.now)

    def to_dict(self):
        return {
            'id': self.id,
            'config_type': self.config_type,
            'name': self.name,
            'board_url': self.board_url,
            'keywords': self.keywords or [],
            'max_pages': self.max_pages or 5,
            'date_range_days': self.date_range_days or 30,
            'enabled': self.enabled,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None,
        }


class BinetConfig(Base):
    """BI Center 크롤링 설정"""
    __tablename__ = 'binet_config'

    id = Column(Integer, primary_key=True)
    region_name = Column(String(50), nullable=False)   # "전북"
    region_code = Column(String(10), nullable=False)   # "063"
    keywords = Column(JSONB, default=[])
    enabled = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.now)
    updated_at = Column(DateTime, default=datetime.now, onupdate=datetime.now)

    def to_dict(self):
        return {
            'id': self.id,
            'region_name': self.region_name,
            'region_code': self.region_code,
            'keywords': self.keywords or [],
            'enabled': self.enabled,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None,
        }


class NTISConfig(Base):
    """NTIS API 설정"""
    __tablename__ = 'ntis_config'

    id = Column(Integer, primary_key=True)
    api_key = Column(Text)
    search_keywords = Column(JSONB, default=[])        # API 검색어
    enabled = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.now)
    updated_at = Column(DateTime, default=datetime.now, onupdate=datetime.now)

    def to_dict(self):
        return {
            'id': self.id,
            'api_key': '***' if self.api_key else '',  # 보안을 위해 마스킹
            'api_key_length': len(self.api_key) if self.api_key else 0,
            'search_keywords': self.search_keywords or [],
            'enabled': self.enabled,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None,
        }


class BizinfoConfig(Base):
    """Bizinfo API 설정"""
    __tablename__ = 'bizinfo_config'

    id = Column(Integer, primary_key=True)
    api_key = Column(Text)
    search_keywords = Column(JSONB, default=[])
    enabled = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.now)
    updated_at = Column(DateTime, default=datetime.now, onupdate=datetime.now)

    def to_dict(self):
        return {
            'id': self.id,
            'api_key': '***' if self.api_key else '',  # 보안을 위해 마스킹
            'api_key_length': len(self.api_key) if self.api_key else 0,
            'search_keywords': self.search_keywords or [],
            'enabled': self.enabled,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None,
        }
