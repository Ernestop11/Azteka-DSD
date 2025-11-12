# Deep White Page Debugging Guide

## 🔍 The Problem

Despite the deployment being marked complete, you still see a white page. This suggests:

1. **JavaScript Error** - The app is loading but crashing
2. **Missing Function** - `fetchFromAPI` might not be defined
3. **API Error** - API calls might be failing
4. **CORS Issue** - Browser blocking API requests
5. **Build Issue** - Bundle might be corrupted or incomplete

## 🚀 Quick Diagnostic

Run this script on your VPS to check everything:

```bash
# Copy script to VPS
scp debug-white-page-deep.sh root@77.243.85.8:/root/

# SSH into VPS
ssh root@77.243.85.8

# Run diagnostic
bash debug-white-page-deep.sh
```

## 🔧 Common Issues & Fixes

### Issue 1: fetchFromAPI Not Defined

**Symptoms:**
- Browser console shows: `ReferenceError: fetchFromAPI is not defined`
- White page on load

**Fix:**
```bash
# Check if fetchFromAPI exists in source
ssh root@77.243.85.8 "
  cd /srv/azteka-dsd
  grep -r 'fetchFromAPI' src/
"

# If missing, check the correct location
grep -r 'fetchFromAPI' /Users/ernestoponce/dev/azteka-dsd/src/

# If it exists locally but not on VPS, sync again
cd /Users/ernestoponce/dev/azteka-dsd
git push origin main
ssh root@77.243.85.8 "cd /srv/azteka-dsd && git pull origin main && npm run build"
```

### Issue 2: API Calls Failing

**Symptoms:**
- Browser console shows: `Failed to fetch` or `Network error`
- Network tab shows 404 or 500 errors for `/api/products`

**Fix:**
```bash
# Check if API is accessible
ssh root@77.243.85.8 "
  curl http://localhost:3002/api/products
  curl http://localhost/api/products
"

# Check nginx proxy configuration
ssh root@77.243.85.8 "
  grep -A 5 'location /api' /etc/nginx/sites-enabled/*
"
```

### Issue 3: CORS Errors

**Symptoms:**
- Browser console shows: `CORS policy: No 'Access-Control-Allow-Origin' header`
- Network tab shows CORS errors

**Fix:**
```bash
# Check server.mjs for CORS configuration
ssh root@77.243.85.8 "
  cd /srv/azteka-dsd
  grep -A 10 'cors' server.mjs
"

# Add CORS if missing
# In server.mjs, add:
# app.use(cors({
#   origin: ['https://aztekafoods.com', 'http://localhost:5173'],
#   credentials: true
# }));
```

### Issue 4: JavaScript Bundle Errors

**Symptoms:**
- Browser console shows: `Uncaught SyntaxError` or `Uncaught TypeError`
- Bundle file might be corrupted

**Fix:**
```bash
# Rebuild frontend
ssh root@77.243.85.8 "
  cd /srv/azteka-dsd
  rm -rf dist
  npm run build
  systemctl reload nginx
"
```

### Issue 5: Missing Root Div

**Symptoms:**
- HTML loads but React can't mount
- Console shows: `Target container is not a DOM element`

**Fix:**
```bash
# Check index.html
ssh root@77.243.85.8 "
  grep '<div id=\"root\">' /srv/azteka-dsd/dist/index.html
"

# If missing, check source
grep '<div id=\"root\">' /Users/ernestoponce/dev/azteka-dsd/index.html
```

## 🔍 Manual Browser Check

1. **Open DevTools (F12)**
2. **Console Tab:**
   - Look for red errors
   - Common errors:
     - `fetchFromAPI is not defined`
     - `Cannot read property of undefined`
     - `Failed to fetch`
     - `CORS policy error`
3. **Network Tab:**
   - Check if `/api/products` request exists
   - Check if it returns 200 OK
   - Check if JavaScript bundle loads (200 OK)
4. **Elements Tab:**
   - Check if `<div id="root">` exists
   - Check if it's empty (white page)

## 🎯 Quick Fixes

### Fix 1: Rebuild Everything

```bash
ssh root@77.243.85.8 "
  cd /srv/azteka-dsd
  
  # Pull latest code
  git pull origin main
  
  # Clean install
  rm -rf node_modules dist
  npm install --legacy-peer-deps
  
  # Rebuild
  npm run build
  
  # Restart services
  pm2 restart azteka-api
  systemctl reload nginx
"
```

### Fix 2: Check fetchFromAPI Function

```bash
# Check if function exists in source
ssh root@77.243.85.8 "
  cd /srv/azteka-dsd
  find src -name '*.ts' -o -name '*.tsx' | xargs grep -l 'fetchFromAPI'
"

# If missing, check correct location
find /Users/ernestoponce/dev/azteka-dsd/src -name '*.ts' -o -name '*.tsx' | xargs grep -l 'fetchFromAPI'
```

### Fix 3: Test API Directly

```bash
# Test from browser perspective
curl -v https://aztekafoods.com/api/products

# Check CORS headers
curl -I -H "Origin: https://aztekafoods.com" https://aztekafoods.com/api/products
```

## 📝 What to Share

If you still have issues, share:

1. **Browser Console Errors:**
   - Screenshot or copy/paste of errors
   - Any red error messages

2. **Network Tab:**
   - Screenshot of failed requests
   - Status codes (404, 500, etc.)

3. **Diagnostic Script Output:**
   - Run `debug-white-page-deep.sh` and share output

4. **fetchFromAPI Function:**
   - Where is it defined?
   - Is it imported correctly in App.tsx?

## 🎯 Most Likely Issues

Based on the symptoms, most likely:

1. **fetchFromAPI not defined** - Function missing or not imported
2. **API endpoint mismatch** - Frontend calling wrong URL
3. **CORS blocking** - Browser blocking API requests
4. **JavaScript error** - App crashing on load

Run the diagnostic script first, then check browser console!

