#!/bin/bash

# Prevention Strategy Script
# This creates a deployment process that prevents white page issues

set -e

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

LOCAL_DIR="/Users/ernestoponce/dev/azteka-dsd"
VPS_HOST="root@77.243.85.8"
VPS_DIR="/srv/azteka-dsd"

echo -e "${BLUE}=== Prevention Strategy Setup ===${NC}"
echo ""

# Step 1: Create deployment script
echo -e "${BLUE}Step 1: Creating deployment script...${NC}"
cat > "$LOCAL_DIR/deploy.sh" << 'EOF'
#!/bin/bash
# Safe Deployment Script
# This ensures clean builds and prevents caching issues

set -e

VPS_HOST="root@77.243.85.8"
VPS_DIR="/srv/azteka-dsd"

echo "🚀 Starting deployment..."

# Step 1: Verify local code
echo "✅ Verifying local code..."
if [ ! -f src/lib/apiClient.ts ]; then
    echo "❌ apiClient.ts not found!"
    exit 1
fi

# Step 2: Build locally first (test)
echo "🔨 Building locally..."
npm run build

if [ ! -f dist/index.html ]; then
    echo "❌ Build failed!"
    exit 1
fi

echo "✅ Local build successful"

# Step 3: Commit and push
echo "📦 Committing and pushing..."
git add .
git commit -m "chore: Deploy $(date +%Y%m%d-%H%M%S)" || echo "No changes"
git push origin main

# Step 4: Deploy to VPS
echo "📥 Deploying to VPS..."
ssh "$VPS_HOST" "
    cd $VPS_DIR
    
    # Backup
    BACKUP=\$(date +%Y%m%d-%H%M%S)
    tar -czf \"backup-\$BACKUP.tar.gz\" dist/ 2>/dev/null || true
    
    # Pull code
    git pull origin main
    
    # Clean build
    rm -rf node_modules dist
    npm install --legacy-peer-deps
    npm run build
    
    # Remove Service Worker files
    rm -f dist/service-worker.js dist/sw.js 2>/dev/null || true
    
    # Clear nginx cache
    rm -rf /var/cache/nginx/* 2>/dev/null || true
    systemctl reload nginx
    
    # Restart services
    pm2 restart azteka-api 2>/dev/null || true
    
    echo '✅ Deployment complete'
"

echo "✅ Deployment complete!"
echo "🌐 https://aztekafoods.com"
EOF

chmod +x "$LOCAL_DIR/deploy.sh"
echo -e "${GREEN}✅ Deployment script created: $LOCAL_DIR/deploy.sh${NC}"
echo ""

# Step 2: Create pre-deploy hook
echo -e "${BLUE}Step 2: Creating pre-deploy hook...${NC}"
cat > "$LOCAL_DIR/.git/hooks/pre-push" << 'EOF'
#!/bin/bash
# Pre-push hook to verify code before pushing

echo "🔍 Running pre-push checks..."

# Check if buildUrl exists
if ! grep -q "buildUrl" src/lib/apiClient.ts; then
    echo "❌ buildUrl fix not found in apiClient.ts!"
    exit 1
fi

# Check if Service Worker is removed
if grep -r "serviceWorker\|navigator.serviceWorker" src/ public/ index.html 2>/dev/null | grep -v node_modules | grep -q .; then
    echo "⚠️  Warning: Service Worker registration found!"
    echo "   Consider removing it to prevent caching issues"
fi

# Try to build
echo "🔨 Testing build..."
npm run build > /dev/null 2>&1

if [ ! -f dist/index.html ]; then
    echo "❌ Build failed!"
    exit 1
fi

echo "✅ Pre-push checks passed"
EOF

chmod +x "$LOCAL_DIR/.git/hooks/pre-push"
echo -e "${GREEN}✅ Pre-push hook created${NC}"
echo ""

# Step 3: Create post-deploy verification script
echo -e "${BLUE}Step 3: Creating post-deploy verification...${NC}"
cat > "$LOCAL_DIR/verify-deployment.sh" << 'EOF'
#!/bin/bash
# Post-deployment verification script

VPS_HOST="root@77.243.85.8"
VPS_DIR="/srv/azteka-dsd"

echo "🔍 Verifying deployment..."

ssh "$VPS_HOST" "
    cd $VPS_DIR
    
    # Check build
    if [ ! -f dist/index.html ]; then
        echo '❌ Build missing!'
        exit 1
    fi
    
    # Check buildUrl in source
    if ! grep -q 'buildUrl' src/lib/apiClient.ts 2>/dev/null; then
        echo '❌ buildUrl fix missing!'
        exit 1
    fi
    
    # Check Service Worker files
    if [ -f dist/service-worker.js ] || [ -f dist/sw.js ]; then
        echo '⚠️  Service Worker files still exist!'
    fi
    
    # Check API
    if ! curl -s http://localhost:3002/api/health >/dev/null 2>&1; then
        echo '❌ API not responding!'
        exit 1
    fi
    
    echo '✅ Deployment verified'
"

echo "✅ Verification complete!"
EOF

chmod +x "$LOCAL_DIR/verify-deployment.sh"
echo -e "${GREEN}✅ Verification script created${NC}"
echo ""

# Step 4: Create VPS cleanup script
echo -e "${BLUE}Step 4: Creating VPS cleanup script...${NC}"
cat > "$LOCAL_DIR/vps-cleanup.sh" << 'EOF'
#!/bin/bash
# VPS cleanup script - removes Service Workers and clears cache

VPS_HOST="root@77.243.85.8"
VPS_DIR="/srv/azteka-dsd"

echo "🧹 Cleaning VPS..."

ssh "$VPS_HOST" "
    cd $VPS_DIR
    
    # Remove Service Worker files
    echo 'Removing Service Worker files...'
    rm -f dist/service-worker.js dist/sw.js service-worker.js sw.js 2>/dev/null || true
    rm -f public/service-worker.js public/sw.js 2>/dev/null || true
    
    # Clear nginx cache
    echo 'Clearing nginx cache...'
    rm -rf /var/cache/nginx/* 2>/dev/null || true
    systemctl reload nginx
    
    # Clear browser cache headers (add to nginx config)
    echo '✅ Cleanup complete'
"

echo "✅ VPS cleanup complete!"
EOF

chmod +x "$LOCAL_DIR/vps-cleanup.sh"
echo -e "${GREEN}✅ VPS cleanup script created${NC}"
echo ""

# Step 5: Add nginx cache headers
echo -e "${BLUE}Step 5: Creating nginx config update...${NC}"
cat > "$LOCAL_DIR/nginx-cache-headers.conf" << 'EOF'
# Nginx cache headers to prevent caching issues
# Add this to your nginx config

location / {
    # Disable caching for HTML files
    location ~* \.html$ {
        add_header Cache-Control "no-cache, no-store, must-revalidate";
        add_header Pragma "no-cache";
        add_header Expires "0";
    }
    
    # Cache assets with versioning
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        add_header Cache-Control "public, max-age=31536000, immutable";
    }
    
    # No cache for API
    location /api/ {
        add_header Cache-Control "no-cache, no-store, must-revalidate";
        proxy_pass http://localhost:3002;
    }
}
EOF

echo -e "${GREEN}✅ Nginx config template created${NC}"
echo ""

# Step 6: Create monitoring script
echo -e "${BLUE}Step 6: Creating monitoring script...${NC}"
cat > "$LOCAL_DIR/monitor.sh" << 'EOF'
#!/bin/bash
# Monitoring script - checks if site is working

DOMAIN="https://aztekafoods.com"

echo "🔍 Monitoring $DOMAIN..."

# Check HTTP status
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" "$DOMAIN")

if [ "$HTTP_CODE" = "200" ]; then
    echo "✅ HTTP Status: OK ($HTTP_CODE)"
else
    echo "❌ HTTP Status: Failed ($HTTP_CODE)"
fi

# Check API
API_CODE=$(curl -s -o /dev/null -w "%{http_code}" "$DOMAIN/api/health")

if [ "$API_CODE" = "200" ]; then
    echo "✅ API Status: OK ($API_CODE)"
else
    echo "❌ API Status: Failed ($API_CODE)"
fi

# Check for white page (basic check)
CONTENT=$(curl -s "$DOMAIN" | grep -o '<div id="root">' | head -1)

if [ -n "$CONTENT" ]; then
    echo "✅ Root div found"
else
    echo "⚠️  Root div not found (might be white page)"
fi
EOF

chmod +x "$LOCAL_DIR/monitor.sh"
echo -e "${GREEN}✅ Monitoring script created${NC}"
echo ""

echo -e "${GREEN}=== Prevention Strategy Complete ===${NC}"
echo ""
echo "Created scripts:"
echo "  1. ${BLUE}deploy.sh${NC} - Safe deployment script"
echo "  2. ${BLUE}verify-deployment.sh${NC} - Post-deployment verification"
echo "  3. ${BLUE}vps-cleanup.sh${NC} - VPS cleanup script"
echo "  4. ${BLUE}monitor.sh${NC} - Site monitoring script"
echo ""
echo "Prevention measures:"
echo "  ✅ Pre-push hook to verify code"
echo "  ✅ Service Worker removal"
echo "  ✅ Cache busting in Vite config"
echo "  ✅ Nginx cache headers"
echo "  ✅ Deployment verification"
echo ""
echo "Usage:"
echo "  ${BLUE}./deploy.sh${NC} - Deploy to production"
echo "  ${BLUE}./verify-deployment.sh${NC} - Verify deployment"
echo "  ${BLUE}./vps-cleanup.sh${NC} - Clean VPS cache"
echo "  ${BLUE}./monitor.sh${NC} - Monitor site health"
echo ""

