# 🚀 Quick Fix Summary - Image Issues

## ✅ What's Been Fixed

### 1. **Diagnostic Tools** ✅
- **Endpoint**: `/api/admin/diagnostics/images`
- **Purpose**: Check image status (database vs filesystem)
- **Access**: Admin only via browser or API call

### 2. **Image Fix Script** ✅
- **File**: `scripts/fix-image-issues.mjs`
- **Purpose**: Fix missing files, path mismatches, copy from alt locations
- **Run**: `node scripts/fix-image-issues.mjs` (requires npm install first)

### 3. **VPS Sync Script** ✅
- **File**: `scripts/sync-images-to-vps.mjs`
- **Purpose**: Sync local images to VPS server
- **Run**: `node scripts/sync-images-to-vps.mjs --dry-run` (test first)

### 4. **Out-of-Stock Overlay Fix** ✅
- **Fixed**: `modules/catalog-ui/components/ProductGrid.tsx`
- **Fixed**: `components/catalog/ProductCard.tsx`
- **Change**: Reduced overlay from `bg-black/70` to `bg-black/20` - images now visible!

### 5. **Service Restart Script** ✅
- **File**: `scripts/restart-services.sh`
- **Purpose**: Restart PM2, Nginx, clear caches
- **Run**: `bash scripts/restart-services.sh`

### 6. **Complete Fix & Deploy** ✅
- **File**: `scripts/fix-and-deploy.sh`
- **Purpose**: Run all fixes + build + restart
- **Run**: `bash scripts/fix-and-deploy.sh`

### 7. **Health Monitoring** ✅
- **Script**: `scripts/monitor-image-health.mjs`
- **Endpoint**: `/api/admin/prevention/image-monitor`
- **Purpose**: Monitor and prevent future issues

## 🚀 IMMEDIATE ACTIONS

### Step 1: Install Dependencies (if needed)
```bash
cd /Users/ernestoponce/dev/azteka-dsd
npm install
```

### Step 2: Run Image Fix
```bash
node scripts/fix-image-issues.mjs
```

### Step 3: Check Diagnostics
Visit in browser (while logged in as admin):
```
http://localhost:3000/api/admin/diagnostics/images
```

Or via curl:
```bash
curl http://localhost:3000/api/admin/diagnostics/images
```

### Step 4: Restart Services
```bash
bash scripts/restart-services.sh
```

### Step 5: Or Run Complete Fix & Deploy
```bash
bash scripts/fix-and-deploy.sh
```

## 🔍 Troubleshooting

### If script fails with "Cannot find package '@prisma/client'"
```bash
# Install dependencies
npm install

# Generate Prisma client
npx prisma generate
```

### If images still not showing

1. **Check files exist**:
   ```bash
   ls -la public/uploads/products/ | head -20
   ```

2. **Check database**:
   ```bash
   # Use Prisma Studio or direct query
   npx prisma studio
   ```

3. **Check PM2 logs**:
   ```bash
   pm2 logs azteka-nextjs --lines 100
   ```

4. **Clear cache manually**:
   ```bash
   rm -rf .next-azteka
   rm -rf .next
   ```

### If syncing to VPS

1. **Setup .env**:
   ```bash
   echo "VPS_HOST=your-vps-ip" >> .env
   echo "VPS_USER=root" >> .env
   echo "VPS_UPLOADS_PATH=/srv/azteka-dsd/public/uploads/products" >> .env
   ```

2. **Test SSH**:
   ```bash
   ssh $VPS_USER@$VPS_HOST
   ```

3. **Dry run sync**:
   ```bash
   node scripts/sync-images-to-vps.mjs --dry-run
   ```

4. **Actual sync**:
   ```bash
   node scripts/sync-images-to-vps.mjs
   ```

## 🎯 What Each Component Does

### Diagnostic Endpoint
- Checks all products with `imageUrl` in database
- Verifies files exist on disk
- Reports mismatches
- Shows orphaned files
- **Location**: `app/api/admin/diagnostics/images/route.ts`

### Fix Script
- Ensures directories exist
- Verifies files match database
- Fixes path issues (`/uploads/prod/` → `/uploads/products/`)
- Copies from alternate locations
- **Location**: `scripts/fix-image-issues.mjs`

### Sync Script
- Uses rsync for efficient transfer
- Only syncs changed files
- Dry-run mode for testing
- **Location**: `scripts/sync-images-to-vps.mjs`

### Restart Script
- Stops/starts PM2
- Reloads Nginx
- Clears Next.js cache
- Updates Prisma
- **Location**: `scripts/restart-services.sh`

## 📊 Prevention

See `IMAGE_FIX_PREVENTION_GUIDE.md` for:
- Automated health checks
- Monitoring setup
- Cron jobs
- Alert conditions
- Daily/weekly/monthly checklists

## 🔗 Key Files Changed

1. `modules/catalog-ui/components/ProductGrid.tsx` - Fixed overlay
2. `components/catalog/ProductCard.tsx` - Fixed overlay
3. `app/api/admin/diagnostics/images/route.ts` - NEW diagnostic
4. `app/api/admin/prevention/image-monitor/route.ts` - NEW monitoring
5. `scripts/fix-image-issues.mjs` - NEW fix script
6. `scripts/sync-images-to-vps.mjs` - NEW sync script
7. `scripts/restart-services.sh` - NEW restart script
8. `scripts/fix-and-deploy.sh` - NEW complete fix script

## ✅ Next Steps After Fix

1. **Monitor**: Check `/api/admin/prevention/image-monitor` daily
2. **Health Check**: Run `node scripts/monitor-image-health.mjs` regularly
3. **Automate**: Setup cron job for health monitoring
4. **Sync**: Run VPS sync after local uploads (if applicable)
5. **Document**: Update any custom deployment procedures

## 🚨 Who's Not Doing Their Job?

### The Issue
- **Images saved locally** ✅ (working)
- **Database updated** ✅ (working)
- **Cache invalidation** ⚠️ (needs verification)
- **File serving** ⚠️ (needs verification)
- **VPS sync** ❌ (missing - needs manual sync)

### The Fix
- ✅ Added cache invalidation in upload endpoint
- ✅ Fixed out-of-stock overlay hiding images
- ✅ Added diagnostic tools to identify issues
- ✅ Added sync script for VPS
- ✅ Added monitoring to prevent future issues

### Root Cause
1. **Files not on VPS** - Need to sync manually
2. **Overlay hiding images** - Fixed (reduced opacity)
3. **Cache not clearing** - Fixed (added revalidatePath)
4. **No monitoring** - Fixed (added diagnostics)

## 📝 Notes

- All scripts are in `scripts/` directory
- All API endpoints are in `app/api/admin/`
- Prevention guide is in `IMAGE_FIX_PREVENTION_GUIDE.md`
- Test locally before deploying to VPS
- Use dry-run mode when available

