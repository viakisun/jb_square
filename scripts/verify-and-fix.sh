#!/bin/bash

# ========================================
# EC2 완벽 검증 및 자동 수정 스크립트
# ========================================
# 모든 문제를 진단하고 가능한 것은 자동으로 수정합니다.
# Run as: bash ~/jb_square/scripts/verify-and-fix.sh

set +e  # Continue on error

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Counters
ISSUES_FOUND=0
ISSUES_FIXED=0
MANUAL_ACTIONS=()

echo "=========================================="
echo "🔍 JB2 완벽 검증 스크립트"
echo "=========================================="
echo ""
date
echo ""

# Detect user and path
if [[ -d "/home/ec2-user/jb_square" ]]; then
    APP_USER="ec2-user"
    APP_DIR="/home/ec2-user/jb_square"
elif [[ -d "/home/ubuntu/jb_square" ]]; then
    APP_USER="ubuntu"
    APP_DIR="/home/ubuntu/jb_square"
else
    echo -e "${RED}❌ Cannot find jb_square directory${NC}"
    exit 1
fi

echo -e "${BLUE}📂 App directory: $APP_DIR${NC}"
echo -e "${BLUE}👤 User: $APP_USER${NC}"
echo ""

# ========================================
# 1. EC2 Public IP 확인
# ========================================
echo "=========================================="
echo "1️⃣ EC2 Public IP 확인"
echo "=========================================="

PUBLIC_IP=$(curl -s http://169.254.169.254/latest/meta-data/public-ipv4 2>/dev/null || echo "Unknown")
echo -e "${BLUE}📍 EC2 Public IP: $PUBLIC_IP${NC}"

if [[ "$PUBLIC_IP" != "43.203.98.253" ]]; then
    echo -e "${YELLOW}⚠️  IP가 다릅니다. DNS 레코드를 $PUBLIC_IP로 업데이트하세요.${NC}"
    MANUAL_ACTIONS+=("DNS: A 레코드를 $PUBLIC_IP로 변경")
    ((ISSUES_FOUND++))
else
    echo -e "${GREEN}✅ IP가 DNS와 일치합니다${NC}"
fi
echo ""

# ========================================
# 2. 포트 충돌 확인 (Python 프로세스)
# ========================================
echo "=========================================="
echo "2️⃣ 포트 충돌 확인"
echo "=========================================="

PYTHON_PIDS=$(sudo lsof -t -i:8000 -s TCP:LISTEN 2>/dev/null | grep -v docker)
if [[ -n "$PYTHON_PIDS" ]]; then
    echo -e "${RED}❌ 포트 8000을 사용 중인 프로세스 발견: $PYTHON_PIDS${NC}"
    ((ISSUES_FOUND++))

    echo "🔧 자동 수정: 프로세스 종료 중..."
    sudo kill -9 $PYTHON_PIDS 2>/dev/null
    sleep 2

    if sudo lsof -t -i:8000 2>/dev/null | grep -q .; then
        echo -e "${RED}❌ 프로세스 종료 실패${NC}"
    else
        echo -e "${GREEN}✅ 포트 충돌 해결됨${NC}"
        ((ISSUES_FIXED++))
    fi
else
    echo -e "${GREEN}✅ 포트 충돌 없음${NC}"
fi
echo ""

# ========================================
# 3. Docker 상태 확인
# ========================================
echo "=========================================="
echo "3️⃣ Docker 컨테이너 상태"
echo "=========================================="

cd "$APP_DIR" || exit 1

# Check if containers exist
CONTAINERS=$(docker-compose -f docker-compose.prod.yml ps -q 2>/dev/null | wc -l)
RUNNING=$(docker-compose -f docker-compose.prod.yml ps --filter "status=running" -q 2>/dev/null | wc -l)

echo "컨테이너 수: $CONTAINERS"
echo "실행 중: $RUNNING"

if [[ $RUNNING -lt 3 ]]; then
    echo -e "${RED}❌ 일부 컨테이너가 실행되지 않음${NC}"
    ((ISSUES_FOUND++))

    echo ""
    echo "📊 컨테이너 상태:"
    docker-compose -f docker-compose.prod.yml ps

    echo ""
    echo "🔧 자동 수정: 컨테이너 재시작 중..."

    # Stop all
    docker-compose -f docker-compose.prod.yml down 2>&1 | grep -v "^WARN"

    # Start
    docker-compose -f docker-compose.prod.yml up -d 2>&1 | grep -v "^WARN"

    sleep 10

    RUNNING_AFTER=$(docker-compose -f docker-compose.prod.yml ps --filter "status=running" -q 2>/dev/null | wc -l)
    if [[ $RUNNING_AFTER -ge 3 ]]; then
        echo -e "${GREEN}✅ 컨테이너 재시작 성공${NC}"
        ((ISSUES_FIXED++))
    else
        echo -e "${RED}❌ 컨테이너 시작 실패${NC}"
        echo "로그 확인:"
        docker-compose -f docker-compose.prod.yml logs --tail=20
    fi
else
    echo -e "${GREEN}✅ 모든 컨테이너 실행 중${NC}"
fi

echo ""
echo "📊 최종 컨테이너 상태:"
docker-compose -f docker-compose.prod.yml ps
echo ""

# ========================================
# 4. 포트 Listen 상태 확인
# ========================================
echo "=========================================="
echo "4️⃣ 네트워크 포트 상태"
echo "=========================================="

check_port() {
    local port=$1
    if sudo netstat -tlnp | grep -q ":$port "; then
        echo -e "${GREEN}✅ 포트 $port: LISTEN${NC}"
        sudo netstat -tlnp | grep ":$port "
    else
        echo -e "${RED}❌ 포트 $port: NOT LISTENING${NC}"
        ((ISSUES_FOUND++))
        return 1
    fi
}

check_port 80
check_port 443 || true  # HTTPS may not be configured yet
check_port 8000 || true
echo ""

# ========================================
# 5. 로컬 HTTP 테스트
# ========================================
echo "=========================================="
echo "5️⃣ 로컬 접속 테스트"
echo "=========================================="

echo "🌐 HTTP (포트 80) 테스트..."
HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost 2>/dev/null || echo "000")
if [[ "$HTTP_STATUS" == "200" ]] || [[ "$HTTP_STATUS" == "301" ]] || [[ "$HTTP_STATUS" == "302" ]]; then
    echo -e "${GREEN}✅ HTTP 응답: $HTTP_STATUS${NC}"
else
    echo -e "${RED}❌ HTTP 응답 없음 (코드: $HTTP_STATUS)${NC}"
    ((ISSUES_FOUND++))
fi

echo ""
echo "🏥 Backend Health Check..."
HEALTH=$(curl -s http://localhost:8000/health 2>/dev/null || echo "{}")
if echo "$HEALTH" | grep -q "healthy"; then
    echo -e "${GREEN}✅ Backend healthy${NC}"
else
    echo -e "${RED}❌ Backend unhealthy: $HEALTH${NC}"
    ((ISSUES_FOUND++))
fi
echo ""

# ========================================
# 6. 로그 오류 확인
# ========================================
echo "=========================================="
echo "6️⃣ 최근 로그 오류 확인"
echo "=========================================="

echo "Backend 로그 (마지막 10줄):"
docker-compose -f docker-compose.prod.yml logs --tail=10 backend 2>&1 | tail -10

echo ""
echo "Nginx 로그 (마지막 10줄):"
docker-compose -f docker-compose.prod.yml logs --tail=10 nginx 2>&1 | tail -10
echo ""

# ========================================
# 7. .env 파일 확인
# ========================================
echo "=========================================="
echo "7️⃣ 환경 변수 파일 확인"
echo "=========================================="

if [[ -f "$APP_DIR/.env" ]]; then
    echo -e "${GREEN}✅ .env 파일 존재${NC}"
    echo "   파일 크기: $(wc -l < $APP_DIR/.env) lines"
else
    echo -e "${RED}❌ .env 파일 없음${NC}"
    ((ISSUES_FOUND++))
    MANUAL_ACTIONS+=(".env 파일 생성 필요")
fi
echo ""

# ========================================
# 8. Nginx 설정 확인
# ========================================
echo "=========================================="
echo "8️⃣ Nginx 설정 검증"
echo "=========================================="

NGINX_TEST=$(docker-compose -f docker-compose.prod.yml exec -T nginx nginx -t 2>&1 || echo "failed")
if echo "$NGINX_TEST" | grep -q "successful"; then
    echo -e "${GREEN}✅ Nginx 설정 유효${NC}"
else
    echo -e "${RED}❌ Nginx 설정 오류${NC}"
    echo "$NGINX_TEST"
    ((ISSUES_FOUND++))
fi
echo ""

# ========================================
# 9. 디스크 & 메모리 확인
# ========================================
echo "=========================================="
echo "9️⃣ 시스템 리소스"
echo "=========================================="

echo "💾 디스크 사용량:"
df -h / | tail -1
DISK_USAGE=$(df / | tail -1 | awk '{print $5}' | sed 's/%//')
if [[ $DISK_USAGE -gt 90 ]]; then
    echo -e "${RED}❌ 디스크 사용량 높음: ${DISK_USAGE}%${NC}"
    ((ISSUES_FOUND++))
    MANUAL_ACTIONS+=("디스크 정리 필요 (docker system prune)")
else
    echo -e "${GREEN}✅ 디스크 여유 공간 충분${NC}"
fi

echo ""
echo "🧠 메모리 사용량:"
free -h | grep Mem
echo ""

# ========================================
# 10. 외부 접속 가능 여부
# ========================================
echo "=========================================="
echo "🔟 외부 접속 테스트"
echo "=========================================="

echo "🌍 Public IP로 접속 테스트..."
EXTERNAL=$(curl -s -o /dev/null -w "%{http_code}" http://$PUBLIC_IP 2>/dev/null || echo "000")
if [[ "$EXTERNAL" == "200" ]] || [[ "$EXTERNAL" == "301" ]]; then
    echo -e "${GREEN}✅ 외부 접속 가능: HTTP $EXTERNAL${NC}"
else
    echo -e "${RED}❌ 외부 접속 불가 (코드: $EXTERNAL)${NC}"
    ((ISSUES_FOUND++))
    MANUAL_ACTIONS+=("AWS Security Group에서 포트 80, 443 열기")
fi
echo ""

# ========================================
# 최종 요약
# ========================================
echo "=========================================="
echo "📊 최종 요약"
echo "=========================================="
echo ""

echo -e "${BLUE}발견된 문제: $ISSUES_FOUND${NC}"
echo -e "${GREEN}자동 수정됨: $ISSUES_FIXED${NC}"
echo ""

if [[ ${#MANUAL_ACTIONS[@]} -gt 0 ]]; then
    echo -e "${YELLOW}수동 조치 필요:${NC}"
    for action in "${MANUAL_ACTIONS[@]}"; do
        echo -e "${YELLOW}  ⚠️  $action${NC}"
    done
    echo ""
fi

# ========================================
# 다음 단계 가이드
# ========================================
echo "=========================================="
echo "📝 다음 단계"
echo "=========================================="
echo ""

if [[ $ISSUES_FOUND -eq 0 ]]; then
    echo -e "${GREEN}🎉 모든 검사 통과!${NC}"
    echo ""
    echo "접속 방법:"
    echo "  http://$PUBLIC_IP"
    echo "  http://jb2.kr (DNS 전파 완료 시)"
    echo ""
else
    echo "문제 해결 가이드:"
    echo ""

    if [[ "$EXTERNAL" != "200" ]] && [[ "$EXTERNAL" != "301" ]]; then
        echo "1. AWS Console → EC2 → Security Groups"
        echo "   Inbound Rules에 다음 추가:"
        echo "   - Type: HTTP, Port: 80, Source: 0.0.0.0/0"
        echo "   - Type: HTTPS, Port: 443, Source: 0.0.0.0/0"
        echo ""
    fi

    if [[ ! -f "$APP_DIR/.env" ]]; then
        echo "2. .env 파일 생성:"
        echo "   cd $APP_DIR"
        echo "   cp .env.example .env"
        echo "   nano .env"
        echo ""
    fi

    echo "3. 컨테이너 수동 재시작:"
    echo "   cd $APP_DIR"
    echo "   docker-compose -f docker-compose.prod.yml down"
    echo "   docker-compose -f docker-compose.prod.yml up -d"
    echo ""

    echo "4. 로그 확인:"
    echo "   docker-compose -f docker-compose.prod.yml logs -f"
    echo ""
fi

echo "=========================================="
echo "검증 완료: $(date)"
echo "=========================================="
