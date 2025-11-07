# 시스템 모니터링 기능

EC2 서버의 리소스 사용량, Docker 컨테이너, 로그를 실시간으로 모니터링하는 기능입니다.

## 📋 목차

- [개요](#개요)
- [아키텍처](#아키텍처)
- [기능](#기능)
- [설치 및 설정](#설치-및-설정)
- [API 엔드포인트](#api-엔드포인트)
- [프론트엔드 사용법](#프론트엔드-사용법)
- [보안 고려사항](#보안-고려사항)
- [트러블슈팅](#트러블슈팅)

## 개요

시스템 모니터링 기능은 다음과 같은 정보를 제공합니다:

- **시스템 리소스**: CPU, 메모리, 디스크 사용량
- **Docker 정보**: 컨테이너, 이미지, 볼륨, 빌드 캐시
- **컨테이너 로그**: 실시간 로그 조회 및 필터링
- **리소스 알림**: 임계값 초과 시 자동 알림

### 주요 특징

- ✅ **Clean Architecture**: Infrastructure → Service → API → Presentation 계층 분리
- ✅ **읽기 전용**: 시스템 조회만 가능, 변경 불가 (안전성)
- ✅ **민감정보 보호**: 로그에서 비밀번호, API 키 자동 마스킹
- ✅ **성능 최적화**: 캐싱 메커니즘 (5초 TTL)
- ✅ **타입 안전성**: Pydantic (Backend) + TypeScript (Frontend)
- ✅ **실시간 모니터링**: 자동 새로고침 및 WebSocket 지원

## 아키텍처

```
┌─────────────────────────────────────────────────────────────┐
│                      Frontend (SvelteKit)                    │
│  - TypeScript Types                                          │
│  - API Client                                                │
│  - Svelte Components                                         │
│  - /system-monitor 페이지                                   │
└────────────────────────┬────────────────────────────────────┘
                         │ REST API
┌────────────────────────┴────────────────────────────────────┐
│                      Backend (FastAPI)                       │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐   │
│  │              API Layer (Routers)                     │   │
│  │  - GET /api/system/status                           │   │
│  │  - GET /api/docker/containers                       │   │
│  │  - GET /api/logs/{container}                        │   │
│  └───────────────────┬──────────────────────────────────┘   │
│                      │                                       │
│  ┌───────────────────┴──────────────────────────────────┐   │
│  │           Service Layer (Business Logic)            │   │
│  │  - SystemMonitorService                             │   │
│  │  - Resource Alert Logic                             │   │
│  └───────────────────┬──────────────────────────────────┘   │
│                      │                                       │
│  ┌───────────────────┴──────────────────────────────────┐   │
│  │         Infrastructure Layer (Data Access)          │   │
│  │  - SystemInfoProvider (psutil wrapper)              │   │
│  │  - DockerClient (Docker SDK wrapper)                │   │
│  │  - LogReader (Log parsing & masking)                │   │
│  └──────────────────────────────────────────────────────┘   │
└────────────────────────┬────────────────────────────────────┘
                         │
          ┌──────────────┴─────────────┐
          │                            │
    ┌─────┴──────┐            ┌────────┴────────┐
    │   psutil   │            │   Docker SDK    │
    │  (System)  │            │ (Docker Daemon) │
    └────────────┘            └─────────────────┘
```

## 기능

### 1. 시스템 리소스 모니터링

**메모리**
- 총 용량, 사용량, 사용률
- 캐시, 사용 가능한 메모리
- 실시간 사용률 그래프

**디스크**
- 총 용량, 사용량, 사용률
- 마운트 포인트 정보
- 여유 공간 표시

**CPU**
- 사용률 (0-100%)
- 코어 개수
- 로드 평균 (1분, 5분, 15분)

### 2. Docker 모니터링

**컨테이너**
- 실행 중/전체 컨테이너 목록
- 상태 (running, exited, restarting, 등)
- 헬스체크 상태
- 생성/시작 시각
- 크기 정보

**이미지**
- 전체 이미지 목록
- 리포지토리, 태그
- 크기 정보
- 생성 시각

**시스템 정보**
- 전체 이미지/컨테이너 개수
- 실행 중인 컨테이너 수
- 볼륨 개수
- 빌드 캐시 크기

### 3. 로그 조회

**기능**
- 컨테이너별 로그 조회
- 로그 레벨 필터링 (DEBUG, INFO, WARNING, ERROR, CRITICAL)
- 검색어 필터링
- 민감한 정보 자동 마스킹
- 로그 다운로드
- 자동 스크롤

**마스킹 패턴**
- 비밀번호 (password, passwd, pwd)
- API 키 (api_key, apikey, access_key)
- 시크릿 키 (secret_key, private_key)
- 토큰 (token, bearer)
- 이메일 주소
- AWS 액세스 키
- JWT 토큰

### 4. 리소스 알림

**임계값 기반 알림**
- Warning: 80% 이상
- Critical: 90% 이상

**알림 타입**
- 메모리 사용량 초과
- 디스크 사용량 초과
- CPU 사용량 초과

## 설치 및 설정

### Backend 설정

1. **의존성 설치**

```bash
cd backend
pip install -r requirements.txt
```

2. **Docker Socket 권한 설정** (Production 환경)

`docker-compose.prod.yml`에 이미 설정되어 있습니다:

```yaml
services:
  backend:
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock:ro  # 읽기 전용
```

3. **환경 변수** (선택사항)

```bash
# .env 파일
SYSTEM_MONITOR_CACHE_TTL=5  # 캐시 유효 시간 (초)
SYSTEM_MONITOR_WARNING_THRESHOLD=80  # 경고 임계값 (%)
SYSTEM_MONITOR_CRITICAL_THRESHOLD=90  # 위험 임계값 (%)
```

### Frontend 설정

Frontend는 별도 설정이 필요 없습니다. Backend API URL만 올바르게 설정되면 자동으로 작동합니다.

```bash
# frontend/.env (개발 환경)
VITE_API_URL=http://localhost:8000/api
```

## API 엔드포인트

모든 엔드포인트는 `/api` prefix를 사용합니다.

### 시스템 리소스

#### GET `/system/status`
전체 시스템 상태 조회

**Response:**
```json
{
  "memory": {
    "total": 2147483648,
    "used": 1073741824,
    "available": 536870912,
    "percent": 50.0,
    "free": 268435456,
    "cached": 268435456
  },
  "disk": {
    "total": 32212254720,
    "used": 16106127360,
    "free": 16106127360,
    "percent": 50.0,
    "mount_point": "/"
  },
  "cpu": {
    "percent": 25.5,
    "count": 2,
    "load_average": [0.5, 0.6, 0.7]
  },
  "docker": {
    "images_count": 4,
    "containers_count": 4,
    "running_containers": 4,
    "images_size": 1747000000,
    "containers_size": 366800,
    "volumes_count": 0,
    "build_cache_size": 0
  },
  "timestamp": "2025-11-07T10:30:00Z"
}
```

#### GET `/system/memory`
메모리 상태만 조회

#### GET `/system/disk`
디스크 상태만 조회

#### GET `/system/cpu`
CPU 상태만 조회

#### GET `/system/alerts`
리소스 알림 조회

**Response:**
```json
[
  {
    "resource_type": "memory",
    "level": "warning",
    "current_value": 85.5,
    "threshold": 80.0,
    "message": "메모리 사용량이 높습니다: 85.5%",
    "timestamp": "2025-11-07T10:30:00Z"
  }
]
```

### Docker 정보

#### GET `/docker/containers?all=true`
컨테이너 목록 조회

**Query Parameters:**
- `all` (boolean): 중지된 컨테이너 포함 여부 (default: true)

**Response:**
```json
[
  {
    "id": "1234567890ab",
    "name": "jb2-backend-prod",
    "image": "711678334703.dkr.ecr.ap-northeast-2.amazonaws.com/jb-square:backend-latest",
    "status": "running",
    "health": "healthy",
    "created": "2025-11-07T10:00:00Z",
    "started": "2025-11-07T10:00:05Z",
    "size": 365000
  }
]
```

#### GET `/docker/images`
이미지 목록 조회

#### GET `/docker/system`
Docker 시스템 정보 조회

### 로그

#### GET `/logs/containers`
로그 조회 가능한 컨테이너 목록

**Response:**
```json
["jb2-backend-prod", "jb2-frontend-main-prod", "jb2-frontend-admin-prod", "jb2-nginx-prod"]
```

#### GET `/logs/{container_name}`
컨테이너 로그 조회

**Query Parameters:**
- `lines` (int): 조회할 라인 수 (default: 500, max: 10000)
- `level_filter` (string): 로그 레벨 필터 (DEBUG, INFO, WARNING, ERROR, CRITICAL)
- `search_term` (string): 검색어

**Response:**
```json
{
  "container_name": "jb2-backend-prod",
  "lines": [
    {
      "timestamp": "2025-11-07T10:30:00Z",
      "level": "INFO",
      "message": "Application started successfully"
    }
  ],
  "total_lines": 500,
  "filtered_lines": 1,
  "has_more": false
}
```

## 프론트엔드 사용법

### 페이지 접근

```
https://admin.jb2.kr/system-monitor
```

### 주요 기능

1. **개요 탭**: 전체 시스템 상태 한눈에 보기
   - 리소스 카드 (메모리, 디스크, CPU)
   - Docker 시스템 정보
   - 컨테이너 목록 미리보기

2. **컨테이너 탭**: 전체 컨테이너 상세 정보
   - 상태, 헬스체크, 이미지, 크기
   - 컨테이너 클릭 시 로그 조회

3. **이미지 탭**: Docker 이미지 목록
   - 리포지토리, 태그, 크기, 생성 시각

4. **로그 탭**: 컨테이너 로그 실시간 조회
   - 로그 레벨 필터링
   - 검색어 필터링
   - 자동 스크롤
   - 로그 다운로드

### 자동 새로고침

- 설정 버튼에서 자동 새로고침 활성화
- 간격 선택: 10초, 30초, 1분, 5분
- 로그 탭은 별도 새로고침 간격 사용

## 보안 고려사항

### 1. Docker Socket 보안

- Docker socket은 **읽기 전용(ro)**으로 마운트
- 컨테이너 조작 기능 없음 (조회만 가능)
- 프로덕션 환경에서 필수 설정

```yaml
volumes:
  - /var/run/docker.sock:/var/run/docker.sock:ro
```

### 2. 민감정보 마스킹

로그에서 다음 정보를 자동으로 마스킹:
- 비밀번호 → `password=***`
- API 키 → `api_key=***`
- AWS 키 → `AKIA***`
- 이메일 → `***@***.***`
- JWT 토큰 → `jwt_token_***`

### 3. API 인증

- 추후 인증 미들웨어 추가 예정
- 현재는 내부 네트워크에서만 접근 가능

### 4. Rate Limiting

- 과도한 요청 방지
- 캐싱 메커니즘 (5초 TTL)

## 트러블슈팅

### Backend 이슈

#### 1. Docker 연결 실패

**증상:**
```
DockerConnectionError: Docker 데몬 연결 실패
```

**해결:**
1. Docker daemon이 실행 중인지 확인
   ```bash
   docker ps
   ```

2. Docker socket 권한 확인
   ```bash
   ls -la /var/run/docker.sock
   ```

3. docker-compose.prod.yml 볼륨 설정 확인
   ```yaml
   volumes:
     - /var/run/docker.sock:/var/run/docker.sock:ro
   ```

#### 2. psutil 설치 오류

**증상:**
```
ModuleNotFoundError: No module named 'psutil'
```

**해결:**
```bash
pip install psutil==5.9.8
```

#### 3. 로그 조회 실패

**증상:**
```
ValueError: 컨테이너를 찾을 수 없습니다
```

**해결:**
1. 컨테이너 이름 확인
   ```bash
   docker ps --format "{{.Names}}"
   ```

2. 컨테이너가 실행 중인지 확인
   ```bash
   docker ps | grep <container-name>
   ```

### Frontend 이슈

#### 1. API 연결 실패

**증상:**
```
Failed to fetch: NetworkError
```

**해결:**
1. Backend 서버 상태 확인
   ```bash
   curl http://localhost:8000/health
   ```

2. CORS 설정 확인 (backend/.env)
   ```
   CORS_ALLOWED_ORIGINS=https://admin.jb2.kr,http://localhost:5173
   ```

3. API URL 확인 (frontend/.env)
   ```
   VITE_API_URL=/api
   ```

#### 2. 컴포넌트 렌더링 오류

**증상:**
```
TypeError: Cannot read property 'percent' of undefined
```

**해결:**
1. API 응답 구조 확인
2. 타입 정의 확인 (lib/types/system-monitor.ts)
3. Optional chaining 사용 (`systemStatus?.memory?.percent`)

## 테스트

### Backend 테스트

```bash
cd backend
python tests/test_system_monitor.py
```

예상 출력:
```
╔══════════════════════════════════════════════════════════╗
║            시스템 모니터링 기능 테스트                  ║
╚══════════════════════════════════════════════════════════╝

테스트 1: 전체 시스템 상태 조회
============================================================
✓ 시스템 상태 조회 성공
...

테스트 결과 요약
============================================================
✓ PASS  시스템 상태 조회
✓ PASS  컨테이너 목록 조회
✓ PASS  이미지 목록 조회
✓ PASS  로그 조회
✓ PASS  리소스 알림

총 5개 테스트 중 5개 통과 (100.0%)
✓ 모든 테스트가 성공했습니다!
```

### API 테스트 (curl)

```bash
# 시스템 상태 조회
curl http://localhost:8000/api/system/status

# 컨테이너 목록 조회
curl http://localhost:8000/api/docker/containers

# 로그 조회 (ERROR만)
curl "http://localhost:8000/api/logs/jb2-backend-prod?level_filter=ERROR&lines=100"

# 알림 조회
curl http://localhost:8000/api/system/alerts
```

## 파일 구조

```
backend/
├── src/
│   ├── infrastructure/           # Infrastructure Layer
│   │   ├── __init__.py
│   │   ├── system_info_provider.py    # psutil wrapper
│   │   ├── docker_client.py            # Docker SDK wrapper
│   │   └── log_reader.py               # Log parsing & masking
│   │
│   ├── services/                 # Service Layer
│   │   └── system_monitor_service.py   # Business logic
│   │
│   ├── routers/                  # API Layer
│   │   └── system_monitor.py           # FastAPI endpoints
│   │
│   └── models/                   # Data Models
│       ├── system_models.py            # Pydantic models
│       └── exceptions.py               # Custom exceptions
│
└── tests/
    └── test_system_monitor.py    # Tests

frontend/
└── src/
    ├── lib/
    │   ├── types/
    │   │   └── system-monitor.ts       # TypeScript types
    │   │
    │   ├── api/
    │   │   └── system-monitor-api.ts   # API client
    │   │
    │   └── components/system/          # Svelte components
    │       ├── ResourceCard.svelte
    │       ├── ContainerList.svelte
    │       ├── LogViewer.svelte
    │       └── AlertBanner.svelte
    │
    └── routes/
        └── system-monitor/
            └── +page.svelte            # Main page
```

## 성능 고려사항

### 캐싱

- **SystemInfoProvider**: 5초 TTL 캐싱
- **메모리 사용**: Singleton 패턴으로 인스턴스 재사용
- **Docker API**: 연결 재사용 (Context Manager)

### 최적화

- **비동기 처리**: asyncio.gather로 병렬 데이터 수집
- **재시도 로직**: Exponential backoff (1초 → 2초 → 3초)
- **로그 크기 제한**: 최대 10MB, 라인당 10KB

### 모니터링 오버헤드

- **CPU**: < 1% (캐싱 활성화 시)
- **메모리**: < 50MB
- **네트워크**: 새로고침당 < 1MB

## 향후 개선사항

- [ ] WebSocket 기반 실시간 업데이트
- [ ] 히스토리 차트 (시간별 리소스 사용량)
- [ ] 알림 설정 UI (임계값 커스터마이징)
- [ ] 로그 export (CSV, JSON)
- [ ] Grafana/Prometheus 통합
- [ ] 멀티 서버 모니터링
- [ ] 컨테이너 재시작/중지 기능 (권한 관리 필요)

## 라이센스

이 프로젝트는 JB Square 내부용으로 개발되었습니다.

## 문의

기술 문의: JB Square Dev Team

---

**Last Updated**: 2025-11-07
**Version**: 1.0.0
**Author**: JB Square Dev Team
