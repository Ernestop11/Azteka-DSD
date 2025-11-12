# Deployment Debugging Guide

## Common Issues When App Doesn't Load

### 1. Missing Environment Variables
The app requires these environment variables to be set:
- `VITE_SUPABASE_URL` - Your Supabase project URL
- `VITE_SUPABASE_ANON_KEY` - Your Supabase anonymous key

**Check on server:**
```bash
# SSH into server
ssh root@77.243.85.8

# Check if .env file exists
ls -la | grep .env

# Check if environment variables are set
echo $VITE_SUPABASE_URL
echo $VITE_SUPABASE_ANON_KEY
```

**Solution:** Create a `.env` file in the project root with:
```
VITE_SUPABASE_URL=your_supabase_url_here
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key_here
```

### 2. Build Not Created or Wrong Location
**Check on server:**
```bash
# Check if dist folder exists
ls -la dist/

# Check build output
ls -la dist/index.html
```

**Solution:** Build the app:
```bash
npm install
npm run build
```

The build output should be in the `dist/` folder.

### 3. Server Not Serving Static Files Correctly

**For Nginx:**
Check nginx configuration:
```bash
cat /etc/nginx/sites-available/default
# or
cat /etc/nginx/nginx.conf
```

Nginx should be configured to:
- Serve files from the `dist/` directory
- Have a fallback to `index.html` for client-side routing
- Serve static assets correctly

**Example Nginx config:**
```nginx
server {
    listen 80;
    server_name your-domain.com;
    root /path/to/your/project/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /assets/ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

**For Apache:**
Check `.htaccess` file in `dist/` directory:
```apache
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  RewriteRule ^index\.html$ - [L]
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule . /index.html [L]
</IfModule>
```

### 4. Port/Service Not Running
**Check on server:**
```bash
# Check if web server is running
systemctl status nginx
# or
systemctl status apache2

# Check if port 80/443 is listening
netstat -tulpn | grep :80
netstat -tulpn | grep :443

# Check firewall
ufw status
```

### 5. File Permissions
**Check on server:**
```bash
# Check permissions
ls -la dist/
ls -la dist/index.html

# Fix permissions if needed
chown -R www-data:www-data dist/
chmod -R 755 dist/
```

### 6. Browser Console Errors
Open browser developer tools (F12) and check:
- Console tab for JavaScript errors
- Network tab for failed requests
- Check if assets are loading (404 errors)

Common errors:
- `Failed to fetch` - Supabase connection issue (check env vars)
- `404 Not Found` - Assets not being served correctly
- `CORS errors` - Supabase CORS configuration

## Quick Debugging Steps

1. **SSH into server:**
   ```bash
   ssh root@77.243.85.8
   ```

2. **Navigate to project:**
   ```bash
   cd /path/to/your/project
   ```

3. **Check environment variables:**
   ```bash
   cat .env
   ```

4. **Rebuild the app:**
   ```bash
   npm install
   npm run build
   ```

5. **Check build output:**
   ```bash
   ls -la dist/
   cat dist/index.html
   ```

6. **Check web server logs:**
   ```bash
   # Nginx
   tail -f /var/log/nginx/error.log
   tail -f /var/log/nginx/access.log
   
   # Apache
   tail -f /var/log/apache2/error.log
   ```

7. **Test locally on server:**
   ```bash
   cd dist
   python3 -m http.server 8000
   # Then visit http://77.243.85.8:8000
   ```

## Expected File Structure After Build

```
project-root/
├── dist/
│   ├── index.html
│   ├── assets/
│   │   ├── index-[hash].js
│   │   ├── index-[hash].css
│   │   └── ...
│   └── vite.svg (or other static assets)
├── .env
├── package.json
└── ...
```


