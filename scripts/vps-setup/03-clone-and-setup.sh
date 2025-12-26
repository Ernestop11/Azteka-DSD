#!/bin/bash
#===============================================================================
# AZTEKA DSD - CLONE AND SETUP (Step 3 of 5)
# Run AFTER adding SSH key to GitHub
#===============================================================================

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}=============================================${NC}"
echo -e "${BLUE}  AZTEKA DSD - Clone and Setup${NC}"
echo -e "${BLUE}=============================================${NC}"
echo ""

# Load database credentials
if [ -f /root/.azteka-db-credentials ]; then
    source /root/.azteka-db-credentials
else
    echo -e "${RED}Database credentials not found. Run 02-database-setup.sh first.${NC}"
    exit 1
fi

#---------------------------------------
# Step 1: Clone repository
#---------------------------------------
echo -e "${YELLOW}[1/6] Cloning repository...${NC}"

cd /srv
if [ -d "azteka-dsd/.git" ]; then
    echo "Repository already exists, pulling latest..."
    cd azteka-dsd
    git pull origin bolt-visual-stable
else
    # Accept GitHub's host key automatically
    ssh-keyscan github.com >> ~/.ssh/known_hosts 2>/dev/null

    git clone git@github.com:ErnestoPonce/azteka-dsd.git azteka-dsd
    cd azteka-dsd
    git checkout bolt-visual-stable
fi
echo -e "${GREEN}✓ Repository cloned${NC}"

#---------------------------------------
# Step 2: Create production .env
#---------------------------------------
echo -e "${YELLOW}[2/6] Creating environment file...${NC}"

cat > /srv/azteka-dsd/.env << EOF
# AZTEKA DSD - PRODUCTION ENVIRONMENT
# Generated: $(date)

# Database
DATABASE_URL="${PRODUCTION_URL}"

# App
NODE_ENV=production
NEXT_PUBLIC_API_URL=https://aztekafoods.com

# Auth (generate new secrets for production!)
JWT_SECRET=$(openssl rand -base64 32)
SESSION_SECRET=$(openssl rand -base64 32)

# Image upload (direct to this server)
UPLOAD_DIR=/srv/azteka-dsd/public/uploads
MAX_FILE_SIZE=10485760

# Optional: OpenAI for AI features
# OPENAI_API_KEY=sk-...
EOF

chmod 600 /srv/azteka-dsd/.env
echo -e "${GREEN}✓ Environment file created${NC}"

#---------------------------------------
# Step 3: Install dependencies
#---------------------------------------
echo -e "${YELLOW}[3/6] Installing npm dependencies...${NC}"
cd /srv/azteka-dsd
npm ci --production=false
echo -e "${GREEN}✓ Dependencies installed${NC}"

#---------------------------------------
# Step 4: Generate Prisma client
#---------------------------------------
echo -e "${YELLOW}[4/6] Setting up Prisma...${NC}"
npx prisma generate
echo -e "${GREEN}✓ Prisma client generated${NC}"

#---------------------------------------
# Step 5: Run database migrations
#---------------------------------------
echo -e "${YELLOW}[5/6] Running database migrations...${NC}"
npx prisma migrate deploy
echo -e "${GREEN}✓ Migrations applied${NC}"

#---------------------------------------
# Step 6: Build Next.js
#---------------------------------------
echo -e "${YELLOW}[6/6] Building Next.js app...${NC}"
npm run build:next
echo -e "${GREEN}✓ Build complete${NC}"

echo ""
echo -e "${BLUE}=============================================${NC}"
echo -e "${GREEN}  STEP 3 COMPLETE!${NC}"
echo -e "${BLUE}=============================================${NC}"
echo ""
echo "Next: Run ./04-nginx-ssl-setup.sh"
echo ""
