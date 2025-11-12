# Quick Fix Guide - App Not Loading

## Most Common Issues (in order of likelihood)

### 1. Missing Environment Variables (MOST COMMON)
**Problem:** App can't connect to Supabase because env vars are missing.

**Fix on server:**
```bash
ssh root@77.243.85.8
cd /path/to/your/project  # Change this to your actual project path

# Create .env file
nano .env
```

Add these lines (replace with your actual Supabase credentials):
```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

Save and exit (Ctrl+X, then Y, then Enter).

**Then rebuild:**
```bash
npm run build
```

---

### 2. Build Not Created
**Problem:** The `dist/` folder doesn't exist or is outdated.

**Fix:**
```bash
# Make sure you're in project directory
cd /path/to/your/project

# Install dependencies (if needed)
npm install

# Build the app
npm run build

# Verify build was created
ls -la dist/
```

You should see `dist/index.html` and `dist/assets/` folder.

---

### 3. Web Server Not Configured Correctly
**Problem:** Nginx/Apache not pointing to the right directory or not handling SPA routing.

**For Nginx:**
```bash
# Edit nginx config
nano /etc/nginx/sites-available/default
```

Make sure it has:
```nginx
root /path/to/your/project/dist;  # Must point to dist folder
index index.html;

location / {
    try_files $uri $uri/ /index.html;
}
```

Then:
```bash
# Test config
nginx -t

# Reload nginx
systemctl reload nginx
```

**For Apache:**
```bash
# Copy .htaccess to dist folder
cp .htaccess.example dist/.htaccess

# Make sure Apache mod_rewrite is enabled
a2enmod rewrite
systemctl restart apache2
```

---

### 4. File Permissions
**Problem:** Web server can't read the files.

**Fix:**
```bash
# For Nginx
chown -R www-data:www-data /path/to/your/project/dist
chmod -R 755 /path/to/your/project/dist

# For Apache
chown -R www-data:www-data /path/to/your/project/dist
chmod -R 755 /path/to/your/project/dist
```

---

### 5. Web Server Not Running
**Problem:** Nginx/Apache service is stopped.

**Fix:**
```bash
# Check status
systemctl status nginx
# or
systemctl status apache2

# Start if stopped
systemctl start nginx
# or
systemctl start apache2

# Enable on boot
systemctl enable nginx
# or
systemctl enable apache2
```

---

## Quick Diagnostic Commands

Run these on your server to see what's wrong:

```bash
# 1. Check if .env exists and has values
cat .env

# 2. Check if dist folder exists
ls -la dist/

# 3. Check web server status
systemctl status nginx
# or
systemctl status apache2

# 4. Check web server logs
tail -20 /var/log/nginx/error.log
# or
tail -20 /var/log/apache2/error.log

# 5. Check if port 80 is listening
netstat -tuln | grep :80

# 6. Test if files are accessible
curl http://localhost/
```

---

## Step-by-Step Complete Fix

1. **SSH into server:**
   ```bash
   ssh root@77.243.85.8
   ```

2. **Navigate to project:**
   ```bash
   cd /path/to/your/project  # Find your actual project path
   ```

3. **Create .env file:**
   ```bash
   nano .env
   ```
   Add:
   ```
   VITE_SUPABASE_URL=your_url_here
   VITE_SUPABASE_ANON_KEY=your_key_here
   ```

4. **Build the app:**
   ```bash
   npm install
   npm run build
   ```

5. **Check web server config:**
   - Find where your web server config is
   - Make sure it points to `dist/` folder
   - Make sure it has the SPA routing rule (`try_files` for Nginx or `.htaccess` for Apache)

6. **Restart web server:**
   ```bash
   systemctl restart nginx
   # or
   systemctl restart apache2
   ```

7. **Test in browser:**
   - Open http://77.243.85.8
   - Open browser DevTools (F12)
   - Check Console tab for errors
   - Check Network tab for failed requests

---

## Still Not Working?

Run the debug script:
```bash
bash debug-server.sh
```

This will show you exactly what's missing.


