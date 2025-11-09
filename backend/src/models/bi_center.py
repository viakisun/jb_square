"""
BI Center and BI Company Models
SQLAlchemy ORM models for startup incubator centers and tenant companies
"""

from datetime import datetime
from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from src.core.database import Base


class BICenter(Base):
    """
    Startup Business Incubator Centers
    """
    __tablename__ = 'bi_centers'

    # Primary Key
    id = Column(Integer, primary_key=True)

    # Basic Information
    region = Column(String(50), nullable=False)
    city = Column(String(100))
    org_name = Column(String(200), nullable=False)
    center_name = Column(String(200), nullable=False)
    contact = Column(String(200))
    specialization = Column(Text)
    vacant_rooms = Column(String(50))
    location = Column(String(500))
    center_url = Column(String(500))

    # Statistics
    companies_count = Column(Integer, default=0)

    # Timestamps
    created_at = Column(DateTime, default=datetime.now)
    updated_at = Column(DateTime, default=datetime.now, onupdate=datetime.now)

    # Relationship
    companies = relationship("BICompany", back_populates="center", cascade="all, delete-orphan")

    def to_dict(self) -> dict:
        """Convert to dictionary for JSON serialization"""
        return {
            'id': self.id,
            'region': self.region,
            'city': self.city,
            'org_name': self.org_name,
            'center_name': self.center_name,
            'contact': self.contact,
            'specialization': self.specialization,
            'vacant_rooms': self.vacant_rooms,
            'location': self.location,
            'center_url': self.center_url,
            'companies_count': self.companies_count,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None,
        }


class BICompany(Base):
    """
    Tenant Companies in Business Incubator Centers
    """
    __tablename__ = 'bi_companies'

    # Primary Key
    id = Column(Integer, primary_key=True)

    # Foreign Key
    center_id = Column(Integer, ForeignKey('bi_centers.id', ondelete='CASCADE'), nullable=False)

    # Company Information
    company_name = Column(String(200), nullable=False)
    business_field = Column(String(200))
    product = Column(Text)

    # Timestamps
    created_at = Column(DateTime, default=datetime.now)
    updated_at = Column(DateTime, default=datetime.now, onupdate=datetime.now)

    # Relationship
    center = relationship("BICenter", back_populates="companies")

    def to_dict(self) -> dict:
        """Convert to dictionary for JSON serialization"""
        return {
            'id': self.id,
            'center_id': self.center_id,
            'company_name': self.company_name,
            'business_field': self.business_field,
            'product': self.product,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None,
        }
