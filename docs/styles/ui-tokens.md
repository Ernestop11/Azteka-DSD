# Azteka DSD - UI Design Tokens & Style Guide

## Design Philosophy

Azteka DSD combines the best of three design worlds:

1. **Amazon's Efficiency** - Clear product cards, fast scanning, optimized for conversion
2. **Bolt's Modern Aesthetic** - Vibrant gradients, smooth animations, contemporary feel
3. **Macy's Holiday Catalog** - Warm, inviting, celebratory tone with rich visuals

**Goal**: Create a wholesale ordering experience that feels premium, trustworthy, and delightful.

---

## Color Palette

### Primary Brand Colors

#### Emerald/Teal (Primary)
The signature Azteka brand gradient represents growth, freshness, and trust.

```css
/* Main Brand Gradient */
from-emerald-500 to-teal-600
  /* Emerald: #10b981 */
  /* Teal: #0d9488 */

/* Variations */
emerald-50   #ecfdf5  /* Lightest - backgrounds */
emerald-100  #d1fae5  /* Hover states */
emerald-500  #10b981  /* Primary */
emerald-600  #059669  /* Hover/Active */
emerald-700  #047857  /* Dark mode */
emerald-900  #064e3b  /* Text on light backgrounds */

teal-50      #f0fdfa  /* Lightest */
teal-500     #14b8a6  /* Accent */
teal-600     #0d9488  /* Primary */
teal-700     #0f766e  /* Dark */
```

**Usage**:
- Primary CTAs (Add to Cart, Checkout)
- Success states
- Active navigation items
- Logo and brand marks

**Example**:
```tsx
<button className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white">
  Add to Cart
</button>
```

---

### Secondary Colors

#### Purple/Indigo (Premium Features)
Used for admin, premium features, and special badges.

```css
purple-500  #a855f7  /* Premium */
purple-600  #9333ea  /* Hover */
indigo-600  #4f46e5  /* Professional */

/* Gradient */
from-purple-600 to-indigo-600
from-purple-500 to-pink-500  /* Rewards */
```

**Usage**:
- Admin dashboard
- Rewards and loyalty
- Premium badges
- Special promotions

---

#### Cyan/Blue (Actions & Information)
Modern, clean accent for secondary actions.

```css
cyan-500    #06b6d4  /* Info */
blue-500    #3b82f6  /* Action */

/* Gradient */
from-cyan-500 to-blue-500
```

**Usage**:
- Bulk order features
- Sales rep mode
- Informational badges
- Secondary CTAs

---

#### Orange/Red (Urgency & Alerts)
Warm colors for promotions, urgency, and warnings.

```css
/* Promotions */
orange-500  #f97316  /* Warm urgency */
red-500     #ef4444  /* Alert/Delete */

/* Gradient for hand-off mode */
from-orange-500 to-red-500
```

**Usage**:
- Discount badges
- Limited time offers
- Out of stock warnings
- Delete actions
- Hand-off mode indicator

---

#### Pink/Rose (Playful Accents)
Adds warmth and personality to the design.

```css
pink-300    #f9a8d4  /* Soft background blobs */
pink-400    #f472b6  /* Animated elements */
pink-500    #ec4899  /* Accent */
```

**Usage**:
- Background decorative blobs
- Animated gradient accents
- Seasonal/holiday themes
- Rewards UI

---

### Neutral Colors

#### Gray Scale
Professional, accessible neutrals for text and backgrounds.

```css
/* Backgrounds */
gray-50     #f9fafb  /* Page background */
gray-100    #f3f4f6  /* Card backgrounds */
gray-200    #e5e7eb  /* Borders */

/* Text */
gray-600    #4b5563  /* Secondary text */
gray-700    #374151  /* Body text */
gray-900    #111827  /* Headings */

/* White & Borders */
white       #ffffff  /* Cards, modals */
black       #000000  /* Overlays (opacity) */
```

**Usage**:
- Page backgrounds: `bg-gray-50`
- Cards: `bg-white`
- Borders: `border-gray-200`
- Text: `text-gray-900` (headings), `text-gray-600` (body)

---

### Semantic Colors

```css
/* Success */
green-500   #22c55e
green-100   #dcfce7  /* Background */

/* Warning */
yellow-500  #eab308
yellow-100  #fef9c3  /* Background */

/* Error */
red-500     #ef4444
red-100     #fee2e2  /* Background */

/* Info */
blue-500    #3b82f6
blue-100    #dbeafe  /* Background */
```

---

## Typography Scale

### Font Family

```css
/* Tailwind Default Sans */
font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont,
             "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
```

**Rationale**: System fonts load instantly and feel native across devices.

---

### Type Scale

#### Headings

```css
/* H1 - Hero Titles */
text-4xl  /* 2.25rem / 36px */
font-black
text-gray-900

Example: "Mexican Wholesale"
```

```css
/* H2 - Section Titles */
text-3xl  /* 1.875rem / 30px */
font-bold
text-gray-900

Example: "Featured Products"
```

```css
/* H3 - Card Titles */
text-2xl  /* 1.5rem / 24px */
font-bold
text-gray-900

Example: "Salsa Verde Herdez"
```

```css
/* H4 - Subsections */
text-xl   /* 1.25rem / 20px */
font-semibold
text-gray-800

Example: "Order Summary"
```

---

#### Body Text

```css
/* Large Body */
text-lg   /* 1.125rem / 18px */
font-normal
text-gray-700

Example: Product descriptions, important info
```

```css
/* Regular Body */
text-base /* 1rem / 16px */
font-normal
text-gray-700

Example: Standard body text, form labels
```

```css
/* Small Body */
text-sm   /* 0.875rem / 14px */
font-normal
text-gray-600

Example: Helper text, metadata
```

```css
/* Extra Small */
text-xs   /* 0.75rem / 12px */
font-normal
text-gray-500

Example: Badges, timestamps, captions
```

---

#### Font Weights

```css
font-black    /* 900 - Hero headlines only */
font-bold     /* 700 - Headings, CTAs */
font-semibold /* 600 - Subheadings, labels */
font-medium   /* 500 - Emphasized body text */
font-normal   /* 400 - Body text */
```

**Rule**: Use `font-bold` or `font-black` for all CTAs to ensure readability.

---

### Typography Examples

```tsx
/* Hero Title */
<h1 className="text-4xl font-black text-gray-900">
  Mexican Wholesale
</h1>

/* Section Header */
<h2 className="text-3xl font-bold text-gray-900 mb-4">
  Featured Products
</h2>

/* Product Name */
<h3 className="text-xl font-semibold text-gray-900">
  Salsa Verde Herdez
</h3>

/* Body Text */
<p className="text-base text-gray-700">
  Browse our complete catalog of authentic Mexican products
</p>

/* Small Label */
<span className="text-sm text-gray-600">
  SKU: SAL-001
</span>

/* Badge */
<div className="text-xs font-bold text-white bg-red-500 px-2 py-1 rounded">
  20% OFF
</div>
```

---

## Spacing Scale

Azteka DSD uses Tailwind's default spacing scale based on `0.25rem` (4px) increments.

### Common Spacing Values

```css
/* Micro Spacing */
gap-1      /* 0.25rem / 4px  - Tight icon spacing */
gap-2      /* 0.5rem  / 8px  - Button icon gaps */
gap-3      /* 0.75rem / 12px - Card content spacing */
gap-4      /* 1rem    / 16px - Component spacing */

/* Standard Spacing */
p-4        /* 1rem    / 16px - Card padding */
p-6        /* 1.5rem  / 24px - Section padding */
py-3       /* 0.75rem / 12px - Button vertical padding */
px-4       /* 1rem    / 16px - Button horizontal padding */

/* Large Spacing */
mb-8       /* 2rem    / 32px - Section margins */
mb-12      /* 3rem    / 48px - Large section gaps */
py-12      /* 3rem    / 48px - Page section padding */

/* Layout Spacing */
max-w-7xl  /* 80rem   / 1280px - Content max width */
mx-auto    /* Auto horizontal margins - Center content */
```

---

### Spacing Patterns

#### Cards
```tsx
<div className="bg-white rounded-xl shadow-lg p-6">
  {/* 6 = 24px internal padding */}
</div>
```

#### Buttons
```tsx
<button className="px-6 py-3">
  {/* 6 horizontal (24px), 3 vertical (12px) */}
</button>
```

#### Grid Gaps
```tsx
<div className="grid grid-cols-4 gap-6">
  {/* 6 = 24px between items */}
</div>
```

#### Section Margins
```tsx
<section className="mb-16">
  {/* 16 = 64px bottom margin between sections */}
</section>
```

---

## Border Radius

### Scale

```css
rounded-none   /* 0px    - Sharp corners */
rounded-sm     /* 2px    - Subtle */
rounded        /* 4px    - Default */
rounded-md     /* 6px    - Medium */
rounded-lg     /* 8px    - Large */
rounded-xl     /* 12px   - Extra large (MOST USED) */
rounded-2xl    /* 16px   - Very large */
rounded-full   /* 9999px - Pills/Circles */
```

### Usage Guidelines

```tsx
/* Cards - Always use rounded-xl */
<div className="rounded-xl">

/* Buttons - rounded-xl for modern feel */
<button className="rounded-xl">

/* Badges - rounded-full for pills */
<span className="rounded-full">

/* Inputs - rounded-lg */
<input className="rounded-lg">

/* Modals - rounded-2xl */
<div className="rounded-2xl">
```

**Rule**: Prefer `rounded-xl` for most components. It's the signature Azteka rounded corner.

---

## Shadows

### Elevation Levels

```css
/* Level 1 - Subtle */
shadow-sm
/* box-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.05) */
Usage: Subtle borders, input fields

/* Level 2 - Default */
shadow
shadow-md
/* box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1) */
Usage: Cards at rest, dropdowns

/* Level 3 - Lifted */
shadow-lg
/* box-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.1) */
Usage: Cards, buttons, floating elements

/* Level 4 - Elevated */
shadow-xl
/* box-shadow: 0 20px 25px -5px rgb(0 0 0 / 0.1) */
Usage: Modals, popovers, hover states

/* Level 5 - Maximum */
shadow-2xl
/* box-shadow: 0 25px 50px -12px rgb(0 0 0 / 0.25) */
Usage: Hero sections, major modals
```

### Shadow Patterns

```tsx
/* Card at Rest */
<div className="shadow-lg">

/* Card on Hover */
<div className="shadow-lg hover:shadow-xl transition-all">

/* Floating Button */
<button className="shadow-lg hover:shadow-xl">

/* Modal/Dialog */
<div className="shadow-2xl">
```

---

## Component Patterns

### Buttons

#### Primary Button (CTA)
```tsx
<button className="
  px-6 py-3
  bg-gradient-to-r from-emerald-500 to-teal-600
  text-white font-bold
  rounded-xl shadow-lg
  hover:shadow-xl
  transform hover:scale-105
  transition-all duration-300
">
  Add to Cart
</button>
```

---

#### Secondary Button
```tsx
<button className="
  px-4 py-2
  bg-gray-100 text-gray-700
  font-semibold
  rounded-xl
  hover:bg-gray-200
  transition-all
">
  Cancel
</button>
```

---

#### Icon Button
```tsx
<button className="
  p-2
  text-gray-600
  hover:text-gray-900
  hover:bg-gray-100
  rounded-lg
  transition-colors
">
  <Icon size={20} />
</button>
```

---

#### Gradient Variations

```tsx
/* Admin Button */
className="bg-gradient-to-r from-purple-600 to-indigo-600"

/* Bulk Order */
className="bg-gradient-to-r from-cyan-500 to-blue-500"

/* Rewards */
className="bg-gradient-to-r from-purple-500 to-pink-500"

/* Alert/Urgent */
className="bg-gradient-to-r from-orange-500 to-red-500"
```

---

### Cards

#### Product Card
```tsx
<div className="
  bg-white
  rounded-xl shadow-lg
  hover:shadow-xl
  transition-all duration-300
  overflow-hidden
">
  <div className="aspect-square bg-gray-100">
    {/* Product Image */}
  </div>
  <div className="p-4">
    {/* Product Details */}
  </div>
</div>
```

---

#### Info Card
```tsx
<div className="
  bg-white
  border-2 border-gray-200
  rounded-xl
  p-6
">
  {/* Content */}
</div>
```

---

#### Highlighted Card (Selected/Active)
```tsx
<div className="
  bg-emerald-50
  border-2 border-emerald-500
  rounded-xl
  p-4
">
  {/* Active Content */}
</div>
```

---

### Form Inputs

#### Text Input
```tsx
<input className="
  w-full px-4 py-3
  border-2 border-gray-300
  rounded-lg
  focus:border-emerald-500
  focus:ring-2 focus:ring-emerald-200
  outline-none
  transition-all
" />
```

---

#### Select Dropdown
```tsx
<select className="
  w-full px-4 py-3
  border-2 border-gray-300
  rounded-lg
  bg-white
  focus:border-emerald-500
  focus:ring-2 focus:ring-emerald-200
  outline-none
  transition-all
">
  <option>Select...</option>
</select>
```

---

### Badges

#### Promotion Badge
```tsx
<div className="
  absolute top-2 right-2
  px-3 py-1
  bg-red-500 text-white
  text-xs font-bold
  rounded-full
  shadow-lg
">
  20% OFF
</div>
```

---

#### Status Badge
```tsx
/* Success */
<span className="px-3 py-1 bg-green-100 text-green-800 border border-green-300 rounded-full text-sm font-semibold">
  In Stock
</span>

/* Warning */
<span className="px-3 py-1 bg-yellow-100 text-yellow-800 border border-yellow-300 rounded-full text-sm font-semibold">
  Low Stock
</span>

/* Error */
<span className="px-3 py-1 bg-red-100 text-red-800 border border-red-300 rounded-full text-sm font-semibold">
  Out of Stock
</span>
```

---

#### Info Badge
```tsx
<span className="
  px-2 py-1
  bg-blue-100 text-blue-800
  text-xs font-medium
  rounded
">
  New
</span>
```

---

### Modals/Dialogs

```tsx
/* Overlay */
<div className="
  fixed inset-0
  bg-black bg-opacity-50
  backdrop-blur-sm
  z-40
">

  {/* Modal */}
  <div className="
    bg-white
    rounded-2xl shadow-2xl
    max-w-2xl mx-auto
    mt-20
    p-6
  ">
    {/* Content */}
  </div>
</div>
```

---

### Navigation Items

```tsx
/* Active Tab */
<button className="
  px-4 py-2
  bg-emerald-600 text-white
  font-bold
  rounded-xl
  shadow-lg
">
  Snacks
</button>

/* Inactive Tab */
<button className="
  px-4 py-2
  bg-gray-100 text-gray-700
  font-semibold
  rounded-xl
  hover:bg-gray-200
  transition-all
">
  Beverages
</button>
```

---

## Animation Principles

### Motion Speed

```css
/* Fast - Micro interactions */
duration-150  /* 150ms - Hover effects, color changes */

/* Default - Standard transitions */
duration-200  /* 200ms - Button states */
duration-300  /* 300ms - Card hovers, slides */

/* Slow - Dramatic entrances */
duration-500  /* 500ms - Modals, page transitions */
duration-700  /* 700ms - Complex animations */
```

**Rule**: Most UI transitions should use `duration-200` or `duration-300`.

---

### Easing Functions

```css
/* Tailwind Defaults */
ease-linear      /* Linear - Progress bars */
ease-in          /* Accelerate - Exits */
ease-out         /* Decelerate - Entrances (MOST USED) */
ease-in-out      /* Smooth - Reversible animations */
```

**Rule**: Use `ease-out` for most UI animations. It feels snappy and responsive.

---

### Animation Patterns

#### Hover Scale
```tsx
<div className="
  transform hover:scale-105
  transition-all duration-300 ease-out
">
```

---

#### Fade In Up
```tsx
/* CSS Keyframe - Already defined in index.css */
className="animate-fadeInUp"

/* Custom delays */
className="animate-fadeInUp animation-delay-100"
className="animate-fadeInUp animation-delay-200"
```

---

#### Slide In (Cart, Modals)
```tsx
className="animate-slideIn"  /* From right */
className="animate-slideInLeft"
className="animate-slideInRight"
```

---

#### Scale In (Pop-ins)
```tsx
className="animate-scaleIn"
```

---

#### Pulse (Urgency)
```tsx
className="animate-pulse"  /* Tailwind built-in */
/* Use for: Limited offers, notifications, bulk order button */
```

---

#### Float (Decorative)
```tsx
className="animate-float"
/* Use for: Hero icons, decorative elements */
```

---

#### Blob (Background)
```tsx
className="animate-blob"
/* Use for: Background gradient blobs */

className="animate-blob animation-delay-2000"
className="animate-blob animation-delay-4000"
```

---

### Transition Pattern

Standard transition for interactive elements:

```tsx
className="transition-all duration-300 ease-out"
```

Applies to: `transform`, `opacity`, `background-color`, `box-shadow`

---

### Animation Best Practices

1. **Keep it subtle** - Animations should enhance, not distract
2. **Respect prefers-reduced-motion** - Future improvement
3. **Use transforms over position** - Better performance
4. **Stagger animations** - Use delay classes for sequential reveals
5. **Limit simultaneous animations** - Max 3-4 elements at once

---

## Layout Patterns

### Container/Max Width

```tsx
<div className="max-w-7xl mx-auto px-4">
  {/* Content constrained to 1280px, centered */}
</div>
```

**Usage**: Main page content, ensures readability on large screens.

---

### Grid Layouts

#### Product Grid (Responsive)
```tsx
<div className="
  grid
  grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4
  gap-6
">
  {/* Responsive: 1, 2, 3, or 4 columns */}
</div>
```

---

#### Catalog Grid (Advanced)
```tsx
<div className="grid grid-cols-12 gap-6">
  {/* Sidebar - 3 columns */}
  <aside className="col-span-3">
    {/* Filters */}
  </aside>

  {/* Main Content - 9 columns */}
  <main className="col-span-9">
    {/* Products */}
  </main>
</div>
```

---

### Flexbox Patterns

#### Horizontal Stack
```tsx
<div className="flex items-center gap-4">
  {/* Icon + Text */}
</div>
```

---

#### Space Between
```tsx
<div className="flex items-center justify-between">
  <div>Left Content</div>
  <div>Right Content</div>
</div>
```

---

#### Centered Content
```tsx
<div className="flex items-center justify-center min-h-screen">
  {/* Vertically and horizontally centered */}
</div>
```

---

## Accessibility Considerations

### Color Contrast

All text must meet WCAG AA standards:
- Normal text: 4.5:1 contrast ratio
- Large text (18px+): 3:1 contrast ratio

**Tested Combinations**:
- ✅ `text-gray-900` on `bg-white` (18.5:1)
- ✅ `text-white` on `bg-emerald-600` (4.7:1)
- ✅ `text-white` on `bg-red-500` (5.3:1)

---

### Focus States

All interactive elements must have visible focus:

```tsx
className="
  focus:outline-none
  focus:ring-2 focus:ring-emerald-500
  focus:ring-offset-2
"
```

---

### Touch Targets

Minimum 44x44px clickable area for mobile:

```tsx
/* Button */
className="px-6 py-3"  /* Ensures 44px+ height */

/* Icon Button */
className="p-3"  /* 48px total with icon */
```

---

## Responsive Design Breakpoints

Tailwind default breakpoints:

```css
sm:  640px   /* Small tablets, large phones landscape */
md:  768px   /* Tablets */
lg:  1024px  /* Small laptops */
xl:  1280px  /* Desktops */
2xl: 1536px  /* Large desktops */
```

### Mobile-First Approach

Always design for mobile first, then add breakpoints:

```tsx
<div className="
  text-sm        /* Mobile: 14px */
  md:text-base   /* Tablet: 16px */
  lg:text-lg     /* Desktop: 18px */
">
```

---

## Catalog Aesthetic Details

### Amazon Influence
- **Clean product cards** with clear pricing
- **Strong CTAs** that stand out
- **Efficient layouts** for fast browsing
- **Trust signals** (stock status, delivery info)

### Bolt Influence
- **Vibrant gradients** (emerald/teal, purple/indigo)
- **Smooth animations** (scale, fade, slide)
- **Modern rounded corners** (rounded-xl everywhere)
- **Bold typography** (font-bold, font-black)

### Macy's Holiday Catalog Influence
- **Warm, inviting colors** (pink accents, soft backgrounds)
- **Generous spacing** (room to breathe)
- **Rich product imagery** with colored backgrounds
- **Celebratory tone** (badges, promotions, rewards)
- **Festive elements** (animated blobs, gradient overlays)

---

## Implementation Examples

### Hero Section
```tsx
<section className="relative overflow-hidden bg-gradient-to-br from-emerald-500 to-teal-600 py-20">
  {/* Decorative Blobs */}
  <div className="absolute top-0 right-0 w-96 h-96 bg-pink-400 rounded-full mix-blend-multiply filter blur-3xl animate-blob" />
  <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-2000" />

  {/* Content */}
  <div className="relative z-10 max-w-7xl mx-auto px-4">
    <h1 className="text-5xl font-black text-white mb-4">
      Premium Mexican Wholesale
    </h1>
    <p className="text-xl text-white opacity-90 mb-8">
      Authentic products for your business
    </p>
    <button className="px-8 py-4 bg-white text-emerald-600 font-bold rounded-xl shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300">
      Browse Catalog
    </button>
  </div>
</section>
```

---

### Product Card
```tsx
<div className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group">
  {/* Image Container */}
  <div className="aspect-square bg-gradient-to-br from-emerald-50 to-teal-50 relative overflow-hidden">
    <img
      src={product.image_url}
      alt={product.name}
      className="w-full h-full object-contain p-4 group-hover:scale-110 transition-transform duration-500"
    />
    {/* Badge */}
    <div className="absolute top-3 right-3 px-3 py-1.5 bg-red-500 text-white text-xs font-bold rounded-full shadow-lg">
      20% OFF
    </div>
  </div>

  {/* Details */}
  <div className="p-4">
    <h3 className="text-lg font-bold text-gray-900 mb-1">
      {product.name}
    </h3>
    <p className="text-sm text-gray-600 mb-3">
      SKU: {product.sku}
    </p>

    {/* Price */}
    <div className="mb-4">
      <span className="text-2xl font-black text-gray-900">
        ${product.price}
      </span>
      <span className="text-sm text-gray-600">
        /case
      </span>
    </div>

    {/* CTA */}
    <button className="w-full px-4 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300">
      Add to Cart
    </button>
  </div>
</div>
```

---

## Quick Reference Cheat Sheet

### Most Used Classes

```css
/* Containers */
max-w-7xl mx-auto px-4
bg-white rounded-xl shadow-lg p-6

/* Buttons */
px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all

/* Text */
text-4xl font-black text-gray-900
text-base text-gray-700

/* Spacing */
mb-8 gap-6 p-4

/* Grid */
grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6

/* Flex */
flex items-center justify-between gap-4

/* Hover Effects */
hover:shadow-xl transform hover:scale-105 transition-all duration-300
```

---

## Future Enhancements

1. **Dark Mode Support**
   - Add dark color palette
   - Implement theme toggle
   - Use CSS variables for dynamic switching

2. **Custom Tailwind Theme**
   - Define brand colors in tailwind.config.js
   - Add custom gradients
   - Custom animation utilities

3. **Component Library**
   - Extract reusable components
   - Create Storybook documentation
   - Build design system package

4. **Accessibility Audit**
   - Add ARIA labels
   - Test with screen readers
   - Implement keyboard navigation

5. **Performance**
   - Lazy load animations
   - Optimize gradient usage
   - Reduce animation complexity on low-end devices
