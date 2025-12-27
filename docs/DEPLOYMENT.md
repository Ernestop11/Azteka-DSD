# Azteka DSD - Deployment Guide

## Overview

**Build happens on VPS only.** Local machine is for development. Git is our backup.

```
Local Dev → Git Push → VPS Pull → VPS Build → PM2 Restart
```

## Quick Reference

### Deploy Changes (Recommended)
```bash
# 1. Commit and push to git
git add .
git commit -m "Your changes"
git push origin main

# 2. SSH to VPS and pull
ssh root@72.62.162.163
cd /srv/azteka-api-live
git pull origin main

# 3. Build and restart
npm run build:next
pm2 restart azteka-nextjs
pm2 save
```

### Emergency Hotfix (Direct Sync)
Only use when git isn't available:
```bash
# Sync specific files
rsync -avz app/api/some-route.ts root@72.62.162.163:/srv/azteka-api-live/app/api/

# Rebuild and restart on VPS
ssh root@72.62.162.163 "cd /srv/azteka-api-live && npm run build:next && pm2 restart azteka-nextjs"
```

## VPS Details

| Item | Value |
|------|-------|
| Host | `72.62.162.163` |
| User | `root` |
| App Path | `/srv/azteka-api-live` |
| PM2 Process | `azteka-nextjs` (port 3002) |
| Worker Process | `azteka-worker` (port 3003) |
| Domain | `aztekafoods.com` |

## Common Commands

### Check Status
```bash
ssh root@72.62.162.163 "pm2 list"
```

### View Logs
```bash
ssh root@72.62.162.163 "pm2 logs azteka-nextjs --lines 50"
```

### Restart App
```bash
ssh root@72.62.162.163 "pm2 restart azteka-nextjs && pm2 save"
```

### Full Rebuild
```bash
ssh root@72.62.162.163 "cd /srv/azteka-api-live && npm run build:next && pm2 restart azteka-nextjs && pm2 save"
```

### Database Migration
```bash
ssh root@72.62.162.163 "cd /srv/azteka-api-live && npx prisma migrate deploy"
```

### Prisma Studio (Database UI)
```bash
ssh root@72.62.162.163 "cd /srv/azteka-api-live && npx prisma studio"
```

## Troubleshooting

### "require is not defined in ES module scope"
The `.next-azteka/package.json` has wrong module type. Fix:
```bash
ssh root@72.62.162.163 'echo "{\"type\": \"commonjs\"}" > /srv/azteka-api-live/.next-azteka/package.json && pm2 restart azteka-nextjs'
```

### App not responding (500 errors)
1. Check logs: `pm2 logs azteka-nextjs --lines 100`
2. Check if running: `pm2 list`
3. Try restart: `pm2 restart azteka-nextjs`
4. If still broken, rebuild: `npm run build:next`

### Port already in use
```bash
ssh root@72.62.162.163 "lsof -i :3002"  # See what's using port
ssh root@72.62.162.163 "pm2 delete azteka-nextjs && pm2 start ecosystem.config.cjs"
```

## What NOT to Do

1. **Don't sync `.next-azteka/` from local to VPS** - Build on VPS instead
2. **Don't run `npm run build` locally for production** - Only for local dev testing
3. **Don't edit files directly on VPS** - Always edit locally, push to git, pull on VPS

## File Structure

```
/srv/azteka-api-live/
├── .next-azteka/          # Built by VPS (don't sync from local)
├── app/                   # Next.js app routes
├── components/            # React components
├── lib/                   # Utilities
├── prisma/                # Database schema
├── public/                # Static files
├── logs/                  # PM2 logs
└── ecosystem.config.cjs   # PM2 configuration
```

## Backup Strategy

- **Code**: Git (GitHub) - automatic via commits
- **Database**: Manual backups with `pg_dump`
- **Uploads**: `/srv/azteka-api-live/public/uploads/` - backup periodically

### Database Backup
```bash
ssh root@72.62.162.163 "pg_dump -U azteka_user azteka_dsd > /tmp/azteka_backup_$(date +%Y%m%d).sql"
```
