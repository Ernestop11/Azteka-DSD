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
Host: 72.62.162.163
Path: /srv/azteka-dsd
PM2: azteka-production (port 3000)
Database: postgresql://azteka_user:***@localhost:5432/azteka_production
PUBLIC URL: https://aztekafoods.com
Credentials: /root/.azteka-db-credentials
```

### 2b. DO NOT HALLUCINATE URLs
```
THE ONLY VALID DOMAIN IS: aztekafoods.com
DO NOT invent URLs like "orders.distrimexllc.com" - THAT DOES NOT EXIST
"Distrimex" is ONLY the external hard drive name, NOT a domain
```

### 3. VPS-ONLY BUILDS (CRITICAL)
```
ALL BUILDS HAPPEN ON VPS - NEVER BUILD LOCALLY
The VPS has Ubuntu 24.04 - local Mac builds may differ
This prevents "works on my machine" issues
```

### 4. SAFE DEPLOYMENT (Use ONLY this method)

**PREFERRED: Use the safe deploy script**
```bash
./scripts/safe-deploy.sh
```

**Manual method (if script doesn't work):**
```bash
# Step 1: Commit and push (NO LOCAL BUILD)
git add . && git commit -m "your message" && git push origin bolt-visual-stable

# Step 2: Build and deploy ON VPS
ssh root@72.62.162.163 "cd /srv/azteka-dsd && git pull origin bolt-visual-stable && npm install --legacy-peer-deps && npx prisma generate && npm run build:next && pm2 restart azteka-production"

# Step 3: Verify
ssh root@72.62.162.163 "pm2 status azteka-production"
```

**NEVER build locally. ALL builds happen on VPS.**

### 5. BEFORE ANY RISKY OPERATION - BACKUP FIRST
```bash
ssh root@72.62.162.163 "/usr/local/bin/protect-images"
```

### 6. FORBIDDEN COMMANDS
```bash
# NEVER USE THESE:
rsync ... public/uploads ...  # Overwrites real images
scripts/sync-images-to-vps.mjs  # DELETED - was dangerous
--delete flag with rsync to VPS  # Deletes VPS files
```

### 7. IMAGE UPLOAD FLOW
- User uploads via /admin/inventory-seed or /admin/products
- API processes image with Sharp
- `lib/services/vpsUpload.ts` sends DIRECTLY to VPS via SSH
- File saved to: `/srv/azteka-dsd/public/uploads/products/{id}.png`
- Database updated with URL

### 8. CURRENT STATUS (Dec 26, 2025)
- NEW VPS: 72.62.162.163 (Hostinger KVM2)
- Real images on VPS: 374
- Products: 688
- Customers: 11
- SSL: Active (Let's Encrypt)

### 9. HELPER COMMANDS ON VPS
```bash
azteka-status    # Check system status
azteka-deploy    # Deploy from git
azteka-backup    # Manual backup
protect-images   # Emergency image backup
```

### 10. IF IMAGES GET CORRUPTED
```bash
# Restore from VPS backup
ssh root@72.62.162.163 "ls /srv/azteka-backups/images/"  # List backups
ssh root@72.62.162.163 "tar -xzf /srv/azteka-backups/images/[BACKUP].tar.gz -C /srv/azteka-dsd/public"
```

---
**DO NOT IMPROVISE DEPLOYMENT METHODS. USE ONLY THE COMMANDS ABOVE.**
