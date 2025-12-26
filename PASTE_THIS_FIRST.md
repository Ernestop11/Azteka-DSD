# AZTEKA DSD - PASTE THIS AT START OF EVERY SESSION

## CRITICAL RULES - READ BEFORE DOING ANYTHING

### 1. NEVER SYNC IMAGES FROM LOCAL TO VPS
```
LOCAL = PLACEHOLDERS (8-12KB fake images)
VPS = REAL IMAGES (20-300KB actual product photos)

NEVER run rsync that includes public/uploads/
NEVER run any script that syncs images to VPS
Images are uploaded ONLY via the web UI (/admin/inventory-seed)
```

### 2. VPS IS THE ONLY SERVER
```
Host: 77.243.85.8
Path: /srv/azteka-dsd
PM2: azteka-nextjs (port 3002)
Database: postgresql://azteka_user:azteka_pass_2024@localhost:5432/azteka_dsd
```

### 3. SAFE DEPLOYMENT (Use ONLY this method)
```bash
# Step 1: Commit and push your changes
git add . && git commit -m "your message" && git push origin bolt-visual-stable

# Step 2: Deploy on VPS (git pull + build + restart)
ssh root@77.243.85.8 "cd /srv/azteka-dsd && git pull origin bolt-visual-stable && npx prisma generate && npm run build:next && pm2 restart azteka-nextjs"

# Step 3: Verify
ssh root@77.243.85.8 "pm2 status && find /srv/azteka-dsd/public/uploads/products -type f -size +20k | wc -l"
```

### 4. BEFORE ANY RISKY OPERATION - BACKUP FIRST
```bash
ssh root@77.243.85.8 "/usr/local/bin/protect-images"
```

### 5. FORBIDDEN COMMANDS
```bash
# NEVER USE THESE:
rsync ... public/uploads ...  # Overwrites real images
scripts/sync-images-to-vps.mjs  # DELETED - was dangerous
--delete flag with rsync to VPS  # Deletes VPS files
```

### 6. IMAGE UPLOAD FLOW
- User uploads via /admin/inventory-seed or /admin/products
- API processes image with Sharp
- `lib/services/vpsUpload.ts` sends DIRECTLY to VPS via SSH
- File saved to: `/srv/azteka-dsd/public/uploads/products/{id}.png`
- Database updated with URL

### 7. CURRENT STATUS (Dec 26, 2025)
- Real images on VPS: 374
- Backup on external drive: /Volumes/Distrimex, LLC/azteka-builds/backups/real-images-20251226/
- VPS backup: /srv/azteka-backups/images-20251226-212341.tar.gz

### 8. IF IMAGES GET CORRUPTED
```bash
# Restore from VPS backup
ssh root@77.243.85.8 "tar -xzf /srv/azteka-backups/images-20251226-212341.tar.gz -C /srv/azteka-dsd/public"

# Or from external drive
rsync -avz "/Volumes/Distrimex, LLC/azteka-builds/backups/real-images-20251226/" root@77.243.85.8:/srv/azteka-dsd/public/uploads/products/
```

---
**DO NOT IMPROVISE DEPLOYMENT METHODS. USE ONLY THE COMMANDS ABOVE.**
