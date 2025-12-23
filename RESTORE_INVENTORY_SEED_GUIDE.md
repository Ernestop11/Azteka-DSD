# 🔄 Restore Inventory Seed to Working Version

## Current Situation

- ✅ **v2.0 milestone exists** (Dec 19, 2025, commit: bc7c13c)
- ❌ **inventory-seed page was NOT in v2.0** (created after milestone)
- ⚠️ **File may not be in git** (could be untracked)

## Restore Options

### Option 1: Use VPS Version (If It Was Working Last Night)

The VPS may have the working version from last night before recent changes:

```bash
# Download from VPS
ssh root@77.243.85.8 "cat /srv/azteka-dsd/app/admin/inventory-seed/page.tsx" > app/admin/inventory-seed/page.tsx

# Review and test
npm run build:next
pm2 restart azteka-nextjs
```

### Option 2: Manual Restore from Known Good State

If you remember when it was working (last night ~3am), we can:

1. **Check git log for that timeframe:**
```bash
git log --since="2024-12-22 00:00" --until="2024-12-23 06:00" --all --oneline
```

2. **Find commits that touched the file:**
```bash
git log --all --oneline -- app/admin/inventory-seed/page.tsx
```

3. **Restore from specific commit:**
```bash
git show <commit-hash>:app/admin/inventory-seed/page.tsx > app/admin/inventory-seed/page.tsx
```

### Option 3: Revert Recent Changes

If the file IS in git, we can revert recent commits:

```bash
# See recent changes
git log --oneline -- app/admin/inventory-seed/page.tsx

# Revert to before problematic changes
git checkout <good-commit-hash> -- app/admin/inventory-seed/page.tsx
```

### Option 4: Restore from Backup File

Check for backup files:
```bash
find . -name "*inventory-seed*backup*" -o -name "*inventory-seed*.bak"
```

## Quick Restore Script

I've created `RESTORE_INVENTORY_SEED_V2.sh` that will:
1. Try to restore from v2.0 (if file exists)
2. Otherwise find first version after v2.0
3. Create backup of current version first

Run it:
```bash
./RESTORE_INVENTORY_SEED_V2.sh
```

## What to Look For in Working Version

The working version should have:
- ✅ Simple product grid display
- ✅ Drag & drop functionality
- ✅ Product name, SKU, category visible
- ✅ Image previews working
- ✅ No tabs (just simple list)
- ✅ No complex filtering that breaks display

## Next Steps

1. **Check VPS version** - may be the working one
2. **Compare with current** - see what changed
3. **Restore if needed** - use one of the options above
4. **Test thoroughly** - make sure it works before deploying

