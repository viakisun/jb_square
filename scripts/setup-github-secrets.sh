#!/bin/bash

# ========================================
# GitHub Secrets 자동 설정 스크립트
# ========================================
# GitHub CLI (gh)를 사용하여 .env 파일의 값을 자동으로 GitHub Secrets에 추가합니다.
#
# 사전 준비:
# 1. GitHub CLI 설치: brew install gh (macOS) 또는 https://cli.github.com/
# 2. GitHub 로그인: gh auth login
# 3. .env 파일 준비
#
# 사용법:
#   bash scripts/setup-github-secrets.sh

set -e

echo "🔐 GitHub Secrets 자동 설정 시작..."

# ========================================
# 1. GitHub CLI 확인
# ========================================
if ! command -v gh &> /dev/null; then
    echo "❌ GitHub CLI (gh)가 설치되지 않았습니다."
    echo ""
    echo "설치 방법:"
    echo "  macOS:   brew install gh"
    echo "  Linux:   https://github.com/cli/cli/blob/trunk/docs/install_linux.md"
    echo "  Windows: https://github.com/cli/cli/releases"
    echo ""
    exit 1
fi

# GitHub 로그인 상태 확인
if ! gh auth status &> /dev/null; then
    echo "❌ GitHub에 로그인되지 않았습니다."
    echo "다음 명령어로 로그인하세요: gh auth login"
    exit 1
fi

echo "✅ GitHub CLI 인증 완료"

# ========================================
# 2. .env 파일 확인
# ========================================
if [ ! -f ".env" ]; then
    echo "❌ .env 파일을 찾을 수 없습니다."
    echo "프로젝트 루트 디렉토리에서 실행하거나 .env 파일을 생성하세요."
    exit 1
fi

echo "✅ .env 파일 발견"

# ========================================
# 3. EC2 SSH 키 파일 경로 입력
# ========================================
echo ""
echo "📝 EC2 SSH 키 파일 경로를 입력하세요 (예: ~/.ssh/my-key.pem):"
read -r SSH_KEY_PATH

if [ ! -f "$SSH_KEY_PATH" ]; then
    echo "❌ SSH 키 파일을 찾을 수 없습니다: $SSH_KEY_PATH"
    exit 1
fi

echo "✅ SSH 키 파일 확인"

# ========================================
# 4. EC2 정보 입력
# ========================================
echo ""
echo "📝 EC2 Public IP를 입력하세요:"
read -r EC2_HOST

echo "📝 EC2 사용자명을 입력하세요 (기본값: ubuntu):"
read -r EC2_USER
EC2_USER=${EC2_USER:-ubuntu}

echo ""
echo "입력된 정보:"
echo "  - EC2 Host: $EC2_HOST"
echo "  - EC2 User: $EC2_USER"
echo "  - SSH Key: $SSH_KEY_PATH"
echo ""
echo "계속하시겠습니까? (y/N)"
read -r CONFIRM

if [[ ! "$CONFIRM" =~ ^[Yy]$ ]]; then
    echo "취소되었습니다."
    exit 0
fi

# ========================================
# 5. GitHub Repository 확인
# ========================================
echo ""
echo "🔍 GitHub Repository 확인 중..."

REPO=$(gh repo view --json nameWithOwner -q .nameWithOwner)

if [ -z "$REPO" ]; then
    echo "❌ GitHub Repository를 찾을 수 없습니다."
    echo "Git 저장소가 올바르게 설정되어 있는지 확인하세요."
    exit 1
fi

echo "✅ Repository: $REPO"

# ========================================
# 6. Secrets 설정 함수
# ========================================
set_secret() {
    local name=$1
    local value=$2

    if [ -z "$value" ]; then
        echo "  ⚠️  $name: 값이 비어있어 건너뜁니다."
        return
    fi

    echo "  🔐 $name 설정 중..."
    echo "$value" | gh secret set "$name" --repo="$REPO"

    if [ $? -eq 0 ]; then
        echo "  ✅ $name 설정 완료"
    else
        echo "  ❌ $name 설정 실패"
    fi
}

# ========================================
# 7. .env 파일 읽기 및 Secrets 설정
# ========================================
echo ""
echo "📤 GitHub Secrets 설정 중..."
echo ""

# .env 파일 읽기
source .env

# EC2 관련
set_secret "EC2_HOST" "$EC2_HOST"
set_secret "EC2_USER" "$EC2_USER"
set_secret "EC2_SSH_KEY" "$(cat $SSH_KEY_PATH)"

# AWS 관련
set_secret "AWS_REGION" "$AWS_REGION"
set_secret "AWS_ACCESS_KEY_ID" "$AWS_ACCESS_KEY_ID"
set_secret "AWS_SECRET_ACCESS_KEY" "$AWS_SECRET_ACCESS_KEY"
set_secret "AWS_S3_BUCKET_NAME" "$AWS_S3_BUCKET_NAME"
set_secret "AWS_S3_REGION" "$AWS_S3_REGION"

# Database 관련
set_secret "AWS_DB_HOST" "$AWS_DB_HOST"
set_secret "AWS_DB_PORT" "$AWS_DB_PORT"
set_secret "AWS_DB_NAME" "$AWS_DB_NAME"
set_secret "AWS_DB_USER" "$AWS_DB_USER"
set_secret "AWS_DB_PASSWORD" "$AWS_DB_PASSWORD"

# Flask 관련
set_secret "FLASK_SECRET_KEY" "${FLASK_SECRET_KEY:-$(openssl rand -base64 32)}"

# API Keys (선택사항)
if [ -n "$NTIS_API_KEY" ]; then
    set_secret "NTIS_API_KEY" "$NTIS_API_KEY"
fi

if [ -n "$JBTP_API_KEY" ]; then
    set_secret "JBTP_API_KEY" "$JBTP_API_KEY"
fi

if [ -n "$BIZINFO_API_KEY" ]; then
    set_secret "BIZINFO_API_KEY" "$BIZINFO_API_KEY"
fi

# ========================================
# 8. 완료
# ========================================
echo ""
echo "=========================================="
echo "✅ GitHub Secrets 설정 완료!"
echo "=========================================="
echo ""
echo "설정된 Secrets 목록을 확인하려면:"
echo "  gh secret list --repo=$REPO"
echo ""
echo "또는 GitHub 웹에서 확인:"
echo "  https://github.com/$REPO/settings/secrets/actions"
echo ""
echo "이제 GitHub Actions를 통해 자동 배포할 수 있습니다!"
echo "  git push origin main"
echo ""
echo "=========================================="
