# AZTEKA DSD - CRITICAL TECH STACK REFERENCE

**PASTE THIS AT THE START OF EVERY NEW CHAT SESSION**

## VPS Configuration - SINGLE SOURCE OF TRUTH

```
VPS Host: 77.243.85.8
VPS User: root
SSH Key: ~/.ssh/id_rsa

CORRECT PATH: /srv/azteka-dsd
WRONG PATH (DO NOT USE): /srv/azteka-api-live

Domain: aztekafoods.com
Port: 3002 (Next.js via PM2)
PM2 Process: azteka-nextjs
```

## Database

```
Host: localhost (on VPS)
Database: azteka_dsd
User: azteka_user
Password: azteka_pass_2024
Connection: postgresql://azteka_user:azteka_pass_2024@localhost:5432/azteka_dsd
```

## File Locations on VPS

```
App Directory:     /srv/azteka-dsd
Build Directory:   /srv/azteka-dsd/.next-azteka
Uploads (IMAGES):  /srv/azteka-dsd/public/uploads/products/
Nginx Config:      /etc/nginx/sites-enabled/aztekafoods.com
PM2 Config:        /srv/azteka-dsd/ecosystem.config.cjs
```

## Image Upload Flow - CRITICAL

1. User uploads image via seeder/admin
2. API route receives file → processes with Sharp
3. `lib/services/vpsUpload.ts` uploads DIRECTLY to VPS
4. File saved to: `/srv/azteka-dsd/public/uploads/products/{productId}.png`
5. Database updated with URL: `/uploads/products/{productId}.png?v={timestamp}`
6. Nginx serves static files from `/srv/azteka-dsd/public/uploads/`

**NEVER sync images from local to VPS - VPS is the source of truth!**

## Deploy Commands

```bash
# Safe deploy (no image overwrite)
ssh root@77.243.85.8 "cd /srv/azteka-dsd && git pull && npm install && npm run build:next && pm2 restart azteka-nextjs"

# Check PM2 status
ssh root@77.243.85.8 "pm2 status"

# Check logs
ssh root@77.243.85.8 "pm2 logs azteka-nextjs --lines 100"

# Restart with cache clear
ssh root@77.243.85.8 "cd /srv/azteka-dsd && rm -rf .next-azteka && npm run build:next && pm2 restart azteka-nextjs"
```

## Rsync - SAFE Commands Only

```bash
# SAFE - Sync code only (excludes uploads)
rsync -avz --exclude 'node_modules' --exclude '.next*' --exclude 'public/uploads' \
  /Users/ernestoponce/dev/azteka-dsd/ root@77.243.85.8:/srv/azteka-dsd/

# SAFE - Sync NEW images only (won't overwrite existing)
rsync -avz --ignore-existing public/uploads/products/ root@77.243.85.8:/srv/azteka-dsd/public/uploads/products/

# DANGER - NEVER DO THIS (overwrites VPS images with local placeholders):
# rsync public/uploads/products/ root@77.243.85.8:/srv/azteka-dsd/public/uploads/products/
```

## Key Files

| File | Purpose |
|------|---------|
| `lib/services/vpsUpload.ts` | Direct VPS upload via SSH |
| `app/api/admin/products/uploadImage/route.ts` | Product image upload API |
| `app/api/employee/products/upload-image/route.ts` | Employee image upload |
| `lib/imageUrl.ts` | URL normalization for images |
| `public/sw.js` | Service worker (currently v9) |
| `scripts/deploy-to-vps.sh` | Deploy script (image sync DISABLED) |

## Before ANY Deploy

1. Check current image count on VPS:
   ```bash
   ssh root@77.243.85.8 "find /srv/azteka-dsd/public/uploads/products -name '*.png' -size +20k | wc -l"
   ```

2. Create backup if needed:
   ```bash
   ssh root@77.243.85.8 "tar -czf /srv/azteka-backup-$(date +%Y%m%d-%H%M).tar.gz /srv/azteka-dsd/public/uploads/"
   ```

3. Deploy code only (no images):
   ```bash
   ssh root@77.243.85.8 "cd /srv/azteka-dsd && git pull && npm run build:next && pm2 restart azteka-nextjs"
   ```

## After Deploy Verification

```bash
# Check app is running
curl -sI https://aztekafoods.com | head -3

# Check an image loads
curl -sI https://aztekafoods.com/uploads/products/1763867035027-adobada.png | grep -E "HTTP|content-length"

# Verify image count unchanged
ssh root@77.243.85.8 "find /srv/azteka-dsd/public/uploads/products -name '*.png' -size +20k | wc -l"
```

## Common Issues

### Images showing as squares/placeholders
- Check file size on VPS (real images are 20KB+, placeholders are 7-12KB)
- Verify imageUrl in database points to existing file
- Clear browser cache / use incognito

### Deploy overwrote images
- rsync without --ignore-existing synced local placeholders over VPS real images
- Restore from backup: `tar -xzf /srv/azteka-backup-*.tar.gz -C /`

### Wrong path used
- ALWAYS use `/srv/azteka-dsd` NOT `/srv/azteka-api-live`
- Check scripts before running

## Current Stats (Dec 26, 2025)

- Total products: 686
- Real images (>20KB): 394
- Products with real images: ~381
- Products needing image upload: ~305

---
**LAST UPDATED: Dec 26, 2025**
**ALWAYS VERIFY PATHS BEFORE DEPLOY**
