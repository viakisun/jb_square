"""
Tags API Router
Endpoints for managing content tags
"""

from datetime import datetime
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel

from src.core.database import get_db
from src.models.tag import ContentTag


router = APIRouter(prefix="/api/tags", tags=["tags"])


# ========================================
# Request/Response Models
# ========================================

class TagCreate(BaseModel):
    name: str
    slug: str
    description: Optional[str] = None
    color_hex: str = "#E3F2FD"
    icon: Optional[str] = None
    category: Optional[str] = None
    display_order: int = 0


class TagUpdate(BaseModel):
    name: Optional[str] = None
    slug: Optional[str] = None
    description: Optional[str] = None
    color_hex: Optional[str] = None
    icon: Optional[str] = None
    category: Optional[str] = None
    is_active: Optional[bool] = None
    display_order: Optional[int] = None


class ReorderRequest(BaseModel):
    tag_ids: List[int]  # Ordered list of tag IDs


# ========================================
# API Endpoints
# ========================================

@router.get("")
async def list_tags(
    active_only: bool = False,
    category: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """
    Get list of all tags

    Query params:
    - active_only: If true, return only active tags
    - category: Filter by category (bio, region, support_type, etc.)
    """
    query = db.query(ContentTag)

    if active_only:
        query = query.filter(ContentTag.is_active == True)

    if category:
        query = query.filter(ContentTag.category == category)

    tags = query.order_by(ContentTag.display_order, ContentTag.id).all()

    return {
        "tags": [tag.to_dict() for tag in tags],
        "total": len(tags)
    }


@router.get("/active")
async def list_active_tags(db: Session = Depends(get_db)):
    """Get only active tags (shortcut endpoint)"""
    tags = db.query(ContentTag).filter(
        ContentTag.is_active == True
    ).order_by(ContentTag.display_order, ContentTag.id).all()

    return {
        "tags": [tag.to_dict() for tag in tags],
        "total": len(tags)
    }


@router.get("/{tag_id}")
async def get_tag(tag_id: int, db: Session = Depends(get_db)):
    """Get tag by ID"""
    tag = db.query(ContentTag).filter(ContentTag.id == tag_id).first()

    if not tag:
        raise HTTPException(status_code=404, detail="Tag not found")

    return tag.to_dict()


@router.post("")
async def create_tag(data: TagCreate, db: Session = Depends(get_db)):
    """Create a new tag"""

    # Check if name already exists
    existing = db.query(ContentTag).filter(ContentTag.name == data.name).first()
    if existing:
        raise HTTPException(status_code=400, detail="Tag with this name already exists")

    # Check if slug already exists
    existing = db.query(ContentTag).filter(ContentTag.slug == data.slug).first()
    if existing:
        raise HTTPException(status_code=400, detail="Tag with this slug already exists")

    # Create new tag
    tag = ContentTag(
        name=data.name,
        slug=data.slug,
        description=data.description,
        color_hex=data.color_hex,
        icon=data.icon,
        category=data.category,
        display_order=data.display_order,
        is_active=True,
        usage_count=0,
        created_at=datetime.now(),
        updated_at=datetime.now()
    )

    db.add(tag)
    db.commit()
    db.refresh(tag)

    return {
        "message": "Tag created successfully",
        "tag": tag.to_dict()
    }


@router.put("/{tag_id}")
async def update_tag(tag_id: int, data: TagUpdate, db: Session = Depends(get_db)):
    """Update an existing tag"""

    tag = db.query(ContentTag).filter(ContentTag.id == tag_id).first()

    if not tag:
        raise HTTPException(status_code=404, detail="Tag not found")

    # Check name uniqueness if changed
    if data.name and data.name != tag.name:
        existing = db.query(ContentTag).filter(ContentTag.name == data.name).first()
        if existing:
            raise HTTPException(status_code=400, detail="Tag with this name already exists")
        tag.name = data.name

    # Check slug uniqueness if changed
    if data.slug and data.slug != tag.slug:
        existing = db.query(ContentTag).filter(ContentTag.slug == data.slug).first()
        if existing:
            raise HTTPException(status_code=400, detail="Tag with this slug already exists")
        tag.slug = data.slug

    # Update other fields
    if data.description is not None:
        tag.description = data.description
    if data.color_hex is not None:
        tag.color_hex = data.color_hex
    if data.icon is not None:
        tag.icon = data.icon
    if data.category is not None:
        tag.category = data.category
    if data.is_active is not None:
        tag.is_active = data.is_active
    if data.display_order is not None:
        tag.display_order = data.display_order

    tag.updated_at = datetime.now()

    db.commit()
    db.refresh(tag)

    return {
        "message": "Tag updated successfully",
        "tag": tag.to_dict()
    }


@router.delete("/{tag_id}")
async def delete_tag(tag_id: int, db: Session = Depends(get_db)):
    """Delete a tag"""

    tag = db.query(ContentTag).filter(ContentTag.id == tag_id).first()

    if not tag:
        raise HTTPException(status_code=404, detail="Tag not found")

    # Check if tag is being used
    if tag.usage_count > 0:
        raise HTTPException(
            status_code=400,
            detail=f"Cannot delete tag that is in use ({tag.usage_count} notices)"
        )

    db.delete(tag)
    db.commit()

    return {
        "message": "Tag deleted successfully",
        "deleted_id": tag_id
    }


@router.put("/reorder")
async def reorder_tags(data: ReorderRequest, db: Session = Depends(get_db)):
    """
    Reorder tags by providing an ordered list of tag IDs
    The order in the list will be applied as display_order (0, 1, 2, ...)
    """

    for index, tag_id in enumerate(data.tag_ids):
        tag = db.query(ContentTag).filter(ContentTag.id == tag_id).first()
        if tag:
            tag.display_order = index
            tag.updated_at = datetime.now()

    db.commit()

    return {
        "message": "Tags reordered successfully",
        "count": len(data.tag_ids)
    }


@router.get("/stats/categories")
async def get_tag_categories(db: Session = Depends(get_db)):
    """Get list of unique categories"""

    categories = db.query(ContentTag.category).distinct().all()
    categories = [cat[0] for cat in categories if cat[0]]  # Filter out None

    return {
        "categories": categories,
        "total": len(categories)
    }
