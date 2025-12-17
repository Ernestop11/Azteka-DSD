# Global Typography System

Unified type scale for all Azteka DSD Catalog components across mobile, tablet, and desktop.

---

## 📏 Core Type Scale

Based on **modular scale with 1.25 ratio**:

```tsx
TYPE_SCALE = {
  xs: 12px     // 0.75rem - Fine print, metadata
  sm: 14px     // 0.875rem - Small text, captions
  base: 16px   // 1rem - Body text
  lg: 18px     // 1.125rem - Large body
  xl: 20px     // 1.25rem - Subheadings
  2xl: 24px    // 1.5rem - Section headings
  3xl: 30px    // 1.875rem - Page titles
  4xl: 36px    // 2.25rem - Hero headlines
  5xl: 48px    // 3rem - Display headlines
  6xl: 64px    // 4rem - Feature headlines
}
```

---

## 📱 Device-Specific Scales

### Mobile (320px - 767px)

```tsx
metadata: 12px
caption: 14px
body: 16px
bodyLarge: 18px
subheading: 20px
heading: 24px
title: 30px
hero: 36px
display: 36px
```

### Tablet (768px - 1366px)

```tsx
metadata: 14px
caption: 16px
body: 18px
bodyLarge: 20px
subheading: 24px
heading: 30px
title: 36px
hero: 48px
display: 48px
```

### Desktop (1367px+)

```tsx
metadata: 14px
caption: 16px
body: 18px
bodyLarge: 20px
subheading: 24px
heading: 36px
title: 48px
hero: 64px
display: 64px
```

---

## 🎯 Responsive Text Classes

```tsx
import { RESPONSIVE_TEXT } from '@/components/catalog/polish/typography'

metadata: 'text-xs md:text-sm'
caption: 'text-sm md:text-base'
body: 'text-base md:text-lg'
bodyLarge: 'text-lg md:text-xl'
subheading: 'text-xl md:text-2xl'
heading: 'text-2xl md:text-3xl lg:text-4xl'
title: 'text-3xl md:text-4xl lg:text-5xl'
hero: 'text-4xl md:text-5xl lg:text-6xl'
display: 'text-4xl md:text-5xl lg:text-6xl'
```

### Usage

```tsx
import { getResponsiveText } from '@/components/catalog/polish/typography'

<h1 className={getResponsiveText('hero')}>
  {/* text-4xl md:text-5xl lg:text-6xl */}
  Hero Headline
</h1>
```

---

## 📐 Line Height

```tsx
tight: 1.1       // leading-tight - Tight headlines
snug: 1.25       // leading-snug - Headings
normal: 1.5      // leading-normal - Body text
relaxed: 1.75    // leading-relaxed - Comfortable reading
loose: 2         // leading-loose - Extra spacing
```

---

## 🔤 Letter Spacing (Tracking)

```tsx
tighter: -0.05em   // tracking-tighter
tight: -0.025em    // tracking-tight
normal: 0          // tracking-normal
wide: 0.025em      // tracking-wide
wider: 0.05em      // tracking-wider
widest: 0.1em      // tracking-widest
```

---

## ⚖️ Font Weight

```tsx
light: 300       // font-light
normal: 400      // font-normal
medium: 500      // font-medium
semibold: 600    // font-semibold
bold: 700        // font-bold
extrabold: 800   // font-extrabold
black: 900       // font-black
```

---

## 🧩 Component Typography

### HeroBanner

```tsx
import { HERO_TYPOGRAPHY } from '@/components/catalog/polish/typography'

// Headline
<h1 className={HERO_TYPOGRAPHY.headline.class}>
  {/* text-4xl md:text-5xl lg:text-6xl font-extrabold leading-tight tracking-tight */}
  ¡Ofertas Navideñas!
</h1>

// Subheadline
<p className={HERO_TYPOGRAPHY.subheadline.class}>
  {/* text-lg md:text-xl font-medium leading-normal */}
  Hasta 50% de descuento
</p>

// CTA Button
<button className={HERO_TYPOGRAPHY.cta.class}>
  {/* text-base md:text-lg font-bold tracking-wide */}
  Ver Ofertas
</button>
```

### PromoPanel

```tsx
import { PROMO_TYPOGRAPHY } from '@/components/catalog/polish/typography'

// Badge
<span className={PROMO_TYPOGRAPHY.badge.class}>
  {/* text-xs md:text-sm font-bold tracking-wider uppercase */}
  OFERTA
</span>

// Title
<h3 className={PROMO_TYPOGRAPHY.title.class}>
  {/* text-2xl md:text-3xl lg:text-4xl font-bold leading-snug */}
  Coca-Cola 2L
</h3>

// Discount
<p className={PROMO_TYPOGRAPHY.discount.class}>
  {/* text-3xl md:text-4xl lg:text-5xl font-black leading-tight */}
  30% OFF
</p>

// Description
<p className={PROMO_TYPOGRAPHY.description.class}>
  {/* text-sm md:text-base font-normal leading-relaxed */}
  Lleva 2 por el precio de 1
</p>
```

### ProductCard

```tsx
import { PRODUCT_TYPOGRAPHY } from '@/components/catalog/polish/typography'

// Product Name
<h4 className={PRODUCT_TYPOGRAPHY.name.class}>
  {/* text-base md:text-lg font-semibold leading-snug */}
  Coca-Cola 2L
</h4>

// Brand
<p className={PRODUCT_TYPOGRAPHY.brand.class}>
  {/* text-sm md:text-base font-medium */}
  Coca-Cola
</p>

// Price
<p className={PRODUCT_TYPOGRAPHY.price.class}>
  {/* text-lg md:text-xl font-bold */}
  $50.00
</p>

// Original Price (crossed out)
<p className={PRODUCT_TYPOGRAPHY.originalPrice.class}>
  {/* text-sm md:text-base font-normal line-through opacity-60 */}
  $70.00
</p>

// Badge
<span className={PRODUCT_TYPOGRAPHY.badge.class}>
  {/* text-xs font-bold tracking-wide uppercase */}
  NEW
</span>

// Metadata (tier, points, etc.)
<span className={PRODUCT_TYPOGRAPHY.metadata.class}>
  {/* text-xs md:text-sm font-normal */}
  100 puntos
</span>
```

### CategoryCard / BrandCard

```tsx
import { CATEGORY_TYPOGRAPHY } from '@/components/catalog/polish/typography'

// Category Name
<h3 className={CATEGORY_TYPOGRAPHY.name.class}>
  {/* text-xl md:text-2xl font-bold leading-snug */}
  Bebidas
</h3>

// Description
<p className={CATEGORY_TYPOGRAPHY.description.class}>
  {/* text-sm md:text-base font-normal leading-relaxed */}
  Refrescos y bebidas
</p>

// Product Count
<span className={CATEGORY_TYPOGRAPHY.productCount.class}>
  {/* text-xs md:text-sm font-medium */}
  125 productos
</span>
```

### PriceTierBar

```tsx
import { TIER_TYPOGRAPHY } from '@/components/catalog/polish/typography'

// Tier Label
<button className={TIER_TYPOGRAPHY.label.class}>
  {/* text-base md:text-lg font-semibold tracking-wide */}
  Categoría A
</button>

// Product Count
<span className={TIER_TYPOGRAPHY.count.class}>
  {/* text-xs md:text-sm font-normal */}
  (50)
</span>
```

### ShowcaseSection

```tsx
import { SHOWCASE_TYPOGRAPHY } from '@/components/catalog/polish/typography'

// Section Title
<h2 className={SHOWCASE_TYPOGRAPHY.title.class}>
  {/* text-3xl md:text-4xl lg:text-5xl font-bold leading-tight */}
  Productos Destacados
</h2>

// Subtitle
<p className={SHOWCASE_TYPOGRAPHY.subtitle.class}>
  {/* text-lg md:text-xl font-normal leading-relaxed */}
  Lo mejor de la temporada
</p>
```

---

## 🎨 Typography Variants

### Fiesta Headline (Mexican DSD Style)

Vibrant, playful, festival energy:

```tsx
import { FIESTA_HEADLINE } from '@/components/catalog/polish/typography'

<h1 className={`${FIESTA_HEADLINE.class} ${FIESTA_HEADLINE.colors} ${FIESTA_HEADLINE.effects}`}>
  {/* text-4xl md:text-5xl lg:text-6xl font-black leading-tight tracking-tight */}
  {/* bg-gradient-to-r from-red-500 via-yellow-500 to-green-500 bg-clip-text text-transparent */}
  {/* drop-shadow-lg */}
  ¡GRAN FIESTA DE OFERTAS!
</h1>
```

### Premium Retail Headline (Upscale Style)

Sophisticated, elegant, minimalist:

```tsx
import { PREMIUM_HEADLINE } from '@/components/catalog/polish/typography'

<h1 className={`${PREMIUM_HEADLINE.class} ${PREMIUM_HEADLINE.colors} ${PREMIUM_HEADLINE.effects}`}>
  {/* text-4xl md:text-5xl lg:text-6xl font-light leading-tight tracking-widest uppercase */}
  {/* text-gray-900 drop-shadow-sm */}
  COLECCIÓN PREMIUM
</h1>
```

---

## 🛠️ Utility Functions

### Get Component Typography

```tsx
import { getTypographyClass } from '@/components/catalog/polish/typography'

// Get typography for specific component element
<h1 className={getTypographyClass('hero', 'headline')}>
<p className={getTypographyClass('promo', 'description')}>
<h4 className={getTypographyClass('product', 'name')}>
```

### Build Custom Typography

```tsx
import { buildTypographyClass } from '@/components/catalog/polish/typography'

const customClass = buildTypographyClass({
  size: 'hero',
  weight: 'bold',
  lineHeight: 'tight',
  tracking: 'wide',
})

<h1 className={customClass}>Custom Headline</h1>
```

---

## 📊 Typography Reference Table

| Element | Mobile | Tablet | Desktop | Weight | Line Height |
|---------|--------|--------|---------|--------|-------------|
| Hero Headline | 36px | 48px | 64px | 800 | 1.1 |
| Hero Subheadline | 18px | 20px | 20px | 500 | 1.5 |
| Promo Title | 24px | 30px | 36px | 700 | 1.25 |
| Promo Discount | 30px | 36px | 48px | 900 | 1.1 |
| Product Name | 16px | 18px | 18px | 600 | 1.25 |
| Product Price | 18px | 20px | 20px | 700 | - |
| Badge | 12px | 12px | 12px | 700 | - |
| Category Name | 20px | 24px | 24px | 700 | 1.25 |
| Body Text | 16px | 18px | 18px | 400 | 1.5 |
| Metadata | 12px | 14px | 14px | 400 | - |

---

## ✅ Usage Checklist

When styling catalog components:

- [ ] Use `getResponsiveText()` for consistent sizing
- [ ] Use component-specific typography constants (HERO_TYPOGRAPHY, etc.)
- [ ] Apply appropriate font weight for hierarchy
- [ ] Use tight line-height for headlines, normal for body
- [ ] Add letter-spacing to buttons and badges (tracking-wide)
- [ ] Test readability on all device sizes
- [ ] Ensure contrast meets WCAG AA standards (4.5:1 minimum)
- [ ] Use variant styles (Fiesta/Premium) for special occasions

---

## 🔗 Related Documentation

- [spacing-system.md](spacing-system.md) - Spacing scale
- [color-system.md](color-system.md) - Color palette
- [depth-system.md](depth-system.md) - Shadow and depth
- [LAP4_COMPLETE.md](../LAP4_COMPLETE.md) - LAP #4 summary

---

**Typography system complete!** All text now follows unified scale. ✅
