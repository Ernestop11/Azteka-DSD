# Image Storage Architecture Audit

## CRITICAL VULNERABILITIES FOUND

### 1. RSYNC --delete Without Upload Exclusion (FIXED)
**File:** `scripts/deploy-vps.sh`
**Issue:** Using `rsync --delete` without excluding `public/uploads` caused all VPS images to be deleted on every deploy because local folder is empty.
**Fix Applied:** Added `--exclude='public/uploads'`

### 2. Multiple Deploy Scripts With Different Behaviors
**Files with rsync:**
- `scripts/deploy-vps.sh` - FIXED (excludes uploads)
- `scripts/deploy-to-vps.sh` - Uses git pull (safe, but points to wrong path `/srv/azteka-api-live`)
- `scripts/deploy.sh` - Uses git pull to `/srv/azteka-api-live` (wrong path!)
- `DEPLOY_*.sh` files - Various rsync without --delete (safer but inconsistent)

**Issue:** Some scripts point to `/srv/azteka-api-live` instead of `/srv/azteka-dsd`

### 3. Frontend Cache Not Invalidating After Upload
**Files:**
- `app/api/admin/products/uploadImage/route.ts`
- `app/api/employee/products/upload-image/route.ts`

**Issue:** Cache invalidation calls `revalidateTag()` and `revalidatePath()` but:
1. These only work on the server that made the call
2. The frontend uses React Query with `staleTime` settings
3. Browser HTTP caching conflicts with fresh images

**Current cache clearing:**
```typescript
revalidateTag('products')
revalidateTag('catalog')
revalidatePath('/catalog')
catalogCache.clear()
```

**What's Missing:**
- No way to notify browser clients of updates
- No cache busting on image URLs for instant refresh
- React Query caches on frontend don't know about server updates

### 4. Nginx Cache Headers Conflict
**Current Nginx config has:**
```
add_header Cache-Control "public, immutable";
```

**But Next.js also adds:**
```
cache-control: no-cache, no-store, must-revalidate
```

This creates conflicting cache headers.

---

## RECOMMENDED FIXES

### Fix 1: Standardize Deploy Scripts
All deploy scripts should:
1. Point to `/srv/azteka-dsd` (not `/srv/azteka-api-live`)
2. NEVER use `rsync --delete` on the whole directory
3. Always exclude `public/uploads`, `pm2.config.cjs`, `logs`, `.env`

### Fix 2: Add Cache Busting to Image URLs
After upload, append timestamp to imageUrl in database:
```typescript
imageUrl: `/uploads/products/${productId}.png?v=${Date.now()}`
```

Or use the file hash as version.

### Fix 3: Fix Nginx Cache Headers
Update `/etc/nginx/sites-available/aztekafoods.com`:
```nginx
location /uploads/ {
    alias /srv/azteka-dsd/public/uploads/;
    expires 7d;
    add_header Cache-Control "public, max-age=604800";
    # Let the query string bust the cache
    access_log off;
}
```

### Fix 4: Add Real-Time Update Mechanism
Options:
1. WebSocket for instant updates (complex)
2. Server-Sent Events (medium)
3. Polling with version check (simple)
4. Add `?v=timestamp` to all image URLs (simplest)

---

## PROTECTED DIRECTORIES ON VPS

These directories should NEVER be deleted by any script:
- `/srv/azteka-dsd/public/uploads/` - All uploaded images
- `/srv/azteka-dsd/logs/` - Application logs
- `/srv/azteka-dsd/pm2.config.cjs` - PM2 configuration
- `/srv/azteka-dsd/.env` - Environment variables

---

## CURRENT STATE (Updated Dec 23, 2025)

- **VPS Path:** `/srv/azteka-dsd` (CORRECT)
- **Images on VPS:** 669 product images
- **Upload working:** YES (VPS direct write)
- **Database update working:** YES (with cache busting timestamp)
- **Frontend refresh:** YES - INSTANT (cache busting via `?v=timestamp`)
- **Nginx static serving:** YES (bypasses Next.js for /uploads/)

---

## ACTION ITEMS

1. [x] Fix `scripts/deploy-vps.sh` to exclude uploads
2. [x] Add cache busting to image URLs (timestamp appended to imageUrl in DB)
3. [x] Fix Nginx cache headers (7 day cache, served directly by Nginx)
4. [x] Fix corrupted Nginx sites-enabled config
5. [ ] Update all DEPLOY_*.sh scripts to exclude uploads (low priority)
6. [ ] Fix scripts pointing to wrong path `/srv/azteka-api-live` (low priority)

## FIXES APPLIED (Dec 23, 2025)

### 1. Cache Busting Added to Upload Endpoints
- `app/api/admin/products/uploadImage/route.ts` - Line 102-108
- `app/api/employee/products/upload-image/route.ts` - Line 163-176
- Database now stores: `/uploads/products/{id}.png?v={timestamp}`

### 2. Nginx Configuration Fixed
- Fixed corrupted `/etc/nginx/sites-enabled/aztekafoods.com`
- Static uploads served directly by Nginx (bypasses Next.js)
- Headers: `Cache-Control: public, max-age=604800` (7 days)
- Custom header `X-Served-By: nginx-static` confirms static serving

### 3. Deploy Script Fixed
- `scripts/deploy-vps.sh` now excludes:
  - `public/uploads` (preserves images)
  - `pm2.config.cjs` (preserves PM2 config)
  - `logs` (preserves log files)
