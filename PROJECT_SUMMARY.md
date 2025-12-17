# 📋 Azteka DSD MVP - Project Summary

**Status**: 🟢 In Progress - Core Features Complete  
**Last Updated**: 2025-01-XX  
**Tech Stack**: Next.js 14, TypeScript, Prisma, PostgreSQL, Tailwind CSS

---

## 🎯 What We've Built

### ✅ Completed Features

#### 1. **Authentication System**
- Session-based auth with HTTP-only cookies
- Admin login: `admin@azteka.com` / `password123`
- Public routes for MVP testing (no login required)
- Middleware for route protection

#### 2. **Product Management**
- Full CRUD for products
- Image upload to `/public/uploads/products/`
- Category-based automatic background assignment
- Visual presets (gradients, glows, splashes)
- Tier pricing system (A/B/C)
- Product editor with live preview

#### 3. **Bundle Management**
- Complete bundle CRUD system
- Multi-product bundles with quantities
- Discount percentage calculation
- Bundle image upload
- Business mode targeting
- Badge customization

#### 4. **Catalog System**
- Dynamic catalog builder engine
- Category-based visual effects
- Themed sections:
  - Sabritas Top Sellers
  - Barcel Best Sellers
  - Seasonal Favorites
  - Refreshing Drinks
- Brand bundle heroes
- Promotional sections
- Responsive product grids

#### 5. **UI Components**
- Glossy product cards with backgrounds
- Featured product cards
- Compact product cards
- Category spotlight (horizontal scroll)
- Brand showcase banners
- Discount banners
- Promotional heroes

#### 6. **Cart System**
- Zustand state management
- Persistent cart (localStorage)
- Add to cart modal
- Cart drawer
- Multi-store ordering support

---

## 🛠️ Tech Stack

### Frontend
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Animations**: Framer Motion
- **State Management**: Zustand
- **Data Fetching**: TanStack React Query
- **Icons**: Lucide React

### Backend
- **Runtime**: Node.js
- **API**: Next.js API Routes
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Authentication**: Session-based (HTTP-only cookies)
- **File Storage**: Local filesystem (`/public/uploads/`)

### Development
- **Package Manager**: npm
- **Type Checking**: TypeScript
- **Linting**: ESLint (if configured)

---

## 📁 File Structure & Key Locations

### **Root Directory**
```
/Users/ernestoponce/dev/azteka-dsd/
```

### **Core Application Files**

#### **API Routes** (`app/api/`)
```
app/api/
├── auth/
│   ├── login/route.ts          # POST /api/auth/login
│   └── me/route.ts             # GET /api/auth/me
├── admin/
│   ├── products/route.ts       # CRUD for products
│   ├── bundles/
│   │   ├── route.ts            # GET, POST /api/admin/bundles
│   │   ├── [id]/route.ts       # GET, PUT, DELETE /api/admin/bundles/[id]
│   │   └── brand/[brandId]/route.ts  # Brand bundle endpoint
│   ├── catalog/
│   │   └── layout/route.ts     # Catalog layout builder
│   ├── categories/route.ts     # Category CRUD
│   └── brands/route.ts         # Brand CRUD
└── catalog/
    └── products/route.ts       # Public product listing
```

#### **Pages** (`app/`)
```
app/
├── page.tsx                     # Home page
├── login/page.tsx              # Login page
├── catalog/
│   ├── page.tsx                # Main catalog page (server)
│   ├── CatalogContent.tsx      # Catalog client component
│   └── [slug]/page.tsx         # Product detail page
├── admin/
│   ├── products/
│   │   ├── page.tsx            # Product list
│   │   ├── ProductTable.tsx    # Product table component
│   │   ├── ProductEditor.tsx   # Product editor drawer
│   │   └── ProductImageUpload.tsx
│   └── bundles/
│       ├── page.tsx            # Bundle list
│       └── [id]/page.tsx       # Bundle editor
└── cart/page.tsx               # Cart page
```

#### **Components** (`components/`)
```
components/
├── catalog/
│   ├── GlossyProductCard.tsx   # Main product card with backgrounds
│   ├── FeaturedProductCard.tsx # Large featured cards
│   ├── CompactProductCard.tsx  # Small compact cards
│   ├── BrandedProductSection.tsx # Brand-specific sections
│   ├── ThemedSection.tsx       # Themed sections (seasonal, drinks)
│   ├── BrandBundleHero.tsx      # Brand bundle hero component
│   ├── BrandBundleHeroesSection.tsx
│   ├── CategorySpotlight.tsx   # Category cards (horizontal scroll)
│   ├── ProductGrid.tsx         # Product grid layout
│   ├── ShowcaseSection.tsx     # Featured showcase
│   ├── TrendingRow.tsx         # Trending products
│   ├── DiscountBanner.tsx      # Discount banners
│   ├── PromotionalHero.tsx    # Promo hero sections
│   └── AddToCartModal.tsx     # Add to cart modal
├── ui/
│   ├── button.tsx
│   ├── input.tsx
│   ├── select.tsx
│   ├── drawer.tsx
│   └── toast.tsx
├── CartDrawer.tsx              # Cart sidebar
├── CartItemRow.tsx            # Cart item component
└── Providers.tsx              # Global providers (QueryClient, Cart)
```

#### **Libraries** (`lib/`)
```
lib/
├── prisma.ts                   # Prisma client instance
├── auth/
│   └── session.ts              # Session utilities
├── queries/
│   └── catalog.ts              # Catalog product mapper (toCatalogProduct)
├── imageUrl.ts                 # Image URL normalization
├── catalogBuilder.ts           # 🎯 CATALOG BUILDER ENGINE
├── cards/
│   └── categoryVisuals.ts     # Category-based visual effects
├── utils/
│   ├── colorGenerator.ts      # Color/theme generation
│   └── priceTier.ts           # Tier pricing utilities
└── promoGenerator.ts          # Promotional content generation
```

#### **Database** (`prisma/`)
```
prisma/
├── schema.prisma              # Database schema
│   ├── User, Session          # Auth models
│   ├── Product                # Product model
│   ├── Category, Brand        # Taxonomy
│   ├── ProductBundle          # Bundle model
│   ├── BundleItem             # Bundle items
│   └── Order, OrderItem       # Order system
└── seed.mjs                   # Database seeding
```

#### **Configuration**
```
├── next.config.js             # Next.js config
├── tailwind.config.js         # Tailwind config
├── tsconfig.json              # TypeScript config
├── package.json               # Dependencies
└── middleware.ts              # Route protection middleware
```

---

## 🎯 Key Files to Know

### **Most Important Files**

1. **`lib/catalogBuilder.ts`** - 🎯 **CATALOG BUILDER ENGINE**
   - Central logic for assembling catalog layout
   - Filters products by brand/category
   - Applies category visuals
   - Returns themed sections

2. **`lib/queries/catalog.ts`** - Product Data Normalization
   - `toCatalogProduct()` - Normalizes product data
   - `CatalogProduct` interface
   - **CRITICAL**: Preserves `backgroundGradient` and `backgroundColor`

3. **`lib/cards/categoryVisuals.ts`** - Category Visual Effects
   - Auto-assigns backgrounds based on category
   - Drinks → liquid gradients
   - Snacks → vibrant colors

4. **`app/catalog/CatalogContent.tsx`** - Main Catalog UI
   - Renders all catalog sections
   - Uses catalog builder data
   - Handles filtering, cart, etc.

5. **`app/api/admin/bundles/route.ts`** - Bundle API
   - CRUD operations for bundles
   - Image upload handling

---

## 🚧 Remaining Work & Where to Finish

### **Priority 1: Critical Fixes**

#### **1. Admin Save Error** (`app/admin/products/ProductEditor.tsx`)
- **Issue**: Shows "Failed to update product" even when save succeeds
- **Location**: `app/admin/products/ProductEditor.tsx` (lines 400-450)
- **Fix**: Improve response handling in `saveMutation.onSuccess`
- **Related**: `app/api/admin/products/route.ts` (PUT handler)

#### **2. Bundle Editor Form Submission** (`app/admin/bundles/[id]/page.tsx`)
- **Issue**: Form might not submit correctly
- **Location**: `app/admin/bundles/[id]/page.tsx` (lines 500-600)
- **Fix**: Verify FormData construction, error handling
- **Test**: Create bundle with products, upload image

### **Priority 2: UI Enhancements**

#### **3. Advanced Catalog Filters** (`components/catalog/`)
- **Location**: Create new files:
  - `components/catalog/SubcategoryNav.tsx`
  - `components/catalog/BrandFilterBar.tsx`
  - `components/catalog/LayoutVariants.tsx`
- **Integration**: `app/catalog/CatalogContent.tsx`
- **Hook**: `hooks/useCatalogFilters.ts` (extend)

#### **4. Product Editor Enhancements** (`app/admin/products/`)
- **Location**: 
  - `app/admin/products/ProductImageUpload.tsx` - Add cropping
  - `components/admin/ProductPreviewPanel.tsx` - Create new
  - `components/admin/ImageCropper.tsx` - Create new
- **Enhancement**: Live preview, image cropping, better tools

#### **5. Bundle Display Components** (`components/catalog/`)
- **Location**: Create new files:
  - `components/catalog/BundleCard.tsx`
  - `components/catalog/BundleGrid.tsx`
  - `components/catalog/BundleDetailModal.tsx`
- **Integration**: `app/catalog/CatalogContent.tsx`

### **Priority 3: Database & Schema**

#### **6. Prisma Migrations**
- **Location**: `prisma/migrations/`
- **Action**: Run migration for ProductBundle model:
  ```bash
  npx prisma migrate dev --name add_product_bundle
  ```
- **Note**: Schema is updated, but migration might be needed

#### **7. Database Seeding**
- **Location**: `prisma/seed.mjs`
- **Enhance**: Add sample products with categories/brands
- **Test**: Seed Sabritas, Barcel products for themed sections

### **Priority 4: Polish & Optimization**

#### **8. Mobile/Tablet Optimization**
- **Location**: All component files in `components/catalog/`
- **Focus**: Responsive breakpoints, touch interactions
- **Files**: `app/admin/products/page.tsx`, `app/admin/bundles/page.tsx`

#### **9. Visual Preset Library**
- **Location**: `components/admin/VisualPresetLibrary.tsx` (create)
- **Integration**: `app/admin/products/ProductEditor.tsx`
- **API**: `app/api/presets/visual/route.ts` (if exists)

#### **10. Analytics Dashboard**
- **Location**: `app/admin/analytics/page.tsx` (create)
- **API**: `app/api/admin/analytics/route.ts` (create)
- **Components**: `components/admin/AnalyticsDashboard.tsx` (create)

---

## 📝 Configuration Files

### **Environment Variables** (`.env` or `.env.local`)
```
DATABASE_URL=postgresql://...
NODE_ENV=development
```

### **Middleware** (`middleware.ts`)
- Route protection
- Public routes configuration
- Session validation

### **Next.js Config** (`next.config.js`)
- Image optimization
- API routes
- Experimental features

---

## 🔍 How to Find Things

### **Looking for...**

- **Product data normalization**: `lib/queries/catalog.ts`
- **Catalog layout logic**: `lib/catalogBuilder.ts`
- **Category visuals**: `lib/cards/categoryVisuals.ts`
- **Product cards**: `components/catalog/GlossyProductCard.tsx`
- **Bundle API**: `app/api/admin/bundles/route.ts`
- **Bundle UI**: `app/admin/bundles/[id]/page.tsx`
- **Cart logic**: `store/cart.ts` (Zustand)
- **Auth logic**: `lib/auth/session.ts`
- **Image handling**: `lib/imageUrl.ts`

---

## 🚀 Quick Commands

```bash
# Start dev server
npm run dev

# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma migrate dev

# Seed database
npm run prisma:seed

# Build for production
npm run build
```

---

## 📊 Current Status

### ✅ **Working**
- Product CRUD
- Bundle CRUD (schema added, needs testing)
- Catalog display with backgrounds
- Themed sections (if products exist)
- Cart system
- Image uploads

### ⚠️ **Needs Testing/Fixing**
- Bundle editor form submission
- Admin product save error message
- Category visuals application (verify in browser)
- Themed sections (need products with correct brands/categories)

### 🚧 **To Build**
- Advanced filters
- Bundle display components
- Product editor enhancements
- Mobile optimization
- Analytics dashboard

---

## 🎯 Next Steps

1. **Test bundle editor** - Create a bundle, verify it works
2. **Fix admin save error** - Improve error handling
3. **Add more products** - Seed products with Sabritas/Barcel brands
4. **Test themed sections** - Verify sections appear in catalog
5. **Add filters** - Build subcategory/brand filters
6. **Polish UI** - Mobile optimization, better visuals

---

**All work lives in**: `/Users/ernestoponce/dev/azteka-dsd/`  
**Main entry point**: `app/page.tsx` or `app/catalog/page.tsx`  
**API base**: `app/api/`  
**Components**: `components/`  
**Business logic**: `lib/`

