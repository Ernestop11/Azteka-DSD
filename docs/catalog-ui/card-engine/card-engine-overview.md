# Visual Card Engine - Overview

**Document Version**: 1.0
**Last Updated**: 2025-11-18
**Purpose**: Comprehensive overview of the Visual Card Engine system architecture

---

## What is the Card Engine?

The **Visual Card Engine** is Azteka DSD's dynamic product card rendering system that transforms raw product data into visually stunning, consistent catalog cards. The engine combines:

- **Visual Presets**: Pre-configured gradient, splash, and glow combinations
- **Dynamic Gradients**: Custom color schemes and background treatments
- **Splash Overlays**: Themed visual effects for specific product categories
- **Glow Effects**: Shadow and lighting treatments for depth and emphasis
- **Card Themes**: Structural layouts (basic, gradient, splash)
- **Animations**: Motion and interaction patterns powered by Framer Motion

The Card Engine ensures:
- ✅ **Visual Consistency**: All product cards follow unified design rules
- ✅ **Brand Expression**: Each product category has unique visual identity
- ✅ **Performance**: Optimized rendering with lazy loading and GPU acceleration
- ✅ **Flexibility**: Admins can customize without touching code
- ✅ **Scalability**: New presets and themes can be added without refactoring

---

## How Components Combine

The Card Engine operates as a **composition pipeline** where multiple visual layers combine to create the final card appearance.

### Visual Composition Layers

```
┌─────────────────────────────────────────────────────────────┐
│                    FINAL PRODUCT CARD                       │
│  ┌───────────────────────────────────────────────────────┐  │
│  │ Layer 7: Animations (Framer Motion)                   │  │
│  │  └─ Entrance animation                                │  │
│  │  └─ Hover scale/rotate                                │  │
│  │  └─ Glow pulse                                        │  │
│  │  └─ Badge animation                                   │  │
│  └───────────────────────────────────────────────────────┘  │
│  ┌───────────────────────────────────────────────────────┐  │
│  │ Layer 6: Interactive Elements                         │  │
│  │  └─ Add to Cart button                                │  │
│  │  └─ Promotion badges                                  │  │
│  │  └─ Bundle suggestions                                │  │
│  └───────────────────────────────────────────────────────┘  │
│  ┌───────────────────────────────────────────────────────┐  │
│  │ Layer 5: Content (Product Data)                       │  │
│  │  └─ Product name                                      │  │
│  │  └─ Description                                       │  │
│  │  └─ Price, units, stock status                        │  │
│  └───────────────────────────────────────────────────────┘  │
│  ┌───────────────────────────────────────────────────────┐  │
│  │ Layer 4: Product Image                                │  │
│  │  └─ Centered image with hover transform               │  │
│  │  └─ White backdrop with radial gradient tint          │  │
│  │  └─ Drop shadow effects                               │  │
│  └───────────────────────────────────────────────────────┘  │
│  ┌───────────────────────────────────────────────────────┐  │
│  │ Layer 3: Splash Overlays (Optional)                   │  │
│  │  └─ PNG overlay images (drips, splashes, confetti)    │  │
│  │  └─ Positioned absolutely over gradient               │  │
│  └───────────────────────────────────────────────────────┘  │
│  ┌───────────────────────────────────────────────────────┐  │
│  │ Layer 2: Glow Effects                                 │  │
│  │  └─ Box shadows (outer card glow)                     │  │
│  │  └─ Drop shadows (inner element emphasis)             │  │
│  └───────────────────────────────────────────────────────┘  │
│  ┌───────────────────────────────────────────────────────┐  │
│  │ Layer 1: Base Gradient/Background                     │  │
│  │  └─ Solid color OR                                    │  │
│  │  └─ Linear gradient (135deg diagonal) OR              │  │
│  │  └─ Custom gradient from product.background_gradient  │  │
│  └───────────────────────────────────────────────────────┘  │
│  ┌───────────────────────────────────────────────────────┐  │
│  │ Layer 0: Card Structure (Theme)                       │  │
│  │  └─ Border radius (rounded-2xl)                       │  │
│  │  └─ Padding structure                                 │  │
│  │  └─ Aspect ratios                                     │  │
│  └───────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

---

## Card Rendering Pipeline

The Card Engine follows a strict rendering pipeline from raw product data to final rendered card.

### Step-by-Step Pipeline

```
┌──────────────────────────────────────────────────────────────────┐
│                    STEP 1: DATA INPUT                            │
│                                                                  │
│  Product Data (from database):                                  │
│  {                                                               │
│    id: "prod_001",                                               │
│    name: "Coca-Cola Classic 12oz - 24pk",                        │
│    background_color: "#FF4444",                                  │
│    background_gradient: null,                                    │
│    image_url: "/products/coke.png",                              │
│    featured: true,                                               │
│    price: 24.99,                                                 │
│    ...                                                           │
│  }                                                               │
└──────────────────────────────────────────────────────────────────┘
                                ↓
┌──────────────────────────────────────────────────────────────────┐
│                 STEP 2: VISUAL PRESET RESOLUTION                 │
│                                                                  │
│  Decision Tree:                                                  │
│                                                                  │
│  1. Check product.background_gradient                            │
│     └─ If exists: USE CUSTOM GRADIENT                            │
│                                                                  │
│  2. Else, check product.background_color                         │
│     └─ If exists: GENERATE AUTO-GRADIENT                         │
│        Formula: linear-gradient(135deg,                          │
│                 {color}dd 0%, {color}22 100%)                    │
│                                                                  │
│  3. Else: FALLBACK TO WHITE (#FFF)                               │
│                                                                  │
│  Result:                                                         │
│  background = "linear-gradient(135deg,                           │
│                #FF4444dd 0%, #FF444422 100%)"                    │
└──────────────────────────────────────────────────────────────────┘
                                ↓
┌──────────────────────────────────────────────────────────────────┐
│                  STEP 3: THEME APPLICATION                       │
│                                                                  │
│  Card Theme Selection (from cardThemes.ts):                      │
│                                                                  │
│  If product uses splash preset:                                 │
│    → Apply "splash" theme                                        │
│    → Dark background (slate-900)                                 │
│    → White text                                                  │
│    → Heavy shadow (shadow-2xl)                                   │
│                                                                  │
│  Else if product uses gradient preset:                           │
│    → Apply "gradient" theme                                      │
│    → Gradient background                                         │
│    → Dark text (gray-900)                                        │
│    → Moderate shadow (shadow-lg)                                 │
│                                                                  │
│  Else:                                                           │
│    → Apply "basic" theme                                         │
│    → White background                                            │
│    → Gray text                                                   │
│    → Minimal shadow (shadow-sm)                                  │
└──────────────────────────────────────────────────────────────────┘
                                ↓
┌──────────────────────────────────────────────────────────────────┐
│                   STEP 4: GLOW EFFECT INJECTION                  │
│                                                                  │
│  If product.featured === true:                                   │
│    → Apply enhanced shadow:                                      │
│       boxShadow: '0 6px 16px rgba(0,0,0,0.15)'                   │
│                                                                  │
│  If glow preset selected (future):                               │
│    → Apply preset glow classes from GLOW_PRESETS                 │
│    → Example: shadow-[0_15px_45px_rgba(251,191,36,0.45)]        │
└──────────────────────────────────────────────────────────────────┘
                                ↓
┌──────────────────────────────────────────────────────────────────┐
│                  STEP 5: SPLASH OVERLAY MOUNTING                 │
│                                                                  │
│  If splash preset assigned (future):                             │
│    → Load splash overlay PNG                                     │
│    → Position: absolute; top: 0; left: 0;                        │
│    → Blend mode: screen or multiply                              │
│    → Opacity: 0.6-0.9 depending on preset                        │
│                                                                  │
│  Examples:                                                       │
│    - Paleta Drip: Watercolor drip effect from top                │
│    - Confetti: Random confetti particles                         │
│    - Neon Burst: Radial glow from center                         │
└──────────────────────────────────────────────────────────────────┘
                                ↓
┌──────────────────────────────────────────────────────────────────┐
│                    STEP 6: ANIMATION BINDING                     │
│                                                                  │
│  Framer Motion Configuration:                                    │
│                                                                  │
│  1. Entrance Animation:                                          │
│     initial={{ opacity: 0, y: 40 }}                              │
│     whileInView={{ opacity: 1, y: 0 }}                           │
│     transition={{ duration: 0.6 }}                               │
│                                                                  │
│  2. Hover Animation:                                             │
│     className="hover:shadow-2xl hover:scale-105"                 │
│     transition-all duration-500                                  │
│                                                                  │
│  3. Image Transform (on hover):                                  │
│     group-hover:scale-110                                        │
│     group-hover:rotate-2                                         │
│     transition-transform duration-700                            │
│                                                                  │
│  4. Button Hover:                                                │
│     Gradient swap animation (emerald→teal reverses)              │
└──────────────────────────────────────────────────────────────────┘
                                ↓
┌──────────────────────────────────────────────────────────────────┐
│                     STEP 7: RENDER OUTPUT                        │
│                                                                  │
│  Final ProductCard Component:                                    │
│                                                                  │
│  <motion.div                                                     │
│    style={{                                                      │
│      background: "linear-gradient(...)",                         │
│      boxShadow: "0 6px 16px rgba(0,0,0,0.15)"                    │
│    }}                                                            │
│    className="group relative overflow-hidden                     │
│                rounded-2xl shadow-lg                             │
│                hover:shadow-2xl hover:scale-105"                 │
│  >                                                               │
│    {/* Decorative blur orbs */}                                  │
│    {/* Product image container */}                               │
│    {/* Product info */}                                          │
│    {/* Price and CTA */}                                         │
│    {/* Badges and promotions */}                                 │
│  </motion.div>                                                   │
└──────────────────────────────────────────────────────────────────┘
```

---

## Visual Preset System

The Card Engine uses three primary preset categories that work together:

### 1. Gradient Presets

**Purpose**: Provide background color schemes
**Count**: 17 presets in GRADIENT_PRESETS array
**Usage**: Applied as Tailwind gradient classes

**Preset Categories**:
- Warm gradients (amber, orange, rose, red)
- Cool gradients (sky, blue, indigo, purple)
- Fresh gradients (lime, emerald, teal, cyan)
- Pastel gradients (soft tones for candy/sweets)
- Neutral gradients (slate, gray, zinc)

**Example Preset**:
```typescript
'from-amber-200 via-orange-300 to-rose-400'
```

**How It Works**:
```javascript
// Admin selects gradient preset from dropdown
const selectedPreset = GRADIENT_PRESETS[3]; // "from-rose-200 via-pink-200 to-fuchsia-300"

// Applied to card background
<div className={`bg-gradient-to-br ${selectedPreset}`}>
  {/* Card content */}
</div>
```

---

### 2. Splash Presets

**Purpose**: Add themed visual overlays for specific product types
**Count**: 6 presets in SPLASH_PRESETS array
**Usage**: PNG overlay images positioned absolutely

**Preset Examples**:
1. **Paleta Drip**: Watercolor drip for frozen treats
2. **Aguas Frescas Splash**: Water splash for beverages
3. **Dulcería Confetti**: Confetti for candy bundles
4. **Neon Soda Burst**: Fizz effects for specialty sodas
5. **Tamarind Splash**: Powder splash for spicy candy
6. **Sparkling Powder**: Glitter dust for premium items

**Data Structure**:
```typescript
{
  id: 'paleta-drip',
  label: 'Paleta Drip',
  hint: 'Use for popsicles and frozen treats',
  sampleOverlay: '/overlays/paleta-drip.png'
}
```

**Rendering**:
```jsx
// If splash preset assigned
{product.splashPreset && (
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

---

### 3. Glow Presets

**Purpose**: Add depth and emphasis with shadow effects
**Count**: 5 presets in GLOW_PRESETS array
**Usage**: Tailwind custom shadow classes

**Preset Examples**:
1. **Citrus Pop**: Warm orange/yellow glow
2. **Cool Blue**: Cyan/blue glow
3. **Sugar Rush**: Pink/magenta glow
4. **Botanical**: Green/emerald glow
5. **Midnight Glow**: Dark blue with hint of light

**Data Structure**:
```typescript
{
  id: 'citrus-pop',
  label: 'Citrus Pop',
  classes: 'shadow-[0_15px_45px_rgba(251,191,36,0.45)] drop-shadow-[0_0_25px_rgba(249,115,22,0.65)]'
}
```

**Rendering**:
```jsx
<div className={`${glowPreset.classes} rounded-2xl`}>
  {/* Card with glow effect */}
</div>
```

---

## Card Theme System

The engine supports three structural themes that determine the overall card layout and styling approach.

### Theme Comparison

| Aspect | Basic | Gradient | Splash |
|--------|-------|----------|--------|
| **Background** | White solid | Multi-stop gradient | Dark (slate-900) |
| **Text Color** | Gray-900 | Gray-900 | White |
| **Shadow** | Minimal (shadow-sm) | Moderate (shadow-lg) | Heavy (shadow-2xl) |
| **Border** | Gray-200 border | No border | White/10 border |
| **Use Case** | Fast menu creation | Candy, premium packs | PNG collages, playful |
| **Recommended** | ✅ Yes | ✅ Yes | ⚠️ Advanced use |

### Theme Application Logic

```javascript
function getThemeClasses(themeId) {
  switch (themeId) {
    case 'basic':
      return 'bg-white text-gray-900 border border-gray-200 shadow-sm';

    case 'gradient':
      return 'bg-gradient-to-br text-gray-900 shadow-lg';

    case 'splash':
      return 'bg-slate-900 text-white shadow-2xl border border-white/10';

    default:
      return 'bg-white text-gray-900 shadow-sm';
  }
}
```

---

## Combination Examples

### Example 1: Classic Gradient Card

**Product**: Coca-Cola Classic
**Configuration**:
- Theme: `gradient`
- Gradient Preset: `from-red-200 via-rose-300 to-amber-200`
- Glow Preset: None
- Splash Preset: None

**Result**:
```jsx
<motion.div
  className="bg-gradient-to-br from-red-200 via-rose-300 to-amber-200
             text-gray-900 shadow-lg rounded-2xl
             hover:shadow-2xl hover:scale-105"
>
  {/* Product content */}
</motion.div>
```

---

### Example 2: Splash Card with Glow

**Product**: Paleta de Fresa (Strawberry Popsicle)
**Configuration**:
- Theme: `splash`
- Gradient Preset: N/A (uses dark background)
- Glow Preset: `sugar-rush` (pink glow)
- Splash Preset: `paleta-drip` (watercolor drip overlay)

**Result**:
```jsx
<motion.div
  className="bg-slate-900 text-white shadow-2xl border border-white/10
             rounded-2xl hover:scale-105
             shadow-[0_12px_35px_rgba(236,72,153,0.4)]
             drop-shadow-[0_0_30px_rgba(244,114,182,0.45)]"
>
  {/* Splash overlay */}
  <div
    className="absolute inset-0"
    style={{
      backgroundImage: 'url(/overlays/paleta-drip.png)',
      mixBlendMode: 'screen',
      opacity: 0.7
    }}
  />

  {/* Product content */}
</motion.div>
```

---

### Example 3: Featured Product with Auto-Gradient

**Product**: Lay's Classic Chips
**Configuration**:
- Theme: `gradient`
- Custom gradient: Auto-generated from `background_color: #FFD700`
- Glow Preset: None
- Splash Preset: None
- Featured: `true`

**Result**:
```jsx
<motion.div
  style={{
    background: 'linear-gradient(135deg, #FFD700dd 0%, #FFD70022 100%)',
    boxShadow: '0 6px 16px rgba(0,0,0,0.15)' // Featured enhancement
  }}
  className="text-gray-900 shadow-lg rounded-2xl
             hover:shadow-2xl hover:scale-105"
>
  {/* Featured badge */}
  <span className="px-2 py-1 bg-amber-400 text-amber-900 rounded-full">
    FEATURED
  </span>

  {/* Product content */}
</motion.div>
```

---

## Priority System

When multiple visual properties are defined, the Card Engine uses this priority order:

### Priority Hierarchy

```
1. SPLASH PRESET (if assigned)
   └─ Overrides everything, uses dark theme

2. CUSTOM GRADIENT (product.background_gradient)
   └─ Direct database value takes precedence

3. AUTO-GENERATED GRADIENT (from product.background_color)
   └─ Fallback if no custom gradient

4. GRADIENT PRESET (from admin selection)
   └─ Applied if no custom values

5. THEME DEFAULT (white or slate-900)
   └─ Final fallback
```

### Glow Priority

```
1. FEATURED FLAG (product.featured)
   └─ Adds enhanced shadow automatically

2. GLOW PRESET (from admin selection)
   └─ Applies preset shadow classes

3. THEME DEFAULT SHADOW
   └─ Basic, gradient, or splash default
```

---

## Performance Considerations

The Card Engine is optimized for performance with:

### 1. Lazy Loading
```jsx
<img
  src={imageSrc}
  loading="lazy"
  decoding="async"
  alt={product.name}
/>
```

### 2. GPU Acceleration
- Transform animations use `transform` property (GPU-accelerated)
- Avoid layout-triggering properties (width, height, margin)
- Use `will-change` hint for frequently animated elements

### 3. Intersection Observer
```jsx
<motion.div
  whileInView={{ opacity: 1, y: 0 }}
  viewport={{ once: true }} // Only animate on first view
>
```

### 4. CSS Containment
```css
.product-card {
  contain: layout style paint;
}
```

### 5. Memoization
```javascript
const ProductCard = React.memo(({ product, onAddToCart }) => {
  // Component logic
}, (prevProps, nextProps) => {
  return prevProps.product.id === nextProps.product.id;
});
```

---

## Admin Integration Points

The Card Engine connects to the admin system through these touchpoints:

### 1. Product Editor Form
```
Admin edits product:
  └─ Selects gradient preset from dropdown
  └─ Picks glow effect
  └─ Chooses splash overlay (optional)
  └─ Toggles featured status
    ↓
  Saves to database
    ↓
  Product data includes:
    - background_color
    - background_gradient
    - featured
    - (future) splashPresetId, glowPresetId
```

### 2. Live Preview
```
Admin makes changes:
  ↓
Preview panel renders ProductCard with:
  - Real-time visual updates
  - Same rendering engine as catalog
  - Hover state demonstration
```

### 3. Preset Library
```
Admin clicks "Browse Presets":
  ↓
Modal shows:
  - Gradient grid (17 options)
  - Glow grid (5 options)
  - Splash grid (6 options)
    ↓
  Click preset → Auto-applies to product
    ↓
  Preview updates immediately
```

---

## Future Enhancements

### Planned Features

1. **Seasonal Auto-Switching**
   - Automatically apply holiday splash overlays based on date
   - Winter: Snow particles
   - Spring: Flower petals
   - Summer: Sun rays
   - Fall: Falling leaves

2. **A/B Testing Engine**
   - Test different gradient/glow combinations
   - Track which presets drive more conversions
   - Auto-optimize based on performance data

3. **Custom Preset Builder**
   - Let admins create and save custom presets
   - Share presets across products
   - Export/import preset packs

4. **Dynamic Theming**
   - Adapt card theme based on time of day
   - Dark mode support for customer preferences
   - High-contrast mode for accessibility

5. **Animation Presets**
   - Different entrance animations (slide, fade, bounce)
   - Idle animations (gentle float, pulse)
   - Exit animations for cart interactions

---

## Technical Stack Summary

The Card Engine is built on:

- **React 18**: Component architecture
- **TypeScript**: Type-safe preset definitions
- **Tailwind CSS**: Utility-first styling with custom shadows
- **Framer Motion**: Animation library
- **CSS Grid/Flexbox**: Layout system
- **CSS Custom Properties**: Dynamic color injection
- **Web Animations API**: Future micro-interactions

---

## Summary

The Visual Card Engine is a sophisticated, layered system that:

✅ Transforms product data into visually consistent cards
✅ Combines gradients, splashes, glows, and themes
✅ Follows a strict 7-step rendering pipeline
✅ Prioritizes visual properties intelligently
✅ Optimizes for performance with lazy loading and GPU acceleration
✅ Integrates seamlessly with admin editing workflow
✅ Supports future enhancements without breaking changes

**Key Files**:
- [lib/cardThemes.ts](../../../lib/cardThemes.ts) - Preset definitions
- [src/components/ProductCard.tsx](../../../src/components/ProductCard.tsx) - Render engine
- [src/types/index.ts](../../../src/types/index.ts) - Data models

**Related Documentation**:
- [Card Rendering Rules](./card-rendering-rules.md)
- [Card Preset Definitions](./card-preset-definitions.md)
- [Card Animation Spec](./card-animation-spec.md)
- [Card Template Wiring](./card-template-wiring.md)
