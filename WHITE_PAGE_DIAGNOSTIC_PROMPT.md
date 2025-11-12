# White Page Diagnostic Prompt

## 🚨 CRITICAL: AppTest Works, AppMinimal Shows White Screen

Copy this prompt into VS Code Claude chat:

---

```
I have a white page issue. Here's what happened:

1. AppTest.tsx works perfectly - shows "Success! Got 5 products" (green message)
2. AppMinimal.tsx shows white screen (nothing renders)

This means:
- ✅ React is mounting
- ✅ API is working (/api/products returns 5 products)
- ✅ JavaScript is loading
- ❌ Something in AppMinimal is breaking

AppMinimal uses ProductCard component. AppTest doesn't use ProductCard.

The issue is likely:
- ProductCard component is crashing
- ProductCard expects properties that don't exist
- ProductCard has a JavaScript error
- Images are failing to load

Please:
1. Check ProductCard.tsx for any errors
2. Check what properties ProductCard expects vs what AppMinimal provides
3. Add error boundaries to catch ProductCard errors
4. Create a version that shows products WITHOUT ProductCard first (like AppTest but prettier)
5. Then gradually add ProductCard back with proper error handling

The app is at: /Users/ernestoponce/dev/azteka-dsd
API returns products with: id, name, sku, price, imageUrl, inStock, etc. (camelCase)

Fix the white page by making ProductCard fail gracefully or creating a version without it first!
```

---

## 🔍 Quick Diagnostic Steps

### Step 1: Check Browser Console

Open https://aztekafoods.com → F12 → Console tab

**Look for:**
- Red errors mentioning ProductCard
- "Cannot read property" errors
- Image loading errors
- Any React errors

**Share the exact error message!**

### Step 2: Check Network Tab

F12 → Network tab

**Check:**
- Is `index-BvLdZa43.js` loading? (Status should be 200)
- Is CSS loading? (`index-DMregp0p.css`)
- Are product images loading? (Check for 404s)

### Step 3: Use This Diagnostic Prompt

Copy the prompt above into VS Code Claude chat and let it fix ProductCard!

---

## 🚀 Alternative: Create Version Without ProductCard

If ProductCard is the issue, we can create a version that shows products without ProductCard first, then add it back:

```
Create AppSimple.tsx that:
- Fetches products from /api/products (like AppTest)
- Shows products in a simple grid WITHOUT ProductCard
- Uses basic HTML/CSS (no complex components)
- Works immediately

Then we can add ProductCard back with proper error handling.
```

---

## 📋 What To Share

1. **Browser Console Errors** - Copy/paste any red errors
2. **Network Tab** - Screenshot or list of failed requests
3. **What You See** - White page? Any content at all?
4. **AppTest Status** - Did it show "Success! Got 5 products"?

This will help identify the exact issue!

