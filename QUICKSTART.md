# ⚡ 빠른 시작 가이드 - EC2 자동 배포

이 가이드는 5분 안에 EC2 자동 배포를 설정하는 방법입니다.

---

## 📋 사전 준비 (5분)

### 1. GitHub CLI 설치 및 로그인

```bash
# macOS
brew install gh

# Ubuntu/Debian
curl -fsSL https://cli.github.com/packages/githubcli-archive-keyring.gpg | sudo dd of=/usr/share/keyrings/githubcli-archive-keyring.gpg
echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/githubcli-archive-keyring.gpg] https://cli.github.com/packages stable main" | sudo tee /etc/apt/sources.list.d/github-cli.list > /dev/null
sudo apt update
sudo apt install gh

# 로그인
gh auth login
```

### 2. EC2 인스턴스 생성

- **AMI**: Amazon Linux 2023 (또는 Ubuntu Server 22.04 LTS)
- **인스턴스 타입**: t3.medium (권장)
- **키 페어**: 생성 및 다운로드 (예: `jb2-key.pem`)
- **보안 그룹**:
  - SSH (22) - My IP
  - HTTP (80) - 0.0.0.0/0
  - HTTPS (443) - 0.0.0.0/0

> **참고**: Amazon Linux는 기본 사용자가 `ec2-user`, Ubuntu는 `ubuntu`입니다.

---

## 🚀 자동 배포 설정 (3단계)

### Step 1: GitHub Secrets 자동 설정

```bash
# 프로젝트 디렉토리에서 실행
cd /path/to/backoffice

# .env 파일이 있는지 확인
ls .env

# GitHub Secrets 자동 설정 스크립트 실행
bash scripts/setup-github-secrets.sh
```

**스크립트가 물어보는 것:**
1. EC2 SSH 키 파일 경로 (예: `~/.ssh/jb2-key.pem`)
2. EC2 Public IP (예: `52.79.123.456`)
3. EC2 사용자명 (Amazon Linux: `ec2-user`, Ubuntu: `ubuntu`)

**자동으로 설정되는 Secrets:**
- ✅ EC2_HOST, EC2_USER, EC2_SSH_KEY
- ✅ AWS 자격증명 (Access Key, Secret Key)
- ✅ RDS 접속 정보
- ✅ S3 설정
- ✅ Flask Secret Key

### Step 2: EC2 초기 설정

```bash
# EC2에 SSH 접속 (Amazon Linux: ec2-user, Ubuntu: ubuntu)
ssh -i ~/.ssh/jb2-key.pem ec2-user@<EC2-PUBLIC-IP>

# 프로젝트 클론
git clone https://github.com/your-username/jb_square.git jb2-backoffice
cd jb2-backoffice

# 초기 설정 스크립트 실행 (Docker, Nginx 등 설치)
# 스크립트가 자동으로 OS를 감지합니다 (Amazon Linux 2023, Amazon Linux 2, Ubuntu)
sudo bash scripts/setup-ec2.sh

# 재로그인 (docker 그룹 적용)
exit
ssh -i ~/.ssh/jb2-key.pem ec2-user@<EC2-PUBLIC-IP>
```

### Step 3: .env 파일 생성 (EC2에서)

```bash
cd ~/jb2-backoffice

# .env 템플릿 복사
cp .env.example .env

# .env 파일 편집 (로컬 .env 내용을 복사하거나 직접 입력)
nano .env
```

**또는 로컬에서 파일 전송:**
```bash
# 로컬에서 실행 (사용자명은 ec2-user 또는 ubuntu)
scp -i ~/.ssh/jb2-key.pem .env ec2-user@<EC2-IP>:~/jb2-backoffice/.env
```

---

## 🎯 배포 실행

### 방법 1: 자동 배포 (GitHub Actions)

```bash
# 코드 변경 후 main 브랜치에 push
git add .
git commit -m "Update something"
git push origin main

# GitHub Actions가 자동으로 배포 시작!
```

**진행 상황 확인:**
- GitHub → Actions 탭
- 또는: `gh run watch`

### 방법 2: 수동 배포 (EC2에서)

```bash
# EC2 접속
ssh -i ~/.ssh/jb2-key.pem ec2-user@<EC2-IP>
cd ~/jb2-backoffice

# 배포 스크립트 실행
bash scripts/deploy.sh
```

---

## ✅ 배포 확인

### 1. 헬스 체크

```bash
# 백엔드 API
curl http://<EC2-PUBLIC-IP>/health

# 예상 응답
{"status":"healthy"}
```

### 2. 웹 브라우저 접속

- **프론트엔드**: `http://<EC2-PUBLIC-IP>`
- **API 문서**: `http://<EC2-PUBLIC-IP>/docs`
- **ReDoc**: `http://<EC2-PUBLIC-IP>/redoc`

### 3. 로그 확인

```bash
# EC2에서
cd ~/jb2-backoffice
docker-compose -f docker-compose.prod.yml logs -f

# 특정 서비스 로그
docker-compose -f docker-compose.prod.yml logs -f backend
docker-compose -f docker-compose.prod.yml logs -f frontend
```

---

## 🔒 SSL/TLS 설정 (선택사항)

도메인이 있는 경우:

```bash
# EC2에서
sudo certbot certonly --standalone -d your-domain.com

# 인증서 복사
sudo cp /etc/letsencrypt/live/your-domain.com/fullchain.pem ~/jb2-backoffice/nginx/ssl/
sudo cp /etc/letsencrypt/live/your-domain.com/privkey.pem ~/jb2-backoffice/nginx/ssl/
sudo chown ubuntu:ubuntu ~/jb2-backoffice/nginx/ssl/*

# Nginx 설정 수정 (HTTPS 블록 주석 해제)
nano ~/jb2-backoffice/nginx/conf.d/default.conf

# 컨테이너 재시작
cd ~/jb2-backoffice
docker-compose -f docker-compose.prod.yml restart nginx
```

---

## 🛠️ 자주 사용하는 명령어

### 컨테이너 관리

```bash
# 상태 확인
docker-compose -f docker-compose.prod.yml ps

# 재시작
docker-compose -f docker-compose.prod.yml restart

# 중지
docker-compose -f docker-compose.prod.yml down

# 시작
docker-compose -f docker-compose.prod.yml up -d
```

### 로그 & 모니터링

```bash
# 실시간 로그
docker-compose -f docker-compose.prod.yml logs -f

# 리소스 사용량
docker stats

# 디스크 사용량
df -h

# 시스템 모니터링
htop
```

### GitHub Secrets 관리

```bash
# Secrets 목록 확인
gh secret list

# 특정 Secret 설정
gh secret set SECRET_NAME

# Secret 삭제
gh secret delete SECRET_NAME
```

---

## 🐛 문제 해결

### 배포가 실패하는 경우

1. **GitHub Actions 로그 확인**
   ```bash
   gh run list
   gh run view <run-id>
   ```

2. **EC2에서 수동 배포 시도**
   ```bash
   ssh -i ~/.ssh/jb2-key.pem ec2-user@<EC2-IP>
   cd ~/jb2-backoffice
   bash scripts/deploy.sh
   ```

3. **컨테이너 로그 확인**
   ```bash
   docker-compose -f docker-compose.prod.yml logs
   ```

### 컨테이너가 시작되지 않는 경우

```bash
# 이미지 재빌드
cd ~/jb2-backoffice
docker-compose -f docker-compose.prod.yml build --no-cache

# 강제 재생성
docker-compose -f docker-compose.prod.yml up -d --force-recreate
```

### Database 연결 실패

```bash
# RDS 보안 그룹 확인
# EC2의 보안 그룹이 RDS 인바운드 규칙에 추가되어 있는지 확인

# .env 파일 확인
cat ~/jb2-backoffice/.env | grep DB
```

---

## 📚 추가 문서

- **전체 배포 가이드**: [DEPLOYMENT.md](./DEPLOYMENT.md)
- **백오피스 매뉴얼**: [README_BACKOFFICE.md](./README_BACKOFFICE.md)
- **API 설정**: [API_SETUP.md](./API_SETUP.md)

---

## 🎉 완료!

이제 코드를 push할 때마다 자동으로 EC2에 배포됩니다!

```bash
# 예시
git add .
git commit -m "Add new feature"
git push origin main

# 자동 배포 시작! 🚀
```

**배포 시간**: 약 3-5분
**다운타임**: 0초 (무중단 배포)
