"""
크롤링 관리 API 라우터
WebSocket을 통한 실시간 크롤링 상태 스트리밍
"""

from fastapi import APIRouter, WebSocket, WebSocketDisconnect, HTTPException, Depends
from sqlalchemy.orm import Session
from typing import List
import asyncio

from src.services.crawler_manager import crawler_manager
from src.core.database import get_db, CrawlerConfig, CrawlResult
from src.models.crawler_config import RSSConfig
from src.services.crawlers.rss_news_crawler import RSSNewsCrawler

router = APIRouter()


class ConnectionManager:
    """WebSocket 연결 관리"""

    def __init__(self):
        self.active_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)

    async def send_message(self, message: str, websocket: WebSocket):
        await websocket.send_text(message)


manager = ConnectionManager()


@router.websocket("/ws/{source_id}")
async def websocket_crawling(websocket: WebSocket, source_id: str):
    """
    WebSocket 엔드포인트: 실시간 크롤링 상태 스트리밍

    Args:
        source_id: 크롤링 소스 ID (jbtp, ntis, bizinfo, bi_center)
    """
    await manager.connect(websocket)

    try:
        # 크롤러 실행 함수 매핑
        crawler_functions = {
            "jbtp": crawler_manager.execute_jbtp,
            "jbtp_external": crawler_manager.execute_jbtp_external,
            "ntis_rss": crawler_manager.execute_ntis_rss,
            "bizinfo": crawler_manager.execute_bizinfo,
            "bi_center": crawler_manager.execute_bi_center
        }

        if source_id not in crawler_functions:
            await websocket.send_text('{"type": "error", "message": "Invalid source_id"}')
            return

        # Callback 함수 정의 (WebSocket으로 메시지 전송)
        async def callback(message: str):
            await manager.send_message(message, websocket)

        # 크롤러 실행 (비동기)
        crawler_func = crawler_functions[source_id]
        await crawler_func(callback)

        # Keep connection alive for final messages
        await asyncio.sleep(1)

    except WebSocketDisconnect:
        manager.disconnect(websocket)
        print(f"WebSocket disconnected for {source_id}")

    except Exception as e:
        print(f"WebSocket error for {source_id}: {str(e)}")
        await websocket.send_text(f'{{"type": "error", "message": "{str(e)}"}}')

    finally:
        manager.disconnect(websocket)


@router.post("/{source_id}/start")
async def start_crawling(source_id: str):
    """
    크롤링을 시작합니다.

    Args:
        source_id: 크롤링 소스 ID (jbtp, ntis_rss, bizinfo, bi_center)
    """
    valid_sources = ["jbtp", "ntis_rss", "bizinfo", "bi_center"]

    if source_id not in valid_sources:
        raise HTTPException(status_code=400, detail="Invalid source_id")

    # 현재 상태 확인
    status = crawler_manager.get_status(source_id)

    if status.get("status") == "running":
        raise HTTPException(status_code=400, detail="Crawler is already running")

    # 비동기 태스크로 크롤러 시작
    crawler_functions = {
        "jbtp": crawler_manager.execute_jbtp,
        "ntis_rss": crawler_manager.execute_ntis_rss,
        "bizinfo": crawler_manager.execute_bizinfo,
        "bi_center": crawler_manager.execute_bi_center
    }

    # Background task로 실행 (WebSocket 없이)
    asyncio.create_task(crawler_functions[source_id]())

    return {
        "source_id": source_id,
        "status": "started",
        "message": f"{source_id} 크롤링을 시작했습니다."
    }


@router.post("/{source_id}/stop")
async def stop_crawling(source_id: str):
    """
    실행 중인 크롤링을 중단합니다.

    Args:
        source_id: 크롤링 소스 ID
    """
    valid_sources = ["jbtp", "ntis_rss", "bizinfo", "bi_center"]

    if source_id not in valid_sources:
        raise HTTPException(status_code=400, detail="Invalid source_id")

    crawler_manager.stop_crawler(source_id)

    return {
        "source_id": source_id,
        "status": "stopping",
        "message": f"{source_id} 크롤링 중단 요청을 전송했습니다."
    }


@router.get("/{source_id}/status")
async def get_crawling_status(source_id: str):
    """
    크롤링 상태를 조회합니다.

    Args:
        source_id: 크롤링 소스 ID
    """
    valid_sources = ["jbtp", "ntis_rss", "bizinfo", "bi_center"]

    if source_id not in valid_sources:
        raise HTTPException(status_code=400, detail="Invalid source_id")

    status = crawler_manager.get_status(source_id)

    return {
        "source_id": source_id,
        **status
    }


@router.get("/status")
async def get_all_crawling_status():
    """모든 크롤러의 상태를 조회합니다."""
    return crawler_manager.get_all_status()


# ============================================================================
# 키워드 관리 API
# ============================================================================

@router.get("/keywords/{source_id}")
async def get_keywords(source_id: str, db: Session = Depends(get_db)):
    """
    크롤러의 키워드를 조회합니다.

    Args:
        source_id: 크롤링 소스 ID (jbtp, ntis, bizinfo, bi_center)
    """
    valid_sources = ["jbtp", "ntis_rss", "bizinfo", "bi_center"]

    if source_id not in valid_sources:
        raise HTTPException(status_code=400, detail="Invalid source_id")

    config = db.query(CrawlerConfig).filter(CrawlerConfig.source_id == source_id).first()

    if not config:
        # 기본 설정 생성
        config = CrawlerConfig(
            source_id=source_id,
            keywords=[],
            enabled=True
        )
        db.add(config)
        db.commit()
        db.refresh(config)

    return config.to_dict()


@router.put("/keywords/{source_id}")
async def update_keywords(source_id: str, keywords: List[str], db: Session = Depends(get_db)):
    """
    크롤러의 키워드를 업데이트합니다.

    Args:
        source_id: 크롤링 소스 ID
        keywords: 키워드 배열
    """
    valid_sources = ["jbtp", "ntis_rss", "bizinfo", "bi_center"]

    if source_id not in valid_sources:
        raise HTTPException(status_code=400, detail="Invalid source_id")

    config = db.query(CrawlerConfig).filter(CrawlerConfig.source_id == source_id).first()

    if not config:
        config = CrawlerConfig(source_id=source_id)
        db.add(config)

    config.keywords = keywords
    db.commit()
    db.refresh(config)

    return {
        "source_id": source_id,
        "keywords": config.keywords,
        "message": "키워드가 업데이트되었습니다."
    }


@router.get("/results/{source_id}")
async def get_crawl_results(
    source_id: str,
    limit: int = 100,
    offset: int = 0,
    db: Session = Depends(get_db)
):
    """
    크롤링 결과를 조회합니다.

    Args:
        source_id: 크롤링 소스 ID
        limit: 조회할 개수 (기본 100)
        offset: 오프셋 (기본 0)
    """
    valid_sources = ["jbtp", "ntis_rss", "bizinfo", "bi_center"]

    if source_id not in valid_sources:
        raise HTTPException(status_code=400, detail="Invalid source_id")

    results = db.query(CrawlResult)\
        .filter(CrawlResult.source_id == source_id)\
        .order_by(CrawlResult.crawled_at.desc())\
        .limit(limit)\
        .offset(offset)\
        .all()

    total = db.query(CrawlResult).filter(CrawlResult.source_id == source_id).count()

    return {
        "source_id": source_id,
        "total": total,
        "results": [r.to_dict() for r in results]
    }


@router.get("/report/{source_id}")
async def get_crawl_report(source_id: str, db: Session = Depends(get_db)):
    """
    크롤링 상세 리포트를 조회합니다.

    Args:
        source_id: 크롤링 소스 ID
    """
    valid_sources = ["jbtp", "ntis_rss", "bizinfo", "bi_center"]

    if source_id not in valid_sources:
        raise HTTPException(status_code=400, detail="Invalid source_id")

    # 최근 크롤링 결과
    results = db.query(CrawlResult)\
        .filter(CrawlResult.source_id == source_id)\
        .order_by(CrawlResult.crawled_at.desc())\
        .limit(100)\
        .all()

    total_count = len(results)

    # 키워드 매칭된 항목 수
    matched_count = sum(1 for r in results if r.keywords_matched and len(r.keywords_matched) > 0)

    # 게시판별 분포
    board_distribution = {}
    for r in results:
        board = r.board or "기타"
        board_distribution[board] = board_distribution.get(board, 0) + 1

    # 키워드별 매칭 수
    keyword_matches = {}
    for r in results:
        if r.keywords_matched:
            for keyword in r.keywords_matched:
                keyword_matches[keyword] = keyword_matches.get(keyword, 0) + 1

    # 최근 실행 시간
    latest_crawl = results[0].crawled_at if results else None

    return {
        "source_id": source_id,
        "total_collected": total_count,
        "keyword_matched": matched_count,
        "board_distribution": board_distribution,
        "keyword_matches": keyword_matches,
        "latest_crawl": latest_crawl.isoformat() if latest_crawl else None,
        "recent_results": [r.to_dict() for r in results[:20]]  # 최근 20개
    }


@router.websocket("/ws/rss/{source_id}")
async def websocket_rss_crawling(websocket: WebSocket, source_id: str):
    """
    RSS 뉴스 크롤링 WebSocket 엔드포인트

    Args:
        source_id: RSS 소스 ID ('source:news:mfds' 또는 'source:news:mohw')
    """
    await manager.connect(websocket)

    try:
        # DB 세션 생성
        db = next(get_db())

        # RSS 설정 조회
        config = db.query(RSSConfig).filter(RSSConfig.source_id == source_id).first()

        if not config:
            await websocket.send_text(f'{{"type": "error", "message": "RSS config not found: {source_id}"}}')
            return

        if not config.enabled:
            await websocket.send_text(f'{{"type": "error", "message": "RSS config is disabled: {source_id}"}}')
            return

        # Callback 함수 정의 (WebSocket으로 메시지 전송)
        async def callback(message: str):
            await manager.send_message(message, websocket)

        # RSS 크롤러 생성 및 실행
        crawler = RSSNewsCrawler(
            source_id=config.source_id,
            feed_url=config.feed_url,
            config={
                'keywords': config.keywords or [],
                'date_range_days': config.date_range_days or 30
            }
        )

        # 크롤링 실행
        await crawler.execute(callback, db)

        # Keep connection alive for final messages
        await asyncio.sleep(1)

    except WebSocketDisconnect:
        manager.disconnect(websocket)
        print(f"WebSocket disconnected for RSS {source_id}")

    except Exception as e:
        print(f"WebSocket error for RSS {source_id}: {str(e)}")
        await websocket.send_text(f'{{"type": "error", "message": "{str(e)}"}}')

    finally:
        manager.disconnect(websocket)
        if 'db' in locals():
            db.close()
