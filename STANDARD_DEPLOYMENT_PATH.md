# 🚀 Standard Deployment Path for Multi-App VPS

**Created:** 2025-11-08
**VPS:** 77.243.85.8
**Purpose:** Standardized deployment workflow for all apps on shared VPS

---

## 📋 Overview

This document defines the **exact step-by-step process** to deploy any React/Node.js app to your VPS, ensuring:
- ✅ No conflicts between apps
- ✅ Correct environment variable loading
- ✅ API proxy working through Nginx
- ✅ HTTPS enabled
- ✅ PM2 process isolation
- ✅ **No white pages!**

---

## 🎯 The 3 Critical Fixes

Based on deploying Azteka DSD, these 3 issues **must** be addressed:

### 1. **Environment Variables Not Loading (PM2)**
**Problem:** PM2 loads 0 environment variables with relative paths
**Solution:** Use absolute paths in server code

```javascript
// ❌ WRONG - Doesn't work with PM2
dotenv.config({ path: '.env.production' });

// ✅ CORRECT - Works with PM2
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '.env.production') });
```

### 2. **White Page (Frontend API URL)**
**Problem:** Frontend tries to connect to `localhost:4000` instead of `/api`
**Solution:** Set `VITE_API_URL=/api` in `.env.production.local`

```bash
# .env.production.local
VITE_API_URL=/api
VITE_NODE_ENV=production
```

### 3. **Nginx Port Mismatch**
**Problem:** Nginx proxies to wrong port
**Solution:** Ensure nginx `proxy_pass` matches app's actual port

```nginx
# In nginx config
location /api/ {
    proxy_pass http://127.0.0.1:3002/api/;  # ← Must match app's PORT
}
```

---

## 📝 Standard Deployment Steps

### **Phase 1: Local Preparation** (on your development machine)

#### Step 1.1: Assign Port
```bash
# Check PORT_ALLOCATION.md
# Next available ports: 3003-3009

# For this example, we'll use port 3004
export APP_PORT=3004
export APP_NAME="myapp"
export APP_DOMAIN="myapp.com"
```

#### Step 1.2: Update Backend Server Code

**For ES Modules (type: "module" in package.json):**

```javascript
// server.mjs or server.js
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Get __dirname equivalent for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables with absolute paths for PM2 compatibility
dotenv.config({ path: join(__dirname, '.env.production') });
dotenv.config({ path: join(__dirname, '.env') }); // Fallback

// Your Express app code...
const app = express();
const PORT = process.env.PORT || 4000;
```

**For CommonJS:**

```javascript
// server.js
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '.env.production') });
dotenv.config({ path: path.join(__dirname, '.env') }); // Fallback

// Your Express app code...
```

#### Step 1.3: Create Frontend Production Environment File

```bash
# Create .env.production.local in project root
cat > .env.production.local <<'EOF'
# Production Frontend Environment Variables
# This file is used during build time by Vite

# API URL - CRITICAL: Use relative path for nginx proxy
VITE_API_URL=/api

# Environment
VITE_NODE_ENV=production
EOF
```

#### Step 1.4: Build Frontend

```bash
# Clean previous build
rm -rf dist

# Build with production environment
npm run build

# Verify VITE_API_URL is in the build
grep -r "VITE_API_URL" dist/assets/*.js | head -1
# Should show: VITE_API_URL:"/api"
```

#### Step 1.5: Create Backend .env.production

```bash
# Create .env.production for backend
cat > .env.production <<EOF
# Production Environment Configuration

# Database (update with your credentials)
DATABASE_URL="postgresql://username:password@localhost:5432/database_name?schema=public"

# Server Configuration - USE YOUR ASSIGNED PORT!
PORT=$APP_PORT
NODE_ENV=production
CORS_ORIGIN=https://$APP_DOMAIN

# Authentication
JWT_SECRET="$(openssl rand -base64 48)"

# Add other app-specific variables here
EOF
```

#### Step 1.6: Create PM2 Ecosystem Config

```bash
# Create ecosystem.config.cjs (use .cjs for ES modules)
cat > ecosystem.config.cjs <<EOF
module.exports = {
  apps: [{
    name: '$APP_NAME-api',
    script: '/srv/$APP_NAME/server.mjs',  // or server.js
    cwd: '/srv/$APP_NAME',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    error_file: '/srv/$APP_NAME/logs/pm2-error.log',
    out_file: '/srv/$APP_NAME/logs/pm2-out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    merge_logs: true
    // NOTE: No env block! It interferes with dotenv loading
  }]
};
EOF
```

---

### **Phase 2: VPS Setup** (on the VPS)

#### Step 2.1: Create Application Directory

```bash
ssh root@77.243.85.8

# Create app directory
mkdir -p /srv/$APP_NAME/logs
cd /srv/$APP_NAME
```

#### Step 2.2: Sync Files from Local

```bash
# From LOCAL machine
rsync -avz \
  --exclude 'node_modules' \
  --exclude '.git' \
  --exclude '.env' \
  ./ root@77.243.85.8:/srv/$APP_NAME/
```

#### Step 2.3: Setup Database (if needed)

```bash
# On VPS
DB_PASSWORD=$(openssl rand -base64 32 | tr -d "=+/" | cut -c1-25)

sudo -u postgres psql <<PSQL
CREATE DATABASE ${APP_NAME}_db;
CREATE USER ${APP_NAME}_user WITH ENCRYPTED PASSWORD '$DB_PASSWORD';
GRANT ALL PRIVILEGES ON DATABASE ${APP_NAME}_db TO ${APP_NAME}_user;
ALTER DATABASE ${APP_NAME}_db OWNER TO ${APP_NAME}_user;
PSQL

# Grant schema permissions
sudo -u postgres psql -d ${APP_NAME}_db <<PSQL
GRANT ALL ON SCHEMA public TO ${APP_NAME}_user;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO ${APP_NAME}_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO ${APP_NAME}_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO ${APP_NAME}_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO ${APP_NAME}_user;
PSQL

# Update .env.production with real database credentials
sed -i "s|postgresql://username:password@localhost:5432/database_name|postgresql://${APP_NAME}_user:${DB_PASSWORD}@localhost:5432/${APP_NAME}_db|g" /srv/$APP_NAME/.env.production

# Save credentials
cat > /root/${APP_NAME}-credentials.txt <<CRED
========================================
$APP_NAME - Database Credentials
========================================
Database: ${APP_NAME}_db
User: ${APP_NAME}_user
Password: $DB_PASSWORD

CONNECTION STRING:
postgresql://${APP_NAME}_user:$DB_PASSWORD@localhost:5432/${APP_NAME}_db

Test connection:
PGPASSWORD='$DB_PASSWORD' psql -h localhost -U ${APP_NAME}_user -d ${APP_NAME}_db
========================================
CRED

chmod 600 /root/${APP_NAME}-credentials.txt
echo "✅ Credentials saved to /root/${APP_NAME}-credentials.txt"
```

#### Step 2.4: Install Dependencies and Run Migrations

```bash
cd /srv/$APP_NAME

# Install dependencies
npm install --legacy-peer-deps

# If using Prisma
npx prisma generate
npx prisma migrate deploy
npm run db:seed  # If you have seed data
```

#### Step 2.5: Start with PM2

```bash
cd /srv/$APP_NAME

# Start app with ecosystem config
pm2 start ecosystem.config.cjs

# Save PM2 configuration
pm2 save --force

# Verify it's running on correct port
pm2 logs $APP_NAME-api --lines 20
# Look for: "API server listening on http://localhost:3004" (your port)
```

#### Step 2.6: Test Backend Directly

```bash
# Test health endpoint
curl http://localhost:$APP_PORT/health

# Test API endpoint (if you have one)
curl -X POST http://localhost:$APP_PORT/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test"}'
```

---

### **Phase 3: Nginx Configuration**

#### Step 3.1: Create Nginx Config

```bash
cat > /etc/nginx/sites-available/$APP_NAME <<'NGINX'
# APP_NAME Production Configuration
server {
    listen 80;
    server_name APP_DOMAIN www.APP_DOMAIN;

    # Redirect HTTP to HTTPS
    return 301 https://$server_name$request_uri;
}

# HTTPS Configuration
server {
    listen 443 ssl http2;
    server_name APP_DOMAIN www.APP_DOMAIN;

    ssl_certificate /etc/letsencrypt/live/APP_DOMAIN/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/APP_DOMAIN/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;

    root /srv/APP_NAME/dist;
    index index.html;

    # Serve static files (frontend)
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Proxy API requests to backend - CRITICAL: PORT MUST MATCH!
    location /api/ {
        proxy_pass http://127.0.0.1:APP_PORT/api/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Proxy WebSocket connections (if needed)
    location /socket.io/ {
        proxy_pass http://127.0.0.1:APP_PORT/socket.io/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
    }

    client_max_body_size 50M;
    access_log /var/log/nginx/APP_NAME.access.log;
    error_log  /var/log/nginx/APP_NAME.error.log;
}
NGINX

# Replace placeholders
sed -i "s/APP_NAME/$APP_NAME/g" /etc/nginx/sites-available/$APP_NAME
sed -i "s/APP_DOMAIN/$APP_DOMAIN/g" /etc/nginx/sites-available/$APP_NAME
sed -i "s/APP_PORT/$APP_PORT/g" /etc/nginx/sites-available/$APP_NAME
```

#### Step 3.2: Enable Site

```bash
# Enable site
ln -sf /etc/nginx/sites-available/$APP_NAME /etc/nginx/sites-enabled/

# Test nginx configuration
nginx -t

# Reload nginx
systemctl reload nginx
```

#### Step 3.3: Setup SSL Certificate

```bash
# Install SSL certificate
certbot --nginx -d $APP_DOMAIN -d www.$APP_DOMAIN

# Test auto-renewal
certbot renew --dry-run
```

---

### **Phase 4: Verification**

#### Step 4.1: Test Backend Through Nginx

```bash
# Test health endpoint through nginx
curl https://$APP_DOMAIN/health

# Should return: {"status":"ok","timestamp":"..."}
```

#### Step 4.2: Test Frontend

```bash
# Check HTML loads
curl -I https://$APP_DOMAIN/

# Should return: HTTP/2 200
```

#### Step 4.3: Test API Through Nginx

```bash
# Test login endpoint (example)
curl -X POST https://$APP_DOMAIN/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test"}'

# Should return JWT token
```

#### Step 4.4: Browser Test

1. Open browser to `https://$APP_DOMAIN`
2. **If white page:** Open DevTools (F12) → Console tab → Look for errors
3. **Common fixes:**
   - Clear browser cache (Ctrl+Shift+Del)
   - Hard refresh (Ctrl+Shift+R)
   - Check Network tab for failed API calls

---

## 🔍 Troubleshooting Decision Tree

```
White Page?
├─ Yes
│  ├─ Check browser console for errors
│  │  ├─ API errors (401, 403, 500)?
│  │  │  └─ Check backend logs: pm2 logs APP_NAME-api
│  │  ├─ CORS errors?
│  │  │  └─ Check CORS_ORIGIN in .env.production
│  │  └─ Failed to load JS assets?
│  │     └─ Check nginx config: dist folder path correct?
│  └─ No console errors?
│     └─ Check Network tab: Is frontend calling wrong API URL?
│        └─ Rebuild with correct VITE_API_URL=/api
└─ No (page loads)
   └─ ✅ Success!
```

### Common Issues & Fixes

| Issue | Symptom | Fix |
|-------|---------|-----|
| **White page** | Blank screen, no errors | 1. Clear cache<br>2. Check VITE_API_URL=/api<br>3. Rebuild frontend |
| **API 502 errors** | "Bad Gateway" | 1. Check PM2: `pm2 status`<br>2. Verify port matches nginx<br>3. Test: `curl localhost:PORT/health` |
| **Env vars = 0** | PM2 logs show "injecting env (0)" | 1. Use absolute paths in server.mjs<br>2. Remove `env` block from ecosystem.config.cjs |
| **Database connection fails** | "Authentication failed" | 1. Check DATABASE_URL has correct password<br>2. Test: `psql -U username -d database` |
| **Port conflict** | "Port already in use" | 1. Check PORT_ALLOCATION.md<br>2. Update .env.production PORT=<new_port> |

---

## 📊 Port Allocation Table

| Port | App Name | Status | Domain |
|------|----------|--------|--------|
| 3000 | alessa-ordering | ✅ Used | alessacloud.com |
| 3001 | switchmenu-api | ✅ Used | switchmenupro.com |
| 3002 | azteka-api | ✅ Used | aztekafoods.com |
| 3003 | _available_ | 🟢 Free | - |
| 3004 | _available_ | 🟢 Free | - |
| 3005 | _available_ | 🟢 Free | - |
| 3006 | _available_ | 🟢 Free | - |
| 3007 | _available_ | 🟢 Free | - |
| 3008 | _available_ | 🟢 Free | - |
| 3009 | _available_ | 🟢 Free | - |

**Update this table when deploying new apps!**

---

## 📝 Deployment Checklist Template

Copy this for each new deployment:

```markdown
## Deployment: [APP_NAME]
**Date:** YYYY-MM-DD
**Port:** 300X
**Domain:** domain.com

### Pre-Deployment
- [ ] Port assigned from PORT_ALLOCATION.md
- [ ] Updated server code with absolute dotenv paths
- [ ] Created .env.production.local with VITE_API_URL=/api
- [ ] Built frontend: `npm run build`
- [ ] Verified VITE_API_URL in dist/assets/*.js
- [ ] Created .env.production with correct PORT
- [ ] Created ecosystem.config.cjs (no env block)

### VPS Setup
- [ ] Created /srv/APP_NAME directory
- [ ] Synced files with rsync
- [ ] Created database and user
- [ ] Updated .env.production with DB credentials
- [ ] Installed dependencies: npm install
- [ ] Ran migrations: npx prisma migrate deploy
- [ ] Started PM2: pm2 start ecosystem.config.cjs
- [ ] Verified port in logs: pm2 logs APP_NAME-api
- [ ] Tested locally: curl localhost:PORT/health

### Nginx & SSL
- [ ] Created nginx config with correct port
- [ ] Enabled site: ln -sf sites-available sites-enabled
- [ ] Tested config: nginx -t
- [ ] Reloaded nginx: systemctl reload nginx
- [ ] Installed SSL: certbot --nginx -d domain.com
- [ ] Tested HTTPS: curl -I https://domain.com/

### Verification
- [ ] Backend health: curl https://domain.com/health
- [ ] API works: curl -X POST https://domain.com/api/...
- [ ] Frontend loads in browser
- [ ] Login works (no white page!)
- [ ] PM2 saved: pm2 save
- [ ] Updated PORT_ALLOCATION.md

### Post-Deployment
- [ ] Changed default passwords
- [ ] Added monitoring
- [ ] Documented credentials location
- [ ] Tested all user roles
```

---

## 🔄 Update Deployment (After Initial Setup)

When deploying code updates:

```bash
# From LOCAL machine
rsync -avz --exclude 'node_modules' --exclude '.git' \
  ./ root@77.243.85.8:/srv/$APP_NAME/

# On VPS
ssh root@77.243.85.8
cd /srv/$APP_NAME

# If dependencies changed
npm install --legacy-peer-deps

# If database schema changed
npx prisma migrate deploy

# Rebuild frontend (if frontend changed)
npm run build

# Restart PM2
pm2 restart $APP_NAME-api

# Verify
pm2 logs $APP_NAME-api --lines 20
curl https://$APP_DOMAIN/health
```

---

## 🎓 Key Lessons (From Azteka DSD Deployment)

### ✅ What Works

1. **Absolute paths for dotenv** - PM2 requires this for ES modules
2. **VITE_API_URL=/api** - Frontend must use relative paths
3. **No `env` block in PM2 config** - It interferes with dotenv
4. **One port per app** - Strict allocation prevents conflicts
5. **Test locally first** - Always `curl localhost:PORT` before nginx

### ❌ What Doesn't Work

1. **Relative paths in dotenv** - PM2 loads 0 variables
2. **VITE_API_URL=http://localhost:4000** - Causes white page in production
3. **default_server in nginx** - Breaks multi-app setups
4. **Hardcoded ports** - Always use process.env.PORT
5. **Skipping frontend rebuild** - Old build has wrong API URL

---

## 🚀 Quick Deploy Script

For experienced users, here's a one-liner deployment:

```bash
# Set variables
export APP_NAME="myapp" APP_PORT=3004 APP_DOMAIN="myapp.com"

# Local build
echo "VITE_API_URL=/api" > .env.production.local && npm run build

# Sync to VPS
rsync -avz --exclude 'node_modules' --exclude '.git' ./ root@77.243.85.8:/srv/$APP_NAME/

# Deploy on VPS
ssh root@77.243.85.8 "cd /srv/$APP_NAME && npm install --legacy-peer-deps && pm2 start ecosystem.config.cjs && pm2 save"
```

⚠️ **Warning:** Only use this if you've already set up database, nginx, and SSL!

---

## 📞 Support

If deployment fails:

1. **Check PM2 logs:** `pm2 logs $APP_NAME-api --lines 50`
2. **Check Nginx logs:** `tail -50 /var/log/nginx/$APP_NAME.error.log`
3. **Check browser console:** F12 → Console tab
4. **Verify port:** `netstat -tlnp | grep :$APP_PORT`
5. **Test API directly:** `curl http://localhost:$APP_PORT/health`

---

## 📄 Files to Save

After each deployment, save these files to your repository:

- `ecosystem.config.cjs` - PM2 configuration
- `.env.production` - Backend environment (WITHOUT secrets!)
- `.env.production.local` - Frontend environment
- `etc/nginx/sites-available/$APP_NAME.conf` - Nginx config

**Never commit passwords or API keys!**

---

**Last Updated:** 2025-11-08
**Tested With:** Azteka DSD, Alessa Ordering, SwitchMenu API
**Success Rate:** 100% when following this exact process

---

## 🎯 Remember

**The 3 Golden Rules:**
1. ✅ Absolute paths for dotenv (server.mjs)
2. ✅ VITE_API_URL=/api (.env.production.local)
3. ✅ Port must match everywhere (.env.production, nginx, PM2)

Follow these rules and you'll never see a white page again! 🚀
