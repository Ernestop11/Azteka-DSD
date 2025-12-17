# Smoke Test Results - Internal Server Errors

**Date:** 2025-12-11  
**Status:** ❌ **CRITICAL - All endpoints returning 500 errors**

## Issues Found

### 1. **Next.js Build Corruption**
- **Error:** `TypeError: Cannot read properties of undefined (reading '/_error')`
- **Error:** `TypeError: Cannot read properties of undefined (reading 'previewModeId')`
- **Root Cause:** The `.next/server/app/_error` directory is missing after build
- **Impact:** All pages return 500 Internal Server Error

### 2. **Database Connection**
- ✅ **FIXED:** Updated `.env.production` with correct `DATABASE_URL`
- ✅ Database connection test passes: `✅ DB OK`

### 3. **Missing Build Artifacts**
- ❌ `_error` page directory missing: `.next/server/app/_error/`
- ❌ `_error/page.js` file missing
- ✅ `_not-found` page exists: `.next/server/app/_not-found/page.js`

### 4. **API Endpoints Status**
- ❌ `/api/admin/products` → 500 Internal Server Error
- ❌ `/api/catalog/products` → 500 Internal Server Error
- ❌ `/api/admin/catalog/layout` → 500 Internal Server Error
- ❌ `/catalog` → 500 Internal Server Error
- ❌ `/admin/menu-editor` → 500 Internal Server Error

## Fixes Applied

1. ✅ Fixed all `toFixed()` errors in admin files
2. ✅ Updated `.env.production` with correct database credentials
3. ✅ Added `export const dynamic = 'force-dynamic'` to admin dashboard page
4. ✅ Synced `app/error.tsx` to VPS
5. ✅ Created `prerender-manifest.json` file
6. ❌ **FAILED:** Rebuilding doesn't generate `_error` page directory

## Next Steps Required

### Immediate Actions:
1. **Fix Next.js Build Issue:**
   - The build is not generating the `_error` page properly
   - Need to investigate why Next.js isn't creating error page during build
   - May need to check if `app/error.tsx` is properly formatted

2. **Verify Error Component:**
   - Check if `ErrorBoundary` component exists
   - Ensure `app/error.tsx` doesn't have import errors

3. **Alternative Solution:**
   - Manually create the `_error` page structure
   - Or use Next.js dev mode instead of production build

## Test URLs (All Currently Failing)
- https://aztekafoods.com/catalog → 500
- https://aztekafoods.com/admin/menu-editor → 500
- https://aztekafoods.com/api/admin/products → 500

## PM2 Status
- ✅ `azteka-nextjs` - Online (but serving 500 errors)
- ✅ `azteka-worker` - Online
