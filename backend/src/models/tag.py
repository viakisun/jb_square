"""
ContentTag Model
SQLAlchemy ORM model for JB SQUARE tag management
"""

from datetime import datetime
from sqlalchemy import Column, Integer, String, Text, Boolean, DateTime
from src.core.database import Base


class ContentTag(Base):
    """
    Content tags for notice categorization
    Master table for user-facing tags (not search keywords)
    """
    __tablename__ = 'content_tags'

    # Primary Key
    id = Column(Integer, primary_key=True)

    # Basic Information
    name = Column(String(50), unique=True, nullable=False)
    slug = Column(String(50), unique=True, nullable=False)
    description = Column(Text)

    # Display Properties
    color_hex = Column(String(7), default='#E3F2FD')
    icon = Column(String(50))

    # Categorization
    category = Column(String(30))  # 'bio', 'region', 'support_type', etc.

    # Status & Ordering
    is_active = Column(Boolean, default=True)
    display_order = Column(Integer, default=0)

    # Usage Statistics
    usage_count = Column(Integer, default=0)

    # Timestamps
    created_at = Column(DateTime, default=datetime.now)
    updated_at = Column(DateTime, default=datetime.now, onupdate=datetime.now)

    def to_dict(self) -> dict:
        """Convert to dictionary for JSON serialization"""
        return {
            'id': self.id,
            'name': self.name,
            'slug': self.slug,
            'description': self.description,
            'color_hex': self.color_hex,
            'icon': self.icon,
            'category': self.category,
            'is_active': self.is_active,
            'display_order': self.display_order,
            'usage_count': self.usage_count,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None,
        }
