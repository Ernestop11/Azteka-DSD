# Step-by-Step Fix for White Page

## 🎯 The Problem

- ✅ AppTest works (shows products)
- ❌ AppMinimal shows white screen
- **Conclusion:** ProductCard component is the issue

## 🔧 Step-by-Step Solution

### Step 1: Create Version Without ProductCard

**Prompt for VS Code:**

```
Create AppSimple.tsx that shows products WITHOUT ProductCard:

- Fetches from /api/products (same as AppMinimal)
- Shows products in simple grid using basic HTML/CSS
- Each product shows:
  - Image (if available, with fallback)
  - Name
  - Price
  - "Add to Cart" button
- No complex components
- Works immediately

Then update main.tsx to use AppSimple instead of AppMinimal.

This will prove the issue is ProductCard, not the app structure.
```

### Step 2: If AppSimple Works

**Then fix ProductCard:**

```
ProductCard is causing white screen. AppSimple works without it.

Please:
1. Check ProductCard.tsx line by line
2. Find what's causing the crash
3. Add default values for all properties
4. Add error handling
5. Make it fail gracefully

Or create ProductCardSimple.tsx that:
- Uses same props as ProductCard
- Simpler implementation
- Handles missing properties
- Works reliably
```

### Step 3: Test Each Product

**If still issues:**

```
Add console.log to AppMinimal to see which product breaks:

- Log each product before rendering
- Log what ProductCard receives
- Try rendering products one by one
- Find which product causes the crash
- Fix that product's data or ProductCard's handling of it
```

## 🚀 Quick Action: Use This Prompt Now

Copy this into VS Code Claude chat:

---

```
I have a white page. AppTest works but AppMinimal doesn't.

The difference: AppMinimal uses ProductCard component.

Please create AppSimple.tsx that:
1. Fetches products from /api/products (same as AppMinimal)
2. Shows products WITHOUT ProductCard component
3. Uses simple HTML/CSS cards instead
4. Shows: image, name, price, description, "Add to Cart"
5. Works immediately

Then update main.tsx to use AppSimple.

This will get the catalog working, then we can fix ProductCard separately.

The app is at: /Users/ernestoponce/dev/azteka-dsd
API returns products with: id, name, sku, price, imageUrl, inStock, etc.
```

---

## 📋 What This Will Do

1. **Get catalog working immediately** (without ProductCard)
2. **Prove ProductCard is the issue**
3. **Show products in simple cards**
4. **Then we can fix ProductCard** separately

## ✅ Expected Result

After running the prompt, you'll see:
- Products displayed in simple cards
- No white page
- Working catalog
- Then we can enhance ProductCard

**Start with the prompt above - it will get you working immediately!**

