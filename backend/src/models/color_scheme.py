"""
ColorScheme Model
SQLAlchemy ORM model for JB SQUARE color scheme management
"""

from datetime import datetime
from sqlalchemy import Column, Integer, String, Text, Boolean, DateTime
from src.core.database import Base


class ColorScheme(Base):
    """
    Color schemes for content tags
    Defines predefined color combinations (Red Bio, Green Bio, White Bio, Gray)
    """
    __tablename__ = 'color_schemes'

    # Primary Key
    id = Column(Integer, primary_key=True)

    # Basic Information
    name = Column(String(50), unique=True, nullable=False)
    display_name = Column(String(100), nullable=False)

    # Color Properties
    color_hex = Column(String(7), nullable=False)
    text_color = Column(String(7), nullable=False)

    # Categorization
    category = Column(String(50))
    description = Column(Text)

    # Status
    is_active = Column(Boolean, default=True)

    # Timestamps
    created_at = Column(DateTime, default=datetime.now)
    updated_at = Column(DateTime, default=datetime.now, onupdate=datetime.now)

    def to_dict(self) -> dict:
        """Convert to dictionary for JSON serialization"""
        return {
            'id': self.id,
            'name': self.name,
            'display_name': self.display_name,
            'color_hex': self.color_hex,
            'text_color': self.text_color,
            'category': self.category,
            'description': self.description,
            'is_active': self.is_active,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None,
        }
