# 바이오 플랫폼 백오피스

전북 지역 바이오 산업 공고 크롤링 및 관리를 위한 웹 기반 백오피스 시스템

## 🚀 빠른 시작

### 1. 환경 설정

```bash
cd /Users/adminvia/devwork/jb2/backoffice

# 가상환경 생성 및 활성화
python3 -m venv venv
source venv/bin/activate  # macOS/Linux
# or
venv\Scripts\activate  # Windows

# 의존성 설치
pip install -r requirements.txt
```

### 2. 데이터베이스 초기화

```bash
python database/init_db.py
```

이 스크립트는:
- AWS RDS PostgreSQL에 연결
- `jb2_database` 생성 (없으면)
- 테이블 생성 (contents, organizations, crawl_logs, users, settings)
- 초기 관리자 계정 생성 (admin@bio.kr / admin123)

### 3. 서버 실행

```bash
python run.py
```

서버가 시작되면:
- URL: http://localhost:5000
- 로그인: admin@bio.kr / admin123

## 📋 주요 기능

### 🧭 대시보드
- 오늘 수집/게시 건수 요약
- 마감 임박 공고 알림 (D-7 이내)
- 최근 업데이트된 기업 목록
- 크롤링 실행 로그

### 📰 콘텐츠 관리
- 자동 수집된 공고 목록
- 검수 및 승인/보류/삭제
- 출처별 필터링 (JBTP, NTIS, BizInfo)
- 크롤링 수동 실행

### 🏢 기업·기관 관리 (곧 구현)
- 기업/기관 정보 CRUD
- 입주 현황 관리
- 지원사업 참여 이력

### 📊 통계 리포트 (곧 구현)
- 기간별 수집/게시 통계
- 카테고리 분석
- 기업정보 최신성

### ⚙️ 설정
- 크롤링 소스 관리
- 자동 크롤링 스케줄
- 사용자 권한 관리

## 🗂️ 프로젝트 구조

```
backoffice/
├── backend/              # Flask 백엔드
│   ├── app.py           # 메인 앱
│   ├── config.py        # 설정
│   ├── models.py        # DB 모델
│   ├── crawler_manager.py  # 크롤러 통합
│   ├── scheduler.py     # 자동 스케줄러
│   └── routes/          # API 라우트
│       ├── dashboard.py
│       ├── contents.py
│       ├── organizations.py
│       ├── analytics.py
│       └── settings.py
├── frontend/            # 프론트엔드
│   ├── static/
│   │   ├── css/
│   │   └── js/
│   └── templates/       # Jinja2 템플릿
├── database/            # DB 스키마
│   ├── schema.sql
│   └── init_db.py
├── .env                 # 환경변수 (Git 제외)
├── requirements.txt     # Python 패키지
└── run.py              # 실행 스크립트
```

## 🔧 설정

### 환경변수 (.env)

이미 생성되어 있으며 다음 정보를 포함합니다:
- AWS RDS PostgreSQL 접속 정보
- AWS S3 설정
- Flask 설정
- 관리자 계정 정보

### 크롤러 경로

크롤러는 `../crawler` 디렉토리에 위치해야 합니다:
- jbtp_crawler.py
- ntis_crawler.py
- bizinfo_crawler.py

## 📡 API 엔드포인트

### 대시보드
- `GET /api/dashboard/summary` - 요약 통계
- `GET /api/dashboard/urgent-notices` - 마감 임박 공고
- `GET /api/dashboard/recent-organizations` - 최근 업데이트 기업
- `GET /api/dashboard/recent-logs` - 크롤링 로그

### 콘텐츠
- `GET /api/contents` - 목록 조회 (필터링, 페이지네이션)
- `GET /api/contents/<id>` - 상세 조회
- `PUT /api/contents/<id>` - 편집
- `PATCH /api/contents/<id>/status` - 상태 변경
- `POST /api/contents/bulk-action` - 일괄 작업
- `POST /api/contents/crawl` - 크롤링 실행

### 기업·기관
- `GET /api/organizations` - 목록 조회
- `GET /api/organizations/<id>` - 상세 조회
- `POST /api/organizations` - 신규 등록
- `PUT /api/organizations/<id>` - 수정
- `DELETE /api/organizations/<id>` - 삭제

### 통계
- `GET /api/analytics/content-stats` - 콘텐츠 통계
- `GET /api/analytics/category-distribution` - 카테고리 분포
- `GET /api/analytics/organization-freshness` - 기업정보 최신성
- `GET /api/analytics/crawl-success-rate` - 크롤링 성공률

### 설정
- `GET /api/settings/crawling-sources` - 크롤링 소스 설정 조회
- `PUT /api/settings/crawling-sources` - 소스 설정 변경
- `POST /api/settings/crawling-sources/<source>/execute` - 수동 실행
- `GET /api/settings/users` - 사용자 목록
- `POST /api/settings/users` - 사용자 추가
- `PUT /api/settings/users/<id>` - 사용자 수정
- `DELETE /api/settings/users/<id>` - 사용자 삭제

## 🔄 자동 크롤링

APScheduler를 사용하여 매일 오전 9시에 자동으로 크롤링을 실행합니다.

스케줄 변경은 `settings` 테이블의 `crawling_schedule` 값을 수정하세요 (Cron 표현식):
- `0 9 * * *` - 매일 09:00 (기본값)
- `0 */6 * * *` - 6시간마다
- `0 0 * * 0` - 매주 일요일 자정

## ⚠️ 주의사항

1. **환경변수 보안**
   - `.env` 파일은 절대 Git에 커밋하지 마세요
   - AWS 키는 정기적으로 회전하세요

2. **데이터베이스**
   - RDS 보안 그룹 설정 확인
   - 정기적인 백업 권장

3. **크롤러**
   - 각 웹사이트의 robots.txt 준수
   - 요청 간격 0.5초 유지

## 🐛 문제 해결

### 데이터베이스 연결 실패
```bash
# .env 파일의 DB 설정 확인
cat .env | grep DB

# RDS 보안 그룹 확인 (AWS Console)
```

### 크롤러 임포트 오류
```bash
# 크롤러 경로 확인
ls ../crawler/*.py

# Python 경로에 추가되었는지 확인
python -c "import sys; print(sys.path)"
```

### 포트 충돌
```bash
# 5000 포트 사용 중인 프로세스 확인
lsof -i :5000

# 또는 .env에서 FLASK_PORT 변경
```

## 📝 다음 단계

1. **Phase 2 기능 (1주 내)**
   - 기업·기관 관리 완성
   - 콘텐츠 편집 기능 (제목, 요약, 태그)
   - 통계 차트 (Chart.js)

2. **Phase 3 기능 (2주 내)**
   - 월간 리포트 PDF 생성
   - 이메일 알림
   - S3 파일 업로드

3. **향후 확장**
   - 사용자 인증/권한
   - 접속자 통계
   - 모바일 반응형

## 📞 지원

문제가 발생하면:
1. 로그 확인: 터미널 출력
2. DB 상태 확인: `python database/init_db.py`
3. 크롤러 단독 실행: `cd ../crawler && python jbtp_crawler.py`
