# Image Fix & Prevention Guide

## 🔍 Problem Summary

Images were seeded locally until 3am, but after adding PO uploader tab and moving builds to external drive, images stopped showing across the platform. Issues identified:

1. **Path Mismatches**: Images saved locally but not accessible on VPS
2. **Out-of-Stock Overlay**: Dark overlay hiding images incorrectly
3. **Cache Issues**: Stale cache preventing image updates
4. **File Sync**: Local images not synced to VPS server

## ✅ Fixes Applied

### 1. Diagnostic Tools Created

**Diagnostic Endpoint**: `/api/admin/diagnostics/images`
- Checks database vs filesystem
- Identifies missing files
- Reports orphaned files
- Shows path mismatches

**Run**: `GET /api/admin/diagnostics/images` (Admin only)

### 2. Image Fix Script

**Script**: `scripts/fix-image-issues.mjs`

**What it does**:
- Checks upload directories exist
- Verifies files on disk match database
- Fixes path mismatches (`/uploads/prod/` → `/uploads/products/`)
- Copies files from alternate locations
- Reports statistics

**Run**: `node scripts/fix-image-issues.mjs`

### 3. VPS Sync Script

**Script**: `scripts/sync-images-to-vps.mjs`

**What it does**:
- Syncs local images to VPS via rsync
- Efficient transfer (only changed files)
- Dry-run mode available

**Run**: 
```bash
# Dry run first
node scripts/sync-images-to-vps.mjs --dry-run

# Actual sync
node scripts/sync-images-to-vps.mjs
```

**Setup**: Add to `.env`:
```
VPS_HOST=your-vps-ip
VPS_USER=your-ssh-user
VPS_UPLOADS_PATH=/srv/azteka-dsd/public/uploads/products
```

### 4. Out-of-Stock Overlay Fix

**Fixed**: `modules/catalog-ui/components/ProductGrid.tsx`
- Changed from `bg-black/70` (hides image) to `bg-black/20` (light overlay)
- Image remains visible with subtle badge overlay

**Fixed**: `components/catalog/ProductCard.tsx`
- Reduced overlay opacity
- Added border to badge for better visibility

### 5. Service Restart Script

**Script**: `scripts/restart-services.sh`

**What it does**:
- Restarts PM2 processes
- Reloads Nginx
- Clears Next.js cache
- Updates Prisma client
- Clears system caches

**Run**: `bash scripts/restart-services.sh`

### 6. Complete Fix & Deploy Script

**Script**: `scripts/fix-and-deploy.sh`

**What it does**:
1. Runs image fix script
2. Checks image health
3. Builds Next.js app
4. Restarts all services
5. Verifies deployment

**Run**: `bash scripts/fix-and-deploy.sh`

### 7. Health Monitoring

**Monitoring Script**: `scripts/monitor-image-health.mjs`
- Checks image health metrics
- Exits with code 1 if unhealthy (for cron)
- JSON output for automation

**Prevention Endpoint**: `/api/admin/prevention/image-monitor`
- Returns health status
- Provides recommendations
- Monitors recent uploads

## 🚀 Deployment Steps

### Immediate Fix

```bash
# 1. Run image fix script
node scripts/fix-image-issues.mjs

# 2. Check diagnostics
curl http://localhost:3000/api/admin/diagnostics/images

# 3. Restart services
bash scripts/restart-services.sh

# 4. Or run complete fix & deploy
bash scripts/fix-and-deploy.sh
```

### Sync to VPS

```bash
# 1. Setup VPS connection in .env
echo "VPS_HOST=your-vps-ip" >> .env
echo "VPS_USER=root" >> .env

# 2. Test SSH connection
ssh $VPS_USER@$VPS_HOST

# 3. Dry run sync
node scripts/sync-images-to-vps.mjs --dry-run

# 4. Actual sync
node scripts/sync-images-to-vps.mjs
```

## 🛡️ Prevention Mechanisms

### 1. Automated Health Checks

**Cron Job** (runs daily):
```bash
# Add to crontab: crontab -e
0 2 * * * cd /path/to/project && node scripts/monitor-image-health.mjs >> /var/log/image-health.log 2>&1
```

**Alert Script** (if health check fails):
```bash
#!/bin/bash
# scripts/alert-image-issues.sh
HEALTH=$(node scripts/monitor-image-health.mjs)
if [ $? -ne 0 ]; then
  # Send alert (email, Slack, etc.)
  echo "Image health check failed!" | mail -s "Image Alert" admin@example.com
fi
```

### 2. Pre-Upload Validation

**Before upload**:
- Verify upload directory exists
- Check disk space
- Validate file permissions

**After upload**:
- Verify file written to disk
- Update database
- Invalidate cache
- Verify file accessible via HTTP

### 3. Path Consistency

**Always use**: `/uploads/products/${productId}.png`

**Fix shortened paths**: Automatically convert `/uploads/prod/` → `/uploads/products/`

**Helper function**: `lib/imageUrl.ts` - `getPublicImageUrl()`

### 4. Cache Management

**After image upload**:
- Invalidate Next.js cache: `revalidatePath()`, `revalidateTag()`
- Clear CDN cache (if used)
- Force browser cache refresh: Add timestamp to image URL

**Code**:
```typescript
revalidateTag('products')
revalidatePath('/catalog')
revalidatePath('/admin/products')
```

### 5. Database Constraints

**Ensure**:
- `imageUrl` field exists and is indexed
- Path format consistent
- No duplicate image URLs

### 6. File System Monitoring

**Monitor**:
- Upload directory size
- File count
- Disk space
- Permission changes

**Alert if**:
- Directory missing
- Permissions changed
- Disk full
- Files deleted

## 🔍 Troubleshooting

### Images Not Showing

1. **Check database**:
   ```sql
   SELECT id, name, imageUrl FROM products WHERE imageUrl IS NOT NULL LIMIT 10;
   ```

2. **Check files exist**:
   ```bash
   ls -la public/uploads/products/ | head -20
   ```

3. **Check diagnostics**:
   ```bash
   curl http://localhost:3000/api/admin/diagnostics/images
   ```

4. **Check logs**:
   ```bash
   pm2 logs azteka-nextjs --lines 50
   ```

### Images Show But Broken

1. **Check file permissions**:
   ```bash
   ls -la public/uploads/products/
   chmod 755 public/uploads/products/
   chmod 644 public/uploads/products/*.png
   ```

2. **Check Nginx config**:
   ```nginx
   location /uploads/ {
       alias /path/to/public/uploads/;
       expires 30d;
       add_header Cache-Control "public, immutable";
   }
   ```

3. **Check Next.js config**:
   - Verify `rewrites()` for `/uploads/`
   - Check `images.remotePatterns`

### Out-of-Stock Overlay Hiding Images

1. **Check component**: Look for `bg-black/70` or similar dark overlays
2. **Change to**: `bg-black/20` or remove overlay, add badge only
3. **Verify**: `inStock` field in database is correct

### VPS Sync Issues

1. **Check SSH**:
   ```bash
   ssh $VPS_USER@$VPS_HOST
   ```

2. **Check permissions**:
   ```bash
   ls -la /srv/azteka-dsd/public/uploads/products/
   ```

3. **Check rsync**:
   ```bash
   rsync --version
   ```

4. **Test manually**:
   ```bash
   scp public/uploads/products/test.png $VPS_USER@$VPS_HOST:/srv/azteka-dsd/public/uploads/products/
   ```

## 📊 Monitoring Dashboard

### Key Metrics to Monitor

1. **Image Health Score**: % of products with images vs missing
2. **Upload Success Rate**: Successful uploads / total attempts
3. **File System Health**: Disk space, permissions, directory exists
4. **Cache Hit Rate**: Image requests served from cache
5. **Sync Status**: Last successful VPS sync

### Monitoring Endpoints

- `/api/admin/diagnostics/images` - Full diagnostics
- `/api/admin/prevention/image-monitor` - Health status
- `scripts/monitor-image-health.mjs` - CLI health check

## ✅ Checklist

### Daily
- [ ] Check image health: `node scripts/monitor-image-health.mjs`
- [ ] Review upload logs for errors
- [ ] Verify recent uploads have files on disk

### Weekly
- [ ] Run diagnostic endpoint
- [ ] Check disk space
- [ ] Verify VPS sync (if applicable)
- [ ] Review orphaned files

### Monthly
- [ ] Full image audit
- [ ] Clean up orphaned files
- [ ] Review and optimize image sizes
- [ ] Update documentation

## 🚨 Alert Conditions

**Critical** (immediate action):
- Upload directory missing
- >20% of images missing files
- Disk full
- Sync failures for 24+ hours

**Warning** (investigate):
- >10% of recent uploads missing files
- Sync failures
- Permission issues
- Cache not invalidating

**Info** (monitor):
- Orphaned files detected
- Path mismatches
- Health score < 95%

## 📝 Notes

- Always use `productId.png` as filename for consistency
- Keep images in `public/uploads/products/` (Next.js serves public/)
- Invalidate cache after every upload
- Test locally before deploying to VPS
- Use dry-run mode before sync operations
- Monitor logs after deployments

## 🔗 Related Files

- `app/api/admin/products/uploadImage/route.ts` - Upload endpoint
- `app/api/admin/diagnostics/images/route.ts` - Diagnostics
- `lib/imageUrl.ts` - Image URL helper
- `scripts/fix-image-issues.mjs` - Fix script
- `scripts/sync-images-to-vps.mjs` - Sync script
- `scripts/monitor-image-health.mjs` - Health monitoring

