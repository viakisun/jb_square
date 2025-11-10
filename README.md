# JB SQUARE - 전북 바이오 플랫폼

## 프로젝트 개요

JB SQUARE는 전북 지역 바이오 산업 정보를 통합 관리하는 플랫폼입니다. 일반 사용자를 위한 공개 사이트와 관리자를 위한 백오피스를 분리하여 운영합니다.

## 시스템 구조

### 멀티 프론트엔드 아키텍처
- **메인 사이트** (`/`) - 일반 사용자용 공개 웹사이트 (Next.js 14)
- **관리자 패널** (`/admin`) - 관리자용 백오피스 (SvelteKit)
- **백엔드 API** (`/api`) - 통합 API 서버 (FastAPI)

### 폴더 구조
```
jb_square/
├── backend/           # FastAPI 백엔드 서버
├── frontend-main/     # Next.js 메인 공개 사이트
├── frontend-admin/    # SvelteKit 관리자 백오피스
├── nginx/            # Nginx 리버스 프록시 설정
├── docs/             # 프로젝트 문서
├── scripts/          # 배포 및 유틸리티 스크립트
└── docker-compose.yml # Docker 개발 환경
```

## 빠른 시작

### 사전 요구사항
- Docker & Docker Compose
- Git
- Node.js 20+ (로컬 개발 시)
- Python 3.11+ (로컬 개발 시)

### 환경 설정
1. 저장소 클론
```bash
git clone [repository-url]
cd jb_square
```

2. 환경 변수 설정
```bash
cp .env.example .env
# .env 파일을 편집하여 필요한 값 설정
```

3. Docker로 실행
```bash
# 개발 환경
docker-compose up -d

# 프로덕션 환경
docker-compose -f docker-compose.prod.yml up -d
```

### 서비스 접속
- 메인 사이트: http://localhost
- 관리자 패널: http://localhost/admin
- API 문서: http://localhost/docs
- API (Redoc): http://localhost/redoc

## 주요 기능

### 메인 사이트 (일반 사용자)
- 공고 정보 열람
- 기업/기관 정보 조회
- 통계 데이터 확인
- 창업보육센터 정보

### 관리자 백오피스
- 공고 데이터 크롤링 관리
- 콘텐츠 관리 (CRUD)
- 기업/기관 정보 관리
- 통계 분석 대시보드
- 시스템 설정

## 기술 스택

### Backend
- FastAPI (Python 3.11)
- PostgreSQL (AWS RDS)
- SQLAlchemy ORM
- AWS S3 (파일 저장소)

### Frontend Main (공개 사이트)
- Next.js 14
- React 18
- TypeScript
- Tailwind CSS

### Frontend Admin (백오피스)
- SvelteKit
- TypeScript
- Tailwind CSS
- DaisyUI

### Infrastructure
- Docker & Docker Compose
- Nginx (리버스 프록시)
- AWS EC2 (호스팅)
- GitHub Actions (CI/CD)

## API 키 설정

`.env` 파일에 다음 API 키들을 설정해야 합니다:

- **NTIS_API_KEY**: 국가과학기술지식정보서비스
- **JBTP_API_KEY**: 전북테크노파크 (선택사항)
- **NAVER_MAPS_CLIENT_ID**: Naver Maps API (BI Center 지도용)

자세한 API 설정 방법은 [docs/setup/API_SETUP.md](docs/setup/API_SETUP.md)를 참조하세요.

## 배포

### GitHub Actions 자동 배포 (권장)
```bash
# main 브랜치에 푸시하면 자동 배포
git push origin main
```

### 수동 배포 (EC2)
```bash
# EC2 서버에서
cd ~/jb_square
git pull origin main
docker-compose -f docker-compose.prod.yml up -d --build
```

자세한 배포 가이드는 [DEPLOYMENT.md](DEPLOYMENT.md)와 [QUICKSTART.md](QUICKSTART.md)를 참조하세요.

## 개발 가이드

### 로컬 개발 환경

#### Backend
```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn src.main:app --reload --port 8000
```

#### Frontend Main
```bash
cd frontend-main
npm install
npm run dev  # http://localhost:3100
```

#### Frontend Admin
```bash
cd frontend-admin
npm install
npm run dev  # http://localhost:5173
```

### 코드 구조

#### Backend
```
backend/src/
├── core/              # 핵심 설정 (DB, 인증 등)
├── models/            # 데이터베이스 모델
├── routers/           # API 엔드포인트
├── services/
│   ├── sources/       # 데이터 소스 어댑터 (크롤러)
│   └── ...            # 기타 비즈니스 로직
└── main.py            # 애플리케이션 진입점
```

#### Frontend
```
frontend-main/
├── app/          # Next.js 앱 라우터
├── components/   # 재사용 가능한 컴포넌트
├── lib/          # 유틸리티 함수
└── public/       # 정적 파일

frontend-admin/
├── src/
│   ├── routes/   # SvelteKit 라우트
│   ├── lib/      # 공유 라이브러리
│   └── app.html  # HTML 템플릿
└── static/       # 정적 파일
```

## 문제 해결

### 일반적인 문제

1. **502 Bad Gateway**
   ```bash
   docker-compose logs -f
   docker-compose restart
   ```

2. **CORS 오류**
   - `.env`의 `CORS_ALLOWED_ORIGINS` 확인
   - Backend 재시작

3. **Admin 패널 접속 불가**
   - `svelte.config.js`의 `paths.base` 확인
   - Nginx 설정 확인

## 보안

- 모든 외부 트래픽은 Nginx를 통해 처리
- 내부 서비스는 직접 노출되지 않음
- CORS는 특정 도메인만 허용
- 프로덕션에서는 HTTPS 필수

## 라이선스

[라이선스 정보]

## 문의

[연락처 정보]

---

자세한 아키텍처 문서는 [docs/FRONTEND_ARCHITECTURE.md](docs/FRONTEND_ARCHITECTURE.md)를 참조하세요.