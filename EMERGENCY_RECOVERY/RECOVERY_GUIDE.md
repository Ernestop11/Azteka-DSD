# AZTEKA DSD - EMERGENCY RECOVERY GUIDE
## NewVPS-v1 Backup - December 27, 2025

---

## CRITICAL INFO

### VPS Server
- **Host**: 72.62.162.163 (Hostinger KVM2)
- **Domain**: aztekafoods.com
- **SSH**: `ssh root@72.62.162.163`
- **App Path**: `/srv/azteka-dsd`
- **PM2 Process**: `azteka-production` (port 3000)

### Database
- **Type**: PostgreSQL 16
- **Database**: `azteka_production`
- **User**: `azteka_user`
- **Password**: `b7vjMFB7OhrUBxYc0C4i2gGD`
- **Connection**: `postgresql://azteka_user:b7vjMFB7OhrUBxYc0C4i2gGD@localhost:5432/azteka_production`

### SSL Certificate
- **Provider**: Let's Encrypt
- **Cert Path**: `/etc/letsencrypt/live/aztekafoods.com/`
- **Renewal**: `certbot renew`

---

## TECH STACK

### Frontend
- **Framework**: Next.js 14.2.33
- **UI**: React 18, TailwindCSS 3.4.1
- **State**: TanStack React Query
- **Components**: Radix UI, Lucide Icons

### Backend
- **Runtime**: Node.js (via Next.js API routes)
- **ORM**: Prisma 6.19.0
- **Database**: PostgreSQL 16
- **Image Processing**: Sharp, rembg (Python)

### Infrastructure
- **Web Server**: nginx (reverse proxy)
- **Process Manager**: PM2
- **OS**: Ubuntu 24.04 LTS

### Key Dependencies
```json
{
  "next": "14.2.33",
  "react": "^18.3.1",
  "prisma": "^6.19.0",
  "@prisma/client": "^6.19.0",
  "sharp": "^0.33.5",
  "node-ssh": "^13.2.1",
  "@tanstack/react-query": "^5.79.0"
}
```

---

## APPLICATION FLOW

### Image Upload Flow
1. User uploads via `/admin/inventory-seed` or `/admin/products`
2. API processes with Sharp (resize, optimize)
3. `lib/services/vpsUpload.ts` uploads directly to VPS via SSH
4. File saved to: `/srv/azteka-dsd/public/uploads/products/{id}.png`
5. Database updated with URL + cache bust param

### Background Removal Flow
1. User clicks "Remove BG" button
2. API at `/api/products/background-removal` triggered
3. Python rembg (in `.venv`) processes image with alpha matting
4. Result uploaded to VPS and DB updated

### Authentication Flow
1. Login via `/auth/login` or `/api/auth/login`
2. Session stored in cookies
3. Middleware validates session on protected routes
4. Roles: SUPER_ADMIN, ADMIN, SALES_REP, EMPLOYEE

---

## BACKUP CONTENTS

This backup (`NewVPS-v1-COMPLETE.tar.gz`) contains:

1. **database.sql** - Full PostgreSQL dump
   - Products: 688
   - Customers: 11
   - Categories, Brands, Orders, etc.

2. **images.tar.gz** - All uploaded images
   - Product images: 383 files
   - Brand logos, category images, etc.

3. **credentials.txt** - Database credentials

4. **env.txt** - Environment variables

---

## RECOVERY PROCEDURES

### Full Server Recovery (New VPS)

```bash
# 1. Setup new Ubuntu 24.04 server
ssh root@NEW_IP

# 2. Install dependencies
apt update && apt upgrade -y
apt install -y nginx postgresql postgresql-contrib nodejs npm certbot python3-certbot-nginx python3.12-venv

# 3. Setup PostgreSQL
sudo -u postgres psql
CREATE USER azteka_user WITH PASSWORD 'b7vjMFB7OhrUBxYc0C4i2gGD';
CREATE DATABASE azteka_production OWNER azteka_user;
GRANT ALL PRIVILEGES ON DATABASE azteka_production TO azteka_user;
\q

# 4. Restore database
psql -U azteka_user -d azteka_production < database.sql

# 5. Clone repository
cd /srv
git clone https://github.com/Ernestop11/Azteka-DSD.git azteka-dsd
cd azteka-dsd

# 6. Restore images
tar -xzf images.tar.gz -C public/

# 7. Install Node dependencies
npm install --legacy-peer-deps

# 8. Setup Python environment
python3 -m venv .venv
source .venv/bin/activate
pip install rembg Pillow onnxruntime

# 9. Setup environment
cp env.txt .env
npx prisma generate

# 10. Build and start
npm run build:next
npm install -g pm2
pm2 start npm --name azteka-production -- run start
pm2 save

# 11. Configure nginx (see nginx config below)
# 12. Setup SSL
certbot --nginx -d aztekafoods.com -d www.aztekafoods.com
```

### Database Only Recovery

```bash
# On VPS
PGPASSWORD=b7vjMFB7OhrUBxYc0C4i2gGD psql -h localhost -U azteka_user -d azteka_production < database.sql
```

### Images Only Recovery

```bash
# On VPS
tar -xzf images.tar.gz -C /srv/azteka-dsd/public/
```

---

## NGINX CONFIGURATION

```nginx
upstream azteka_nextjs {
    server 127.0.0.1:3000;
    keepalive 64;
}

server {
    server_name aztekafoods.com www.aztekafoods.com;

    location /uploads/ {
        alias /srv/azteka-dsd/public/uploads/;
        expires 30d;
        add_header Cache-Control "public, immutable";
        try_files $uri =404;
    }

    location / {
        proxy_pass http://azteka_nextjs;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    listen 443 ssl;
    ssl_certificate /etc/letsencrypt/live/aztekafoods.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/aztekafoods.com/privkey.pem;
}

server {
    listen 80;
    server_name aztekafoods.com www.aztekafoods.com;
    return 301 https://$host$request_uri;
}
```

---

## USEFUL COMMANDS

```bash
# SSH to VPS
ssh root@72.62.162.163

# Check app status
pm2 status azteka-production

# View logs
pm2 logs azteka-production --lines 100

# Restart app
pm2 restart azteka-production

# Deploy from git
cd /srv/azteka-dsd && git pull && npm run build:next && pm2 restart azteka-production

# Database access
PGPASSWORD=b7vjMFB7OhrUBxYc0C4i2gGD psql -h localhost -U azteka_user -d azteka_production

# Create backup
/usr/local/bin/azteka-backup

# Check image count
ls /srv/azteka-dsd/public/uploads/products/*.png | wc -l
```

---

## CONTACTS / SUPPORT

- **Domain Registrar**: (update with your info)
- **VPS Provider**: Hostinger
- **GitHub Repo**: github.com/Ernestop11/Azteka-DSD
- **Branch**: bolt-visual-stable

---

**Last Updated**: December 27, 2025
**Backup Version**: NewVPS-v1
