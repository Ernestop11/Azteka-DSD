# Azteka DSD - Claude Code Instructions

## Project Overview
Azteka DSD is a wholesale distribution management system with a Next.js frontend running on a VPS.

## VPS Deployment - CRITICAL
**ALL changes must be deployed to the VPS. There is NO local development server - the VPS is the single source of truth.**

### VPS Details
- **Server**: `root@77.243.85.8`
- **App Path**: `/srv/azteka-dsd`
- **PM2 Process**: `azteka-nextjs` (runs on port 3002)
- **Domain**: `aztekafoods.com`
- **Database**: PostgreSQL on VPS (port 5432)

### Deployment Workflow (ALWAYS follow these steps after making changes)

1. **Build locally**:
   ```bash
   npm run build:next
   ```

2. **Sync ALL source files to VPS** (not just the build):
   ```bash
   rsync -avz --exclude='node_modules' --exclude='.git' --exclude='.env' --exclude='.env.local' --exclude='.next' --exclude='.next-azteka' /Users/ernestoponce/dev/azteka-dsd/ root@77.243.85.8:/srv/azteka-dsd/
   ```

3. **Sync the build folder**:
   ```bash
   rsync -avz --delete /Users/ernestoponce/dev/azteka-dsd/.next-azteka/ root@77.243.85.8:/srv/azteka-dsd/.next-azteka/
   ```

4. **If Prisma schema changed, update VPS database**:
   ```bash
   ssh root@77.243.85.8 "cd /srv/azteka-dsd && npx prisma generate"
   # If schema has new fields:
   ssh root@77.243.85.8 "cd /srv/azteka-dsd && npx prisma db push --accept-data-loss"
   # Or use direct SQL if permission issues:
   ssh root@77.243.85.8 "sudo -u postgres psql -d azteka_dsd -c 'ALTER TABLE ...'"
   ```

5. **Restart the server**:
   ```bash
   ssh root@77.243.85.8 "pm2 restart azteka-nextjs"
   ```

### Quick Deploy Script
For routine deployments:
```bash
npm run build:next && \
rsync -avz --exclude='node_modules' --exclude='.git' --exclude='.env' --exclude='.env.local' --exclude='.next' --exclude='.next-azteka' /Users/ernestoponce/dev/azteka-dsd/ root@77.243.85.8:/srv/azteka-dsd/ && \
rsync -avz --delete /Users/ernestoponce/dev/azteka-dsd/.next-azteka/ root@77.243.85.8:/srv/azteka-dsd/.next-azteka/ && \
ssh root@77.243.85.8 "cd /srv/azteka-dsd && npx prisma generate && pm2 restart azteka-nextjs"
```

## VPS Architecture
- **nginx**: Reverse proxy on ports 80/443, proxies to port 3002
- **PM2**: Process manager running `azteka-nextjs`
- **PostgreSQL**: Database `azteka_dsd` on localhost:5432
- **Static files**: `/srv/azteka-dsd/public/uploads/` served directly by nginx

## Checking VPS Status
```bash
# Check PM2 processes
ssh root@77.243.85.8 "pm2 list"

# Check which port is running
ssh root@77.243.85.8 "netstat -tlnp | grep 300"

# Check nginx config
ssh root@77.243.85.8 "cat /etc/nginx/sites-enabled/azteka*"

# Check logs
ssh root@77.243.85.8 "pm2 logs azteka-nextjs --lines 50"
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
