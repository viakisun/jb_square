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
    __tablename__ = 'notices'

    # Primary Key
    id = Column(Integer, primary_key=True)

    # Basic Information
    title = Column(Text, nullable=False)
    content = Column(Text)
    link = Column(Text)

    # Source Tracking
    source_type = Column(
        String(20),
        nullable=False,
        # 'crawled' or 'manual'
    )
    source_id = Column(String(50))  # 'jbtp', 'ntis', 'bizinfo', 'manual'
    board = Column(String(100))     # Original board name

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
    crawled_at = Column(DateTime)
    original_date = Column(String(100))  # Date string from source

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
            "source_type IN ('crawled', 'manual')",
            name='check_source_type'
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
            'source_type': self.source_type,
            'source_id': self.source_id,
            'board': self.board,
            'category': self.category,
            'tags': self.tags or [],
            'status': self.status,
            'published_at': self.published_at.isoformat() if self.published_at else None,
            'deadline': self.deadline.isoformat() if self.deadline else None,
            'application_start': self.application_start.isoformat() if self.application_start else None,
            'application_end': self.application_end.isoformat() if self.application_end else None,
            'announcement_date': self.announcement_date.isoformat() if self.announcement_date else None,
            'crawled_at': self.crawled_at.isoformat() if self.crawled_at else None,
            'original_date': self.original_date,
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
    __tablename__ = 'crawl_queue'

    # Primary Key
    id = Column(Integer, primary_key=True)

    # Source Information
    source_id = Column(String(50), nullable=False)  # 'jbtp', 'ntis', 'bizinfo'
    board = Column(String(100))                     # Board name

    # Crawled Data
    title = Column(Text, nullable=False)
    link = Column(Text)
    date = Column(String(100))  # Original date string
    extracted_at = Column(DateTime, default=datetime.now)

    # Processing State
    selected = Column(Boolean, default=False)   # User selected for publishing
    processed = Column(Boolean, default=False)  # Already published/discarded
    notice_id = Column(Integer, ForeignKey('notices.id', ondelete='SET NULL'))

    # Rejection/Hidden State (prevents re-crawling unwanted items)
    rejection_status = Column(String(20))  # NULL (pending), 'rejected' (hidden), 'kept' (to publish)
    rejection_reason = Column(Text)        # Optional notes on why rejected
    rejected_at = Column(DateTime)         # When item was rejected
    rejected_by = Column(String(100))      # User who rejected (for future auth)

    # Additional Metadata
    raw_data = Column(JSON)  # Full crawled data

    # Timestamps
    created_at = Column(DateTime, default=datetime.now)
    processed_at = Column(DateTime)

    def to_dict(self) -> dict:
        """Convert to dictionary for JSON serialization"""
        return {
            'id': self.id,
            'source_id': self.source_id,
            'board': self.board,
            'title': self.title,
            'link': self.link,
            'date': self.date,
            'extracted_at': self.extracted_at.isoformat() if self.extracted_at else None,
            'selected': self.selected,
            'processed': self.processed,
            'notice_id': self.notice_id,
            'rejection_status': self.rejection_status,
            'rejection_reason': self.rejection_reason,
            'rejected_at': self.rejected_at.isoformat() if self.rejected_at else None,
            'rejected_by': self.rejected_by,
            'raw_data': self.raw_data,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'processed_at': self.processed_at.isoformat() if self.processed_at else None,
        }
