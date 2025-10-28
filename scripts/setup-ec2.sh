#!/bin/bash

# ========================================
# EC2 Instance Initial Setup Script
# ========================================
# This script sets up an EC2 instance for Docker deployment
# Run as: sudo bash setup-ec2.sh

set -e

echo "🚀 Starting EC2 setup for JB2 Backoffice..."

# ========================================
# 1. System Update
# ========================================
echo "📦 Updating system packages..."
apt-get update
apt-get upgrade -y

# ========================================
# 2. Install Docker
# ========================================
echo "🐳 Installing Docker..."
apt-get install -y \
    ca-certificates \
    curl \
    gnupg \
    lsb-release

# Add Docker's official GPG key
mkdir -p /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | gpg --dearmor -o /etc/apt/keyrings/docker.gpg

# Set up Docker repository
echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
  $(lsb_release -cs) stable" | tee /etc/apt/sources.list.d/docker.list > /dev/null

# Install Docker Engine
apt-get update
apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

# Start Docker
systemctl start docker
systemctl enable docker

# Add ubuntu user to docker group
usermod -aG docker ubuntu

echo "✅ Docker installed successfully"

# ========================================
# 3. Install Docker Compose
# ========================================
echo "📦 Installing Docker Compose..."
curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
chmod +x /usr/local/bin/docker-compose

echo "✅ Docker Compose installed successfully"

# ========================================
# 4. Install Git
# ========================================
echo "📦 Installing Git..."
apt-get install -y git

# ========================================
# 5. Install Nginx (for SSL termination)
# ========================================
echo "🌐 Installing Nginx..."
apt-get install -y nginx

# Stop Nginx (we'll use Docker nginx)
systemctl stop nginx
systemctl disable nginx

# ========================================
# 6. Install Certbot for SSL
# ========================================
echo "🔒 Installing Certbot..."
apt-get install -y certbot python3-certbot-nginx

# ========================================
# 7. Create application directory
# ========================================
echo "📁 Creating application directory..."
mkdir -p /home/ubuntu/jb2-backoffice
chown -R ubuntu:ubuntu /home/ubuntu/jb2-backoffice

# ========================================
# 8. Configure Firewall (UFW)
# ========================================
echo "🔥 Configuring firewall..."
ufw --force enable
ufw allow 22/tcp    # SSH
ufw allow 80/tcp    # HTTP
ufw allow 443/tcp   # HTTPS
ufw reload

# ========================================
# 9. Configure system limits
# ========================================
echo "⚙️  Configuring system limits..."
cat >> /etc/security/limits.conf << EOF
* soft nofile 65536
* hard nofile 65536
EOF

# ========================================
# 10. Install monitoring tools (optional)
# ========================================
echo "📊 Installing monitoring tools..."
apt-get install -y htop iotop nethogs

# ========================================
# 11. Setup log rotation
# ========================================
echo "📝 Setting up log rotation..."
cat > /etc/logrotate.d/docker-containers << EOF
/var/lib/docker/containers/*/*.log {
    rotate 7
    daily
    compress
    missingok
    delaycompress
    copytruncate
}
EOF

# ========================================
# Summary
# ========================================
echo ""
echo "=========================================="
echo "✅ EC2 Setup Complete!"
echo "=========================================="
echo ""
echo "Installed software:"
docker --version
docker-compose --version
git --version
nginx -v
certbot --version
echo ""
echo "Next steps:"
echo "1. Exit and re-login to apply docker group changes"
echo "2. Clone your repository to /home/ubuntu/jb2-backoffice"
echo "3. Create .env file with your secrets"
echo "4. Run: docker-compose -f docker-compose.prod.yml up -d"
echo "5. Setup SSL with: sudo certbot --nginx -d your-domain.com"
echo ""
echo "=========================================="
