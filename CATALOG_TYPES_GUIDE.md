# Catalog TypeScript Schema Guide
## Unified Type System for Azteka DSD Catalog

**File:** `types/catalog.ts`
**Created:** 2025-11-19
**Total Types:** 50+ interfaces, types, and utility functions

---

## 📋 Table of Contents

1. [Core Enums](#core-enums)
2. [Configuration Objects](#configuration-objects)
3. [Product Types](#product-types)
4. [Brand & Bundle Types](#brand--bundle-types)
5. [Component Props](#component-props)
6. [Utility Functions](#utility-functions)
7. [Type Guards](#type-guards)
8. [Usage Examples](#usage-examples)

---

## 🎯 Core Enums

### ProductTier
```typescript
type ProductTier = 'A' | 'B' | 'C'
```
- **A**: Premium tier (gold)
- **B**: Standard tier (silver)
- **C**: Value tier (bronze)

### ProductBadge
```typescript
type ProductBadge = 'NEW' | 'SALE' | 'HOT' | 'LIMITED'
```
- **NEW**: Blue badge (new arrivals)
- **SALE**: Red badge (on sale)
- **HOT**: Orange badge (trending)
- **LIMITED**: Purple badge (limited edition)

### SeasonalTheme
```typescript
type SeasonalTheme = 'christmas' | 'summer' | 'dia-muertos'
```
- **christmas**: Red/Green gradients, snowflake icon
- **summer**: Cyan/Blue gradients, sun icon
- **dia-muertos**: Orange/Pink gradients, skull icon

### Other Enums
```typescript
type VisualTheme = 'default' | 'holiday' | 'summer' | 'muertos'
type ColorTheme = 'blue' | 'purple' | 'emerald' | 'orange'
type GlossLevel = 'none' | 'soft' | 'premium'
type ImagePosition = 'left' | 'right'
type OverlayStyle = 'dark' | 'light' | 'gradient'
type MarqueeDirection = 'left' | 'right'
type BundleBadge = 'BEST VALUE' | 'POPULAR' | 'LIMITED TIME'
```

---

## 🎨 Configuration Objects

### TIER_CONFIGS
Pre-defined visual configurations for each tier:

```typescript
import { TIER_CONFIGS, getTierConfig } from '@/types/catalog'

const tierA = TIER_CONFIGS.A
// {
//   id: 'A',
//   name: 'Premium',
//   description: 'Top-tier products',
//   gradient: 'from-amber-400 via-yellow-500 to-amber-600',
//   bgGradient: 'from-amber-50 to-yellow-50',
//   textColor: 'text-amber-700',
//   borderColor: 'border-amber-400',
//   iconColor: 'text-amber-600',
//   priority: 1
// }

// Or use helper:
const config = getTierConfig('B')
```

### BADGE_CONFIGS
Pre-defined badge styles:

```typescript
import { BADGE_CONFIGS, getBadgeConfig } from '@/types/catalog'

const saleConfig = BADGE_CONFIGS.SALE
// {
//   id: 'SALE',
//   label: 'SALE',
//   gradient: 'from-red-500 to-pink-500',
//   textColor: 'text-white',
//   animated: true
// }
```

### SEASONAL_CONFIGS
Pre-defined seasonal themes:

```typescript
import { SEASONAL_CONFIGS, getSeasonalConfig } from '@/types/catalog'

const christmas = SEASONAL_CONFIGS.christmas
// {
//   id: 'christmas',
//   title: 'Christmas Collection',
//   subtitle: 'Celebrate the Season',
//   gradient: 'from-red-600 via-green-600 to-red-700',
//   bgPattern: 'bg-[radial-gradient(...)]',
//   iconColor: 'text-red-600',
//   accentColor: 'from-red-500 to-green-600',
//   icon: 'Snowflake'
// }
```

---

## 📦 Product Types

### CatalogProduct
The main product interface combining all features:

```typescript
import type { CatalogProduct } from '@/types/catalog'

const product: CatalogProduct = {
  // Base fields (required)
  id: 'prod-123',
  name: 'Premium Coffee Beans',
  imageUrl: '/images/coffee.jpg',
  price: 24.99,
  sku: 'COF-001',

  // Pricing (optional)
  originalPrice: 34.99,
  priceTierA: 22.99,
  priceTierB: 24.99,
  priceTierC: 26.99,
  activeTier: 'A', // Current user's tier

  // Visuals (optional)
  tier: 'A',
  badge: 'SALE',
  seasonal: 'christmas',
  theme: 'holiday',
  glossLevel: 'premium',
  sparkle: true,

  // Metadata (optional)
  brand: 'Azteka Select',
  brandId: 'brand-123',
  category: 'Beverages',
  categoryId: 'cat-456',
  rewardsPoints: 100,
  rating: 5,
  reviewCount: 42,

  // Computed (optional)
  displayPrice: 22.99,
  hasDiscount: true,
  inStock: true,
  stockCount: 150,
}
```

### Composable Interfaces

Build products from smaller pieces:

```typescript
import type {
  BaseProduct,
  TieredPricing,
  ProductVisuals,
  ProductMetadata,
  ProductPricing
} from '@/types/catalog'

// Minimal product
const minimal: BaseProduct = {
  id: '1',
  name: 'Product',
  imageUrl: '/image.jpg',
  price: 10.0,
}

// With tiered pricing
const tiered: BaseProduct & TieredPricing = {
  ...minimal,
  priceTierA: 9.0,
  priceTierB: 10.0,
  priceTierC: 11.0,
  activeTier: 'A',
}

// Full featured
const full: CatalogProduct = {
  ...tiered,
  tier: 'A',
  badge: 'NEW',
  rating: 5,
}
```

---

## 🏷️ Brand & Bundle Types

### Brand
```typescript
import type { Brand, BrandMap, createBrandMap } from '@/types/catalog'

const brand: Brand = {
  id: 'brand-coca-cola',
  name: 'Coca-Cola',
  slug: 'coca-cola',
  logoUrl: '/brands/coca-cola-logo.png',
  imageUrl: '/brands/coca-cola-banner.jpg',
  description: 'The real thing',
  productCount: 45,
  featured: true,
  priority: 1,
}

// Create lookup map
const brands: Brand[] = [brand, /* ... */]
const brandMap: BrandMap = createBrandMap(brands)
const cocaCola = brandMap['brand-coca-cola']
```

### Bundle
```typescript
import type { Bundle, BundleProduct, BundleMap } from '@/types/catalog'

const bundle: Bundle = {
  id: 'bundle-starter',
  name: 'Starter Pack',
  slug: 'starter-pack',
  description: 'Everything you need to get started',
  products: [
    {
      id: 'prod-1',
      name: 'Product 1',
      imageUrl: '/p1.jpg',
      price: 10.0,
      quantity: 2,
    },
    // ... more products
  ],
  originalPrice: 100.0,
  bundlePrice: 75.0,
  savings: 25.0,
  savingsPercent: 25,
  badge: 'BEST VALUE',
  imageUrl: '/bundles/starter.jpg',
  featured: true,
  seasonal: 'christmas',
}
```

---

## 🧩 Component Props

### GlossyProductCardProps
```typescript
import type { GlossyProductCardProps } from '@/types/catalog'
import GlossyProductCard from '@/components/catalog/GlossyProductCard'

<GlossyProductCard
  product={catalogProduct}
  index={0}
  onClick={() => router.push(`/products/${product.id}`)}
  onAddToCart={() => addToCart(product.id)}
  showTierPricing={true}
  showRewards={true}
  showRating={true}
/>
```

### BrandSectionProps
```typescript
import type { BrandSectionProps } from '@/types/catalog'
import BrandSection from '@/components/catalog/BrandSection'

<BrandSection
  brands={allBrands}
  title="Shop by Brand"
  subtitle="Your favorite brands"
  onBrandClick={(id) => router.push(`/brands/${id}`)}
  onViewAll={() => router.push('/brands')}
  columns={{
    mobile: 2,
    tablet: 3,
    desktop: 6,
  }}
/>
```

### SeasonalSectionProps
```typescript
import type { SeasonalSectionProps } from '@/types/catalog'
import SeasonalSection from '@/components/catalog/SeasonalSection'

<SeasonalSection
  season="christmas"
  products={christmasProducts}
  title="Holiday Specials" // Override default
  subtitle="Limited Time Only" // Override default
  onProductClick={(id) => router.push(`/products/${id}`)}
  onAddToCart={(id) => addToCart(id)}
  onViewAll={() => router.push('/seasonal/christmas')}
  maxProducts={12}
/>
```

### BundleCardProps
```typescript
import type { BundleCardProps } from '@/types/catalog'
import BundleCard from '@/components/catalog/BundleCard'

<BundleCard
  bundle={starterBundle}
  index={0}
  onClick={() => router.push(`/bundles/${bundle.id}`)}
  onAddToCart={() => addBundleToCart(bundle.id)}
  showSavings={true}
  showProductCount={true}
/>
```

### PriceTierBarProps
```typescript
import type { PriceTierBarProps, TierCounts } from '@/types/catalog'
import PriceTierBar from '@/components/catalog/PriceTierBar'

const tierCounts: TierCounts = { A: 125, B: 340, C: 210 }

<PriceTierBar
  activeTier={userTier}
  onTierSelect={(tier) => setUserTier(tier)}
  showCounts={true}
  tierCounts={tierCounts}
  highlightActive={true}
  sticky={true}
/>
```

### Other Component Props
```typescript
import type {
  HeroBannerProps,
  BillboardProps,
  MarqueeScrollProps,
  CatalogShowcaseProps,
} from '@/types/catalog'
```

---

## 🛠️ Utility Functions

### Price Calculations

```typescript
import { getDisplayPrice, calculateDiscount } from '@/types/catalog'

const product: CatalogProduct = {
  price: 100,
  originalPrice: 150,
  priceTierA: 90,
  priceTierB: 100,
  priceTierC: 110,
  activeTier: 'A',
}

const displayPrice = getDisplayPrice(product)
// Returns: 90 (tier A price)

const discount = calculateDiscount(product)
// Returns: 40 (percentage off from original)
```

### Bundle Calculations

```typescript
import { calculateBundleSavings } from '@/types/catalog'

const bundle: Bundle = {
  originalPrice: 100,
  bundlePrice: 75,
  savings: 25,
  // ...
}

const savingsPercent = calculateBundleSavings(bundle)
// Returns: 25
```

### Filtering

```typescript
import { filterProducts, type CatalogFilters } from '@/types/catalog'

const filters: CatalogFilters = {
  tiers: ['A', 'B'],
  brands: ['brand-123'],
  badges: ['SALE', 'HOT'],
  minPrice: 10,
  maxPrice: 50,
  inStock: true,
  search: 'coffee',
}

const filtered = filterProducts(allProducts, filters)
```

### Sorting

```typescript
import { sortProducts, type CatalogSortOption } from '@/types/catalog'

const sortOption: CatalogSortOption = 'price-asc'
const sorted = sortProducts(allProducts, sortOption)

// Available options:
// 'price-asc' | 'price-desc' | 'name-asc' | 'name-desc'
// | 'rating-desc' | 'newest' | 'popular'
```

### Mapping

```typescript
import { createBrandMap, createBundleMap } from '@/types/catalog'

const brandMap = createBrandMap(brandsArray)
const bundleMap = createBundleMap(bundlesArray)

// Quick lookups:
const brand = brandMap['brand-id']
const bundle = bundleMap['bundle-id']
```

---

## 🔍 Type Guards

### Product Checks

```typescript
import {
  hasTieredPricing,
  hasDiscount,
  isValidTier,
  isValidBadge,
  isValidSeason,
} from '@/types/catalog'

// Check if product has tiered pricing
if (hasTieredPricing(product)) {
  // Show tier selector
}

// Check if product has discount
if (hasDiscount(product)) {
  // Show discount badge
}

// Validate tier
if (isValidTier(unknownTier)) {
  // unknownTier is now type ProductTier ('A' | 'B' | 'C')
  const config = getTierConfig(unknownTier)
}

// Validate badge
if (isValidBadge(unknownBadge)) {
  // unknownBadge is now type ProductBadge
}

// Validate season
if (isValidSeason(unknownSeason)) {
  // unknownSeason is now type SeasonalTheme
}
```

---

## 💡 Usage Examples

### Example 1: Product Grid with Filtering

```typescript
'use client'

import { useState } from 'react'
import type {
  CatalogProduct,
  CatalogFilters,
  CatalogSortOption,
  ProductTier,
} from '@/types/catalog'
import { filterProducts, sortProducts } from '@/types/catalog'
import GlossyProductCard from '@/components/catalog/GlossyProductCard'
import PriceTierBar from '@/components/catalog/PriceTierBar'

export default function ProductGrid({ initialProducts }: { initialProducts: CatalogProduct[] }) {
  const [activeTier, setActiveTier] = useState<ProductTier | null>(null)
  const [sortBy, setSortBy] = useState<CatalogSortOption>('popular')

  const filters: CatalogFilters = {
    tiers: activeTier ? [activeTier] : undefined,
    inStock: true,
  }

  const filtered = filterProducts(initialProducts, filters)
  const sorted = sortProducts(filtered, sortBy)

  return (
    <>
      <PriceTierBar
        activeTier={activeTier}
        onTierSelect={setActiveTier}
        showCounts={true}
        tierCounts={{
          A: initialProducts.filter(p => p.tier === 'A').length,
          B: initialProducts.filter(p => p.tier === 'B').length,
          C: initialProducts.filter(p => p.tier === 'C').length,
        }}
      />

      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {sorted.map((product, index) => (
          <GlossyProductCard
            key={product.id}
            product={product}
            index={index}
            onClick={() => router.push(`/products/${product.id}`)}
            onAddToCart={() => addToCart(product.id)}
          />
        ))}
      </div>
    </>
  )
}
```

### Example 2: Complete Catalog Page

```typescript
'use client'

import type {
  CatalogProduct,
  Brand,
  Bundle,
  HeroBanner,
  Billboard,
  MarqueeItem,
} from '@/types/catalog'
import { SEASONAL_CONFIGS } from '@/types/catalog'
import HeroBanner from '@/components/catalog/HeroBanner'
import MarqueeScroll from '@/components/catalog/MarqueeScroll'
import BrandSection from '@/components/catalog/BrandSection'
import SeasonalSection from '@/components/catalog/SeasonalSection'
import Billboard from '@/components/catalog/Billboard'

interface CatalogPageProps {
  hero: HeroBanner
  trending: MarqueeItem[]
  brands: Brand[]
  christmasProducts: CatalogProduct[]
  billboard: Billboard
}

export default function CatalogPage({
  hero,
  trending,
  brands,
  christmasProducts,
  billboard,
}: CatalogPageProps) {
  return (
    <div className="space-y-12">
      {/* Hero */}
      <HeroBanner {...hero} />

      {/* Trending Marquee */}
      <MarqueeScroll
        items={trending}
        title="🔥 Trending Now"
        speed={30}
        direction="left"
      />

      {/* Brands */}
      <BrandSection brands={brands} />

      {/* Seasonal */}
      <SeasonalSection
        season="christmas"
        products={christmasProducts}
      />

      {/* Billboard */}
      <Billboard {...billboard} />
    </div>
  )
}
```

### Example 3: Type-Safe API Response Mapping

```typescript
import type { CatalogProduct } from '@/types/catalog'
import type { ProductApiResponse } from '@/types/catalog'

function mapApiProductToCatalogProduct(
  apiProduct: ProductApiResponse,
  userTier?: 'A' | 'B' | 'C'
): CatalogProduct {
  return {
    id: apiProduct.id,
    name: apiProduct.name,
    description: apiProduct.description,
    imageUrl: apiProduct.imageUrl || '/placeholder.jpg',
    price: apiProduct.price,
    sku: apiProduct.sku,

    // Tiered pricing
    priceTierA: apiProduct.priceTierA,
    priceTierB: apiProduct.priceTierB,
    priceTierC: apiProduct.priceTierC,
    activeTier: userTier,

    // Visuals
    tier: apiProduct.tier,
    badge: apiProduct.badge,
    seasonal: apiProduct.seasonal,
    glossLevel: 'premium',
    sparkle: apiProduct.featured,

    // Metadata
    brand: apiProduct.brand?.name,
    brandId: apiProduct.brand?.id,
    category: apiProduct.category?.name,
    categoryId: apiProduct.category?.id,
    rating: apiProduct.avgRating,
    reviewCount: apiProduct.reviewCount,
    inStock: apiProduct.stockCount > 0,
    stockCount: apiProduct.stockCount,
  }
}
```

### Example 4: Custom Hook with Types

```typescript
import { useState, useMemo } from 'react'
import type {
  CatalogProduct,
  CatalogFilters,
  CatalogSortOption,
  ProductTier,
} from '@/types/catalog'
import { filterProducts, sortProducts, getDisplayPrice } from '@/types/catalog'

export function useCatalogProducts(initialProducts: CatalogProduct[]) {
  const [filters, setFilters] = useState<CatalogFilters>({})
  const [sortBy, setSortBy] = useState<CatalogSortOption>('popular')
  const [userTier, setUserTier] = useState<ProductTier | null>(null)

  // Add user tier to products
  const productsWithTier = useMemo(() => {
    return initialProducts.map(p => ({
      ...p,
      activeTier: userTier,
      displayPrice: getDisplayPrice({ ...p, activeTier: userTier }),
    }))
  }, [initialProducts, userTier])

  // Filter and sort
  const processedProducts = useMemo(() => {
    const filtered = filterProducts(productsWithTier, filters)
    return sortProducts(filtered, sortBy)
  }, [productsWithTier, filters, sortBy])

  return {
    products: processedProducts,
    filters,
    setFilters,
    sortBy,
    setSortBy,
    userTier,
    setUserTier,
  }
}
```

---

## 📊 Complete Type Reference

### All Exported Types

```typescript
// Enums
ProductTier, ProductBadge, SeasonalTheme, VisualTheme, ColorTheme,
GlossLevel, ImagePosition, OverlayStyle, MarqueeDirection, BundleBadge

// Configs
TierConfig, BadgeConfig, SeasonalConfig
TIER_CONFIGS, BADGE_CONFIGS, SEASONAL_CONFIGS

// Products
BaseProduct, TieredPricing, ProductVisuals, ProductMetadata,
ProductPricing, CatalogProduct, DisplayProduct

// Brands & Bundles
Brand, BrandMap, BundleProduct, Bundle, BundleMap, DisplayBundle

// Components
MarqueeItem, HeroBanner, Billboard
GlossyProductCardProps, BrandSectionProps, SeasonalSectionProps,
BundleCardProps, BillboardProps, TierCounts, PriceTierBarProps,
HeroBannerProps, MarqueeScrollProps, CatalogShowcaseProps

// Utilities
CatalogFilters, CatalogSortOption, Pagination, CatalogState

// Functions
hasTieredPricing, hasDiscount, isValidTier, isValidBadge, isValidSeason,
getDisplayPrice, calculateDiscount, calculateBundleSavings,
getTierConfig, getBadgeConfig, getSeasonalConfig,
createBrandMap, createBundleMap, filterProducts, sortProducts
```

---

## ✅ Best Practices

1. **Always import types with `type` keyword:**
```typescript
import type { CatalogProduct } from '@/types/catalog'
import { getDisplayPrice } from '@/types/catalog' // Function import without 'type'
```

2. **Use type guards before accessing tier-specific data:**
```typescript
if (hasTieredPricing(product)) {
  const displayPrice = getDisplayPrice(product)
}
```

3. **Leverage utility functions for calculations:**
```typescript
// ❌ Don't
const discount = Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)

// ✅ Do
const discount = calculateDiscount(product)
```

4. **Use configuration objects for consistency:**
```typescript
// ❌ Don't hardcode
<div className="bg-gradient-to-r from-amber-400 to-amber-600">

// ✅ Do
const config = getTierConfig('A')
<div className={`bg-gradient-to-r ${config.gradient}`}>
```

5. **Compose interfaces for flexibility:**
```typescript
// Build exactly what you need
type MinimalProduct = BaseProduct & ProductVisuals
type FullProduct = CatalogProduct
```

---

**All types are fully documented, production-ready, and integrated with the existing Azteka DSD schema.**

🎉 **Ready to use!** 🚀
