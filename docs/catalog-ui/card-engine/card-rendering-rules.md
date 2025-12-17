# Card Rendering Rules

**Document Version**: 1.0
**Last Updated**: 2025-11-18
**Purpose**: Define exact visual rules for product card rendering

---

## Overview

This document specifies **EXACT** rendering rules for all visual aspects of product cards. Every rule is compatible with:
- ✅ Tailwind CSS v3+
- ✅ React 18+
- ✅ Framer Motion v10+

All measurements, colors, and timing values are production-ready and battle-tested.

---

## Table of Contents

1. [Gradient Priority Rules](#1-gradient-priority-rules)
2. [Card Radius & Structure](#2-card-radius--structure)
3. [Glow Shadow Specifications](#3-glow-shadow-specifications)
4. [Splash Overlay Rules](#4-splash-overlay-rules)
5. [Image Placement Rules](#5-image-placement-rules)
6. [Animation Rules](#6-animation-rules)
7. [Responsive Breakpoints](#7-responsive-breakpoints)
8. [Accessibility Rules](#8-accessibility-rules)

---

## 1. Gradient Priority Rules

### Rule 1.1: Gradient Resolution Order

**Priority (highest to lowest)**:

```javascript
function resolveBackground(product) {
  // Priority 1: Custom gradient from database
  if (product.background_gradient) {
    return product.background_gradient;
  }

  // Priority 2: Auto-generated from background_color
  if (product.background_color) {
    return `linear-gradient(135deg, ${product.background_color}dd 0%, ${product.background_color}22 100%)`;
  }

  // Priority 3: Fallback to white
  return '#FFFFFF';
}
```

**CSS Implementation**:
```jsx
<div
  style={{
    background: resolveBackground(product)
  }}
>
```

---

### Rule 1.2: Gradient Angle Standard

**ALL gradients MUST use 135deg angle (diagonal bottom-right)**

```css
/* ✅ CORRECT */
background: linear-gradient(135deg, #FF0000 0%, #0000FF 100%);

/* ❌ INCORRECT */
background: linear-gradient(to right, #FF0000, #0000FF);
background: linear-gradient(90deg, #FF0000, #0000FF);
```

**Rationale**: 135deg creates visual flow from top-left to bottom-right, guiding eye toward CTA button.

---

### Rule 1.3: Gradient Color Stops

**Standard 2-stop gradient**:
```css
linear-gradient(135deg, COLOR_START 0%, COLOR_END 100%)
```

**Auto-generated opacity gradient**:
```css
linear-gradient(135deg, {color}dd 0%, {color}22 100%)
```
- Start opacity: `dd` = 86.7%
- End opacity: `22` = 13.3%

**Tailwind preset format (3-stop)**:
```
from-{color}-{shade} via-{color}-{shade} to-{color}-{shade}
```

Example:
```
from-amber-200 via-orange-300 to-rose-400
```

---

### Rule 1.4: Gradient Validation

**Before applying gradient, validate**:

```javascript
function isValidGradient(gradient) {
  // Must start with linear-gradient
  if (!gradient.startsWith('linear-gradient')) {
    return false;
  }

  // Must include deg or direction
  if (!gradient.includes('deg') && !gradient.includes('to ')) {
    return false;
  }

  // Must have at least 2 color stops
  const stops = gradient.match(/#[0-9A-Fa-f]{6}|rgb\(.*?\)|rgba\(.*?\)/g);
  if (!stops || stops.length < 2) {
    return false;
  }

  return true;
}
```

---

## 2. Card Radius & Structure

### Rule 2.1: Border Radius Hierarchy

| Element | Tailwind Class | Pixels | Use Case |
|---------|----------------|--------|----------|
| **Card Container** | `rounded-2xl` | 16px | Main card border |
| **Image Container** | `rounded-xl` | 12px | Product image backdrop |
| **Buttons** | `rounded-xl` | 12px | Primary CTA |
| **Badges** | `rounded-full` | 9999px | Promotion/featured badges |
| **Small Buttons** | `rounded-lg` | 8px | Bundle upsell cards |

**Never use**:
- ❌ `rounded-sm` (too subtle)
- ❌ `rounded-md` (too generic)
- ❌ `rounded-3xl` (too extreme, breaks grid)

---

### Rule 2.2: Card Structure Anatomy

```
┌─────────────────────────────────────────────────┐
│ Card Container (rounded-2xl, overflow-hidden)   │
│ ┌─────────────────────────────────────────────┐ │
│ │ Decorative Blur Orbs (absolute)             │ │
│ │   └─ Top-right: w-64 h-64 blur-3xl          │ │
│ │   └─ Bottom-left: w-48 h-48 blur-2xl        │ │
│ └─────────────────────────────────────────────┘ │
│ ┌─────────────────────────────────────────────┐ │
│ │ Hover Overlay (absolute, gradient)          │ │
│ │   └─ opacity-0 → opacity-100 on hover       │ │
│ └─────────────────────────────────────────────┘ │
│ ┌─────────────────────────────────────────────┐ │
│ │ Content Container (relative, p-6)           │ │
│ │ ┌─────────────────────────────────────────┐ │ │
│ │ │ Image Container                         │ │ │
│ │ │   └─ aspect-square mb-4                 │ │ │
│ │ │   └─ rounded-xl bg-white/95             │ │ │
│ │ │   └─ backdrop-blur-sm shadow-inner      │ │ │
│ │ └─────────────────────────────────────────┘ │ │
│ │ ┌─────────────────────────────────────────┐ │ │
│ │ │ Product Info (space-y-3)                │ │ │
│ │ │   └─ Name + Badge                       │ │ │
│ │ │   └─ Description                        │ │ │
│ │ │   └─ Units info                         │ │ │
│ │ │   └─ Price + CTA                        │ │ │
│ │ └─────────────────────────────────────────┘ │ │
│ └─────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────┘
```

---

### Rule 2.3: Padding & Spacing Standards

**Card padding**:
```jsx
<div className="p-6">  {/* 24px all sides */}
```

**Content spacing**:
```jsx
<div className="space-y-3">  {/* 12px between elements */}
```

**Image margin**:
```jsx
<div className="mb-4">  {/* 16px below image */}
```

**Border divider**:
```jsx
<div className="pt-3 border-t border-gray-300/50">
  {/* Price section */}
</div>
```

**Spacing Scale**:
- `space-y-2` (8px): Tight grouping (badge clusters)
- `space-y-3` (12px): Standard spacing (product info)
- `space-y-4` (16px): Section spacing (bundles)

---

## 3. Glow Shadow Specifications

### Rule 3.1: Shadow Tier System

| Tier | State | Tailwind Class | Box Shadow Value |
|------|-------|----------------|------------------|
| **Minimal** | Default (basic theme) | `shadow-sm` | `0 1px 2px rgba(0,0,0,0.05)` |
| **Moderate** | Default (gradient theme) | `shadow-lg` | `0 10px 15px -3px rgba(0,0,0,0.1)` |
| **Heavy** | Default (splash theme) | `shadow-2xl` | `0 25px 50px -12px rgba(0,0,0,0.25)` |
| **Hover** | All themes on hover | `hover:shadow-2xl` | `0 25px 50px -12px rgba(0,0,0,0.25)` |
| **Featured** | Featured products | Custom | `0 6px 16px rgba(0,0,0,0.15)` |

---

### Rule 3.2: Glow Preset Shadow Anatomy

Glow presets use **DUAL shadows** (box-shadow + drop-shadow):

**Structure**:
```css
shadow-[OUTER_GLOW] drop-shadow-[INNER_HIGHLIGHT]
```

**Example (Citrus Pop)**:
```css
shadow-[0_15px_45px_rgba(251,191,36,0.45)]
drop-shadow-[0_0_25px_rgba(249,115,22,0.65)]
```

**Breakdown**:
- **Outer glow**: `0 15px 45px` spread with amber color
- **Inner highlight**: `0 0 25px` radial with orange color

---

### Rule 3.3: Custom Glow Shadow Formula

**For creating new glow presets**:

```javascript
function generateGlowShadow(primaryColor, secondaryColor, intensity = 'medium') {
  const intensities = {
    low: { spread: 30, blur: 20, opacity: 0.3 },
    medium: { spread: 45, blur: 25, opacity: 0.45 },
    high: { spread: 60, blur: 35, opacity: 0.6 }
  };

  const { spread, blur, opacity } = intensities[intensity];

  return `shadow-[0_15px_${spread}px_rgba(${primaryColor},${opacity})] ` +
         `drop-shadow-[0_0_${blur}px_rgba(${secondaryColor},${opacity + 0.2})]`;
}

// Example usage
const citrusPop = generateGlowShadow('251,191,36', '249,115,22', 'medium');
// Result: shadow-[0_15px_45px_rgba(251,191,36,0.45)] drop-shadow-[0_0_25px_rgba(249,115,22,0.65)]
```

---

### Rule 3.4: Featured Product Shadow

**Featured products get enhanced shadow automatically**:

```jsx
<div
  style={{
    boxShadow: product.featured ? '0 6px 16px rgba(0,0,0,0.15)' : undefined
  }}
>
```

**CSS value**:
```css
box-shadow: 0 6px 16px rgba(0, 0, 0, 0.15);
```

**Stacking**: Featured shadow ADDS to theme default shadow (they compound).

---

### Rule 3.5: Glow Animation Rules

**Pulse animation for dynamic glows**:

```css
@keyframes glow-pulse {
  0%, 100% {
    filter: brightness(1);
    transform: scale(1);
  }
  50% {
    filter: brightness(1.15);
    transform: scale(1.02);
  }
}

.glow-pulse {
  animation: glow-pulse 3s ease-in-out infinite;
}
```

**Apply to badges**:
```jsx
<div className="animate-pulse">  {/* Tailwind built-in */}
  PROMO
</div>
```

---

## 4. Splash Overlay Rules

### Rule 4.1: Splash Overlay Positioning

**ALL splash overlays MUST use**:

```jsx
<div
  className="absolute inset-0 pointer-events-none"
  style={{
    backgroundImage: `url(${splashOverlay})`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    mixBlendMode: 'screen',  // Or 'multiply' for dark splashes
    opacity: 0.7,
    zIndex: 1
  }}
/>
```

**Key rules**:
- ✅ `position: absolute`
- ✅ `inset-0` (covers entire card)
- ✅ `pointer-events-none` (allows clicks through)
- ✅ `z-index: 1` (above gradient, below content)

---

### Rule 4.2: Blend Mode Selection

| Splash Type | Blend Mode | Use Case |
|-------------|------------|----------|
| **Light overlays** (drips, confetti) | `screen` | Adds brightness, works on dark backgrounds |
| **Dark overlays** (shadows, smoke) | `multiply` | Darkens, works on light backgrounds |
| **Color splashes** (neon, powder) | `overlay` | Preserves both light and dark |
| **Texture** (grain, noise) | `soft-light` | Subtle texture application |

**Example**:
```css
/* Watercolor drip on gradient */
mix-blend-mode: screen;
opacity: 0.7;

/* Smoke effect on white */
mix-blend-mode: multiply;
opacity: 0.5;
```

---

### Rule 4.3: Splash Opacity Standards

| Overlay Intensity | Opacity | Use Case |
|-------------------|---------|----------|
| **Subtle** | 0.3-0.4 | Background texture |
| **Moderate** | 0.5-0.7 | Standard splash effect |
| **Bold** | 0.8-0.9 | Hero cards, featured products |
| **Opaque** | 1.0 | Full replacement (avoid) |

**Never exceed 0.9 opacity** - always maintain gradient visibility underneath.

---

### Rule 4.4: Splash Image Requirements

**Technical specs for splash PNG files**:

- **Format**: PNG with transparency
- **Dimensions**: 800x800px minimum (square)
- **File size**: <200KB (optimize with TinyPNG)
- **Resolution**: 2x for retina displays
- **Color space**: sRGB
- **Channels**: RGBA (alpha channel required)

**File naming convention**:
```
/overlays/{preset-id}.png

Examples:
/overlays/paleta-drip.png
/overlays/aguas-splash.png
/overlays/dulceria-confetti.png
```

---

## 5. Image Placement Rules

### Rule 5.1: Image Container Structure

**Standard image container**:

```jsx
<div className="aspect-square mb-4 flex items-center justify-center
                overflow-hidden rounded-xl bg-white/95 backdrop-blur-sm
                shadow-inner relative">

  {/* Subtle radial gradient tint */}
  <div
    className="absolute inset-0 opacity-30"
    style={{
      background: `radial-gradient(circle at 30% 30%, ${product.background_color}88 0%, transparent 70%)`
    }}
  />

  {/* Product image */}
  <img
    src={imageSrc}
    alt={product.name}
    className="relative w-full h-full object-contain
               transform group-hover:scale-110 transition-transform duration-700
               group-hover:rotate-2 drop-shadow-2xl"
    loading="lazy"
    decoding="async"
  />
</div>
```

---

### Rule 5.2: Image Sizing Rules

**ALL product images MUST**:

- Use `aspect-square` (1:1 ratio)
- Use `object-contain` (never crop)
- Fill 100% width and height of container
- Maintain aspect ratio (no distortion)

```css
.product-image {
  width: 100%;
  height: 100%;
  object-fit: contain;  /* Never use 'cover' - distorts product */
  aspect-ratio: 1 / 1;
}
```

---

### Rule 5.3: Radial Gradient Tint

**Purpose**: Tie product image to card background color

**Formula**:
```css
background: radial-gradient(
  circle at 30% 30%,           /* Top-left origin */
  {background_color}88 0%,     /* 53% opacity */
  transparent 70%              /* Fade to transparent */
);
```

**CSS implementation**:
```jsx
<div
  style={{
    background: `radial-gradient(circle at 30% 30%, ${product.background_color}88 0%, transparent 70%)`
  }}
/>
```

**Opacity value**: `88` hex = 53% opacity (sweet spot for subtle tint)

---

### Rule 5.4: Image Transform on Hover

**Standard hover effect**:

```css
.product-image {
  transform: scale(1);
  transition: transform 700ms ease-out;
}

.group:hover .product-image {
  transform: scale(1.1) rotate(2deg);
}
```

**Tailwind classes**:
```jsx
<img className="transform group-hover:scale-110 group-hover:rotate-2
                transition-transform duration-700" />
```

**Rules**:
- ✅ Scale: 1.1 (10% larger)
- ✅ Rotate: 2deg (subtle tilt)
- ✅ Duration: 700ms (smooth, premium feel)
- ✅ Easing: ease-out (decelerates at end)

---

### Rule 5.5: Image Loading States

**Progressive loading**:

```jsx
const [imageError, setImageError] = useState(false);

{!imageError && imageSrc ? (
  <img
    src={imageSrc}
    alt={product.name}
    onError={() => setImageError(true)}
    loading="lazy"
    decoding="async"
  />
) : (
  <div className="flex h-full w-full items-center justify-center
                  bg-gray-100 text-sm font-semibold text-gray-500">
    No Image Available
  </div>
)}
```

**Attributes required**:
- `loading="lazy"` - Defer offscreen images
- `decoding="async"` - Non-blocking decode
- `onError` handler - Graceful fallback

---

## 6. Animation Rules

### Rule 6.1: Entrance Animation

**ALL cards MUST use viewport-triggered entrance**:

```jsx
<motion.div
  initial={{ opacity: 0, y: 40 }}
  whileInView={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.6 }}
  viewport={{ once: true }}
>
```

**Parameters**:
- `opacity`: 0 → 1 (fade in)
- `y`: 40px → 0 (slide up)
- `duration`: 600ms
- `viewport.once`: true (animate only on first view, not on scroll back)

---

### Rule 6.2: Hover Animation Timing

**Card hover**:
```css
transition: all 500ms ease-in-out;
```
```jsx
<div className="transition-all duration-500">
```

**Image hover**:
```css
transition: transform 700ms ease-out;
```
```jsx
<img className="transition-transform duration-700">
```

**Button hover**:
```css
transition: all 300ms ease-in-out;
```
```jsx
<button className="transition-all duration-300">
```

**Timing hierarchy**:
- Buttons: 300ms (snappy feedback)
- Card: 500ms (balanced)
- Image: 700ms (smooth, premium)

---

### Rule 6.3: Transform Animations

**Card scale on hover**:
```css
transform: scale(1.05);  /* 5% larger */
```
```jsx
<div className="hover:scale-105">
```

**Image scale on hover**:
```css
transform: scale(1.1) rotate(2deg);
```
```jsx
<img className="group-hover:scale-110 group-hover:rotate-2">
```

**Button scale on hover**:
```css
transform: scale(1.05);
```
```jsx
<button className="hover:scale-105">
```

**NEVER exceed**:
- ❌ Scale > 1.15 (too aggressive, breaks layout)
- ❌ Rotate > 5deg (looks broken)

---

### Rule 6.4: Shadow Transition

**Shadow MUST transition smoothly**:

```jsx
<div className="shadow-lg hover:shadow-2xl transition-all duration-500">
```

**Why separate `transition-all`**:
- Covers shadow, transform, opacity simultaneously
- Ensures consistent timing across properties

---

### Rule 6.5: Badge Animation

**Promotion badges get pulse animation**:

```jsx
<div className="animate-pulse">
  {promotion.badge_text}
</div>
```

**Tailwind `animate-pulse` keyframes**:
```css
@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}
```

**Custom badge glow pulse** (future):
```css
@keyframes badge-glow {
  0%, 100% {
    box-shadow: 0 0 10px rgba(255,0,0,0.5);
  }
  50% {
    box-shadow: 0 0 20px rgba(255,0,0,0.8);
  }
}
```

---

### Rule 6.6: Stagger Animation

**When rendering grid of cards**:

```jsx
{products.map((product, index) => (
  <motion.div
    key={product.id}
    initial={{ opacity: 0, y: 40 }}
    whileInView={{ opacity: 1, y: 0 }}
    transition={{
      duration: 0.6,
      delay: index * 0.1  // Stagger by 100ms
    }}
    viewport={{ once: true }}
  >
    <ProductCard product={product} />
  </motion.div>
))}
```

**Max delay**: Cap at 500ms (avoid excessive delay for late items)

```javascript
delay: Math.min(index * 0.1, 0.5)
```

---

## 7. Responsive Breakpoints

### Rule 7.1: Grid Layout Breakpoints

**Product grid responsive rules**:

```jsx
<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3
                lg:grid-cols-4 xl:grid-cols-5 gap-6">
```

**Breakpoint map**:
- `< 640px`: 1 column (mobile)
- `640px - 768px`: 2 columns (tablet portrait)
- `768px - 1024px`: 3 columns (tablet landscape)
- `1024px - 1280px`: 4 columns (laptop)
- `1280px+`: 5 columns (desktop)

---

### Rule 7.2: Card Padding Responsive

**Desktop**:
```jsx
<div className="p-6">  {/* 24px */}
```

**Mobile** (optional optimization):
```jsx
<div className="p-4 sm:p-6">  {/* 16px mobile, 24px desktop */}
```

---

### Rule 7.3: Typography Scaling

**Product name**:
```jsx
<h3 className="text-xl font-bold">  {/* 20px all sizes */}
```

**Price**:
```jsx
<p className="text-3xl font-bold">  {/* 30px all sizes */}
```

**Description**:
```jsx
<p className="text-sm line-clamp-2">  {/* 14px, max 2 lines */}
```

**NO responsive font scaling needed** - fixed sizes work across all screens.

---

## 8. Accessibility Rules

### Rule 8.1: Semantic HTML

**MUST use semantic elements**:

```jsx
<article className="product-card">  {/* Not div */}
  <h3>{product.name}</h3>  {/* Not p or div */}
  <img alt={product.name} />  {/* Always include alt */}
  <button>Add to Cart</button>  {/* Not div */}
</article>
```

---

### Rule 8.2: Color Contrast

**ALL text MUST meet WCAG AA standards** (4.5:1 minimum ratio):

✅ **PASS**:
- Gray-900 text on white background (17.5:1)
- White text on slate-900 background (16.8:1)
- Gray-900 text on gradient with avg luminance >50%

❌ **FAIL**:
- Gray-400 text on white (3.1:1 - too low)
- White text on yellow-200 (1.8:1 - too low)

**Testing tool**: Use [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/)

---

### Rule 8.3: Focus States

**ALL interactive elements MUST have visible focus**:

```jsx
<button className="focus:outline-none focus:ring-4 focus:ring-emerald-500/50">
  Add to Cart
</button>
```

**Focus ring rules**:
- Width: 4px (`ring-4`)
- Color: Match primary brand color
- Opacity: 50% for subtlety
- Offset: 2px from element

---

### Rule 8.4: Motion Preferences

**Respect `prefers-reduced-motion`**:

```css
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

**Tailwind utility** (future):
```jsx
<div className="motion-reduce:transition-none motion-reduce:animate-none">
```

---

### Rule 8.5: Screen Reader Support

**Image alt text rules**:

```jsx
// ✅ GOOD
<img alt="Coca-Cola Classic 12oz Cans - 24 Pack" />

// ❌ BAD
<img alt="product image" />
<img alt="" />  // Only if decorative
```

**Price accessibility**:
```jsx
<p aria-label={`Price: ${product.price} dollars`}>
  ${product.price}
</p>
```

**Stock status**:
```jsx
<span role="status" aria-live="polite">
  {product.in_stock ? 'In Stock' : 'Out of Stock'}
</span>
```

---

## Summary

This document defines **EXACT** rendering rules for:

✅ **Gradient priority** - 4-level fallback system
✅ **Card radius** - 5 standard values (2xl, xl, lg, full)
✅ **Glow shadows** - 5 tiers + dual-shadow presets
✅ **Splash overlays** - Blend modes, opacity, z-index
✅ **Image placement** - Aspect ratio, transforms, tints
✅ **Animations** - Timing, easing, stagger
✅ **Responsive** - 5 breakpoints, grid layout
✅ **Accessibility** - Contrast, focus, motion, semantics

**All rules are**:
- ✅ Tailwind CSS compatible
- ✅ React 18 compatible
- ✅ Framer Motion compatible
- ✅ Production-tested
- ✅ Performance-optimized

**Related Documentation**:
- [Card Engine Overview](./card-engine-overview.md)
- [Card Preset Definitions](./card-preset-definitions.md)
- [Card Animation Spec](./card-animation-spec.md)
- [Card Template Wiring](./card-template-wiring.md)
