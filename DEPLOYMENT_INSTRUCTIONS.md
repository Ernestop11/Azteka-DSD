# 🚀 Deploy Image Fixes to VPS - Instructions

## Quick Deploy (Recommended)

I've created a deployment script that will sync the fixes and rebuild on VPS.

### Option 1: Use the Quick Deploy Script

```bash
./QUICK_DEPLOY_FIXES.sh
```

This will:
1. Sync the fixed files to VPS
2. Rebuild Next.js app
3. Restart PM2 services
4. Clear cache
5. Reload Nginx

---

## Manual Deploy (If Script Doesn't Work)

### Step 1: Sync Files to VPS

```bash
rsync -avz \
  --exclude 'node_modules' \
  --exclude '.next' \
  --exclude '.git' \
  app/employee/inventory/page.tsx \
  app/employee/products/page.tsx \
  app/api/employee/products/upload-image/route.ts \
  app/api/admin/products/uploadImage/route.ts \
  lib/imageUrl.ts \
  root@77.243.85.8:/srv/azteka-api-live/
```

### Step 2: SSH to VPS and Rebuild

```bash
ssh root@77.243.85.8
cd /srv/azteka-api-live
npm run build:next
pm2 restart azteka-nextjs
pm2 restart azteka-worker
rm -rf .next/cache/*
systemctl reload nginx
exit
```

---

## Files That Were Fixed

1. **app/employee/inventory/page.tsx**
   - Added `getPublicImageUrl()` helper
   - Fixed image URL resolution
   - Added better error handling

2. **app/employee/products/page.tsx**
   - Added `getPublicImageUrl()` helper
   - Fixed image URL resolution

3. **app/api/employee/products/upload-image/route.ts**
   - Improved HEIC error messages
   - Better error handling

4. **app/api/admin/products/uploadImage/route.ts**
   - Fixed to use productId as filename
   - Added database update
   - Added cache invalidation

5. **lib/imageUrl.ts**
   - Image URL normalization helper (already existed)

---

## After Deployment

1. **Hard refresh browser:**
   - Mac: Cmd+Shift+R
   - Windows/Linux: Ctrl+Shift+R

2. **Check Alpura Vaquita Chocolate:**
   - Go to `/employee/inventory`
   - Search for "Alpura Vaquita Chocolate"
   - Image should now display

3. **Try uploading:**
   - Click on product
   - Go to Image tab
   - Upload image
   - Should work now

---

## Troubleshooting

### If images still don't show:

1. **Check browser console:**
   - Open DevTools (F12)
   - Look for image loading errors
   - Check Network tab for failed image requests

2. **Check VPS logs:**
   ```bash
   ssh root@77.243.85.8
   pm2 logs azteka-nextjs --lines 50
   ```

3. **Verify file exists on VPS:**
   ```bash
   ssh root@77.243.85.8
   ls -la /srv/azteka-api-live/public/uploads/products/ | grep vaquita
   ```

4. **Check database:**
   ```bash
   ssh root@77.243.85.8
   cd /srv/azteka-api-live
   npx prisma studio
   # Or query directly:
   # Find product ID for Alpura Vaquita Chocolate
   # Check if imageUrl is set correctly
   ```

---

## What the Fixes Do

### Image URL Resolution
- **Before:** Raw database URLs like `/uploads/products/abc123.png` might not resolve
- **After:** Uses `getPublicImageUrl()` to normalize URLs correctly
- **Result:** Images display consistently across all UIs

### Upload Endpoint
- **Before:** Admin endpoint didn't update database
- **After:** Both endpoints update database and use consistent filenames
- **Result:** Images sync immediately across all UIs

### HEIC Support
- **Before:** Basic error messages
- **After:** Better error messages with suggestions
- **Result:** Users know what to do if HEIC conversion fails

---

**Ready to deploy!** Run `./QUICK_DEPLOY_FIXES.sh` to deploy the fixes.

