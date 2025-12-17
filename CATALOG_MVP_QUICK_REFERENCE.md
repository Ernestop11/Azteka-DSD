# Azteka DSD Catalog MVP - Quick Reference

Complete quick reference for all catalog components, utilities, and features across LAPs #1, #2, and #3.

---

## 📦 Single Import Point

```tsx
import {
  // Core Components (LAP #1)
  HeroBanner,
  PromoPanel,
  ProductGrid,
  GlossyProductCard,
  PriceTierBar,
  BrandsRowVisual,
  CategoriesRowVisual,
  TrendingRowVisual,
  ShowcaseSectionVisual,

  // Layout Variants (LAP #3)
  MasonryGrid,
  WideSpotlight,
  MidPromoRow,
  DualHeroRow,
  ShoppableStory,

  // Editor Support (LAP #2)
  ImagePreviewCard,
  CatalogImagePreviews,

  // Animations (LAP #3)
  premiumProductCard,
  heroBannerEntrance,
  staggerContainer,
  staggerItem,
  shineSweep,
  promoBounce,
  glowPulse,
  snowfallParallax,

  // Tablet Utils (LAP #3)
  isTablet,
  getTabletGridClass,
  enableSmoothScroll,
  getHitTargetClass,

  // Accessibility (LAP #2)
  a11y,

  // Types
  type HeroBannerProps,
  type ProductGridProps,
  type CatalogProduct,
} from '@/components/catalog'
```

---

## 🎨 LAP #1: Core Components

### HeroBanner

```tsx
<HeroBanner
  imageUrl="/hero.jpg"
  headline="¡Ofertas Especiales!"
  subheadline="Hasta 50% de Descuento"
  theme="christmas"              // christmas | summer | dia-muertos | posadas
  overlay="festive"              // festive | gradient | none
  ctaText="Ver Ofertas"
  onCtaClick={() => {}}
/>
```

### PromoPanel

```tsx
<PromoPanel
  productImage="/product.jpg"
  title="Coca-Cola 2L"
  discount={30}
  description="Lleva 2 por el precio de 1"
  badge="OFERTA"                 // OFERTA | NUEVO | HOT | LIMITED
  variant="chedraui"             // chedraui | walmart | default
  ctaText="Agregar"
  onCtaClick={() => {}}
/>
```

### ProductGrid

```tsx
<ProductGrid
  products={products}
  activeTier="A"                 // A | B | C | null
  loading={false}
  onProductClick={(id) => {}}
  onAddToCart={(id) => {}}
  emptyMessage="No hay productos"
/>
```

### GlossyProductCard

```tsx
<GlossyProductCard
  product={{
    id: '1',
    name: 'Product',
    imageUrl: '/product.jpg',
    price: 50,
    tier: 'A',
    badge: 'NEW',
    rewardsPoints: 100,
    seasonal: 'christmas',
    glossLevel: 'premium',       // subtle | medium | premium
  }}
  activeTier="A"
  onAddToCart={() => {}}
  onClick={() => {}}
/>
```

### PriceTierBar

```tsx
<PriceTierBar
  activeTier="A"
  onTierSelect={(tier) => {}}
  showCounts
  tierCounts={{ A: 50, B: 75, C: 100 }}
  highlightActive
/>
```

---

## 🔧 LAP #2: Stabilization & Polish

### Accessibility

```tsx
import { a11y } from '@/components/catalog'

// ARIA labels
<button aria-label={a11y.getProductCardAriaLabel(product)}>

// Focus styles
<button className={a11y.getFocusClasses('premium')}>

// Keyboard navigation
<div onKeyDown={(e) => a11y.handleCardKeyDown(e, handleClick)}>

// Screen reader announcements
a11y.announceAddToCart(product.name)
a11y.announceTierChange('A')
```

### Editor Support

```tsx
<CatalogImagePreviews
  heroBannerUrl={uploadedHeroImage}
  heroBannerHeadline="Preview"
  heroBannerTheme="christmas"
  promoBannerUrl={uploadedPromoImage}
  promoBannerTitle="Promo"
  promoBannerDiscount={30}
/>
```

### Visual Tokens (in tailwind.config.js)

```js
// Copy from TAILWIND_VISUAL_TOKENS.md
theme: {
  extend: {
    backgroundImage: {
      'gold-foil': '...',
      'holiday-red': '...',
      'christmas-gradient': '...',
    },
    boxShadow: {
      'glow-gold': '...',
      'glow-red': '...',
    },
  },
}

// Use in components
<div className="bg-gold-foil glossy-card shadow-glow-gold">
```

---

## 🎯 LAP #3: Variants & Expansion

### Seasonal Themes

```tsx
import { applyThemePack } from '@/seasons/catalog-theme-packs'

const { heroBannerProps, promoPanelProps } = applyThemePack('christmas')

<HeroBanner {...heroBannerProps} />
<PromoPanel {...promoPanelProps} />
```

**Available Themes:**
- `christmas` - Navidad Mexicana
- `posadas` - Las Posadas
- `dia-muertos` - Día de Muertos
- `summer` - Verano Mexicano
- `back-to-school` - Regreso a Clases

### Layout Variants

```tsx
// Masonry Grid
<MasonryGrid
  products={products}
  columns={{ mobile: 1, tablet: 2, desktop: 3 }}
  shimmerOnHover
/>

// Wide Spotlight
<WideSpotlight
  featuredProduct={featured}
  supportingProducts={[product1, product2]}
/>

// Mid Promo Row
<MidPromoRow
  products={products}
  promos={[{ position: 4, title: 'Sale!', discount: 30 }]}
  columns={4}
/>

// Dual Hero
<DualHeroRow
  primaryHero={{ imageUrl: '/hero1.jpg', headline: 'Main' }}
  secondaryHero={{ imageUrl: '/hero2.jpg', headline: 'Secondary' }}
  layout="stacked"              // stacked | side-by-side
/>

// Shoppable Story
<ShoppableStory
  panels={[
    { imageUrl: '/story1.jpg', headline: 'Panel 1', products: [...] }
  ]}
/>
```

### Animations

```tsx
import { motion } from 'framer-motion'
import {
  premiumProductCard,
  heroBannerEntrance,
  staggerContainer,
  staggerItem,
  shineSweep,
  glowPulseColor,
  snowfallParallax,
} from '@/components/catalog'

// Premium card
<motion.div {...premiumProductCard}>
  <GlossyProductCard />
</motion.div>

// Hero entrance
<motion.div {...heroBannerEntrance}>
  <HeroBanner />
</motion.div>

// Staggered grid
<motion.div variants={staggerContainer} initial="hidden" animate="visible">
  {products.map(p => (
    <motion.div key={p.id} variants={staggerItem}>
      <ProductCard />
    </motion.div>
  ))}
</motion.div>

// Custom animations
<motion.div {...shineSweep}>Shiny</motion.div>
<motion.div {...glowPulseColor('gold')}>Glowing</motion.div>
<motion.div {...snowfallParallax('medium')}>❄️</motion.div>
```

### Tablet Optimization

```tsx
import {
  isTablet,
  enableSmoothScroll,
  getTabletGridClass,
  getHitTargetClass,
  getTabletContainerPadding,
  getMomentumScrollClass,
} from '@/components/catalog'

// Enable smooth scrolling
useEffect(() => {
  if (isTablet()) enableSmoothScroll()
}, [])

// Adaptive grid
<div className={getTabletGridClass('standard')}>
  {/* 4 columns landscape, 3 portrait */}
</div>

// Touch targets
<button className={getHitTargetClass('button')}>
  {/* min-h-[48px] min-w-[48px] */}
</button>

// Container padding
<div className={getTabletContainerPadding()}>
  {/* px-8 py-6 landscape, px-6 py-8 portrait */}
</div>

// Momentum scrolling
<div className={getMomentumScrollClass()}>
  {/* smooth iOS-style scrolling */}
</div>
```

### Editor Presets

```tsx
import presets from '@/editor/catalog-presets.json'

// Apply mode preset
const retailMode = presets.modePresets.retailMode
const wholesaleMode = presets.modePresets.wholesaleMode

// Apply performance preset
const premiumMode = presets.performancePresets.premiumMode
const speedMode = presets.performancePresets.speedMode

// Apply quick preset
const highImpactSale = presets.quickPresets.highImpactSale

<CatalogPage
  {...retailMode.settings}
  {...premiumMode.settings}
/>
```

---

## 🎨 Complete Integration Example

```tsx
'use client'

import { useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  // Components
  HeroBanner,
  ProductGrid,
  PromoPanel,
  WideSpotlight,
  MasonryGrid,
  ShoppableStory,
  // Animations
  heroBannerEntrance,
  staggerContainer,
  staggerItem,
  premiumProductCard,
  snowfallParallax,
  // Tablet
  isTablet,
  enableSmoothScroll,
  getTabletGridClass,
  getTabletContainerPadding,
  getHitTargetClass,
  // Accessibility
  a11y,
} from '@/components/catalog'
import { applyThemePack } from '@/seasons/catalog-theme-packs'
import presets from '@/editor/catalog-presets.json'
import { Snowflake } from 'lucide-react'

export default function CatalogPage() {
  // Apply Christmas theme
  const { heroBannerProps, promoPanelProps } = applyThemePack('christmas')

  // Apply retail + premium presets
  const retailSettings = presets.modePresets.retailMode.settings
  const premiumSettings = presets.performancePresets.premiumMode.settings

  // Enable tablet optimizations
  useEffect(() => {
    if (isTablet()) enableSmoothScroll()
  }, [])

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Snowfall effect */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        {Array.from({ length: 20 }).map((_, i) => (
          <motion.div
            key={i}
            {...snowfallParallax('medium')}
            className="absolute"
            style={{ left: `${Math.random() * 100}%` }}
          >
            <Snowflake className="w-4 h-4 text-white opacity-60" />
          </motion.div>
        ))}
      </div>

      {/* Hero with animation */}
      <motion.section {...heroBannerEntrance}>
        <HeroBanner
          {...heroBannerProps}
          aria-label={a11y.getHeroBannerAriaLabel(heroBannerProps)}
        />
      </motion.section>

      {/* Promo panels */}
      <section className={getTabletContainerPadding()}>
        <div className={getTabletGridClass('comfortable')}>
          <PromoPanel {...promoPanelProps} />
        </div>
      </section>

      {/* Featured spotlight */}
      <WideSpotlight
        featuredProduct={featuredProduct}
        supportingProducts={supportingProducts}
      />

      {/* Product grid with stagger */}
      <main className={getTabletContainerPadding()}>
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className={getTabletGridClass('standard')}
        >
          {products.map((product) => (
            <motion.div key={product.id} variants={staggerItem}>
              <motion.div {...premiumProductCard}>
                <GlossyProductCard
                  product={product}
                  onAddToCart={(id) => {
                    handleAddToCart(id)
                    a11y.announceAddToCart(product.name)
                  }}
                />
              </motion.div>
            </motion.div>
          ))}
        </motion.div>
      </main>

      {/* Masonry layout */}
      <MasonryGrid products={masonryProducts} shimmerOnHover />

      {/* Shoppable story */}
      <ShoppableStory panels={storyPanels} />
    </div>
  )
}
```

---

## 📚 Documentation Links

### LAP #1 - Core Components
- [AZTEKA_CATALOG_MVP_COMPONENTS.md](AZTEKA_CATALOG_MVP_COMPONENTS.md) - Component API reference

### LAP #2 - Stabilization
- [LAP2_STABILIZE_COMPLETE.md](LAP2_STABILIZE_COMPLETE.md) - LAP #2 summary
- [CURSOR_INTEGRATION_PATCHES.md](CURSOR_INTEGRATION_PATCHES.md) - 20 integration fixes
- [TAILWIND_VISUAL_TOKENS.md](TAILWIND_VISUAL_TOKENS.md) - Visual tokens config
- [components/catalog/a11y.ts](components/catalog/a11y.ts) - Accessibility utilities
- [components/catalog/types.ts](components/catalog/types.ts) - Type definitions

### LAP #3 - Expansion
- [LAP3_COMPLETE.md](LAP3_COMPLETE.md) - LAP #3 summary
- [seasons/catalog-theme-packs.ts](seasons/catalog-theme-packs.ts) - Seasonal themes
- [components/catalog/layout-variants/](components/catalog/layout-variants/) - Layout components
- [components/catalog/animation/ANIMATION_GUIDE.md](components/catalog/animation/ANIMATION_GUIDE.md) - Animation guide
- [components/catalog/tablet.ts](components/catalog/tablet.ts) - Tablet utilities
- [docs/TABLET_OPTIMIZATION_GUIDE.md](docs/TABLET_OPTIMIZATION_GUIDE.md) - Tablet optimization
- [editor/catalog-presets.json](editor/catalog-presets.json) - Editor presets

### Integration
- [EXAMPLE_CATALOG_PAGE_INTEGRATION.tsx](EXAMPLE_CATALOG_PAGE_INTEGRATION.tsx) - Full page example

---

## 🎯 Common Patterns

### Pattern 1: Basic Catalog Page

```tsx
<HeroBanner {...} />
<PriceTierBar activeTier={tier} onTierSelect={setTier} />
<ProductGrid products={products} activeTier={tier} />
```

### Pattern 2: Seasonal Catalog

```tsx
const theme = applyThemePack('christmas')
<HeroBanner {...theme.heroBannerProps} />
<PromoPanel {...theme.promoPanelProps} />
```

### Pattern 3: Tablet-Optimized

```tsx
<div className={getTabletGridClass('standard')}>
  <button className={getHitTargetClass('button')}>
</div>
```

### Pattern 4: Animated Catalog

```tsx
<motion.div {...heroBannerEntrance}>
  <HeroBanner />
</motion.div>

<motion.div variants={staggerContainer}>
  {products.map(p => (
    <motion.div variants={staggerItem}>
      <motion.div {...premiumProductCard}>
        <ProductCard />
      </motion.div>
    </motion.div>
  ))}
</motion.div>
```

### Pattern 5: Accessible Catalog

```tsx
import { a11y } from '@/components/catalog'

<button
  aria-label={a11y.getProductCardAriaLabel(product)}
  className={a11y.getFocusClasses('premium')}
  onClick={() => {
    handleClick()
    a11y.announceAddToCart(product.name)
  }}
>
```

---

## ✅ Production Checklist

- [ ] Copy Tailwind config from TAILWIND_VISUAL_TOKENS.md
- [ ] Import components from @/components/catalog
- [ ] Wire up data fetching (products, brands, categories)
- [ ] Add toast notifications for cart actions
- [ ] Add router.push() for navigation
- [ ] Test on mobile (320px - 768px)
- [ ] Test on tablet (768px - 1366px)
- [ ] Test on desktop (1366px+)
- [ ] Test with screen reader
- [ ] Test with prefers-reduced-motion
- [ ] Test with keyboard navigation
- [ ] Add analytics tracking
- [ ] Add error boundaries
- [ ] Add loading states
- [ ] Deploy and monitor

---

**All features ready for production!** 🚀
