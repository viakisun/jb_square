"""
Notices Router
API endpoints for JB SQUARE notice management
"""

from datetime import datetime
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, WebSocket, WebSocketDisconnect, Query, UploadFile, File
from fastapi.responses import JSONResponse, StreamingResponse
from pydantic import BaseModel
from sqlalchemy.orm import Session
from sqlalchemy import desc, or_, and_, cast, func
from sqlalchemy.dialects.postgresql import JSONB
import httpx

from src.core.database import get_db
from src.core.s3_client import s3_client
from src.models.notice import Notice, CrawlQueue
from src.services.sources._manager import source_manager
from src.constants.sources import NoticeSource


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
    tags: List[str] = []


class BulkDeleteRequest(BaseModel):
    """Schema for bulk deleting notices"""
    notice_ids: List[int]


class BulkUpdateTagsRequest(BaseModel):
    """Schema for bulk updating tags on notices"""
    notice_ids: List[int]
    tags: List[str]


# ============================================
# 1. GET /api/notices - List notices with filters
# ============================================

@router.get("")
async def get_notices(
    status: Optional[str] = Query("published", description="Filter by status"),
    source_id: Optional[str] = Query(None, description="Filter by source"),
    tag: Optional[str] = Query(None, description="Filter by tag"),
    search: Optional[str] = Query(None, description="Search in title/content"),
    limit: int = Query(50, le=100, ge=1),
    offset: int = Query(0, ge=0),
    category: Optional[str] = Query(None, description="[DEPRECATED] Use source_id instead"),
    db: Session = Depends(get_db)
):
    """
    Get list of notices with filtering options

    - **status**: 'pending', 'published', 'archived'
    - **source_id**: NoticeSource enum values
    - **tag**: Filter notices containing this tag
    - **search**: Full-text search in title and content
    - **category**: [DEPRECATED] This parameter is ignored. Use source_id instead.
    """
    # DEPRECATED: category parameter handling for backward compatibility
    if category is not None:
        import logging
        logger = logging.getLogger(__name__)
        logger.warning(
            f"DEPRECATED: 'category' parameter is deprecated and will be removed. "
            f"Use 'source_id' instead. Received: category={category}"
        )

    query = db.query(Notice)

    # Apply filters
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

    # Calculate pagination info
    page = (offset // limit) + 1 if limit > 0 else 1
    total_pages = (total + limit - 1) // limit if limit > 0 else 1
    has_next = offset + limit < total
    has_prev = offset > 0

    return {
        "total": total,
        "offset": offset,
        "limit": limit,
        "page": page,
        "total_pages": total_pages,
        "has_next": has_next,
        "has_prev": has_prev,
        "items": [notice.to_dict() for notice in notices]
    }


# ============================================
# 1.5. GET /api/notices/proxy-file - Proxy external file (CORS workaround)
# ============================================

@router.get("/proxy-file")
async def proxy_file(url: str = Query(..., description="External file URL to proxy")):
    """
    Proxy external files to bypass CORS restrictions.

    This endpoint is used to fetch HWP/PDF files from JBTP servers
    that don't have CORS headers, allowing the frontend to render them.
    """
    try:
        async with httpx.AsyncClient(timeout=30.0, follow_redirects=True) as client:
            response = await client.get(url)
            response.raise_for_status()

            # Get content type from response or default to octet-stream
            content_type = response.headers.get("content-type", "application/octet-stream")

            # Return the file content with appropriate headers
            return StreamingResponse(
                iter([response.content]),
                media_type=content_type,
                headers={
                    "Content-Disposition": response.headers.get("content-disposition", ""),
                    "Access-Control-Allow-Origin": "*",
                }
            )
    except httpx.HTTPStatusError as e:
        raise HTTPException(status_code=e.response.status_code, detail=f"Failed to fetch file: {str(e)}")
    except httpx.RequestError as e:
        raise HTTPException(status_code=502, detail=f"Network error while fetching file: {str(e)}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error proxying file: {str(e)}")


# ============================================
# 1.6. GET /api/notices/serve-pdf - Serve PDF through backend proxy
# ============================================

@router.get("/serve-pdf")
async def serve_pdf(
    pdf_key: str = Query(..., description="S3 key of the PDF file"),
    download: bool = Query(False, description="Force download instead of inline display")
):
    """
    Serve PDF file through backend proxy to avoid S3 403 errors with special characters

    Args:
        pdf_key: S3 key (e.g., "notices/869/file.pdf"), can be URL-encoded
        download: If True, force download (attachment); if False, display inline (default)

    Returns:
        StreamingResponse with PDF content
    """
    from fastapi.responses import StreamingResponse
    from urllib.parse import unquote

    try:
        # URL decode the pdf_key in case it's encoded
        decoded_key = unquote(pdf_key)

        # Download PDF from S3
        response = s3_client.s3_client.get_object(
            Bucket=s3_client.bucket_name,
            Key=decoded_key
        )
        pdf_content = response['Body'].read()

        # Extract filename for Content-Disposition header
        filename = decoded_key.split("/")[-1]

        # URL encode filename for Content-Disposition header (RFC 2231)
        from urllib.parse import quote
        encoded_filename = quote(filename)

        # Set Content-Disposition based on download parameter
        disposition_type = "attachment" if download else "inline"

        # Return PDF as streaming response
        return StreamingResponse(
            iter([pdf_content]),
            media_type='application/pdf',
            headers={
                'Access-Control-Allow-Origin': '*',
                'Content-Disposition': f"{disposition_type}; filename*=UTF-8''{encoded_filename}"
            }
        )

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to serve PDF: {str(e)}"
        )


# ============================================
# 1.7. GET /api/notices/convert-hwp-to-pdf - Convert HWP to PDF
# ============================================

@router.get("/convert-hwp-to-pdf")
async def convert_hwp_to_pdf(
    hwp_url: str = Query(..., description="S3 URL of the HWP file"),
    db: Session = Depends(get_db)
):
    """
    Convert HWP file to PDF using Hancom Cloud Document Converter API

    This endpoint:
    1. Checks if PDF already exists in S3 cache
    2. If not, downloads HWP from S3
    3. Converts HWP to PDF using Hancom API
    4. Uploads PDF to S3
    5. Returns PDF URL
    """
    import os
    import io
    from pathlib import Path

    try:
        # Determine if URL is S3 or JBTP original
        is_s3_url = '.amazonaws.com/' in hwp_url

        if is_s3_url:
            # S3 URL: https://jb2-bucket.s3.ap-northeast-2.amazonaws.com/notices/{notice_id}/{filename}
            # or: https://jb2-bucket.s3.ap-northeast-2.amazonaws.com/notices/temp/{hash}/{filename}
            url_parts = hwp_url.split('.amazonaws.com/')
            if len(url_parts) != 2:
                raise HTTPException(status_code=400, detail="Invalid S3 URL format")

            s3_path = url_parts[1]  # notices/{notice_id}/{filename} or notices/temp/{hash}/{filename}
            path_parts = s3_path.split('/')

            if len(path_parts) < 3 or path_parts[0] != 'notices':
                raise HTTPException(status_code=400, detail="Invalid S3 path format")

            # Handle both notices/{notice_id}/{filename} and notices/temp/{hash}/{filename}
            if path_parts[1] == 'temp':
                # Temp folder: notices/temp/{hash}/{filename}
                if len(path_parts) < 4:
                    raise HTTPException(status_code=400, detail="Invalid S3 temp path format")
                temp_hash = path_parts[2]
                hwp_filename = path_parts[-1]
                # Use temp path for PDF as well
                pdf_filename = Path(hwp_filename).stem + '.pdf'
                pdf_s3_key = f"notices/temp/{temp_hash}/{pdf_filename}"
            else:
                # Regular folder: notices/{notice_id}/{filename}
                notice_id = path_parts[1]
                hwp_filename = path_parts[-1]
                pdf_filename = Path(hwp_filename).stem + '.pdf'
                pdf_s3_key = f"notices/{notice_id}/{pdf_filename}"
        else:
            # JBTP original URL: https://www.jbtp.or.kr/board/download.jbtp?...
            # Extract filename from URL or use a default
            import hashlib
            from urllib.parse import urlparse, parse_qs

            parsed_url = urlparse(hwp_url)
            query_params = parse_qs(parsed_url.query)

            # Try to extract filename from URL parameters or generate one
            hwp_filename = "document.hwp"  # Default

            # Generate unique hash for this URL
            url_hash = hashlib.md5(hwp_url.encode()).hexdigest()[:8]
            pdf_filename = f"{url_hash}.pdf"
            pdf_s3_key = f"notices/converted/{url_hash}/{pdf_filename}"

        # Generate proxy URL to serve PDF through backend
        from urllib.parse import quote
        encoded_key = quote(pdf_s3_key, safe='/')
        pdf_proxy_url = f"/api/notices/serve-pdf?pdf_key={encoded_key}"

        # Check if PDF already exists in S3
        try:
            s3_client.s3_client.head_object(
                Bucket=s3_client.bucket_name,
                Key=pdf_s3_key
            )
            # PDF already exists, return cached version
            return {
                "success": True,
                "pdf_url": pdf_proxy_url,
                "cached": True,
                "original_hwp_url": hwp_url
            }
        except:
            # PDF doesn't exist, proceed with conversion
            pass

        # Download HWP file from S3
        s3_key = s3_path  # notices/{notice_id}/{filename}
        try:
            response = s3_client.s3_client.get_object(
                Bucket=s3_client.bucket_name,
                Key=s3_key
            )
            hwp_content = response['Body'].read()
        except Exception as e:
            raise HTTPException(
                status_code=500,
                detail=f"Failed to download HWP from S3: {str(e)}"
            )

        # Get Hancom API credentials
        hancom_client_id = os.getenv('HANCOM_CLIENT_ID')
        hancom_client_secret = os.getenv('HANCOM_CLIENT_SECRET')

        if not hancom_client_id or not hancom_client_secret:
            raise HTTPException(
                status_code=500,
                detail="Hancom API credentials not configured"
            )

        # Call Hancom Cloud Document Converter API
        hancom_api_url = "https://docsconverter-example.cloud.hancom.com/hwp/doc2pdf"

        # Prepare multipart form data
        files = {
            'file': (hwp_filename, io.BytesIO(hwp_content), 'application/octet-stream')
        }

        headers = {
            'Client-Id': hancom_client_id,
            'Client-Secret': hancom_client_secret
        }

        async with httpx.AsyncClient(timeout=60.0) as client:
            conversion_response = await client.post(
                hancom_api_url,
                files=files,
                headers=headers
            )
            conversion_response.raise_for_status()

            # Parse JSON response to get the converted PDF path
            import json
            result = json.loads(conversion_response.content)

            # Check if conversion was successful
            if result.get('docsconverter', {}).get('result', {}).get('code') != '0000':
                error_msg = result.get('docsconverter', {}).get('result', {}).get('message', 'Unknown error')
                raise HTTPException(
                    status_code=500,
                    detail=f"Hancom API conversion failed: {error_msg}"
                )

            # Get the target file path
            target_file = result.get('docsconverter', {}).get('file', {}).get('target_file')
            if not target_file:
                raise HTTPException(
                    status_code=500,
                    detail="Hancom API did not return target file path"
                )

            # Download the converted PDF from Hancom API
            pdf_download_url = f"https://docsconverter-example.cloud.hancom.com{target_file}"
            pdf_download_response = await client.get(pdf_download_url, headers=headers)
            pdf_download_response.raise_for_status()
            pdf_content = pdf_download_response.content

        # Upload PDF to S3
        upload_success = s3_client.upload_file_content(
            content=pdf_content,
            key=pdf_s3_key,
            content_type='application/pdf'
        )

        if not upload_success:
            raise HTTPException(
                status_code=500,
                detail="Failed to upload PDF to S3"
            )

        # Return PDF proxy URL
        return {
            "success": True,
            "pdf_url": pdf_proxy_url,
            "cached": False,
            "original_hwp_url": hwp_url,
            "converted_at": datetime.now().isoformat()
        }

    except httpx.HTTPStatusError as e:
        raise HTTPException(
            status_code=e.response.status_code,
            detail=f"HTTP error during conversion: {str(e)}"
        )
    except httpx.RequestError as e:
        raise HTTPException(
            status_code=500,
            detail=f"Network error during conversion: {str(e)}"
        )
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Conversion failed: {str(e)}"
        )


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
# 5-3. POST /api/notices/bulk-update-tags - Bulk update tags
# ============================================

@router.post("/bulk-update-tags")
async def bulk_update_tags(
    data: BulkUpdateTagsRequest,
    db: Session = Depends(get_db)
):
    """
    Bulk update tags on multiple notices

    - **notice_ids**: List of notice IDs to update
    - **tags**: List of tag names to assign (replaces existing tags)
    """

    updated_ids = []
    not_found_ids = []

    for notice_id in data.notice_ids:
        notice = db.query(Notice).filter(Notice.id == notice_id).first()

        if not notice:
            not_found_ids.append(notice_id)
            continue

        # Update tags (replaces existing tags)
        notice.tags = data.tags
        notice.updated_at = datetime.now()
        updated_ids.append(notice_id)

    db.commit()

    return {
        "updated": len(updated_ids),
        "not_found": len(not_found_ids),
        "updated_ids": updated_ids,
        "not_found_ids": not_found_ids
    }


# ============================================
# 6. WebSocket /api/notices/crawl/{source_id} - Real-time crawling
# ============================================

# Dispatcher pattern: Enum-driven crawler executor mapping
CRAWLER_EXECUTORS = {
    NoticeSource.JBTP_LOCAL: lambda: source_manager.execute_jbtp,
    NoticeSource.JBTP_EXTERNAL: lambda: source_manager.execute_jbtp_external,
    NoticeSource.JBTP_EVENTS: lambda: source_manager.execute_jbtp_events,
    NoticeSource.NTIS_RSS: lambda: source_manager.execute_ntis_rss,
    NoticeSource.BIZINFO_API: lambda: source_manager.execute_bizinfo,
    NoticeSource.NEWS_MFDS: lambda: source_manager.execute_mfds_news,
    NoticeSource.NEWS_MOHW: lambda: source_manager.execute_mohw_news,
}

@router.websocket("/crawl/{source_id}")
async def crawl_source(websocket: WebSocket, source_id: str):
    """
    WebSocket endpoint for real-time crawling with progress updates

    Args:
        source_id: NoticeSource enum value (e.g., 'source:jbtp:local', 'source:ntis:rss')

    Supported sources:
        - source:jbtp:local - 지자체 공고
        - source:jbtp:external - 유관기관 공고
        - source:jbtp:events - 바이오행사
        - source:ntis:rss - 정부공고 (NTIS)
        - source:bizinfo:api - 기업마당 정보
        - source:news:mfds - 식약처 뉴스
        - source:news:mohw - 보건복지부 뉴스
    """
    print(f"[WebSocket] Connection attempt for source: {source_id}")
    await websocket.accept()
    print(f"[WebSocket] Connection accepted for source: {source_id}")

    try:
        # Callback for sending real-time updates
        async def send_update(message: str):
            print(f"[WebSocket send_update] Sending message: {message[:100]}...")
            await websocket.send_text(message)
            print(f"[WebSocket send_update] Message sent successfully")

        # Validate source_id is a valid NoticeSource enum value
        if source_id not in [s.value for s in NoticeSource]:
            error_msg = f"Invalid source_id: {source_id}. Valid sources: {[s.value for s in NoticeSource]}"
            print(f"[WebSocket] {error_msg}")
            await websocket.send_text(f'{{"type": "error", "message": "{error_msg}"}}')
            await websocket.close()
            return

        # Get executor from dispatcher
        executor_factory = CRAWLER_EXECUTORS.get(source_id)
        if not executor_factory:
            error_msg = f"No executor found for source: {source_id}"
            print(f"[WebSocket] {error_msg}")
            await websocket.send_text(f'{{"type": "error", "message": "{error_msg}"}}')
            await websocket.close()
            return

        # Execute crawler using dispatcher
        executor = executor_factory()
        await executor(callback=send_update)

        # Close connection after completion
        await websocket.close()

    except WebSocketDisconnect:
        print(f"[WebSocket] Disconnected for {source_id}")
    except Exception as e:
        error_msg = f"Crawler execution failed: {str(e)}"
        print(f"[WebSocket] Error: {error_msg}")
        try:
            await websocket.send_text(f'{{"type": "error", "message": "{error_msg}"}}')
            await websocket.close()
        except:
            pass  # WebSocket might already be closed


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
        content_text = None
        content_viewer_url = None
        content_type = 'text'  # default
        attachment_links = []
        application_start = None
        application_end = None

        if queue_item.raw_data and isinstance(queue_item.raw_data, dict):
            detail = queue_item.raw_data.get('detail', {})
            if detail:
                # Extract HTML content (NTIS)
                if 'content_html' in detail:
                    content_html = detail['content_html']
                    content_type = 'html'

                # Extract plain text content (NTIS detail page)
                if 'content' in detail and detail['content']:
                    content_text = detail['content']
                    # If no HTML content was found, use the text content
                    if not content_html:
                        content_html = content_text
                        content_type = 'text'

                # Extract PDF viewer URL (JBTP)
                if 'content_viewer_url' in detail:
                    content_viewer_url = detail['content_viewer_url']
                    content_type = 'pdf_viewer'

                # Extract attachments
                if 'attachments' in detail and isinstance(detail['attachments'], list):
                    attachment_links = detail['attachments']

                # Extract application dates (Bizinfo)
                if 'application_start_date' in detail:
                    try:
                        application_start = datetime.fromisoformat(detail['application_start_date'].replace('Z', '+00:00'))
                    except (ValueError, AttributeError):
                        pass

                if 'application_end_date' in detail:
                    try:
                        application_end = datetime.fromisoformat(detail['application_end_date'].replace('Z', '+00:00'))
                    except (ValueError, AttributeError):
                        pass

        # Create notice from queue item (use typed columns directly)
        notice = Notice(
            title=queue_item.title,
            link=queue_item.link,
            origin_type='crawled',
            crawler_source_id=queue_item.crawler_source_id,
            source_board_name=queue_item.source_board_name,
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
            # Application period dates
            application_start=application_start,
            application_end=application_end,
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

        # Migrate S3 files from temp to final location
        if attachment_links and len(attachment_links) > 0:
            # Check if any files are in temp folder
            has_temp_files = any('notices/temp/' in att.get('url', '') for att in attachment_links)
            if has_temp_files:
                from src.core.s3_client import s3_client
                migrated_attachments = s3_client.migrate_temp_files_to_notice(
                    attachment_links, notice.id
                )
                # Update notice with new attachment URLs
                notice.attachment_links = migrated_attachments
                db.flush()

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
