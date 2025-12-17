#!/usr/bin/env bash
set -euo pipefail

APP_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$APP_DIR"

echo "[$(date)] ========================================"
echo "[$(date)] Starting Azteka DSD Deployment"
echo "[$(date)] ========================================"

# Check if .env.production exists
if [ ! -f ".env.production" ]; then
    echo "[$(date)] ERROR: .env.production file not found!"
    exit 1
fi

# Load production environment
echo "[$(date)] Loading production environment..."
export $(grep -v '^#' .env.production | xargs)

echo "[$(date)] Installing dependencies..."
npm install --production=false

echo "[$(date)] Generating Prisma client..."
npx prisma generate

echo "[$(date)] Applying database migrations..."
npx prisma migrate deploy

echo "[$(date)] Building Vite frontend..."
NODE_ENV=production npm run build

# Create necessary directories
echo "[$(date)] Creating upload directories..."
mkdir -p uploads/invoices
mkdir -p uploads/products
mkdir -p public/products

echo "[$(date)] Setting proper permissions..."
chmod -R 755 uploads
chmod -R 755 public

echo "[$(date)] Restarting PM2 process (azteka-api)..."
if pm2 list | grep -q "azteka-api"; then
  pm2 restart azteka-api
else
  pm2 start server.mjs --name azteka-api --node-args="--env-file=.env.production"
fi

# Save PM2 configuration
pm2 save

echo "[$(date)] Reloading nginx..."
sudo systemctl reload nginx

echo "[$(date)] ========================================"
echo "[$(date)] Deployment Complete!"
echo "[$(date)] ========================================"
echo "[$(date)] Health check: curl http://127.0.0.1:4000/health"
