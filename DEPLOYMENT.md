# 🚀 JB2 Backoffice - EC2 배포 가이드

이 가이드는 JB2 Backoffice를 AWS EC2에 자동으로 배포하는 방법을 설명합니다.

## ⚠️ 중요: 배포 방법

**유일하게 허용되는 배포 방법:**
- ✅ GitHub Actions를 통한 ECR 기반 배포 (main 브랜치 push)

**사용 금지된 배포 방법:**
- ❌ EC2에서 직접 `docker build` 실행
- ❌ `scripts/deploy.sh` 직접 실행 (로컬 빌드 방식, DEPRECATED)
- ❌ 수동으로 이미지 빌드 및 배포

**이유:**
- EC2 t3.small 인스턴스는 메모리가 부족하여 Docker 빌드 시 OOM 발생
- GitHub Actions가 이미지를 빌드하고 ECR에 푸시
- EC2는 ECR에서 이미지를 pull만 하여 메모리 부담 감소

---

## 📋 목차

1. [사전 준비](#사전-준비)
2. [EC2 인스턴스 설정](#ec2-인스턴스-설정)
3. [ECR 설정](#ecr-설정)
4. [GitHub Secrets 설정](#github-secrets-설정)
5. [자동 배포 설정](#자동-배포-설정)
6. [디스크 관리](#디스크-관리)
7. [SSL/TLS 인증서 설정](#ssltls-인증서-설정)
8. [트러블슈팅](#트러블슈팅)

---

## 🔧 사전 준비

### 필요한 것들

- AWS 계정
- EC2 인스턴스 (Ubuntu 22.04 LTS 권장)
- 도메인 (선택사항, SSL 사용 시 필수)
- GitHub 계정 (자동 배포용)

### 권장 EC2 사양

| 항목 | 최소 사양 | 권장 사양 |
|------|-----------|-----------|
| 인스턴스 타입 | t3.small | t3.medium |
| vCPU | 2 | 2 |
| 메모리 | 2GB | 4GB |
| 스토리지 | 20GB | 30GB |
| OS | Ubuntu 22.04 LTS | Ubuntu 22.04 LTS |

---

## ⚙️ EC2 인스턴스 설정

### 1. EC2 인스턴스 생성

1. AWS Console → EC2 → Launch Instance
2. **Name**: `jb2-backoffice-prod`
3. **AMI**: Ubuntu Server 22.04 LTS
4. **Instance Type**: t3.medium
5. **Key Pair**: 새로 생성 또는 기존 키 사용 (다운로드 보관!)
6. **Network Settings**:
   - Auto-assign public IP: Enable
   - Security Group:
     - SSH (22) - Your IP
     - HTTP (80) - 0.0.0.0/0
     - HTTPS (443) - 0.0.0.0/0
7. **Storage**: 30GB gp3

### 2. EC2에 접속

```bash
# SSH 키 권한 설정
chmod 400 your-key.pem

# EC2 접속
ssh -i your-key.pem ubuntu@<EC2-PUBLIC-IP>
```

### 3. 초기 설정 스크립트 실행

```bash
# 프로젝트 클론
cd ~
git clone https://github.com/your-username/your-repo.git jb2-backoffice
cd jb2-backoffice

# 설정 스크립트 실행 (Docker, Nginx 등 설치)
sudo bash scripts/setup-ec2.sh

# 재로그인 (docker 그룹 적용)
exit
ssh -i your-key.pem ubuntu@<EC2-PUBLIC-IP>
```

### 4. 환경 변수 설정

```bash
cd ~/jb2-backoffice

# .env 파일 생성
cp .env.example .env

# .env 파일 편집
nano .env
```

**.env 파일 예시:**
```bash
AWS_REGION=ap-northeast-2
AWS_ACCESS_KEY_ID=AKIA...
AWS_SECRET_ACCESS_KEY=...
AWS_DB_HOST=your-rds.amazonaws.com
AWS_DB_PORT=5432
AWS_DB_NAME=jb2_database
AWS_DB_USER=postgres
AWS_DB_PASSWORD=your_password
# ... 나머지 설정
```

---

## 📦 ECR 설정

### 1. ECR Repository 생성

```bash
# AWS CLI로 ECR 리포지토리 생성
aws ecr create-repository \
  --repository-name jb-square \
  --region ap-northeast-2

# 출력 예시:
# {
#   "repository": {
#     "repositoryUri": "711678334703.dkr.ecr.ap-northeast-2.amazonaws.com/jb-square"
#   }
# }
```

### 2. ECR Lifecycle Policy 적용

이미지가 무한정 쌓이지 않도록 lifecycle policy를 적용합니다.

```bash
# lifecycle-policy.json 파일 사용
aws ecr put-lifecycle-policy \
  --repository-name jb-square \
  --lifecycle-policy-text file://lifecycle-policy.json \
  --region ap-northeast-2
```

**Lifecycle Policy 내용:**
- `*-latest` 태그: 영구 보존
- SHA 태그 이미지: 최근 2개 버전만 유지
- 태그 없는 이미지: 1일 후 자동 삭제

### 3. EC2 IAM Role ECR 권한 추가

EC2 인스턴스가 ECR에서 이미지를 pull할 수 있도록 IAM Role에 권한을 추가합니다.

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "ecr:GetAuthorizationToken",
        "ecr:BatchCheckLayerAvailability",
        "ecr:GetDownloadUrlForLayer",
        "ecr:BatchGetImage"
      ],
      "Resource": "*"
    }
  ]
}
```

### 4. ECR 로그인 테스트 (EC2에서)

```bash
# EC2에 SSH 접속 후
aws ecr get-login-password --region ap-northeast-2 | \
  docker login --username AWS --password-stdin \
  711678334703.dkr.ecr.ap-northeast-2.amazonaws.com

# 성공 시: Login Succeeded
```

---

## 🔐 GitHub Secrets 설정

GitHub Actions를 통한 자동 배포를 위해 Repository Secrets를 설정합니다.

### 1. GitHub Repository Settings

`Settings` → `Secrets and variables` → `Actions` → `New repository secret`

### 2. 필요한 Secrets

| Secret 이름 | 설명 | 예시 |
|-------------|------|------|
| **EC2_HOST** | EC2 Public IP | `52.79.123.456` |
| **EC2_USER** | SSH 사용자명 | `ubuntu` |
| **EC2_SSH_KEY** | SSH 프라이빗 키 | `-----BEGIN RSA PRIVATE KEY-----...` |
| **AWS_REGION** | AWS 리전 | `ap-northeast-2` |
| **AWS_ACCESS_KEY_ID** | AWS Access Key | `AKIA...` |
| **AWS_SECRET_ACCESS_KEY** | AWS Secret Key | `...` |
| **AWS_S3_BUCKET_NAME** | S3 버킷 이름 | `jb2_bucket` |
| **AWS_S3_REGION** | S3 리전 | `ap-northeast-2` |
| **AWS_DB_HOST** | RDS 엔드포인트 | `db-viahub.xxx.rds.amazonaws.com` |
| **AWS_DB_PORT** | DB 포트 | `5432` |
| **AWS_DB_NAME** | 데이터베이스 이름 | `jb2_database` |
| **AWS_DB_USER** | DB 사용자 | `postgres` |
| **AWS_DB_PASSWORD** | DB 비밀번호 | `your_password` |
| **FLASK_SECRET_KEY** | Flask Secret | `random-string-here` |

### 3. SSH 키 추가 방법

```bash
# 로컬에서 EC2 SSH 키 내용 복사
cat your-key.pem

# 전체 내용을 EC2_SSH_KEY에 추가 (-----BEGIN...부터 -----END...까지)
```

---

## 🤖 자동 배포 설정

### GitHub Actions Workflow

`.github/workflows/deploy.yml` 파일이 이미 설정되어 있습니다.

### 배포 트리거

다음 경우에 자동으로 배포됩니다:
- `main` 브랜치에 push할 때
- GitHub Actions 탭에서 수동 실행

### 배포 프로세스

1. 코드 체크아웃
2. SSH 설정
3. .env 파일 생성
4. 파일 EC2로 복사 (rsync)
5. Docker 이미지 빌드
6. 컨테이너 재시작
7. 헬스 체크
8. 결과 알림

### 수동 배포 실행

1. GitHub → Actions → Deploy to EC2
2. `Run workflow` 클릭
3. 브랜치 선택 (`main`)
4. `Run workflow` 확인

---

## 🔒 SSL/TLS 인증서 설정

### Let's Encrypt로 무료 SSL 인증서 발급

```bash
# EC2에 접속
ssh -i your-key.pem ubuntu@<EC2-PUBLIC-IP>

# Certbot으로 인증서 발급
sudo certbot certonly --standalone -d your-domain.com -d www.your-domain.com

# 발급된 인증서 경로
# /etc/letsencrypt/live/your-domain.com/fullchain.pem
# /etc/letsencrypt/live/your-domain.com/privkey.pem

# nginx/ssl 디렉토리로 복사
sudo cp /etc/letsencrypt/live/your-domain.com/fullchain.pem ~/jb2-backoffice/nginx/ssl/
sudo cp /etc/letsencrypt/live/your-domain.com/privkey.pem ~/jb2-backoffice/nginx/ssl/
sudo chown ubuntu:ubuntu ~/jb2-backoffice/nginx/ssl/*
```

### nginx 설정 수정

`nginx/conf.d/default.conf`에서 HTTPS 블록 주석 해제:

```nginx
# Uncomment HTTPS server block
server {
    listen 443 ssl http2;
    server_name your-domain.com;

    ssl_certificate /etc/nginx/ssl/fullchain.pem;
    ssl_certificate_key /etc/nginx/ssl/privkey.pem;
    # ...
}
```

### 컨테이너 재시작

```bash
cd ~/jb2-backoffice
docker-compose -f docker-compose.prod.yml restart nginx
```

### 자동 갱신 설정

```bash
# Crontab 편집
sudo crontab -e

# 매일 새벽 3시에 인증서 갱신 시도
0 3 * * * certbot renew --quiet && cp /etc/letsencrypt/live/your-domain.com/*.pem ~/jb2-backoffice/nginx/ssl/ && docker-compose -f ~/jb2-backoffice/docker-compose.prod.yml restart nginx
```

---

## 💾 디스크 관리

### 1. 디스크 사용량 점검

EC2에서 정기적으로 디스크 사용량을 점검하는 것이 중요합니다.

```bash
# 전체 디스크 점검 스크립트 실행
ssh ec2-user@<EC2_IP>
cd ~/jb_square
bash scripts/check-disk-usage.sh
```

**점검 항목:**
- 전체 디스크 사용량
- Docker 이미지 및 컨테이너
- 로그 파일 크기
- 이전 프로젝트 잔여 파일
- 캐시 디렉토리

### 2. 디스크 정리

```bash
# Dry-run 모드 (변경 없이 미리보기)
bash scripts/cleanup-disk.sh --dry-run

# 자동 정리 (안전한 항목만)
bash scripts/cleanup-disk.sh --auto

# 인터랙티브 모드 (각 항목마다 확인)
bash scripts/cleanup-disk.sh --interactive
```

**자동으로 정리되는 항목:**
- Docker dangling images
- 사용하지 않는 ECR 이미지 (현재 실행 중이 아닌 SHA 태그)
- 중지된 컨테이너
- 사용하지 않는 Docker 네트워크/볼륨
- APT, Pip, NPM 캐시
- Docker 빌드 캐시
- 30일 이상 된 로그 파일

### 3. 자동 정리 설정 (권장)

```bash
# Crontab 편집
crontab -e

# 매주 일요일 새벽 3시에 자동 정리
0 3 * * 0 /home/ec2-user/jb_square/scripts/cleanup-disk.sh --auto >> /home/ec2-user/jb_square/logs/cleanup.log 2>&1
```

### 4. GitHub Actions 자동 정리

배포 시 자동으로 다음 항목이 정리됩니다:
- Dangling Docker images
- 사용하지 않는 ECR 이미지 (`*-latest` 태그 제외)

이 기능은 `.github/workflows/deploy.yml`에 이미 포함되어 있습니다.

### 5. EC2에 필요한 파일만 유지

**유지해야 할 파일:**
- `docker-compose.prod.yml` ✅
- `.env` ✅
- `nginx/nginx.conf` ✅
- `nginx/conf.d/` ✅
- `nginx/ssl/` ✅ (SSL 사용 시)
- `scripts/cleanup-docker-images.sh` ✅
- `scripts/check-disk-usage.sh` ✅
- `scripts/cleanup-disk.sh` ✅
- `scripts/verify-and-fix.sh` ✅
- `scripts/debug-502.sh` ✅

**삭제해야 할 파일:**
- `backend/Dockerfile` ❌ (GitHub Actions에서만 사용)
- `frontend-main/Dockerfile` ❌
- `frontend-admin/Dockerfile` ❌
- `scripts/deploy.sh` ❌ (DEPRECATED)
- 이전 프로젝트 디렉토리 ❌

**참고:** `cleanup-disk.sh` 스크립트가 자동으로 이러한 파일들을 식별하고 정리합니다.

---

## 🛠️ 유용한 명령어

### Docker 관련

```bash
# 로그 확인
docker-compose -f docker-compose.prod.yml logs -f

# 특정 서비스 로그
docker-compose -f docker-compose.prod.yml logs -f backend
docker-compose -f docker-compose.prod.yml logs -f frontend

# 컨테이너 재시작
docker-compose -f docker-compose.prod.yml restart

# 컨테이너 중지
docker-compose -f docker-compose.prod.yml down

# 컨테이너 상태 확인
docker-compose -f docker-compose.prod.yml ps

# 컨테이너 내부 접속
docker-compose -f docker-compose.prod.yml exec backend bash
```

### 시스템 모니터링

```bash
# CPU/메모리 사용량
htop

# 디스크 사용량
df -h

# Docker 리소스 사용량
docker stats

# Nginx 로그
docker-compose -f docker-compose.prod.yml logs nginx
```

### 빠른 배포 (수동)

```bash
cd ~/jb2-backoffice
bash scripts/deploy.sh
```

---

## 🐛 트러블슈팅

### 문제 1: 컨테이너가 시작되지 않음

```bash
# 로그 확인
docker-compose -f docker-compose.prod.yml logs

# .env 파일 확인
cat .env

# 컨테이너 재빌드
docker-compose -f docker-compose.prod.yml up -d --build --force-recreate
```

### 문제 2: Database 연결 실패

```bash
# RDS 보안 그룹 확인
# EC2 인스턴스의 보안 그룹이 RDS 인바운드 규칙에 포함되어 있는지 확인

# 네트워크 연결 테스트
docker-compose -f docker-compose.prod.yml exec backend python -c "
import psycopg2
conn = psycopg2.connect(
    host='your-rds.amazonaws.com',
    port=5432,
    database='jb2_database',
    user='postgres',
    password='your_password'
)
print('Connected!')
conn.close()
"
```

### 문제 3: GitHub Actions 배포 실패

```bash
# EC2에서 수동 배포 테스트
cd ~/jb2-backoffice
git pull origin main
docker-compose -f docker-compose.prod.yml up -d --build

# GitHub Secrets 확인
# - EC2_SSH_KEY가 올바른지 확인
# - EC2_HOST가 Public IP인지 확인
```

### 문제 4: 포트 충돌

```bash
# 포트 사용 중인 프로세스 확인
sudo lsof -i :80
sudo lsof -i :443
sudo lsof -i :8000

# Nginx 중지 (시스템 nginx)
sudo systemctl stop nginx
sudo systemctl disable nginx
```

### 문제 5: 디스크 공간 부족

```bash
# 수동 정리: Docker 이미지 및 캐시 정리
cd ~/jb_square
bash scripts/cleanup-docker-images.sh

# 더 강력한 정리 (모든 사용하지 않는 리소스 삭제)
docker system prune -af
docker volume prune -f

# 로그 파일 정리
sudo journalctl --vacuum-time=7d
```

**자동 정리 설정 (권장):**

```bash
# Crontab 편집
crontab -e

# 매주 일요일 새벽 3시에 Docker 이미지 정리
0 3 * * 0 /home/ec2-user/jb_square/scripts/cleanup-docker-images.sh >> /home/ec2-user/jb_square/logs/cleanup.log 2>&1
```

**참고:** GitHub Actions 워크플로우에 자동 정리가 이미 포함되어 있습니다.

---

## 📊 모니터링 & 알림

### CloudWatch 설정 (선택사항)

```bash
# CloudWatch 에이전트 설치
wget https://s3.amazonaws.com/amazoncloudwatch-agent/ubuntu/amd64/latest/amazon-cloudwatch-agent.deb
sudo dpkg -i amazon-cloudwatch-agent.deb
```

### Slack 알림 설정

`.github/workflows/deploy.yml`에 Slack 알림 추가:

```yaml
- name: Notify Slack
  if: always()
  uses: 8398a7/action-slack@v3
  with:
    status: ${{ job.status }}
    webhook_url: ${{ secrets.SLACK_WEBHOOK_URL }}
```

---

## 🔄 롤백 가이드

### 이전 버전으로 롤백

```bash
# EC2 접속
cd ~/jb2-backoffice

# 이전 커밋으로 되돌리기
git log --oneline -10  # 커밋 목록 확인
git reset --hard <commit-hash>

# 재배포
bash scripts/deploy.sh
```

---

## 📝 체크리스트

### 배포 전 체크리스트

- [ ] EC2 인스턴스 생성 및 설정
- [ ] 보안 그룹 설정 (22, 80, 443 포트)
- [ ] RDS 보안 그룹에 EC2 추가
- [ ] .env 파일 작성
- [ ] GitHub Secrets 모두 설정
- [ ] SSH 키 권한 확인 (400)
- [ ] 도메인 DNS 설정 (A 레코드)

### 배포 후 체크리스트

- [ ] 헬스 체크 통과 (http://your-ip/health)
- [ ] API 문서 접근 가능 (http://your-ip/docs)
- [ ] 프론트엔드 로딩 확인
- [ ] Database 연결 확인
- [ ] SSL 인증서 설치 (도메인 있는 경우)
- [ ] 자동 갱신 cron 설정
- [ ] 로그 모니터링 설정

---

## 📞 지원

문제가 발생하면:
1. 로그 확인: `docker-compose logs -f`
2. 이슈 생성: GitHub Issues
3. 문의: admin@your company.com

---

**작성일**: 2025-10-28
**버전**: 1.0.0
