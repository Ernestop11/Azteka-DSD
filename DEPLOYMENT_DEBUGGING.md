# Deployment Debugging Guide (PostgreSQL Version)

**Updated:** November 8, 2025
**Status:** Post-Supabase Migration

---

## ⚠️ IMPORTANT: Supabase Has Been Removed

This app **no longer uses Supabase**. It now runs on **PostgreSQL + Express + Prisma**.

### Old Environment Variables (DEPRECATED)
```bash
❌ VITE_SUPABASE_URL          # No longer needed
❌ VITE_SUPABASE_ANON_KEY     # No longer needed
```

### New Environment Variables (REQUIRED)
```bash
✅ VITE_API_URL=/api           # Frontend API base URL
✅ DATABASE_URL=postgresql://...  # Backend database connection
```

---

## Quick Health Check

Run this on your VPS to check if everything is working:

```bash
ssh root@77.243.85.8 "
  echo '🔍 Health Check'
  echo '=============='
  echo ''

  # 1. Check frontend build
  ls -lh /srv/azteka-dsd/dist/index.html && echo '✅ Frontend build exists' || echo '❌ Build missing'

  # 2. Check backend process
  pm2 list | grep azteka-api

  # 3. Check database
  PGPASSWORD='8jzL7PwAKwvNHZyBydKPImCnj' psql -U azteka_user -d azteka_dsd -h localhost -c 'SELECT COUNT(*) FROM \"Product\";'

  # 4. Check API health
  curl -s http://localhost:3002/api/health | jq .

  # 5. Check products API
  curl -s http://localhost:3002/api/products | jq '. | length'

  # 6. Check HTTPS
  curl -I https://aztekafoods.com 2>/dev/null | head -3
"
```

**Expected Output:**
```
✅ Frontend build exists
✅ azteka-api online (PM2)
✅ 5 products in database
✅ API health: {"status":"ok"}
✅ 5 products available
✅ HTTPS: 200 OK
```

---

## Common Issues After Migration

### 1. ❌ "Failed to fetch" / Network Errors

**Cause:** Frontend can't reach backend API

**Check:**
```bash
# Is backend running?
ssh root@77.243.85.8 "pm2 list"

# Is port 3002 open?
ssh root@77.243.85.8 "lsof -i:3002"

# Are API calls working?
curl https://aztekafoods.com/api/health
curl https://aztekafoods.com/api/products
```

**Fix:**
```bash
# Restart backend
ssh root@77.243.85.8 "pm2 restart azteka-api"

# Check logs
ssh root@77.243.85.8 "pm2 logs azteka-api --lines 50"
```

---

### 2. ❌ Database Connection Errors

**Cause:** PostgreSQL not running or wrong credentials

**Check:**
```bash
ssh root@77.243.85.8 "
  # Is PostgreSQL running?
  systemctl status postgresql

  # Can we connect?
  PGPASSWORD='8jzL7PwAKwvNHZyBydKPImCnj' psql -U azteka_user -d azteka_dsd -h localhost -c '\dt'
"
```

**Fix:**
```bash
# Start PostgreSQL
ssh root@77.243.85.8 "systemctl start postgresql"

# Check .env file
ssh root@77.243.85.8 "cd /srv/azteka-dsd && cat .env | grep DATABASE_URL"
```

---

### 3. ❌ "Module not found" / Import Errors

**Cause:** Frontend still trying to import from Supabase

**Check browser console** (F12) for errors like:
```
Cannot find module './lib/supabase'
```

**This should NOT happen** - we removed all Supabase imports. If you see this:

```bash
# Check for remaining Supabase imports
cd /Users/ernestoponce/dev/azteka-dsd
grep -r "from.*supabase" src --include="*.tsx" --include="*.ts"

# Should only find src/lib/supabase.ts (which we deleted)
```

**Fix:**
```bash
# Rebuild frontend
npm run build

# Redeploy
./deploy-frontend.sh
```

---

### 4. ❌ Empty Product List / No Data

**Cause:** Database tables empty or API not returning data

**Check:**
```bash
ssh root@77.243.85.8 "
  # How many products?
  PGPASSWORD='8jzL7PwAKwvNHZyBydKPImCnj' psql -U azteka_user -d azteka_dsd -h localhost -c 'SELECT COUNT(*) FROM \"Product\";'

  # What does API return?
  curl -s http://localhost:3002/api/products | jq .
"
```

**Fix:** Reseed database
```bash
ssh root@77.243.85.8 "cd /srv/azteka-dsd && npm run db:seed"
```

---

### 5. ❌ Nginx 502 Bad Gateway

**Cause:** Backend not running or Nginx can't reach it

**Check:**
```bash
ssh root@77.243.85.8 "
  # Is backend running?
  pm2 list

  # Is port 3002 listening?
  lsof -i:3002

  # Check nginx error log
  tail -20 /var/log/nginx/error.log
"
```

**Fix:**
```bash
# Restart backend
ssh root@77.243.85.8 "pm2 restart azteka-api"

# Restart nginx
ssh root@77.243.85.8 "systemctl restart nginx"
```

---

### 6. ❌ CORS Errors

**Cause:** Backend rejecting requests from frontend domain

**Check backend logs:**
```bash
ssh root@77.243.85.8 "pm2 logs azteka-api --lines 50 | grep CORS"
```

**Fix:** Check `server.mjs` CORS configuration:
```javascript
// Should have:
app.use(cors({
  origin: 'https://aztekafoods.com',
  credentials: true
}));
```

---

## Environment Files Checklist

### Frontend (`.env.production.local`)
```bash
VITE_API_URL=/api
VITE_NODE_ENV=production
```

### Backend (`.env`)
```bash
DATABASE_URL="postgresql://azteka_user:password@localhost:5432/azteka_dsd?schema=public"
SHADOW_DATABASE_URL="postgresql://azteka_user:password@localhost:5432/azteka_dsd_shadow?schema=public"
PORT=3002
CORS_ORIGIN=https://aztekafoods.com
JWT_SECRET=your-secret-key
OPENAI_API_KEY=sk-...
```

---

## Deployment Workflow

### 1. Build Frontend Locally
```bash
cd /Users/ernestoponce/dev/azteka-dsd
npm run build
```

### 2. Deploy to VPS
```bash
# Option A: Use deploy script
./deploy-frontend.sh

# Option B: Manual copy
scp -r dist/* root@77.243.85.8:/srv/azteka-dsd/dist/
ssh root@77.243.85.8 "systemctl reload nginx"
```

### 3. Update Backend (if needed)
```bash
# Copy server files
scp server.mjs root@77.243.85.8:/srv/azteka-dsd/
scp -r routes root@77.243.85.8:/srv/azteka-dsd/

# Restart backend
ssh root@77.243.85.8 "pm2 restart azteka-api"
```

### 4. Run Database Migrations (if needed)
```bash
# Copy migration files
scp -r prisma root@77.243.85.8:/srv/azteka-dsd/

# Apply migrations
ssh root@77.243.85.8 "cd /srv/azteka-dsd && npx prisma migrate deploy"

# Regenerate Prisma Client
ssh root@77.243.85.8 "cd /srv/azteka-dsd && npx prisma generate"
```

---

## File Structure on VPS

```
/srv/azteka-dsd/
├── dist/                    # Frontend build
│   ├── index.html
│   ├── assets/
│   └── ...
├── server.mjs              # Express backend
├── routes/                 # API routes
│   ├── products.js
│   ├── orders.js
│   └── ...
├── prisma/
│   ├── schema.prisma
│   └── migrations/
├── .env                    # Backend environment variables
├── .env.production.local   # Frontend environment variables
├── package.json
└── node_modules/
```

---

## Nginx Configuration

**Location:** `/etc/nginx/sites-enabled/aztekafoods.com`

**Key sections:**
```nginx
server {
    listen 443 ssl;
    server_name aztekafoods.com www.aztekafoods.com;

    # SSL certificates
    ssl_certificate /etc/letsencrypt/live/aztekafoods.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/aztekafoods.com/privkey.pem;

    # Serve frontend static files
    root /srv/azteka-dsd/dist;
    index index.html;

    # Proxy API requests to backend
    location /api/ {
        proxy_pass http://localhost:3002/api/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # Frontend routing (SPA)
    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

---

## Logs to Check

### Backend Logs
```bash
pm2 logs azteka-api --lines 100
```

### Nginx Access Logs
```bash
tail -f /var/log/nginx/access.log
```

### Nginx Error Logs
```bash
tail -f /var/log/nginx/error.log
```

### PostgreSQL Logs
```bash
tail -f /var/log/postgresql/postgresql-*.log
```

---

## Database Management

### Connect to Database
```bash
ssh root@77.243.85.8
PGPASSWORD='8jzL7PwAKwvNHZyBydKPImCnj' psql -U azteka_user -d azteka_dsd -h localhost
```

### Useful SQL Commands
```sql
-- List all tables
\dt

-- Count products
SELECT COUNT(*) FROM "Product";

-- View recent orders
SELECT * FROM "Order" ORDER BY "createdAt" DESC LIMIT 10;

-- Check database size
SELECT pg_size_pretty(pg_database_size('azteka_dsd'));
```

### Backup Database
```bash
ssh root@77.243.85.8 "
  PGPASSWORD='8jzL7PwAKwvNHZyBydKPImCnj' pg_dump -U azteka_user -d azteka_dsd -h localhost > /root/azteka_backup_\$(date +%Y%m%d).sql
"
```

---

## Performance Monitoring

### PM2 Monitoring
```bash
ssh root@77.243.85.8 "pm2 monit"
```

### System Resources
```bash
ssh root@77.243.85.8 "
  echo 'CPU & Memory:'
  top -bn1 | head -15

  echo ''
  echo 'Disk Usage:'
  df -h
"
```

---

## Emergency Recovery

### If Everything Breaks

1. **Stop services:**
   ```bash
   ssh root@77.243.85.8 "pm2 stop azteka-api && systemctl stop nginx"
   ```

2. **Check database:**
   ```bash
   ssh root@77.243.85.8 "systemctl status postgresql"
   ```

3. **Redeploy from scratch:**
   ```bash
   cd /Users/ernestoponce/dev/azteka-dsd
   npm run build
   ./deploy-frontend.sh
   ssh root@77.243.85.8 "pm2 restart azteka-api && systemctl start nginx"
   ```

4. **Check logs:**
   ```bash
   ssh root@77.243.85.8 "pm2 logs azteka-api --err"
   ```

---

## Current System Status

**Last Verified:** November 8, 2025

✅ **Frontend:** https://aztekafoods.com
✅ **Backend API:** https://aztekafoods.com/api
✅ **Database:** PostgreSQL (21 tables)
✅ **SSL:** Valid (Let's Encrypt)
✅ **Migration:** Supabase → PostgreSQL (Complete)

---

## Contact & Support

**Check system health:**
```bash
ssh root@77.243.85.8 "/root/health.sh"
```

**View recent deployment logs:**
```bash
ssh root@77.243.85.8 "tail -20 /root/DEPLOY_LOG.txt"
```

---

**Note:** This guide assumes the Supabase → PostgreSQL migration has been completed (November 8, 2025). If you're seeing references to Supabase in your code, the migration may not have been fully deployed.
