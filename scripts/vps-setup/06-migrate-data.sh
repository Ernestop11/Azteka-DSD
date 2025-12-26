#!/bin/bash
#===============================================================================
# AZTEKA DSD - DATA MIGRATION
# Run this AFTER the new VPS is set up to migrate data from old VPS
#===============================================================================

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Configuration - UPDATE THESE!
OLD_VPS="root@77.243.85.8"
OLD_PATH="/srv/azteka-dsd"
NEW_PATH="/srv/azteka-dsd"

echo -e "${BLUE}=============================================${NC}"
echo -e "${BLUE}  AZTEKA DSD - Data Migration${NC}"
echo -e "${BLUE}=============================================${NC}"
echo ""
echo -e "${YELLOW}This will migrate data from:${NC}"
echo "  Old VPS: ${OLD_VPS}:${OLD_PATH}"
echo "  New VPS: ${NEW_PATH}"
echo ""
read -p "Continue? (y/n) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    exit 1
fi

#---------------------------------------
# Step 1: Backup current state on OLD VPS
#---------------------------------------
echo -e "${YELLOW}[1/4] Creating backup on old VPS...${NC}"
ssh ${OLD_VPS} "cd ${OLD_PATH} && pg_dump -U azteka_user azteka_dsd > /tmp/azteka-migration.sql"
echo -e "${GREEN}✓ Database backup created on old VPS${NC}"

#---------------------------------------
# Step 2: Transfer database dump
#---------------------------------------
echo -e "${YELLOW}[2/4] Transferring database dump...${NC}"
scp ${OLD_VPS}:/tmp/azteka-migration.sql /tmp/azteka-migration.sql
echo -e "${GREEN}✓ Database dump transferred${NC}"

#---------------------------------------
# Step 3: Import database to new VPS
#---------------------------------------
echo -e "${YELLOW}[3/4] Importing database...${NC}"

# Load credentials
source /root/.azteka-db-credentials

# Drop and recreate database (clean slate)
sudo -u postgres psql << EOF
DROP DATABASE IF EXISTS azteka_production;
CREATE DATABASE azteka_production OWNER azteka_user;
\c azteka_production
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
EOF

# Import data
PGPASSWORD="${DB_PASSWORD}" psql -h localhost -U azteka_user -d azteka_production < /tmp/azteka-migration.sql

echo -e "${GREEN}✓ Database imported${NC}"

#---------------------------------------
# Step 4: Transfer images (CAREFULLY!)
#---------------------------------------
echo -e "${YELLOW}[4/4] Transferring images...${NC}"

# Create uploads directory
mkdir -p ${NEW_PATH}/public/uploads/products

# Transfer ONLY real images (>20KB)
echo "Transferring product images from old VPS..."
ssh ${OLD_VPS} "find ${OLD_PATH}/public/uploads/products -type f -size +20k" | while read file; do
    filename=$(basename "$file")
    scp "${OLD_VPS}:${file}" "${NEW_PATH}/public/uploads/products/${filename}"
done

# Count images
IMG_COUNT=$(find ${NEW_PATH}/public/uploads/products -type f | wc -l)
echo -e "${GREEN}✓ Transferred ${IMG_COUNT} images${NC}"

#---------------------------------------
# Rebuild and restart
#---------------------------------------
echo -e "${YELLOW}Rebuilding application...${NC}"
cd ${NEW_PATH}
npx prisma generate
npm run build:next
pm2 restart azteka-production

echo ""
echo -e "${BLUE}=============================================${NC}"
echo -e "${GREEN}  MIGRATION COMPLETE!${NC}"
echo -e "${BLUE}=============================================${NC}"
echo ""
echo "Database rows:"
PGPASSWORD="${DB_PASSWORD}" psql -h localhost -U azteka_user -d azteka_production -c "SELECT COUNT(*) as products FROM \"Product\";"
echo ""
echo "Images: ${IMG_COUNT}"
echo ""
echo "Clean up old files:"
echo "  rm /tmp/azteka-migration.sql"
echo "  ssh ${OLD_VPS} 'rm /tmp/azteka-migration.sql'"
