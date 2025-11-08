"""
Notices Router
API endpoints for JB SQUARE notice management
"""

from datetime import datetime
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, WebSocket, WebSocketDisconnect, Query, UploadFile, File
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from sqlalchemy.orm import Session
from sqlalchemy import desc, or_, and_, cast, func
from sqlalchemy.dialects.postgresql import JSONB

from src.core.database import get_db
from src.core.s3_client import s3_client
from src.models.notice import Notice, CrawlQueue
from src.services.crawler_manager import crawler_manager


router = APIRouter(prefix="/api/notices", tags=["notices"])


# ============================================
# Pydantic Schemas
# ============================================

class AttachmentLink(BaseModel):
    """Schema for attachment link"""
    filename: str
    url: str


class NoticeCreate(BaseModel):
    """Schema for creating a notice manually"""
    title: str
    content: Optional[str] = None
    content_type: Optional[str] = 'text'  # 'text', 'html'
    link: Optional[str] = None
    category: str  # 'government', 'business', 'rnd', 'startup'
    tags: List[str] = []
    organization: Optional[str] = None
    department: Optional[str] = None
    contact: Optional[str] = None
    deadline: Optional[str] = None
    application_start: Optional[str] = None
    application_end: Optional[str] = None
    announcement_date: Optional[str] = None
    attachment_links: List[AttachmentLink] = []


class NoticeUpdate(BaseModel):
    """Schema for updating a notice"""
    title: Optional[str] = None
    content: Optional[str] = None
    link: Optional[str] = None
    category: Optional[str] = None
    tags: Optional[List[str]] = None
    status: Optional[str] = None
    organization: Optional[str] = None
    department: Optional[str] = None
    contact: Optional[str] = None
    deadline: Optional[str] = None
    application_start: Optional[str] = None
    application_end: Optional[str] = None
    announcement_date: Optional[str] = None
    attachment_links: Optional[List[str]] = None


class PublishRequest(BaseModel):
    """Schema for publishing notices from crawl queue"""
    queue_ids: List[int]
    category: str  # 'government', 'business', 'rnd', 'startup'
    tags: List[str] = []


class BulkDeleteRequest(BaseModel):
    """Schema for bulk deleting notices"""
    notice_ids: List[int]


# ============================================
# 1. GET /api/notices - List notices with filters
# ============================================

@router.get("")
async def get_notices(
    category: Optional[str] = Query(None, description="Filter by category"),
    status: Optional[str] = Query("published", description="Filter by status"),
    source_id: Optional[str] = Query(None, description="Filter by source"),
    tag: Optional[str] = Query(None, description="Filter by tag"),
    search: Optional[str] = Query(None, description="Search in title/content"),
    limit: int = Query(50, le=100),
    offset: int = Query(0),
    db: Session = Depends(get_db)
):
    """
    Get list of notices with filtering options

    - **category**: 'government', 'business', 'rnd', 'startup'
    - **status**: 'pending', 'published', 'archived'
    - **source_id**: 'jbtp', 'ntis_rss', 'bizinfo', 'manual'
    - **tag**: Filter notices containing this tag
    - **search**: Full-text search in title and content
    """
    query = db.query(Notice)

    # Apply filters
    if category:
        query = query.filter(Notice.category == category)

    if status:
        query = query.filter(Notice.status == status)

    if source_id:
        query = query.filter(Notice.crawler_source_id == source_id)

    if tag:
        # JSON array contains operation using PostgreSQL @> operator
        query = query.filter(cast(Notice.tags, JSONB).contains([tag]))

    if search:
        # Search in title and content
        search_term = f"%{search}%"
        query = query.filter(
            or_(
                Notice.title.ilike(search_term),
                Notice.content.ilike(search_term)
            )
        )

    # Order by deadline desc (latest deadline first), then created_at desc
    query = query.order_by(
        desc(Notice.deadline),
        desc(Notice.created_at)
    )

    # Get total count
    total = query.count()

    # Apply pagination
    notices = query.offset(offset).limit(limit).all()

    return {
        "total": total,
        "offset": offset,
        "limit": limit,
        "items": [notice.to_dict() for notice in notices]
    }


# ============================================
# 2. GET /api/notices/{id} - Get single notice
# ============================================

@router.get("/{notice_id}")
async def get_notice(notice_id: int, db: Session = Depends(get_db)):
    """Get a single notice by ID"""
    notice = db.query(Notice).filter(Notice.id == notice_id).first()

    if not notice:
        raise HTTPException(status_code=404, detail="Notice not found")

    return notice.to_dict()


# ============================================
# 3. POST /api/notices/manual - Create manual notice
# ============================================

@router.post("/manual")
async def create_manual_notice(
    data: NoticeCreate,
    db: Session = Depends(get_db)
):
    """Create a notice manually (not from crawling)"""

    # Convert attachment_links to dict format for JSON storage
    attachment_links_json = [{"filename": att.filename, "url": att.url} for att in data.attachment_links] if data.attachment_links else []

    notice = Notice(
        title=data.title,
        content=data.content,
        content_type=data.content_type,
        link=data.link,
        origin_type='manual',
        crawler_source_id='manual',
        category=data.category,
        tags=data.tags,
        status='published',
        published_at=datetime.now(),
        organization=data.organization,
        department=data.department,
        contact=data.contact,
        attachment_links=attachment_links_json,
        created_at=datetime.now()
    )

    # Parse datetime fields if provided
    if data.deadline:
        try:
            notice.deadline = datetime.fromisoformat(data.deadline)
        except:
            pass

    if data.application_start:
        try:
            notice.application_start = datetime.fromisoformat(data.application_start)
        except:
            pass

    if data.application_end:
        try:
            notice.application_end = datetime.fromisoformat(data.application_end)
        except:
            pass

    if data.announcement_date:
        try:
            from datetime import date
            notice.announcement_date = date.fromisoformat(data.announcement_date)
        except:
            pass

    db.add(notice)
    db.commit()
    db.refresh(notice)

    return notice.to_dict()


# ============================================
# 4. PUT /api/notices/{id} - Update notice
# ============================================

@router.put("/{notice_id}")
async def update_notice(
    notice_id: int,
    data: NoticeUpdate,
    db: Session = Depends(get_db)
):
    """Update an existing notice"""

    notice = db.query(Notice).filter(Notice.id == notice_id).first()

    if not notice:
        raise HTTPException(status_code=404, detail="Notice not found")

    # Update fields if provided
    if data.title is not None:
        notice.title = data.title
    if data.content is not None:
        notice.content = data.content
    if data.link is not None:
        notice.link = data.link
    if data.category is not None:
        notice.category = data.category
    if data.tags is not None:
        notice.tags = data.tags
    if data.status is not None:
        notice.status = data.status
        if data.status == 'published' and not notice.published_at:
            notice.published_at = datetime.now()
    if data.organization is not None:
        notice.organization = data.organization
    if data.department is not None:
        notice.department = data.department
    if data.contact is not None:
        notice.contact = data.contact
    if data.attachment_links is not None:
        notice.attachment_links = data.attachment_links

    # Update datetime fields
    if data.deadline is not None:
        try:
            notice.deadline = datetime.fromisoformat(data.deadline) if data.deadline else None
        except:
            pass

    if data.application_start is not None:
        try:
            notice.application_start = datetime.fromisoformat(data.application_start) if data.application_start else None
        except:
            pass

    if data.application_end is not None:
        try:
            notice.application_end = datetime.fromisoformat(data.application_end) if data.application_end else None
        except:
            pass

    if data.announcement_date is not None:
        try:
            from datetime import date
            notice.announcement_date = date.fromisoformat(data.announcement_date) if data.announcement_date else None
        except:
            pass

    notice.updated_at = datetime.now()

    db.commit()
    db.refresh(notice)

    return notice.to_dict()


# ============================================
# 5. DELETE /api/notices/{id} - Delete notice
# ============================================

@router.delete("/{notice_id}")
async def delete_notice(notice_id: int, db: Session = Depends(get_db)):
    """Delete a notice (or archive it)"""

    notice = db.query(Notice).filter(Notice.id == notice_id).first()

    if not notice:
        raise HTTPException(status_code=404, detail="Notice not found")

    # Archive instead of hard delete
    notice.status = 'archived'
    notice.updated_at = datetime.now()

    db.commit()

    return {"message": "Notice archived successfully", "id": notice_id}


# ============================================
# 5-1. POST /api/notices/upload-attachment - Upload file to S3
# ============================================

@router.post("/upload-attachment")
async def upload_attachment(file: UploadFile = File(...)):
    """
    Upload attachment file to S3

    Allowed file types: PDF, HWP, DOCX, XLS, XLSX, ZIP, JPG, PNG
    Max file size: 10MB
    """

    # Validate file type
    allowed_extensions = {'.pdf', '.hwp', '.docx', '.doc', '.xls', '.xlsx', '.zip', '.jpg', '.jpeg', '.png'}
    file_ext = '.' + file.filename.split('.')[-1].lower() if '.' in file.filename else ''

    if file_ext not in allowed_extensions:
        raise HTTPException(
            status_code=400,
            detail=f"파일 형식이 지원되지 않습니다. 허용된 형식: {', '.join(allowed_extensions)}"
        )

    # Validate file size (10MB max)
    MAX_FILE_SIZE = 10 * 1024 * 1024  # 10MB in bytes
    file_size = 0
    chunk_size = 1024 * 1024  # 1MB chunks

    # Read file to check size
    file_content = await file.read()
    file_size = len(file_content)

    if file_size > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=400,
            detail=f"파일 크기가 너무 큽니다. 최대 크기: 10MB"
        )

    # Reset file pointer
    await file.seek(0)

    try:
        # Upload to S3
        original_filename, s3_url = s3_client.upload_file(file, folder="attachments")

        return {
            "filename": original_filename,
            "url": s3_url
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"파일 업로드 실패: {str(e)}")


# ============================================
# 5-2. POST /api/notices/bulk-delete - Bulk delete notices
# ============================================

@router.post("/bulk-delete")
async def bulk_delete_notices(
    data: BulkDeleteRequest,
    db: Session = Depends(get_db)
):
    """
    Bulk delete (archive) notices

    - **notice_ids**: List of notice IDs to delete
    """

    archived_ids = []
    not_found_ids = []

    for notice_id in data.notice_ids:
        notice = db.query(Notice).filter(Notice.id == notice_id).first()

        if not notice:
            not_found_ids.append(notice_id)
            continue

        # Archive instead of hard delete
        notice.status = 'archived'
        notice.updated_at = datetime.now()
        archived_ids.append(notice_id)

    db.commit()

    return {
        "archived": len(archived_ids),
        "not_found": len(not_found_ids),
        "archived_ids": archived_ids,
        "not_found_ids": not_found_ids
    }


# ============================================
# 6. WebSocket /api/notices/crawl/{source_id} - Real-time crawling
# ============================================

@router.websocket("/crawl/{source_id}")
async def crawl_source(websocket: WebSocket, source_id: str):
    """
    WebSocket endpoint for real-time crawling with progress updates

    - **source_id**: 'jbtp', 'jbtp_external', 'ntis_rss', 'bizinfo'
    """
    await websocket.accept()

    try:
        # Callback for sending real-time updates
        async def send_update(message: str):
            await websocket.send_text(message)

        # Execute crawler based on source_id
        if source_id == "jbtp":
            await crawler_manager.execute_jbtp(callback=send_update)
        elif source_id == "jbtp_external":
            await crawler_manager.execute_jbtp_external(callback=send_update)
        elif source_id == "ntis_rss":
            await crawler_manager.execute_ntis_rss(callback=send_update)
        elif source_id == "bizinfo":
            await crawler_manager.execute_bizinfo(callback=send_update)
        else:
            await websocket.send_text(f'{{"type": "error", "message": "Unknown source: {source_id}"}}')
            await websocket.close()
            return

        # Close connection after completion
        await websocket.close()

    except WebSocketDisconnect:
        print(f"WebSocket disconnected for {source_id}")
    except Exception as e:
        await websocket.send_text(f'{{"type": "error", "message": "{str(e)}"}}')
        await websocket.close()


# ============================================
# 7. GET /api/notices/crawl-queue - Get crawl queue
# ============================================

@router.get("/crawl-queue/list")
async def get_crawl_queue(
    source_id: Optional[str] = Query(None, description="Filter by source"),
    limit: int = Query(100, le=500),
    offset: int = Query(0),
    db: Session = Depends(get_db)
):
    """
    Get items in the crawl queue (pending review)

    - **source_id**: Filter by 'jbtp', 'ntis_rss', 'bizinfo'

    Returns items with `already_exists` flag if title already in notices table
    """
    query = db.query(CrawlQueue)

    # Only show pending items (not yet processed and not rejected)
    query = query.filter(
        CrawlQueue.notice_id.is_(None)  # Not yet processed to notice
    ).filter(
        or_(
            CrawlQueue.rejection_status.is_(None),  # Pending review
            CrawlQueue.rejection_status != 'rejected'  # Not rejected
        )
    )

    # Filter by source
    if source_id:
        query = query.filter(CrawlQueue.crawler_source_id == source_id)

    # Order by crawler_extracted_at desc
    query = query.order_by(desc(CrawlQueue.crawler_extracted_at))

    # Get total count
    total = query.count()

    # Apply pagination
    items = query.offset(offset).limit(limit).all()

    # Check for duplicates in notices table
    items_dict = []
    for item in items:
        item_data = item.to_dict()

        # Check if title already exists in notices
        existing_notice = db.query(Notice).filter(
            Notice.title == item.title,
            Notice.status == 'published'
        ).first()

        item_data['already_exists'] = existing_notice is not None
        if existing_notice:
            item_data['existing_notice_id'] = existing_notice.id

        items_dict.append(item_data)

    return {
        "total": total,
        "offset": offset,
        "limit": limit,
        "items": items_dict
    }


# ============================================
# 8. POST /api/notices/publish - Publish from queue
# ============================================

@router.post("/publish")
async def publish_from_queue(
    data: PublishRequest,
    db: Session = Depends(get_db)
):
    """
    Publish selected items from crawl queue to notices

    - **queue_ids**: List of crawl_queue IDs to publish
    - **category**: Target category ('government', 'business', 'rnd', 'startup')
    - **tags**: Additional tags to apply
    """

    published_ids = []
    failed_ids = []

    for queue_id in data.queue_ids:
        queue_item = db.query(CrawlQueue).filter(CrawlQueue.id == queue_id).first()

        if not queue_item:
            failed_ids.append({"id": queue_id, "reason": "Not found"})
            continue

        # Extract content data from raw_data
        content_html = None
        content_viewer_url = None
        content_type = 'text'  # default
        attachment_links = []

        if queue_item.raw_data and isinstance(queue_item.raw_data, dict):
            detail = queue_item.raw_data.get('detail', {})
            if detail:
                # Extract HTML content (NTIS)
                if 'content_html' in detail:
                    content_html = detail['content_html']
                    content_type = 'html'

                # Extract PDF viewer URL (JBTP)
                if 'content_viewer_url' in detail:
                    content_viewer_url = detail['content_viewer_url']
                    content_type = 'pdf_viewer'

                # Extract attachments
                if 'attachments' in detail and isinstance(detail['attachments'], list):
                    attachment_links = detail['attachments']

        # Create notice from queue item (use typed columns directly)
        notice = Notice(
            title=queue_item.title,
            link=queue_item.link,
            origin_type='crawled',
            crawler_source_id=queue_item.crawler_source_id,
            source_board_name=queue_item.source_board_name,
            category=data.category,
            tags=data.tags,
            status='published',
            published_at=datetime.now(),
            # Use structured fields from queue
            deadline=queue_item.deadline,
            announcement_date=queue_item.published_date,
            organization=queue_item.organization,
            department=queue_item.department,
            contact=queue_item.contact,
            crawler_extracted_at=queue_item.crawler_extracted_at,
            # Content fields extracted from raw_data
            content=content_html,  # Store HTML in content field
            content_type=content_type,
            content_viewer_url=content_viewer_url,
            attachment_links=attachment_links,
            # Preserve raw crawled data for debugging
            raw_data=queue_item.raw_data,
            created_at=datetime.now()
        )

        db.add(notice)
        db.flush()  # Get the notice ID

        published_ids.append(notice.id)

        # Delete queue item (no longer need is_processed)
        db.delete(queue_item)

    db.commit()

    return {
        "published": len(published_ids),
        "failed": len(failed_ids),
        "published_ids": published_ids,
        "failed_items": failed_ids
    }


# ============================================
# 9. GET /api/notices/latest - Get latest notices
# ============================================

@router.get("/latest/list")
async def get_latest_notices(
    limit: int = Query(15, le=50),
    db: Session = Depends(get_db)
):
    """
    Get latest published notices (for "최신공고 모아보기")

    - **limit**: Number of notices to return (default 15)
    """

    notices = db.query(Notice).filter(
        Notice.status == 'published'
    ).order_by(
        desc(Notice.published_at)
    ).limit(limit).all()

    return {
        "total": len(notices),
        "items": [notice.to_dict() for notice in notices]
    }


# ============================================
# 10. DELETE /api/notices/crawl-queue/{id} - Delete queue item
# ============================================

@router.delete("/crawl-queue/{queue_id}")
async def delete_queue_item(queue_id: int, db: Session = Depends(get_db)):
    """Delete an item from the crawl queue"""

    queue_item = db.query(CrawlQueue).filter(CrawlQueue.id == queue_id).first()

    if not queue_item:
        raise HTTPException(status_code=404, detail="Queue item not found")

    db.delete(queue_item)
    db.commit()

    return {"message": "Queue item deleted", "id": queue_id}


# ============================================
# 11. POST /api/notices/crawl-queue/clear - Clear processed items
# ============================================

@router.post("/crawl-queue/clear")
async def clear_processed_queue(db: Session = Depends(get_db)):
    """Clear all processed items from crawl queue"""

    # Clear all items from crawl queue (deprecated endpoint - queue items are deleted on publish)
    deleted_count = db.query(CrawlQueue).delete()

    db.commit()

    return {
        "message": f"Cleared {deleted_count} processed items",
        "count": deleted_count
    }
