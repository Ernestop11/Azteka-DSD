# Business Settings Sync Information

## ✅ Where Settings Are Saved

**Database Table:** `BusinessSettings` (PostgreSQL)
- **Location:** Saved on VPS database
- **Record ID:** `'default'` (single record for all business settings)
- **Fields Saved:**
  - Business name, address, phone, email, website, tax ID
  - Warehouse address (street, city, state, zip)
  - Business hours (open, close, days)
  - Delivery radius

## 📄 Pages That Use Business Settings

### 1. **Catalog Page** (`/catalog`)
- **Uses:** Business name in header
- **API:** `/api/settings/public`
- **Updates:** Every 10 seconds (auto-refresh)
- **Status:** ✅ Now synced with cache invalidation

### 2. **Driver Page** (`/driver/today`)
- **Uses:** Warehouse address and phone
- **API:** `/api/settings/public`
- **Status:** ✅ Synced

### 3. **Kiosk Page** (`/kiosk`)
- **Uses:** Business name
- **API:** `/api/settings/public`
- **Status:** ✅ Synced

### 4. **Admin Settings Page** (`/admin/settings`)
- **Uses:** All settings (edit page)
- **API:** `/api/admin/settings`
- **Status:** ✅ Working and saving

## 🔄 Sync Mechanism

1. **When you save settings:**
   - Data is saved to `BusinessSettings` table in database
   - Cache is invalidated for:
     - `/catalog` page
     - `/driver/today` page
     - `/kiosk` page
     - `/api/settings/public` endpoint

2. **Catalog header updates:**
   - Fetches from `/api/settings/public` every 10 seconds
   - No cache on the API endpoint (always fresh)
   - Should update within 10 seconds of saving

## 📊 SalesRep and Driver Addresses

**Important:** SalesRep and Driver models do NOT have address fields to sync with BusinessSettings.

- **SalesRep Model:** Only has `name`, `email`, `phone`, `territory` (no address)
- **Driver Model:** Drivers are Users, they don't have separate address fields
- **Warehouse Address:** Stored in `BusinessSettings.warehouseAddress` and used by driver page

## ✅ Verification

Settings ARE being saved to the VPS database. The catalog header should update within 10 seconds after saving.

If the header doesn't update:
1. Hard refresh the catalog page (Ctrl+Shift+R)
2. Wait up to 10 seconds for auto-refresh
3. Check browser console for any errors





