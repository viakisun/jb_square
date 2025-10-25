# 전북 바이오 플랫폼 API

FastAPI 백엔드 서버

## 🚀 빠른 시작

### 1. 가상환경 설정

```bash
cd /Users/adminvia/devwork/jb2/api
python3 -m venv venv
source venv/bin/activate  # macOS/Linux
```

### 2. 의존성 설치

```bash
pip install -r requirements.txt
```

### 3. 서버 실행

```bash
python run.py
```

서버가 실행되면:
- API: http://localhost:8000
- API 문서: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## 📡 API 엔드포인트

### 대시보드
- `GET /api/dashboard/summary` - 요약 통계
- `GET /api/dashboard/urgent-notices` - 마감 임박 공고
- `GET /api/dashboard/recent-organizations` - 최근 업데이트 기업
- `GET /api/dashboard/recent-logs` - 크롤링 로그

### 콘텐츠
- `GET /api/contents` - 공고 목록 (필터링, 페이지네이션)
- `GET /api/contents/{id}` - 공고 상세

### 기업·기관
- `GET /api/organizations/centers` - 창업보육센터 목록
- `GET /api/organizations/companies` - 입주기업 목록

### 통계
- `GET /api/analytics/content-stats` - 콘텐츠 통계
- `GET /api/analytics/organization-stats` - 기업 통계

### 설정
- `GET /api/settings/crawling-sources` - 크롤링 소스 설정
- `POST /api/settings/crawling-sources/{source_id}/execute` - 수동 실행

## 📁 프로젝트 구조

```
api/
├── app/
│   ├── __init__.py
│   ├── main.py           # FastAPI 앱
│   └── routers/          # API 라우터
│       ├── dashboard.py
│       ├── contents.py
│       ├── organizations.py
│       ├── analytics.py
│       └── settings.py
├── requirements.txt
├── run.py               # 실행 스크립트
└── README.md
```

## 🔧 개발

### 의존성 추가

```bash
pip install <package>
pip freeze > requirements.txt
```

### 테스트

API 문서 페이지에서 직접 테스트:
http://localhost:8000/docs
