#!/bin/bash
#===============================================================================
# AZTEKA DSD - VPS INITIAL SETUP (Step 1 of 5)
# Run this FIRST on a fresh Ubuntu 22.04/24.04 VPS
#===============================================================================

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}=============================================${NC}"
echo -e "${BLUE}  AZTEKA DSD - VPS Initial Setup${NC}"
echo -e "${BLUE}=============================================${NC}"
echo ""

# Check if running as root
if [ "$EUID" -ne 0 ]; then
    echo -e "${RED}Please run as root (sudo)${NC}"
    exit 1
fi

#---------------------------------------
# Step 1: System Update
#---------------------------------------
echo -e "${YELLOW}[1/8] Updating system packages...${NC}"
apt update && apt upgrade -y
echo -e "${GREEN}✓ System updated${NC}"

#---------------------------------------
# Step 2: Install essential packages
#---------------------------------------
echo -e "${YELLOW}[2/8] Installing essential packages...${NC}"
apt install -y \
    curl \
    wget \
    git \
    build-essential \
    software-properties-common \
    apt-transport-https \
    ca-certificates \
    gnupg \
    lsb-release \
    ufw \
    fail2ban \
    htop \
    unzip \
    nginx
echo -e "${GREEN}✓ Essential packages installed${NC}"

#---------------------------------------
# Step 3: Install Node.js 20 LTS
#---------------------------------------
echo -e "${YELLOW}[3/8] Installing Node.js 20 LTS...${NC}"
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs
npm install -g npm@latest
echo -e "${GREEN}✓ Node.js $(node -v) installed${NC}"

#---------------------------------------
# Step 4: Install PM2
#---------------------------------------
echo -e "${YELLOW}[4/8] Installing PM2...${NC}"
npm install -g pm2
pm2 startup systemd -u root --hp /root
echo -e "${GREEN}✓ PM2 installed${NC}"

#---------------------------------------
# Step 5: Install PostgreSQL 16
#---------------------------------------
echo -e "${YELLOW}[5/8] Installing PostgreSQL 16...${NC}"
sh -c 'echo "deb http://apt.postgresql.org/pub/repos/apt $(lsb_release -cs)-pgdg main" > /etc/apt/sources.list.d/pgdg.list'
wget --quiet -O - https://www.postgresql.org/media/keys/ACCC4CF8.asc | apt-key add -
apt update
apt install -y postgresql-16 postgresql-contrib-16
systemctl enable postgresql
systemctl start postgresql
echo -e "${GREEN}✓ PostgreSQL 16 installed${NC}"

#---------------------------------------
# Step 6: Configure Firewall
#---------------------------------------
echo -e "${YELLOW}[6/8] Configuring firewall...${NC}"
ufw default deny incoming
ufw default allow outgoing
ufw allow ssh
ufw allow http
ufw allow https
ufw --force enable
echo -e "${GREEN}✓ Firewall configured${NC}"

#---------------------------------------
# Step 7: Create directory structure
#---------------------------------------
echo -e "${YELLOW}[7/8] Creating directory structure...${NC}"
mkdir -p /srv/azteka-dsd
mkdir -p /srv/azteka-staging
mkdir -p /srv/azteka-backups/images
mkdir -p /srv/azteka-backups/database
mkdir -p /var/log/azteka
echo -e "${GREEN}✓ Directories created${NC}"

#---------------------------------------
# Step 8: Set up SSH key (if not exists)
#---------------------------------------
echo -e "${YELLOW}[8/8] SSH key setup...${NC}"
if [ ! -f ~/.ssh/id_ed25519 ]; then
    ssh-keygen -t ed25519 -f ~/.ssh/id_ed25519 -N ""
    echo -e "${GREEN}✓ SSH key generated${NC}"
    echo ""
    echo -e "${YELLOW}Add this SSH key to GitHub:${NC}"
    cat ~/.ssh/id_ed25519.pub
    echo ""
else
    echo -e "${GREEN}✓ SSH key already exists${NC}"
fi

echo ""
echo -e "${BLUE}=============================================${NC}"
echo -e "${GREEN}  STEP 1 COMPLETE!${NC}"
echo -e "${BLUE}=============================================${NC}"
echo ""
echo "Next steps:"
echo "1. Add the SSH key above to GitHub (Settings > SSH Keys)"
echo "2. Run: ./02-database-setup.sh"
echo ""
