# Python 3.9 → 3.10+ 업그레이드 계획

## 현재 상황

### 경고 메시지
```
PythonDeprecationWarning: Boto3 will no longer support Python 3.9 starting April 29, 2026.
To continue receiving service updates, bug fixes, and security updates please upgrade to Python 3.10 or later.
More information: https://aws.amazon.com/blogs/developer/python-support-policy-updates-for-aws-sdks-and-tools/
```

### 영향도
- **현재**: Python 3.9에서 정상 작동, 경고 메시지만 출력
- **2026년 4월 29일 이후**: AWS SDK(Boto3) 보안 업데이트 중단
- **권장 조치 시점**: 2026년 2월 이전 (여유 있게 2개월 전)

## 업그레이드 체크리스트

### 1단계: 호환성 검토 (우선순위: 높음)
- [ ] `requirements.txt`의 모든 패키지가 Python 3.10+ 지원 확인
- [ ] FastAPI, SQLAlchemy, Pydantic 등 주요 프레임워크 버전 확인
- [ ] Selenium, BeautifulSoup 등 크롤러 라이브러리 호환성 확인

### 2단계: 로컬 테스트 환경 구축
```bash
# Python 3.10 설치 (macOS)
brew install python@3.10

# 또는 Python 3.11 (더 최신)
brew install python@3.11

# 새 가상환경 생성
cd backend
python3.10 -m venv venv-py310

# 패키지 설치 테스트
source venv-py310/bin/activate
pip install -r requirements.txt
```

### 3단계: 코드 호환성 테스트
- [ ] Backend API 서버 시작 테스트
- [ ] 크롤러 실행 테스트 (JBTP, NTIS, BIZINFO)
- [ ] Database 마이그레이션 테스트
- [ ] S3 파일 업로드 테스트

### 4단계: Docker 이미지 업데이트
```dockerfile
# backend/Dockerfile 수정 전 (현재)
FROM python:3.9-slim

# backend/Dockerfile 수정 후
FROM python:3.10-slim
# 또는
FROM python:3.11-slim
```

### 5단계: CI/CD 파이프라인 업데이트
- [ ] GitHub Actions에서 Python 버전 업데이트
- [ ] `.github/workflows/deploy.yml` 수정 (필요시)

### 6단계: Production 배포
```bash
# EC2 서버에서 Python 3.10 설치
sudo yum install python310  # Amazon Linux 2
# 또는
sudo apt install python3.10  # Ubuntu

# Docker Compose 재빌드
docker-compose -f docker-compose.prod.yml down
docker-compose -f docker-compose.prod.yml build --no-cache
docker-compose -f docker-compose.prod.yml up -d

# 헬스 체크
curl http://localhost:8000/health
```

## 예상 작업 시간

| 단계 | 작업 시간 | 담당자 |
|------|----------|--------|
| 1. 호환성 검토 | 1시간 | Backend 개발자 |
| 2. 로컬 테스트 | 2시간 | Backend 개발자 |
| 3. 코드 테스트 | 2-4시간 | Backend 개발자 |
| 4. Docker 업데이트 | 30분 | DevOps |
| 5. CI/CD 업데이트 | 30분 | DevOps |
| 6. Production 배포 | 1시간 | DevOps |
| **총 예상 시간** | **7-9시간** | |

## 위험 요소

### 높음
없음 (Python 3.9 → 3.10은 거의 100% 호환)

### 중간
- **패키지 버전 충돌**: 일부 패키지가 Python 3.10에서 다른 버전 필요 가능
  - **해결**: `pip install --upgrade` 후 테스트

- **타입 힌팅 변경**: Python 3.10에서 타입 힌팅 문법 개선
  - **해결**: 기존 코드 그대로 사용 가능 (하위 호환)

### 낮음
- **성능 차이**: Python 3.10+이 더 빠름 (긍정적 영향)

## 롤백 계획

만약 Python 3.10 업그레이드 후 문제 발생 시:

```bash
# Docker Compose에서 이전 버전으로 롤백
docker-compose -f docker-compose.prod.yml down
git checkout HEAD~1 backend/Dockerfile
docker-compose -f docker-compose.prod.yml up -d --build
```

## 추천 일정

### 시나리오 A: 보수적 접근 (권장)
- **2025년 12월**: 로컬 테스트 및 호환성 검토
- **2026년 1월**: Staging 환경에서 테스트
- **2026년 2월**: Production 배포

### 시나리오 B: 적극적 접근
- **2025년 6월**: 로컬 테스트
- **2025년 7월**: Production 배포
- **이점**: 최신 보안 패치 조기 적용

## 참고 자료

- [Python 3.10 릴리스 노트](https://docs.python.org/3/whatsnew/3.10.html)
- [Python 3.11 릴리스 노트](https://docs.python.org/3/whatsnew/3.11.html)
- [AWS SDK Python Support Policy](https://aws.amazon.com/blogs/developer/python-support-policy-updates-for-aws-sdks-and-tools/)

## 업데이트 기록

| 날짜 | 내용 | 작성자 |
|------|------|--------|
| 2025-11-09 | 초안 작성 | Claude Code |
