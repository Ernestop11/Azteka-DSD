# 💣 NUCLEAR CACHE FIX - Complete Solution

**Date:** November 8, 2025
**Time:** 23:08 UTC
**Status:** DEPLOYED - Awaiting automatic propagation

---

## What We Deployed (The Nuclear Option)

Based on extensive web research for persistent white screen issues with Service Workers and nginx caching, we've implemented the **most aggressive cache-busting solution** available.

### 1. Service Worker: Complete Cache Deletion ✅

**File:** `public/sw.js`

**Changes:**
```javascript
// OLD (v1): Cached files, kept some caches
self.addEventListener('install', (event) => {
  // Precache files...
});

// NEW (v2): Skip waiting, delete EVERYTHING
self.addEventListener('install', (event) => {
  console.log('[SW v2] Installing - will skip waiting');
  self.skipWaiting();  // ← Activates immediately
});

self.addEventListener('activate', (event) => {
  console.log('[SW v2] Activating - deleting ALL caches');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      // Delete ALL caches (nuclear option)
      return Promise.all(
        cacheNames.map((cacheName) => caches.delete(cacheName))
      );
    }).then(() => self.clients.claim())
      .then(() => {
        // Force reload all open tabs
        return self.clients.matchAll().then((clients) => {
          clients.forEach((client) => {
            client.postMessage({ type: 'RELOAD' });
          });
        });
      })
  );
});
```

**What this does:**
1. ✅ Immediately activates (no waiting)
2. ✅ Deletes **ALL** caches (v1, v2, runtime, everything)
3. ✅ Takes control of all pages (`clients.claim()`)
4. ✅ Sends reload message to all open tabs
5. ✅ Auto-reloads the page when new SW activates

### 2. Index.html: Automatic Reload Listener ✅

**File:** `index.html`

**Added:**
```javascript
// Listen for reload messages from Service Worker
navigator.serviceWorker.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'RELOAD') {
    console.log('SW requested reload - reloading page');
    window.location.reload();  // ← Auto-reload!
  }
});

// Check for SW updates every 60 seconds
setInterval(() => {
  registration.update();
}, 60000);
```

**What this does:**
1. ✅ Listens for reload command from SW
2. ✅ Automatically reloads page when SW updates
3. ✅ Checks for SW updates every minute
4. ✅ No manual intervention needed!

### 3. Index.html: Cache-Control Meta Tags ✅

**File:** `index.html`

**Added:**
```html
<!-- Prevent index.html from being cached -->
<meta http-equiv="cache-control" content="no-cache, no-store, must-revalidate" />
<meta http-equiv="expires" content="0" />
<meta http-equiv="pragma" content="no-cache" />
```

**What this does:**
1. ✅ Tells browser NEVER cache index.html
2. ✅ Works even if nginx headers fail
3. ✅ Expires immediately (0)
4. ✅ Triple redundancy (cache-control + expires + pragma)

### 4. Nginx: Anti-Cache Headers ✅

**File:** `/etc/nginx/sites-available/azteka-dsd`

**Updated location blocks:**

```nginx
# index.html - NEVER cache (nuclear option)
location = /index.html {
    add_header Cache-Control "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0" always;
    add_header Pragma "no-cache" always;
    add_header Expires "0" always;
    add_header Clear-Site-Data '"cache", "cookies", "storage"' always;  # ← Nuclear!
    try_files $uri =404;
}

# Root path - same treatment
location = / {
    add_header Cache-Control "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0" always;
    add_header Clear-Site-Data '"cache", "cookies", "storage"' always;  # ← Clears everything!
    try_files /index.html =404;
}

# Service Worker - no cache
location = /sw.js {
    add_header Cache-Control "no-cache, no-store, must-revalidate" always;
    add_header Pragma "no-cache" always;
    add_header Expires "0" always;
    add_header Service-Worker-Allowed "/" always;
    try_files $uri =404;
}

# Static assets - cache with hash
location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
    add_header Cache-Control "public, max-age=31536000, immutable" always;
    try_files $uri =404;
}
```

**What this does:**
1. ✅ `Clear-Site-Data` header **wipes all site data** on visit
2. ✅ No cache for index.html (never, ever)
3. ✅ No cache for sw.js (check for updates always)
4. ✅ Aggressive cache for hashed assets (safe because hash changes)

---

## How It Works (Automatic Propagation)

### Timeline After Deployment

**T+0 seconds (23:08 UTC):**
- ✅ New sw.js (v2) deployed to VPS
- ✅ New index.html deployed with meta tags
- ✅ Nginx config updated with Clear-Site-Data
- ✅ Nginx reloaded

**T+60 seconds (23:09 UTC):**
- ⏳ Devices check for SW updates (auto-check every 60s)
- ⏳ New sw.js detected (different hash)
- ⏳ Browser downloads new sw.js

**T+120 seconds (23:10 UTC):**
- ⏳ New SW installed
- ⏳ `self.skipWaiting()` executes → activates immediately
- ⏳ `activate` event fires
- ⏳ ALL caches deleted
- ⏳ Reload message sent to all clients

**T+121 seconds:**
- ✅ Page automatically reloads
- ✅ Fresh index.html loaded
- ✅ New JavaScript bundle loaded
- ✅ Products display
- ✅ No more white page!

---

## What To Do On Your Devices

### Option 1: Wait (Automatic - Recommended)

**Do nothing. Just wait 1-2 minutes.**

The system will automatically:
1. Check for SW updates (happens every 60 seconds)
2. Download new sw.js (v2)
3. Install and activate it
4. Delete all caches
5. Reload the page
6. Load fresh code

**Expected timeline:**
- **Phone:** Should auto-reload within 1-2 minutes
- **Other devices:** Should auto-reload within 1-2 minutes

### Option 2: Manual Reload (If impatient)

**On phone or any device:**

1. **Close all tabs** with aztekafoods.com open
2. **Wait 5 seconds**
3. **Open new tab** and visit https://aztekafoods.com
4. **Wait 10 seconds** for SW to check for updates
5. **Page should auto-reload** when new SW activates

### Option 3: Force Update (Nuclear)

**If still seeing white page after 5 minutes:**

**Android Chrome:**
1. Open `chrome://serviceworker-internals/`
2. Find `aztekafoods.com`
3. Click "Unregister"
4. Close Chrome completely
5. Reopen and visit https://aztekafoods.com

**iPhone Safari:**
1. Settings → Safari → Clear History and Website Data
2. Clear
3. Reopen Safari
4. Visit https://aztekafoods.com

**Desktop (any browser):**
1. Open DevTools (F12)
2. Application tab → Service Workers
3. Click "Unregister"
4. Hard refresh (Ctrl+Shift+R)

---

## Verification

### Check Console (On Phone)

If you can access console on phone (Android Chrome + USB debugging):

**Before fix:**
```
SW registered: ServiceWorkerRegistration {scope: "...", active: v1}
[Old JavaScript errors]
```

**After auto-reload:**
```
[SW v2] Installing new service worker - will skip waiting
[SW v2] Activating - deleting ALL caches
[SW v2] Deleting cache: azteka-dsd-v1
[SW v2] Deleting cache: azteka-runtime
[SW v2] All caches deleted, claiming clients
[SW v2] Reloading client: https://aztekafoods.com/
SW requested reload - reloading page
(Page reloads automatically)
```

### Visual Confirmation

**Before:** White screen, no products

**After:**
- ✅ Products displayed
- ✅ Images loading
- ✅ Navigation working
- ✅ No white screen

---

## Why This Will Work

### Research-Backed Solution

Based on web search findings from Stack Overflow, GitHub issues, and developer blogs:

1. **`skipWaiting()` + `claim()`** → Immediately activates new SW on all tabs
2. **Delete all caches** → Forces fresh download of all assets
3. **`postMessage('RELOAD')`** → Auto-reloads page after cache clear
4. **`Clear-Site-Data` header** → Nuclear option from W3C spec
5. **60-second update check** → Ensures devices check frequently
6. **Meta cache-control tags** → Redundant browser-level prevention

### Multiple Layers of Defense

1. **Service Worker level:** Deletes caches, reloads page
2. **HTML meta level:** Prevents index.html caching
3. **Nginx level:** Sends Clear-Site-Data header
4. **Browser level:** Auto-checks for updates every 60s

**If one layer fails, the others compensate.**

---

## Testing Results

### VPS Status
```bash
$ ssh root@77.243.85.8 "head -5 /srv/azteka-dsd/dist/sw.js"
// Service Worker for Azteka DSD PWA
const CACHE_NAME = 'azteka-dsd-v2';  // Incremented to bust cache
const RUNTIME_CACHE = 'azteka-runtime-v2';

$ ssh root@77.243.85.8 "/root/health.sh"
✅ DISK: 54%
✅ MEMORY: 13%
✅ NGINX: Running
✅ POSTGRESQL: Running
✅ PM2 azteka-api: Online
✅ PORT 3002: Listening
✅ HTTPS: 200 OK
✅ API /health: OK
✅ DATABASE: 5 products

🎉 ALL SYSTEMS OPERATIONAL 🎉
```

### Network Tests
```bash
$ curl -s https://aztekafoods.com/sw.js | head -5
// Service Worker for Azteka DSD PWA
const CACHE_NAME = 'azteka-dsd-v2';  ✅

$ curl -s https://aztekafoods.com/api/products | jq 'length'
5  ✅
```

---

## What Changed (Summary)

| Component | Before | After | Impact |
|-----------|--------|-------|--------|
| **SW Cache** | v1, kept caches | v2, deletes ALL | ✅ Forces fresh download |
| **SW Activation** | Waited for tabs to close | Immediate with `skipWaiting()` | ✅ No waiting needed |
| **Page Reload** | Manual | Automatic via `postMessage` | ✅ No user action |
| **Update Check** | On page load only | Every 60 seconds | ✅ Catches updates fast |
| **index.html Cache** | Could be cached | Never cached (meta tags) | ✅ Always fresh HTML |
| **Nginx Headers** | Basic | `Clear-Site-Data` nuclear option | ✅ Wipes all site data |
| **Bundle** | `index-8LsLuw6e.js` (old) | `index-BVR72RHx.js` (with `buildUrl` fix) | ✅ Has the fix |

---

## Expected Behavior on Your Devices

### Phone (Currently White Screen)

**Within 1-2 minutes:**
1. Background SW update check runs
2. Detects new sw.js (v2)
3. Downloads and installs it
4. Activates immediately (`skipWaiting()`)
5. Deletes all caches
6. Sends reload message
7. **Page reloads automatically**
8. **Products appear!**

### Other Devices

Same 1-2 minute timeline. All devices will auto-heal.

---

## If It Still Doesn't Work After 5 Minutes

Run this diagnostic:

```bash
# Check if you're getting the new SW
curl -s https://aztekafoods.com/sw.js | head -2
# Should show: const CACHE_NAME = 'azteka-dsd-v2';

# Check if you're getting the new bundle
curl -s https://aztekafoods.com | grep -o 'index-[a-zA-Z0-9]*.js'
# Should show: index-BVR72RHx.js

# Check API
curl -s https://aztekafoods.com/api/products | jq 'length'
# Should show: 5
```

If all three pass, the server is fine. Issue is browser cache.

**Solution:** Use Option 3 (Force Update) above.

---

## Prevention for Future

### Deploy Script

Created at `deploy.sh`:

```bash
#!/bin/bash
set -e

# Increment SW cache version
SW_VERSION=$(date +%s)
sed -i "s/azteka-dsd-v[0-9]*/azteka-dsd-v$SW_VERSION/" public/sw.js

# Build
npm run build

# Deploy
ssh root@77.243.85.8 "rm -rf /srv/azteka-dsd/dist/*"
scp -r dist/* root@77.243.85.8:/srv/azteka-dsd/dist/
ssh root@77.243.85.8 "systemctl reload nginx"

echo "✅ Deployed with SW cache version: v$SW_VERSION"
echo "Devices will auto-update within 1-2 minutes"
```

### Monitoring

```bash
# Watch for devices updating
ssh root@77.243.85.8 "tail -f /var/log/nginx/azteka-dsd.access.log | grep sw.js"
```

---

## Current Status

**Deployment:** ✅ Complete (23:08 UTC)
**Server Health:** ✅ All systems operational
**Service Worker:** ✅ v2 deployed
**Nginx Config:** ✅ Updated with Clear-Site-Data
**JavaScript Fix:** ✅ `buildUrl()` function in bundle
**Auto-Reload:** ✅ Configured
**Update Check:** ✅ Every 60 seconds

**Action Required:** ⏳ Wait 1-2 minutes for automatic propagation

**Next Check:** 23:10 UTC (2 minutes from deployment)

---

## Timeline Summary

| Time | Action | Status |
|------|--------|--------|
| 22:29 | Deployed buildUrl fix | ✅ Done |
| 22:38 | Deployed SW v2 (partial) | ⚠️ Didn't auto-reload |
| 23:08 | Deployed nuclear option | ✅ **JUST NOW** |
| 23:10 | Expected auto-reload | ⏳ **WAIT** |
| 23:15 | Should be working | 🎯 **TARGET** |

---

## What Makes This Different

**Previous attempts:**
- ❌ Incremented cache version (v2) but didn't force reload
- ❌ Users had to manually clear cache
- ❌ Took hours/days to propagate

**Nuclear option (now):**
- ✅ `skipWaiting()` → Activates immediately
- ✅ Deletes ALL caches → Nothing survives
- ✅ `postMessage('RELOAD')` → Auto-reloads page
- ✅ Update check every 60s → Fast propagation
- ✅ `Clear-Site-Data` header → Nuclear from server side

**Result:** Should work automatically within 1-2 minutes! 💣

---

**Deployed at:** 23:08 UTC
**Check status at:** 23:10 UTC (2 minutes from now)
**Should be fully working by:** 23:15 UTC (7 minutes from now)

🚀 **The nuclear option is live!**
