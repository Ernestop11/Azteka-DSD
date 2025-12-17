# Global Color System

Unified color palette for all Azteka DSD Catalog components and seasonal themes.

---

## 🎨 Core Brand Palette

### Primary Colors

```tsx
catalogBlue: #3b82f6    // Primary blue
holidayRed: #ef4444     // Festive red
fiestaGreen: #22c55e    // Vibrant green
goldAccent: #eab308     // Accent gold
```

### Neutral Colors

```tsx
white: #ffffff
gray-50 to gray-900: Full gray scale
black: #000000
```

### Semantic Colors

```tsx
success: #22c55e    // Green
warning: #eab308    // Gold
error: #ef4444      // Red
info: #3b82f6       // Blue
```

---

## 🎄 Seasonal Theme Palettes

### Christmas / Navidad

```tsx
import { CHRISTMAS_PALETTE } from '@/components/catalog/polish/colors'

primary: #dc2626      // Deep red
secondary: #16a34a    // Forest green
accent: #eab308       // Gold
background: #fef2f2   // Light red tint
gradient: 'bg-gradient-to-r from-red-500 via-yellow-400 to-green-500'
```

### Posadas

```tsx
import { POSADAS_PALETTE } from '@/components/catalog/polish/colors'

primary: #a855f7      // Purple
secondary: #ec4899    // Pink
accent: #fbbf24       // Gold
background: #faf5ff   // Light purple tint
gradient: 'bg-gradient-to-r from-purple-500 via-pink-500 to-amber-400'
```

### Día de Muertos

```tsx
import { DIA_MUERTOS_PALETTE } from '@/components/catalog/polish/colors'

primary: #f97316      // Orange
secondary: #ec4899    // Pink
accent: #a855f7       // Purple
background: #fff7ed   // Light orange tint
gradient: 'bg-gradient-to-r from-orange-500 via-pink-500 to-purple-500'
```

### Summer / Verano

```tsx
import { SUMMER_PALETTE } from '@/components/catalog/polish/colors'

primary: #06b6d4      // Cyan
secondary: #3b82f6    // Blue
accent: #a855f7       // Purple
background: #ecfeff   // Light cyan tint
gradient: 'bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500'
```

### Back to School

```tsx
import { BACK_TO_SCHOOL_PALETTE } from '@/components/catalog/polish/colors'

primary: #3b82f6      // Blue
secondary: #22c55e    // Green
accent: #eab308       // Gold
background: #eff6ff   // Light blue tint
gradient: 'bg-gradient-to-r from-blue-500 via-green-500 to-yellow-500'
```

---

## 🏪 Retail Mode Palettes

### Chedraui

```tsx
import { CHEDRAUI_PALETTE } from '@/components/catalog/polish/colors'

primary: #dc2626      // Red
secondary: #eab308    // Gold
gradient: 'bg-gradient-to-br from-red-600 to-orange-500'
```

### Walmart Mexico

```tsx
import { WALMART_PALETTE } from '@/components/catalog/polish/colors'

primary: #0071ce      // Walmart blue
secondary: #ffc220    // Walmart yellow
gradient: 'bg-gradient-to-br from-[#0071ce] to-[#ffc220]'
```

### Premium Retail

```tsx
import { PREMIUM_RETAIL_PALETTE } from '@/components/catalog/polish/colors'

primary: #111827      // Gray-900
secondary: #ca8a04    // Gold-600
gradient: 'bg-gradient-to-br from-gray-800 to-gray-600'
```

---

## 🏷️ Badge Colors

```tsx
import { getBadgeColor } from '@/components/catalog/polish/colors'

NEW: Blue-500 bg, White text
HOT: Red-500 bg, White text
SALE: Yellow-400 bg, Gray-900 text
LIMITED: Purple-500 bg, White text
OFERTA: Red-600 bg, White text
```

### Usage

```tsx
<span className={getBadgeColor('NEW')}>
  {/* bg-blue-500 text-white */}
  NEW
</span>
```

---

## 💰 Tier Colors (A/B/C Pricing)

```tsx
import { getTierColor } from '@/components/catalog/polish/colors'

Tier A: Gold-500 (Premium)
Tier B: Blue-500 (Standard)
Tier C: Green-500 (Value)
```

### Usage

```tsx
// Filled variant
<button className={getTierColor('A', 'filled')}>
  {/* bg-yellow-500 text-yellow-900 */}
  Categoría A
</button>

// Outline variant
<button className={getTierColor('A', 'outline')}>
  {/* border-yellow-500 text-yellow-700 */}
  Categoría A
</button>
```

---

## ✨ Glow Effect Colors

```tsx
import { getGlowEffect } from '@/components/catalog/polish/colors'

gold: rgba(234, 179, 8, 0.3)
red: rgba(239, 68, 68, 0.3)
green: rgba(34, 197, 94, 0.3)
blue: rgba(59, 130, 246, 0.3)
purple: rgba(168, 85, 247, 0.3)
```

### Usage

```tsx
// Static glow
<div className={getGlowEffect('gold')}>
  {/* shadow-[0_0_20px_rgba(234,179,8,0.3)] */}
</div>

// Glow with hover effect
<div className={getGlowEffect('gold', true)}>
  {/* shadow-[0_0_20px_rgba(234,179,8,0.3)] hover:shadow-[0_0_40px_rgba(234,179,8,0.6)] */}
</div>
```

---

## 🌈 Gradient Library

### Background Gradients

```tsx
import { getGradient, GRADIENTS } from '@/components/catalog/polish/colors'

// Festive
christmasGradient: 'bg-gradient-to-r from-red-600 via-yellow-400 to-green-600'
posadasGradient: 'bg-gradient-to-r from-purple-500 via-pink-500 to-amber-400'
diaMuertosGradient: 'bg-gradient-to-r from-orange-500 via-pink-500 to-purple-500'
summerGradient: 'bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500'
backToSchoolGradient: 'bg-gradient-to-r from-blue-500 via-green-500 to-yellow-500'

// Retail
chedrauiGradient: 'bg-gradient-to-br from-red-600 to-orange-500'
walmartGradient: 'bg-gradient-to-br from-[#0071ce] to-[#ffc220]'
premiumGradient: 'bg-gradient-to-br from-gray-800 to-gray-600'

// Metallic
goldFoil: 'bg-gradient-to-br from-yellow-200 via-yellow-400 to-yellow-600'
silverFoil: 'bg-gradient-to-br from-gray-200 via-gray-300 to-gray-400'

// Subtle
warmGlow: 'bg-gradient-to-br from-orange-50 to-red-50'
coolGlow: 'bg-gradient-to-br from-blue-50 to-cyan-50'
neutralGlow: 'bg-gradient-to-br from-gray-50 to-gray-100'
```

### Usage

```tsx
<div className={getGradient('christmasGradient')}>
  Festive background
</div>
```

### Text Gradients

```tsx
import { getTextGradient } from '@/components/catalog/polish/colors'

christmas: Red → Yellow → Green
posadas: Purple → Pink → Amber
diaMuertos: Orange → Pink → Purple
summer: Cyan → Blue → Purple
gold: Yellow-400 → Yellow-500 → Yellow-600
premium: Gray-700 → Gray-800 → Gray-900
```

### Usage

```tsx
<h1 className={getTextGradient('christmas')}>
  {/* bg-gradient-to-r from-red-500 via-yellow-500 to-green-500 bg-clip-text text-transparent */}
  ¡Feliz Navidad!
</h1>
```

---

## 🎯 Usage Examples

### Apply Seasonal Theme

```tsx
import { getThemePalette } from '@/components/catalog/polish/colors'

const christmas = getThemePalette('christmas')

<HeroBanner
  style={{
    background: christmas.gradient.class,
    color: christmas.text,
  }}
/>
```

### Apply Retail Variant

```tsx
import { getRetailPalette } from '@/components/catalog/polish/colors'

const chedraui = getRetailPalette('chedraui')

<PromoPanel className={chedraui.gradient.class} />
```

### Complete Component Example

```tsx
import {
  getBadgeColor,
  getTierColor,
  getGlowEffect,
  getTextGradient,
} from '@/components/catalog/polish/colors'

<div className={getGlowEffect('gold', true)}>
  <span className={getBadgeColor('NEW')}>NEW</span>

  <h2 className={getTextGradient('christmas')}>
    ¡Ofertas Navideñas!
  </h2>

  <button className={getTierColor('A', 'filled')}>
    Categoría A
  </button>
</div>
```

---

## 📊 Color Reference Table

| Use Case | Color | Hex | Tailwind Class |
|----------|-------|-----|----------------|
| Primary | Catalog Blue | #3b82f6 | bg-blue-500 |
| Success | Green | #22c55e | bg-green-500 |
| Warning | Gold | #eab308 | bg-yellow-500 |
| Error | Red | #ef4444 | bg-red-500 |
| Christmas Primary | Deep Red | #dc2626 | bg-red-600 |
| Christmas Secondary | Forest Green | #16a34a | bg-green-600 |
| Christmas Accent | Gold | #eab308 | bg-yellow-500 |
| Tier A | Gold | #eab308 | bg-yellow-500 |
| Tier B | Blue | #3b82f6 | bg-blue-500 |
| Tier C | Green | #22c55e | bg-green-500 |

---

## ✅ Usage Checklist

When applying colors to components:

- [ ] Use theme palettes for seasonal consistency
- [ ] Use `getBadgeColor()` for all badges
- [ ] Use `getTierColor()` for tier indicators
- [ ] Use `getGlowEffect()` for premium highlights
- [ ] Use `getGradient()` for background gradients
- [ ] Use `getTextGradient()` for headline effects
- [ ] Ensure sufficient contrast (WCAG AA: 4.5:1 minimum)
- [ ] Test all colors in light and dark mode (if applicable)
- [ ] Sync glow colors with animation presets

---

## 🔗 Related Documentation

- [spacing-system.md](spacing-system.md) - Spacing scale
- [typography-system.md](typography-system.md) - Typography scale
- [depth-system.md](depth-system.md) - Shadow and depth
- [catalog-theme-packs.ts](../seasons/catalog-theme-packs.ts) - Seasonal themes
- [LAP4_COMPLETE.md](../LAP4_COMPLETE.md) - LAP #4 summary

---

**Color system complete!** All components follow unified palette. ✅
