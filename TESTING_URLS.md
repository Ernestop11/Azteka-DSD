# Testing URLs - Azteka DSD

## Quick Access

### 🔐 Login First
**URL**: `http://localhost:3000/auth/login`

**Default Credentials**:
- Email: `admin@azteka.com`
- Password: `password123`

---

## 🎨 New Design Studio (Main Feature)

### Design Studio Dashboard
**URL**: `http://localhost:3000/admin/design-studio`

This is the main professional editor suite with 6 tabs:
- **Product Editor** - Style products with live preview
- **Bundle Editor** - Create bundles with auto-pricing
- **Image Tools** - Crop and edit images
- **Gradient Editor** - Create custom gradients
- **Preset Library** - Manage visual presets
- **Layout Builder** - Build catalog layout

**Direct Access** (no login required for testing):
```
http://localhost:3000/admin/design-studio
```

---

## 📦 Admin Pages

### Product Management
**URL**: `http://localhost:3000/admin/products`
- View all products
- Edit product data
- Filter by category/brand

### Bundle Management
**URL**: `http://localhost:3000/admin/bundles`
- View all bundles
- Create/edit bundles

### Brand Management
**URL**: `http://localhost:3000/admin/brands`
- Manage brands
- Upload brand logos

### Category Management
**URL**: `http://localhost:3000/admin/categories`
- Manage categories
- Configure category settings

### Admin Dashboard
**URL**: `http://localhost:3000/admin`
- Main admin overview

---

## 🛒 Customer-Facing Pages

### Catalog
**URL**: `http://localhost:3000/catalog`
- Browse products
- View bundles
- Add to cart

### Product Detail
**URL**: `http://localhost:3000/product/[id]`
- Replace `[id]` with actual product ID
- View product details

### Cart
**URL**: `http://localhost:3000/cart`
- View cart
- Checkout

### Orders
**URL**: `http://localhost:3000/orders`
- View order history

---

## 🧪 Testing Workflow

### Test the Design Studio
```bash
# 1. Start dev server
npm run dev

# 2. Open browser to:
http://localhost:3000/admin/design-studio

# 3. Try each tab:
# - Product Editor: Select a product, apply gradient preset
# - Bundle Editor: Search products, add to bundle, set discount
# - Image Tools: Upload an image, crop/rotate
# - Gradient Editor: Create gradient, preview on cards
# - Preset Library: Browse presets, favorite some
# - Layout Builder: Add sections, reorder them
```

### Test Product Editing
```bash
# 1. Go to Product Editor
http://localhost:3000/admin/design-studio

# 2. Select a product from dropdown
# 3. Click "Visuals" tab
# 4. Click "Ocean Blue" preset
# 5. Toggle "Sparkle Effect"
# 6. Change badge to "HOT"
# 7. See live preview on right
# 8. Click "Save Product"
```

### Test Bundle Creation
```bash
# 1. Go to Bundle Editor
http://localhost:3000/admin/design-studio
# Click "Bundle Editor" tab

# 2. Enter bundle name: "Summer Special"
# 3. Search for "Coca" to find Coca-Cola products
# 4. Click "Add to Bundle" on 3 products
# 5. Adjust quantities (e.g., 2, 3, 1)
# 6. Move discount slider to 20%
# 7. See auto-calculated savings
# 8. Click "Save Bundle"
```

### Test Gradient Creation
```bash
# 1. Go to Gradient Editor
http://localhost:3000/admin/design-studio
# Click "Gradient Editor" tab

# 2. Click "Sunset" preset
# 3. Adjust angle to 180°
# 4. Click first color stop, change to #ff6b6b
# 5. Click second color stop, change to #4ecdc4
# 6. See preview on Product Card, Bundle Card, Hero Banner
# 7. Click "Copy CSS" to get gradient code
# 8. Enter name and click "Save"
```

### Test Image Editing
```bash
# 1. Go to Image Tools
http://localhost:3000/admin/design-studio
# Click "Image Tools" tab

# 2. Click upload area or drag an image
# 3. Adjust rotation to 90°
# 4. Increase brightness to 120%
# 5. Adjust zoom to 150%
# 6. Click "Enter Crop Mode"
# 7. Select "Square" preset
# 8. Click "Apply"
# 9. Click "Download Image"
```

### Test Preset Library
```bash
# 1. Go to Preset Library
http://localhost:3000/admin/design-studio
# Click "Preset Library" tab

# 2. Browse built-in presets
# 3. Click star icon to favorite "Ocean Blue"
# 4. Click "Favorites" filter button
# 5. Click "Products" filter to see only product presets
# 6. Search for "ocean" in search box
# 7. Click "Use" on a preset to apply
# 8. Click "Export" to backup presets
```

### Test Layout Builder
```bash
# 1. Go to Layout Builder
http://localhost:3000/admin/design-studio
# Click "Layout Builder" tab

# 2. Click "Hero Banner" in left panel to add
# 3. Click up/down arrows to reorder sections
# 4. Click eye icon to hide a section
# 5. Click settings icon to configure
# 6. Change columns from 4 to 3
# 7. Click color picker to change background
# 8. Click "Save Layout"
# 9. Click "Preview Mode" to see final result
```

---

## 🔍 Debugging

### Check if server is running
```bash
# You should see:
# - Local:        http://localhost:3000
# - Ready in X ms
```

### Check database connection
```bash
# Run this to verify database is accessible:
npx prisma db pull
```

### Check if admin user exists
```bash
# Open Prisma Studio:
npx prisma studio

# Navigate to User table
# Look for: admin@azteka.com
# If not found, run seed:
npm run prisma:seed
```

### Clear browser data
```bash
# If you have issues:
# 1. Open DevTools (F12)
# 2. Application tab
# 3. Clear Storage → Clear site data
# 4. Refresh page
```

---

## 📊 Test Data

### Sample Product IDs
After seeding, you'll have products. To find IDs:
```bash
# Open Prisma Studio:
npx prisma studio

# Go to Product table
# Copy any product ID
# Use in URL: http://localhost:3000/product/{id}
```

### Sample Categories
Common categories after seed:
- Beverages
- Snacks
- Candy
- Cookies

### Sample Brands
Common brands after seed:
- Coca-Cola
- Pepsi
- Sabritas
- Barcel

---

## 🚀 Quick Start Commands

### First Time Setup
```bash
# Install dependencies
npm install

# Setup database
npx prisma generate
npx prisma db push
npm run prisma:seed

# Start dev server
npm run dev

# Open browser
# Navigate to: http://localhost:3000/admin/design-studio
```

### Daily Development
```bash
# Just start the server
npm run dev

# Open: http://localhost:3000/admin/design-studio
```

---

## 🎯 Recommended Test Path

**For first-time testing, follow this order**:

1. **Start Server**
   ```bash
   npm run dev
   ```

2. **Open Design Studio** (no login needed)
   ```
   http://localhost:3000/admin/design-studio
   ```

3. **Test Product Editor**
   - Select a product
   - Apply "Ocean Blue" preset
   - Toggle sparkle effect
   - Change badge to "HOT"
   - See live preview

4. **Test Gradient Editor**
   - Click "Gradient Editor" tab
   - Try "Sunset" preset
   - Adjust colors
   - See preview on different card types

5. **Test Preset Library**
   - Click "Preset Library" tab
   - Browse presets
   - Favorite some presets
   - Try filtering

6. **Test Bundle Editor**
   - Click "Bundle Editor" tab
   - Search for products
   - Add 3 products
   - Set 20% discount
   - See auto-calculated savings

7. **Test Image Tools**
   - Click "Image Tools" tab
   - Upload an image
   - Crop/rotate
   - Apply filters
   - Download result

8. **Test Layout Builder**
   - Click "Layout Builder" tab
   - Add sections
   - Reorder them
   - Configure backgrounds
   - Save layout

---

## 💡 Tips

### No Login Required
The Design Studio pages can be accessed directly without login for testing purposes.

### Use Browser DevTools
- Press F12 to open
- Check Console for errors
- Check Network tab for API calls
- Check Application → Local Storage for saved presets

### Test in Different Browsers
- Chrome (recommended)
- Firefox
- Safari
- Edge

### Test Responsive Design
- Press F12
- Click device toolbar icon
- Test mobile, tablet, desktop views

---

## 📝 Expected Behavior

### Product Editor
- ✅ Live preview updates as you type
- ✅ Presets apply instantly
- ✅ Auto-category styling works
- ✅ Save button becomes active when changes made

### Bundle Editor
- ✅ Product search filters as you type
- ✅ Total value calculates automatically
- ✅ Discount slider updates price in real-time
- ✅ Savings shown in preview

### Image Tools
- ✅ Drag & drop works
- ✅ Canvas updates in real-time
- ✅ Sliders adjust preview instantly
- ✅ Download produces edited image

### Gradient Editor
- ✅ Preview cards update as you adjust
- ✅ Angle slider rotates gradient
- ✅ Color stops can be added/removed
- ✅ CSS output updates automatically

### Preset Library
- ✅ Search filters instantly
- ✅ Category filters work
- ✅ Favorites toggle works
- ✅ Export produces JSON file

### Layout Builder
- ✅ Sections reorder with arrows
- ✅ Show/hide toggles visibility
- ✅ Settings open config panel
- ✅ Preview shows layout structure

---

**Last Updated**: November 22, 2025
**Status**: ✅ Ready for Testing
