# 🚀 Image Fix Deployment Checklist

## ✅ Pre-Deployment

- [x] Diagnostic endpoint created
- [x] Image fix script created
- [x] VPS sync script created
- [x] Out-of-stock overlay fixed
- [x] Service restart script created
- [x] Health monitoring added
- [x] Prevention guide created

## 📋 Deployment Steps

### On Local Machine

1. **Run Image Fix Script**:
   ```bash
   cd /Users/ernestoponce/dev/azteka-dsd
   npm install  # If not already done
   node scripts/fix-image-issues.mjs
   ```

2. **Check Diagnostics**:
   ```bash
   # Start your dev server first
   npm run dev
   # Then visit: http://localhost:3000/api/admin/diagnostics/images
   ```

3. **Verify Fixes**:
   - Check that images show in `/admin/inventory-seed`
   - Check that out-of-stock products show images (with light overlay)
   - Check that recent uploads have files on disk

### On VPS Server

1. **SSH to VPS**:
   ```bash
   ssh user@your-vps-ip
   ```

2. **Navigate to Project**:
   ```bash
   cd /srv/azteka-dsd  # or your project path
   ```

3. **Pull Latest Changes**:
   ```bash
   git pull origin main  # or your branch
   ```

4. **Install Dependencies** (if needed):
   ```bash
   npm install
   npx prisma generate
   ```

5. **Run Image Fix**:
   ```bash
   node scripts/fix-image-issues.mjs
   ```

6. **Sync Images from Local** (if needed):
   ```bash
   # From local machine:
   node scripts/sync-images-to-vps.mjs
   
   # Or manually:
   rsync -avz public/uploads/products/ user@vps:/srv/azteka-dsd/public/uploads/products/
   ```

7. **Restart Services**:
   ```bash
   bash scripts/restart-services.sh
   
   # Or manually:
   pm2 restart all
   sudo systemctl reload nginx
   ```

8. **Build Next.js**:
   ```bash
   npm run build:next  # or npm run build
   ```

9. **Verify**:
   ```bash
   # Check PM2 status
   pm2 status
   
   # Check logs
   pm2 logs azteka-nextjs --lines 50
   
   # Test endpoints
   curl https://your-domain.com/api/admin/diagnostics/images
   ```

## 🔍 Verification

### 1. Check Image Status
Visit: `/api/admin/diagnostics/images`

Should show:
- ✅ Uploads directory exists
- ✅ Most files exist on disk
- ✅ No critical issues

### 2. Test Image Upload
1. Go to `/admin/inventory-seed`
2. Upload an image to a product
3. Verify image shows immediately
4. Check other pages (catalog, employee inventory) show the image

### 3. Test Out-of-Stock Display
1. Find a product marked out-of-stock
2. Verify image is visible (not hidden)
3. Verify overlay badge shows but image shows through

### 4. Check All Pages
- [ ] `/admin/inventory-seed` - Images load
- [ ] `/admin/products` - Images load
- [ ] `/employee/inventory` - Images load
- [ ] `/catalog` - Images load
- [ ] Out-of-stock products show images

## 🛡️ Prevention Setup

### 1. Add Cron Job for Health Monitoring

On VPS:
```bash
crontab -e

# Add this line (runs daily at 2 AM):
0 2 * * * cd /srv/azteka-dsd && node scripts/monitor-image-health.mjs >> /var/log/image-health.log 2>&1
```

### 2. Setup Alerts

Create `/srv/azteka-dsd/scripts/alert-image-issues.sh`:
```bash
#!/bin/bash
cd /srv/azteka-dsd
HEALTH=$(node scripts/monitor-image-health.mjs 2>&1)
if [ $? -ne 0 ]; then
  # Send email or webhook
  echo "Image health check failed: $HEALTH" | mail -s "Image Alert" admin@example.com
fi
```

Make executable:
```bash
chmod +x scripts/alert-image-issues.sh
```

Add to crontab:
```bash
# Run every 6 hours
0 */6 * * * /srv/azteka-dsd/scripts/alert-image-issues.sh
```

## 📊 Monitoring

### Daily Checks
- [ ] Review PM2 logs for errors
- [ ] Check `/api/admin/prevention/image-monitor`
- [ ] Verify recent uploads have files

### Weekly Checks
- [ ] Run diagnostic endpoint
- [ ] Check disk space
- [ ] Review orphaned files
- [ ] Verify sync status (if using)

### Monthly Checks
- [ ] Full image audit
- [ ] Clean up orphaned files
- [ ] Review and optimize images
- [ ] Update documentation

## 🚨 Troubleshooting

### Images Still Not Showing

1. **Check files exist**:
   ```bash
   ls -la public/uploads/products/ | head -20
   ```

2. **Check database**:
   ```sql
   SELECT id, name, imageUrl FROM products WHERE imageUrl IS NOT NULL LIMIT 10;
   ```

3. **Check diagnostics**:
   ```bash
   curl https://your-domain.com/api/admin/diagnostics/images
   ```

4. **Check PM2 logs**:
   ```bash
   pm2 logs azteka-nextjs --lines 100
   ```

5. **Check Nginx logs**:
   ```bash
   sudo tail -f /var/log/nginx/error.log
   ```

### PM2 Issues

```bash
# Check status
pm2 status

# Restart specific app
pm2 restart azteka-nextjs

# View logs
pm2 logs azteka-nextjs

# Reload (zero downtime)
pm2 reload azteka-nextjs
```

### Nginx Issues

```bash
# Test config
sudo nginx -t

# Reload
sudo systemctl reload nginx

# Check status
sudo systemctl status nginx

# View logs
sudo tail -f /var/log/nginx/error.log
```

### Permission Issues

```bash
# Fix upload directory permissions
sudo chown -R www-data:www-data public/uploads/
sudo chmod -R 755 public/uploads/
sudo chmod -R 644 public/uploads/products/*.png
```

## ✅ Post-Deployment

After deployment, verify:

1. ✅ Images loading on all pages
2. ✅ Upload functionality working
3. ✅ Out-of-stock overlay not hiding images
4. ✅ Diagnostics endpoint accessible
5. ✅ Health monitoring running
6. ✅ Services stable (PM2, Nginx)

## 📝 Notes

- Keep backups before major changes
- Test locally before deploying to VPS
- Use dry-run mode for sync operations
- Monitor logs after deployment
- Document any custom configurations

## 🔗 Related Documents

- `QUICK_FIX_SUMMARY.md` - Quick reference
- `IMAGE_FIX_PREVENTION_GUIDE.md` - Detailed prevention guide
- `scripts/fix-image-issues.mjs` - Fix script
- `scripts/sync-images-to-vps.mjs` - Sync script
- `scripts/restart-services.sh` - Restart script
