"""
전북 바이오 플랫폼 백오피스 API
FastAPI 메인 애플리케이션
"""
import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from src.routers import dashboard, contents, organizations, analytics, settings, crawling, notices, bi_centers, crawling_config, tags, ksic_codes, system_monitor
from src.core.database import init_db

app = FastAPI(
    title="전북 바이오 플랫폼 API",
    description="전북 지역 바이오 산업 공고 및 기업 정보 관리 API",
    version="1.0.0"
)

# 데이터베이스 초기화
# @app.on_event("startup")
# async def startup_event():
#     """애플리케이션 시작 시 데이터베이스 테이블 생성"""
#     try:
#         init_db()
#     except Exception as e:
#         print(f"Warning: Could not initialize database: {str(e)}")

# CORS 설정 (환경변수에서 허용 도메인 읽기)
cors_origins = os.getenv(
    "CORS_ALLOWED_ORIGINS",
    "http://localhost:3000,http://localhost:5173,http://localhost:5174,http://localhost:5175"
).split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 라우터 등록
app.include_router(dashboard.router, prefix="/api/dashboard", tags=["대시보드"])
app.include_router(contents.router, prefix="/api/contents", tags=["콘텐츠"])
app.include_router(organizations.router, prefix="/api/organizations", tags=["기업·기관"])
app.include_router(ksic_codes.router, prefix="/api/ksic-codes", tags=["KSIC 코드"])
app.include_router(analytics.router, prefix="/api/analytics", tags=["통계"])
app.include_router(settings.router, prefix="/api/settings", tags=["설정"])
app.include_router(crawling.router, prefix="/api/crawling", tags=["크롤링"])
app.include_router(crawling_config.router, prefix="/api/crawling/configs", tags=["크롤링 설정"])
app.include_router(notices.router, tags=["공고관리"])  # Notice: prefix already in router
app.include_router(bi_centers.router, prefix="/api/bi-centers", tags=["창업보육센터"])
app.include_router(tags.router, tags=["태그관리"])
app.include_router(system_monitor.router, tags=["시스템 모니터링"])


@app.get("/")
async def root():
    return {
        "message": "전북 바이오 플랫폼 API",
        "version": "1.0.0",
        "docs": "/docs"
    }


@app.get("/health")
async def health_check():
    """헬스체크 엔드포인트 - 데이터베이스 연결 확인"""
    from src.core.database import engine
    from sqlalchemy import text
    try:
        # 데이터베이스 연결 테스트
        with engine.connect() as conn:
            conn.execute(text("SELECT 1"))
        return {"status": "healthy", "database": "connected"}
    except Exception as e:
        # 데이터베이스 연결 실패해도 서버는 실행 중이므로 200 반환
        # 하지만 상태는 degraded로 표시
        return {"status": "degraded", "database": "disconnected", "error": str(e)}


@app.post("/init-db")
async def initialize_database():
    """데이터베이스 테이블 초기화"""
    try:
        init_db()
        return {"status": "success", "message": "Database initialized successfully"}
    except Exception as e:
        return {"status": "error", "message": str(e)}
