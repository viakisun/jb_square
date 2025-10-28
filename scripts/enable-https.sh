#!/bin/bash

# ========================================
# Enable HTTPS Script
# ========================================
# This script enables HTTPS by uncommenting the HTTPS server block
# and updating SSL certificate paths for Cloudflare Origin certificates
#
# Run as: bash scripts/enable-https.sh

set -e

# Detect user and app directory
if [[ -d "/home/ec2-user" ]]; then
    APP_USER="ec2-user"
    APP_DIR="/home/ec2-user/jb_square"
else
    APP_USER="ubuntu"
    APP_DIR="/home/ubuntu/jb_square"
fi

NGINX_CONF="$APP_DIR/nginx/conf.d/default.conf"

echo "🔧 Enabling HTTPS for Cloudflare Origin certificates..."
echo "📁 App directory: $APP_DIR"
echo ""

# ========================================
# 1. Check if SSL certificates exist
# ========================================
echo "🔍 Checking SSL certificates..."

if [[ ! -f "$APP_DIR/nginx/ssl/cloudflare-origin.pem" ]]; then
    echo "❌ SSL certificate not found: $APP_DIR/nginx/ssl/cloudflare-origin.pem"
    echo ""
    echo "Please create the certificate first:"
    echo "  nano $APP_DIR/nginx/ssl/cloudflare-origin.pem"
    exit 1
fi

if [[ ! -f "$APP_DIR/nginx/ssl/cloudflare-origin-key.pem" ]]; then
    echo "❌ SSL private key not found: $APP_DIR/nginx/ssl/cloudflare-origin-key.pem"
    echo ""
    echo "Please create the private key first:"
    echo "  nano $APP_DIR/nginx/ssl/cloudflare-origin-key.pem"
    exit 1
fi

echo "✅ SSL certificates found"

# ========================================
# 2. Backup current config
# ========================================
echo ""
echo "💾 Backing up current nginx config..."
cp "$NGINX_CONF" "$NGINX_CONF.backup.$(date +%Y%m%d_%H%M%S)"
echo "✅ Backup created"

# ========================================
# 3. Update nginx config
# ========================================
echo ""
echo "📝 Updating nginx configuration..."

# Create temporary file with updated config
cat > "$NGINX_CONF" << 'NGINX_EOF'
# Upstream servers
upstream backend {
    server backend:8000;
}

upstream frontend {
    server frontend:80;
}

# HTTP server (redirect to HTTPS)
server {
    listen 80;
    server_name jb2.kr www.jb2.kr jb2.co.kr www.jb2.co.kr;

    # For Let's Encrypt SSL certificate validation
    location /.well-known/acme-challenge/ {
        root /var/www/certbot;
    }

    # Redirect all HTTP to HTTPS
    return 301 https://$host$request_uri;
}

# HTTPS server
server {
    listen 443 ssl http2;
    server_name jb2.kr www.jb2.kr jb2.co.kr www.jb2.co.kr;

    # Cloudflare Origin CA certificates
    ssl_certificate /etc/nginx/ssl/cloudflare-origin.pem;
    ssl_certificate_key /etc/nginx/ssl/cloudflare-origin-key.pem;

    # SSL configuration
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;

    # API requests to backend
    location /api/ {
        proxy_pass http://backend;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        # WebSocket support
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";

        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # Health check endpoint
    location /health {
        proxy_pass http://backend/health;
        proxy_set_header Host $host;
        access_log off;
    }

    # API docs
    location /docs {
        proxy_pass http://backend/docs;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location /redoc {
        proxy_pass http://backend/redoc;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location /openapi.json {
        proxy_pass http://backend/openapi.json;
        proxy_set_header Host $host;
    }

    # Frontend static files
    location / {
        proxy_pass http://frontend;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
}
NGINX_EOF

echo "✅ Nginx configuration updated"

# ========================================
# 4. Restart nginx container
# ========================================
echo ""
echo "🔄 Restarting nginx container..."
cd "$APP_DIR"
docker-compose -f docker-compose.prod.yml restart nginx

echo "✅ Nginx restarted"

# Wait for nginx to start
sleep 3

# ========================================
# 5. Test HTTPS
# ========================================
echo ""
echo "🧪 Testing HTTPS..."

# Test if nginx is running
if docker-compose -f docker-compose.prod.yml ps nginx | grep -q "Up"; then
    echo "✅ Nginx container is running"
else
    echo "❌ Nginx container is not running"
    echo ""
    echo "Check logs:"
    echo "  docker-compose -f docker-compose.prod.yml logs nginx"
    exit 1
fi

# ========================================
# Summary
# ========================================
echo ""
echo "=========================================="
echo "✅ HTTPS Enabled Successfully!"
echo "=========================================="
echo ""
echo "Your sites are now available at:"
echo "  🔒 https://jb2.kr"
echo "  🔒 https://www.jb2.kr"
echo "  🔒 https://jb2.co.kr"
echo "  🔒 https://www.jb2.co.kr"
echo ""
echo "HTTP (port 80) will automatically redirect to HTTPS"
echo ""
echo "Verify HTTPS is working:"
echo "  curl -I https://jb2.kr"
echo ""
echo "View nginx logs:"
echo "  docker-compose -f docker-compose.prod.yml logs -f nginx"
echo ""
echo "=========================================="
