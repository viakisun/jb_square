"""
전북 바이오 플랫폼 백오피스 API
FastAPI 메인 애플리케이션
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import dashboard, contents, organizations, analytics, settings, crawling
from app.database import init_db

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

# CORS 설정 (Svelte 개발 서버용)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:5174"],  # Svelte dev server
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 라우터 등록
app.include_router(dashboard.router, prefix="/api/dashboard", tags=["대시보드"])
app.include_router(contents.router, prefix="/api/contents", tags=["콘텐츠"])
app.include_router(organizations.router, prefix="/api/organizations", tags=["기업·기관"])
app.include_router(analytics.router, prefix="/api/analytics", tags=["통계"])
app.include_router(settings.router, prefix="/api/settings", tags=["설정"])
app.include_router(crawling.router, prefix="/api/crawling", tags=["크롤링"])


@app.get("/")
async def root():
    return {
        "message": "전북 바이오 플랫폼 API",
        "version": "1.0.0",
        "docs": "/docs"
    }


@app.get("/health")
async def health_check():
    return {"status": "healthy"}


@app.post("/init-db")
async def initialize_database():
    """데이터베이스 테이블 초기화"""
    try:
        init_db()
        return {"status": "success", "message": "Database initialized successfully"}
    except Exception as e:
        return {"status": "error", "message": str(e)}
