# Azteka DSD Catalog MVP - Premium Visual Components

**Created:** 2025-11-19
**Engineer:** UI Component Engineer for Azteka DSD
**Framework:** Next.js 14 + Framer Motion + Tailwind CSS
**Design Inspiration:** Chedraui, WalmartMX, Macy's, Arcor

---

## 🎨 Design Philosophy

**NORTH STAR CONTRACT:**
- Premium glossy Latino catalog visuals
- Vibrant gradients, gold brand cards, glowing promo cards, festive icons
- Editor uploads PNGs → instant UI update
- Sales flow untouched; only polish UI
- Zero placeholders, zero mock data - production ready

---

## 📦 Component Inventory

### Core Components (9 Total)

1. **HeroBanner.tsx** - Macy's-style hero sections with seasonal variants
2. **PromoPanel.tsx** - Retail-style discount promos (Chedraui/Walmart)
3. **ShowcaseSectionVisual.tsx** - Pepito USA style product showcase
4. **TrendingRowVisual.tsx** - Macy's "What's Trending" with flowing gradients
5. **BrandsRowVisual.tsx** - Gold textured brand cards (LEGO/Barbie style)
6. **CategoriesRowVisual.tsx** - Large category cards with festive edges
7. **GlossyProductCard.tsx** - Premium product cards with shine/reflect
8. **ProductGrid.tsx** - Responsive grid layout for products
9. **PriceTierBar.tsx** - Sticky tier filter (A/B/C tiers)

---

## 📖 Component Documentation

### 1. HeroBanner.tsx

**Purpose:** Full-width hero banner with seasonal themes and gradient overlays

**Features:**
- ✨ Seasonal variants: Christmas, Posadas, New Year, Default
- 🎨 Gradient overlay options: dark, light, festive, none
- 🌟 Animated festive icons (sparkles, stars, party poppers)
- 📱 Fully responsive (h-500 to h-700)
- 🎯 CTA button with glossy effects
- 🔄 Ken Burns animation on background image

**Usage:**
```tsx
import HeroBanner from '@/components/catalog/HeroBanner'

<HeroBanner
  title="¡Ofertas de Navidad!"
  subtitle="Hasta 50% de Descuento"
  imageUrl="/hero/christmas-sale.jpg"
  theme="christmas"
  overlay="festive"
  ctaText="Ver Ofertas"
  onCtaClick={() => router.push('/ofertas')}
/>
```

**Props:**
```typescript
interface HeroBannerProps {
  title: string
  subtitle?: string
  imageUrl: string
  ctaText?: string
  ctaLink?: string
  theme?: 'christmas' | 'summer' | 'dia-muertos' | 'posadas' | 'new-year' | 'default'
  overlay?: 'dark' | 'light' | 'gradient' | 'festive'
  onCtaClick?: () => void
  // Alternative naming
  headline?: string
  subheadline?: string
}
```

---

### 2. PromoPanel.tsx

**Purpose:** Retail-style rectangular promo cards with bold % discount

**Features:**
- 💰 Large circular discount badge with pulsing glow
- 🏷️ Product image with drop shadow
- 🔥 Floating festive shapes (stars, flames, %)
- 🎨 Variant styles: Chedraui, Walmart, Default
- ✨ Glossy overlay + shine sweep on hover
- 📊 Responsive 2-3 column grid

**Usage:**
```tsx
import PromoPanel from '@/components/catalog/PromoPanel'

<PromoPanel
  title="Coca-Cola 2L"
  discount={30}
  productImage="/products/coca-cola-2l.png"
  description="Lleva 2 por el precio de 1"
  badge="NUEVO"
  variant="chedraui"
  ctaText="Agregar al Carrito"
  onCtaClick={() => addToCart('coca-cola-2l')}
/>
```

**Props:**
```typescript
interface PromoPanelProps {
  title: string
  discount: number // Percentage (e.g., 30 for 30%)
  productImage: string
  description?: string
  badge?: string
  backgroundColor?: string
  gradientFrom?: string
  gradientTo?: string
  onCtaClick?: () => void
  ctaText?: string
  variant?: 'chedraui' | 'walmart' | 'default'
  index?: number
}
```

**Variant Styles:**
- **Chedraui**: Red-orange gradient, yellow accents
- **Walmart**: Blue-cyan gradient, yellow accents
- **Default**: Purple-pink-red gradient

---

### 3. ShowcaseSectionVisual.tsx

**Purpose:** Pepito USA style product showcase with ribbon title

**Features:**
- 🎀 Angled ribbon title with glossy effects
- 🎨 Background patterns: festive, geometric, gradient
- 🌟 Floating sparkle decorations
- 📐 Layout options: horizontal scroll or grid
- 🛍️ Product cards with badges and prices
- 🔘 "Ver Todos" CTA button

**Usage:**
```tsx
import ShowcaseSectionVisual from '@/components/catalog/ShowcaseSectionVisual'

<ShowcaseSectionVisual
  title="Productos Destacados"
  subtitle="Lo mejor de la semana"
  products={featuredProducts}
  backgroundPattern="festive"
  layout="horizontal"
  ribbonColor="from-red-600 via-pink-600 to-purple-600"
  onProductClick={(id) => router.push(`/products/${id}`)}
  onViewAll={() => router.push('/productos')}
/>
```

**Props:**
```typescript
interface ShowcaseSectionVisualProps {
  title: string
  subtitle?: string
  products: ShowcaseProduct[]
  backgroundPattern?: 'festive' | 'geometric' | 'gradient'
  layout?: 'horizontal' | 'grid'
  onProductClick?: (productId: string) => void
  onViewAll?: () => void
  ribbonColor?: string
}

interface ShowcaseProduct {
  id: string
  name: string
  imageUrl: string
  price?: number
  badge?: string
}
```

---

### 4. TrendingRowVisual.tsx

**Purpose:** Macy's "What's Trending Now" with large square cards

**Features:**
- 🔥 Flowing gradient background animation
- 🌟 Animated flame icons
- 🏷️ Trending badge at top
- 💳 Large square cards (w-80)
- ⚡ Floating Zap icon decoration
- 🎨 Theme variants: red, blue, purple, gold
- 📱 Horizontal scroll with scroll hint

**Usage:**
```tsx
import TrendingRowVisual from '@/components/catalog/TrendingRowVisual'

<TrendingRowVisual
  title="¡Tendencias Ahora!"
  subtitle="Los más vendidos"
  products={trendingProducts}
  gradientTheme="red"
  onProductClick={(id) => router.push(`/products/${id}`)}
/>
```

**Props:**
```typescript
interface TrendingRowVisualProps {
  title?: string
  subtitle?: string
  products: TrendingProduct[]
  gradientTheme?: 'red' | 'blue' | 'purple' | 'gold'
  onProductClick?: (productId: string) => void
}

interface TrendingProduct {
  id: string
  name: string
  imageUrl: string
  price?: number
  discount?: number
  badge?: string
}
```

---

### 5. BrandsRowVisual.tsx

**Purpose:** Gold textured brand cards like Macy's LEGO/Barbie sections

**Features:**
- 🏆 Gold gradient backgrounds with texture overlays
- ✨ Emboss effect on hover
- 🌟 Shine sweep animation
- ⭐ Featured star badges
- 📊 Product count badges
- 💛 Premium gold aesthetic
- 📱 Responsive 2-6 column grid

**Usage:**
```tsx
import BrandsRowVisual from '@/components/catalog/BrandsRowVisual'

<BrandsRowVisual
  title="Marcas Premium"
  subtitle="Calidad garantizada"
  brands={brandsList}
  onBrandClick={(id) => router.push(`/brands/${id}`)}
  onViewAll={() => router.push('/marcas')}
  columns={{ mobile: 2, tablet: 3, desktop: 6 }}
/>
```

**Props:**
```typescript
interface BrandsRowVisualProps {
  title?: string
  subtitle?: string
  brands: Brand[]
  onBrandClick?: (brandId: string) => void
  onViewAll?: () => void
  columns?: {
    mobile?: number
    tablet?: number
    desktop?: number
  }
}

interface Brand {
  id: string
  name: string
  logoUrl: string
  productCount?: number
  featured?: boolean
}
```

---

### 6. CategoriesRowVisual.tsx

**Purpose:** Large category cards with festive edge patterns

**Features:**
- 🎨 Custom gradient overlays per category
- 🎀 Optional festive edge patterns
- 📐 Layout options: grid or horizontal
- 🏷️ Product count badges
- 📝 Category descriptions
- 🔘 "Explorar" CTA on each card
- 📱 Responsive card heights (h-64 to h-80)

**Usage:**
```tsx
import CategoriesRowVisual from '@/components/catalog/CategoriesRowVisual'

<CategoriesRowVisual
  title="Explora por Categoría"
  subtitle="Encuentra lo que necesitas"
  categories={categoriesList}
  layout="grid"
  festiveEdges={true}
  onCategoryClick={(id) => router.push(`/categories/${id}`)}
  onViewAll={() => router.push('/categorias')}
/>
```

**Props:**
```typescript
interface CategoriesRowVisualProps {
  title?: string
  subtitle?: string
  categories: Category[]
  layout?: 'grid' | 'horizontal'
  festiveEdges?: boolean
  onCategoryClick?: (categoryId: string) => void
  onViewAll?: () => void
}

interface Category {
  id: string
  name: string
  imageUrl: string
  productCount?: number
  color?: string // Gradient color override
  description?: string
}
```

---

### 7. GlossyProductCard.tsx

**Purpose:** Premium product card with glossy effects, tier badges, and tiered pricing

**Features:**
- ✨ Multi-layer glossy overlay (base + shine + reflection)
- 🏆 Tier badges (A/B/C) with gradient backgrounds
- 💰 Tiered pricing display (priceTierA/B/C)
- 🔥 Product badges (NEW, SALE, HOT, LIMITED)
- ⭐ Star ratings
- 🎁 Rewards points overlay
- 🎄 Seasonal themes
- 💫 Sparkle effects (optional)
- 🛒 Add-to-cart button with hover animations

**Usage:**
```tsx
import GlossyProductCard from '@/components/catalog/GlossyProductCard'

<GlossyProductCard
  product={{
    id: 'prod-1',
    name: 'Sabritas Clásicas Sal 62g',
    brand: 'Sabritas',
    price: 18.50,
    originalPrice: 22.00,
    imageUrl: '/products/sabritas-sal.png',
    badge: 'HOT',
    tier: 'A',
    priceTierA: 16.50,
    priceTierB: 18.50,
    priceTierC: 20.00,
    activeTier: userTier, // Current user's tier
    rewardsPoints: 50,
    rating: 5,
    seasonal: 'christmas',
    glossLevel: 'premium',
    sparkle: true,
  }}
  index={0}
  onClick={() => router.push('/products/prod-1')}
  onAddToCart={() => addToCart('prod-1')}
/>
```

**Tiered Pricing Logic:**
The card automatically displays the correct price based on `activeTier`:
- If `activeTier='A'` and `priceTierA=16.50`, shows $16.50
- If no tier price exists, falls back to `price`
- Shows tier pricing table when tiered pricing exists

---

### 8. ProductGrid.tsx

**Purpose:** Responsive grid layout for product cards

**Features:**
- 📐 Customizable columns (mobile/tablet/desktop)
- 📊 Gap options: sm, md, lg
- ⏳ Loading skeleton states
- 🚫 Empty state with icon and message
- 🎯 Passes activeTier to all product cards
- 🎨 Stagger animation entrance

**Usage:**
```tsx
import ProductGrid from '@/components/catalog/ProductGrid'

<ProductGrid
  products={catalogProducts}
  columns={{ mobile: 2, tablet: 3, desktop: 4 }}
  gap="md"
  activeTier={currentUserTier}
  onProductClick={(id) => router.push(`/products/${id}`)}
  onAddToCart={(id) => addToCart(id)}
  loading={isLoading}
  emptyMessage="No se encontraron productos"
/>
```

**Props:**
```typescript
interface ProductGridProps {
  products: CatalogProduct[]
  columns?: {
    mobile?: number
    tablet?: number
    desktop?: number
  }
  gap?: 'sm' | 'md' | 'lg'
  onProductClick?: (productId: string) => void
  onAddToCart?: (productId: string) => void
  loading?: boolean
  emptyMessage?: string
  activeTier?: 'A' | 'B' | 'C' | null
}
```

---

### 9. PriceTierBar.tsx

**Purpose:** Sticky top bar for filtering products by price tier

**Features:**
- 📌 Sticky positioning at top
- 🏆 Tier badges with gradients (A=Gold, B=Silver, C=Bronze)
- 📊 Product count badges per tier
- ✨ Active state with layout animation
- 🎨 highlightActive prop for visual feedback
- 📱 Horizontal scroll on mobile

**Usage:**
```tsx
import PriceTierBar from '@/components/catalog/PriceTierBar'

const [activeTier, setActiveTier] = useState<'A' | 'B' | 'C' | null>(null)

<PriceTierBar
  activeTier={activeTier}
  onTierSelect={setActiveTier}
  showCounts={true}
  tierCounts={{
    A: 125,
    B: 340,
    C: 210,
  }}
  highlightActive={true}
/>
```

---

## 🎨 Visual Effects Library

### Glossy Overlay Pattern

```tsx
{/* Base Glossy Overlay */}
<div className="absolute inset-0 bg-gradient-to-br from-white/40 via-white/10 to-transparent opacity-70" />

{/* Shine Sweep on Hover */}
<div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700">
  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
</div>

{/* Bottom Reflection */}
<div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-black/30 to-transparent" />
```

### Gold Texture Pattern

```tsx
{/* Gold Gradient Background */}
<div className="absolute inset-0 bg-gradient-to-br from-yellow-400 via-amber-500 to-yellow-600" />

{/* Gold Texture Overlay */}
<div
  className="absolute inset-0 opacity-30"
  style={{
    backgroundImage: `
      radial-gradient(circle at 30% 30%, rgba(255,255,255,0.4) 0%, transparent 50%),
      radial-gradient(circle at 70% 70%, rgba(0,0,0,0.2) 0%, transparent 50%)
    `,
  }}
/>

{/* Emboss Effect on Hover */}
<div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
  <div className="absolute inset-0 bg-gradient-to-br from-white/30 via-transparent to-black/20" />
  <div className="absolute inset-x-0 top-0 h-1/3 bg-gradient-to-b from-white/40 to-transparent" />
  <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/30 to-transparent" />
</div>
```

### Festive Edge Pattern

```tsx
<div
  className="absolute top-0 left-0 right-0 h-3 opacity-30"
  style={{
    backgroundImage: `repeating-linear-gradient(
      90deg,
      transparent,
      transparent 10px,
      rgba(255,255,255,0.5) 10px,
      rgba(255,255,255,0.5) 20px
    )`,
  }}
/>
```

---

## 🎨 Color Gradients Reference

### Tier Colors
- **Tier A (Premium)**: `from-amber-400 via-yellow-500 to-amber-600`
- **Tier B (Standard)**: `from-slate-400 via-gray-500 to-slate-600`
- **Tier C (Value)**: `from-orange-500 via-amber-600 to-orange-700`

### Badge Colors
- **NEW**: `from-blue-500 to-cyan-500`
- **SALE**: `from-red-500 to-pink-500`
- **HOT**: `from-orange-500 to-red-600`
- **LIMITED**: `from-purple-500 to-indigo-600`

### Seasonal Gradients
- **Christmas**: `from-red-600 via-green-600 to-red-700`
- **Summer**: `from-cyan-500 via-blue-500 to-purple-600`
- **Día de Muertos**: `from-orange-600 via-pink-600 to-purple-700`
- **Posadas**: `from-purple-600 via-pink-700 to-purple-800`
- **New Year**: `from-yellow-600 via-amber-700 to-yellow-800`

### Promo Panel Variants
- **Chedraui**: `from-red-600 via-red-500 to-orange-500`
- **Walmart**: `from-blue-600 via-blue-500 to-cyan-500`
- **Default**: `from-purple-600 via-pink-500 to-red-500`

---

## 📐 Responsive Breakpoints

```css
Mobile (base): 1-2 columns
Tablet (md: 768px): 2-3 columns
Desktop (lg: 1024px): 4-6 columns
```

**Grid Classes Pattern:**
```tsx
grid-cols-2 md:grid-cols-3 lg:grid-cols-4
```

---

## ⚡ Animation Timings

- **Stagger Delay**: 50-100ms per item
- **Hover Scale**: 1.03 - 1.1
- **Transition Duration**: 300ms - 700ms
- **Shine Sweep**: 1000ms
- **Flowing Gradient**: 15s infinite
- **Icon Float**: 2-6s infinite

---

## 🚀 Quick Integration Guide

### Step 1: Add Framer Motion (if not installed)

```bash
npm install framer-motion lucide-react
```

### Step 2: Import Components

```tsx
import HeroBanner from '@/components/catalog/HeroBanner'
import PromoPanel from '@/components/catalog/PromoPanel'
import ShowcaseSectionVisual from '@/components/catalog/ShowcaseSectionVisual'
import TrendingRowVisual from '@/components/catalog/TrendingRowVisual'
import BrandsRowVisual from '@/components/catalog/BrandsRowVisual'
import CategoriesRowVisual from '@/components/catalog/CategoriesRowVisual'
import ProductGrid from '@/components/catalog/ProductGrid'
import PriceTierBar from '@/components/catalog/PriceTierBar'
```

### Step 3: Build Catalog Page

```tsx
export default function CatalogPage() {
  const [activeTier, setActiveTier] = useState<'A' | 'B' | 'C' | null>(null)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <HeroBanner
        title="Ofertas de Temporada"
        subtitle="Hasta 50% de Descuento"
        imageUrl="/hero/season-sale.jpg"
        theme="christmas"
        ctaText="Ver Ofertas"
        onCtaClick={() => router.push('/ofertas')}
      />

      {/* Trending */}
      <TrendingRowVisual
        products={trendingProducts}
        gradientTheme="red"
      />

      {/* Tier Filter - Sticky */}
      <PriceTierBar
        activeTier={activeTier}
        onTierSelect={setActiveTier}
        showCounts
        tierCounts={{ A: 125, B: 340, C: 210 }}
      />

      {/* Product Grid */}
      <section className="container mx-auto px-6 py-12">
        <ProductGrid
          products={catalogProducts}
          activeTier={activeTier}
          onAddToCart={(id) => addToCart(id)}
        />
      </section>

      {/* Promos */}
      <section className="container mx-auto px-6 py-12 grid md:grid-cols-2 gap-6">
        <PromoPanel
          title="Coca-Cola 2L"
          discount={30}
          productImage="/products/coca-cola.png"
          variant="chedraui"
          onCtaClick={() => addToCart('coca-cola-2l')}
        />
        <PromoPanel
          title="Sabritas Variety Pack"
          discount={25}
          productImage="/products/sabritas.png"
          variant="walmart"
          onCtaClick={() => addToCart('sabritas-pack')}
        />
      </section>

      {/* Brands */}
      <BrandsRowVisual
        brands={brandsList}
        onBrandClick={(id) => router.push(`/brands/${id}`)}
      />

      {/* Categories */}
      <CategoriesRowVisual
        categories={categoriesList}
        layout="grid"
        onCategoryClick={(id) => router.push(`/categories/${id}`)}
      />
    </div>
  )
}
```

---

## 🎯 Editor Workflow

1. **Upload Product PNG** → Appears instantly in ProductGrid
2. **Upload Brand Logo PNG** → Appears in gold card in BrandsRow
3. **Upload Category Image PNG** → Appears in CategoriesRow card
4. **Upload Hero Image** → Updates HeroBanner background
5. **Upload Promo Image** → Updates PromoPanel product image

**Zero configuration needed** - Components auto-handle image URLs.

---

## ✅ Production Checklist

- [x] All components fully typed with TypeScript
- [x] Framer Motion animations optimized (viewport: once)
- [x] Responsive design (mobile → tablet → desktop)
- [x] Glossy effects on all premium cards
- [x] Seasonal theme support
- [x] Tiered pricing system integrated
- [x] Empty states and loading skeletons
- [x] Accessibility (ARIA labels, keyboard nav)
- [x] Zero placeholders or mock data dependencies

---

## 🎨 Visual Hierarchy Example

```
Hero Banner (full-width)
↓
Trending Row (horizontal scroll)
↓
Price Tier Bar (sticky)
↓
Product Grid (tiered)
↓
Promo Panels (2-3 column)
↓
Showcase Section (ribbon title)
↓
Brands Row (gold cards)
↓
Categories Row (large cards)
```

---

## 🔧 Customization Examples

### Change Hero Theme to Día de Muertos

```tsx
<HeroBanner
  theme="dia-muertos"
  overlay="festive"
  // ... other props
/>
```

### Change Trending Gradient to Gold

```tsx
<TrendingRowVisual
  gradientTheme="gold"
  // ... other props
/>
```

### Adjust Product Grid Columns

```tsx
<ProductGrid
  columns={{ mobile: 1, tablet: 2, desktop: 5 }}
  gap="lg"
  // ... other props
/>
```

---

## 📊 Performance Notes

- **Lazy Load Images**: All components use native `<img>` - upgrade to Next.js `<Image>` for optimization
- **Viewport Triggers**: Framer Motion animations use `viewport={{ once: true }}` to prevent re-animation
- **Stagger Limits**: Max 100ms delay recommended for large grids
- **Memoization**: Wrap expensive components in `React.memo()` if rendering 100+ items

---

## 🎉 Ready for Cursor Integration!

All components are:
- ✅ Production-ready
- ✅ Fully typed
- ✅ Zero placeholders
- ✅ Wiring-ready for backend

**Cursor engineer** can now:
1. Connect to API endpoints
2. Wire cart functionality
3. Add routing logic
4. Implement user tier detection
5. Connect filters/search

**Components are fully visual and stateless** - perfect for separation of concerns.

---

**🚀 Deploy with confidence!**
