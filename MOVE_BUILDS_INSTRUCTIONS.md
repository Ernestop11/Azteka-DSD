# 📦 Moving Builds to External Drive

## ✅ What Was Done

1. **Cleaned local caches** - Freed **662MB** of space
   - Cleaned `~/.cache` (662MB)
   - Cleaned npm cache
   - Cleaned node_modules cache

2. **Created migration script** - `scripts/move-builds-to-external.sh`
   - Safely moves `node_modules`, `.next`, `.turbo` to external drive
   - Creates symlinks so project continues to work
   - Can be run when external drive is properly mounted

## 🚀 How to Use the Script

### Option 1: Use Personal Drive (Default)
```bash
cd /Users/ernestoponce/dev/azteka-dsd
./scripts/move-builds-to-external.sh
```

### Option 2: Specify a Different Drive
```bash
./scripts/move-builds-to-external.sh "/Volumes/AlessaCloud"
./scripts/move-builds-to-external.sh "/Volumes/Distrimex, LLC"
./scripts/move-builds-to-external.sh "/Volumes/Superkid Brand, LLC"
```

## 📊 Current Status

- **Local disk**: 98% used (4.3GB free)
- **node_modules**: 1.2GB (can be moved)
- **External drives available**:
  - `/Volumes/Personal` - 880GB free
  - `/Volumes/AlessaCloud` - 434GB free
  - `/Volumes/Distrimex, LLC` - 930GB free
  - `/Volumes/Superkid Brand, LLC` - 541GB free

## ⚠️ Note

The external drives showed I/O errors when I tried to access them. This might mean:
1. The drives need to be remounted
2. There's a filesystem issue
3. The drives are in use by another process

**To fix:**
1. Eject and remount the external drive
2. Check Disk Utility for errors
3. Then run the migration script

## 🔄 What Gets Moved

- `node_modules` (1.2GB) - Can be regenerated with `npm install`
- `.next` directory - Can be regenerated with `npm run build`
- `.next-azteka` - Build cache
- `.turbo` - Turbo build cache

**All moved files are symlinked back**, so your project will continue to work normally!

## ✅ After Moving

The script will:
1. Move files to external drive
2. Create symlinks in project directory
3. Show space freed on local drive

Your project will work exactly the same, but builds will be stored on the external drive.




