# 🚀 Automated VPS Deployment Guide

## Quick Start

### Deploy to VPS (One Command)

```bash
./scripts/deploy-to-vps.sh
```

This script will:
1. ✅ Build Next.js locally
2. ✅ Sync files to VPS (excluding node_modules, .git, etc.)
3. ✅ Install dependencies on VPS
4. ✅ Run Prisma migrations
5. ✅ Stop old `azteka-api` process (if exists)
6. ✅ Start new `azteka-nextjs` PM2 process
7. ✅ Verify deployment
8. ✅ Check Nginx configuration

---

## Port Allocation

| Port | App | Process Name | Status |
|------|-----|--------------|--------|
| **3000** | Alessa Ordering | alessa-ordering | ✅ Running |
| **3002** | Azteka DSD (Next.js) | azteka-nextjs | ✅ **This deployment** |
| **3003-3009** | Available | - | 🟢 Free |

**Note:** Port 3002 replaces the old `azteka-api` Express/Vite build.

---

## Manual Deployment Steps

If you prefer to deploy manually:

### 1. Build Locally

```bash
npm run build:next
```

### 2. Sync to VPS

```bash
rsync -avz \
  --exclude 'node_modules' \
  --exclude '.next' \
  --exclude '.git' \
  ./ root@77.243.85.8:/srv/azteka-dsd/
```

### 3. SSH to VPS

```bash
ssh root@77.243.85.8
cd /srv/azteka-dsd
```

### 4. Install & Setup

```bash
# Install dependencies
npm install --legacy-peer-deps

# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma migrate deploy

# Create directories
mkdir -p logs public/uploads/products public/uploads/bundles
```

### 5. Start with PM2

```bash
# Stop old process (if exists)
pm2 stop azteka-api || true
pm2 delete azteka-api || true

# Start new process
pm2 start ecosystem.nextjs.config.cjs

# Save PM2 config
pm2 save
```

---

## PM2 Management

### View Status

```bash
ssh root@77.243.85.8 "pm2 list"
```

### View Logs

```bash
ssh root@77.243.85.8 "pm2 logs azteka-nextjs"
```

### Restart

```bash
ssh root@77.243.85.8 "pm2 restart azteka-nextjs"
```

### Monitor

```bash
ssh root@77.243.85.8 "pm2 monit"
```

---

## Nginx Configuration

The deployment script checks Nginx configuration. If you need to update it manually:

```bash
ssh root@77.243.85.8
nano /etc/nginx/sites-available/azteka-dsd
```

Ensure it has:

```nginx
location / {
    proxy_pass http://127.0.0.1:3002;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection 'upgrade';
    proxy_set_header Host $host;
    proxy_cache_bypass $http_upgrade;
}

location /api/ {
    proxy_pass http://127.0.0.1:3002/api/;
    proxy_http_version 1.1;
    proxy_set_header Host $host;
}
```

Then reload:

```bash
nginx -t
systemctl reload nginx
```

---

## Troubleshooting

### Port Already in Use

If port 3002 is already in use:

```bash
# Check what's using it
ssh root@77.243.85.8 "lsof -iTCP:3002 -sTCP:LISTEN"

# Stop conflicting process
ssh root@77.243.85.8 "pm2 stop <process-name>"
```

### PM2 Process Not Starting

```bash
# Check logs
ssh root@77.243.85.8 "pm2 logs azteka-nextjs --lines 50"

# Check if .next directory exists
ssh root@77.243.85.8 "ls -la /srv/azteka-dsd/.next"

# Rebuild on VPS
ssh root@77.243.85.8 "cd /srv/azteka-dsd && npm run build:next"
```

### Database Connection Issues

```bash
# Test database connection
ssh root@77.243.85.8 "cd /srv/azteka-dsd && npx prisma db pull"

# Regenerate Prisma client
ssh root@77.243.85.8 "cd /srv/azteka-dsd && npx prisma generate"
```

### Nginx 502 Bad Gateway

```bash
# Check if app is running
ssh root@77.243.85.8 "pm2 list | grep azteka-nextjs"

# Check if port is listening
ssh root@77.243.85.8 "lsof -iTCP:3002 -sTCP:LISTEN"

# Test app directly
ssh root@77.243.85.8 "curl http://localhost:3002/api/warehouse/print-slip"
```

---

## Environment Variables

Ensure `.env.production` exists on VPS with:

```env
DATABASE_URL="postgresql://azteka_user:PASSWORD@localhost:5432/azteka_dsd?schema=public"
NODE_ENV=production
PORT=3002
JWT_SECRET="your-secret-key"
```

---

## Safety Features

The deployment script:

- ✅ **Checks SSH access** before starting
- ✅ **Builds locally** first (catches errors early)
- ✅ **Excludes unnecessary files** (node_modules, .git, etc.)
- ✅ **Stops old process** before starting new one
- ✅ **Verifies deployment** after completion
- ✅ **Doesn't touch other apps** (only manages azteka-nextjs)

---

## Production URLs

After deployment:

- **Main App:** https://aztekafoods.com
- **API Base:** https://aztekafoods.com/api
- **Health Check:** https://aztekafoods.com/api/warehouse/print-slip (GET)

---

## Next Steps After Deployment

1. **Test the application:**
   ```bash
   curl https://aztekafoods.com/api/warehouse/print-slip
   ```

2. **Check logs:**
   ```bash
   ssh root@77.243.85.8 "pm2 logs azteka-nextjs --lines 100"
   ```

3. **Test warehouse print:**
   - Create an order
   - Verify auto-print triggers
   - Check print queue

4. **Monitor performance:**
   ```bash
   ssh root@77.243.85.8 "pm2 monit"
   ```

---

**Last Updated:** $(date +%Y-%m-%d)
**Status:** ✅ Ready for Production Deployment

