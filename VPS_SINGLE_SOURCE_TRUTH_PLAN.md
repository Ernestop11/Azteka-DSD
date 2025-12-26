# VPS Single Source of Truth Plan

## ⚠️ CRITICAL: CORRECT VPS PATH

```
CORRECT PATH: /srv/azteka-dsd
WRONG PATH:   /srv/azteka-api-live  (DEPRECATED - DO NOT USE)

PM2 PROCESS:  azteka-production
VPS HOST:     72.62.162.163  (NEW VPS - Dec 2025)
OLD VPS:      77.243.85.8    (kept for other projects)
VPS USER:     root
```

**Why this keeps breaking:**
1. Old documentation/scripts reference `/srv/azteka-api-live`
2. Claude permissions in `.claude/settings.local.json` have old paths
3. When deploying, sometimes wrong paths are used from bash history

**The fix:**
- ALWAYS use `scripts/deploy-vps.sh` for deployments
- NEVER manually rsync to `/srv/azteka-api-live`
- The correct PM2 config is in `/srv/azteka-dsd/pm2.config.cjs`

---

## Current State (UPDATED Dec 2025)

### Database: VPS PostgreSQL ✅
- All data through Prisma
- PostgreSQL on VPS localhost:5432
- Database: `azteka_dsd`

### Images: Direct VPS Write ✅
- Uploads go directly to `/srv/azteka-dsd/public/uploads/`
- `lib/services/vpsUpload.ts` handles this
- Nginx serves static files directly
- Cache busting via `?v=timestamp`

### Builds: Local Build → rsync to VPS ✅
- Build locally: `npm run build:next`
- Deploy: `rsync .next-azteka/ root@77.243.85.8:/srv/azteka-dsd/.next-azteka/`
- Restart: `pm2 restart azteka-nextjs`

---

## The Single Source of Truth Architecture

### Recommended Solution: VPS as Primary

```
┌──────────────────────────────────────────────────────────────┐
│                        VPS (77.243.85.8)                     │
│  ┌────────────────────────────────────────────────────────┐  │
│  │            PostgreSQL Database                         │  │
│  │  - Products, Categories, Brands                        │  │
│  │  - Orders, Customers                                   │  │
│  │  - Sessions, Auth                                      │  │
│  └────────────────────────────────────────────────────────┘  │
│  ┌────────────────────────────────────────────────────────┐  │
│  │            Image Storage                               │  │
│  │  /srv/azteka-dsd/public/uploads/                       │  │
│  │  - products/                                           │  │
│  │  - brands/                                             │  │
│  │  - categories/                                         │  │
│  │  - catalog/                                            │  │
│  └────────────────────────────────────────────────────────┘  │
│  ┌────────────────────────────────────────────────────────┐  │
│  │            Next.js App (PM2)                           │  │
│  │  - Build artifacts in .next-azteka/                    │  │
│  │  - Serves on port 3000                                 │  │
│  │  - Nginx reverse proxy to aztekafoods.com             │  │
│  └────────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────┘
                            ▲
                            │ API Calls
                            │ (HTTPS)
┌───────────────────────────┼───────────────────────────────┐
│                           │                               │
│   ┌───────────────┐   ┌───┴───────────┐   ┌────────────┐ │
│   │   Local Dev   │   │   Tablets     │   │   Mobile   │ │
│   │   (Testing)   │   │   (Employees) │   │   (Sales)  │ │
│   └───────────────┘   └───────────────┘   └────────────┘ │
│                                                           │
└───────────────────────────────────────────────────────────┘
```

---

## Implementation Plan

### Phase 1: Environment Configuration (Immediate)

1. **Update `.env.production`** on VPS with correct DATABASE_URL
2. **Set `NEXT_PUBLIC_UPLOAD_BASE_URL`** to `https://aztekafoods.com`
3. **Ensure VPS PostgreSQL** accepts connections from Next.js app

### Phase 2: Image Upload Fix (This Sprint)

**Option A: Direct VPS Upload (Recommended)**
- Add `node-ssh` or similar library
- Modify upload routes to SSH/SCP images directly to VPS
- Remove local storage step entirely

```typescript
// Example: Direct VPS upload
import { NodeSSH } from 'node-ssh';

const ssh = new NodeSSH();
await ssh.connect({ host: '77.243.85.8', username: 'root', privateKey: ... });
await ssh.putFile(localBuffer, `/srv/azteka-dsd/public/uploads/products/${productId}.png`);
```

**Option B: VPS-as-origin (Simpler)**
- Keep current local upload
- Add automatic rsync trigger after each upload
- Configure webhook to sync specific file

### Phase 3: Build Workflow Standardization

**Recommended: Build on VPS**
1. Push code via Git to VPS
2. Run `npm run build:next` ON VPS
3. Restart PM2

**Avoid:** Building locally and rsync-ing `.next-azteka/` (creates state mismatch)

### Phase 4: Local Development Setup

For local development to work against VPS:

```bash
# .env.local (NOT committed)
DATABASE_URL="postgresql://user:pass@77.243.85.8:5432/azteka_dsd"
NEXT_PUBLIC_UPLOAD_BASE_URL="https://aztekafoods.com"
```

This allows local testing with VPS data but images still served from VPS.

---

## Workflow Changes

### Current (Problematic)
```
1. Developer uploads image → Saved to LOCAL /public/uploads/
2. Database updated with /uploads/products/xxx.png
3. User visits site → Image 404 (not on VPS yet!)
4. Developer runs deploy script → rsync syncs images
5. Now image works
```

### Proposed (Single Source)
```
1. Developer uploads image → Directly uploaded to VPS /srv/azteka-dsd/public/uploads/
2. Database updated with /uploads/products/xxx.png
3. User visits site → Image loads from VPS immediately
```

---

## PO Workflow Status

The PO parsing system is **properly configured**:

1. **PDF Upload** (`POST /api/admin/po`) - Parses PDF, extracts items
2. **Confirmation** (`POST /api/admin/po/confirm`) - Creates:
   - PurchaseOrder record
   - POItems for each product
   - Auto-creates new products (marked `needsReview: true`)
   - Creates RECEIVING task for employees
   - Creates work orders for new products needing catalog setup

**Flow:**
```
Upload PDF → Parse Items → Match to existing products →
Create PO → Create receiving task →
Employee receives shipment → Updates stock →
Admin seeds images for new products
```

---

## Files to Modify

### For Direct VPS Upload (Phase 2A)

1. **`package.json`** - Add `node-ssh` dependency
2. **`app/api/admin/products/uploadImage/route.ts`** - Upload to VPS
3. **`app/api/employee/products/upload-image/route.ts`** - Upload to VPS
4. **`app/api/admin/brands/uploadImage/route.ts`** - Upload to VPS
5. **`app/api/admin/categories/uploadImage/route.ts`** - Upload to VPS
6. **`app/api/admin/catalog/upload-image/route.ts`** - Upload to VPS

### For Build Standardization (Phase 3)

1. **`scripts/deploy-to-vps.sh`** - Remove rsync of `.next-azteka/`, build on VPS instead
2. **`package.json`** - Add `deploy` script that SSH builds on VPS

---

## Quick Reference: Current vs Target

| Aspect | Current | Target |
|--------|---------|--------|
| Database | VPS PostgreSQL | VPS PostgreSQL (no change) |
| Images | Local → Manual Sync | Direct to VPS |
| Builds | Local → rsync | Build on VPS |
| Deploys | Multi-step manual | `npm run deploy` single command |
| Dev Testing | Local DB | Can use VPS DB with env override |

---

## Immediate Action Items

1. [ ] **Fix the employee/inventory UI** - ✅ Done (modal widths, grid overflow)
2. [ ] **Verify VPS DATABASE_URL** is correct in production
3. [ ] **Add VPS SSH key** to deploy script or create image upload service
4. [ ] **Test PO upload flow** end-to-end on VPS
5. [ ] **Create deployment checklist** for consistent deployments

---

## Contact/Resources

- VPS IP: `72.62.162.163` (NEW - Dec 2025)
- VPS User: `root`
- VPS Path: `/srv/azteka-dsd`
- Domain: `aztekafoods.com`
- PM2 Process: `azteka-production`
- Deploy Script: `./scripts/safe-deploy.sh`
