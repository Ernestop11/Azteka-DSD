# Fix Price Error - VS Code Prompt

## 🚨 CRITICAL ERROR FOUND

**Error:** `Uncaught TypeError: t.price.toFixed is not a function`

**Location:** `index-U8RZyQCK.js:31:6471` (AppSimple component)

**Cause:** `price` is not a number (probably a string from API)

## 🔧 FIX PROMPT

Copy this into VS Code Claude chat:

---

```
I have a critical error causing white page:

Error: "Uncaught TypeError: t.price.toFixed is not a function"
Location: index-U8RZyQCK.js:31:6471 (AppSimple component)

The issue:
- API returns price as string (e.g., "24.99") or decimal type
- AppSimple calls price.toFixed() assuming it's a number
- But price is not a number, so toFixed() fails
- This crashes the entire app → white page

Please:
1. Check AppSimple.tsx where price.toFixed() is called
2. Convert price to number before calling toFixed():
   - Use: Number(price) or parseFloat(price)
   - Or: const numPrice = typeof price === 'number' ? price : parseFloat(price)
3. Add safety checks for all numeric operations:
   - Check if price exists
   - Check if price is valid number
   - Provide default value if missing
4. Test with console.log to verify price type:
   - Log typeof price before using it
   - Log the actual price value
5. Fix all places where price is used:
   - price.toFixed(2) → Number(price).toFixed(2)
   - price * quantity → Number(price) * quantity
   - Any other numeric operations

The app is at: /Users/ernestoponce/dev/azteka-dsd
AppSimple is at: src/AppSimple.tsx
API returns price as: string or decimal (not number)

Fix the price type conversion so toFixed() works correctly!
```

---

## 🎯 Quick Fix

The fix is simple - convert price to number:

**Before:**
```typescript
${product.price.toFixed(2)}
```

**After:**
```typescript
${Number(product.price).toFixed(2)}
```

Or with safety:
```typescript
${(Number(product.price) || 0).toFixed(2)}
```

## 📋 What To Do

1. **Copy the prompt above** into VS Code Claude chat
2. **Let it fix** the price conversion
3. **Rebuild and deploy**
4. **Test** - should work immediately!

This is a simple type conversion issue - once fixed, your catalog will work!

