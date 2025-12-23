# 📋 Complete PO Workflow Flow

## 🔄 End-to-End Flow

### **Step 1: Admin Uploads PO** 
**URL:** `https://aztekafoods.com/admin/po`

1. Admin drags & drops PO PDF
2. System parses PDF with AI OCR
3. Extracts:
   - Vendor name
   - PO number
   - Items (SKU, description, quantity, cost)
   - Matches existing products OR marks as NEW
4. Shows review screen with:
   - All items listed
   - New products highlighted in yellow
   - Can edit items before confirming
5. Admin clicks "Confirm & Create Receiving Task"

### **Step 2: PO Confirmed → Database Created**
**What happens:**
- ✅ `PurchaseOrder` record created in database
- ✅ `PurchaseOrderItem` records created for each item
- ✅ New products auto-created (if marked as new)
- ✅ `Task` created with type `RECEIVING` (status: PENDING)
- ✅ `WorkOrder` created for each new product (type: `NEW_PRODUCT_CATALOG`)

**Success Screen Shows:**
- "PO Confirmed Successfully!"
- Number of new products created
- Receiving task assigned
- Options: "View PO History" or "Upload Another PO"

---

### **Step 3: Employee Receiving Screen**
**URL:** `https://aztekafoods.com/employee/receiving`

**What Employee Sees:**
1. **Available Receiving Tasks** (if no active task)
   - List of PENDING receiving tasks
   - Shows: Vendor name, item count, date
   - "Claim" button to start receiving

2. **Active Receiving Task** (after claiming)
   - Progress bar: X/Y items received (Z%)
   - Warning if new products on PO
   - Barcode scanner (camera)
   - Manual SKU entry
   - Items list showing:
     - Description
     - Vendor SKU → Internal SKU
     - Quantity: received/ordered
     - "NEW" badge for new products
   - "Complete Receiving" button (enabled when 100%)

**Employee Actions:**
- Scan barcodes or enter SKUs manually
- System tracks quantity received vs ordered
- Can mark master cases
- Add lot numbers, expiration dates, warehouse locations

**When Complete:**
- Employee clicks "Complete Receiving"
- System:
  - Updates product inventory (stock quantities)
  - Updates product costs
  - Marks PO as RECEIVED
  - Creates work orders for new products (if not already created)
  - Shows success: "X products updated, Y work orders created"

---

### **Step 4: Work Orders for New Products**
**URL:** `https://aztekafoods.com/admin/work-orders` (or similar)

**What Shows:**
- Work orders with type `NEW_PRODUCT_CATALOG`
- Each work order linked to a new product
- Shows:
  - Product name
  - Temporary SKU (NEW-xxx-xxx)
  - Needs: SKU update, category, brand, image, price review
  - Linked to PO number

**Admin Actions:**
- Review new product
- Update SKU to proper format
- Assign category & brand
- Upload product image
- Review/adjust price
- Mark work order as complete

**When Complete:**
- Product is fully configured
- Appears in catalog
- Available for ordering

---

### **Step 5: Products in Catalog**
**URL:** `https://aztekafoods.com/catalog` (or sales rep view)

**What Shows:**
- All products including newly added ones
- Products appear after:
  1. PO confirmed
  2. Receiving completed
  3. Work order completed (if new product)

**Ordering Flow:**
- Sales rep or customer browses catalog
- Adds products to cart
- Places order
- Order goes to warehouse for fulfillment

---

### **Step 6: Vendor PO Screen** (Future)
**URL:** `https://aztekafoods.com/vendor/po` (or similar)

**What Shows:**
- Vendor can see their POs
- PO status (CONFIRMED, RECEIVED, etc.)
- Items ordered
- Expected delivery dates
- Invoice tracking

---

## 🔍 Current Status Check

### To Verify PO Was Saved:
1. Check database: `PurchaseOrder` table
2. Check tasks: `Task` table where `type = 'RECEIVING'`
3. Check work orders: `WorkOrder` table where `type = 'NEW_PRODUCT_CATALOG'`

### To See Receiving Screen:
- Go to: `https://aztekafoods.com/employee/receiving`
- Should see available receiving tasks if PO was confirmed

### To See New Products:
- Check work orders page (if exists)
- Or check products list for products with SKU starting with "NEW-"

---

## 📊 Database Tables Involved

1. **PurchaseOrder** - Main PO record
2. **PurchaseOrderItem** - Individual items on PO
3. **Product** - Products (new ones auto-created)
4. **Task** - Receiving tasks (type: RECEIVING)
5. **WorkOrder** - Catalog setup tasks (type: NEW_PRODUCT_CATALOG)
6. **Vendor** - Vendor information
7. **VendorSkuMapping** - Maps vendor SKUs to internal SKUs

---

## 🚀 Next Steps to Test Flow

1. **Upload a PO** at `/admin/po`
2. **Confirm the PO** - Should see success screen
3. **Check receiving screen** at `/employee/receiving` - Should see task
4. **Employee claims task** - Starts receiving
5. **Employee scans items** - Tracks progress
6. **Employee completes receiving** - Updates inventory
7. **Check work orders** - Should see tasks for new products
8. **Complete work orders** - Configure new products
9. **Check catalog** - New products should appear

---

## 🔗 Key URLs

- **PO Upload:** `https://aztekafoods.com/admin/po`
- **PO History:** `https://aztekafoods.com/admin/po` (with history tab)
- **Employee Receiving:** `https://aztekafoods.com/employee/receiving`
- **Catalog:** `https://aztekafoods.com/catalog`
- **Work Orders:** (Check if exists in admin dashboard)

