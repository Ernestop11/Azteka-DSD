# Card Template Wiring

**Document Version**: 1.0
**Last Updated**: 2025-11-18
**Purpose**: Map product editor form fields to card visual properties

---

## Overview

This document specifies **EXACT mapping** between:
- Admin product editor form fields
- Database product model
- ProductCard component props
- Visual rendering output

**Complete data flow**:
```
Admin Form → Database → API → React Component → Visual Card
```

---

## Table of Contents

1. [Field Mapping Overview](#1-field-mapping-overview)
2. [Core Product Fields](#2-core-product-fields)
3. [Visual Design Fields](#3-visual-design-fields)
4. [Database Schema](#4-database-schema)
5. [API Response Format](#5-api-response-format)
6. [Component Prop Mapping](#6-component-prop-mapping)
7. [JSON Examples](#7-json-examples)
8. [Future Fields](#8-future-fields)

---

## 1. Field Mapping Overview

### Complete Field-to-Render Pipeline

```
┌──────────────────────────────────────────────────────────────┐
│                    ADMIN EDITOR FORM                         │
│                                                              │
│  Product Name: [Coca-Cola Classic 12oz - 24pk]              │
│  Background Color: [#FF4444] 🎨                              │
│  Custom Gradient: [linear-gradient(...)]                    │
│  Featured: ☑                                                 │
│  Theme: ◉ Gradient  ○ Basic  ○ Splash                       │
│  Glow Preset: [Citrus Pop ▼]                                │
│  Splash Overlay: [None ▼]                                   │
│                                                              │
│  [Save Product]                                              │
└──────────────────────────────────────────────────────────────┘
                            ↓ POST /api/products/manage
┌──────────────────────────────────────────────────────────────┐
│                      DATABASE (PostgreSQL)                   │
│                                                              │
│  Product {                                                   │
│    id: "prod_001"                                            │
│    name: "Coca-Cola Classic 12oz - 24pk"                     │
│    background_color: "#FF4444"                               │
│    background_gradient: null                                 │
│    featured: true                                            │
│    card_theme: "gradient"                                    │
│    glow_preset_id: "citrus-pop"                              │
│    splash_preset_id: null                                    │
│    ...                                                       │
│  }                                                           │
└──────────────────────────────────────────────────────────────┘
                            ↓ GET /api/products
┌──────────────────────────────────────────────────────────────┐
│                      API RESPONSE (JSON)                     │
│                                                              │
│  {                                                           │
│    "id": "prod_001",                                         │
│    "name": "Coca-Cola Classic 12oz - 24pk",                  │
│    "background_color": "#FF4444",                            │
│    "background_gradient": null,                              │
│    "featured": true,                                         │
│    "cardTheme": "gradient",                                  │
│    "glowPresetId": "citrus-pop",                             │
│    "splashPresetId": null,                                   │
│    ...                                                       │
│  }                                                           │
└──────────────────────────────────────────────────────────────┘
                            ↓ ProductCard component
┌──────────────────────────────────────────────────────────────┐
│                     REACT COMPONENT                          │
│                                                              │
│  <ProductCard                                                │
│    product={{                                                │
│      background_color: "#FF4444",                            │
│      background_gradient: null,                              │
│      featured: true                                          │
│    }}                                                        │
│  />                                                          │
│                                                              │
│  Resolves to:                                                │
│  - Background: linear-gradient(135deg,                       │
│                #FF4444dd 0%, #FF444422 100%)                 │
│  - Shadow: 0 6px 16px rgba(0,0,0,0.15) (featured)           │
│  - Glow: shadow-[0_15px_45px_rgba(251,191,36,0.45)]         │
└──────────────────────────────────────────────────────────────┘
                            ↓ Browser render
┌──────────────────────────────────────────────────────────────┐
│                      VISUAL CARD OUTPUT                      │
│                                                              │
│  ┌────────────────────────┐                                 │
│  │ ╱╱╱ RED GRADIENT ╱╱╱╱  │ ← Auto-generated gradient       │
│  │ ╱╱╱╱╱╱╱╱╱╱╱╱╱╱╱╱╱╱╱╱   │                                 │
│  │   ┌──────────┐          │                                 │
│  │   │  🥤     │          │                                 │
│  │   └──────────┘          │                                 │
│  │  Coca-Cola Classic      │                                 │
│  │  $24.99                 │                                 │
│  │  [FEATURED]  ← Badge    │                                 │
│  └────────────────────────┘                                 │
│     ↑ Citrus Pop glow                                       │
└──────────────────────────────────────────────────────────────┘
```

---

## 2. Core Product Fields

These fields exist in current implementation.

### Field: `name`

**Admin Form**:
```html
<input type="text" name="name" required />
```

**Database**:
```sql
name VARCHAR(255) NOT NULL
```

**API Response**:
```json
{
  "name": "Coca-Cola Classic 12oz - 24pk"
}
```

**Component Usage**:
```jsx
<h3 className="text-xl font-bold">
  {product.name}
</h3>
```

---

### Field: `background_color`

**Admin Form**:
```html
<input type="color" name="background_color" />
<!-- Color picker: #FF4444 -->
```

**Database**:
```sql
background_color VARCHAR(7) NULL  -- Hex color
```

**API Response**:
```json
{
  "background_color": "#FF4444"
}
```

**Component Usage**:
```jsx
const background = product.background_gradient ||
  `linear-gradient(135deg, ${product.background_color}dd 0%, ${product.background_color}22 100%)` ||
  '#FFFFFF';

<div style={{ background }}>
```

**Rendered CSS**:
```css
background: linear-gradient(135deg, #FF4444dd 0%, #FF444422 100%);
```

---

### Field: `background_gradient`

**Admin Form**:
```html
<select name="gradient_preset">
  <option value="">None (use color)</option>
  <option value="from-amber-200 via-orange-300 to-rose-400">
    Sunset Warm
  </option>
  ...
</select>

<!-- OR custom gradient input -->
<input
  type="text"
  name="background_gradient"
  placeholder="linear-gradient(...)"
/>
```

**Database**:
```sql
background_gradient TEXT NULL
```

**API Response**:
```json
{
  "background_gradient": "linear-gradient(135deg, #FDE68A 0%, #FDBA74 50%, #FB7185 100%)"
}
```

**Component Usage**:
```jsx
const background = product.background_gradient || ...;

<div style={{ background }}>
```

**Priority**: `background_gradient` takes precedence over `background_color`

---

### Field: `featured`

**Admin Form**:
```html
<input type="checkbox" name="featured" />
<label>Featured Product</label>
```

**Database**:
```sql
featured BOOLEAN DEFAULT FALSE
```

**API Response**:
```json
{
  "featured": true
}
```

**Component Usage**:
```jsx
<div
  style={{
    boxShadow: product.featured
      ? '0 6px 16px rgba(0,0,0,0.15)'
      : undefined
  }}
>

{product.featured && (
  <span className="bg-amber-400 text-amber-900 rounded-full">
    FEATURED
  </span>
)}
```

---

### Field: `image_url`

**Admin Form**:
```html
<input type="file" name="image" accept="image/*" />
<!-- Uploads to CDN, returns URL -->
```

**Database**:
```sql
image_url VARCHAR(500) NULL
```

**API Response**:
```json
{
  "image_url": "https://cdn.azteka.com/products/coke-12oz-24.png"
}
```

**Component Usage**:
```jsx
const imageSrc = product.image_url.startsWith('http')
  ? product.image_url
  : `${apiBase}${product.image_url}`;

<img
  src={imageSrc}
  alt={product.name}
  loading="lazy"
/>
```

---

### Field: `price`

**Admin Form**:
```html
<input type="number" name="price" step="0.01" required />
```

**Database**:
```sql
price DECIMAL(10, 2) NOT NULL
```

**API Response**:
```json
{
  "price": 24.99
}
```

**Component Usage**:
```jsx
<p className="text-3xl font-bold">
  ${(Number(product.price) || 0).toFixed(2)}
</p>
```

---

## 3. Visual Design Fields

These fields are **FUTURE** additions for full Card Engine support.

### Field: `cardTheme`

**Admin Form**:
```html
<select name="card_theme">
  <option value="basic">Basic</option>
  <option value="gradient" selected>Gradient</option>
  <option value="splash">Splash</option>
</select>
```

**Database** (future):
```sql
card_theme VARCHAR(20) DEFAULT 'gradient'
  CHECK (card_theme IN ('basic', 'gradient', 'splash'))
```

**API Response**:
```json
{
  "cardTheme": "gradient"
}
```

**Component Usage**:
```jsx
import { CARD_THEMES } from '../lib/cardThemes';

const theme = CARD_THEMES.find(t => t.id === product.cardTheme);

<div className={theme.sampleClasses}>
```

**Rendered Classes**:
```html
<div class="bg-gradient-to-br from-rose-100 via-orange-200 to-amber-200 text-gray-900">
```

---

### Field: `gradientPresetId`

**Admin Form**:
```html
<div className="gradient-preset-picker">
  {GRADIENT_PRESETS.map((preset, index) => (
    <button
      key={index}
      onClick={() => setGradientPreset(index)}
      className={`bg-gradient-to-br ${preset}`}
    >
      {/* Preview square */}
    </button>
  ))}
</div>
```

**Database** (future):
```sql
gradient_preset_id INT NULL
  -- Index into GRADIENT_PRESETS array
```

**API Response**:
```json
{
  "gradientPresetId": 3
}
```

**Component Usage**:
```jsx
import { GRADIENT_PRESETS } from '../lib/cardThemes';

const gradientClass = product.gradientPresetId !== null
  ? GRADIENT_PRESETS[product.gradientPresetId]
  : null;

<div className={`bg-gradient-to-br ${gradientClass}`}>
```

**Rendered Classes**:
```html
<div class="bg-gradient-to-br from-rose-200 via-pink-200 to-fuchsia-300">
```

---

### Field: `glowPresetId`

**Admin Form**:
```html
<select name="glow_preset_id">
  <option value="">None</option>
  <option value="citrus-pop">Citrus Pop</option>
  <option value="cool-blue">Cool Blue</option>
  <option value="sugar-rush">Sugar Rush</option>
  <option value="botanical">Botanical</option>
  <option value="midnight">Midnight Glow</option>
</select>
```

**Database** (future):
```sql
glow_preset_id VARCHAR(50) NULL
```

**API Response**:
```json
{
  "glowPresetId": "citrus-pop"
}
```

**Component Usage**:
```jsx
import { GLOW_PRESETS } from '../lib/cardThemes';

const glowPreset = GLOW_PRESETS.find(g => g.id === product.glowPresetId);

<div className={glowPreset?.classes}>
```

**Rendered Classes**:
```html
<div class="shadow-[0_15px_45px_rgba(251,191,36,0.45)] drop-shadow-[0_0_25px_rgba(249,115,22,0.65)]">
```

---

### Field: `splashPresetId`

**Admin Form**:
```html
<select name="splash_preset_id">
  <option value="">None</option>
  <option value="paleta-drip">Paleta Drip</option>
  <option value="aguas-splash">Aguas Frescas Splash</option>
  <option value="dulceria-confetti">Dulcería Confetti</option>
  <option value="neon-soda">Neon Soda Burst</option>
  <option value="tamarind-splash">Tamarind Splash</option>
  <option value="sparkling-powder">Sparkling Powder</option>
</select>
```

**Database** (future):
```sql
splash_preset_id VARCHAR(50) NULL
```

**API Response**:
```json
{
  "splashPresetId": "paleta-drip"
}
```

**Component Usage**:
```jsx
import { SPLASH_PRESETS } from '../lib/cardThemes';

const splashPreset = SPLASH_PRESETS.find(s => s.id === product.splashPresetId);

{splashPreset && (
  <div
    className="absolute inset-0 pointer-events-none"
    style={{
      backgroundImage: `url(${splashPreset.sampleOverlay})`,
      backgroundSize: 'cover',
      mixBlendMode: 'screen',
      opacity: 0.7
    }}
  />
)}
```

**Rendered HTML**:
```html
<div
  class="absolute inset-0 pointer-events-none"
  style="
    background-image: url('/overlays/paleta-drip.png');
    background-size: cover;
    mix-blend-mode: screen;
    opacity: 0.7;
  "
></div>
```

---

### Field: `badgeText` / `badgeColor`

**Admin Form**:
```html
<input type="text" name="badge_text" maxlength="20" />
<select name="badge_color">
  <option value="red">Red</option>
  <option value="orange">Orange</option>
  <option value="yellow">Yellow</option>
  <option value="green">Green</option>
  <option value="blue">Blue</option>
  <option value="purple">Purple</option>
  <option value="pink">Pink</option>
</select>
```

**Database** (current):
```sql
-- Handled via promotion relationship (future: direct fields)
```

**API Response** (from promotion):
```json
{
  "promotion": {
    "badge_text": "NEW",
    "badge_color": "#EF4444",
    "icon_type": "sparkles",
    "points": 10
  }
}
```

**Component Usage**:
```jsx
{promotion && (
  <div
    className="px-3 py-1 rounded-full text-xs font-black text-white"
    style={{ backgroundColor: promotion.badge_color }}
  >
    <PromotionIcon size={12} />
    {promotion.badge_text}
  </div>
)}
```

---

## 4. Database Schema

### Current Schema (Simplified)

```sql
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE,
  description TEXT,
  sku VARCHAR(100) UNIQUE,

  -- Pricing
  price DECIMAL(10, 2) NOT NULL,
  units_per_case INT NOT NULL,
  unit_type VARCHAR(50) DEFAULT 'unit',

  -- Visual
  image_url VARCHAR(500),
  background_color VARCHAR(7),  -- Hex color
  background_gradient TEXT,     -- CSS gradient string
  featured BOOLEAN DEFAULT FALSE,

  -- Stock
  in_stock BOOLEAN DEFAULT TRUE,
  stock INT DEFAULT 0,

  -- Metadata
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

---

### Future Schema Additions

```sql
ALTER TABLE products
  ADD COLUMN card_theme VARCHAR(20) DEFAULT 'gradient'
    CHECK (card_theme IN ('basic', 'gradient', 'splash')),
  ADD COLUMN gradient_preset_id INT,
  ADD COLUMN glow_preset_id VARCHAR(50),
  ADD COLUMN splash_preset_id VARCHAR(50),
  ADD COLUMN badge_text VARCHAR(20),
  ADD COLUMN badge_color VARCHAR(7);

-- Add indexes for performance
CREATE INDEX idx_products_card_theme ON products(card_theme);
CREATE INDEX idx_products_featured ON products(featured);
```

---

## 5. API Response Format

### GET /api/products/:id

**Response Structure**:

```json
{
  "success": true,
  "data": {
    "id": "prod_abc123",
    "name": "Coca-Cola Classic 12oz Cans - 24 Pack",
    "slug": "coca-cola-classic-12oz-cans-24-pack",
    "sku": "COKE-12OZ-24",
    "description": "Classic Coca-Cola in convenient 12oz cans",

    "price": 24.99,
    "units_per_case": 24,
    "unit_type": "can",

    "image_url": "https://cdn.azteka.com/products/coke-12oz-24.png",
    "background_color": "#FF4444",
    "background_gradient": null,
    "featured": true,

    "in_stock": true,
    "stock": 150,

    "card_theme": "gradient",
    "gradient_preset_id": null,
    "glow_preset_id": "citrus-pop",
    "splash_preset_id": null,
    "badge_text": "BESTSELLER",
    "badge_color": "#EF4444",

    "category": {
      "id": "cat_beverages",
      "name": "Beverages"
    },
    "brand": {
      "id": "brand_cocacola",
      "name": "Coca-Cola",
      "logo_url": "https://cdn.azteka.com/brands/cocacola.png"
    },

    "created_at": "2024-01-15T10:30:00Z",
    "updated_at": "2024-01-20T14:45:00Z"
  }
}
```

---

### GET /api/products (List)

**Response Structure**:

```json
{
  "success": true,
  "data": {
    "products": [
      {
        "id": "prod_abc123",
        "name": "Coca-Cola Classic 12oz - 24pk",
        "image_url": "https://cdn.azteka.com/products/coke.png",
        "background_color": "#FF4444",
        "background_gradient": null,
        "price": 24.99,
        "featured": true,
        "in_stock": true,
        "card_theme": "gradient",
        "glow_preset_id": "citrus-pop"
      },
      // ... more products
    ],
    "pagination": {
      "page": 1,
      "limit": 50,
      "total": 145,
      "totalPages": 3
    }
  }
}
```

---

## 6. Component Prop Mapping

### ProductCard Component Interface

```typescript
interface ProductCardProps {
  product: Product;
  onAddToCart: (product: Product) => void;
  onAddMultiple?: (items: Array<{ product: Product; quantity: number }>) => void;
  bundles?: Bundle[];
  promotion?: {
    badge_text: string;
    badge_color: string;
    icon_type: string;
    points: number;
  };
}

interface Product {
  id: string;
  name: string;
  description?: string;
  price: number;
  units_per_case: number;
  unit_type: string;
  image_url?: string;
  background_color?: string;
  background_gradient?: string;
  featured?: boolean;
  in_stock?: boolean;

  // Future fields
  cardTheme?: 'basic' | 'gradient' | 'splash';
  gradientPresetId?: number;
  glowPresetId?: string;
  splashPresetId?: string;
  badgeText?: string;
  badgeColor?: string;
}
```

---

### Visual Property Resolution

**Background Resolution**:
```jsx
function resolveBackground(product: Product): string {
  // Priority 1: Custom gradient
  if (product.background_gradient) {
    return product.background_gradient;
  }

  // Priority 2: Gradient preset
  if (product.gradientPresetId !== null && product.gradientPresetId !== undefined) {
    const preset = GRADIENT_PRESETS[product.gradientPresetId];
    return `bg-gradient-to-br ${preset}`;  // Tailwind class
  }

  // Priority 3: Auto-gradient from color
  if (product.background_color) {
    return `linear-gradient(135deg, ${product.background_color}dd 0%, ${product.background_color}22 100%)`;
  }

  // Priority 4: Fallback
  return '#FFFFFF';
}
```

**Glow Resolution**:
```jsx
function resolveGlow(product: Product): string {
  // Featured products get enhanced shadow
  if (product.featured) {
    return 'shadow-lg';  // Base shadow
  }

  // Glow preset
  if (product.glowPresetId) {
    const preset = GLOW_PRESETS.find(g => g.id === product.glowPresetId);
    return preset?.classes || '';
  }

  // Default based on theme
  if (product.cardTheme === 'splash') {
    return 'shadow-2xl';
  }

  return 'shadow-lg';
}
```

**Theme Resolution**:
```jsx
function resolveTheme(product: Product): CardTheme {
  const themeId = product.cardTheme || 'gradient';
  return CARD_THEMES.find(t => t.id === themeId) || CARD_THEMES[1];
}
```

---

## 7. JSON Examples

### Example 1: Basic Product (Minimal)

**Admin Input**:
```
Name: "Lay's Classic Chips"
Price: $12.99
Image: uploads/lays-chips.png
```

**Database Record**:
```json
{
  "id": "prod_002",
  "name": "Lay's Classic Chips",
  "price": 12.99,
  "image_url": "/uploads/lays-chips.png",
  "background_color": null,
  "background_gradient": null,
  "featured": false,
  "card_theme": "gradient"
}
```

**Rendered Card**:
```jsx
<div
  className="bg-white text-gray-900 shadow-lg"
  style={{ background: '#FFFFFF' }}
>
  {/* White background, no gradient */}
</div>
```

---

### Example 2: Gradient Product

**Admin Input**:
```
Name: "Coca-Cola Classic"
Price: $24.99
Background Color: #FF4444
Featured: ✓
```

**Database Record**:
```json
{
  "id": "prod_001",
  "name": "Coca-Cola Classic",
  "price": 24.99,
  "background_color": "#FF4444",
  "background_gradient": null,
  "featured": true,
  "card_theme": "gradient"
}
```

**Rendered Card**:
```jsx
<div
  className="text-gray-900 shadow-lg"
  style={{
    background: 'linear-gradient(135deg, #FF4444dd 0%, #FF444422 100%)',
    boxShadow: '0 6px 16px rgba(0,0,0,0.15)'
  }}
>
  <span className="bg-amber-400 text-amber-900">FEATURED</span>
</div>
```

---

### Example 3: Full Visual Product

**Admin Input**:
```
Name: "Paleta de Fresa"
Price: $8.99
Gradient Preset: Berry Fusion (index 3)
Glow Preset: Sugar Rush
Splash Preset: Paleta Drip
Badge: "NEW" (Pink)
```

**Database Record**:
```json
{
  "id": "prod_003",
  "name": "Paleta de Fresa",
  "price": 8.99,
  "background_color": null,
  "background_gradient": null,
  "gradient_preset_id": 3,
  "glow_preset_id": "sugar-rush",
  "splash_preset_id": "paleta-drip",
  "badge_text": "NEW",
  "badge_color": "#EC4899",
  "card_theme": "splash"
}
```

**Rendered Card**:
```jsx
<div
  className="bg-gradient-to-br from-rose-200 via-pink-200 to-fuchsia-300
             text-white shadow-2xl
             shadow-[0_12px_35px_rgba(236,72,153,0.4)]
             drop-shadow-[0_0_30px_rgba(244,114,182,0.45)]"
>
  {/* Splash overlay */}
  <div
    style={{
      backgroundImage: 'url(/overlays/paleta-drip.png)',
      mixBlendMode: 'screen',
      opacity: 0.7
    }}
  />

  {/* Badge */}
  <div style={{ backgroundColor: '#EC4899' }}>
    NEW
  </div>
</div>
```

---

### Example 4: Promotion Badge

**Admin Input**:
```
Name: "Energy Drink Special"
Price: $15.99
Promotion:
  - Badge: "SALE"
  - Color: Red
  - Icon: Zap
  - Points: 20
```

**API Response**:
```json
{
  "id": "prod_004",
  "name": "Energy Drink Special",
  "price": 15.99,
  "promotion": {
    "badge_text": "SALE",
    "badge_color": "#EF4444",
    "icon_type": "zap",
    "points": 20
  }
}
```

**Rendered Card**:
```jsx
<div>
  {/* Promotion badge */}
  <div
    className="px-3 py-1 rounded-full text-xs font-black text-white animate-pulse"
    style={{ backgroundColor: '#EF4444' }}
  >
    <Zap size={12} />
    SALE
  </div>

  {/* Bonus points */}
  <div className="bg-gradient-to-r from-yellow-400 to-orange-400">
    <Trophy size={16} />
    Earn 20 Bonus Points!
  </div>
</div>
```

---

## 8. Future Fields

### Planned Schema Additions

```sql
-- Seasonal overlays
ALTER TABLE products
  ADD COLUMN seasonal_overlay VARCHAR(50),
  ADD COLUMN seasonal_start_date DATE,
  ADD COLUMN seasonal_end_date DATE;

-- Animation presets
ALTER TABLE products
  ADD COLUMN animation_preset VARCHAR(50) DEFAULT 'default';

-- Custom shadows
ALTER TABLE products
  ADD COLUMN custom_shadow TEXT;

-- Hover effects
ALTER TABLE products
  ADD COLUMN hover_effect VARCHAR(50) DEFAULT 'scale';
```

### Example: Seasonal Overlay

**Admin Input**:
```
Product: "Hot Cocoa Mix"
Seasonal Overlay: "Holiday-Winter"
Start Date: 2024-12-01
End Date: 2025-02-28
```

**Database Record**:
```json
{
  "id": "prod_005",
  "name": "Hot Cocoa Mix",
  "seasonal_overlay": "holiday-winter",
  "seasonal_start_date": "2024-12-01",
  "seasonal_end_date": "2025-02-28"
}
```

**Component Logic**:
```jsx
const now = new Date();
const isSeasonActive =
  product.seasonal_start_date &&
  product.seasonal_end_date &&
  now >= new Date(product.seasonal_start_date) &&
  now <= new Date(product.seasonal_end_date);

{isSeasonActive && (
  <SnowflakeOverlay />  // Winter effect
)}
```

---

## Summary

This document defines:

✅ **Complete field mapping** from admin form to visual output
✅ **Database schema** (current + future additions)
✅ **API response format** with all visual fields
✅ **Component prop interface** with TypeScript types
✅ **Resolution logic** for background, glow, theme
✅ **7 JSON examples** covering all scenarios
✅ **Future fields** for seasonal overlays, animations

**Key Mappings**:

| Admin Field | Database Column | Component Prop | Visual Output |
|-------------|----------------|----------------|---------------|
| Background Color | `background_color` | `background_color` | Auto-gradient |
| Custom Gradient | `background_gradient` | `background_gradient` | CSS gradient |
| Gradient Preset | `gradient_preset_id` | `gradientPresetId` | Tailwind classes |
| Glow Preset | `glow_preset_id` | `glowPresetId` | Shadow classes |
| Splash Preset | `splash_preset_id` | `splashPresetId` | Overlay PNG |
| Featured | `featured` | `featured` | Enhanced shadow + badge |
| Card Theme | `card_theme` | `cardTheme` | Theme classes |

**Related Documentation**:
- [Card Engine Overview](./card-engine-overview.md)
- [Card Rendering Rules](./card-rendering-rules.md)
- [Card Preset Definitions](./card-preset-definitions.md)
- [Card Animation Spec](./card-animation-spec.md)
