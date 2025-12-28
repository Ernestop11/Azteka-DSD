# Azteka DSD - Claude Code Instructions

## 🚨🚨🚨 ABSOLUTE DEPLOYMENT RULES - READ FIRST 🚨🚨🚨

### THE ONLY WAY TO DEPLOY:
```bash
./scripts/deploy.sh
```

### FORBIDDEN COMMANDS - NEVER USE THESE FOR DEPLOYMENT:
- ❌ `rsync -avz ... root@XX.XX.XX.XX:/srv/azteka-dsd/`
- ❌ `ssh root@XX.XX.XX.XX "pm2 restart..."`
- ❌ Any manual rsync or ssh with IP addresses typed out
- ❌ Any deployment command from memory or old context

### WHY:
- The VPS IP is **72.62.162.163** - hardcoded in `scripts/deploy.sh`
- Old VPS (77.243.85.8) is DEAD - do not use
- Manual commands risk deploying to wrong server
- The deploy script does EVERYTHING: build, sync, prisma, restart, health check

### IF CLAUDE TRIES TO USE MANUAL SSH/RSYNC FOR DEPLOYMENT:
**STOP IT IMMEDIATELY** - It's using cached/old instructions. Force it to use `./scripts/deploy.sh`

## Project Overview
Azteka DSD is a wholesale distribution management system with a Next.js frontend running on a VPS.

## VPS Deployment - CRITICAL
**ALL changes must be deployed to the VPS. There is NO local development server - the VPS is the single source of truth.**

### VPS Details
- **Server**: `root@72.62.162.163`
- **App Path**: `/srv/azteka-dsd`
- **PM2 Process**: `azteka-production` (runs on port 3000)
- **Domain**: `aztekafoods.com`
- **Database**: PostgreSQL on VPS (port 5432)
  - Database name: `azteka_dsd`
  - User: `azteka_user`
  - Connection: `postgresql://azteka_user:azteka_pass_2024@localhost:5432/azteka_dsd`

### CRITICAL: Image Upload Rules
- **VPS is the SINGLE SOURCE OF TRUTH for product images**
- **NEVER sync `public/uploads/` from local to VPS** - this overwrites real images with placeholders!
- Images are uploaded via `/admin/inventory-seed` directly to VPS
- Local `public/uploads/products/` contains only placeholders (~10KB each)
- Real product images on VPS are 20KB-300KB each

### Deployment - USE THE SCRIPT

**ALWAYS deploy using the script:**
```bash
./scripts/deploy.sh
```

This script:
1. Builds locally
2. Syncs source files (excludes uploads)
3. Syncs build folder
4. Generates Prisma client
5. Restarts PM2
6. Runs health check

**If Prisma schema has NEW fields, run after deploy:**
```bash
ssh root@72.62.162.163 "cd /srv/azteka-dsd && npx prisma db push --accept-data-loss"
```

### Backup Before Deploy (Recommended)
```bash
# Create backup of VPS images before any risky operation
ssh root@72.62.162.163 "tar -czf /srv/azteka-backup-images-$(date +%Y%m%d-%H%M).tar.gz /srv/azteka-dsd/public/uploads/"
```

## VPS Architecture
- **nginx**: Reverse proxy on ports 80/443, proxies to port 3000
- **PM2**: Process manager running `azteka-production`
- **PostgreSQL**: Database `azteka_dsd` on localhost:5432
- **Static files**: `/srv/azteka-dsd/public/uploads/` served directly by nginx

## Checking VPS Status
```bash
# Check PM2 processes
ssh root@72.62.162.163 "pm2 list"

# Check which port is running
ssh root@72.62.162.163 "ss -tlnp | grep 3000"

# Check nginx config
ssh root@72.62.162.163 "cat /etc/nginx/sites-enabled/azteka*"

# Check logs
ssh root@72.62.162.163 "pm2 logs azteka-production --lines 50"
```

## Key Files
- `prisma/schema.prisma` - Database schema
- `app/catalog/CatalogContent.tsx` - Main catalog UI
- `app/api/` - All API routes
- `.next-azteka/` - Build output folder (custom distDir in next.config.js)

## Remember
- ALWAYS deploy after making changes
- ALWAYS sync source files AND build folder
- ALWAYS regenerate Prisma client on VPS after schema changes
- ALWAYS restart PM2 after deployment
