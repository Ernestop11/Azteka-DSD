# 🧪 Testing Guide - Azteka DSD

**Date**: December 10, 2025  
**Status**: ✅ Ready for Testing

---

## 🔑 Login Credentials

### Default Users (After Seeding Database)

Run the seed script on VPS to create these users:

```bash
ssh root@77.243.85.8
cd /srv/azteka-dsd
node prisma/seed.js
```

**Login Credentials:**

| Role | Email | Password | Access |
|------|-------|----------|--------|
| **Admin** | `admin@aztekafoods.com` | `admin123` | Full admin access |
| **Sales Rep** | `sales@aztekafoods.com` | `sales123` | Sales rep features |
| **Driver** | `driver@aztekafoods.com` | `driver123` | Driver dashboard |
| **Customer** | `customer@example.com` | `customer123` | Customer portal |

**Login URL**: `https://aztekafoods.com/auth/login`

---

## ✅ What's Fixed

1. ✅ Root page redirects to `/catalog`
2. ✅ Caches cleared (Next.js + Nginx)
3. ✅ Nginx configured to prevent JS/CSS caching
4. ✅ Next.js rebuilt successfully
5. ✅ Both services running (Next.js + Express Worker)
6. ✅ Socket.IO proxy configured

---

## 🧪 Testing Checklist

### Step 1: Clear Browser Cache (REQUIRED!)

**Chrome/Edge:**
1. Open DevTools (F12)
2. Right-click refresh button → "Empty Cache and Hard Reload"
3. Or: DevTools → Application → Clear Storage → Clear site data

**Firefox:**
1. Cmd+Shift+Delete (Mac) or Ctrl+Shift+Delete (Windows)
2. Select "Cache" → Clear Now

### Step 2: Test Public Pages

- [ ] **Root URL**: `https://aztekafoods.com/`
  - Should redirect to `/catalog` automatically
  - No "Azteka DSD Version 1" placeholder

- [ ] **Catalog**: `https://aztekafoods.com/catalog`
  - Should load without errors
  - No Supabase errors in console
  - Products should display (if seeded)

- [ ] **Bundles**: `https://aztekafoods.com/bundles`
  - Should show bundle listings

- [ ] **Cart**: `https://aztekafoods.com/cart`
  - Should show empty cart or items

### Step 3: Test Authentication

- [ ] **Login Page**: `https://aztekafoods.com/auth/login`
  - Should load login form
  - Test with admin credentials

- [ ] **After Login**:
  - Should redirect to appropriate dashboard
  - Session cookie should be set
  - `/api/auth/me` should return user data

### Step 4: Test Admin Features

**Login as Admin** (`admin@aztekafoods.com` / `admin123`)

- [ ] **Admin Dashboard**: `https://aztekafoods.com/admin`
  - Should load admin dashboard

- [ ] **Product Editor**: `https://aztekafoods.com/admin/products`
  - Should show product list
  - "Mark Out" button should work
  - Create/Edit product should work
  - Image upload should work

- [ ] **Bundle Editor**: `https://aztekafoods.com/admin/bundles`
  - Should show bundle list
  - Create/Edit bundle should work

- [ ] **Categories**: `https://aztekafoods.com/admin/categories`
  - Should show category management

- [ ] **Brands**: `https://aztekafoods.com/admin/brands`
  - Should show brand management

### Step 5: Test Warehouse Features

**Login as Admin or Warehouse User**

- [ ] **Order Queue**: `https://aztekafoods.com/warehouse/orders`
  - Should show order list

- [ ] **Print Queue**: `https://aztekafoods.com/warehouse/print-queue`
  - Should show print jobs
  - Socket.IO should connect for real-time updates

### Step 6: Test Real-Time Features

- [ ] **Socket.IO Connection**:
  - Open browser console
  - Should see Socket.IO connection
  - No errors related to `placeholder.supabase`

- [ ] **Print Queue Updates**:
  - Create a print job
  - Should see real-time update via Socket.IO

---

## 🐛 Troubleshooting

### Issue: Still seeing Supabase errors

**Solution:**
1. Hard refresh browser (Cmd+Shift+R / Ctrl+Shift+R)
2. Clear browser cache completely
3. Check Nginx is serving new files:
   ```bash
   ssh root@77.243.85.8
   curl -I https://aztekafoods.com/_next/static/chunks/main.js
   # Should show Cache-Control: no-cache
   ```

### Issue: 401 Unauthorized on `/api/auth/me`

**This is normal** if you're not logged in. The catalog should still work.

**To fix:**
1. Login at `/auth/login`
2. Session cookie will be set
3. `/api/auth/me` will return user data

### Issue: Empty catalog

**Solution:**
1. Seed the database:
   ```bash
   ssh root@77.243.85.8
   cd /srv/azteka-dsd
   node prisma/seed.js
   ```

2. Check API endpoint:
   ```bash
   curl https://aztekafoods.com/api/catalog/products
   ```

### Issue: Can't login

**Solution:**
1. Verify user exists in database:
   ```bash
   ssh root@77.243.85.8
   cd /srv/azteka-dsd
   npx prisma studio
   # Check Users table
   ```

2. Run seed script to create users:
   ```bash
   node prisma/seed.js
   ```

---

## 📊 Monitoring

### Check Service Status

```bash
ssh root@77.243.85.8
pm2 list
```

Should show:
- `azteka-nextjs` - online
- `azteka-worker` - online

### View Logs

```bash
# Next.js logs
pm2 logs azteka-nextjs

# Express Worker logs
pm2 logs azteka-worker

# Error logs
tail -f /srv/azteka-dsd/logs/pm2-nextjs-error.log
tail -f /srv/azteka-dsd/logs/pm2-worker-error.log
```

### Check Nginx

```bash
# Test configuration
nginx -t

# Check status
systemctl status nginx

# View access logs
tail -f /var/log/nginx/azteka-dsd.access.log
```

---

## 🎯 Quick Test Commands

### Test URLs

```bash
# Root (should redirect)
curl -I https://aztekafoods.com/

# Catalog (should return 200)
curl -I https://aztekafoods.com/catalog

# API endpoint
curl https://aztekafoods.com/api/catalog/products

# Worker health
curl http://localhost:3003/health
```

### Seed Database

```bash
ssh root@77.243.85.8
cd /srv/azteka-dsd
node prisma/seed.js
```

---

## ✅ Success Criteria

- [x] Root page redirects to catalog
- [x] Catalog loads without Supabase errors
- [x] Login works with default credentials
- [x] Admin features accessible
- [x] Socket.IO connects successfully
- [x] Print queue shows real-time updates
- [x] No console errors related to Supabase

---

## 📝 Notes

- **Browser Cache**: Must be cleared to see fixes
- **Database**: Needs to be seeded for products/users
- **Socket.IO**: Requires Express Worker running (port 3003)
- **Authentication**: 401 on `/api/auth/me` is normal when not logged in

---

**Ready for Testing!** 🚀

Clear your browser cache and start testing!
