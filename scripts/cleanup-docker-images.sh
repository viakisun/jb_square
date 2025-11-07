#!/bin/bash

# ========================================
# Docker Image Cleanup Script for EC2
# ========================================
# This script removes unused Docker images to free up disk space
# Run this manually or set up as a cron job

set -e

echo "🧹 Starting Docker cleanup..."

# 1. Remove dangling images (untagged intermediate layers)
echo "Removing dangling images..."
docker image prune -f

# 2. Remove unused ECR images (keep only currently running containers)
echo "Removing unused ECR images..."
docker images --filter "reference=711678334703.dkr.ecr.ap-northeast-2.amazonaws.com/jb-square" \
  --format "{{.Repository}}:{{.Tag}} {{.ID}}" | while read img id; do
  # Check if image is currently in use by a running container
  if ! docker ps --format "{{.Image}}" | grep -q "$id"; then
    # Don't remove *-latest tags (they're used in docker-compose.prod.yml)
    if [[ ! "$img" =~ -latest$ ]]; then
      echo "Removing unused image: $img"
      docker rmi "$img" 2>/dev/null || true
    fi
  fi
done

# 3. Remove unused networks
echo "Removing unused networks..."
docker network prune -f

# 4. Show current disk usage
echo ""
echo "=========================================="
echo "Current Docker disk usage:"
echo "=========================================="
docker system df

echo ""
echo "=========================================="
echo "Current images:"
echo "=========================================="
docker images --filter "reference=711678334703.dkr.ecr.ap-northeast-2.amazonaws.com/jb-square"

echo ""
echo "✅ Cleanup complete!"
