# ✅ Automated VPS Deployment - READY

## 🚀 Quick Deploy

**One command to deploy everything:**

```bash
npm run deploy
```

Or:

```bash
./scripts/deploy-to-vps.sh
```

---

## 📋 What Gets Deployed

### ✅ Safe Deployment Features

1. **No Conflicts with Other Apps**
   - Uses port 3002 (replaces old `azteka-api`)
   - Unique PM2 process name: `azteka-nextjs`
   - Doesn't touch other processes (alessa-ordering, etc.)

2. **Pre-Deployment Checks**
   - ✅ Verifies SSH access
   - ✅ Builds locally first (catches errors early)
   - ✅ Checks Next.js installation

3. **Smart File Syncing**
   - Excludes: `node_modules`, `.git`, `.next`, `dist`, logs
   - Only syncs necessary files
   - Fast and efficient

4. **Safe Process Management**
   - Stops old `azteka-api` process (if exists)
   - Starts new `azteka-nextjs` process
   - Preserves other PM2 processes

5. **Database Safety**
   - Runs Prisma migrations
   - Generates Prisma client
   - Doesn't drop/reset database

6. **Verification**
   - Checks PM2 status
   - Verifies port is listening
   - Tests application health

---

## 🔧 Configuration

### VPS Details
- **Host:** 77.243.85.8
- **User:** root
- **Path:** /srv/azteka-dsd
- **Port:** 3002
- **Domain:** aztekafoods.com

### PM2 Process
- **Name:** azteka-nextjs
- **Port:** 3002
- **Memory Limit:** 1GB
- **Auto-restart:** Yes

---

## 📝 Deployment Process

The script performs these steps automatically:

1. **Local Build**
   ```bash
   npm run build:next
   ```

2. **File Sync**
   ```bash
   rsync to VPS (excluding unnecessary files)
   ```

3. **VPS Setup**
   ```bash
   npm install --legacy-peer-deps
   npx prisma generate
   npx prisma migrate deploy
   ```

4. **PM2 Deployment**
   ```bash
   pm2 stop azteka-api (if exists)
   pm2 start ecosystem.nextjs.config.cjs
   pm2 save
   ```

5. **Verification**
   ```bash
   Check PM2 status
   Verify port listening
   Test application health
   ```

---

## 🧪 After Deployment

### Test the Application

```bash
# Test API endpoint
curl https://aztekafoods.com/api/warehouse/print-slip

# Test catalog
open https://aztekafoods.com/catalog

# Test admin
open https://aztekafoods.com/admin/products
```

### Check Logs

```bash
# View PM2 logs
ssh root@77.243.85.8 "pm2 logs azteka-nextjs --lines 100"

# Monitor in real-time
ssh root@77.243.85.8 "pm2 monit"
```

### Check Status

```bash
# PM2 status
ssh root@77.243.85.8 "pm2 list"

# Port status
ssh root@77.243.85.8 "lsof -iTCP:3002 -sTCP:LISTEN"
```

---

## 🔐 Login Credentials

After deployment, use these to test:

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@aztekafoods.com | admin123 |
| Sales Rep | sales@aztekafoods.com | sales123 |
| Driver | driver@aztekafoods.com | driver123 |
| Customer | customer@example.com | customer123 |

**⚠️ Change passwords in production!**

---

## 🐛 Troubleshooting

### Deployment Fails

1. **Check SSH access:**
   ```bash
   ssh root@77.243.85.8 "echo 'Connected'"
   ```

2. **Check build locally:**
   ```bash
   npm run build:next
   ```

3. **Check script syntax:**
   ```bash
   bash -n scripts/deploy-to-vps.sh
   ```

### App Not Starting

1. **Check PM2 logs:**
   ```bash
   ssh root@77.243.85.8 "pm2 logs azteka-nextjs --lines 50"
   ```

2. **Check if .next exists:**
   ```bash
   ssh root@77.243.85.8 "ls -la /srv/azteka-dsd/.next"
   ```

3. **Rebuild on VPS:**
   ```bash
   ssh root@77.243.85.8 "cd /srv/azteka-dsd && npm run build:next"
   ```

### Port Conflict

If port 3002 is in use:

```bash
# Check what's using it
ssh root@77.243.85.8 "lsof -iTCP:3002 -sTCP:LISTEN"

# Stop conflicting process
ssh root@77.243.85.8 "pm2 stop <process-name>"
```

---

## 📊 Port Allocation

| Port | App | Process | Status |
|------|-----|---------|--------|
| 3000 | Alessa Ordering | alessa-ordering | ✅ Running |
| **3002** | **Azteka DSD** | **azteka-nextjs** | ✅ **This deployment** |
| 3003-3009 | Available | - | 🟢 Free |

---

## ✅ Pre-Deployment Checklist

Before running deployment:

- [ ] SSH access to VPS works
- [ ] Local build succeeds (`npm run build:next`)
- [ ] `.env.production` exists on VPS with correct values
- [ ] Database is accessible
- [ ] Nginx is running

---

## 🎯 Next Steps After Deployment

1. **Test all features:**
   - [ ] Catalog page loads
   - [ ] Admin panel works
   - [ ] Product editor functions
   - [ ] Warehouse print endpoint responds

2. **Wire warehouse printer:**
   - Install IPP library
   - Configure printer IP
   - Test auto-print on order confirmation

3. **Set up Capacitor:**
   - After Apple Dev account
   - Initialize Capacitor
   - Build iOS app

---

**Status:** ✅ Ready to Deploy
**Last Updated:** $(date +%Y-%m-%d)

