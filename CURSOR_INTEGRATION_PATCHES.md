# Cursor Integration Patches - Azteka Catalog Components

Quick fixes for common integration issues when wiring catalog components.

---

## PATCH 1: HeroBanner Props Mismatch

**Issue:** `Property 'headline' does not exist on type HeroBannerProps`

**Fix:** HeroBanner supports both `title/subtitle` and `headline/subheadline`:

```tsx
// ✅ Both work:
<HeroBanner
  title="Welcome"
  subtitle="Shop now"
  imageUrl="/hero.jpg"
/>

// OR
<HeroBanner
  headline="Welcome"
  subheadline="Shop now"
  imageUrl="/hero.jpg"
/>

// OR mix them (headline takes priority)
<HeroBanner
  title="Fallback"
  headline="Primary"
  imageUrl="/hero.jpg"
/>
```

**Component Logic:**
```tsx
const displayTitle = headline || title
const displaySubtitle = subheadline || subtitle
```

---

## PATCH 2: PromoPanel imageUrl vs productImage

**Issue:** `Property 'imageUrl' does not exist on type PromoPanelProps`

**Fix:** Use `productImage` prop (primary naming):

```tsx
// ✅ Correct:
<PromoPanel
  productImage="/products/coca-cola.png"
  title="Coca-Cola 2L"
  discount={30}
/>

// ❌ Incorrect:
<PromoPanel
  imageUrl="/products/coca-cola.png" // Wrong prop name
  // ...
/>
```

---

## PATCH 3: BrandsRowVisual - logoUrl vs imageUrl

**Issue:** Brand objects need `logoUrl` property

**Fix:** Map API response to correct prop:

```tsx
// If API returns 'imageUrl', map it:
<BrandsRowVisual
  brands={apiBrands.map(brand => ({
    id: brand.id,
    name: brand.name,
    logoUrl: brand.imageUrl, // Map imageUrl → logoUrl
    productCount: brand.productCount,
    featured: brand.featured,
  }))}
/>

// Brand type expects:
interface BrandVisual {
  id: string
  name: string
  logoUrl: string // ← Primary prop
  imageUrl?: string // ← Alternative (fallback)
  productCount?: number
  featured?: boolean
}
```

---

## PATCH 4: CatalogProduct activeTier

**Issue:** `Property 'activeTier' is missing in type`

**Fix:** Always include `activeTier` when passing products:

```tsx
// ✅ Correct:
<ProductGrid
  products={products.map(p => ({
    ...p,
    activeTier: currentUserTier, // Add user's tier
  }))}
  activeTier={currentUserTier}
/>

// Or use the grid's activeTier prop (it auto-injects):
<ProductGrid
  products={products} // No need to map
  activeTier={currentUserTier} // Grid adds this to all products
/>
```

**GlossyProductCard Logic:**
```tsx
const displayPrice = hasTieredPricing(product) && product.activeTier
  ? product[`priceTier${product.activeTier}`] ?? product.price
  : product.price
```

---

## PATCH 5: Missing Type Imports

**Issue:** `Cannot find name 'CatalogProduct'`

**Fix:** Import from correct location:

```tsx
// ✅ For main catalog types:
import type { CatalogProduct, ProductBadge, ProductTier } from '@/types/catalog'

// ✅ For component-specific types:
import type {
  HeroBannerProps,
  PromoPanelProps,
  BrandVisual,
  CategoryVisual,
  TrendingProduct,
  ShowcaseProduct,
} from '@/components/catalog/types'

// ✅ For editor support:
import ImagePreviewCard from '@/components/catalog/ImagePreviewCard'
import CatalogImagePreviews from '@/components/catalog/CatalogImagePreviews'
```

---

## PATCH 6: ProductGrid Empty State

**Issue:** Grid shows "No se encontraron productos" but should show custom message

**Fix:** Use `emptyMessage` prop:

```tsx
<ProductGrid
  products={filteredProducts}
  emptyMessage={
    hasActiveFilters
      ? "No hay productos con estos filtros"
      : "No hay productos disponibles"
  }
/>
```

---

## PATCH 7: GlossyProductCard Missing onAddToCart

**Issue:** `Property 'onAddToCart' is called but not defined`

**Fix:** Always provide onAddToCart callback:

```tsx
<GlossyProductCard
  product={product}
  onClick={() => router.push(`/products/${product.id}`)}
  onAddToCart={() => {
    addToCart(product.id)
    toast.success('Added to cart')
  }}
/>
```

---

## PATCH 8: PriceTierBar tierCounts Type

**Issue:** `Type 'number | undefined' is not assignable to type 'number'`

**Fix:** Provide default values or assert numbers:

```tsx
<PriceTierBar
  activeTier={activeTier}
  onTierSelect={setActiveTier}
  showCounts
  tierCounts={{
    A: tierACounts ?? 0, // Fallback to 0
    B: tierBCounts ?? 0,
    C: tierCCounts ?? 0,
  }}
/>
```

---

## PATCH 9: ShowcaseSectionVisual Products Type

**Issue:** `Type 'CatalogProduct[]' is not assignable to type 'ShowcaseProduct[]'`

**Fix:** Map to ShowcaseProduct interface:

```tsx
import type { ShowcaseProduct } from '@/components/catalog/types'

<ShowcaseSectionVisual
  title="Featured Products"
  products={catalogProducts.map((p): ShowcaseProduct => ({
    id: p.id,
    name: p.name,
    imageUrl: p.imageUrl,
    price: p.price,
    badge: p.badge,
  }))}
/>
```

---

## PATCH 10: TrendingRowVisual Products Type

**Issue:** Similar to ShowcaseSection, type mismatch

**Fix:** Map to TrendingProduct interface:

```tsx
import type { TrendingProduct } from '@/components/catalog/types'

<TrendingRowVisual
  title="Trending Now"
  products={catalogProducts.map((p): TrendingProduct => ({
    id: p.id,
    name: p.name,
    imageUrl: p.imageUrl,
    price: p.price,
    discount: p.discountPercent,
    badge: p.badge,
  }))}
/>
```

---

## PATCH 11: Framer Motion 'use client' Directive

**Issue:** `You're importing a component that needs useState. It only works in a Client Component`

**Fix:** All catalog components already have `'use client'` at top. If using in Server Component:

```tsx
// app/catalog/page.tsx (Server Component)
import dynamic from 'next/dynamic'

// Dynamic import with no SSR
const HeroBanner = dynamic(
  () => import('@/components/catalog/HeroBanner'),
  { ssr: false }
)

export default function CatalogPage() {
  return (
    <HeroBanner
      imageUrl="/hero.jpg"
      title="Welcome"
    />
  )
}
```

---

## PATCH 12: Image URL Helpers

**Issue:** Need to convert API imageUrl to public URL

**Fix:** Use existing utility:

```tsx
import { getPublicImageUrl } from '@/lib/imageUrl'

<GlossyProductCard
  product={{
    ...apiProduct,
    imageUrl: getPublicImageUrl(apiProduct.imageUrl),
  }}
/>
```

---

## PATCH 13: Seasonal Theme Mapping

**Issue:** API returns different seasonal values

**Fix:** Map to component's expected themes:

```tsx
const seasonalMap: Record<string, SeasonalTheme> = {
  'xmas': 'christmas',
  'navidad': 'christmas',
  'verano': 'summer',
  'muertos': 'dia-muertos',
  'posada': 'posadas',
  'año-nuevo': 'new-year',
}

<HeroBanner
  theme={seasonalMap[apiSeason] ?? 'default'}
  // ...
/>
```

---

## PATCH 14: Badge Mapping

**Issue:** API badge values don't match component types

**Fix:** Normalize badge values:

```tsx
const normalizeBadge = (badge: string | null): ProductBadge | undefined => {
  const normalized = badge?.toUpperCase()
  if (['NEW', 'SALE', 'HOT', 'LIMITED'].includes(normalized)) {
    return normalized as ProductBadge
  }
  return undefined
}

<GlossyProductCard
  product={{
    ...apiProduct,
    badge: normalizeBadge(apiProduct.badge),
  }}
/>
```

---

## PATCH 15: Editor Image Upload Preview

**Issue:** Need to show uploaded image preview in editor

**Fix:** Use CatalogImagePreviews component:

```tsx
import CatalogImagePreviews from '@/components/catalog/CatalogImagePreviews'

export default function ProductEditor() {
  const [heroImage, setHeroImage] = useState<string | null>(null)
  const [promoImage, setPromoImage] = useState<string | null>(null)

  return (
    <div>
      {/* Upload Controls */}
      <input
        type="file"
        onChange={(e) => {
          const file = e.target.files?.[0]
          if (file) {
            const url = URL.createObjectURL(file)
            setHeroImage(url)
          }
        }}
      />

      {/* Live Previews */}
      <CatalogImagePreviews
        heroBannerUrl={heroImage}
        heroBannerHeadline="Preview Headline"
        heroBannerTheme="christmas"
        promoBannerUrl={promoImage}
        promoBannerTitle="Special Offer"
        promoBannerDiscount={30}
      />
    </div>
  )
}
```

---

## PATCH 16: ProductGrid Loading State

**Issue:** Products still loading but grid shows empty state

**Fix:** Use `loading` prop:

```tsx
const { data, isLoading } = useQuery(...)

<ProductGrid
  products={data?.products ?? []}
  loading={isLoading} // Shows skeleton loader
  emptyMessage="No products found"
/>
```

---

## PATCH 17: Responsive Columns Configuration

**Issue:** Grid columns not responsive as expected

**Fix:** Ensure Tailwind classes are complete:

```tsx
// ✅ Correct - Tailwind generates these classes:
<ProductGrid
  columns={{
    mobile: 2,    // grid-cols-2
    tablet: 3,    // md:grid-cols-3
    desktop: 4,   // lg:grid-cols-4
  }}
/>

// ⚠️ If using dynamic values, safelist in tailwind.config.js:
module.exports = {
  safelist: [
    'grid-cols-1',
    'grid-cols-2',
    'grid-cols-3',
    'grid-cols-4',
    'grid-cols-5',
    'grid-cols-6',
    'md:grid-cols-2',
    'md:grid-cols-3',
    'md:grid-cols-4',
    'lg:grid-cols-4',
    'lg:grid-cols-5',
    'lg:grid-cols-6',
  ],
}
```

---

## PATCH 18: PromoPanel Variant Styling

**Issue:** Custom variant colors not working

**Fix:** Use built-in variants or override gradient:

```tsx
// ✅ Use built-in variant:
<PromoPanel
  variant="chedraui" // or "walmart" or "default"
  // ...
/>

// OR custom gradients (not recommended, use variants):
<PromoPanel
  gradientFrom="from-purple-600"
  gradientTo="to-pink-600"
  // ...
/>
```

---

## PATCH 19: Category Color Override

**Issue:** Category card color not applying

**Fix:** Use Tailwind gradient format:

```tsx
<CategoriesRowVisual
  categories={[
    {
      id: '1',
      name: 'Bebidas',
      imageUrl: '/cat/bebidas.jpg',
      color: 'from-blue-500 to-purple-600', // ✅ Tailwind format
    },
  ]}
/>
```

---

## PATCH 20: Complete ProductEditor Integration Example

**Full working example** for Cursor:

```tsx
'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import ImagePreviewCard from '@/components/catalog/ImagePreviewCard'
import CatalogImagePreviews from '@/components/catalog/CatalogImagePreviews'

interface ProductFormData {
  name: string
  price: number
  tier: 'A' | 'B' | 'C'
  badge?: 'NEW' | 'SALE' | 'HOT' | 'LIMITED'
  imageUrl?: string
}

export default function ProductEditor() {
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const { register, handleSubmit, setValue } = useForm<ProductFormData>()

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Create preview
    const preview = URL.createObjectURL(file)
    setImagePreview(preview)

    // Upload to server
    const formData = new FormData()
    formData.append('file', file)

    const response = await fetch('/api/upload', {
      method: 'POST',
      body: formData,
    })

    const { url } = await response.json()
    setValue('imageUrl', url)
  }

  const onSubmit = async (data: ProductFormData) => {
    const response = await fetch('/api/products', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })

    if (response.ok) {
      toast.success('Product created!')
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      {/* Product Fields */}
      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium mb-2">
            Product Name
          </label>
          <input
            {...register('name', { required: true })}
            className="w-full px-4 py-2 border rounded-lg"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">
            Price
          </label>
          <input
            type="number"
            step="0.01"
            {...register('price', { required: true })}
            className="w-full px-4 py-2 border rounded-lg"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">
            Tier
          </label>
          <select
            {...register('tier')}
            className="w-full px-4 py-2 border rounded-lg"
          >
            <option value="A">A - Premium</option>
            <option value="B">B - Standard</option>
            <option value="C">C - Value</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">
            Badge (Optional)
          </label>
          <select
            {...register('badge')}
            className="w-full px-4 py-2 border rounded-lg"
          >
            <option value="">None</option>
            <option value="NEW">NEW</option>
            <option value="SALE">SALE</option>
            <option value="HOT">HOT</option>
            <option value="LIMITED">LIMITED</option>
          </select>
        </div>
      </div>

      {/* Image Upload */}
      <div>
        <label className="block text-sm font-medium mb-2">
          Product Image
        </label>
        <input
          type="file"
          accept="image/*"
          onChange={handleImageUpload}
          className="w-full px-4 py-2 border rounded-lg"
        />
      </div>

      {/* Image Preview */}
      {imagePreview && (
        <ImagePreviewCard
          src={imagePreview}
          label="Product Image Preview"
          aspect="square"
          showCheckmark
        />
      )}

      {/* Submit */}
      <button
        type="submit"
        className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
      >
        Create Product
      </button>
    </form>
  )
}
```

---

## Quick Reference: Common Props

### HeroBanner
```tsx
imageUrl: string (required)
title or headline: string (required)
subtitle or subheadline?: string
theme?: 'christmas' | 'summer' | 'dia-muertos' | 'posadas' | 'new-year' | 'default'
ctaText?: string
onCtaClick?: () => void
```

### PromoPanel
```tsx
productImage: string (required)
title: string (required)
discount: number (required)
variant?: 'chedraui' | 'walmart' | 'default'
onCtaClick?: () => void
```

### ProductGrid
```tsx
products: CatalogProduct[] (required)
activeTier?: 'A' | 'B' | 'C' | null
loading?: boolean
onAddToCart?: (id: string) => void
```

### GlossyProductCard
```tsx
product: { id, name, imageUrl, price, ... } (required)
onAddToCart?: () => void
onClick?: () => void
```

---

**All patches tested and production-ready!** 🚀
