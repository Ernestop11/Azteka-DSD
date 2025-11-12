#!/bin/bash

# Server Debugging Script
# Run this on your server: bash debug-server.sh

echo "=== Deployment Debugging Script ==="
echo ""

# Check if we're in the project directory
if [ ! -f "package.json" ]; then
    echo "❌ ERROR: package.json not found. Are you in the project root?"
    exit 1
fi

echo "1. Checking project structure..."
echo "   Project root: $(pwd)"
echo "   Package.json: $(test -f package.json && echo '✓ Found' || echo '✗ Missing')"
echo ""

echo "2. Checking environment variables..."
if [ -f ".env" ]; then
    echo "   ✓ .env file exists"
    if grep -q "VITE_SUPABASE_URL" .env; then
        echo "   ✓ VITE_SUPABASE_URL is set"
    else
        echo "   ✗ VITE_SUPABASE_URL is MISSING"
    fi
    if grep -q "VITE_SUPABASE_ANON_KEY" .env; then
        echo "   ✓ VITE_SUPABASE_ANON_KEY is set"
    else
        echo "   ✗ VITE_SUPABASE_ANON_KEY is MISSING"
    fi
else
    echo "   ✗ .env file is MISSING"
    echo "   Create .env file with:"
    echo "   VITE_SUPABASE_URL=your_url"
    echo "   VITE_SUPABASE_ANON_KEY=your_key"
fi
echo ""

echo "3. Checking build output..."
if [ -d "dist" ]; then
    echo "   ✓ dist/ directory exists"
    if [ -f "dist/index.html" ]; then
        echo "   ✓ dist/index.html exists"
        echo "   File size: $(du -h dist/index.html | cut -f1)"
    else
        echo "   ✗ dist/index.html is MISSING"
    fi
    if [ -d "dist/assets" ]; then
        echo "   ✓ dist/assets/ directory exists"
        echo "   Asset files: $(ls -1 dist/assets/ 2>/dev/null | wc -l)"
    else
        echo "   ✗ dist/assets/ directory is MISSING"
    fi
else
    echo "   ✗ dist/ directory is MISSING"
    echo "   Run: npm run build"
fi
echo ""

echo "4. Checking Node.js and npm..."
if command -v node &> /dev/null; then
    echo "   ✓ Node.js installed: $(node --version)"
else
    echo "   ✗ Node.js is NOT installed"
fi
if command -v npm &> /dev/null; then
    echo "   ✓ npm installed: $(npm --version)"
else
    echo "   ✗ npm is NOT installed"
fi
echo ""

echo "5. Checking web server..."
if systemctl is-active --quiet nginx; then
    echo "   ✓ Nginx is running"
    echo "   Config location: /etc/nginx/sites-available/default"
elif systemctl is-active --quiet apache2; then
    echo "   ✓ Apache is running"
else
    echo "   ⚠ No web server detected (nginx/apache2)"
fi
echo ""

echo "6. Checking ports..."
if netstat -tuln 2>/dev/null | grep -q ":80 "; then
    echo "   ✓ Port 80 is listening"
else
    echo "   ✗ Port 80 is NOT listening"
fi
if netstat -tuln 2>/dev/null | grep -q ":443 "; then
    echo "   ✓ Port 443 is listening"
else
    echo "   ⚠ Port 443 is NOT listening"
fi
echo ""

echo "7. Checking file permissions..."
if [ -d "dist" ]; then
    echo "   dist/ permissions: $(stat -c '%a' dist 2>/dev/null || stat -f '%A' dist 2>/dev/null)"
    if [ -f "dist/index.html" ]; then
        echo "   dist/index.html permissions: $(stat -c '%a' dist/index.html 2>/dev/null || stat -f '%A' dist/index.html 2>/dev/null)"
    fi
fi
echo ""

echo "8. Quick test - checking if index.html loads..."
if [ -f "dist/index.html" ]; then
    if grep -q "root" dist/index.html; then
        echo "   ✓ index.html contains root div"
    else
        echo "   ✗ index.html might be corrupted"
    fi
    if grep -q "main.tsx" dist/index.html || grep -q "assets" dist/index.html; then
        echo "   ✓ index.html references assets"
    else
        echo "   ⚠ index.html might not reference assets correctly"
    fi
fi
echo ""

echo "=== Summary ==="
echo "If you see ✗ errors above, fix those first."
echo ""
echo "Next steps:"
echo "1. Ensure .env file exists with Supabase credentials"
echo "2. Run: npm install && npm run build"
echo "3. Check web server configuration points to dist/ directory"
echo "4. Check web server logs for errors"
echo "5. Test in browser with developer tools open (F12)"


