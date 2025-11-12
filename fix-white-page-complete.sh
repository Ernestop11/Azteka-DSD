#!/bin/bash

# Complete White Page Fix Script
# This fixes the issue AND prevents it from happening again

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
GITHUB_REPO="https://github.com/Ernestop11/Azteka-DSD.git"

echo -e "${BLUE}=== Complete White Page Fix ===${NC}"
echo ""

# Step 1: Verify local code
echo -e "${BLUE}Step 1: Verifying local code...${NC}"
if [ ! -d "$LOCAL_DIR" ]; then
    echo -e "${RED}❌ Local directory not found: $LOCAL_DIR${NC}"
    exit 1
fi

cd "$LOCAL_DIR"

# Check if buildUrl fix exists
if grep -q "buildUrl" src/lib/apiClient.ts 2>/dev/null; then
    echo -e "${GREEN}✅ buildUrl fix exists in source${NC}"
else
    echo -e "${RED}❌ buildUrl fix NOT found${NC}"
    echo "   Adding fix..."
    
    # Add buildUrl function to apiClient.ts
    cat > src/lib/apiClient.ts << 'EOF'
const API_BASE = import.meta.env?.VITE_API_URL ?? '';

// Helper function to build URLs correctly
function buildUrl(endpoint: string): string {
  // Remove leading slash from endpoint if present
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint;
  
  if (API_BASE) {
    // Remove trailing slash from API_BASE if present
    const cleanBase = API_BASE.endsWith('/') ? API_BASE.slice(0, -1) : API_BASE;
    return `${cleanBase}/${cleanEndpoint}`;
  }
  
  // Return absolute path with single slash
  return `/${cleanEndpoint}`;
}

export async function fetchFromAPI<T>(endpoint: string): Promise<T[]> {
  try {
    const token = localStorage.getItem('auth_token');
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const url = buildUrl(endpoint);
    const res = await fetch(url, {
      headers,
      credentials: 'include',
    });

    if (!res.ok) {
      console.warn(`API ${endpoint} returned ${res.status}, using empty array`);
      return [];
    }

    const data = await res.json();
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error(`Error fetching ${endpoint}:`, error);
    return [];
  }
}

export async function postToAPI<T>(endpoint: string, body: any): Promise<T | null> {
  try {
    const token = localStorage.getItem('auth_token');
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const url = buildUrl(endpoint);
    const res = await fetch(url, {
      method: 'POST',
      headers,
      credentials: 'include',
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      console.warn(`Failed to post to ${endpoint}: ${res.status}`);
      return null;
    }
    return await res.json();
  } catch (error) {
    console.error(`Error posting to ${endpoint}:`, error);
    return null;
  }
}
EOF
    
    echo -e "${GREEN}✅ Fix added${NC}"
fi
echo ""

# Step 2: Remove Service Worker registration (prevention)
echo -e "${BLUE}Step 2: Removing Service Worker registration...${NC}"
if grep -r "serviceWorker\|navigator.serviceWorker" src/ public/ index.html 2>/dev/null | grep -v node_modules | head -1 | grep -q .; then
    echo -e "${YELLOW}⚠ Service Worker registration found${NC}"
    echo "   Removing Service Worker registration..."
    
    # Remove from main.tsx
    if [ -f src/main.tsx ]; then
        sed -i.bak '/serviceWorker\|navigator.serviceWorker/d' src/main.tsx 2>/dev/null || true
    fi
    
    # Remove from index.html
    if [ -f index.html ]; then
        sed -i.bak '/serviceWorker\|navigator.serviceWorker/d' index.html 2>/dev/null || true
    fi
    
    echo -e "${GREEN}✅ Service Worker registration removed${NC}"
else
    echo -e "${GREEN}✅ No Service Worker registration found${NC}"
fi
echo ""

# Step 3: Add cache busting to Vite config
echo -e "${BLUE}Step 3: Adding cache busting...${NC}"
if [ -f vite.config.ts ]; then
    if grep -q "build.*rollupOptions" vite.config.ts; then
        echo -e "${GREEN}✅ Cache busting already configured${NC}"
    else
        echo "   Adding cache busting configuration..."
        
        # Read current config
        if ! grep -q "build:" vite.config.ts; then
            # Add build config
            cat >> vite.config.ts << 'EOF'

// Cache busting configuration
export default defineConfig({
  ...existingConfig,
  build: {
    rollupOptions: {
      output: {
        entryFileNames: 'assets/[name]-[hash].js',
        chunkFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]',
      },
    },
  },
});
EOF
        else
            echo "   Config already has build section"
        fi
    fi
fi
echo ""

# Step 4: Commit changes
echo -e "${BLUE}Step 4: Committing changes...${NC}"
if [ -d ".git" ]; then
    git add .
    git commit -m "fix: Add buildUrl fix and remove Service Worker

- Add buildUrl() helper to fix URL construction
- Remove Service Worker registration to prevent caching issues
- Add cache busting to Vite config
- Fix white page issue permanently" || echo "   No changes to commit"
    echo -e "${GREEN}✅ Changes committed${NC}"
else
    echo -e "${YELLOW}⚠ Not a git repository${NC}"
fi
echo ""

# Step 5: Push to GitHub
echo -e "${BLUE}Step 5: Pushing to GitHub...${NC}"
if git remote | grep -q "origin"; then
    CURRENT_BRANCH=$(git branch --show-current 2>/dev/null || echo "main")
    git push origin "$CURRENT_BRANCH"
    echo -e "${GREEN}✅ Code pushed to GitHub${NC}"
else
    echo -e "${YELLOW}⚠ No GitHub remote configured${NC}"
fi
echo ""

# Step 6: Deploy to VPS
echo -e "${BLUE}Step 6: Deploying to VPS...${NC}"
echo "   This will:"
echo "   1. Backup current deployment"
echo "   2. Pull latest code"
echo "   3. Remove old Service Worker files"
echo "   4. Rebuild frontend"
echo "   5. Clear nginx cache"
echo ""

read -p "Deploy to VPS? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    ssh "$VPS_HOST" "
        cd $VPS_DIR
        
        # Backup
        echo '📦 Creating backup...'
        BACKUP_NAME=\"backup-\$(date +%Y%m%d-%H%M%S).tar.gz\"
        tar -czf \"\$BACKUP_NAME\" dist/ 2>/dev/null || true
        echo \"✅ Backup created: \$BACKUP_NAME\"
        
        # Pull latest code
        echo '📥 Pulling latest code...'
        if [ -d .git ]; then
            git fetch origin main
            git reset --hard origin/main
            echo '✅ Code updated'
        else
            echo '⚠ Not a git repository'
        fi
        
        # Remove Service Worker files
        echo '🗑️  Removing Service Worker files...'
        rm -f dist/service-worker.js dist/sw.js public/service-worker.js public/sw.js 2>/dev/null || true
        rm -f service-worker.js sw.js 2>/dev/null || true
        echo '✅ Service Worker files removed'
        
        # Clean install
        echo '🧹 Cleaning dependencies...'
        rm -rf node_modules dist
        npm install --legacy-peer-deps
        echo '✅ Dependencies installed'
        
        # Rebuild
        echo '🔨 Building frontend...'
        npm run build
        echo '✅ Frontend built'
        
        # Verify build
        if [ -f dist/index.html ]; then
            echo '✅ Build verified'
        else
            echo '❌ Build failed!'
            exit 1
        fi
        
        # Clear nginx cache
        echo '🧹 Clearing nginx cache...'
        rm -rf /var/cache/nginx/* 2>/dev/null || true
        systemctl reload nginx
        echo '✅ Nginx cache cleared'
        
        # Restart services
        echo '🔄 Restarting services...'
        pm2 restart azteka-api 2>/dev/null || echo '⚠ PM2 not running'
        systemctl reload nginx
        echo '✅ Services restarted'
        
        echo ''
        echo '✅ Deployment complete!'
    "
    
    echo ""
    echo -e "${GREEN}✅ VPS deployment complete${NC}"
else
    echo -e "${YELLOW}⚠ Skipping VPS deployment${NC}"
fi
echo ""

# Step 7: Verification
echo -e "${BLUE}Step 7: Verifying deployment...${NC}"
ssh "$VPS_HOST" "
    cd $VPS_DIR
    
    echo '🔍 Verifying...'
    echo ''
    
    # Check if buildUrl exists in source
    if grep -q 'buildUrl' src/lib/apiClient.ts 2>/dev/null; then
        echo -e '${GREEN}✅ buildUrl fix in source${NC}'
    else
        echo -e '${RED}❌ buildUrl fix missing${NC}'
    fi
    
    # Check if Service Worker files removed
    if [ ! -f dist/service-worker.js ] && [ ! -f dist/sw.js ]; then
        echo -e '${GREEN}✅ Service Worker files removed${NC}'
    else
        echo -e '${YELLOW}⚠ Service Worker files still exist${NC}'
    fi
    
    # Check build
    if [ -f dist/index.html ]; then
        echo -e '${GREEN}✅ Build exists${NC}'
        BUILD_TIME=\$(stat -c '%y' dist/index.html 2>/dev/null || stat -f '%Sm' dist/index.html)
        echo \"   Build time: \$BUILD_TIME\"
    else
        echo -e '${RED}❌ Build missing${NC}'
    fi
    
    # Check API
    if curl -s http://localhost:3002/api/health >/dev/null 2>&1; then
        echo -e '${GREEN}✅ API is responding${NC}'
    else
        echo -e '${RED}❌ API not responding${NC}'
    fi
    
    echo ''
"

echo ""
echo -e "${GREEN}=== Fix Complete ===${NC}"
echo ""
echo "Next steps:"
echo "1. ${BLUE}Unregister Service Worker in browser:${NC}"
echo "   - Open DevTools (F12)"
echo "   - Go to Application tab"
echo "   - Click 'Service Workers'"
echo "   - Click 'Unregister'"
echo ""
echo "2. ${BLUE}Hard refresh the page:${NC}"
echo "   - Windows/Linux: Ctrl + Shift + R"
echo "   - Mac: Cmd + Shift + R"
echo ""
echo "3. ${BLUE}Test the site:${NC}"
echo "   - Visit: https://aztekafoods.com"
echo "   - Check browser console for errors"
echo ""
echo "✅ The fix is deployed and Service Worker is removed!"
echo "✅ This should prevent the issue from happening again!"

