#!/usr/bin/env bash
# Azteka DSD - VPS Initial Setup Script
# Run this on a fresh Ubuntu VPS to prepare for deployment

set -euo pipefail

echo "=========================================="
echo "Azteka DSD - VPS Initial Setup"
echo "=========================================="
echo ""

# Check if running as root
if [[ $EUID -ne 0 ]]; then
   echo "This script must be run as root (use sudo)"
   exit 1
fi

echo "📦 Step 1: Updating system packages..."
apt update && apt upgrade -y

echo "📦 Step 2: Installing Node.js 18..."
if ! command -v node &> /dev/null; then
    curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
    apt install -y nodejs
fi
echo "✅ Node.js version: $(node --version)"
echo "✅ npm version: $(npm --version)"

echo "📦 Step 3: Installing PostgreSQL..."
if ! command -v psql &> /dev/null; then
    apt install -y postgresql postgresql-contrib
fi
systemctl enable postgresql
systemctl start postgresql
echo "✅ PostgreSQL installed and running"

echo "📦 Step 4: Installing PM2..."
if ! command -v pm2 &> /dev/null; then
    npm install -g pm2
fi
echo "✅ PM2 version: $(pm2 --version)"

echo "📦 Step 5: Installing Nginx..."
if ! command -v nginx &> /dev/null; then
    apt install -y nginx
fi
systemctl enable nginx
systemctl start nginx
echo "✅ Nginx installed and running"

echo "📦 Step 6: Installing Certbot (SSL)..."
if ! command -v certbot &> /dev/null; then
    apt install -y certbot python3-certbot-nginx
fi
echo "✅ Certbot installed"

echo "📦 Step 7: Configuring Firewall (UFW)..."
if ! command -v ufw &> /dev/null; then
    apt install -y ufw
fi
ufw --force enable
ufw allow 22/tcp    # SSH
ufw allow 80/tcp    # HTTP
ufw allow 443/tcp   # HTTPS
ufw allow 5432/tcp  # PostgreSQL (local only)
echo "✅ Firewall configured"

echo "🗄️ Step 8: Setting up PostgreSQL database..."

# Generate a random password
DB_PASSWORD=$(openssl rand -base64 32 | tr -d "=+/" | cut -c1-25)

# Create database and user
sudo -u postgres psql <<EOF
-- Create database
CREATE DATABASE azteka_dsd;

-- Create user
CREATE USER azteka_user WITH ENCRYPTED PASSWORD '$DB_PASSWORD';

-- Grant privileges
GRANT ALL PRIVILEGES ON DATABASE azteka_dsd TO azteka_user;
ALTER DATABASE azteka_dsd OWNER TO azteka_user;

-- Connect to database and grant schema permissions
\c azteka_dsd
GRANT ALL ON SCHEMA public TO azteka_user;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO azteka_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO azteka_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO azteka_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO azteka_user;
EOF

echo "✅ Database 'azteka_dsd' created"
echo "✅ User 'azteka_user' created with password"

# Configure PostgreSQL for local connections
PG_VERSION=$(ls /etc/postgresql/)
PG_HBA="/etc/postgresql/$PG_VERSION/main/pg_hba.conf"

if ! grep -q "azteka_dsd.*azteka_user" "$PG_HBA"; then
    echo "local   azteka_dsd      azteka_user                     md5" >> "$PG_HBA"
    systemctl restart postgresql
    echo "✅ PostgreSQL configured for local access"
fi

echo "📁 Step 9: Creating application directory..."
mkdir -p /srv/azteka-dsd
mkdir -p /srv/azteka-dsd/uploads/invoices
mkdir -p /srv/azteka-dsd/uploads/products
mkdir -p /srv/azteka-dsd/backups
mkdir -p /srv/azteka-dsd/reports

echo "✅ Application directories created"

echo "📝 Step 10: Creating .env.production file..."
cat > /srv/azteka-dsd/.env.production <<ENVEOF
# Production Environment Configuration
# Database
DATABASE_URL="postgresql://azteka_user:${DB_PASSWORD}@localhost:5432/azteka_dsd?schema=public"
SHADOW_DATABASE_URL="postgresql://azteka_user:${DB_PASSWORD}@localhost:5432/azteka_dsd_shadow?schema=public"

# Server Configuration
PORT=4000
NODE_ENV=production
CORS_ORIGIN=https://aztekafoods.com

# Authentication (CHANGE THIS IN PRODUCTION!)
JWT_SECRET="$(openssl rand -base64 48)"

# AI Services (Add your keys here)
OPENAI_API_KEY=""
OPENAI_VISION_MODEL="gpt-4o"

# Image Processing (Add your key here)
REMOVE_BG_KEY=""

# Notifications (Add your credentials here)
TWILIO_ACCOUNT_SID=""
TWILIO_AUTH_TOKEN=""
TWILIO_PHONE_NUMBER=""

# Email (Add your SMTP credentials here)
SMTP_HOST=""
SMTP_PORT=587
SMTP_USER=""
SMTP_PASSWORD=""
SMTP_FROM_EMAIL="noreply@aztekafoods.com"
ENVEOF

echo "✅ .env.production created with secure credentials"

echo "🔐 Step 11: Saving credentials..."
cat > /root/azteka-credentials.txt <<CREDEOF
========================================
Azteka DSD - Database Credentials
========================================
Database: azteka_dsd
User: azteka_user
Password: $DB_PASSWORD

CONNECTION STRING:
postgresql://azteka_user:$DB_PASSWORD@localhost:5432/azteka_dsd

IMPORTANT: Keep this file secure!
Location: /root/azteka-credentials.txt
========================================
CREDEOF

chmod 600 /root/azteka-credentials.txt

echo ""
echo "=========================================="
echo "✅ VPS Setup Complete!"
echo "=========================================="
echo ""
echo "📋 Next Steps:"
echo ""
echo "1. Review credentials:"
echo "   cat /root/azteka-credentials.txt"
echo ""
echo "2. Add API keys to .env.production:"
echo "   nano /srv/azteka-dsd/.env.production"
echo ""
echo "3. From your LOCAL machine, sync files:"
echo "   rsync -avz --exclude 'node_modules' --exclude '.git' --exclude 'dist' \\"
echo "     ./ root@77.243.85.8:/srv/azteka-dsd/"
echo ""
echo "4. Back on VPS, run deployment:"
echo "   cd /srv/azteka-dsd"
echo "   bash scripts/deploy.sh"
echo ""
echo "5. Setup SSL certificate:"
echo "   certbot --nginx -d aztekafoods.com -d www.aztekafoods.com"
echo ""
echo "=========================================="
