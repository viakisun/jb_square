#!/bin/bash

# ========================================
# JB SQUARE Deployment Script - DEPRECATED
# ========================================
# ⚠️  WARNING: This script is DEPRECATED!
# ⚠️  Use GitHub Actions for deployment instead.
#
# This script builds Docker images locally on EC2, which can cause
# memory issues on t3.small instances. The current deployment method
# uses ECR (Elastic Container Registry) where images are built by
# GitHub Actions and pulled to EC2.
#
# Deployment method: Push to main branch → GitHub Actions → ECR → EC2
# ========================================

echo "⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️"
echo "⚠️                    WARNING                      ⚠️"
echo "⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️"
echo ""
echo "This deployment script is DEPRECATED and should NOT be used!"
echo ""
echo "Current deployment method:"
echo "  1. Push code to main branch"
echo "  2. GitHub Actions builds images"
echo "  3. Images pushed to ECR"
echo "  4. EC2 pulls images from ECR"
echo ""
echo "Why this script is deprecated:"
echo "  - Building images on EC2 causes OOM (Out of Memory) issues"
echo "  - t3.small instances have insufficient memory for builds"
echo "  - GitHub Actions has better resources for building"
echo ""
echo "⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️"
echo ""

read -p "Do you really want to continue? This may crash your EC2 instance! (yes/NO): " -r
if [[ ! $REPLY =~ ^yes$ ]]; then
    echo "Deployment cancelled."
    exit 1
fi

echo ""
echo "Proceeding with deprecated local deployment..."
echo ""

set -e

APP_DIR="/home/ec2-user/jb_square"
COMPOSE_FILE="docker-compose.prod.yml"
BACKUP_DIR="/home/ec2-user/backups"

echo "🚀 Starting deployment..."

# ========================================
# 1. Check if .env exists
# ========================================
if [ ! -f "$APP_DIR/.env" ]; then
    echo "❌ Error: .env file not found"
    echo "Please create .env file in $APP_DIR"
    echo "You can use .env.example as a template"
    exit 1
fi

# ========================================
# 2. Backup current state
# ========================================
echo "💾 Creating backup..."
mkdir -p $BACKUP_DIR
BACKUP_NAME="backup-$(date +%Y%m%d-%H%M%S)"
cd $APP_DIR

if docker-compose -f $COMPOSE_FILE ps -q > /dev/null 2>&1; then
    docker-compose -f $COMPOSE_FILE logs --tail=100 > "$BACKUP_DIR/$BACKUP_NAME.log"
    echo "✅ Logs backed up to $BACKUP_DIR/$BACKUP_NAME.log"
fi

# ========================================
# 3. Pull latest code (if git repo)
# ========================================
if [ -d "$APP_DIR/.git" ]; then
    echo "📥 Pulling latest code from Git..."
    git pull origin main
else
    echo "⚠️  Not a git repository. Skipping git pull."
fi

# ========================================
# 4. Build Docker images
# ========================================
echo "🔨 Building Docker images..."
docker-compose -f $COMPOSE_FILE build --no-cache

# ========================================
# 5. Stop old containers
# ========================================
echo "🛑 Stopping old containers..."
docker-compose -f $COMPOSE_FILE down

# ========================================
# 6. Start new containers
# ========================================
echo "🚀 Starting new containers..."
docker-compose -f $COMPOSE_FILE up -d

# ========================================
# 7. Wait for services to be healthy
# ========================================
echo "⏳ Waiting for services to start..."
sleep 10

# ========================================
# 8. Health check
# ========================================
echo "🏥 Running health checks..."

# Check if containers are running
if ! docker-compose -f $COMPOSE_FILE ps | grep -q "Up"; then
    echo "❌ Error: Containers are not running"
    echo "Rolling back..."
    docker-compose -f $COMPOSE_FILE down
    echo "Check logs with: docker-compose -f $COMPOSE_FILE logs"
    exit 1
fi

# Check backend health endpoint (via nginx)
if ! curl -f http://localhost/health > /dev/null 2>&1; then
    echo "⚠️  Warning: Backend health check failed"
    echo "Check backend logs with: docker-compose -f $COMPOSE_FILE logs backend"
else
    echo "✅ Backend is healthy"
fi

# Check main frontend (Next.js)
if ! curl -f http://localhost/ > /dev/null 2>&1; then
    echo "⚠️  Warning: Main frontend health check failed"
    echo "Check logs with: docker-compose -f $COMPOSE_FILE logs frontend-main"
else
    echo "✅ Main frontend is healthy"
fi

# Check admin frontend (SvelteKit)
if ! curl -f http://localhost/admin > /dev/null 2>&1; then
    echo "⚠️  Warning: Admin frontend health check failed"
    echo "Check logs with: docker-compose -f $COMPOSE_FILE logs frontend-admin"
else
    echo "✅ Admin frontend is healthy"
fi

# ========================================
# 9. Cleanup
# ========================================
echo "🧹 Cleaning up..."
docker image prune -af --filter "until=24h"
docker volume prune -f

# Keep only last 7 backups
cd $BACKUP_DIR
ls -t | tail -n +8 | xargs -r rm --

# ========================================
# 10. Display status
# ========================================
echo ""
echo "=========================================="
echo "✅ Deployment Complete!"
echo "=========================================="
echo ""
docker-compose -f $APP_DIR/$COMPOSE_FILE ps
echo ""
echo "Access your application at:"
echo "  - Main Site: http://$(curl -s ifconfig.me)"
echo "  - Admin Panel: http://$(curl -s ifconfig.me)/admin"
echo "  - Backend API: http://$(curl -s ifconfig.me)/api"
echo "  - API Docs: http://$(curl -s ifconfig.me)/docs"
echo ""
echo "Service URLs:"
echo "  - Main Frontend (Next.js): Port 3100 internally"
echo "  - Admin Frontend (SvelteKit): Port 80 internally"
echo "  - Backend (FastAPI): Port 8000 internally"
echo "  - Nginx (Reverse Proxy): Port 80/443 externally"
echo ""
echo "Useful commands:"
echo "  - View all logs: docker-compose -f $APP_DIR/$COMPOSE_FILE logs -f"
echo "  - View specific service: docker-compose -f $APP_DIR/$COMPOSE_FILE logs -f [backend|frontend-main|frontend-admin|nginx]"
echo "  - Restart all: docker-compose -f $APP_DIR/$COMPOSE_FILE restart"
echo "  - Stop all: docker-compose -f $APP_DIR/$COMPOSE_FILE down"
echo ""
echo "=========================================="
