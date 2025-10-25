"""
PostgreSQL 데이터베이스 연결 및 모델
"""

import os
from datetime import datetime
from dotenv import load_dotenv
from pathlib import Path
from sqlalchemy import create_engine, Column, Integer, String, Text, Boolean, DateTime, JSON
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

# .env 파일 로드
load_dotenv(Path(__file__).parent.parent / '.env')

# 데이터베이스 설정
DB_HOST = os.getenv('AWS_DB_HOST')
DB_PORT = os.getenv('AWS_DB_PORT', '5432')
DB_NAME = os.getenv('AWS_DB_NAME')
DB_USER = os.getenv('AWS_DB_USER')
DB_PASSWORD = os.getenv('AWS_DB_PASSWORD')

DATABASE_URL = f"postgresql://{DB_USER}:{DB_PASSWORD}@{DB_HOST}:{DB_PORT}/{DB_NAME}"

# SQLAlchemy 엔진 생성
engine = create_engine(
    DATABASE_URL,
    pool_size=10,
    pool_recycle=3600,
    pool_pre_ping=True,
)

# 세션 팩토리
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()


def get_db():
    """데이터베이스 세션 가져오기"""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


class CrawlerConfig(Base):
    """크롤러 설정 모델"""
    __tablename__ = 'crawler_configs'

    id = Column(Integer, primary_key=True)
    source_id = Column(String(50), unique=True, nullable=False)  # jbtp, ntis, bizinfo, bi_center
    keywords = Column(JSON, default=[])  # 키워드 배열
    enabled = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.now)
    updated_at = Column(DateTime, default=datetime.now, onupdate=datetime.now)

    def to_dict(self):
        """딕셔너리로 변환"""
        return {
            'id': self.id,
            'source_id': self.source_id,
            'keywords': self.keywords or [],
            'enabled': self.enabled,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None,
        }


class CrawlResult(Base):
    """크롤링 결과 모델"""
    __tablename__ = 'crawl_results'

    id = Column(Integer, primary_key=True)
    source_id = Column(String(50), nullable=False)
    title = Column(Text, nullable=False)
    link = Column(Text)
    date = Column(String(100))
    board = Column(String(100))
    keywords_matched = Column(JSON, default=[])  # 매칭된 키워드 배열
    crawled_at = Column(DateTime, default=datetime.now)

    def to_dict(self):
        """딕셔너리로 변환"""
        return {
            'id': self.id,
            'source_id': self.source_id,
            'title': self.title,
            'link': self.link,
            'date': self.date,
            'board': self.board,
            'keywords_matched': self.keywords_matched or [],
            'crawled_at': self.crawled_at.isoformat() if self.crawled_at else None,
        }


# 테이블 생성
def init_db():
    """데이터베이스 테이블 생성"""
    Base.metadata.create_all(bind=engine)
