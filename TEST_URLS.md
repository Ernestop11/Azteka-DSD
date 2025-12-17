# 🧪 Test URLs - Admin Editor → Frontend Connection

**Deployment Date:** 2025-12-11  
**Status:** ✅ **DEPLOYED**  
**Build Directory:** `.next-azteka` (isolated, no conflicts)

---

## ✅ Deployment Status

- ✅ **Build:** Completed successfully (65 pages generated)
- ✅ **PM2:** `azteka-nextjs` online (port 3002)
- ✅ **PM2:** `azteka-worker` online (port 3003)
- ✅ **Nginx:** Configured and valid
- ✅ **Build Isolation:** Using `.next-azteka` (no conflicts with other apps)

---

## 🔗 Test URLs

### **1. Frontend Catalog (Main Test)**
**URL:** https://aztekafoods.com/catalog

**What to Test:**
- ✅ Page loads without 500 errors
- ✅ Products display correctly
- ✅ Hero banner appears if admin configured it
- ✅ No hardcoded fallback (should be empty if admin didn't set it)

---

### **2. Admin Catalog Layout Editor**
**URL:** https://aztekafoods.com/admin/catalog/layout

**What to Test:**
- ✅ Page loads
- ✅ Can set hero banner:
  - Title/Headline
  - Subtitle/Subheadline
  - Image URL
  - CTA Text & Link
  - Theme
  - Active toggle
- ✅ Click "Save Hero Banner"
- ✅ Success message appears
- ✅ Changes appear on `/catalog` immediately

---

### **3. Admin Menu Editor**
**URL:** https://aztekafoods.com/admin/menu-editor

**What to Test:**
- ✅ Page loads
- ✅ Can edit products
- ✅ Can edit categories
- ✅ Can edit brands
- ✅ Changes save successfully

---

### **4. API Endpoints (Direct Testing)**

#### **Get Catalog Layout (Frontend reads this)**
```bash
curl https://aztekafoods.com/api/admin/catalog/layout
```

**Expected Response:**
```json
{
  "heroBanner": {
    "active": true,
    "title": "...",
    "headline": "...",
    ...
  },
  "showcase": [...],
  "promos": [...],
  ...
}
```

#### **Save Hero Banner (Admin saves this)**
```bash
curl -X POST https://aztekafoods.com/api/admin/catalog/layout \
  -H "Content-Type: application/json" \
  -d '{
    "key": "hero_banner",
    "value": {
      "active": true,
      "title": "Test Hero Banner",
      "headline": "Welcome to Azteka Foods",
      "subtitle": "Premium wholesale products",
      "imageUrl": "/uploads/hero.jpg",
      "ctaText": "Shop Now",
      "ctaLink": "/catalog",
      "theme": "default"
    }
  }'
```

#### **Get Products**
```bash
curl https://aztekafoods.com/api/admin/products
```

#### **Get Catalog Products**
```bash
curl https://aztekafoods.com/api/catalog/products?limit=10
```

---

## 🧪 Step-by-Step Test Flow

### **Test 1: Admin → Frontend Connection**

1. **Go to Admin Editor:**
   - Visit: https://aztekafoods.com/admin/catalog/layout
   - Login if needed

2. **Set Hero Banner:**
   - Title: "Welcome to Azteka Foods"
   - Headline: "Premium Wholesale Products"
   - Subtitle: "Your trusted distribution partner"
   - Image URL: `/uploads/hero-banner.jpg` (or any image)
   - CTA Text: "Shop Now"
   - CTA Link: `/catalog`
   - Theme: `default`
   - Active: ✅ Checked

3. **Click "Save Hero Banner"**
   - Should see success message

4. **Go to Frontend:**
   - Visit: https://aztekafoods.com/catalog
   - **Verify:** Hero banner should appear at top with your settings

5. **Test Deactivation:**
   - Go back to admin
   - Uncheck "Active"
   - Save
   - Refresh `/catalog`
   - **Verify:** Hero banner should disappear (no hardcoded fallback)

---

### **Test 2: Product Editing**

1. **Go to Menu Editor:**
   - Visit: https://aztekafoods.com/admin/menu-editor

2. **Edit a Product:**
   - Click on any product
   - Change name or price
   - Save

3. **Check Frontend:**
   - Visit: https://aztekafoods.com/catalog
   - **Verify:** Product changes appear

---

### **Test 3: API Direct Test**

```bash
# 1. Save hero banner via API
curl -X POST https://aztekafoods.com/api/admin/catalog/layout \
  -H "Content-Type: application/json" \
  -d '{
    "key": "hero_banner",
    "value": {
      "active": true,
      "title": "API Test",
      "headline": "This was set via API",
      "subtitle": "Testing admin connection",
      "ctaText": "Shop Now",
      "ctaLink": "/catalog",
      "theme": "default"
    }
  }'

# 2. Get layout (should include your hero banner)
curl https://aztekafoods.com/api/admin/catalog/layout | jq '.heroBanner'

# 3. Check frontend
# Visit: https://aztekafoods.com/catalog
# Should see "This was set via API" in hero banner
```

---

## 🔍 Verification Checklist

### **Build Fix:**
- [x] Build completed without errors
- [x] `.next-azteka` directory created (isolated)
- [x] No conflicts with other Next.js apps
- [ ] `/catalog` loads without 500 errors
- [ ] `/admin/catalog/layout` loads without 500 errors

### **Admin → Frontend Connection:**
- [ ] Admin can save hero banner
- [ ] Hero banner appears on frontend
- [ ] No hardcoded fallback (empty if not set)
- [ ] Cache invalidation works (changes appear immediately)

### **API Endpoints:**
- [ ] `GET /api/admin/catalog/layout` returns heroBanner
- [ ] `POST /api/admin/catalog/layout` saves successfully
- [ ] `GET /api/admin/products` works
- [ ] `GET /api/catalog/products` works

---

## 🐛 Troubleshooting

### **If `/catalog` shows 500 error:**
```bash
# Check logs
ssh root@77.243.85.8 'pm2 logs azteka-nextjs --lines 50'

# Check if port is listening
ssh root@77.243.85.8 'lsof -iTCP:3002 -sTCP:LISTEN'

# Restart if needed
ssh root@77.243.85.8 'pm2 restart azteka-nextjs'
```

### **If hero banner doesn't appear:**
1. Check admin saved it: `curl https://aztekafoods.com/api/admin/catalog/layout | jq '.heroBanner'`
2. Verify `active: true` in the response
3. Check browser console for errors
4. Verify build included the changes

### **If changes don't appear:**
1. Clear browser cache
2. Check cache invalidation: `revalidateTag('catalog-layout')` was called
3. Hard refresh: `Ctrl+Shift+R` (or `Cmd+Shift+R` on Mac)

---

## 📊 Server Status

**PM2 Processes:**
- ✅ `azteka-nextjs` - Online (port 3002)
- ✅ `azteka-worker` - Online (port 3003)
- ✅ Other apps unaffected (using different build directories)

**Build Isolation:**
- ✅ Using `.next-azteka` (unique directory)
- ✅ No conflicts with `alessa-ordering` or other apps
- ✅ Each app has its own build directory

---

## 🎯 Success Criteria

✅ **Deployment:** Completed successfully  
✅ **Build:** No conflicts with other apps  
⏳ **Testing:** Ready for manual testing  
⏳ **Verification:** Admin → Frontend connection needs testing

---

**Next:** Test the URLs above and verify admin changes appear in frontend!
