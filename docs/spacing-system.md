# Global Spacing System

Unified spacing scale for all Azteka DSD Catalog components across mobile, tablet, and desktop.

---

## 📐 Core Spacing Scale

Based on a **4px grid system** for mathematical consistency:

```tsx
SPACING_SCALE = {
  xs: 4px      // Micro spacing
  sm: 8px      // Tight spacing
  md: 12px     // Default spacing
  base: 16px   // Base unit (1rem)
  lg: 24px     // Comfortable spacing
  xl: 32px     // Spacious
  2xl: 48px    // Wide spacing
  3xl: 64px    // Extra wide
  4xl: 96px    // Section spacing
}
```

---

## 📱 Device-Specific Container Padding

### Mobile (320px - 767px)
```tsx
horizontal: 16px (px-4)
vertical: 24px (py-6)
```

### Tablet (768px - 1366px)
```tsx
horizontal: 32px (px-8)
vertical: 24px (py-6)
```

### Desktop (1367px+)
```tsx
horizontal: 48px (px-12)
vertical: 32px (py-8)
```

### Usage

```tsx
import { getResponsivePaddingClasses } from '@/components/catalog/polish/spacing'

<section className={getResponsivePaddingClasses()}>
  {/* px-4 py-6 md:px-8 md:py-6 lg:px-12 lg:py-8 */}
</section>
```

---

## 🎯 Section Gaps

Gap between major sections (Hero → Products → Brands):

```tsx
Mobile: 32px (space-y-8)
Tablet: 48px (space-y-12)
Desktop: 64px (space-y-16)
```

### Usage

```tsx
import { getResponsiveSectionGap } from '@/components/catalog/polish/spacing'

<div className={getResponsiveSectionGap()}>
  {/* space-y-8 md:space-y-12 lg:space-y-16 */}
  <HeroBanner />
  <ProductGrid />
  <BrandsRow />
</div>
```

---

## 🎴 Card Padding Presets

Four density options for card interiors:

```tsx
compact: 12px (p-3)        // Dense layouts, mobile
normal: 16px (p-4)         // Default
comfortable: 24px (p-6)    // Spacious, tablet
spacious: 32px (p-8)       // Premium, desktop
```

### Usage

```tsx
import { getCardPadding, getResponsiveCardPadding } from '@/components/catalog/polish/spacing'

// Single density
<div className={getCardPadding('normal')}>

// Responsive density
<div className={getResponsiveCardPadding('compact', 'normal', 'comfortable')}>
  {/* p-3 md:p-4 lg:p-6 */}
</div>
```

---

## 🔲 Grid Gap Presets

Gap between grid items (products, categories, brands):

```tsx
tight: 8px (gap-2)         // Dense product grids
normal: 16px (gap-4)       // Default
comfortable: 24px (gap-6)  // Spacious
spacious: 32px (gap-8)     // Premium layouts
```

### Usage

```tsx
import { getGridGap, getResponsiveGridGap } from '@/components/catalog/polish/spacing'

// Single gap
<div className={`grid ${getGridGap('normal')}`}>

// Responsive gap
<div className={`grid ${getResponsiveGridGap('tight', 'normal', 'comfortable')}`}>
  {/* gap-2 md:gap-4 lg:gap-6 */}
</div>
```

---

## 🧩 Component-Specific Spacing

### HeroBanner

```tsx
import { HERO_SPACING } from '@/components/catalog/polish/spacing'

<HeroBanner>
  <div className={HERO_SPACING.contentPadding}>
    {/* p-6 md:p-8 lg:p-12 */}
    <div className={HERO_SPACING.titleGap}>
      {/* space-y-2 md:space-y-3 */}
      <h1>Headline</h1>
      <p>Subheadline</p>
    </div>
    <button className={HERO_SPACING.ctaMargin}>
      {/* mt-6 md:mt-8 */}
      CTA
    </button>
  </div>
</HeroBanner>
```

### PromoPanel

```tsx
import { PROMO_SPACING } from '@/components/catalog/polish/spacing'

<PromoPanel className={PROMO_SPACING.padding}>
  {/* p-4 md:p-6 */}
  <div className={PROMO_SPACING.contentGap}>
    {/* space-y-3 md:space-y-4 */}
    <span className={PROMO_SPACING.badgeMargin}>Badge</span>
    <h3>Title</h3>
    <p>Description</p>
    <button className={PROMO_SPACING.ctaMargin}>CTA</button>
  </div>
</PromoPanel>
```

### ProductCard

```tsx
import { PRODUCT_CARD_SPACING } from '@/components/catalog/polish/spacing'

<div className={PRODUCT_CARD_SPACING.padding}>
  {/* p-3 md:p-4 lg:p-6 */}
  <img className={PRODUCT_CARD_SPACING.imageMargin} />
  <h4 className={PRODUCT_CARD_SPACING.titleMargin}>Product Name</h4>
  <p className={PRODUCT_CARD_SPACING.priceMargin}>$50</p>
  <div className={PRODUCT_CARD_SPACING.badgeGap}>Badges</div>
</div>
```

### CategoryCard / BrandCard

```tsx
import { CATEGORY_SPACING } from '@/components/catalog/polish/spacing'

<div className={CATEGORY_SPACING.padding}>
  {/* p-4 md:p-6 */}
  <img className={CATEGORY_SPACING.imageMargin} />
  <h3 className={CATEGORY_SPACING.titleMargin}>Category</h3>
  <p>Product count</p>
</div>
```

### PriceTierBar

```tsx
import { TIER_BAR_SPACING } from '@/components/catalog/polish/spacing'

<div className={TIER_BAR_SPACING.padding}>
  {/* px-4 py-3 md:px-6 md:py-4 */}
  <div className={TIER_BAR_SPACING.buttonGap}>
    {/* gap-2 md:gap-3 */}
    <button>Tier A</button>
    <button>Tier B</button>
  </div>
</div>
```

### Layout Variants

```tsx
import { LAYOUT_VARIANT_SPACING } from '@/components/catalog/polish/spacing'

// MasonryGrid
<div className={LAYOUT_VARIANT_SPACING.masonryGap}>
  {/* gap-3 md:gap-4 lg:gap-6 */}
</div>

// WideSpotlight
<div className={LAYOUT_VARIANT_SPACING.spotlightGap}>
  {/* gap-4 md:gap-6 */}
</div>

// MidPromoRow
<div className={LAYOUT_VARIANT_SPACING.promoRowGap}>
  {/* gap-4 md:gap-6 lg:gap-8 */}
</div>

// DualHeroRow
<div className={LAYOUT_VARIANT_SPACING.dualHeroGap}>
  {/* gap-4 md:gap-6 */}
</div>
```

---

## 🛠️ Utility Functions

### Get Margin

```tsx
import { getMargin } from '@/components/catalog/polish/spacing'

getMargin('lg', 'top')      // mt-6
getMargin('xl', 'bottom')   // mb-8
getMargin('base', 'x')      // mx-4
getMargin('2xl', 'all')     // m-12
```

### Get Padding

```tsx
import { getPadding } from '@/components/catalog/polish/spacing'

getPadding('md', 'left')    // pl-3
getPadding('lg', 'y')       // py-6
getPadding('xl', 'all')     // p-8
```

### Custom Spacing

```tsx
import { customSpacing, toRem } from '@/components/catalog/polish/spacing'

customSpacing(20, 'y')      // space-y-[1.25rem]
toRem(24)                   // "1.5rem"
```

---

## 📊 Complete Spacing Reference

| Element | Mobile | Tablet | Desktop | Class |
|---------|--------|--------|---------|-------|
| Container Padding | 16px/24px | 32px/24px | 48px/32px | `px-4 py-6 md:px-8 lg:px-12 lg:py-8` |
| Section Gap | 32px | 48px | 64px | `space-y-8 md:space-y-12 lg:space-y-16` |
| Card Padding | 12px | 16px | 24px | `p-3 md:p-4 lg:p-6` |
| Grid Gap | 8px | 16px | 24px | `gap-2 md:gap-4 lg:gap-6` |
| Hero Content | 24px | 32px | 48px | `p-6 md:p-8 lg:p-12` |
| Promo Panel | 16px | 24px | 24px | `p-4 md:p-6` |

---

## ✅ Usage Checklist

When building catalog components:

- [ ] Use `getResponsivePaddingClasses()` for page containers
- [ ] Use `getResponsiveSectionGap()` between major sections
- [ ] Use `getResponsiveCardPadding()` for card interiors
- [ ] Use `getResponsiveGridGap()` for product/category grids
- [ ] Import component-specific spacing constants (HERO_SPACING, etc.)
- [ ] Use `getMargin()` and `getPadding()` for custom spacing
- [ ] Test on mobile (320px), tablet (1024px), desktop (1440px)

---

## 🔗 Related Documentation

- [typography-system.md](typography-system.md) - Typography scale
- [color-system.md](color-system.md) - Color palette
- [depth-system.md](depth-system.md) - Shadow and depth
- [LAP3_COMPLETE.md](../LAP3_COMPLETE.md) - Previous LAP

---

**Spacing system complete!** All components now follow unified spacing scale. ✅
