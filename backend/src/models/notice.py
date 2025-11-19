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
from src.constants.sources import NoticeSource


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
    crawler_source_id = Column(String(50))  # NoticeSource enum values: 'source:jbtp:local', 'source:jbtp:external', 'source:ntis:rss', 'source:bizinfo:api'
    source_board_name = Column(String(100))     # Original board name

    # Categorization
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

    # Additional Details
    organization = Column(String(200))  # Organizing institution
    department = Column(String(200))    # Department/division
    contact = Column(String(200))       # Contact information
    attachment_links = Column(JSON, default=list)  # Attachment URLs

    # Content Type and Viewer
    content_type = Column(String(20))   # 'text', 'html', 'pdf_viewer'
    content_viewer_url = Column(Text)   # PDF viewer URL (for JBTP)

    # System Fields
    created_at = Column(DateTime, default=datetime.now)
    updated_at = Column(DateTime, default=datetime.now, onupdate=datetime.now)
    created_by = Column(String(100))
    updated_by = Column(String(100))

    # Full-text Search (PostgreSQL specific)
    search_vector = Column(TSVECTOR)

    # Raw crawled data (preserved from crawl queue)
    raw_data = Column(JSON)

    # Check constraints
    __table_args__ = (
        CheckConstraint(
            "origin_type IN ('crawled', 'manual')",
            name='check_origin_type'
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
            'tags': self.tags or [],
            'status': self.status,
            'published_at': self.published_at.isoformat() if self.published_at else None,
            'deadline': self.deadline.isoformat() if self.deadline else None,
            'application_start': self.application_start.isoformat() if self.application_start else None,
            'application_end': self.application_end.isoformat() if self.application_end else None,
            'announcement_date': self.announcement_date.isoformat() if self.announcement_date else None,
            'crawler_extracted_at': self.crawler_extracted_at.isoformat() if self.crawler_extracted_at else None,
            'organization': self.organization,
            'department': self.department,
            'contact': self.contact,
            'attachment_links': self.attachment_links or [],
            'content_type': self.content_type,
            'content_viewer_url': self.content_viewer_url,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None,
            'created_by': self.created_by,
            'updated_by': self.updated_by,
            'raw_data': self.raw_data,
        }


class CrawlQueue(Base):
    """
    Temporary storage for crawled items before publishing
    """
    __tablename__ = 'notice_crawl_queue'

    # Primary Key
    id = Column(Integer, primary_key=True)

    # Source Information
    crawler_source_id = Column(String(50), nullable=False)  # 'source:jbtp:local', 'source:ntis:rss', 'source:bizinfo:api'
    source_board_name = Column(String(100))                     # Board name

    # Crawled Data
    title = Column(Text, nullable=False)
    source_url = Column(Text)
    crawler_extracted_at = Column(DateTime, default=datetime.now)

    # Structured Data (parsed from raw_data)
    application_deadline = Column(DateTime)  # Application deadline (마감일) - TIMESTAMP
    source_published_date = Column(Date)  # Published date from source
    organization = Column(String(255))  # Organization name
    department = Column(String(255))  # Department name
    contact_info = Column(String(255))  # Contact information
    source_view_count = Column(Integer, default=0)  # View count from source
    source_status = Column(String(50))  # Status from source (접수중, 마감, etc)

    # Processing State
    published_notice_id = Column(Integer, ForeignKey('support_notices.id', ondelete='SET NULL'))

    # Approval/Rejection State (three-state workflow: pending -> approved -> published OR pending -> rejected)
    approval_status = Column(String(20), default='pending')  # 'pending', 'approved', 'rejected'
    approval_change_reason = Column(Text)        # Reason for approval/rejection
    approval_changed_at = Column(DateTime)       # When approval status was changed
    approval_changed_by = Column(String(100))    # User who changed approval status (for future auth)

    # Legacy fields (kept for backward compatibility)
    rejection_reason = Column(Text)           # Deprecated: use approval_change_reason
    rejected_at = Column(DateTime)            # Deprecated: use approval_changed_at
    rejected_by = Column(String(100))         # Deprecated: use approval_changed_by

    # Additional Metadata
    raw_data = Column(JSON)  # Full crawled data
    matched_keywords = Column(JSON, default=list)  # Keywords that matched this notice
    suggested_tags = Column(JSON, default=list)  # Auto-suggested tags based on keywords

    # Timestamps
    created_at = Column(DateTime, default=datetime.now)

    def to_dict(self) -> dict:
        """Convert to dictionary for JSON serialization"""
        return {
            'id': self.id,
            'crawler_source_id': self.crawler_source_id,
            'source_board_name': self.source_board_name,
            'title': self.title,
            'source_url': self.source_url,
            'application_deadline': self.application_deadline.isoformat() if self.application_deadline else None,
            'source_published_date': self.source_published_date.isoformat() if self.source_published_date else None,
            'organization': self.organization,
            'department': self.department,
            'contact_info': self.contact_info,
            'source_view_count': self.source_view_count,
            'source_status': self.source_status,
            'crawler_extracted_at': self.crawler_extracted_at.isoformat() if self.crawler_extracted_at else None,
            'published_notice_id': self.published_notice_id,
            'approval_status': self.approval_status,
            'approval_change_reason': self.approval_change_reason,
            'approval_changed_at': self.approval_changed_at.isoformat() if self.approval_changed_at else None,
            'approval_changed_by': self.approval_changed_by,
            'rejection_reason': self.rejection_reason,  # Legacy field
            'rejected_at': self.rejected_at.isoformat() if self.rejected_at else None,  # Legacy field
            'rejected_by': self.rejected_by,  # Legacy field
            'raw_data': self.raw_data,
            'matched_keywords': self.matched_keywords or [],
            'suggested_tags': self.suggested_tags or [],
            'created_at': self.created_at.isoformat() if self.created_at else None,
        }
