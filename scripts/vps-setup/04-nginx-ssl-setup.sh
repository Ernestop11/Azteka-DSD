#!/bin/bash
#===============================================================================
# AZTEKA DSD - NGINX & SSL SETUP (Step 4 of 5)
# Run AFTER 03-clone-and-setup.sh
#===============================================================================

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}=============================================${NC}"
echo -e "${BLUE}  AZTEKA DSD - Nginx & SSL Setup${NC}"
echo -e "${BLUE}=============================================${NC}"
echo ""

# Get domain from user
read -p "Enter your domain (e.g., aztekafoods.com): " DOMAIN
if [ -z "$DOMAIN" ]; then
    DOMAIN="aztekafoods.com"
fi

echo ""
echo -e "${YELLOW}Setting up for domain: ${DOMAIN}${NC}"
echo ""

#---------------------------------------
# Step 1: Install Certbot
#---------------------------------------
echo -e "${YELLOW}[1/4] Installing Certbot...${NC}"
apt install -y certbot python3-certbot-nginx
echo -e "${GREEN}✓ Certbot installed${NC}"

#---------------------------------------
# Step 2: Create Nginx config
#---------------------------------------
echo -e "${YELLOW}[2/4] Creating Nginx configuration...${NC}"

cat > /etc/nginx/sites-available/azteka << EOF
# AZTEKA DSD - Production
# Domain: ${DOMAIN}

# Rate limiting
limit_req_zone \$binary_remote_addr zone=api:10m rate=10r/s;
limit_req_zone \$binary_remote_addr zone=general:10m rate=30r/s;

# Upstream for Next.js
upstream azteka_nextjs {
    server 127.0.0.1:3000;
    keepalive 64;
}

# Redirect HTTP to HTTPS
server {
    listen 80;
    listen [::]:80;
    server_name ${DOMAIN} www.${DOMAIN};

    location /.well-known/acme-challenge/ {
        root /var/www/certbot;
    }

    location / {
        return 301 https://\$server_name\$request_uri;
    }
}

# HTTPS server
server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name ${DOMAIN} www.${DOMAIN};

    # SSL certificates (will be created by certbot)
    ssl_certificate /etc/letsencrypt/live/${DOMAIN}/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/${DOMAIN}/privkey.pem;

    # SSL settings
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_prefer_server_ciphers on;
    ssl_ciphers ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384;
    ssl_session_timeout 1d;
    ssl_session_cache shared:SSL:50m;
    ssl_stapling on;
    ssl_stapling_verify on;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_proxied any;
    gzip_comp_level 6;
    gzip_types text/plain text/css text/xml application/json application/javascript application/rss+xml application/atom+xml image/svg+xml;

    # Max upload size (for images)
    client_max_body_size 20M;

    # Static files - serve directly
    location /_next/static {
        alias /srv/azteka-dsd/.next/static;
        expires 365d;
        access_log off;
        add_header Cache-Control "public, immutable";
    }

    # Public uploads - serve directly with cache
    location /uploads {
        alias /srv/azteka-dsd/public/uploads;
        expires 30d;
        access_log off;
        add_header Cache-Control "public";
    }

    # Public assets
    location /icons {
        alias /srv/azteka-dsd/public/icons;
        expires 30d;
        access_log off;
    }

    location /manifest.json {
        alias /srv/azteka-dsd/public/manifest.json;
        add_header Cache-Control "no-cache";
    }

    location /sw.js {
        alias /srv/azteka-dsd/public/sw.js;
        add_header Cache-Control "no-cache";
    }

    # API routes - rate limited
    location /api {
        limit_req zone=api burst=20 nodelay;
        proxy_pass http://azteka_nextjs;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
        proxy_read_timeout 60s;
    }

    # Next.js app
    location / {
        limit_req zone=general burst=50 nodelay;
        proxy_pass http://azteka_nextjs;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }
}
EOF

echo -e "${GREEN}✓ Nginx configuration created${NC}"

#---------------------------------------
# Step 3: Enable site and test config
#---------------------------------------
echo -e "${YELLOW}[3/4] Enabling Nginx site...${NC}"

# Remove default site
rm -f /etc/nginx/sites-enabled/default

# Enable azteka site
ln -sf /etc/nginx/sites-available/azteka /etc/nginx/sites-enabled/

# Create certbot webroot
mkdir -p /var/www/certbot

# Test nginx config (without SSL first)
# Create temporary config without SSL for initial certbot
cat > /etc/nginx/sites-available/azteka-temp << EOF
server {
    listen 80;
    server_name ${DOMAIN} www.${DOMAIN};

    location /.well-known/acme-challenge/ {
        root /var/www/certbot;
    }

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
    }
}
EOF

ln -sf /etc/nginx/sites-available/azteka-temp /etc/nginx/sites-enabled/azteka
nginx -t && systemctl reload nginx
echo -e "${GREEN}✓ Nginx enabled (HTTP only for now)${NC}"

#---------------------------------------
# Step 4: Get SSL certificate
#---------------------------------------
echo -e "${YELLOW}[4/4] Obtaining SSL certificate...${NC}"
echo ""
echo -e "${YELLOW}IMPORTANT: Make sure your domain DNS points to this server's IP!${NC}"
echo ""
read -p "Press Enter when DNS is ready, or Ctrl+C to skip SSL for now..."

certbot --nginx -d ${DOMAIN} -d www.${DOMAIN} --non-interactive --agree-tos --email admin@${DOMAIN} || {
    echo -e "${YELLOW}SSL setup skipped or failed. You can run certbot manually later:${NC}"
    echo "certbot --nginx -d ${DOMAIN} -d www.${DOMAIN}"
}

# Switch to full config with SSL
ln -sf /etc/nginx/sites-available/azteka /etc/nginx/sites-enabled/azteka
rm -f /etc/nginx/sites-available/azteka-temp
nginx -t && systemctl reload nginx

echo -e "${GREEN}✓ SSL configured${NC}"

# Set up auto-renewal
systemctl enable certbot.timer
systemctl start certbot.timer

echo ""
echo -e "${BLUE}=============================================${NC}"
echo -e "${GREEN}  STEP 4 COMPLETE!${NC}"
echo -e "${BLUE}=============================================${NC}"
echo ""
echo "Next: Run ./05-pm2-and-finish.sh"
echo ""
