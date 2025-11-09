# 🧪 TEST VERSION DEPLOYED

**Date:** November 9, 2025, 00:44 UTC
**Status:** ✅ **DIAGNOSTIC VERSION LIVE**

---

## What's Deployed

A **diagnostic test page** (`AppTest.tsx`) that will help us understand exactly what's happening.

### What It Does

1. ✅ Shows React is mounting
2. ✅ Fetches from `/api/products`
3. ✅ Displays detailed status
4. ✅ Shows all product properties
5. ✅ Logs everything to console

### Bundle Size

- **Before (AppMinimal):** 13.61 kB
- **Now (AppTest):** 4.00 kB
- **Even simpler!**

---

## How To Test

### Visit The Site

1. Go to: https://aztekafoods.com
2. **Clear cache** or use **incognito window**
3. You should see a green test page with:
   - "🧪 App Test Page" header
   - Status box showing progress
   - Products list (if successful)
   - Diagnostic info

### What You Should See

**If Everything Works:**
```
🧪 App Test Page

Status:
Success! Got 5 products

Products (5):
  Takis Fuego
    SKU: TAK-001 | Price: $24.99
    [Show all properties]

  Goya Black Beans
    SKU: GOY-001 | Price: $14.99
    [Show all properties]

  ... (3 more products)

Diagnostic Info:
  • API Endpoint: /api/products
  • Current URL: https://aztekafoods.com/
  • React mounted: Yes ✅
  • Products fetched: Yes ✅
```

**If There's An Error:**
```
🧪 App Test Page

Status:
Error: [error message]

Error:
[Detailed error message]
[Try Again button]

Diagnostic Info:
  • API Endpoint: /api/products
  • Current URL: https://aztekafoods.com/
  • React mounted: Yes ✅
  • Products fetched: No ❌
```

**If You See White Page:**
- React didn't mount
- JavaScript error preventing render
- Check browser console

---

## What To Look For

### Green Test Page

✅ **Good!** This means:
- React is working
- JavaScript is loading
- App is rendering

Now check:
- Is status "Success! Got X products"?
- Or is there an error message?

### Red Error Box

⚠️ **API Issue!** This means:
- React works
- But API call failed

Check the error message:
- HTTP 404? → API endpoint not found
- HTTP 500? → Backend error
- Network error? → Connection issue
- CORS error? → CORS headers wrong

### White Page

❌ **JavaScript Error!** This means:
- React not mounting
- Build issue
- Module loading error

Check browser console (F12):
- Look for red errors
- Note the error message
- Share screenshot

---

## Browser Console

### Open Console

1. Press **F12** (or Cmd+Opt+I on Mac)
2. Click **Console** tab
3. Look for logs

### Expected Console Logs

**Success:**
```
AppTest mounted
Fetching from /api/products...
Response received: 200 OK
Data parsed: (5) [{…}, {…}, {…}, {…}, {…}]
```

**Error:**
```
AppTest mounted
Fetching from /api/products...
Response received: 500 Internal Server Error
Error: HTTP 500: Internal Server Error
```

---

## Next Steps

### If Test Page Shows Success

✅ **API working!**
✅ **React working!**
✅ **Products fetched!**

**Problem was:** AppMinimal had an issue
**Solution:** We can debug AppMinimal or create a better minimal version

### If Test Page Shows Error

⚠️ **API issue!**

Check error message and:
1. Test API directly: `curl https://aztekafoods.com/api/products`
2. Check backend: `ssh root@77.243.85.8 "pm2 logs azteka-api"`
3. Fix API issue

### If White Page

❌ **React/Build issue!**

Check:
1. Browser console for errors
2. Network tab - is `index-DTqIg0Xu.js` loading?
3. Share console screenshot

---

## Deployment Info

### Files Deployed

```
/srv/azteka-dsd/dist/
├── index.html (3.11 kB)
├── assets/
│   ├── index-DTqIg0Xu.js (4.00 kB) ← Test version
│   ├── index-DMregp0p.css (46.78 kB)
│   └── react-vendor-YsBxPMQB.js (140.74 kB)
```

### Timestamps

- Built: 00:44 UTC
- Deployed: 00:44 UTC
- Bundle: `index-DTqIg0Xu.js`

---

## Why This Helps

### Isolates The Problem

**Test eliminates complexity:**
- ❌ No ProductCard component
- ❌ No complex state
- ❌ No styling issues
- ✅ Just: React mount → Fetch → Display

**If test works:**
- Problem is in AppMinimal
- Likely ProductCard expecting wrong props
- Or image loading issue

**If test fails:**
- Problem is more fundamental
- API issue
- React build issue
- Deployment issue

---

## Commands For You

### Check Deployment

```bash
# Check which bundle is served
curl -s https://aztekafoods.com | grep -o 'index-[a-zA-Z0-9]*.js'
# Should show: index-DTqIg0Xu.js

# Check if test file deployed
ssh root@77.243.85.8 "ls -lh /srv/azteka-dsd/dist/assets/index-*"
```

### Check API

```bash
# Test API directly
curl -s https://aztekafoods.com/api/products | jq '.[0]'

# Check backend logs
ssh root@77.243.85.8 "pm2 logs azteka-api --lines 20 --nostream"
```

### Check Frontend

```bash
# Check nginx logs
ssh root@77.243.85.8 "tail -20 /var/log/nginx/azteka-dsd.access.log"

# Check for errors
ssh root@77.243.85.8 "tail -20 /var/log/nginx/azteka-dsd.error.log"
```

---

## Share Results

After testing, please share:

1. **What you see:**
   - Green test page? ✅
   - Red error box? ⚠️
   - White page? ❌

2. **Status message:**
   - "Success! Got X products"?
   - Or error message?

3. **Console logs:**
   - F12 → Console
   - Copy any logs or errors

4. **Screenshots** (if helpful):
   - What the page looks like
   - Console tab
   - Network tab

This will help us identify the exact issue!

---

## Rollback If Needed

If you want to go back to AppMinimal:

```bash
cd /Users/ernestoponce/dev/azteka-dsd

# Edit main.tsx - change AppTest to AppMinimal
# Then rebuild and deploy
npm run build
ssh root@77.243.85.8 "rm -rf /srv/azteka-dsd/dist/*"
scp -r dist/* root@77.243.85.8:/srv/azteka-dsd/dist/
ssh root@77.243.85.8 "systemctl reload nginx"
```

---

**Status:** ✅ **TEST VERSION DEPLOYED**
**URL:** https://aztekafoods.com
**Bundle:** `index-DTqIg0Xu.js` (4 kB)
**Purpose:** Diagnose white page issue

🔍 **Please test and share what you see!**
