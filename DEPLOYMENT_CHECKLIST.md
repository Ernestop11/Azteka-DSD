# Deployment Checklist - Architecture Improvements

## ✅ Pre-Deployment Checklist

### Code Changes Completed:
- [x] Build isolation: `distDir: '.next-azteka'` in `next.config.js`
- [x] API client created: `lib/api/client.ts`
- [x] CatalogContent updated to use API client
- [x] Deployment script updated to exclude `.next-azteka`
- [x] UI components verified (all imported and rendered)

### Files Modified:
1. `next.config.js` - Unique build directory
2. `lib/api/client.ts` - NEW: Centralized API client
3. `app/catalog/CatalogContent.tsx` - Uses API client
4. `lib/queries/catalog.ts` - Added client-side helpers
5. `scripts/deploy-to-vps.sh` - Updated rsync excludes

## 🚀 Deployment Steps

### 1. Pre-Deployment Verification
```bash
# Check for TypeScript errors
npm run typecheck

# Verify API client imports correctly
grep -r "apiClient" app/ lib/
```

### 2. Deploy to VPS
```bash
./scripts/deploy-to-vps.sh
```

### 3. Post-Deployment Verification

#### Check Build Directory:
```bash
ssh root@77.243.85.8 'ls -la /srv/azteka-dsd/.next-azteka/'
```

#### Check PM2 Status:
```bash
ssh root@77.243.85.8 'pm2 status azteka-nextjs'
```

#### Test API Endpoints:
```bash
# Test catalog products
curl https://aztekafoods.com/api/catalog/products?limit=10

# Test catalog layout
curl https://aztekafoods.com/api/admin/catalog/layout
```

#### Check Application:
```bash
# Visit in browser
https://aztekafoods.com/catalog

# Check browser console for errors
# Verify:
# - Products load correctly
# - UI components render (heroes, billboards, banners)
# - Animations work
# - Gradients display
```

### 4. Verify Build Isolation
```bash
# Check no conflicts with other apps
ssh root@77.243.85.8 'find /srv -name ".next*" -type d'
# Should see:
# - /srv/azteka-dsd/.next-azteka (our app)
# - Other apps have their own .next directories
```

## 🐛 Troubleshooting

### If Build Fails:
1. Check disk space: `df -h`
2. Check logs: `ssh root@77.243.85.8 'tail -50 /srv/azteka-dsd/logs/pm2-nextjs-error.log'`
3. Verify Node version: `node --version` (should be 18+)
4. Check npm install: `ssh root@77.243.85.8 'cd /srv/azteka-dsd && npm list next'`

### If API Calls Fail:
1. Check API client is imported: `grep -r "apiClient" app/catalog/CatalogContent.tsx`
2. Check browser console for errors
3. Verify `NEXT_PUBLIC_API_URL` is set (defaults to `/api`)
4. Test API directly: `curl http://localhost:3002/api/catalog/products`

### If UI Doesn't Render:
1. Check all components are imported in `CatalogContent.tsx`
2. Verify bundle data exists: Check `/api/admin/catalog/layout` response
3. Check browser console for React errors
4. Verify images load: Check network tab for 404s

## 📊 Success Criteria

After deployment, verify:
- [ ] Catalog page loads without 500 errors
- [ ] Products display correctly
- [ ] All UI components render (heroes, billboards, banners)
- [ ] Animations and gradients work
- [ ] API calls use centralized client
- [ ] No build conflicts with other apps
- [ ] PM2 processes running stable

## 🔄 Rollback Plan

If issues occur:
```bash
# Revert to previous build directory
ssh root@77.243.85.8 'cd /srv/azteka-dsd && git checkout HEAD -- next.config.js'

# Rebuild
ssh root@77.243.85.8 'cd /srv/azteka-dsd && npm run build:next && pm2 restart azteka-nextjs'
```


