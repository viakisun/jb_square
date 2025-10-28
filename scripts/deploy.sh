#!/bin/bash

# ========================================
# JB2 Backoffice Deployment Script
# ========================================
# Run this script on EC2 to deploy or update the application
# Usage: bash deploy.sh

set -e

APP_DIR="/home/ubuntu/jb2-backoffice"
COMPOSE_FILE="docker-compose.prod.yml"
BACKUP_DIR="/home/ubuntu/backups"

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

# Check backend health endpoint
if ! curl -f http://localhost:8000/health > /dev/null 2>&1; then
    echo "⚠️  Warning: Backend health check failed"
    echo "Check backend logs with: docker-compose -f $COMPOSE_FILE logs backend"
else
    echo "✅ Backend is healthy"
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
echo "  - Frontend: http://$(curl -s ifconfig.me)"
echo "  - Backend API: http://$(curl -s ifconfig.me)/api"
echo "  - API Docs: http://$(curl -s ifconfig.me)/docs"
echo ""
echo "Useful commands:"
echo "  - View logs: docker-compose -f $APP_DIR/$COMPOSE_FILE logs -f"
echo "  - Restart: docker-compose -f $APP_DIR/$COMPOSE_FILE restart"
echo "  - Stop: docker-compose -f $APP_DIR/$COMPOSE_FILE down"
echo ""
echo "=========================================="
