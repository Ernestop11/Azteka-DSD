# Background Removal System - Smoke Test & Documentation

## System Overview

The background removal system uses **rembg** (Python) with alpha matting to produce Canva-like clean edges on product images. All processed images are saved directly to the VPS.

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    INVENTORY SEED PAGE                          │
│                  (Admin clicks "Remove BG")                     │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│              POST /api/products/background-removal              │
│                                                                 │
│  1. Load image from VPS: /uploads/products/{id}.png            │
│  2. Save to temp: /srv/azteka-dsd/tmp/{id}-input.png           │
│  3. Run: .venv/bin/python3 scripts/remove-bg.py                │
│  4. Read output: /srv/azteka-dsd/tmp/{id}-output.png           │
│  5. Optimize with Sharp (resize to 800x800 max)                │
│  6. Upload via uploadToVps() service                           │
│  7. Update database with cache-busted URL                      │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                         VPS STORAGE                             │
│                                                                 │
│  Path: /srv/azteka-dsd/public/uploads/products/                │
│  Total Images: 703+                                             │
│  Format: PNG with transparency                                  │
└─────────────────────────────────────────────────────────────────┘
```

## Smoke Test Results (Dec 26, 2024)

### 1. Python Environment
```
Location: /srv/azteka-dsd/.venv/bin/python3
Version: Python 3.11.2
Status: ✅ PASS
```

### 2. rembg Installation
```
Package: rembg 2.0.69
Dependencies: onnxruntime, pillow, numpy, scipy, scikit-image
Status: ✅ PASS
```

### 3. Background Removal Script
```
Location: /srv/azteka-dsd/scripts/remove-bg.py
Features:
  - Uses rembg default u2net model
  - Resizes to 800x800 max (maintains aspect ratio)
  - Outputs PNG with transparency
Status: ✅ PASS
```

### 4. VPS Storage
```
Path: /srv/azteka-dsd/public/uploads/products/
Total Images: 703
Permissions: drwxrwxrwx (world-writable for uploads)
Status: ✅ PASS
```

### 5. PM2 Process
```
Name: azteka-nextjs
Version: 14.2.33
Status: online
Memory: ~304MB
Status: ✅ PASS
```

### 6. End-to-End Test
```
Input: 00852b99-43df-4852-8eb3-7089bb022352.png (39,970 bytes)
Output: smoke-test-output.png (92,519 bytes)
Result: Success
Status: ✅ PASS
```

### 7. Recent API Calls (from PM2 logs)
```
[BG Removal] Starting for product: fc280fb4-274f-4502-83a2-ed623209a636
[BG Removal] Loaded from local file, size: 178778 bytes
[BG Removal] Processing with rembg + alpha matting...
[BG Removal] rembg output: Success
[BG Removal] Processing complete, size: 173594 bytes
[VPS Upload] Running on VPS, writing directly to: /srv/azteka-dsd/public/uploads/products/...
[VPS Upload] Direct write successful
[BG Removal] Database updated with: /uploads/products/...?v=1766739007725
Status: ✅ PASS
```

## Key Files

| File | Purpose |
|------|---------|
| `app/api/products/background-removal/route.ts` | API endpoint that orchestrates the process |
| `scripts/remove-bg.py` | Python script that runs rembg |
| `lib/services/vpsUpload.ts` | Handles saving to VPS (direct write on VPS, SSH from local) |
| `.venv/` | Python virtual environment with rembg |

## VPS Configuration

```bash
# Path (CRITICAL - NOT /srv/azteka-api-live)
VPS_PATH=/srv/azteka-dsd
VPS_UPLOADS_PATH=/srv/azteka-dsd/public/uploads

# Python venv
PYTHON_PATH=/srv/azteka-dsd/.venv/bin/python3
SCRIPT_PATH=/srv/azteka-dsd/scripts/remove-bg.py

# PM2 process
PM2_NAME=azteka-nextjs
```

## Troubleshooting

### "Python venv not found"
```bash
ssh root@77.243.85.8 "cd /srv/azteka-dsd && python3 -m venv .venv && .venv/bin/pip install rembg pillow onnxruntime"
```

### "rembg module not found"
```bash
ssh root@77.243.85.8 "cd /srv/azteka-dsd && .venv/bin/pip install rembg[gpu] pillow onnxruntime"
```

### Check PM2 logs for errors
```bash
ssh root@77.243.85.8 "pm2 logs azteka-nextjs --lines 50 --nostream" | grep -i "BG Removal\|error"
```

### Restart after changes
```bash
ssh root@77.243.85.8 "cd /srv/azteka-dsd && pm2 restart azteka-nextjs && pm2 save"
```

## Browser Caching Note

After background removal, the image URL includes a cache-bust parameter (`?v=timestamp`). If the preview still shows the old image:
1. Hard refresh (Cmd+Shift+R / Ctrl+Shift+R)
2. Clear browser cache
3. Open image URL directly with the new timestamp

## Image Protection

The VPS is the **single source of truth** for images. The deploy script has image sync DISABLED to prevent local placeholders from overwriting real images:

```bash
# From scripts/deploy-to-vps.sh
# DISABLED: Do NOT sync images from local to VPS
# VPS is the single source of truth for images
```

---

**Last Updated:** December 26, 2024
**Smoke Test Status:** ALL PASS ✅
