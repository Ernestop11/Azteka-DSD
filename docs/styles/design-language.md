# Azteka DSD - Design Language System
## Version 3 Catalog Upgrade Specification

> This document defines the visual design language for the Azteka DSD catalog, inspired by Macy's holiday catalogs, Amazon's efficiency, and Bolt's modern aesthetics. This will guide the future V3 catalog redesign.

---

## 1. Color Palette

### Primary Brand Colors (Catalog Core)

#### Emerald Green (Trust & Growth)
The foundation of the Azteka brand - represents freshness, reliability, and wholesale value.

```css
/* Emerald Spectrum */
emerald-50:  #ecfdf5  /* Ultra light - section backgrounds */
emerald-100: #d1fae5  /* Light - hover states */
emerald-200: #a7f3d0  /* Soft - badges */
emerald-300: #6ee7b7  /* Medium light */
emerald-400: #34d399  /* Medium */
emerald-500: #10b981  /* PRIMARY - Main brand color */
emerald-600: #059669  /* Dark - CTA hover */
emerald-700: #047857  /* Very dark - text on light */
emerald-800: #065f46  /* Ultra dark */
emerald-900: #064e3b  /* Almost black - headings */
```

**Usage**:
- Primary CTAs: `from-emerald-500 to-teal-600`
- Section backgrounds: `bg-emerald-50`
- Success indicators: `bg-emerald-100 text-emerald-800`
- Active states: `bg-emerald-600`

---

#### Teal (Accent & Energy)
Complements emerald, adds vibrancy and modern feel.

```css
/* Teal Spectrum */
teal-50:  #f0fdfa  /* Lightest - subtle backgrounds */
teal-100: #ccfbf1  /* Very light */
teal-200: #99f6e4  /* Light */
teal-300: #5eead4  /* Medium light */
teal-400: #2dd4bf  /* Medium */
teal-500: #14b8a6  /* Accent color */
teal-600: #0d9488  /* PRIMARY GRADIENT PAIR */
teal-700: #0f766e  /* Dark */
teal-800: #115e59  /* Very dark */
teal-900: #134e4a  /* Almost black */
```

**Usage**:
- Gradient endings: `to-teal-600`
- Accent elements: `bg-teal-500`
- Links and interactive elements: `text-teal-600`

---

### Holiday/Macy's-Inspired Promo Colors

#### Warm Sunset (Festive & Urgent)
Evokes holiday warmth, limited-time offers, celebration.

```css
/* Orange/Red Holiday Gradient */
orange-400: #fb923c  /* Warm glow */
orange-500: #f97316  /* PRIMARY PROMO */
orange-600: #ea580c  /* Deeper */

red-400:    #f87171  /* Soft red */
red-500:    #ef4444  /* ALERT RED */
red-600:    #dc2626  /* Deep red */

/* Signature Holiday Hero Gradient */
from-orange-500 via-red-500 to-pink-600
```

**Usage**:
- Hero sections: Full gradient background
- Discount badges: `bg-red-500 text-white`
- Urgency indicators: `bg-orange-500`
- Seasonal promotions: Gradient overlays

---

#### Golden Yellow (Celebration & Value)
Represents deals, savings, and joyful shopping.

```css
/* Yellow/Gold Spectrum */
yellow-200: #fef08a  /* Soft highlights */
yellow-300: #fde047  /* Light gold */
yellow-400: #facc15  /* PRIMARY GOLD */
yellow-500: #eab308  /* Rich gold */
yellow-600: #ca8a04  /* Deep gold */

/* Gold Gradient (for badges) */
from-yellow-400 to-orange-500
```

**Usage**:
- "FEATURED" badges: `bg-yellow-400 text-yellow-900`
- Savings callouts: `text-yellow-500`
- Decorative blobs: `bg-yellow-400 animate-blob`
- Price highlights: `bg-yellow-100 border-yellow-400`

---

#### Pink/Rose (Warmth & Playfulness)
Adds softness, approachability, and holiday cheer.

```css
/* Pink Spectrum */
pink-200: #fbcfe8  /* Very soft */
pink-300: #f9a8d4  /* Soft - blobs */
pink-400: #f472b6  /* Medium - animated elements */
pink-500: #ec4899  /* PRIMARY PINK */
pink-600: #db2777  /* Deep pink - accents */

/* Pink Gradient (rewards/special) */
from-purple-500 to-pink-500
```

**Usage**:
- Background decorative blobs: `bg-pink-400 animate-blob`
- Seasonal overlays: `bg-pink-300 opacity-20`
- Rewards UI: Gradient backgrounds
- Hero gradients: `to-pink-600`

---

### Accent Colors

#### Purple/Indigo (Premium & Admin)
Sophisticated, professional, exclusive features.

```css
/* Purple Spectrum */
purple-400: #c084fc  /* Light */
purple-500: #a855f7  /* PRIMARY */
purple-600: #9333ea  /* Deep */

/* Indigo Spectrum */
indigo-500: #6366f1  /* Primary */
indigo-600: #4f46e5  /* ADMIN GRADIENT */

/* Premium Gradient */
from-purple-600 to-indigo-600
```

**Usage**:
- Admin features: Full gradient
- Premium badges: `bg-purple-500`
- Loyalty/rewards: `from-purple-500 to-pink-500`
- VIP sections: Purple tinted backgrounds

---

#### Cyan/Blue (Information & Actions)
Clean, trustworthy, actionable.

```css
/* Cyan Spectrum */
cyan-400: #22d3ee  /* Light */
cyan-500: #06b6d4  /* PRIMARY */
cyan-600: #0891b2  /* Deep */

/* Blue Spectrum */
blue-400: #60a5fa  /* Light */
blue-500: #3b82f6  /* PRIMARY */
blue-600: #2563eb  /* Deep */

/* Action Gradient */
from-cyan-500 to-blue-500
```

**Usage**:
- Informational sections: `bg-blue-100`
- Secondary CTAs: Blue gradient
- Sales rep features: Cyan/blue
- Trust badges: `bg-cyan-500`

---

### Neutral Grays (Foundation)

```css
/* Gray Spectrum - Carefully calibrated */
gray-50:  #f9fafb  /* PAGE BACKGROUND - warm white */
gray-100: #f3f4f6  /* Card backgrounds */
gray-200: #e5e7eb  /* Borders */
gray-300: #d1d5db  /* Dividers */
gray-400: #9ca3af  /* Disabled text */
gray-500: #6b7280  /* Placeholder text */
gray-600: #4b5563  /* SECONDARY TEXT */
gray-700: #374151  /* BODY TEXT */
gray-800: #1f2937  /* Dark headings */
gray-900: #111827  /* PRIMARY HEADINGS */

white:    #ffffff  /* Cards, modals, highlights */
black:    #000000  /* Overlays (with opacity) */
```

**Usage**:
- Page background: `bg-gray-50`
- Card backgrounds: `bg-white` or `bg-gray-100`
- Text hierarchy:
  - Headings: `text-gray-900`
  - Body: `text-gray-700`
  - Secondary: `text-gray-600`
  - Disabled: `text-gray-400`
- Borders: `border-gray-200`

---

## 2. Typography Scale

### System Font Stack

```css
font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont,
             "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
```

**Rationale**: Zero latency, native feel, excellent rendering across all devices.

---

### Banner Headlines (Hero Sections)

#### Mega Hero (Homepage)
```css
text-5xl md:text-6xl lg:text-7xl
font-black
leading-tight
text-white or text-gray-900

/* Mobile:  3rem  / 48px */
/* Tablet:  3.75rem / 60px */
/* Desktop: 4.5rem / 72px */
```

**Example**:
```tsx
<h1 className="text-5xl md:text-6xl font-black leading-tight text-white">
  Stock Your Store
  <span className="block bg-gradient-to-r from-yellow-300 to-pink-200 bg-clip-text text-transparent">
    With Bestsellers
  </span>
</h1>
```

**Usage**: Homepage hero, major seasonal campaigns

---

#### Standard Hero
```css
text-4xl md:text-5xl
font-black
leading-tight

/* Mobile:  2.25rem / 36px */
/* Desktop: 3rem    / 48px */
```

**Example**: Category landing heroes, promotional sections

---

### Section Headers

#### Primary Section Header
```css
text-4xl
font-black
text-gray-900
mb-2

/* 2.25rem / 36px */
```

**Example**:
```tsx
<h2 className="text-4xl font-black text-gray-900 mb-2 flex items-center gap-3">
  <Star className="text-yellow-500 fill-yellow-500" size={36} />
  Featured Products
</h2>
```

**Usage**: Main section dividers ("Special Offers", "New Arrivals", "Best Sellers")

---

#### Secondary Section Header
```css
text-3xl
font-bold
text-gray-900
mb-4

/* 1.875rem / 30px */
```

**Usage**: Subsections within main sections

---

### Product Card Titles

#### Large Product Card (Featured)
```css
text-4xl
font-black
text-gray-900
leading-tight

/* 2.25rem / 36px */
```

**Usage**: Hero product cards, billboard features

---

#### Standard Product Card
```css
text-xl or text-lg
font-bold or font-semibold
text-gray-900

/* XL: 1.25rem / 20px */
/* LG: 1.125rem / 18px */
```

**Example**:
```tsx
<h3 className="text-xl font-bold text-gray-900 mb-1">
  Salsa Verde Herdez
</h3>
```

**Usage**: Grid product cards, search results

---

#### Compact Product Title
```css
text-base
font-semibold
text-gray-900

/* 1rem / 16px */
```

**Usage**: List views, mobile optimized cards

---

### Promo Captions & Badges

#### Large Promo Text (Hero overlays)
```css
text-2xl
font-black
text-white

/* 1.5rem / 24px */
```

**Example**: Overlay text on hero images, large discount callouts

---

#### Standard Badge Text
```css
text-sm
font-black
text-white or contrasting color

/* 0.875rem / 14px */
```

**Example**:
```tsx
<div className="px-4 py-2 bg-yellow-400 text-yellow-900 rounded-full font-black text-sm">
  FEATURED
</div>
```

---

#### Small Badge/Pill
```css
text-xs
font-bold
uppercase
tracking-wide

/* 0.75rem / 12px */
```

**Example**: "NEW", "SALE", "LIMITED", countdown timers

---

### UI Micro Text

#### Helper/Meta Text
```css
text-sm
font-normal or font-medium
text-gray-600

/* 0.875rem / 14px */
```

**Usage**: SKU numbers, "In Stock", shipping info, form labels

---

#### Fine Print
```css
text-xs
font-normal
text-gray-500

/* 0.75rem / 12px */
```

**Usage**: Timestamps, legal text, tooltips, image captions

---

### Price Typography

#### Featured Price (Billboard)
```css
text-5xl
font-black
text-gray-900

/* 3rem / 48px */
```

**Example**: Large featured product prices

---

#### Standard Price (Product Cards)
```css
text-2xl
font-black
text-gray-900

/* 1.5rem / 24px */
```

**Example**:
```tsx
<span className="text-2xl font-black text-gray-900">
  ${price.toFixed(2)}
</span>
<span className="text-sm text-gray-600">/case</span>
```

---

#### Compact Price
```css
text-lg
font-bold
text-gray-900

/* 1.125rem / 18px */
```

**Usage**: List views, comparison tables

---

## 3. Spacing & Layout System

### Tailwind Spacing Reference

```css
/* Spacing Scale (rem / px) */
0:   0rem    / 0px
1:   0.25rem / 4px
2:   0.5rem  / 8px
3:   0.75rem / 12px
4:   1rem    / 16px
5:   1.25rem / 20px
6:   1.5rem  / 24px
8:   2rem    / 32px
10:  2.5rem  / 40px
12:  3rem    / 48px
16:  4rem    / 64px
20:  5rem    / 80px
24:  6rem    / 96px
32:  8rem    / 128px
```

---

### Large Promo Sections

#### Hero Section Padding
```css
/* Vertical padding */
py-16  /* 4rem  / 64px  - Mobile */
py-20  /* 5rem  / 80px  - Tablet */
py-24  /* 6rem  / 96px  - Desktop */
py-32  /* 8rem  / 128px - Extra large heroes */

/* Horizontal padding */
px-4   /* 1rem / 16px - Mobile */
px-6   /* 1.5rem / 24px - Tablet */
px-8   /* 2rem / 32px - Desktop */
```

**Example**:
```tsx
<section className="relative overflow-hidden py-16 md:py-20 lg:py-24">
  <div className="max-w-7xl mx-auto px-4 md:px-6">
    {/* Hero Content */}
  </div>
</section>
```

---

#### Section Spacing (Between Major Blocks)
```css
mb-16  /* 4rem / 64px  - Standard section gap */
mb-20  /* 5rem / 80px  - Large section gap */
mb-24  /* 6rem / 96px  - Extra large gap */
```

**Usage**:
- Between hero and first content: `mb-16`
- Between major sections: `mb-16` or `mb-20`
- Before footer: `mb-24`

---

#### Promo Block Internal Padding
```css
p-6   /* 1.5rem / 24px - Small promo cards */
p-8   /* 2rem   / 32px - Medium promo blocks */
p-10  /* 2.5rem / 40px - Large featured blocks */
p-12  /* 3rem   / 48px - Hero promo sections */
```

---

### Card Minimum Sizes

#### Small Product Card
```css
/* Minimum dimensions */
min-w-[240px]  /* 15rem / 240px */
min-h-[320px]  /* 20rem / 320px */

/* Standard padding */
p-4  /* 1rem / 16px */
```

**Usage**: Grid cards, quick-add products

---

#### Medium Product Card
```css
/* Minimum dimensions */
min-w-[280px]  /* 17.5rem / 280px */
min-h-[400px]  /* 25rem / 400px */

/* Standard padding */
p-6  /* 1.5rem / 24px */
```

**Usage**: Standard catalog cards

---

#### Large Featured Card (Billboard)
```css
/* Minimum dimensions */
min-h-[400px]  /* 25rem / 400px */
min-h-[500px]  /* 31.25rem / 500px - desktop */

/* Standard padding */
p-8  /* 2rem / 32px */
```

**Usage**: Hero product features, promotional showcases

---

#### Promo Card/Offer Card
```css
/* Fixed aspect ratio preferred */
aspect-square  /* 1:1 */
aspect-video   /* 16:9 */

/* Or minimum height */
min-h-[200px]  /* Compact offer */
min-h-[280px]  /* Standard offer */
```

---

### Hero Height Scales

#### Compact Hero (Mobile)
```css
min-h-[300px]  /* 18.75rem / 300px */
```

---

#### Standard Hero (Tablet/Desktop)
```css
min-h-[400px]  /* 25rem / 400px */
min-h-[500px]  /* 31.25rem / 500px - preferred */
```

**Example**:
```tsx
<section className="min-h-[300px] md:min-h-[500px]">
```

---

#### Large Hero (Homepage)
```css
min-h-[600px]  /* 37.5rem / 600px */
min-h-screen   /* 100vh - full viewport */
```

**Usage**: Major campaign launches, seasonal homepages

---

### Grid Rules

#### Product Grid (Responsive Columns)
```css
/* Standard responsive grid */
grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4
gap-4 md:gap-6

/* Mobile:  1 column, 1rem gap */
/* Tablet:  2 columns, 1.5rem gap */
/* Desktop: 3 columns, 1.5rem gap */
/* XL:      4 columns, 1.5rem gap */
```

---

#### Promo Grid (Asymmetric)
```css
/* Featured + Grid */
grid md:grid-cols-2 gap-6

/* Left: Large featured card */
/* Right: 3 smaller cards in rows */
<div className="grid grid-rows-3 gap-6">
```

**Example**: ProductBillboard component layout

---

#### Offer Cards Grid
```css
grid md:grid-cols-2 lg:grid-cols-4 gap-4

/* Tablet:  2 columns */
/* Desktop: 4 columns (horizontal scroll on mobile) */
```

---

#### Content Max Width
```css
max-w-7xl  /* 80rem / 1280px - Standard content width */
max-w-6xl  /* 72rem / 1152px - Narrow content */
max-w-full /* Full width for edge-to-edge layouts */

mx-auto    /* Always center content */
```

**Usage**:
```tsx
<div className="max-w-7xl mx-auto px-4">
  {/* All page content */}
</div>
```

---

## 4. Promo Block System (Version 3 Catalog)

This system defines reusable promotional layouts for seasonal campaigns and holiday catalogs.

---

### Hero Promo Blocks

#### Type 1: Full-Screen Gradient Hero
**Purpose**: Major seasonal campaigns, homepage takeovers

**Structure**:
```tsx
<section className="relative overflow-hidden min-h-screen bg-gradient-to-br from-orange-500 via-red-500 to-pink-600">
  {/* Animated background blobs */}
  <div className="absolute inset-0 opacity-20">
    <div className="blob blob-1 bg-yellow-400" />
    <div className="blob blob-2 bg-pink-400" />
    <div className="blob blob-3 bg-orange-400" />
  </div>

  {/* Content */}
  <div className="relative z-10 max-w-7xl mx-auto px-4 py-24">
    <div className="grid md:grid-cols-2 gap-12 items-center">
      {/* Left: Copy */}
      <div className="space-y-6">
        <h1 className="text-6xl font-black text-white">
          Holiday Mega Sale
        </h1>
        <p className="text-2xl text-white/90">
          Up to 50% off bestsellers
        </p>
        <button className="hero-cta">Shop Now</button>
      </div>

      {/* Right: Featured product with floating badge */}
      <div className="relative">
        <img className="product-hero-image" />
        <div className="floating-discount-badge">15% OFF</div>
      </div>
    </div>
  </div>
</section>
```

**Colors**: Holiday gradient (orange → red → pink)
**Height**: `min-h-screen` or `min-h-[600px]`
**Animation**: Blob background, floating badge

---

#### Type 2: Split Hero (Product Focus)
**Purpose**: New product launches, featured categories

**Structure**:
```tsx
<section className="grid md:grid-cols-2 min-h-[500px]">
  {/* Left: Solid color with gradient overlay */}
  <div className="bg-gradient-to-br from-emerald-500 to-teal-600 p-12">
    <h2 className="text-5xl font-black text-white mb-4">
      New Arrivals
    </h2>
    <p className="text-xl text-white/90 mb-8">
      Fresh authentic products
    </p>
    <button className="cta-white">Explore</button>
  </div>

  {/* Right: Product image with glow */}
  <div className="relative bg-gray-100">
    <div className="product-glow-container">
      <img className="product-with-glow" />
    </div>
  </div>
</section>
```

**Colors**: Brand gradient (emerald → teal)
**Height**: `min-h-[500px]`
**Effect**: Glowing product shadow

---

### Holiday Section Blocks

#### Type 1: Seasonal Grid (4-Up)
**Purpose**: Limited offers, flash sales

**Layout**:
```css
grid md:grid-cols-2 lg:grid-cols-4 gap-4
```

**Card Style**:
- Colored background (offer.badge_color)
- White text overlay
- Icon + countdown timer
- Glassmorphism badge
- Hover: scale + glow

**Example**: SpecialOffers component

---

#### Type 2: Featured + Mini Grid
**Purpose**: Hero product + supporting products

**Layout**:
```tsx
<div className="grid md:grid-cols-2 gap-6">
  {/* Left: Large featured card (2x height) */}
  <div className="featured-product-card">
    {/* Large product image */}
    {/* Gradient background */}
    {/* Large price display */}
  </div>

  {/* Right: 3 stacked mini cards */}
  <div className="grid grid-rows-3 gap-6">
    {products.map(product => (
      <div className="quick-add-card">
        {/* Compact layout */}
      </div>
    ))}
  </div>
</div>
```

**Example**: ProductBillboard component

---

#### Type 3: Scrolling Carousel (Horizontal)
**Purpose**: Bundles, promotions, seasonal picks

**Structure**:
```tsx
<div className="flex gap-4 overflow-x-auto scrollbar-hide">
  {items.map(item => (
    <div className="flex-shrink-0 w-80">
      {/* Card content */}
    </div>
  ))}
</div>
```

**Card Width**: Fixed `w-80` (320px)
**Scroll**: Smooth horizontal scroll
**Mobile**: Swipe enabled

---

### Mix-and-Match Promo Grid

**Purpose**: Create dynamic layouts by combining block types

**Example Layout**: 3-Row Homepage

```tsx
{/* Row 1: Full-width hero */}
<HeroPromoBlock type="gradient-hero" />

{/* Row 2: Featured + Mini Grid */}
<FeaturedProductBlock />

{/* Row 3: 4-column offers */}
<SeasonalOffersGrid />

{/* Row 4: Scrolling bundles */}
<BundleCarousel />
```

---

### Seasonal Overlays

#### Holiday Decorative Layer
Add seasonal flair without changing core content.

**Winter/Christmas**:
```tsx
<div className="absolute inset-0 pointer-events-none">
  {/* Snowflakes */}
  <div className="snowflake" />

  {/* Corner decorations */}
  <img src="holly.svg" className="absolute top-0 right-0" />

  {/* Subtle gradient overlay */}
  <div className="absolute inset-0 bg-gradient-to-b from-blue-500/5 to-transparent" />
</div>
```

**Colors**: Blue/white tints, sparkle accents

---

**Spring/Easter**:
```tsx
{/* Pastel overlays */}
<div className="absolute inset-0 bg-gradient-to-br from-pink-200/10 via-yellow-200/10 to-green-200/10 pointer-events-none" />

{/* Floral accents */}
<img src="flowers.svg" className="absolute bottom-0 left-0 opacity-20" />
```

**Colors**: Pastel pink, yellow, green

---

**Fall/Harvest**:
```tsx
{/* Warm gradient overlay */}
<div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 to-red-500/5 pointer-events-none" />

{/* Leaves */}
<div className="falling-leaves">
  <img src="leaf.svg" className="animate-float" />
</div>
```

**Colors**: Orange, red, brown earth tones

---

**Summer**:
```tsx
{/* Bright gradient */}
<div className="absolute inset-0 bg-gradient-to-br from-cyan-400/5 to-yellow-400/5 pointer-events-none" />

{/* Sun rays */}
<div className="absolute top-0 right-0 w-96 h-96 bg-yellow-300 rounded-full blur-3xl opacity-10" />
```

**Colors**: Cyan, yellow, bright tones

---

### Animation Rules for Promo Blocks

#### Background Animations

**Blob Animation** (Ambient, continuous):
```css
animation: blob 7s infinite ease-in-out
```

**Usage**: Hero backgrounds, decorative elements
**Quantity**: Max 3 blobs per section
**Delays**: Stagger with `animation-delay-2000`, `animation-delay-4000`

---

#### Entrance Animations

**Fade In Up** (Content reveals):
```css
animation: fadeInUp 0.6s ease-out forwards
```

**Usage**: Headlines, sections coming into viewport
**Stagger**: Use delay classes (100ms, 200ms, 300ms)

---

**Scale In** (Pop effect):
```css
animation: scaleIn 0.5s ease-out forwards
```

**Usage**: Badges, discount callouts, modals

---

**Slide In** (Directional):
```css
animation: slideInLeft 0.6s ease-out forwards
animation: slideInRight 0.6s ease-out forwards
```

**Usage**: Side-by-side content, product images

---

#### Hover Animations

**Standard Hover** (Cards):
```css
transform hover:scale-105
transition-all duration-300 ease-out
```

**Usage**: Product cards, promo blocks

---

**Glow Hover** (Featured items):
```css
hover:shadow-2xl
transition-shadow duration-500
```

**Usage**: Featured products, hero CTAs

---

**Rotate Hover** (Playful):
```css
transform hover:rotate-3
transition-transform duration-700
```

**Usage**: Product images in billboards

---

#### Attention-Grabbing Animations

**Pulse** (Urgency):
```css
animate-pulse
```

**Usage**: Limited time badges, countdown timers, "Only 3 left"
**Limit**: Use sparingly, max 1-2 per viewport

---

**Bounce** (Call to action):
```css
animate-bounce
```

**Usage**: Discount badges, floating elements
**Limit**: Use for key focal points only

---

#### Animation Performance Rules

1. **Limit simultaneous animations**: Max 3-4 moving elements in viewport
2. **Use transforms over position**: `transform: translate()` not `left/top`
3. **Prefer opacity over visibility**: Smoother transitions
4. **Reduce motion**: Respect `prefers-reduced-motion` (future enhancement)
5. **GPU acceleration**: Use `will-change` for complex animations

---

## 5. Recommended Image Styles

### PNG Vectors (Preferred Format)

**Product Images**:
- **Format**: PNG with transparency
- **Dimensions**: 800x800px minimum (square)
- **Background**: Transparent or solid color
- **File size**: < 200KB optimized

**Why PNG**:
- Transparency support for flexible backgrounds
- No compression artifacts on text/logos
- Clean edges for product cutouts

---

**Icon/Badge Graphics**:
- **Format**: SVG (vector) or PNG
- **Dimensions**: 64x64px to 256x256px
- **Usage**: Badges, icons, decorative elements

---

### Product Shadows

#### Soft Drop Shadow (Subtle Elevation)
```css
/* CSS Implementation */
filter: drop-shadow(0 10px 20px rgba(0, 0, 0, 0.1))
```

**Usage**: Standard product cards, hover states

---

#### Colored Glow Shadow (Brand Integration)
```tsx
{/* Dynamically colored based on product */}
<div
  className="absolute inset-0 rounded-full blur-3xl opacity-50"
  style={{ backgroundColor: product.background_color }}
/>
```

**Example**: ProductBillboard featured products
**Effect**: Product "glows" with its brand color
**Intensity**: 30-50% opacity

---

#### Hard Edge Shadow (Catalog Style)
```css
box-shadow: 0 4px 0 rgba(0, 0, 0, 0.15)
```

**Usage**: Retro/vintage promo blocks, holiday specials
**Aesthetic**: Macy's print catalog feel

---

#### Layered Shadow (Maximum Depth)
```css
box-shadow:
  0 10px 15px -3px rgba(0, 0, 0, 0.1),
  0 4px 6px -2px rgba(0, 0, 0, 0.05),
  0 0 0 1px rgba(0, 0, 0, 0.05);
```

**Usage**: Featured cards, modals, floating elements

---

### Glow Accents (Subtle)

#### Product Glow (Behind Image)
```tsx
{/* Background glow matching product color */}
<div className="relative">
  <div className="absolute inset-0 bg-gradient-to-r from-emerald-400 to-teal-400 rounded-full blur-2xl opacity-30" />
  <img src={product.image} className="relative" />
</div>
```

**Blur**: `blur-2xl` or `blur-3xl`
**Opacity**: 20-40%
**Colors**: Match product or brand colors

---

#### Text Glow (Hero Headlines)
```css
text-shadow: 0 0 20px rgba(255, 255, 255, 0.5)
```

**Usage**: White text on dark backgrounds
**Effect**: Soft ethereal glow

---

#### Border Glow (Interactive Elements)
```css
box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.3);
```

**Usage**: Focus states, active selections
**Color**: Brand emerald at 30% opacity

---

#### Animated Glow (Attention)
```tsx
<div className="relative">
  {/* Pulsing glow ring */}
  <div className="absolute -inset-2 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-xl blur-lg opacity-75 animate-pulse" />
  <div className="relative bg-white rounded-xl p-4">
    {/* Content */}
  </div>
</div>
```

**Usage**: Flash sale badges, limited offers

---

### Holiday Overlays

#### Confetti Overlay (Celebration)
```tsx
<div className="absolute inset-0 pointer-events-none overflow-hidden">
  <div className="confetti-piece bg-red-500" style="..." />
  <div className="confetti-piece bg-green-500" style="..." />
  <div className="confetti-piece bg-yellow-400" style="..." />
  {/* Multiple colored squares, rotated, animated falling */}
</div>
```

**Animation**: Falling + rotating
**Colors**: Holiday themed (red, green, gold)
**Quantity**: 20-30 pieces

---

#### Sparkle Overlay (Magic/Premium)
```tsx
<div className="absolute inset-0 pointer-events-none">
  {/* Small white circles with opacity flicker */}
  <div className="sparkle" style="top: 20%; left: 30%; animation: twinkle 2s infinite" />
  <div className="sparkle" style="top: 60%; left: 70%; animation: twinkle 2.5s infinite" />
</div>
```

**Effect**: Twinkling stars
**Size**: 2-6px
**Color**: White or gold

---

#### Snow Overlay (Winter)
```tsx
<div className="absolute inset-0 pointer-events-none overflow-hidden">
  <div className="snowflake">❄</div>
  <div className="snowflake">❅</div>
  <div className="snowflake">❆</div>
  {/* Falling animation with varying speeds */}
</div>
```

**Animation**: Slow vertical descent
**Speed**: 10-30s per fall
**Quantity**: 15-25 flakes

---

#### Gradient Tint Overlay (Seasonal Mood)
```tsx
{/* Spring: Pastel gradient */}
<div className="absolute inset-0 bg-gradient-to-br from-pink-300/10 via-yellow-200/10 to-green-300/10 pointer-events-none" />

{/* Summer: Bright gradient */}
<div className="absolute inset-0 bg-gradient-to-br from-cyan-400/10 to-yellow-400/10 pointer-events-none" />

{/* Fall: Warm gradient */}
<div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 to-red-500/10 pointer-events-none" />

{/* Winter: Cool gradient */}
<div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-cyan-300/10 pointer-events-none" />
```

**Opacity**: 5-15% (very subtle)
**Purpose**: Set seasonal mood without overwhelming content

---

## Implementation Checklist for V3 Catalog

### Phase 1: Foundation
- [ ] Implement color palette CSS variables
- [ ] Set up typography scale in Tailwind config
- [ ] Create spacing utility classes
- [ ] Build base card components

### Phase 2: Promo Blocks
- [ ] Build hero promo block variants
- [ ] Create seasonal section templates
- [ ] Implement grid layout system
- [ ] Add seasonal overlay components

### Phase 3: Animations
- [ ] Set up blob background animations
- [ ] Create entrance animation utilities
- [ ] Build hover effect library
- [ ] Add attention-grabbing animations

### Phase 4: Images & Effects
- [ ] Optimize product image pipeline
- [ ] Implement shadow/glow systems
- [ ] Create holiday overlay library
- [ ] Build seasonal theme switcher

### Phase 5: Polish
- [ ] Accessibility audit (WCAG AA)
- [ ] Performance optimization
- [ ] Mobile responsiveness testing
- [ ] Cross-browser compatibility

---

## Quick Reference: V3 Catalog Components

```tsx
// Hero Variants
<HeroGradient />     // Full-screen gradient hero
<HeroSplit />        // 50/50 split hero
<HeroProduct />      // Product-focused hero

// Promo Sections
<SeasonalOffers />   // 4-column offer grid
<FeaturedBillboard />// Large + 3 mini grid
<BundleCarousel />   // Horizontal scroll

// Seasonal Overlays
<WinterOverlay />
<SpringOverlay />
<SummerOverlay />
<FallOverlay />

// Effects
<ProductGlow color={brandColor} />
<FloatingBadge discount={15} />
<CountdownTimer expiresAt={date} />
```

---

**Document Version**: 1.0
**Last Updated**: November 2025
**Next Review**: Before V3 Catalog Development
**Status**: Ready for Implementation
