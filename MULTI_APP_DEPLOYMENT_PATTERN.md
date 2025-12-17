# 🔧 Multi-App VPS Deployment Pattern

This document describes the exact pattern used to successfully deploy Azteka DSD alongside other apps on the same VPS. Follow this pattern for deploying any Node.js app.

## 📋 Prerequisites

- VPS with Node.js, PM2, Nginx, PostgreSQL installed
- Port assigned from PORT_ALLOCATION.md
- Domain pointing to VPS IP

---

## 🎯 The Fix: Environment Variables with Absolute Paths

### Problem We Solved

PM2 doesn't load `.env` files correctly with relative paths when using ES modules. The key fix was **using absolute paths** in the server code.

### Solution

Add this code at the top of your `server.mjs` or `server.js`:

```javascript
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// For ES modules - get __dirname equivalent
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables with absolute paths for PM2 compatibility
dotenv.config({ path: join(__dirname, '.env.production') });
dotenv.config({ path: join(__dirname, '.env') }); // Fallback
```

**For CommonJS** (if your project uses `require` instead of `import`):

```javascript
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '.env.production') });
dotenv.config({ path: path.join(__dirname, '.env') }); // Fallback
```

---

## 📝 Step-by-Step Deployment Commands

### 1. **Create .env.production File**

```bash
# On VPS, navigate to your app directory
cd /srv/your-app-name

# Create .env.production with your assigned port
cat > .env.production <<'EOF'
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/database_name?schema=public"

# Server Configuration - USE YOUR ASSIGNED PORT FROM PORT_ALLOCATION.md
PORT=3003  # Example: Change this to your assigned port
NODE_ENV=production
CORS_ORIGIN=https://yourdomain.com

# Authentication
JWT_SECRET="$(openssl rand -base64 48)"

# Add other app-specific environment variables here
EOF

# Create symlink (optional, but good for compatibility)
ln -sf /srv/your-app-name/.env.production /srv/your-app-name/.env
```

### 2. **Create PM2 Ecosystem Config**

```bash
cd /srv/your-app-name

# Create ecosystem.config.cjs (use .cjs for ES module projects)
cat > ecosystem.config.cjs <<'EOF'
module.exports = {
  apps: [{
    name: 'your-app-name',
    script: '/srv/your-app-name/server.mjs',  // or server.js
    cwd: '/srv/your-app-name',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    error_file: '/srv/your-app-name/logs/pm2-error.log',
    out_file: '/srv/your-app-name/logs/pm2-out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    merge_logs: true
  }]
};
EOF

# Create logs directory
mkdir -p /srv/your-app-name/logs
```

**⚠️ Important:**
- Use `.cjs` extension if your `package.json` has `"type": "module"`
- Use `.js` extension if using CommonJS (no type field or `"type": "commonjs"`)
- **DO NOT** include an `env` block in the config - it interferes with dotenv loading

### 3. **Start App with PM2**

```bash
cd /srv/your-app-name

# Delete old process if exists
pm2 delete your-app-name || true

# Start with ecosystem config
pm2 start ecosystem.config.cjs

# Save PM2 configuration
pm2 save --force

# Verify it's running on correct port
pm2 logs your-app-name --lines 20
```

### 4. **Configure Nginx (Multi-App Pattern)**

```bash
# Create nginx config WITHOUT default_server
cat > /etc/nginx/sites-available/your-app-name <<'EOF'
# Your App Production Configuration
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;

    # Redirect HTTP to HTTPS
    return 301 https://$server_name$request_uri;
}

# HTTPS Configuration
server {
    listen 443 ssl http2;
    server_name yourdomain.com www.yourdomain.com;

    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;

    root /srv/your-app-name/dist;
    index index.html;

    # Serve static files
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Proxy API requests to backend - USE YOUR ASSIGNED PORT
    location /api/ {
        proxy_pass http://127.0.0.1:3003/api/;  # ⚠️ CHANGE PORT HERE
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Proxy WebSocket connections - USE YOUR ASSIGNED PORT
    location /socket.io/ {
        proxy_pass http://127.0.0.1:3003/socket.io/;  # ⚠️ CHANGE PORT HERE
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
    }

    client_max_body_size 50M;
    access_log /var/log/nginx/your-app-name.access.log;
    error_log  /var/log/nginx/your-app-name.error.log;
}
EOF

# Enable site
ln -sf /etc/nginx/sites-available/your-app-name /etc/nginx/sites-enabled/

# Test nginx config
nginx -t

# Reload nginx
systemctl reload nginx
```

**⚠️ Critical:** Do NOT add `default_server` when running multiple apps

### 5. **Setup SSL Certificate (if needed)**

```bash
# Install SSL certificate
certbot --nginx -d yourdomain.com -d www.yourdomain.com

# Test SSL renewal
certbot renew --dry-run
```

### 6. **Verification Commands**

```bash
# 1. Check backend is running on correct port
curl http://127.0.0.1:3003/health  # Replace 3003 with your port

# 2. Check PM2 status
pm2 status

# 3. Check logs confirm correct port
pm2 logs your-app-name --lines 30 | grep "listening"

# 4. Check nginx routing
curl -I http://yourdomain.com/
curl -I https://yourdomain.com/

# 5. Check API endpoint
curl -X POST http://localhost:3003/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test"}'

# 6. View nginx logs
tail -f /var/log/nginx/your-app-name.access.log
tail -f /var/log/nginx/your-app-name.error.log
```

---

## 🗂️ Port Allocation Reference

Based on PORT_ALLOCATION.md:

| Port | App Name | Status |
|------|----------|--------|
| 3000 | alessa-ordering | Used |
| 3001 | switchmenu-api | Used |
| 3002 | azteka-api | Used |
| 3003-3009 | Available | Free |

**Always check PORT_ALLOCATION.md before assigning a new port!**

---

## 🎯 Quick Deployment Checklist

For each new app:

- [ ] Assign unique port from PORT_ALLOCATION.md
- [ ] Update server code with absolute path dotenv loading
- [ ] Create `.env.production` with assigned PORT
- [ ] Create `ecosystem.config.cjs` with correct paths
- [ ] Create logs directory: `mkdir -p logs`
- [ ] Start with PM2: `pm2 start ecosystem.config.cjs`
- [ ] Verify port in logs: `pm2 logs app-name | grep listening`
- [ ] Create nginx config with correct port (NO `default_server`)
- [ ] Test nginx: `nginx -t`
- [ ] Reload nginx: `systemctl reload nginx`
- [ ] Test endpoints with curl
- [ ] Save PM2: `pm2 save`
- [ ] Update PORT_ALLOCATION.md

---

## 🔧 Common Issues & Fixes

### Issue 1: PM2 loads 0 environment variables

**Symptom:** Logs show `[dotenv] injecting env (0) from .env`

**Fix:** Ensure server code uses absolute paths:

```javascript
// ❌ WRONG - Relative path
dotenv.config({ path: '.env.production' });

// ✅ CORRECT - Absolute path
const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: join(__dirname, '.env.production') });
```

### Issue 2: App runs on wrong port

**Symptom:** Backend listens on port 4000 or 5177 instead of assigned port

**Fix:**
1. Verify `.env.production` has `PORT=3003` (your port)
2. Check server code loads `.env.production` with absolute path
3. Remove any `env` blocks from `ecosystem.config.cjs`

### Issue 3: Nginx 502 Bad Gateway

**Symptom:** Nginx returns 502 error

**Fix:**
1. Check backend is running: `pm2 status`
2. Verify port matches in nginx config and backend
3. Test backend directly: `curl http://localhost:3003/health`
4. Check nginx error logs: `tail -f /var/log/nginx/your-app-name.error.log`

### Issue 4: Database connection fails

**Symptom:** `Authentication failed against database server`

**Fix:**
1. Verify `DATABASE_URL` in `.env.production` has correct password
2. Test connection: `psql -U username -d database -h localhost`
3. Check database credentials in `/root/app-credentials.txt`

### Issue 5: Multiple apps conflict

**Symptom:** Wrong app serves requests for a domain

**Fix:**
1. Remove `default_server` from all nginx configs
2. Ensure each domain has unique `server_name`
3. Test nginx config: `nginx -t`
4. Reload nginx: `systemctl reload nginx`

---

## 📊 Monitoring Commands

```bash
# View all running apps
pm2 list

# View specific app logs
pm2 logs your-app-name

# Monitor in real-time
pm2 monit

# Restart app
pm2 restart your-app-name

# View app details
pm2 show your-app-name

# Check nginx status
systemctl status nginx

# View nginx logs
tail -f /var/log/nginx/your-app-name.access.log
tail -f /var/log/nginx/your-app-name.error.log

# Check database
systemctl status postgresql
sudo -u postgres psql -d your_database -c "SELECT COUNT(*) FROM users;"
```

---

## 🔄 Regular Updates

To deploy updates to an existing app:

```bash
# From LOCAL machine, sync files
rsync -avz --exclude 'node_modules' --exclude 'dist' --exclude '.git' \
  ./ root@YOUR_VPS_IP:/srv/your-app-name/

# On VPS, rebuild and restart
ssh root@YOUR_VPS_IP
cd /srv/your-app-name
npm install --legacy-peer-deps  # If needed
npm run build
pm2 restart your-app-name
```

---

## 💾 Complete Example: Deploying "myapp"

Here's a complete example deploying an app called "myapp" on port 3004:

```bash
# 1. On VPS, create .env.production
cat > /srv/myapp/.env.production <<'EOF'
DATABASE_URL="postgresql://myapp_user:password123@localhost:5432/myapp_db"
PORT=3004
NODE_ENV=production
CORS_ORIGIN=https://myapp.com
JWT_SECRET="$(openssl rand -base64 48)"
EOF

# 2. Create ecosystem config
cat > /srv/myapp/ecosystem.config.cjs <<'EOF'
module.exports = {
  apps: [{
    name: 'myapp',
    script: '/srv/myapp/server.mjs',
    cwd: '/srv/myapp',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    error_file: '/srv/myapp/logs/pm2-error.log',
    out_file: '/srv/myapp/logs/pm2-out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    merge_logs: true
  }]
};
EOF

# 3. Create logs dir
mkdir -p /srv/myapp/logs

# 4. Update server.mjs to use absolute paths (see "The Fix" section above)

# 5. Start with PM2
cd /srv/myapp
pm2 start ecosystem.config.cjs
pm2 save

# 6. Create nginx config
cat > /etc/nginx/sites-available/myapp <<'EOF'
server {
    listen 80;
    server_name myapp.com www.myapp.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name myapp.com www.myapp.com;

    ssl_certificate /etc/letsencrypt/live/myapp.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/myapp.com/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;

    root /srv/myapp/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /api/ {
        proxy_pass http://127.0.0.1:3004/api/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
    }

    access_log /var/log/nginx/myapp.access.log;
    error_log  /var/log/nginx/myapp.error.log;
}
EOF

# 7. Enable and test
ln -sf /etc/nginx/sites-available/myapp /etc/nginx/sites-enabled/
nginx -t
systemctl reload nginx

# 8. Setup SSL
certbot --nginx -d myapp.com -d www.myapp.com

# 9. Verify
curl -I https://myapp.com/
pm2 logs myapp --lines 20
```

---

## 🎓 Key Lessons Learned from Azteka DSD Deployment

1. **Absolute paths are essential** - PM2 doesn't work well with relative `.env` paths in ES modules
2. **Remove env blocks** - Don't use `env: {}` in ecosystem config, it interferes with dotenv
3. **One port per app** - Strictly follow port allocation to avoid conflicts
4. **No default_server** - When running multiple apps, never use `default_server` in nginx
5. **Test locally first** - Always `curl http://localhost:PORT/health` before testing externally
6. **Symlinks optional** - `.env` symlink to `.env.production` isn't necessary with absolute paths
7. **File extension matters** - Use `.cjs` for CommonJS files in ES module projects

---

## 📞 Troubleshooting Workflow

When deployment fails, follow this sequence:

```bash
# 1. Check if process is running
pm2 status

# 2. Check logs for errors
pm2 logs your-app-name --lines 50

# 3. Verify environment variables are loading
pm2 logs your-app-name | grep "injecting env"
# Should show: "injecting env (N) from .env.production" where N > 0

# 4. Test backend directly
curl http://localhost:YOUR_PORT/health

# 5. Check nginx error logs
tail -50 /var/log/nginx/your-app-name.error.log

# 6. Test nginx config
nginx -t

# 7. Check database connection
psql -U your_user -d your_database -h localhost

# 8. Full restart
pm2 restart your-app-name
systemctl reload nginx
```

---

**Created:** 2025-11-07
**Based on:** Successful deployment of Azteka DSD on VPS 77.243.85.8
**Tested with:** Node.js 20.x, PM2, Nginx, PostgreSQL
