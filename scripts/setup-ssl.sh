#!/bin/bash

# ========================================
# SSL Certificate Setup Script
# ========================================
# This script sets up Let's Encrypt SSL certificates for your domains
# Run as: sudo bash setup-ssl.sh
#
# Prerequisites:
# - DNS A records must be pointing to this server
# - Port 80 must be open
# - Certbot must be installed

set -e

DOMAINS="jb2.kr,www.jb2.kr,jb2.co.kr,www.jb2.co.kr"
EMAIL="admin@jb2.kr"  # Change this to your email

echo "🔒 Setting up SSL certificates for domains: $DOMAINS"

# Detect user
if [[ -d "/home/ec2-user" ]]; then
    APP_USER="ec2-user"
    APP_DIR="/home/ec2-user/jb_square"
else
    APP_USER="ubuntu"
    APP_DIR="/home/ubuntu/jb_square"
fi

echo "📋 User: $APP_USER"
echo "📁 App directory: $APP_DIR"

# ========================================
# 1. Stop Docker containers temporarily
# ========================================
echo ""
echo "🛑 Stopping Docker containers..."
cd $APP_DIR
docker-compose -f docker-compose.prod.yml down || true

# ========================================
# 2. Issue SSL certificate with certbot standalone
# ========================================
echo ""
echo "📜 Issuing SSL certificate..."

certbot certonly --standalone \
  --non-interactive \
  --agree-tos \
  --email $EMAIL \
  -d jb2.kr \
  -d www.jb2.kr \
  -d jb2.co.kr \
  -d www.jb2.co.kr

# ========================================
# 3. Copy certificates to nginx ssl directory
# ========================================
echo ""
echo "📋 Copying certificates..."

mkdir -p $APP_DIR/nginx/ssl

# For jb2.kr (primary domain)
cp /etc/letsencrypt/live/jb2.kr/fullchain.pem $APP_DIR/nginx/ssl/
cp /etc/letsencrypt/live/jb2.kr/privkey.pem $APP_DIR/nginx/ssl/

# Set permissions
chown -R $APP_USER:$APP_USER $APP_DIR/nginx/ssl
chmod 644 $APP_DIR/nginx/ssl/fullchain.pem
chmod 600 $APP_DIR/nginx/ssl/privkey.pem

echo "✅ Certificates copied to $APP_DIR/nginx/ssl/"

# ========================================
# 4. Uncomment HTTPS block in nginx config
# ========================================
echo ""
echo "📝 Updating nginx configuration..."

sed -i 's/^# server {$/server {/' $APP_DIR/nginx/conf.d/default.conf
sed -i 's/^#     /    /' $APP_DIR/nginx/conf.d/default.conf
sed -i 's/^# }/}/' $APP_DIR/nginx/conf.d/default.conf

# Enable HTTP to HTTPS redirect
sed -i 's/    # return 301 https/    return 301 https/' $APP_DIR/nginx/conf.d/default.conf

echo "✅ Nginx configuration updated"

# ========================================
# 5. Restart Docker containers
# ========================================
echo ""
echo "🚀 Starting Docker containers..."
cd $APP_DIR
docker-compose -f docker-compose.prod.yml up -d

# Wait for containers to start
sleep 10

echo "✅ Docker containers restarted"

# ========================================
# 6. Set up auto-renewal
# ========================================
echo ""
echo "⏰ Setting up auto-renewal..."

# Create renewal hook script
cat > /etc/letsencrypt/renewal-hooks/post/reload-nginx.sh << 'HOOK_EOF'
#!/bin/bash
if [[ -d "/home/ec2-user" ]]; then
    APP_DIR="/home/ec2-user/jb_square"
else
    APP_DIR="/home/ubuntu/jb_square"
fi

# Copy renewed certificates
cp /etc/letsencrypt/live/jb2.kr/fullchain.pem $APP_DIR/nginx/ssl/
cp /etc/letsencrypt/live/jb2.kr/privkey.pem $APP_DIR/nginx/ssl/

# Reload nginx
cd $APP_DIR
docker-compose -f docker-compose.prod.yml exec nginx nginx -s reload
HOOK_EOF

chmod +x /etc/letsencrypt/renewal-hooks/post/reload-nginx.sh

# Test renewal
certbot renew --dry-run

echo "✅ Auto-renewal configured"

# ========================================
# 7. Test HTTPS
# ========================================
echo ""
echo "🧪 Testing HTTPS..."
sleep 5

curl -I https://jb2.kr 2>&1 | head -n 1 || echo "⚠️  HTTPS test failed - check DNS settings"

# ========================================
# Summary
# ========================================
echo ""
echo "=========================================="
echo "✅ SSL Setup Complete!"
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
echo "Certificate auto-renewal:"
echo "  - Certificates will auto-renew every 60 days"
echo "  - Test renewal: sudo certbot renew --dry-run"
echo ""
echo "=========================================="
