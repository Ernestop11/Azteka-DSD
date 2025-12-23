# 🔧 Fix Database Error on /admin/po

## Issue
Getting "database error" when trying to access `/admin/po` - the `CustomerPriceOverride` table doesn't exist in the database.

## ✅ Solution

I've created a fix endpoint. Here's how to run it:

### Option 1: Call the Fix Endpoint (Recommended)

1. **Make sure you're logged in** to the admin panel
2. **Open your browser console** (F12)
3. **Run this command:**
   ```javascript
   fetch('/api/admin/fix-database', { method: 'POST', credentials: 'include' })
     .then(r => r.json())
     .then(console.log)
     .catch(console.error)
   ```

4. **Or visit this URL directly** (while logged in):
   ```
   https://aztekafoods.com/api/admin/fix-database
   ```
   Then click "POST" or use a tool like Postman with your session cookie.

### Option 2: Manual SQL (If you have database access)

SSH into VPS and run:
```bash
ssh root@77.243.85.8
cd /srv/azteka-api-live
psql -U ernestoponce -d local_azteka -h localhost -f prisma/migrations/manual_add_customer_price_override.sql
```

**Note:** You'll need the database password for this.

### Option 3: Use Prisma (If DATABASE_URL has password)

```bash
ssh root@77.243.85.8
cd /srv/azteka-api-live
npx prisma db push --skip-generate
```

---

## What the Fix Does

1. Creates `OverrideType` enum
2. Creates `CustomerPriceOverride` table
3. Creates indexes for performance
4. Adds foreign key constraints
5. Creates unique constraint for customer/product/quantity combinations

---

## After Running the Fix

1. The table will be created
2. Prisma client is already generated
3. The `/admin/po` page should work
4. Price management features will be available

---

## Verify It Worked

After running the fix, try accessing:
- `/admin/po` - Should load without database errors
- `/admin/pricing` - Should work (even if empty)

---

## If Still Having Issues

Check PM2 logs:
```bash
ssh root@77.243.85.8
pm2 logs azteka-nextjs --lines 50
```

Look for any Prisma errors related to `CustomerPriceOverride`.




