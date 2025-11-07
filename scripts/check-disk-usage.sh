#!/bin/bash

# ========================================
# EC2 Disk Usage Check Script
# ========================================
# This script checks disk usage and identifies unnecessary files
# Run this script to generate a detailed report before cleanup
#
# Usage: bash check-disk-usage.sh

set -e

echo "========================================"
echo "🔍 EC2 Disk Usage Check Report"
echo "========================================"
echo "Generated at: $(date)"
echo ""

# ========================================
# 1. Overall Disk Usage
# ========================================
echo "📊 Overall Disk Usage:"
echo "----------------------------------------"
df -h | grep -E "Filesystem|/$|/home"
echo ""

# ========================================
# 2. Directory Sizes in Home
# ========================================
echo "📁 Directory Sizes in /home/ec2-user/:"
echo "----------------------------------------"
du -sh /home/ec2-user/* 2>/dev/null | sort -hr
echo ""

# ========================================
# 3. Docker Disk Usage
# ========================================
echo "🐳 Docker System Disk Usage:"
echo "----------------------------------------"
docker system df
echo ""

echo "📦 Docker Images:"
echo "----------------------------------------"
echo "Total images: $(docker images -q | wc -l)"
echo ""
docker images --format "table {{.Repository}}\t{{.Tag}}\t{{.Size}}\t{{.CreatedAt}}" | head -20
echo ""

echo "🔍 ECR Images Detail:"
echo "----------------------------------------"
docker images --filter "reference=711678334703.dkr.ecr.ap-northeast-2.amazonaws.com/jb-square" \
  --format "table {{.Repository}}\t{{.Tag}}\t{{.Size}}\t{{.CreatedAt}}"
echo ""

# Find images not used by running containers
echo "⚠️  Unused Images (candidates for removal):"
echo "----------------------------------------"
RUNNING_IMAGES=$(docker ps --format "{{.Image}}" | sort -u)
UNUSED_COUNT=0
docker images --filter "reference=711678334703.dkr.ecr.ap-northeast-2.amazonaws.com/jb-square" \
  --format "{{.Repository}}:{{.Tag}} {{.ID}} {{.Size}}" | while read img id size; do
  if ! echo "$RUNNING_IMAGES" | grep -q "$id"; then
    if [[ ! "$img" =~ -latest$ ]]; then
      echo "  - $img ($size)"
      UNUSED_COUNT=$((UNUSED_COUNT + 1))
    fi
  fi
done
echo ""

echo "🗑️  Dangling Images (untagged):"
echo "----------------------------------------"
DANGLING=$(docker images -f "dangling=true" -q | wc -l)
echo "Count: $DANGLING"
if [ "$DANGLING" -gt 0 ]; then
  docker images -f "dangling=true" --format "table {{.ID}}\t{{.Size}}\t{{.CreatedAt}}"
fi
echo ""

# ========================================
# 4. Docker Containers
# ========================================
echo "📦 Docker Containers:"
echo "----------------------------------------"
echo "Running containers:"
docker ps --format "table {{.Names}}\t{{.Image}}\t{{.Status}}\t{{.Size}}"
echo ""

STOPPED=$(docker ps -a -f "status=exited" -q | wc -l)
echo "Stopped containers: $STOPPED"
if [ "$STOPPED" -gt 0 ]; then
  docker ps -a -f "status=exited" --format "table {{.Names}}\t{{.Image}}\t{{.Status}}"
fi
echo ""

# ========================================
# 5. Docker Volumes and Networks
# ========================================
echo "💾 Docker Volumes:"
echo "----------------------------------------"
docker volume ls
echo ""

echo "🌐 Docker Networks:"
echo "----------------------------------------"
docker network ls
echo ""

# ========================================
# 6. Log Files
# ========================================
echo "📝 Log Files:"
echo "----------------------------------------"

# System logs
if [ -d /var/log ]; then
  echo "/var/log directory:"
  sudo du -sh /var/log 2>/dev/null || echo "  (permission denied)"
fi

# Journalctl logs
echo "journalctl logs:"
journalctl --disk-usage 2>/dev/null || echo "  (not available)"

# Docker container logs
echo ""
echo "Docker container logs:"
for container in $(docker ps --format "{{.Names}}"); do
  LOG_FILE="/var/lib/docker/containers/$(docker inspect --format='{{.Id}}' $container)/$container-json.log"
  if [ -f "$LOG_FILE" ]; then
    SIZE=$(sudo du -sh "$LOG_FILE" 2>/dev/null | cut -f1)
    echo "  - $container: $SIZE"
  fi
done
echo ""

# ========================================
# 7. Previous Projects Residuals
# ========================================
echo "🗂️  Previous Projects Check:"
echo "----------------------------------------"
for dir in jb2-backoffice jb2_rev2 jb2_wireframe viatable_v2 _deprecated jbio-hub backups; do
  if [ -d "/home/ec2-user/$dir" ]; then
    SIZE=$(du -sh "/home/ec2-user/$dir" 2>/dev/null | cut -f1)
    echo "  ⚠️  Found: /home/ec2-user/$dir ($SIZE)"
  fi
done
echo ""

# ========================================
# 8. Unnecessary Dockerfiles on EC2
# ========================================
echo "📄 Unnecessary Dockerfiles (should not be on EC2):"
echo "----------------------------------------"
for dockerfile in backend/Dockerfile frontend-main/Dockerfile frontend-admin/Dockerfile; do
  if [ -f "/home/ec2-user/jb_square/$dockerfile" ]; then
    SIZE=$(du -sh "/home/ec2-user/jb_square/$dockerfile" 2>/dev/null | cut -f1)
    echo "  ⚠️  Found: $dockerfile ($SIZE) - Not needed for ECR deployment"
  fi
done
echo ""

# ========================================
# 9. Cache Directories
# ========================================
echo "💾 Cache Directories:"
echo "----------------------------------------"

# APT cache
if [ -d /var/cache/apt/archives ]; then
  APT_SIZE=$(sudo du -sh /var/cache/apt/archives 2>/dev/null | cut -f1)
  echo "APT cache: $APT_SIZE"
fi

# Pip cache
if [ -d ~/.cache/pip ]; then
  PIP_SIZE=$(du -sh ~/.cache/pip 2>/dev/null | cut -f1)
  echo "Pip cache: $PIP_SIZE"
fi

# NPM cache
if [ -d ~/.npm ]; then
  NPM_SIZE=$(du -sh ~/.npm 2>/dev/null | cut -f1)
  echo "NPM cache: $NPM_SIZE"
fi

# Docker build cache
DOCKER_CACHE=$(docker system df | grep "Build Cache" | awk '{print $4}')
echo "Docker build cache: $DOCKER_CACHE"
echo ""

# ========================================
# 10. Deprecated Scripts
# ========================================
echo "📜 Deprecated Scripts (not needed for ECR deployment):"
echo "----------------------------------------"
for script in deploy.sh test-build.sh setup-ec2.sh setup-ssl.sh setup-github-secrets.sh enable-https.sh; do
  if [ -f "/home/ec2-user/jb_square/scripts/$script" ]; then
    SIZE=$(du -sh "/home/ec2-user/jb_square/scripts/$script" 2>/dev/null | cut -f1)
    echo "  - scripts/$script ($SIZE)"
  fi
done
echo ""

# ========================================
# 11. Summary and Recommendations
# ========================================
echo "========================================"
echo "📋 Summary and Recommendations"
echo "========================================"
echo ""

echo "✅ Keep these files/directories:"
echo "  - docker-compose.prod.yml"
echo "  - .env"
echo "  - nginx/nginx.conf"
echo "  - nginx/conf.d/"
echo "  - nginx/ssl/ (if using SSL)"
echo "  - scripts/cleanup-docker-images.sh"
echo "  - scripts/check-disk-usage.sh"
echo "  - scripts/cleanup-disk.sh"
echo "  - scripts/verify-and-fix.sh"
echo "  - scripts/debug-502.sh"
echo ""

echo "🗑️  Safe to remove:"
echo "  - Docker dangling images ($DANGLING images)"
echo "  - Stopped containers ($STOPPED containers)"
echo "  - Unused ECR images (except *-latest)"
echo "  - backend/Dockerfile, frontend-*/Dockerfile"
echo "  - Deprecated scripts (deploy.sh, setup-*.sh)"
echo "  - Old backup files (30+ days)"
echo "  - APT/Pip/NPM cache"
echo "  - Docker build cache"
echo ""

echo "⚠️  Manual review needed:"
echo "  - Previous project directories (if exist)"
echo "  - Old log files"
echo "  - Backup directory contents"
echo ""

echo "🔧 Next steps:"
echo "  1. Review this report"
echo "  2. Run: bash scripts/cleanup-disk.sh --dry-run"
echo "  3. Run: bash scripts/cleanup-disk.sh --auto (when ready)"
echo ""

echo "========================================"
echo "✅ Report Complete"
echo "========================================"
