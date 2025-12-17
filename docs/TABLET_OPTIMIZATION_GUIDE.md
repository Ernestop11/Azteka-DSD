# Tablet Optimization Guide - Samsung Galaxy Tab S9 FE

Complete guide for optimizing Azteka DSD Catalog for tablet devices, specifically Samsung Galaxy Tab S9 FE.

---

## 📱 Target Device Specifications

**Samsung Galaxy Tab S9 FE:**
- **Display:** 10.9" (2304 x 1440 pixels, 249 PPI)
- **Aspect Ratio:** 16:10
- **Resolution:** 2304 x 1440 (landscape) / 1440 x 2304 (portrait)
- **Touch:** Capacitive touchscreen with S Pen support
- **Orientation:** Landscape-first design
- **OS:** Android 13+ / One UI 5.1+

---

## 🎯 Design Principles

1. **Landscape-First:** Optimize for horizontal orientation (primary use case)
2. **Touch Targets:** Minimum 48x48px for all interactive elements
3. **Grid Density:** 4-5 columns in landscape, 2-3 in portrait
4. **Generous Spacing:** More breathing room than mobile
5. **Stylus Support:** Precision interactions with S Pen
6. **Smooth Scrolling:** Momentum scrolling for natural feel

---

## 🛠️ Installation

All tablet utilities are available at:

```tsx
import {
  isTablet,
  getTabletColumns,
  getHitTargetClass,
  getMomentumScrollClass,
  tabletUtils,
} from '@/components/catalog/tablet'
```

---

## 📐 Hit Target Optimization

### Minimum Sizes

```tsx
import { HIT_TARGET_SIZES, getHitTargetClass } from '@/components/catalog/tablet'

// Constants
HIT_TARGET_SIZES.minimum      // 44px (WCAG minimum)
HIT_TARGET_SIZES.recommended  // 48px (recommended)
HIT_TARGET_SIZES.comfortable  // 56px (comfortable)
HIT_TARGET_SIZES.large        // 64px (large CTAs)
```

### Component-Specific Classes

```tsx
import { getHitTargetClass } from '@/components/catalog/tablet'

// Buttons
<button className={getHitTargetClass('button')}>
  {/* min-h-[48px] min-w-[48px] px-6 py-3 */}
  Add to Cart
</button>

// Icon buttons
<button className={getHitTargetClass('icon')}>
  {/* min-h-[56px] min-w-[56px] p-3 */}
  <ShoppingCart />
</button>

// Cards
<div className={getHitTargetClass('card')}>
  {/* min-h-[120px] p-6 */}
  <ProductCard />
</div>

// Links
<a className={getHitTargetClass('link')}>
  {/* min-h-[44px] py-2 px-4 */}
  View Details
</a>

// Checkboxes
<input type="checkbox" className={getHitTargetClass('checkbox')} />
{/* min-h-[48px] min-w-[48px] */}
```

### Programmatic Hit Target Enforcement

```tsx
import { ensureHitTarget, HIT_TARGET_SIZES } from '@/components/catalog/tablet'

useEffect(() => {
  const buttons = document.querySelectorAll('button')
  buttons.forEach((btn) => {
    ensureHitTarget(btn as HTMLElement, HIT_TARGET_SIZES.recommended)
  })
}, [])
```

---

## 📱 Landscape Scaling

### Responsive Grid Columns

```tsx
import { getTabletColumns, getTabletGridClass } from '@/components/catalog/tablet'

// Get optimal column count
const columns = getTabletColumns('standard') // Returns 4 in landscape, 3 in portrait

// Or use pre-built class
<div className={getTabletGridClass('standard')}>
  {/* grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 */}
  {products.map(product => <ProductCard key={product.id} product={product} />)}
</div>
```

### Grid Density Modes

```tsx
import { getTabletGridClass } from '@/components/catalog/tablet'

// Compact mode (5 columns landscape, 4 portrait)
<div className={getTabletGridClass('compact')}>

// Standard mode (4 columns landscape, 3 portrait)
<div className={getTabletGridClass('standard')}>

// Comfortable mode (3 columns landscape, 2 portrait)
<div className={getTabletGridClass('comfortable')}>

// Showcase mode (2 columns landscape, 2 portrait)
<div className={getTabletGridClass('showcase')}>
```

### Container Padding

```tsx
import { getTabletContainerPadding } from '@/components/catalog/tablet'

// Adaptive padding based on orientation
<div className={getTabletContainerPadding()}>
  {/* Landscape: px-8 py-6 */}
  {/* Portrait: px-6 py-8 */}
  <Content />
</div>
```

### Font Scaling

```tsx
import { getTabletFontClass } from '@/components/catalog/tablet'

<h1 className={getTabletFontClass('3xl')}>
  {/* text-4xl on tablet, text-3xl on mobile */}
  Catalog Title
</h1>

<p className={getTabletFontClass('base')}>
  {/* text-lg on tablet, text-base on mobile */}
  Product description
</p>
```

---

## 🎢 Scroll Smoothing

### Enable Smooth Scrolling

```tsx
import { enableSmoothScroll } from '@/components/catalog/tablet'

useEffect(() => {
  enableSmoothScroll() // Enables CSS scroll-behavior: smooth
}, [])
```

### Momentum Scrolling (iOS-style)

```tsx
import { getMomentumScrollClass } from '@/components/catalog/tablet'

<div className={getMomentumScrollClass()}>
  {/* overflow-y-auto overscroll-y-contain scroll-smooth [-webkit-overflow-scrolling:touch] */}
  <LongContent />
</div>
```

### Snap Scrolling for Carousels

```tsx
import { getSnapScrollClass, getSnapItemClass } from '@/components/catalog/tablet'

// Container
<div className={getSnapScrollClass('proximity')}>
  {/* overflow-x-auto snap-x snap-proximity scrollbar-hide */}

  {/* Items */}
  {products.map(product => (
    <div key={product.id} className={getSnapItemClass('start')}>
      {/* snap-start scroll-ml-6 */}
      <ProductCard product={product} />
    </div>
  ))}
</div>
```

**Snap Types:**
- `mandatory` - Always snaps to nearest item
- `proximity` - Snaps only when close to item (more natural)

**Snap Alignment:**
- `start` - Snap to start of container
- `center` - Snap to center
- `end` - Snap to end

### Smooth Scroll to Element

```tsx
import { smoothScrollToElement } from '@/components/catalog/tablet'

function handleScrollToProducts() {
  smoothScrollToElement('products-section', 80) // 80px offset for header
}

<button onClick={handleScrollToProducts}>
  View Products
</button>

<section id="products-section">
  <ProductGrid />
</section>
```

---

## 🎴 Large Card Spacing

### Card Spacing Utilities

```tsx
import { getCardSpacing } from '@/components/catalog/tablet'

// Adaptive spacing based on orientation
<div className={`grid ${getCardSpacing('comfortable')}`}>
  {/* Landscape: gap-6 */}
  {/* Portrait: gap-4 */}
  <ProductCard />
</div>
```

**Spacing Options:**
- `tight` - 12px gap (dense layouts)
- `normal` - 16px gap (default)
- `comfortable` - 24px gap (spacious)
- `spacious` - 32px gap (premium feel)

### Large Card Padding

```tsx
import { getLargeCardPadding } from '@/components/catalog/tablet'

<div className={getLargeCardPadding()}>
  {/* p-6 md:p-8 on tablet */}
  {/* p-4 on mobile */}
  <CardContent />
</div>
```

### Product Card Heights

```tsx
import { getProductCardClasses } from '@/components/catalog/tablet'

<div className={getProductCardClasses()}>
  {/* min-h-[320px] md:min-h-[360px] in landscape */}
  {/* min-h-[300px] in portrait */}
  {/* min-h-[280px] on mobile */}
  <GlossyProductCard />
</div>
```

### Hero Banner Heights

```tsx
import { getHeroBannerHeight } from '@/components/catalog/tablet'

<div className={getHeroBannerHeight()}>
  {/* h-[500px] md:h-[600px] in landscape */}
  {/* h-[450px] in portrait */}
  {/* h-[400px] on mobile */}
  <HeroBanner />
</div>
```

---

## ✏️ Stylus Support (S Pen)

### Detect Stylus

```tsx
import { hasStylusSupport, STYLUS_CLASSES } from '@/components/catalog/tablet'

if (hasStylusSupport()) {
  // Enable precision features
}
```

### Stylus-Optimized Classes

```tsx
import { STYLUS_CLASSES } from '@/components/catalog/tablet'

// Precise touch targets (smaller for stylus)
<button className={STYLUS_CLASSES.preciseTarget}>
  {/* min-h-[40px] min-w-[40px] */}
  Edit
</button>

// Hover states (stylus can hover unlike finger)
<div className={STYLUS_CLASSES.hoverEnabled}>
  {/* hover:bg-gray-100 hover:scale-105 */}
  <Card />
</div>

// Precise borders
<input className={STYLUS_CLASSES.preciseBorder} />
{/* border-2 hover:border-3 */}
```

### Adaptive Input Classes

```tsx
import { getInputClasses } from '@/components/catalog/tablet'

// Automatically adapts to stylus or touch
<button className={getInputClasses()}>
  {/* Smaller targets if stylus detected */}
  {/* Larger 48px targets if touch-only */}
  Action
</button>
```

---

## 🔄 Orientation Handling

### Get Current Orientation

```tsx
import { getTabletOrientation } from '@/components/catalog/tablet'

const orientation = getTabletOrientation()
// Returns: 'landscape' | 'portrait' | null
```

### Listen for Orientation Changes

```tsx
import { onOrientationChange } from '@/components/catalog/tablet'

useEffect(() => {
  const cleanup = onOrientationChange((orientation) => {
    console.log('Orientation changed to:', orientation)
    // Update layout accordingly
  })

  return cleanup // Remove listeners on unmount
}, [])
```

### React Hook (if using React)

```tsx
import { useTabletOrientation } from '@/components/catalog/tablet'

function CatalogPage() {
  const { orientation, isLandscape, isPortrait } = useTabletOrientation()

  return (
    <div className={isLandscape ? 'grid-cols-4' : 'grid-cols-2'}>
      {/* Adaptive layout */}
    </div>
  )
}
```

---

## ⚙️ Complete Component Integration

### Tablet-Optimized ProductGrid

```tsx
import {
  getTabletProductGridProps,
  getTabletGridClass,
  getProductCardClasses,
  getMomentumScrollClass,
} from '@/components/catalog/tablet'

function TabletProductGrid({ products }) {
  const tabletProps = getTabletProductGridProps()

  return (
    <div className={getMomentumScrollClass()}>
      <div className={getTabletGridClass('standard')}>
        {products.map((product) => (
          <div key={product.id} className={getProductCardClasses()}>
            <GlossyProductCard product={product} />
          </div>
        ))}
      </div>
    </div>
  )
}
```

### Tablet-Optimized HeroBanner

```tsx
import {
  getTabletHeroBannerProps,
  getHeroBannerHeight,
  getTabletContainerPadding,
} from '@/components/catalog/tablet'

function TabletHeroBanner() {
  const tabletProps = getTabletHeroBannerProps()

  return (
    <div className={getHeroBannerHeight()}>
      <div className={getTabletContainerPadding()}>
        <HeroBanner
          imageUrl="/hero.jpg"
          headline="¡Ofertas Especiales!"
          theme="christmas"
        />
      </div>
    </div>
  )
}
```

### Tablet-Optimized Section

```tsx
import { getTabletSectionProps } from '@/components/catalog/tablet'

function CatalogSection() {
  const { container, grid, spacing, scroll } = getTabletSectionProps()

  return (
    <section className={container}>
      <div className={scroll}>
        <div className={`${grid} ${spacing}`}>
          {/* Content */}
        </div>
      </div>
    </section>
  )
}
```

---

## 🚀 Performance Optimization

### Reduce Animations on Low Performance

```tsx
import { shouldReduceTabletAnimations, getTabletAnimationConfig } from '@/components/catalog/tablet'

const animationConfig = getTabletAnimationConfig()

<motion.div
  animate={{ scale: 1.05 }}
  transition={{ duration: animationConfig.duration }}
>
  {animationConfig.enableGlow && <GlowEffect />}
</motion.div>
```

### Conditional Features Based on Performance

```tsx
import { shouldReduceTabletAnimations } from '@/components/catalog/tablet'

function CatalogPage() {
  const reduceAnimations = shouldReduceTabletAnimations()

  return (
    <ProductGrid
      enableParallax={!reduceAnimations}
      enableGlow={!reduceAnimations}
      enableShine={!reduceAnimations}
    />
  )
}
```

**Animation config returns:**
```tsx
{
  duration: 0.4,           // Animation duration
  staggerDelay: 0.08,      // Grid stagger delay
  enableParallax: true,    // Enable parallax effects
  enableGlow: true,        // Enable glow effects
}
```

---

## 📋 Complete Example: Catalog Page

```tsx
'use client'

import { useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  HeroBanner,
  ProductGrid,
  PriceTierBar,
  PromoPanel,
  BrandsRowVisual,
} from '@/components/catalog'
import {
  isTablet,
  enableSmoothScroll,
  getTabletGridClass,
  getProductCardClasses,
  getHeroBannerHeight,
  getTabletContainerPadding,
  getCardSpacing,
  getMomentumScrollClass,
  getHitTargetClass,
  getTabletAnimationConfig,
  useTabletOrientation,
} from '@/components/catalog/tablet'

export default function TabletCatalogPage() {
  const { isLandscape, isPortrait } = useTabletOrientation()
  const animationConfig = getTabletAnimationConfig()

  // Enable smooth scrolling
  useEffect(() => {
    if (isTablet()) {
      enableSmoothScroll()
    }
  }, [])

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Banner - Tablet optimized */}
      <section className={getHeroBannerHeight()}>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: animationConfig.duration }}
          className={getTabletContainerPadding()}
        >
          <HeroBanner
            imageUrl="/hero-christmas.jpg"
            headline="¡Ofertas Navideñas!"
            subheadline="Hasta 50% de Descuento"
            theme="christmas"
            overlay="festive"
          />
        </motion.div>
      </section>

      {/* Price Tier Bar - Larger touch targets */}
      <section className="sticky top-0 z-10 bg-white shadow-md">
        <div className={getTabletContainerPadding()}>
          <PriceTierBar
            activeTier={activeTier}
            onTierSelect={handleTierChange}
            buttonClass={getHitTargetClass('button')}
          />
        </div>
      </section>

      {/* Promo Panels - Adaptive grid */}
      <section className={getTabletContainerPadding()}>
        <div className={`grid ${isLandscape ? 'grid-cols-2' : 'grid-cols-1'} ${getCardSpacing('comfortable')}`}>
          <PromoPanel
            productImage="/promo-1.jpg"
            title="Coca-Cola 2L"
            discount={30}
            variant="chedraui"
          />
          <PromoPanel
            productImage="/promo-2.jpg"
            title="Sabritas Pack"
            discount={25}
            variant="walmart"
          />
        </div>
      </section>

      {/* Product Grid - Tablet optimized */}
      <main className={getTabletContainerPadding()}>
        <div className={getMomentumScrollClass()}>
          <div className={`${getTabletGridClass('standard')} ${getCardSpacing('comfortable')}`}>
            {products.map((product) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: animationConfig.duration }}
                className={getProductCardClasses()}
              >
                <GlossyProductCard
                  product={product}
                  onAddToCart={handleAddToCart}
                />
              </motion.div>
            ))}
          </div>
        </div>
      </main>

      {/* Brands Row - Horizontal scroll */}
      <section className={getTabletContainerPadding()}>
        <BrandsRowVisual
          brands={brands}
          onBrandClick={handleBrandClick}
          scrollClass={getMomentumScrollClass()}
        />
      </section>
    </div>
  )
}
```

---

## 🎯 Best Practices Checklist

### ✅ Hit Targets
- [ ] All buttons minimum 48x48px
- [ ] Icon buttons minimum 56x56px
- [ ] Cards minimum 120px height
- [ ] Links minimum 44px height
- [ ] Form inputs minimum 48px

### ✅ Layout
- [ ] 4-5 columns in landscape mode
- [ ] 2-3 columns in portrait mode
- [ ] Generous padding (px-8 py-6)
- [ ] Comfortable spacing (gap-6)
- [ ] Proper font scaling (text-lg base)

### ✅ Scrolling
- [ ] Smooth scroll enabled
- [ ] Momentum scrolling on containers
- [ ] Snap scroll on carousels
- [ ] Proper overscroll behavior

### ✅ Performance
- [ ] Check battery/connection for reduced animations
- [ ] Conditional parallax effects
- [ ] Optimized stagger delays
- [ ] Proper viewport triggers

### ✅ Orientation
- [ ] Landscape-first design
- [ ] Portrait fallback
- [ ] Orientation change listeners
- [ ] Adaptive layouts

### ✅ Stylus Support
- [ ] Detect S Pen capability
- [ ] Smaller targets when stylus available
- [ ] Hover states enabled
- [ ] Precise borders for inputs

---

## 🔗 Related Documentation

- [components/catalog/tablet.ts](../components/catalog/tablet.ts) - Utility functions
- [ANIMATION_GUIDE.md](../components/catalog/animation/ANIMATION_GUIDE.md) - Animation library
- [catalog-presets.json](../editor/catalog-presets.json) - Editor configurations
- [LAP3_COMPLETE.md](../LAP3_COMPLETE.md) - LAP #3 summary

---

## 📊 Tablet Breakpoints Reference

```css
/* Mobile */
@media (max-width: 767px) {
  /* 2 columns, tighter spacing */
}

/* Tablet Portrait */
@media (min-width: 768px) and (max-width: 1023px) and (orientation: portrait) {
  /* 2-3 columns, medium spacing */
}

/* Tablet Landscape */
@media (min-width: 1024px) and (max-width: 1366px) and (orientation: landscape) {
  /* 4-5 columns, comfortable spacing */
}

/* Desktop */
@media (min-width: 1367px) {
  /* Desktop layout */
}
```

---

## ✅ Samsung Galaxy Tab S9 FE Optimization Complete!

All utilities and guides delivered for optimal tablet experience. 🎉
