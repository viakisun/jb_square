"""
KSIC Code Model - Korean Standard Industry Classification
Manages bio industry classification codes
"""

from sqlalchemy import Column, String, Boolean, TIMESTAMP, Text, func, CheckConstraint
from src.core.database import Base


class KsicCode(Base):
    """KSIC 코드 마스터 테이블"""
    __tablename__ = 'ksic_codes'

    # Primary Key
    code = Column(String(10), primary_key=True)

    # Basic Information
    name = Column(String(255), nullable=False)
    description = Column(Text)

    # Classification
    category = Column(
        String(20),
        nullable=False,
        default='NON_BIO',
        index=True
    )

    # Status
    is_active = Column(Boolean, default=True, index=True)

    # Metadata
    created_at = Column(TIMESTAMP, server_default=func.now())
    updated_at = Column(TIMESTAMP, server_default=func.now(), onupdate=func.now())

    # Constraints
    __table_args__ = (
        CheckConstraint(
            "category IN ('BIO_CORE', 'BIO_RELATED', 'NON_BIO')",
            name='check_category'
        ),
    )

    def to_dict(self, include_stats: bool = False) -> dict:
        """Convert to dictionary representation"""
        result = {
            'code': self.code,
            'name': self.name,
            'description': self.description,
            'category': self.category,
            'is_active': self.is_active,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None,
        }

        return result

    def is_bio(self) -> bool:
        """Check if this code is bio-related (CORE or RELATED)"""
        return self.category in ('BIO_CORE', 'BIO_RELATED')

    def __repr__(self):
        return f"<KsicCode(code='{self.code}', name='{self.name}', category='{self.category}')>"
