# White Page - Most Likely Issues

## 🔍 What I Found

The `fetchFromAPI` function exists and is correctly imported. However, there are a few potential issues:

### Issue 1: API_BASE Environment Variable

**The Problem:**
```typescript
const API_BASE = import.meta.env?.VITE_API_URL ?? '';
```

If `VITE_API_URL` is not set, `API_BASE` is an empty string, which means:
- `fetchFromAPI('api/products')` becomes `fetch('/api/products')`
- This should work, but might fail if the API is on a different domain

**Check:**
```bash
# Check if VITE_API_URL is set in .env
ssh root@77.243.85.8 "
  cd /srv/azteka-dsd
  grep VITE_API_URL .env
"
```

**Fix:**
If not set, add to `.env`:
```
VITE_API_URL=https://aztekafoods.com
```

### Issue 2: Silent Failures

**The Problem:**
The `fetchFromAPI` function returns an empty array on error:
```typescript
catch (error) {
  console.error(`Error fetching ${endpoint}:`, error);
  return [];  // Returns empty array, might cause white page
}
```

If the API call fails, it returns `[]`, which might cause the app to render with no data, appearing as a white page.

**Check Browser Console:**
- Open DevTools (F12)
- Check Console tab for errors like:
  - `Error fetching api/products: ...`
  - `Failed to fetch`
  - `CORS policy error`

### Issue 3: API Endpoint Mismatch

**The Problem:**
The function calls `api/products` but the actual endpoint might be `/api/products` (with leading slash).

**Check:**
```bash
# Test API endpoint
curl https://aztekafoods.com/api/products
curl https://aztekafoods.com/api/health
```

### Issue 4: CORS Issues

**The Problem:**
If CORS is not configured correctly, the browser will block the API request, causing a white page.

**Check:**
```bash
# Check CORS headers
curl -I -H "Origin: https://aztekafoods.com" https://aztekafoods.com/api/products
```

**Fix:**
Make sure `server.mjs` has CORS configured:
```javascript
app.use(cors({
  origin: ['https://aztekafoods.com', 'http://localhost:5173'],
  credentials: true
}));
```

## 🚀 Quick Diagnostic Steps

### Step 1: Check Browser Console

1. Open https://aztekafoods.com
2. Press F12 to open DevTools
3. Go to Console tab
4. Look for errors:
   - `Error fetching api/products: ...`
   - `Failed to fetch`
   - `CORS policy error`
   - `fetchFromAPI is not defined`

### Step 2: Check Network Tab

1. Go to Network tab in DevTools
2. Refresh the page
3. Look for:
   - `/api/products` request
   - Status code (200, 404, 500, etc.)
   - CORS errors

### Step 3: Run Diagnostic Script

```bash
# Copy script to VPS
scp debug-white-page-deep.sh root@77.243.85.8:/root/

# SSH into VPS
ssh root@77.243.85.8

# Run diagnostic
bash debug-white-page-deep.sh
```

## 🔧 Most Likely Fixes

### Fix 1: Check Environment Variable

```bash
ssh root@77.243.85.8 "
  cd /srv/azteka-dsd
  
  # Check if VITE_API_URL is set
  if grep -q VITE_API_URL .env; then
    echo '✅ VITE_API_URL is set'
    grep VITE_API_URL .env
  else
    echo '❌ VITE_API_URL not set'
    echo 'Add to .env:'
    echo 'VITE_API_URL=https://aztekafoods.com'
  fi
  
  # Rebuild if needed
  if ! grep -q VITE_API_URL .env; then
    echo 'VITE_API_URL=https://aztekafoods.com' >> .env
    npm run build
    systemctl reload nginx
  fi
"
```

### Fix 2: Check CORS Configuration

```bash
ssh root@77.243.85.8 "
  cd /srv/azteka-dsd
  
  # Check CORS in server.mjs
  grep -A 5 'cors' server.mjs
  
  # If missing, add CORS
  # app.use(cors({
  #   origin: ['https://aztekafoods.com'],
  #   credentials: true
  # }));
"
```

### Fix 3: Test API Directly

```bash
# Test from browser perspective
curl -v https://aztekafoods.com/api/products

# Test with CORS headers
curl -I -H "Origin: https://aztekafoods.com" https://aztekafoods.com/api/products | grep -i access-control
```

## 📝 What to Share

If you still have issues, share:

1. **Browser Console Output:**
   - Screenshot or copy/paste of errors
   - Any red error messages

2. **Network Tab:**
   - Screenshot of `/api/products` request
   - Status code and response

3. **Diagnostic Script Output:**
   - Run `debug-white-page-deep.sh` and share output

## 🎯 Most Likely Issue

Based on the code, the most likely issue is:

1. **API call failing silently** - Returns empty array, app renders with no data
2. **CORS blocking** - Browser blocking API request
3. **Environment variable missing** - `VITE_API_URL` not set

**Check browser console first!** That will tell you exactly what's wrong.

