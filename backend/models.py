"""
SQLAlchemy 데이터베이스 모델
"""

from datetime import datetime
from sqlalchemy import create_engine, Column, Integer, String, Text, Boolean, DateTime, Date, Float
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from backend.config import Config

Base = declarative_base()

# 데이터베이스 엔진 생성
engine = create_engine(
    Config.SQLALCHEMY_DATABASE_URI,
    **Config.SQLALCHEMY_ENGINE_OPTIONS
)

# 세션 팩토리
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def get_db():
    """데이터베이스 세션 가져오기"""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

class Content(Base):
    """콘텐츠 (공고/행사) 모델"""
    __tablename__ = 'contents'

    id = Column(Integer, primary_key=True)
    title = Column(Text, nullable=False)
    summary = Column(Text)
    link = Column(Text)
    source = Column(Text, nullable=False)  # JBTP, NTIS, BizInfo
    category = Column(Text)  # 공고, 행사, 교육, 채용
    deadline = Column(Date)
    tags = Column(Text)  # JSON string
    status = Column(Text, default='pending')  # pending, published, hold, deleted
    matched_keywords = Column(Text)  # JSON string

    # 소스별 추가 필드
    region = Column(Text)
    board = Column(Text)
    ministry = Column(Text)
    receive_date = Column(Text)
    dday = Column(Text)
    period = Column(Text)
    agency = Column(Text)
    reg_date = Column(Text)
    views = Column(Text)

    crawled_at = Column(DateTime)
    published_at = Column(DateTime)
    created_at = Column(DateTime, default=datetime.now)
    updated_at = Column(DateTime, default=datetime.now, onupdate=datetime.now)

    def to_dict(self):
        """딕셔너리로 변환"""
        return {
            'id': self.id,
            'title': self.title,
            'summary': self.summary,
            'link': self.link,
            'source': self.source,
            'category': self.category,
            'deadline': self.deadline.isoformat() if self.deadline else None,
            'tags': self.tags,
            'status': self.status,
            'matched_keywords': self.matched_keywords,
            'region': self.region,
            'board': self.board,
            'ministry': self.ministry,
            'receive_date': self.receive_date,
            'dday': self.dday,
            'period': self.period,
            'agency': self.agency,
            'reg_date': self.reg_date,
            'views': self.views,
            'crawled_at': self.crawled_at.isoformat() if self.crawled_at else None,
            'published_at': self.published_at.isoformat() if self.published_at else None,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None,
        }

class Organization(Base):
    """기업·기관 모델"""
    __tablename__ = 'organizations'

    id = Column(Integer, primary_key=True)
    name = Column(Text, nullable=False)
    type = Column(Text)  # 기업, 연구기관, 지원기관
    field = Column(Text)  # 의료기기, 바이오, 제약...
    contact_person = Column(Text)
    phone = Column(Text)
    email = Column(Text)
    website = Column(Text)
    region = Column(Text)
    city = Column(Text)
    address = Column(Text)
    is_resident = Column(Boolean, default=False)
    resident_center = Column(Text)
    support_programs = Column(Text)  # JSON string
    notes = Column(Text)
    created_at = Column(DateTime, default=datetime.now)
    updated_at = Column(DateTime, default=datetime.now, onupdate=datetime.now)

    def to_dict(self):
        """딕셔너리로 변환"""
        return {
            'id': self.id,
            'name': self.name,
            'type': self.type,
            'field': self.field,
            'contact_person': self.contact_person,
            'phone': self.phone,
            'email': self.email,
            'website': self.website,
            'region': self.region,
            'city': self.city,
            'address': self.address,
            'is_resident': self.is_resident,
            'resident_center': self.resident_center,
            'support_programs': self.support_programs,
            'notes': self.notes,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None,
        }

class CrawlLog(Base):
    """크롤링 로그 모델"""
    __tablename__ = 'crawl_logs'

    id = Column(Integer, primary_key=True)
    source = Column(Text, nullable=False)  # JBTP, NTIS, BizInfo, ALL
    status = Column(Text, nullable=False)  # success, error
    notices_found = Column(Integer, default=0)
    bio_notices_found = Column(Integer, default=0)
    duration = Column(Float)  # seconds
    error_message = Column(Text)
    started_at = Column(DateTime, nullable=False)
    finished_at = Column(DateTime)

    def to_dict(self):
        """딕셔너리로 변환"""
        return {
            'id': self.id,
            'source': self.source,
            'status': self.status,
            'notices_found': self.notices_found,
            'bio_notices_found': self.bio_notices_found,
            'duration': self.duration,
            'error_message': self.error_message,
            'started_at': self.started_at.isoformat() if self.started_at else None,
            'finished_at': self.finished_at.isoformat() if self.finished_at else None,
        }

class User(Base):
    """사용자 모델"""
    __tablename__ = 'users'

    id = Column(Integer, primary_key=True)
    name = Column(Text, nullable=False)
    email = Column(Text, unique=True, nullable=False)
    password_hash = Column(Text, nullable=False)
    role = Column(Text, default='editor')  # admin, editor
    last_login = Column(DateTime)
    created_at = Column(DateTime, default=datetime.now)

    def to_dict(self):
        """딕셔너리로 변환 (비밀번호 제외)"""
        return {
            'id': self.id,
            'name': self.name,
            'email': self.email,
            'role': self.role,
            'last_login': self.last_login.isoformat() if self.last_login else None,
            'created_at': self.created_at.isoformat() if self.created_at else None,
        }

class Setting(Base):
    """시스템 설정 모델"""
    __tablename__ = 'settings'

    key = Column(Text, primary_key=True)
    value = Column(Text)
    updated_at = Column(DateTime, default=datetime.now, onupdate=datetime.now)

    def to_dict(self):
        """딕셔너리로 변환"""
        return {
            'key': self.key,
            'value': self.value,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None,
        }
