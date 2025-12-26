#!/bin/bash
#===============================================================================
# AZTEKA DSD - DATABASE SETUP (Step 2 of 5)
# Run AFTER 01-initial-setup.sh
#===============================================================================

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}=============================================${NC}"
echo -e "${BLUE}  AZTEKA DSD - Database Setup${NC}"
echo -e "${BLUE}=============================================${NC}"
echo ""

# Generate secure password
DB_PASSWORD=$(openssl rand -base64 24 | tr -dc 'a-zA-Z0-9' | head -c 24)

echo -e "${YELLOW}[1/4] Creating PostgreSQL user and database...${NC}"

sudo -u postgres psql << EOF
-- Create user
CREATE USER azteka_user WITH PASSWORD '${DB_PASSWORD}';

-- Create production database
CREATE DATABASE azteka_production OWNER azteka_user;

-- Create staging database
CREATE DATABASE azteka_staging OWNER azteka_user;

-- Grant privileges
GRANT ALL PRIVILEGES ON DATABASE azteka_production TO azteka_user;
GRANT ALL PRIVILEGES ON DATABASE azteka_staging TO azteka_user;

-- Enable UUID extension
\c azteka_production
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
\c azteka_staging
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
EOF

echo -e "${GREEN}✓ Databases created${NC}"

#---------------------------------------
# Step 2: Save credentials securely
#---------------------------------------
echo -e "${YELLOW}[2/4] Saving credentials...${NC}"

cat > /root/.azteka-db-credentials << EOF
# AZTEKA DATABASE CREDENTIALS
# Generated: $(date)
# KEEP THIS FILE SECURE!

DB_USER=azteka_user
DB_PASSWORD=${DB_PASSWORD}
DB_HOST=localhost
DB_PORT=5432

# Production
PRODUCTION_DB=azteka_production
PRODUCTION_URL="postgresql://azteka_user:${DB_PASSWORD}@localhost:5432/azteka_production"

# Staging
STAGING_DB=azteka_staging
STAGING_URL="postgresql://azteka_user:${DB_PASSWORD}@localhost:5432/azteka_staging"
EOF

chmod 600 /root/.azteka-db-credentials
echo -e "${GREEN}✓ Credentials saved to /root/.azteka-db-credentials${NC}"

#---------------------------------------
# Step 3: Configure PostgreSQL for local connections
#---------------------------------------
echo -e "${YELLOW}[3/4] Configuring PostgreSQL...${NC}"

# Allow password authentication for local connections
PG_HBA=$(find /etc/postgresql -name "pg_hba.conf" | head -1)
if [ -n "$PG_HBA" ]; then
    # Backup original
    cp "$PG_HBA" "${PG_HBA}.backup"

    # Add our user authentication (before the default rules)
    sed -i '/^local.*all.*all.*peer/i local   azteka_production   azteka_user                     md5' "$PG_HBA"
    sed -i '/^local.*all.*all.*peer/i local   azteka_staging      azteka_user                     md5' "$PG_HBA"

    systemctl restart postgresql
    echo -e "${GREEN}✓ PostgreSQL configured${NC}"
fi

#---------------------------------------
# Step 4: Test connection
#---------------------------------------
echo -e "${YELLOW}[4/4] Testing database connection...${NC}"

PGPASSWORD="${DB_PASSWORD}" psql -h localhost -U azteka_user -d azteka_production -c "SELECT 1 as test;" > /dev/null 2>&1
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Database connection successful${NC}"
else
    echo -e "${RED}✗ Database connection failed${NC}"
    exit 1
fi

echo ""
echo -e "${BLUE}=============================================${NC}"
echo -e "${GREEN}  STEP 2 COMPLETE!${NC}"
echo -e "${BLUE}=============================================${NC}"
echo ""
echo -e "${YELLOW}IMPORTANT - Save these credentials:${NC}"
echo ""
echo "Production DATABASE_URL:"
echo -e "${GREEN}postgresql://azteka_user:${DB_PASSWORD}@localhost:5432/azteka_production${NC}"
echo ""
echo "Staging DATABASE_URL:"
echo -e "${GREEN}postgresql://azteka_user:${DB_PASSWORD}@localhost:5432/azteka_staging${NC}"
echo ""
echo "Credentials also saved to: /root/.azteka-db-credentials"
echo ""
echo "Next: Run ./03-clone-and-setup.sh"
echo ""
