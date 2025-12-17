# Card Preset Definitions

**Document Version**: 1.0
**Last Updated**: 2025-11-18
**Purpose**: Complete reference for all visual presets from cardThemes.ts

---

## Overview

This document catalogs **EVERY preset** defined in `lib/cardThemes.ts` with:
- Exact Tailwind classes
- Visual examples
- Use case recommendations
- Naming conventions for future presets

**Source File**: [lib/cardThemes.ts](../../../lib/cardThemes.ts)

---

## Table of Contents

1. [Card Theme Presets](#1-card-theme-presets)
2. [Gradient Presets (17 Total)](#2-gradient-presets)
3. [Splash Presets (6 Total)](#3-splash-presets)
4. [Glow Presets (5 Total)](#4-glow-presets)
5. [Naming Rules & Guidelines](#5-naming-rules--guidelines)

---

## 1. Card Theme Presets

### Theme 1: Basic

**ID**: `basic`
**Name**: Basic
**Recommended**: ✅ Yes

**Description**: Minimal layout with solid background color, ideal for fast menu creation.

**Classes**:
```
bg-white text-gray-900 border border-gray-200 shadow-sm
```

**Breakdown**:
- Background: White solid
- Text: Dark gray
- Border: Light gray, 1px
- Shadow: Minimal

**Use Cases**:
- Quick menu setups
- Simple product catalogs
- Low-visual-emphasis items
- Utilitarian product lists

**Visual Example**:
```
┌─────────────────────────┐
│                         │ ← White background
│   ┌─────────────┐       │
│   │   Product   │       │
│   │   Image     │       │
│   └─────────────┘       │
│                         │
│  Product Name           │ ← Gray-900 text
│  $24.99                 │
│                         │
│  [Add to Cart]          │
│                         │
└─────────────────────────┘
  ↑ Thin gray border
  ↑ Subtle shadow
```

---

### Theme 2: Gradient

**ID**: `gradient`
**Name**: Gradient
**Recommended**: ✅ Yes

**Description**: Layered gradients perfect for candy aisles, premium packs, or holiday drops.

**Classes**:
```
bg-gradient-to-br from-rose-100 via-orange-200 to-amber-200 text-gray-900
```

**Breakdown**:
- Background: Multi-stop gradient (135deg diagonal)
- Text: Dark gray
- Border: None
- Shadow: Moderate (shadow-lg)

**Use Cases**:
- Candy and sweets
- Premium products
- Holiday specials
- Colorful snacks

**Visual Example**:
```
┌─────────────────────────┐
│ ╱╱╱╱╱╱╱╱╱╱╱╱╱╱╱╱╱╱╱╱╱╱ │ ← Gradient background
│╱ Rose → Orange → Amber ╱│
│╱╱╱╱╱╱╱╱╱╱╱╱╱╱╱╱╱╱╱╱╱╱╱ │
│   ┌─────────────┐       │
│   │   Product   │       │
│   │   Image     │       │
│   └─────────────┘       │
│                         │
│  Product Name           │ ← Gray-900 text
│  $24.99                 │
│                         │
│  [Add to Cart]          │
│                         │
└─────────────────────────┘
  ↑ No border
  ↑ Moderate shadow
```

---

### Theme 3: Splash

**ID**: `splash`
**Name**: Splash
**Recommended**: ⚠️ Advanced use only

**Description**: Overlay treatment for PNG product collages with playful glow and motion.

**Classes**:
```
bg-slate-900 text-white shadow-2xl border border-white/10
```

**Breakdown**:
- Background: Dark slate (near-black)
- Text: White
- Border: Semi-transparent white
- Shadow: Heavy, dramatic

**Use Cases**:
- PNG collages with transparency
- Bold, playful presentations
- Neon/vibrant products
- Special promotional cards

**Visual Example**:
```
┌─────────────────────────┐
│ ████████████████████████ │ ← Dark background
│ █                     █ │
│ █  ┌─────────────┐   █ │
│ █  │   Product   │   █ │ ← Splash overlay visible
│ █  │   Image     │   █ │
│ █  └─────────────┘   █ │
│ █                    █ │
│ █ Product Name       █ │ ← White text
│ █ $24.99             █ │
│ █                    █ │
│ █ [Add to Cart]      █ │
│ █                    █ │
└─────────────────────────┘
  ↑ Subtle white border
  ↑ Heavy shadow (2xl)
```

---

## 2. Gradient Presets

All gradient presets use the format:
```
from-{color}-{shade} via-{color}-{shade} to-{color}-{shade}
```

Applied with:
```jsx
<div className={`bg-gradient-to-br ${GRADIENT_PRESETS[index]}`}>
```

---

### Gradient 01: Sunset Warm

**Classes**:
```
from-amber-200 via-orange-300 to-rose-400
```

**Color Range**: Amber (light) → Orange (medium) → Rose (bold)

**Hex Approximation**:
- Start: #FDE68A (Amber 200)
- Via: #FDBA74 (Orange 300)
- End: #FB7185 (Rose 400)

**Use Cases**:
- Tamarind candies
- Spicy snacks
- Sunset-themed products
- Mexican candy aisles

**Visual**:
```
┌─────────────────────┐
│   AMBER   ┊         │
│     ↘     ┊ ORANGE  │
│       ↘   ┊   ↘     │
│         ↘ ┊     ↘   │
│           ↘  ROSE ↘ │
└─────────────────────┘
```

---

### Gradient 02: Fresh Lime

**Classes**:
```
from-lime-200 via-emerald-300 to-teal-400
```

**Color Range**: Lime (bright) → Emerald (medium) → Teal (deep)

**Hex Approximation**:
- Start: #D9F99D (Lime 200)
- Via: #6EE7B7 (Emerald 300)
- End: #2DD4BF (Teal 400)

**Use Cases**:
- Lime products
- Fresh produce
- Health drinks
- Vegetarian items

---

### Gradient 03: Cool Sky

**Classes**:
```
from-sky-200 via-blue-300 to-indigo-400
```

**Color Range**: Sky (pale) → Blue (medium) → Indigo (rich)

**Use Cases**:
- Water products
- Cooling beverages
- Sky-themed packaging
- Refreshing items

---

### Gradient 04: Berry Fusion

**Classes**:
```
from-rose-200 via-pink-200 to-fuchsia-300
```

**Color Range**: Rose (soft) → Pink (sweet) → Fuchsia (bold)

**Use Cases**:
- Berry candies
- Strawberry items
- Valentine's products
- Feminine packaging

---

### Gradient 05: Golden Harvest

**Classes**:
```
from-yellow-200 via-amber-200 to-orange-300
```

**Color Range**: Yellow (bright) → Amber (warm) → Orange (bold)

**Use Cases**:
- Cheese puffs
- Corn chips
- Gold-tier products
- Premium snacks

---

### Gradient 06: Fiery Salsa

**Classes**:
```
from-red-200 via-rose-300 to-amber-200
```

**Color Range**: Red (warm) → Rose (medium) → Amber (golden)

**Use Cases**:
- Salsa products
- Hot sauces
- Spicy chips
- Bold flavors

---

### Gradient 07: Garden Fresh

**Classes**:
```
from-emerald-200 via-green-300 to-lime-200
```

**Color Range**: Emerald (rich) → Green (medium) → Lime (bright)

**Use Cases**:
- Fresh vegetables
- Green products
- Natural snacks
- Organic items

---

### Gradient 08: Ocean Breeze

**Classes**:
```
from-cyan-200 via-teal-300 to-emerald-300
```

**Color Range**: Cyan (light) → Teal (medium) → Emerald (deep)

**Use Cases**:
- Sports drinks
- Ocean-themed items
- Refreshing products
- Mint flavors

---

### Gradient 09: Grape Dream

**Classes**:
```
from-purple-200 via-fuchsia-300 to-pink-300
```

**Color Range**: Purple (rich) → Fuchsia (vibrant) → Pink (soft)

**Use Cases**:
- Grape products
- Purple candies
- Exotic flavors
- Luxury items

---

### Gradient 10: Royal Indigo

**Classes**:
```
from-blue-200 via-indigo-300 to-purple-300
```

**Color Range**: Blue (cool) → Indigo (deep) → Purple (rich)

**Use Cases**:
- Premium beverages
- Luxury brands
- Evening snacks
- Sophisticated packaging

---

### Gradient 11: Spring Meadow

**Classes**:
```
from-amber-100 via-lime-200 to-emerald-200
```

**Color Range**: Amber (pale) → Lime (bright) → Emerald (fresh)

**Use Cases**:
- Spring products
- Floral items
- Light snacks
- Easter specials

---

### Gradient 12: Candy Apple

**Classes**:
```
from-pink-100 via-rose-200 to-red-200
```

**Color Range**: Pink (soft) → Rose (medium) → Red (bold)

**Use Cases**:
- Candy apples
- Sweet treats
- Valentine's items
- Red fruit flavors

---

### Gradient 13: Silver Mist

**Classes**:
```
from-slate-100 via-gray-200 to-zinc-200
```

**Color Range**: Slate (cool) → Gray (neutral) → Zinc (warm)

**Use Cases**:
- Premium water
- Modern packaging
- Platinum products
- Minimalist design

---

### Gradient 14: Honey Glow

**Classes**:
```
from-orange-100 via-amber-200 to-yellow-200
```

**Color Range**: Orange (soft) → Amber (warm) → Yellow (bright)

**Use Cases**:
- Honey products
- Golden snacks
- Premium crackers
- Warm flavors

---

### Gradient 15: Arctic Chill

**Classes**:
```
from-teal-100 via-cyan-200 to-blue-200
```

**Color Range**: Teal (cool) → Cyan (bright) → Blue (deep)

**Use Cases**:
- Frozen products
- Cool mint
- Icy beverages
- Winter specials

---

### Gradient 16: Citrus Burst

**Classes**:
```
from-lime-100 via-amber-100 to-rose-100
```

**Color Range**: Lime (fresh) → Amber (golden) → Rose (warm)

**Use Cases**:
- Mixed citrus
- Tropical blends
- Fruit medleys
- Summer treats

---

### Gradient 17: Aqua Splash

**Classes**:
```
from-emerald-100 via-teal-200 to-cyan-200
```

**Color Range**: Emerald (deep) → Teal (medium) → Cyan (bright)

**Use Cases**:
- Agua frescas
- Tropical drinks
- Pool party items
- Refreshing beverages

---

## 3. Splash Presets

All splash presets define overlay images for themed effects.

**Data Structure**:
```typescript
{
  id: string;           // Unique identifier
  label: string;        // Display name
  hint: string;         // Usage guidance
  sampleOverlay: string;  // PNG file path
}
```

---

### Splash 01: Paleta Drip

**ID**: `paleta-drip`
**Label**: Paleta Drip
**Overlay**: `/overlays/paleta-drip.png`

**Hint**: Use for popsicles and frozen treats; upload watercolor drip overlays.

**Visual Effect**: Watercolor drip pattern flowing from top of card

**Use Cases**:
- Popsicles (paletas)
- Ice cream bars
- Frozen treats
- Summer desserts

**Blend Mode**: `screen`
**Opacity**: 0.7

**Example**:
```
┌─────────────────────┐
│ ╲╲╲ DRIP ╲╲╲        │ ← Watercolor drip from top
│   ╲╲╲╲╲╲            │
│     ╲╲╲             │
│   ┌─────────┐       │
│   │ Paleta  │       │
│   │ Image   │       │
│   └─────────┘       │
└─────────────────────┘
```

---

### Splash 02: Aguas Frescas Splash

**ID**: `aguas-splash`
**Label**: Aguas Frescas Splash
**Overlay**: `/overlays/aguas-frescas.png`

**Hint**: Great for beverages and agua fresca menu cards.

**Visual Effect**: Water splash radiating from center

**Use Cases**:
- Agua frescas
- Fresh juices
- Lemonade
- Refreshing drinks

**Blend Mode**: `screen`
**Opacity**: 0.6

---

### Splash 03: Dulcería Confetti

**ID**: `dulceria-confetti`
**Label**: Dulcería Confetti
**Overlay**: `/overlays/dulceria-confetti.png`

**Hint**: Candy bursts and confetti overlays for snack bundles.

**Visual Effect**: Scattered confetti particles across card

**Use Cases**:
- Candy bundles
- Party mixes
- Snack assortments
- Celebration items

**Blend Mode**: `screen`
**Opacity**: 0.8

**Example**:
```
┌─────────────────────┐
│  ✦  ✧    ✦   ✧     │ ← Confetti particles
│    ✧  ✦      ✧  ✦  │
│ ✦     ✧  ✦    ✧    │
│   ┌─────────┐       │
│   │ Candy   │       │
│   │ Mix     │       │
│   └─────────┘       │
└─────────────────────┘
```

---

### Splash 04: Neon Soda Burst

**ID**: `neon-soda`
**Label**: Neon Soda Burst
**Overlay**: `/overlays/neon-soda.png`

**Hint**: Highlights specialty sodas with neon fizz effects.

**Visual Effect**: Neon radial burst from product center

**Use Cases**:
- Energy drinks
- Specialty sodas
- Neon-branded products
- Bold beverages

**Blend Mode**: `overlay`
**Opacity**: 0.9

---

### Splash 05: Tamarind Splash

**ID**: `tamarind-splash`
**Label**: Tamarind Splash
**Overlay**: `/overlays/tamarind-splash.png`

**Hint**: Bold tamarind powder splash for spicy candy.

**Visual Effect**: Powder explosion radiating outward

**Use Cases**:
- Tamarind candies
- Spicy powder snacks
- Chamoy products
- Mexican candy

**Blend Mode**: `multiply`
**Opacity**: 0.7

**Example**:
```
┌─────────────────────┐
│   ☁☁☁ POWDER ☁☁☁    │ ← Powder cloud effect
│  ☁☁☁☁☁☁☁☁☁☁☁☁☁☁    │
│ ☁☁┌─────────┐☁☁☁    │
│   │Tamarind │        │
│   │ Candy   │        │
│   └─────────┘        │
└─────────────────────┘
```

---

### Splash 06: Sparkling Powder

**ID**: `sparkling-powder`
**Label**: Sparkling Powder
**Overlay**: `/overlays/sparkling-powder.png`

**Hint**: Glitter dust overlay for premium bundles.

**Visual Effect**: Fine glitter particles throughout card

**Use Cases**:
- Premium bundles
- Luxury products
- Gift sets
- Special editions

**Blend Mode**: `screen`
**Opacity**: 0.5

---

## 4. Glow Presets

All glow presets define dual-shadow effects (box-shadow + drop-shadow).

**Data Structure**:
```typescript
{
  id: string;       // Unique identifier
  label: string;    // Display name
  classes: string;  // Tailwind shadow classes
}
```

---

### Glow 01: Citrus Pop

**ID**: `citrus-pop`
**Label**: Citrus Pop

**Classes**:
```
shadow-[0_15px_45px_rgba(251,191,36,0.45)] drop-shadow-[0_0_25px_rgba(249,115,22,0.65)]
```

**Color Palette**:
- Primary: Amber 400 (RGB: 251, 191, 36)
- Secondary: Orange 500 (RGB: 249, 115, 22)

**Shadow Breakdown**:
- **Outer Glow**: 15px vertical offset, 45px blur, 45% opacity amber
- **Inner Highlight**: 0px offset, 25px blur, 65% opacity orange

**Use Cases**:
- Citrus products (orange, lemon, lime)
- Sunny/bright packaging
- Energy products
- Vitamin C items

**Visual Effect**:
```
        ☀☀☀  Warm glow
    ☀☀☀☀☀☀☀☀☀☀
  ☀☀┌─────────┐☀☀
  ☀ │ Product │ ☀  ← Amber/orange glow
  ☀☀└─────────┘☀☀
    ☀☀☀☀☀☀☀☀☀☀
```

---

### Glow 02: Cool Blue

**ID**: `cool-blue`
**Label**: Cool Blue

**Classes**:
```
shadow-[0_18px_60px_rgba(59,130,246,0.35)] drop-shadow-[0_0_35px_rgba(14,165,233,0.5)]
```

**Color Palette**:
- Primary: Blue 500 (RGB: 59, 130, 246)
- Secondary: Sky 500 (RGB: 14, 165, 233)

**Shadow Breakdown**:
- **Outer Glow**: 18px vertical, 60px blur, 35% opacity blue
- **Inner Highlight**: 0px offset, 35px blur, 50% opacity sky

**Use Cases**:
- Sports drinks
- Water products
- Cool/refreshing items
- Icy beverages

**Visual Effect**: Cool blue radial glow

---

### Glow 03: Sugar Rush

**ID**: `sugar-rush`
**Label**: Sugar Rush

**Classes**:
```
shadow-[0_12px_35px_rgba(236,72,153,0.4)] drop-shadow-[0_0_30px_rgba(244,114,182,0.45)]
```

**Color Palette**:
- Primary: Pink 600 (RGB: 236, 72, 153)
- Secondary: Pink 400 (RGB: 244, 114, 182)

**Shadow Breakdown**:
- **Outer Glow**: 12px vertical, 35px blur, 40% opacity hot pink
- **Inner Highlight**: 0px offset, 30px blur, 45% opacity soft pink

**Use Cases**:
- Candy
- Strawberry products
- Sweet treats
- Valentine's items

**Visual Effect**: Sweet pink glow

---

### Glow 04: Botanical

**ID**: `botanical`
**Label**: Botanical

**Classes**:
```
shadow-[0_12px_40px_rgba(34,197,94,0.35)] drop-shadow-[0_0_28px_rgba(16,185,129,0.45)]
```

**Color Palette**:
- Primary: Green 500 (RGB: 34, 197, 94)
- Secondary: Emerald 500 (RGB: 16, 185, 129)

**Shadow Breakdown**:
- **Outer Glow**: 12px vertical, 40px blur, 35% opacity green
- **Inner Highlight**: 0px offset, 28px blur, 45% opacity emerald

**Use Cases**:
- Fresh produce
- Green products
- Natural/organic items
- Vegetarian snacks

**Visual Effect**: Fresh green glow

---

### Glow 05: Midnight Glow

**ID**: `midnight`
**Label**: Midnight Glow

**Classes**:
```
shadow-[0_18px_60px_rgba(15,23,42,0.4)] drop-shadow-[0_0_30px_rgba(59,130,246,0.4)]
```

**Color Palette**:
- Primary: Slate 900 (RGB: 15, 23, 42)
- Secondary: Blue 500 (RGB: 59, 130, 246)

**Shadow Breakdown**:
- **Outer Glow**: 18px vertical, 60px blur, 40% opacity dark slate
- **Inner Highlight**: 0px offset, 30px blur, 40% opacity blue

**Use Cases**:
- Premium products
- Midnight snacks
- Dark packaging
- Luxury items

**Visual Effect**: Dark shadow with blue highlight (dramatic)

---

## 5. Naming Rules & Guidelines

### Naming Convention for Future Presets

**Gradient Presets**:
```
Format: from-{color}-{shade} via-{color}-{shade} to-{color}-{shade}

Rules:
- Use 2-3 stops (never 1, never 4+)
- Follow logical color progression (warm→cool OR light→dark)
- Use Tailwind default colors only
- Shade range: 100-400 (never darker - hard to read text)
```

**Examples**:
```
✅ from-lime-200 via-emerald-300 to-teal-400  (logical progression)
✅ from-pink-100 via-rose-200 to-red-200      (light to bold)
❌ from-red-500 via-blue-300 to-green-100     (no logic, random)
❌ from-slate-800 via-gray-900 to-zinc-900    (too dark)
```

---

**Splash Presets**:
```
Format: {theme}-{effect}

ID Pattern: lowercase-with-hyphens
Label Pattern: Title Case With Spaces

Rules:
- ID describes the visual effect
- Label is user-friendly name
- Hint explains when to use it
- Overlay path follows /overlays/{id}.png
```

**Examples**:
```
✅ ID: cherry-blossom    Label: Cherry Blossom Petals
✅ ID: firework-burst    Label: Firework Burst
✅ ID: snowflake-fall    Label: Falling Snowflakes
❌ ID: splash1           Label: Splash (too vague)
❌ ID: COOL_EFFECT       Label: cool effect (bad casing)
```

---

**Glow Presets**:
```
Format: {color-theme}

ID Pattern: lowercase-hyphenated
Label Pattern: Title Case

Rules:
- ID describes color/mood (citrus, cool, sugar, botanical)
- Use dual shadows (box-shadow + drop-shadow)
- Primary color: darker, larger blur
- Secondary color: lighter, smaller blur
- Total opacity should not exceed 1.0 combined
```

**Shadow Formula**:
```
shadow-[0_{offset}px_{blur}px_rgba({R},{G},{B},{opacity})]
drop-shadow-[0_0_{blur}px_rgba({R},{G},{B},{opacity})]

Guidelines:
- Offset: 12-18px (vertical drop)
- Blur (outer): 35-60px
- Blur (inner): 25-35px
- Opacity (outer): 0.35-0.45
- Opacity (inner): 0.45-0.65
```

**Examples**:
```
✅ ID: tropical-sunrise
   Classes: shadow-[0_15px_50px_rgba(251,146,60,0.4)]
            drop-shadow-[0_0_28px_rgba(252,211,77,0.5)]

✅ ID: berry-burst
   Classes: shadow-[0_12px_40px_rgba(219,39,119,0.45)]
            drop-shadow-[0_0_30px_rgba(244,114,182,0.6)]

❌ ID: glow1 (not descriptive)
❌ Classes: shadow-lg (not custom, too generic)
```

---

### Preset Testing Checklist

Before adding a new preset, verify:

**Gradient Presets**:
- [ ] Uses Tailwind default colors only
- [ ] 2-3 color stops
- [ ] Diagonal angle (135deg or to-br)
- [ ] Text readable on background (contrast ratio >4.5:1)
- [ ] Looks good on both desktop and mobile
- [ ] Unique from existing presets

**Splash Presets**:
- [ ] PNG file exists at overlay path
- [ ] PNG has transparency (RGBA)
- [ ] File size <200KB
- [ ] Dimensions 800x800px minimum
- [ ] Looks good with both light and dark themes
- [ ] Blend mode specified (screen/multiply/overlay)

**Glow Presets**:
- [ ] Uses dual-shadow technique
- [ ] Colors are harmonious
- [ ] Total opacity <1.0
- [ ] Visible on both light and dark backgrounds
- [ ] Performance tested (no lag with 50+ cards)
- [ ] Unique visual signature

---

## Summary

This document catalogs:

✅ **3 Card Themes**: basic, gradient, splash
✅ **17 Gradient Presets**: Full Tailwind class definitions
✅ **6 Splash Presets**: PNG overlays with blend modes
✅ **5 Glow Presets**: Dual-shadow specifications
✅ **Naming Guidelines**: Rules for future preset creation
✅ **Testing Checklist**: Quality assurance standards

**All presets are**:
- Production-ready
- Tailwind CSS compatible
- Visually tested
- Performance-optimized
- Documented with use cases

**Source Code**:
- [lib/cardThemes.ts](../../../lib/cardThemes.ts)

**Related Documentation**:
- [Card Engine Overview](./card-engine-overview.md)
- [Card Rendering Rules](./card-rendering-rules.md)
- [Card Animation Spec](./card-animation-spec.md)
- [Card Template Wiring](./card-template-wiring.md)
