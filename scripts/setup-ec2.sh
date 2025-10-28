#!/bin/bash

# ========================================
# EC2 Instance Initial Setup Script
# ========================================
# This script sets up an EC2 instance for Docker deployment
# Supports: Amazon Linux 2023, Amazon Linux 2, Ubuntu 22.04
# Run as: sudo bash setup-ec2.sh

set -e

echo "🚀 Starting EC2 setup for JB2 Backoffice..."

# Detect OS
if [ -f /etc/os-release ]; then
    . /etc/os-release
    OS=$ID
    VER=$VERSION_ID
else
    echo "❌ Cannot detect OS"
    exit 1
fi

echo "📋 Detected OS: $OS $VER"

# ========================================
# 1. System Update
# ========================================
echo "📦 Updating system packages..."
if [[ "$OS" == "amzn" ]]; then
    # Amazon Linux
    yum update -y
elif [[ "$OS" == "ubuntu" ]]; then
    # Ubuntu
    apt-get update
    apt-get upgrade -y
fi

# ========================================
# 2. Install Docker
# ========================================
echo "🐳 Installing Docker..."

if [[ "$OS" == "amzn" ]]; then
    # Amazon Linux 2023 or Amazon Linux 2
    yum install -y docker

    # Start Docker
    systemctl start docker
    systemctl enable docker

    # Add ec2-user to docker group
    usermod -aG docker ec2-user

elif [[ "$OS" == "ubuntu" ]]; then
    # Ubuntu
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
fi

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
if [[ "$OS" == "amzn" ]]; then
    yum install -y git
elif [[ "$OS" == "ubuntu" ]]; then
    apt-get install -y git
fi

# ========================================
# 5. Install Nginx (for SSL termination)
# ========================================
echo "🌐 Installing Nginx..."
if [[ "$OS" == "amzn" ]]; then
    yum install -y nginx
elif [[ "$OS" == "ubuntu" ]]; then
    apt-get install -y nginx
fi

# Stop Nginx (we'll use Docker nginx)
systemctl stop nginx || true
systemctl disable nginx || true

# ========================================
# 6. Install Certbot for SSL
# ========================================
echo "🔒 Installing Certbot..."
if [[ "$OS" == "amzn" ]]; then
    # Amazon Linux
    if [[ "$VER" == "2023" ]]; then
        yum install -y python3-pip
        pip3 install certbot certbot-nginx
    else
        # Amazon Linux 2
        yum install -y certbot python2-certbot-nginx || yum install -y certbot
    fi
elif [[ "$OS" == "ubuntu" ]]; then
    apt-get install -y certbot python3-certbot-nginx
fi

# ========================================
# 7. Create application directory
# ========================================
echo "📁 Creating application directory..."
if [[ "$OS" == "amzn" ]]; then
    APP_USER="ec2-user"
    APP_DIR="/home/ec2-user/jb2-backoffice"
else
    APP_USER="ubuntu"
    APP_DIR="/home/ubuntu/jb2-backoffice"
fi

mkdir -p $APP_DIR
chown -R $APP_USER:$APP_USER $APP_DIR

# ========================================
# 8. Configure Firewall
# ========================================
echo "🔥 Configuring firewall..."
if [[ "$OS" == "amzn" ]]; then
    # Use firewalld or iptables (Amazon Linux typically uses Security Groups)
    echo "ℹ️  Firewall managed by AWS Security Groups"
elif [[ "$OS" == "ubuntu" ]]; then
    ufw --force enable
    ufw allow 22/tcp    # SSH
    ufw allow 80/tcp    # HTTP
    ufw allow 443/tcp   # HTTPS
    ufw reload
fi

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
if [[ "$OS" == "amzn" ]]; then
    yum install -y htop iotop
elif [[ "$OS" == "ubuntu" ]]; then
    apt-get install -y htop iotop nethogs
fi

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
nginx -v 2>&1 || echo "Nginx: installed"
certbot --version 2>&1 || echo "Certbot: installed"
echo ""
echo "Current user: $APP_USER"
echo "App directory: $APP_DIR"
echo ""
echo "Next steps:"
echo "1. Exit and re-login to apply docker group changes:"
echo "   exit"
echo ""
echo "2. Clone your repository (if not already done):"
echo "   cd $APP_DIR"
echo "   git pull origin main  # or git clone <repo-url> ."
echo ""
echo "3. Create .env file with your secrets:"
echo "   cp .env.example .env"
echo "   nano .env"
echo ""
echo "4. Run deployment:"
echo "   cd $APP_DIR"
echo "   docker-compose -f docker-compose.prod.yml up -d --build"
echo ""
echo "5. (Optional) Setup SSL with:"
echo "   sudo certbot certonly --standalone -d your-domain.com"
echo ""
echo "=========================================="
