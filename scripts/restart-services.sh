#!/bin/bash
# Restart All Services Script
# Restarts pm2, nginx, and clears caches

set -e

echo "🔄 Restarting All Services..."
echo "=" | head -c 60; echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# 1. Restart PM2
echo -e "\n${YELLOW}1. Restarting PM2 processes...${NC}"
if command_exists pm2; then
    echo "   Stopping all PM2 processes..."
    pm2 stop all || true
    
    echo "   Clearing PM2 logs..."
    pm2 flush || true
    
    echo "   Restarting PM2 processes..."
    pm2 restart all || pm2 start all
    
    echo "   Saving PM2 process list..."
    pm2 save || true
    
    echo -e "   ${GREEN}✅ PM2 restarted${NC}"
else
    echo -e "   ${RED}❌ PM2 not found${NC}"
fi

# 2. Restart Nginx
echo -e "\n${YELLOW}2. Restarting Nginx...${NC}"
if command_exists nginx; then
    # Check if running as root or with sudo
    if [ "$EUID" -eq 0 ]; then
        echo "   Testing Nginx configuration..."
        nginx -t
        
        echo "   Reloading Nginx..."
        systemctl reload nginx || service nginx reload || nginx -s reload
        echo -e "   ${GREEN}✅ Nginx reloaded${NC}"
    else
        echo "   Attempting with sudo..."
        sudo nginx -t && sudo systemctl reload nginx || sudo service nginx reload || sudo nginx -s reload
        echo -e "   ${GREEN}✅ Nginx reloaded${NC}"
    fi
else
    echo -e "   ${YELLOW}⚠️  Nginx not found (may not be installed)${NC}"
fi

# 3. Clear Next.js cache
echo -e "\n${YELLOW}3. Clearing Next.js cache...${NC}"
if [ -d ".next-azteka" ]; then
    echo "   Removing .next-azteka directory..."
    rm -rf .next-azteka
    echo -e "   ${GREEN}✅ Next.js cache cleared${NC}"
else
    echo -e "   ${YELLOW}⚠️  .next-azteka directory not found${NC}"
fi

if [ -d ".next" ]; then
    echo "   Removing .next directory..."
    rm -rf .next
    echo -e "   ${GREEN}✅ Next.js cache cleared${NC}"
fi

# 4. Clear Node modules cache (optional, commented out by default)
# echo -e "\n${YELLOW}4. Clearing Node modules cache...${NC}"
# if [ -d "node_modules/.cache" ]; then
#     rm -rf node_modules/.cache
#     echo -e "   ${GREEN}✅ Node cache cleared${NC}"
# fi

# 5. Prisma - Generate client and clear cache
echo -e "\n${YELLOW}5. Updating Prisma...${NC}"
if command_exists npx; then
    echo "   Generating Prisma client..."
    npx prisma generate || true
    
    echo "   Pushing Prisma schema (if needed)..."
    # npx prisma db push || true  # Uncomment if needed
    
    echo -e "   ${GREEN}✅ Prisma updated${NC}"
else
    echo -e "   ${RED}❌ npx not found${NC}"
fi

# 6. Clear system caches (Linux)
if [[ "$OSTYPE" == "linux-gnu"* ]]; then
    echo -e "\n${YELLOW}6. Clearing system caches...${NC}"
    
    # Clear DNS cache (if systemd-resolved exists)
    if command_exists systemd-resolve; then
        sudo systemd-resolve --flush-caches 2>/dev/null || true
        echo "   DNS cache cleared"
    fi
    
    # Sync filesystem
    sync
    echo "   Filesystem synced"
fi

# Summary
echo -e "\n" 
echo "=" | head -c 60; echo ""
echo -e "${GREEN}✅ All services restarted!${NC}"
echo ""
echo "Next steps:"
echo "1. Check PM2 status: pm2 status"
echo "2. Check PM2 logs: pm2 logs"
echo "3. Check Nginx status: sudo systemctl status nginx"
echo "4. Test your application"
echo ""

