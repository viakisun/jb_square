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

# .env 파일 로드 (로컬 개발 환경용)
# Docker 환경에서는 환경 변수가 이미 설정되어 있음
env_path = Path(__file__).parent.parent.parent / '.env'
if env_path.exists():
    load_dotenv(env_path, override=True)
    print(f"Loading .env from: {env_path}")
else:
    print("No .env file found, using environment variables")

# 데이터베이스 설정
DB_HOST = os.getenv('AWS_DB_HOST')
DB_PORT = os.getenv('AWS_DB_PORT', '5432')
DB_NAME = os.getenv('AWS_DB_NAME')
DB_USER = os.getenv('AWS_DB_USER')
DB_PASSWORD = os.getenv('AWS_DB_PASSWORD')

# 데이터베이스 연결 검증
if not all([DB_HOST, DB_NAME, DB_USER, DB_PASSWORD]):
    print(f"Missing database configuration:")
    print(f"  DB_HOST: {'✓' if DB_HOST else '✗'}")
    print(f"  DB_NAME: {'✓' if DB_NAME else '✗'}")
    print(f"  DB_USER: {'✓' if DB_USER else '✗'}")
    print(f"  DB_PASSWORD: {'✓' if DB_PASSWORD else '✗'}")
    raise ValueError("Database configuration incomplete. Please check environment variables.")

DATABASE_URL = f"postgresql://{DB_USER}:{DB_PASSWORD}@{DB_HOST}:{DB_PORT}/{DB_NAME}"
print(f"Connecting to database at {DB_HOST}:{DB_PORT}/{DB_NAME}")

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


# CrawlerConfig는 src/models/crawler_config.py에 정의되어 있습니다
# 이곳의 레거시 정의는 제거되었습니다


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
    # Import models to register them with Base
    # Models are imported in main.py before calling init_db
    Base.metadata.create_all(bind=engine)
