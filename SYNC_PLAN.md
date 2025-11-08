# 🔄 Azteka DSD - Code Synchronization Plan

**Date:** November 8, 2025
**Status:** 🚨 **OUT OF SYNC** - Requires immediate action

---

## 📊 Current State Analysis

### Summary

| Location | Migration Status | Supabase Package | Types File | Prisma Schema | Git Repo |
|----------|------------------|------------------|------------|---------------|----------|
| **VPS Production** | 🟡 Partial | ❌ Still has | ❌ Missing | ✅ Migrated | ❌ No git |
| **Local** | ✅ Complete | ✅ Removed | ✅ Has | ✅ Migrated | ❓ Unknown |
| **GitHub: Azteka-DSD** | ❌ Old | ❌ Has | ❌ Missing | ❌ Old | ✅ Yes |
| **GitHub: azteka-sales** | ❌ Old | ❌ Has | ❌ Missing | ❌ Old | ✅ Yes |

### Detailed Analysis

#### ✅ **LOCAL** (`/Users/ernestoponce/dev/azteka-dsd`)
**Status:** 🟢 **FULLY MIGRATED** - This is the CORRECT version!

- ✅ Supabase package removed
- ✅ `src/types/index.ts` exists (new type system)
- ✅ `src/lib/supabase.ts` deleted
- ✅ Prisma schema has Category, Brand, Subcategory, etc.
- ✅ All 8 new models added
- ✅ Frontend imports updated

**This is the SOURCE OF TRUTH.**

#### 🟡 **VPS** (`/srv/azteka-dsd` on 77.243.85.8)
**Status:** 🟡 **PARTIALLY MIGRATED** - Database is good, code is outdated

**What's Good:**
- ✅ Database has all 21 tables (migration applied)
- ✅ Prisma schema has new models
- ✅ Migration files exist
- ✅ Backend running and working

**What's Broken:**
- ❌ `package.json` still has `@supabase/supabase-js`
- ❌ `src/types/index.ts` doesn't exist
- ❌ `src/lib/supabase.ts` still exists
- ❌ Frontend code still importing from Supabase
- ❌ Not a git repository

**Why it works:** The database is migrated, and the backend uses Prisma (which works). But the frontend build on VPS is from BEFORE we updated the imports.

#### ❌ **GitHub Repos** (Both: Azteka-DSD & azteka-sales)
**Status:** 🔴 **OLD CODE** - Pre-migration state

Both repos have:
- ❌ Old code with Supabase
- ❌ No type system
- ❌ Old Prisma schema
- ❌ Last commit: Initial import from Bolt

**These repos need to be OVERWRITTEN with local code.**

---

## 🎯 The Problem

**VPS is in a weird state:**
1. **Database:** Fully migrated (21 tables) ✅
2. **Backend:** Uses Prisma, works fine ✅
3. **Frontend code:** Still references Supabase ❌
4. **Frontend build (dist/):** Works because it was built AFTER we applied migration locally and deployed

**The danger:**
If you deploy from GitHub (which has old code), it will:
- ❌ Break the frontend (Supabase imports will fail)
- ❌ Try to connect to Supabase (which we removed)
- ❌ Overwrite the working build with broken code

---

## ✅ Sync Plan (Safe, Step-by-Step)

### Phase 1: Initialize Git on Local (5 mins)

Your local machine has the CORRECT code. Let's make it a git repo:

```bash
cd /Users/ernestoponce/dev/azteka-dsd

# Initialize git
git init

# Add all files
git add .

# Create first commit with migrated code
git commit -m "feat: Complete Supabase → PostgreSQL migration

- Remove @supabase/supabase-js package
- Create src/types/index.ts with complete type definitions
- Add 8 new Prisma models (Category, Brand, Subcategory, etc.)
- Enhance Product model with relations
- Update all frontend imports to use new types
- Remove src/lib/supabase.ts
- Migration: 20251108173329_add_missing_tables

Migration complete. Database has 21 tables.
All frontend code now uses PostgreSQL API."

# Show status
git status
git log -1
```

### Phase 2: Choose GitHub Repo Strategy

**Option A: Overwrite Azteka-DSD repo (Recommended)**
```bash
# Add remote
git remote add origin https://github.com/Ernestop11/Azteka-DSD.git

# Force push (overwrites old code)
git push -u origin main --force

# Confirm
echo "✅ GitHub repo now has migrated code"
```

**Option B: Create new branch on existing repo**
```bash
# Add remote
git remote add origin https://github.com/Ernestop11/Azteka-DSD.git

# Fetch existing branches
git fetch origin

# Create new branch
git checkout -b postgresql-migration

# Push new branch
git push -u origin postgresql-migration

# Later, merge to main when ready
```

**Option C: Use azteka-sales repo instead**
```bash
# Add remote
git remote add origin https://github.com/Ernestop11/azteka-sales.git

# Force push
git push -u origin main --force
```

**Recommendation:** Use **Option A** (overwrite Azteka-DSD). The old code is obsolete now.

### Phase 3: Sync VPS with Local (10 mins)

Once GitHub has the correct code, sync VPS:

```bash
# Step 1: Backup current VPS state
ssh root@77.243.85.8 "
  cd /srv
  tar -czf azteka-dsd-backup-$(date +%Y%m%d-%H%M%S).tar.gz azteka-dsd/
  echo '✅ Backup created'
"

# Step 2: Initialize git on VPS
ssh root@77.243.85.8 "
  cd /srv/azteka-dsd
  git init
  git remote add origin https://github.com/Ernestop11/Azteka-DSD.git
  echo '✅ Git initialized'
"

# Step 3: Pull migrated code from GitHub
ssh root@77.243.85.8 "
  cd /srv/azteka-dsd
  git fetch origin main
  git reset --hard origin/main
  echo '✅ Code synced from GitHub'
"

# Step 4: Reinstall dependencies (Supabase will be gone)
ssh root@77.243.85.8 "
  cd /srv/azteka-dsd
  npm install --legacy-peer-deps
  echo '✅ Dependencies updated'
"

# Step 5: Rebuild frontend
ssh root@77.243.85.8 "
  cd /srv/azteka-dsd
  npm run build
  echo '✅ Frontend rebuilt'
"

# Step 6: Restart backend
ssh root@77.243.85.8 "
  pm2 restart azteka-api
  systemctl reload nginx
  echo '✅ Services restarted'
"

# Step 7: Verify
ssh root@77.243.85.8 "
  echo '🔍 Verifying...'

  # Check Supabase removed
  grep -q '@supabase/supabase-js' /srv/azteka-dsd/package.json && echo '❌ Supabase still exists' || echo '✅ Supabase removed'

  # Check types file exists
  ls /srv/azteka-dsd/src/types/index.ts >/dev/null 2>&1 && echo '✅ Types file exists' || echo '❌ Types file missing'

  # Check API works
  curl -s http://localhost:3002/api/health | jq . && echo '✅ API works'

  echo ''
  echo '✅ SYNC COMPLETE'
"
```

### Phase 4: Verify Everything Works (5 mins)

```bash
# Test on VPS
ssh root@77.243.85.8 "/root/health.sh"

# Test frontend
curl -I https://aztekafoods.com

# Test API
curl https://aztekafoods.com/api/products | jq '. | length'
```

---

## 🚨 Critical Warnings

### ⚠️ DO NOT:

1. **Deploy from GitHub repos before syncing**
   - Both GitHub repos have OLD code
   - Will break the VPS frontend
   - Will try to use Supabase (removed)

2. **Run `git pull` on VPS before GitHub is updated**
   - VPS is not a git repo yet
   - Would pull old code

3. **Copy package.json from VPS to local**
   - VPS has old dependencies
   - Local has correct migrated dependencies

4. **Manually edit VPS files**
   - Use git sync to keep everything in sync
   - Manual edits will be overwritten

---

## ✅ Safe Deployment Workflow (After Sync)

Once everything is synced:

### From Local to GitHub
```bash
# Step 1: Make changes locally
cd /Users/ernestoponce/dev/azteka-dsd
# ... edit files ...

# Step 2: Commit
git add .
git commit -m "Your commit message"

# Step 3: Push to GitHub
git push origin main
```

### From GitHub to VPS
```bash
# Step 1: Pull latest code
ssh root@77.243.85.8 "cd /srv/azteka-dsd && git pull origin main"

# Step 2: Rebuild if frontend changed
ssh root@77.243.85.8 "cd /srv/azteka-dsd && npm run build"

# Step 3: Restart if backend changed
ssh root@77.243.85.8 "pm2 restart azteka-api"

# Step 4: Verify
ssh root@77.243.85.8 "/root/health.sh"
```

### One-Command Deploy (After Sync)
Create `deploy.sh` on local:

```bash
#!/bin/bash
set -e

echo "🚀 DEPLOYING AZTEKA DSD"
echo "======================"

# Step 1: Push to GitHub
echo "📦 Pushing to GitHub..."
git push origin main

# Step 2: Pull on VPS
echo "📥 Pulling on VPS..."
ssh root@77.243.85.8 "cd /srv/azteka-dsd && git pull origin main"

# Step 3: Check if frontend changed
FRONTEND_CHANGED=$(git diff HEAD~1 HEAD --name-only | grep -E "^src/|^index.html|^vite.config" | wc -l)

if [ "$FRONTEND_CHANGED" -gt 0 ]; then
  echo "🔨 Frontend changed, rebuilding..."
  ssh root@77.243.85.8 "cd /srv/azteka-dsd && npm run build"
fi

# Step 4: Check if backend changed
BACKEND_CHANGED=$(git diff HEAD~1 HEAD --name-only | grep -E "server.mjs|routes/" | wc -l)

if [ "$BACKEND_CHANGED" -gt 0 ]; then
  echo "🔄 Backend changed, restarting..."
  ssh root@77.243.85.8 "pm2 restart azteka-api"
fi

# Step 5: Reload nginx
echo "🌐 Reloading nginx..."
ssh root@77.243.85.8 "systemctl reload nginx"

# Step 6: Health check
echo "🔍 Running health check..."
ssh root@77.243.85.8 "/root/health.sh"

echo ""
echo "✅ DEPLOYMENT COMPLETE!"
echo "🌐 https://aztekafoods.com"
```

---

## 📝 Summary

### Current Status:
- ✅ **Local:** Fully migrated, correct code
- 🟡 **VPS:** Database migrated, code outdated
- ❌ **GitHub:** Old code (both repos)

### Actions Required:
1. ✅ Initialize git on local
2. ✅ Push local code to GitHub (force push)
3. ✅ Initialize git on VPS
4. ✅ Pull from GitHub to VPS
5. ✅ Reinstall dependencies on VPS
6. ✅ Rebuild frontend on VPS
7. ✅ Verify everything works

### Why This Order:
1. **Local → GitHub:** Local has the correct code
2. **GitHub → VPS:** GitHub becomes source of truth
3. **Future:** All changes flow: Local → GitHub → VPS

### Time Required:
- Phase 1 (Git init local): 5 mins
- Phase 2 (Push to GitHub): 2 mins
- Phase 3 (Sync VPS): 10 mins
- Phase 4 (Verify): 5 mins
- **Total:** ~22 minutes

---

## 🔥 Quick Start Commands

### Fastest Path to Sync (Copy-Paste)

```bash
# STEP 1: Initialize local git
cd /Users/ernestoponce/dev/azteka-dsd
git init
git add .
git commit -m "feat: Complete PostgreSQL migration"

# STEP 2: Push to GitHub (overwrites old code)
git remote add origin https://github.com/Ernestop11/Azteka-DSD.git
git push -u origin main --force

# STEP 3: Backup VPS
ssh root@77.243.85.8 "cd /srv && tar -czf azteka-backup-$(date +%Y%m%d).tar.gz azteka-dsd/"

# STEP 4: Sync VPS from GitHub
ssh root@77.243.85.8 "cd /srv/azteka-dsd && git init && git remote add origin https://github.com/Ernestop11/Azteka-DSD.git && git fetch origin main && git reset --hard origin/main && npm install --legacy-peer-deps && npm run build && pm2 restart azteka-api && systemctl reload nginx"

# STEP 5: Verify
ssh root@77.243.85.8 "/root/health.sh"

echo "✅ SYNC COMPLETE!"
```

---

**Ready to sync? Run the Quick Start Commands above!**
