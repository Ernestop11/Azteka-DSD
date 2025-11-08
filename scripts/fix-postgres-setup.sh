#!/usr/bin/env bash
# Fix PostgreSQL setup for Azteka DSD

set -euo pipefail

echo "=========================================="
echo "Fixing PostgreSQL Setup"
echo "=========================================="

# Generate a random password
DB_PASSWORD=$(openssl rand -base64 32 | tr -d "=+/" | cut -c1-25)

echo "🗄️ Setting up PostgreSQL database..."

# Create database and user using sudo (no password needed)
sudo -u postgres psql <<EOF
-- Drop if exists (for clean setup)
DROP DATABASE IF EXISTS azteka_dsd;
DROP USER IF EXISTS azteka_user;

-- Create database
CREATE DATABASE azteka_dsd;

-- Create user
CREATE USER azteka_user WITH ENCRYPTED PASSWORD '$DB_PASSWORD';

-- Grant privileges
GRANT ALL PRIVILEGES ON DATABASE azteka_dsd TO azteka_user;
ALTER DATABASE azteka_dsd OWNER TO azteka_user;
EOF

echo "✅ Database 'azteka_dsd' created"
echo "✅ User 'azteka_user' created"

# Connect to database and grant schema permissions
sudo -u postgres psql -d azteka_dsd <<EOF
GRANT ALL ON SCHEMA public TO azteka_user;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO azteka_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO azteka_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO azteka_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO azteka_user;
EOF

echo "✅ Schema permissions granted"

# Configure PostgreSQL for local connections
PG_VERSION=$(ls /etc/postgresql/ | head -n1)
PG_HBA="/etc/postgresql/$PG_VERSION/main/pg_hba.conf"

# Backup original
cp "$PG_HBA" "${PG_HBA}.backup"

# Add configuration if not exists
if ! grep -q "azteka_dsd.*azteka_user" "$PG_HBA"; then
    echo "# Azteka DSD configuration" >> "$PG_HBA"
    echo "local   azteka_dsd      azteka_user                     md5" >> "$PG_HBA"
    echo "host    azteka_dsd      azteka_user     127.0.0.1/32    md5" >> "$PG_HBA"
    echo "host    azteka_dsd      azteka_user     ::1/128         md5" >> "$PG_HBA"
    systemctl restart postgresql
    echo "✅ PostgreSQL configured for local access"
fi

echo "📁 Creating application directories..."
mkdir -p /srv/azteka-dsd/uploads/invoices
mkdir -p /srv/azteka-dsd/uploads/products
mkdir -p /srv/azteka-dsd/backups
mkdir -p /srv/azteka-dsd/reports
chmod -R 755 /srv/azteka-dsd/uploads
chmod -R 755 /srv/azteka-dsd/backups
chmod -R 755 /srv/azteka-dsd/reports

echo "✅ Application directories created"

echo "📝 Creating .env.production file..."
cat > /srv/azteka-dsd/.env.production <<ENVEOF
# Production Environment Configuration
# Database
DATABASE_URL="postgresql://azteka_user:${DB_PASSWORD}@localhost:5432/azteka_dsd?schema=public"
SHADOW_DATABASE_URL="postgresql://azteka_user:${DB_PASSWORD}@localhost:5432/azteka_dsd?schema=public"

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

echo "✅ .env.production created"

echo "🔐 Saving credentials..."
cat > /root/azteka-credentials.txt <<CREDEOF
========================================
Azteka DSD - Database Credentials
========================================
Database: azteka_dsd
User: azteka_user
Password: $DB_PASSWORD

CONNECTION STRING:
postgresql://azteka_user:$DB_PASSWORD@localhost:5432/azteka_dsd

Test connection:
PGPASSWORD='$DB_PASSWORD' psql -h localhost -U azteka_user -d azteka_dsd

IMPORTANT: Keep this file secure!
Location: /root/azteka-credentials.txt
========================================
CREDEOF

chmod 600 /root/azteka-credentials.txt

echo ""
echo "=========================================="
echo "✅ PostgreSQL Setup Complete!"
echo "=========================================="
echo ""
echo "📋 Database credentials saved to:"
echo "   /root/azteka-credentials.txt"
echo ""
echo "🧪 Test database connection:"
echo "   PGPASSWORD='$DB_PASSWORD' psql -h localhost -U azteka_user -d azteka_dsd -c 'SELECT version();'"
echo ""
echo "📝 Environment file created at:"
echo "   /srv/azteka-dsd/.env.production"
echo ""
echo "🚀 Next: Sync files and run deployment"
echo "=========================================="
