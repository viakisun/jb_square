#!/bin/bash

# ========================================
# Local Build Test Script
# ========================================
# Test Docker builds locally before deploying
# Run as: bash scripts/test-build.sh

set -e

echo "=========================================="
echo "🧪 Local Build Test"
echo "=========================================="
echo ""

# Get project root
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

cd "$PROJECT_ROOT"

echo "📂 Project root: $PROJECT_ROOT"
echo ""

# ========================================
# 1. Test Backend Build
# ========================================
echo "🔨 Testing Backend build..."
cd backend

if docker build -t jb2-backend:test . ; then
    echo "✅ Backend build successful"
else
    echo "❌ Backend build failed"
    exit 1
fi

cd ..
echo ""

# ========================================
# 2. Test Frontend Build
# ========================================
echo "🔨 Testing Frontend build..."
cd frontend

# Check package-lock.json sync
if ! npm ci --dry-run 2>&1 | grep -q "error"; then
    echo "✅ package-lock.json is in sync"
else
    echo "⚠️  package-lock.json may be out of sync"
    echo "   Running npm install to update..."
    npm install
fi

if docker build -t jb2-frontend:test . ; then
    echo "✅ Frontend build successful"
else
    echo "❌ Frontend build failed"
    exit 1
fi

cd ..
echo ""

# ========================================
# 3. Test Docker Compose
# ========================================
echo "🐳 Testing docker-compose configuration..."

if docker-compose -f docker-compose.prod.yml config > /dev/null 2>&1; then
    echo "✅ docker-compose.prod.yml is valid"
else
    echo "❌ docker-compose.prod.yml has errors"
    exit 1
fi

echo ""

# ========================================
# 4. Summary
# ========================================
echo "=========================================="
echo "✅ All builds successful!"
echo "=========================================="
echo ""
echo "Built images:"
docker images | grep "jb2-" | grep "test"
echo ""
echo "Next steps:"
echo "  1. Commit your changes"
echo "  2. Push to GitHub"
echo "  3. GitHub Actions will deploy automatically"
echo ""
echo "Clean up test images:"
echo "  docker rmi jb2-backend:test jb2-frontend:test"
echo ""
echo "=========================================="
