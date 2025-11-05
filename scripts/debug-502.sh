#!/bin/bash

echo "=========================================="
echo "🔍 Debugging 502 Bad Gateway Issue"
echo "=========================================="
echo ""

# Check if running on EC2
echo "📍 Current Location:"
hostname
pwd
echo ""

# Check Docker containers status
echo "🐳 Docker Container Status:"
docker ps -a
echo ""

# Check container health
echo "💓 Container Health Status:"
for container in jb2-backend-prod jb2-frontend-prod jb2-nginx-prod; do
  echo -n "$container: "
  docker inspect $container --format='{{.State.Health.Status}}' 2>/dev/null || echo "No health check"
done
echo ""

# Check backend logs
echo "📝 Backend Recent Logs:"
docker logs jb2-backend-prod --tail=50 2>&1 | grep -E "(ERROR|WARNING|Failed|Exception|Traceback|502|500)" || echo "No errors found in backend logs"
echo ""

# Test backend health endpoint directly
echo "🏥 Testing Backend Health Directly:"
docker exec jb2-backend-prod curl -f http://localhost:8000/health 2>&1 || echo "Backend health check failed"
echo ""

# Test backend from nginx container
echo "🔗 Testing Backend from Nginx Container:"
docker exec jb2-nginx-prod curl -f http://backend:8000/health 2>&1 || echo "Cannot reach backend from nginx"
echo ""

# Check network connectivity
echo "🌐 Docker Network Status:"
docker network ls
echo ""
docker network inspect jb2-network 2>&1 | grep -A 5 "Containers" || echo "Network not found"
echo ""

# Check nginx error logs
echo "❌ Nginx Error Logs:"
docker exec jb2-nginx-prod cat /var/log/nginx/error.log 2>&1 | tail -20 || echo "Cannot read nginx error log"
echo ""

# Check environment variables
echo "🔐 Checking Environment Variables (without sensitive data):"
docker exec jb2-backend-prod env | grep -E "AWS_DB_|CORS_" | sed 's/=.*/=<hidden>/'
echo ""

# Check database connectivity
echo "🗄️ Testing Database Connection:"
docker exec jb2-backend-prod python -c "
import os
from sqlalchemy import create_engine
try:
    db_url = f\"postgresql://{os.getenv('AWS_DB_USER')}:{os.getenv('AWS_DB_PASSWORD')}@{os.getenv('AWS_DB_HOST')}:{os.getenv('AWS_DB_PORT')}/{os.getenv('AWS_DB_NAME')}\"
    engine = create_engine(db_url)
    with engine.connect() as conn:
        result = conn.execute('SELECT 1')
        print('✅ Database connection successful')
except Exception as e:
    print(f'❌ Database connection failed: {e}')
" 2>&1 || echo "Database test failed"
echo ""

# Check API endpoints
echo "🔌 Testing API Endpoints through Nginx:"
for endpoint in "/health" "/api/dashboard/summary" "/docs"; do
  echo -n "Testing $endpoint: "
  curl -s -o /dev/null -w "%{http_code}" http://localhost$endpoint 2>&1
  echo ""
done
echo ""

# Check disk space
echo "💾 Disk Space:"
df -h | grep -E "(^Filesystem|/$)"
echo ""

# Check memory
echo "💻 Memory Usage:"
free -h
echo ""

# Docker compose status
echo "📊 Docker Compose Status:"
cd /home/ubuntu/jb_square 2>/dev/null || cd /home/ec2-user/jb_square 2>/dev/null
docker-compose -f docker-compose.prod.yml ps
echo ""

echo "=========================================="
echo "✅ Debug Complete"
echo "=========================================="