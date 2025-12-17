# 🔄 Service Worker Cache Fix

**Date:** November 8, 2025
**Time:** 22:38 UTC
**Issue:** Service Worker caching old JavaScript bundles

---

## The Problem

Even after deploying the fixed code (with `buildUrl()` function), users may still see the white page because the **Service Worker is serving cached JavaScript bundles** from before the fix.

### How Service Workers Cache

The Service Worker ([public/sw.js](public/sw.js)) uses a "cache-first" strategy for scripts:

```javascript
// Line 72-98 of sw.js
if (
  request.destination === 'style' ||
  request.destination === 'script' ||  // ← Scripts are cached!
  request.destination === 'image' ||
  request.destination === 'font'
) {
  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;  // ← Returns OLD cached bundle
      }
      // ... fetch from network if not cached
    })
  );
}
```

**Result:** Browser serves the **old cached bundle** (`index-8LsLuw6e.js`) instead of the new fixed bundle (`index-BVR72RHx.js`).

---

## The Fix (Two-Part Solution)

### Part 1: Update Service Worker Cache Version ✅ **DONE**

**File:** `public/sw.js`

```diff
- const CACHE_NAME = 'azteka-dsd-v1';
- const RUNTIME_CACHE = 'azteka-runtime';
+ const CACHE_NAME = 'azteka-dsd-v2';  // Incremented to bust cache
+ const RUNTIME_CACHE = 'azteka-runtime-v2';
```

**Deployed at:** 22:38 UTC

When the Service Worker updates, it will:
1. Install the new Service Worker with `v2` cache names
2. Delete the old `v1` caches during activation (lines 26-39)
3. Fetch fresh JavaScript bundles from the network

### Part 2: Users Must Clear Browser Cache

Even with the updated Service Worker, **users need to take action** to clear their browser cache.

---

## User Instructions

### Option 1: Unregister Service Worker (Recommended)

1. **Open Developer Tools**
   - Windows/Linux: Press `F12` or `Ctrl + Shift + I`
   - Mac: Press `Cmd + Option + I`

2. **Go to Application Tab**
   - Click "Application" in the top menu bar of DevTools

3. **Unregister Service Worker**
   - In the left sidebar, click "Service Workers"
   - Find the entry for `aztekafoods.com`
   - Click "Unregister" button

4. **Hard Refresh**
   - Windows/Linux: `Ctrl + Shift + R`
   - Mac: `Cmd + Shift + R`

5. **Verify**
   - Service Worker will re-register automatically
   - New cache version (`v2`) will be used
   - Fresh JavaScript bundles will load

### Option 2: Clear Site Data (Nuclear Option)

1. **Open Developer Tools** (`F12`)

2. **Go to Application Tab**

3. **Clear Storage**
   - In the left sidebar, click "Storage" → "Clear storage"
   - Check all boxes:
     - [x] Unregister service workers
     - [x] Local and session storage
     - [x] IndexedDB
     - [x] Web SQL
     - [x] Cookies
     - [x] Cache storage
   - Click "Clear site data" button

4. **Hard Refresh**
   - Windows/Linux: `Ctrl + Shift + R`
   - Mac: `Cmd + Shift + R`

### Option 3: Incognito/Private Window

1. **Open Incognito/Private Window**
   - Chrome: `Ctrl + Shift + N` (Windows) or `Cmd + Shift + N` (Mac)
   - Firefox: `Ctrl + Shift + P` (Windows) or `Cmd + Shift + P` (Mac)

2. **Visit** https://aztekafoods.com

3. **Verify** - Should load fresh without cache

---

## How to Verify the Fix Worked

### Step 1: Check Console (Before Fix)
```
❌ SW registered: ServiceWorkerRegistration {scope: "https://aztekafoods.com/", active: ServiceWorker}
❌ Error: [some JavaScript error from old code]
```

### Step 2: Unregister Service Worker + Hard Refresh

### Step 3: Check Console (After Fix)
```
✅ SW registered: ServiceWorkerRegistration {scope: "https://aztekafoods.com/", active: ServiceWorker}
✅ (No errors)
✅ Products displayed on page
```

### Step 4: Check Network Tab
1. Open DevTools (`F12`)
2. Go to "Network" tab
3. Filter by "JS" or search for "index-"
4. Look for the JavaScript bundle filename

**Before fix:**
```
index-8LsLuw6e.js  ❌ (Old bundle)
Status: 200 (from Service Worker)
```

**After fix:**
```
index-BVR72RHx.js  ✅ (New bundle with buildUrl fix)
Status: 200 (from network or fresh cache)
```

### Step 5: Check Application Tab → Cache Storage
1. Open DevTools (`F12`)
2. Go to "Application" tab
3. Expand "Cache Storage" in left sidebar

**Before fix:**
```
❌ azteka-dsd-v1
❌ azteka-runtime
```

**After fix:**
```
✅ azteka-dsd-v2
✅ azteka-runtime-v2
```

---

## Why Service Workers Are Aggressive

Service Workers are **designed** to aggressively cache assets for offline functionality. This is great for:
- ✅ Progressive Web Apps (PWAs)
- ✅ Offline support
- ✅ Faster load times
- ✅ Reduced bandwidth

But it's **terrible** for hot-fixes because:
- ❌ Old code persists even after deployment
- ❌ Users must manually clear cache
- ❌ Hard refreshes alone don't work
- ❌ Can take hours/days for users to get updates

---

## Prevention: Cache Versioning Strategy

### Current Approach (Manual)
```javascript
const CACHE_NAME = 'azteka-dsd-v2';  // ← Manually increment
```

**Problem:** Easy to forget to increment when deploying fixes.

### Better Approach (Automated)
```javascript
// Use build timestamp or git commit hash
const CACHE_VERSION = '__BUILD_TIMESTAMP__';  // Replaced during build
const CACHE_NAME = `azteka-dsd-${CACHE_VERSION}`;
```

**Implementation:**
```javascript
// vite.config.ts
import { defineConfig } from 'vite';

export default defineConfig({
  define: {
    '__BUILD_TIMESTAMP__': JSON.stringify(Date.now()),
  },
  // ... rest of config
});
```

Then in `sw.js`:
```javascript
const CACHE_VERSION = '__BUILD_TIMESTAMP__';  // Auto-replaced by Vite
const CACHE_NAME = `azteka-dsd-${CACHE_VERSION}`;
```

**Result:** Every build gets a unique cache version automatically! 🎉

---

## When to Increment Cache Version

### Always Increment When:
- ✅ Fixing JavaScript bugs (like the `buildUrl()` fix)
- ✅ Updating React components
- ✅ Changing API client logic
- ✅ Modifying business logic

### Can Skip When:
- ⚠️ Backend-only changes (server.mjs, Prisma, etc.)
- ⚠️ Database migrations
- ⚠️ Environment variable updates
- ⚠️ Documentation changes

**Rule of Thumb:** If it changes anything in `dist/`, increment the cache version.

---

## Deployment Checklist (Updated)

```bash
# 1. Make code changes
# 2. Increment Service Worker cache version
sed -i "s/azteka-dsd-v[0-9]/azteka-dsd-v$(date +%s)/" public/sw.js

# 3. Build
npm run build

# 4. Deploy to VPS
ssh root@77.243.85.8 "rm -rf /srv/azteka-dsd/dist/*"
scp -r dist/* root@77.243.85.8:/srv/azteka-dsd/dist/

# 5. Reload nginx
ssh root@77.243.85.8 "systemctl reload nginx"

# 6. Verify
ssh root@77.243.85.8 "head -3 /srv/azteka-dsd/dist/sw.js"
# Should show new cache version

# 7. Test in browser
# - Open https://aztekafoods.com in incognito window
# - Should load without issues

# 8. Tell users to clear cache
# - Post announcement: "Clear your browser cache for latest updates"
```

---

## Alternative: Disable Service Worker (For Now)

If Service Worker caching is causing too many issues, you can temporarily disable it:

### Option A: Comment Out Registration

**File:** `index.html`

```diff
  <script>
    // Register Service Worker for PWA functionality
-   if ('serviceWorker' in navigator) {
-     window.addEventListener('load', () => {
-       navigator.serviceWorker.register('/sw.js')
-         .then((registration) => {
-           console.log('SW registered:', registration);
-         })
-         .catch((error) => {
-           console.log('SW registration failed:', error);
-         });
-     });
-   }
+   // Service Worker temporarily disabled during migration
+   // if ('serviceWorker' in navigator) {
+   //   window.addEventListener('load', () => {
+   //     navigator.serviceWorker.register('/sw.js')
+   //       .then((registration) => {
+   //         console.log('SW registered:', registration);
+   //       })
+   //       .catch((error) => {
+   //         console.log('SW registration failed:', error);
+   //       });
+   //   });
+   // }
  </script>
```

### Option B: Unregister Existing Service Workers

**Create:** `public/unregister-sw.js`

```javascript
// Unregister all service workers
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations().then((registrations) => {
    for (let registration of registrations) {
      registration.unregister();
      console.log('Unregistered SW:', registration.scope);
    }
  });
}
```

**Update:** `index.html`

```diff
- <script type="module" src="/src/main.tsx"></script>
+ <script src="/unregister-sw.js"></script>
+ <script type="module" src="/src/main.tsx"></script>
```

**After users visit once:** Remove `unregister-sw.js` and restore normal SW registration.

---

## Current Status

**Service Worker Cache Version:** `v2` ✅
**Deployed:** 22:38 UTC ✅
**JavaScript Bundle:** `index-BVR72RHx.js` (with `buildUrl()` fix) ✅

**User Action Required:**
1. Unregister Service Worker in DevTools
2. Hard refresh (`Ctrl + Shift + R`)
3. Or use incognito window

**Expected Result:**
- White page resolved ✅
- Products load correctly ✅
- No JavaScript errors ✅

---

## Testing Commands

```bash
# Check deployed SW version
ssh root@77.243.85.8 "head -3 /srv/azteka-dsd/dist/sw.js"

# Check deployed bundle
ssh root@77.243.85.8 "ls -lh /srv/azteka-dsd/dist/assets/ | grep index"

# Test in browser (from VPS)
ssh root@77.243.85.8 "curl -s https://aztekafoods.com | grep -o 'index-[a-zA-Z0-9]*.js'"

# Should return: index-BVR72RHx.js
```

---

## Summary

**Root Cause:** Service Worker aggressively caches JavaScript bundles, serving old code even after deployment.

**Fix Applied:**
1. ✅ Incremented cache version from `v1` to `v2` in `sw.js`
2. ✅ Deployed updated Service Worker at 22:38 UTC
3. ⏳ **Users must clear browser cache** (not automatic)

**Next Steps:**
1. Clear browser cache (unregister SW + hard refresh)
2. Verify products load correctly
3. Consider automated cache versioning for future deployments

**Status:** Service Worker updated and deployed. Users need to clear cache to receive the fix.
