"""
Notice and CrawlQueue Models
SQLAlchemy ORM models for JB SQUARE notice management
"""

from datetime import datetime
from typing import List, Optional
from sqlalchemy import (
    Column, Integer, String, Text, Boolean, DateTime, Date,
    JSON, ForeignKey, CheckConstraint
)
from sqlalchemy.dialects.postgresql import TSVECTOR
from src.core.database import Base


class Notice(Base):
    """
    Published notices (both crawled and manually entered)
    """
    __tablename__ = 'support_notices'

    # Primary Key
    id = Column(Integer, primary_key=True)

    # Basic Information
    title = Column(Text, nullable=False)
    content = Column(Text)
    link = Column(Text)

    # Source Tracking
    origin_type = Column(
        String(20),
        nullable=False,
        # 'crawled' or 'manual'
    )
    crawler_source_id = Column(String(50))  # 'jbtp', 'ntis', 'bizinfo', 'manual'
    source_board_name = Column(String(100))     # Original board name

    # Categorization
    category = Column(
        String(20),
        nullable=False,
        # 'government', 'business', 'rnd', 'startup'
    )
    tags = Column(JSON, default=list)  # Additional tags

    # Status & Publishing
    status = Column(
        String(20),
        default='pending',
        # 'pending', 'published', 'archived'
    )
    published_at = Column(DateTime)

    # Important Dates
    deadline = Column(DateTime)
    application_start = Column(DateTime)
    application_end = Column(DateTime)
    announcement_date = Column(Date)

    # Crawling Metadata
    crawler_extracted_at = Column(DateTime)
    source_date_string = Column(String(100))  # Date string from source

    # Additional Details
    organization = Column(String(200))  # Organizing institution
    department = Column(String(200))    # Department/division
    contact = Column(String(200))       # Contact information
    attachment_links = Column(JSON, default=list)  # Attachment URLs

    # System Fields
    created_at = Column(DateTime, default=datetime.now)
    updated_at = Column(DateTime, default=datetime.now, onupdate=datetime.now)
    created_by = Column(String(100))
    updated_by = Column(String(100))

    # Full-text Search (PostgreSQL specific)
    search_vector = Column(TSVECTOR)

    # Check constraints
    __table_args__ = (
        CheckConstraint(
            "origin_type IN ('crawled', 'manual')",
            name='check_origin_type'
        ),
        CheckConstraint(
            "category IN ('government', 'business', 'rnd', 'startup')",
            name='check_category'
        ),
        CheckConstraint(
            "status IN ('pending', 'published', 'archived')",
            name='check_status'
        ),
    )

    def to_dict(self) -> dict:
        """Convert to dictionary for JSON serialization"""
        return {
            'id': self.id,
            'title': self.title,
            'content': self.content,
            'link': self.link,
            'origin_type': self.origin_type,
            'crawler_source_id': self.crawler_source_id,
            'source_board_name': self.source_board_name,
            'category': self.category,
            'tags': self.tags or [],
            'status': self.status,
            'published_at': self.published_at.isoformat() if self.published_at else None,
            'deadline': self.deadline.isoformat() if self.deadline else None,
            'application_start': self.application_start.isoformat() if self.application_start else None,
            'application_end': self.application_end.isoformat() if self.application_end else None,
            'announcement_date': self.announcement_date.isoformat() if self.announcement_date else None,
            'crawler_extracted_at': self.crawler_extracted_at.isoformat() if self.crawler_extracted_at else None,
            'source_date_string': self.source_date_string,
            'organization': self.organization,
            'department': self.department,
            'contact': self.contact,
            'attachment_links': self.attachment_links or [],
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None,
            'created_by': self.created_by,
            'updated_by': self.updated_by,
        }


class CrawlQueue(Base):
    """
    Temporary storage for crawled items before publishing
    """
    __tablename__ = 'notice_crawl_queue'

    # Primary Key
    id = Column(Integer, primary_key=True)

    # Source Information
    crawler_source_id = Column(String(50), nullable=False)  # 'jbtp', 'ntis', 'bizinfo'
    source_board_name = Column(String(100))                     # Board name

    # Crawled Data
    title = Column(Text, nullable=False)
    link = Column(Text)
    source_date_string = Column(String(100))  # Original date string (deprecated)

    # Structured Data (parsed from raw_data)
    deadline = Column(DateTime)  # Application deadline (마감일)
    published_date = Column(Date)  # Published date from source
    organization = Column(String(255))  # Organization name
    department = Column(String(255))  # Department name
    contact = Column(String(255))  # Contact information
    views = Column(Integer, default=0)  # View count from source
    status = Column(String(50))  # Status from source (접수중, 마감, etc)

    crawler_extracted_at = Column(DateTime, default=datetime.now)

    # Processing State
    is_selected = Column(Boolean, default=False)   # User selected for publishing
    is_processed = Column(Boolean, default=False)  # Already published/discarded
    notice_id = Column(Integer, ForeignKey('support_notices.id', ondelete='SET NULL'))

    # Rejection/Hidden State (prevents re-crawling unwanted items)
    rejection_status = Column(String(20))  # NULL (pending), 'rejected' (hidden), 'kept' (to publish)
    rejection_reason = Column(Text)        # Optional notes on why rejected
    rejected_at = Column(DateTime)         # When item was rejected
    rejected_by = Column(String(100))      # User who rejected (for future auth)

    # Additional Metadata
    raw_data = Column(JSON)  # Full crawled data
    matched_keywords = Column(JSON, default=list)  # Keywords that matched this notice

    # Timestamps
    created_at = Column(DateTime, default=datetime.now)
    published_at = Column(DateTime)

    def to_dict(self) -> dict:
        """Convert to dictionary for JSON serialization"""
        return {
            'id': self.id,
            'crawler_source_id': self.crawler_source_id,
            'source_board_name': self.source_board_name,
            'title': self.title,
            'link': self.link,
            'source_date_string': self.source_date_string,
            'deadline': self.deadline.isoformat() if self.deadline else None,
            'published_date': self.published_date.isoformat() if self.published_date else None,
            'organization': self.organization,
            'department': self.department,
            'contact': self.contact,
            'views': self.views,
            'status': self.status,
            'crawler_extracted_at': self.crawler_extracted_at.isoformat() if self.crawler_extracted_at else None,
            'is_selected': self.is_selected,
            'is_processed': self.is_processed,
            'notice_id': self.notice_id,
            'rejection_status': self.rejection_status,
            'rejection_reason': self.rejection_reason,
            'rejected_at': self.rejected_at.isoformat() if self.rejected_at else None,
            'rejected_by': self.rejected_by,
            'raw_data': self.raw_data,
            'matched_keywords': self.matched_keywords or [],
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'published_at': self.published_at.isoformat() if self.published_at else None,
        }
