# Card Animation Specification

**Document Version**: 1.0
**Last Updated**: 2025-11-18
**Purpose**: Complete animation sequences for product cards using Framer Motion

---

## Overview

This document defines ALL animation sequences for product cards, including:
- Entrance animations (viewport-triggered)
- Hover interactions
- Tap/click feedback
- Glow pulse effects
- Seasonal overlay animations (snow, sparkle, petals)

All animations use **Framer Motion v10+** and are optimized for 60fps performance.

---

## Table of Contents

1. [Entrance Animations](#1-entrance-animations)
2. [Hover Animations](#2-hover-animations)
3. [Tap Animations](#3-tap-animations)
4. [Glow Pulse Effects](#4-glow-pulse-effects)
5. [Seasonal Effects](#5-seasonal-effects)
6. [Performance Optimization](#6-performance-optimization)
7. [Accessibility Considerations](#7-accessibility-considerations)

---

## 1. Entrance Animations

### Animation 1.1: Default Card Entrance (Fade + Slide Up)

**Trigger**: Card enters viewport
**Duration**: 600ms
**Easing**: Default (ease-out)

**Framer Motion Config**:
```jsx
<motion.div
  initial={{ opacity: 0, y: 40 }}
  whileInView={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.6 }}
  viewport={{ once: true }}
>
  <ProductCard />
</motion.div>
```

**Animation Breakdown**:
```
Time:     0ms                    600ms
Opacity:  0 ─────────────────────► 1
Y-offset: 40px ──────────────────► 0px

Visual:
  0ms:    [ ]       ← Invisible, 40px below
  300ms:  [░]       ← 50% opacity, 20px below
  600ms:  [▓]       ← Full opacity, final position
```

**CSS Equivalent** (for comparison):
```css
@keyframes fadeSlideUp {
  from {
    opacity: 0;
    transform: translateY(40px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
```

---

### Animation 1.2: Staggered Grid Entrance

**Use Case**: Multiple cards entering together
**Stagger Delay**: 100ms between each card
**Max Delay**: 500ms (prevent long waits for late cards)

**Implementation**:
```jsx
{products.map((product, index) => (
  <motion.div
    key={product.id}
    initial={{ opacity: 0, y: 40 }}
    whileInView={{ opacity: 1, y: 0 }}
    transition={{
      duration: 0.6,
      delay: Math.min(index * 0.1, 0.5)  // Cap at 500ms
    }}
    viewport={{ once: true }}
  >
    <ProductCard product={product} />
  </motion.div>
))}
```

**Visual Timeline** (4 cards):
```
Card 1: ────[Enter]────────────
Card 2: ──────[Enter]──────────
Card 3: ────────[Enter]────────
Card 4: ──────────[Enter]──────
        0ms  100  200  300  400
```

---

### Animation 1.3: Scale + Fade Entrance (Alternative)

**Use Case**: Featured products, hero cards
**Duration**: 800ms
**Easing**: spring (bounce effect)

**Framer Motion Config**:
```jsx
<motion.div
  initial={{ opacity: 0, scale: 0.8 }}
  whileInView={{ opacity: 1, scale: 1 }}
  transition={{
    duration: 0.8,
    type: 'spring',
    stiffness: 100,
    damping: 15
  }}
  viewport={{ once: true }}
>
  <ProductCard />
</motion.div>
```

**Animation Curve**:
```
Scale:  0.8 ─┐
            │ ╱─╲    ← Spring bounce
            │╱   ╲
            ┘     ╲──► 1.0
        0ms      800ms
```

---

## 2. Hover Animations

### Animation 2.1: Card Container Hover

**Trigger**: Mouse enters card area
**Duration**: 500ms
**Properties**: scale, shadow

**Tailwind Implementation**:
```jsx
<div className="transform transition-all duration-500
                hover:scale-105 shadow-lg hover:shadow-2xl">
```

**Framer Motion Alternative**:
```jsx
<motion.div
  whileHover={{
    scale: 1.05,
    boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)',
    transition: { duration: 0.5 }
  }}
>
```

**Animation Breakdown**:
```
Property      | Default     | Hover       | Δ
--------------+-------------+-------------+--------
Scale         | 1.0         | 1.05        | +5%
Shadow        | shadow-lg   | shadow-2xl  | Larger
Cursor        | pointer     | pointer     | —

Timing:
  0ms:    Scale 1.0, normal shadow
  250ms:  Scale 1.025, medium shadow
  500ms:  Scale 1.05, large shadow
```

---

### Animation 2.2: Product Image Hover

**Trigger**: Card hover (uses `group` pattern)
**Duration**: 700ms (slower than card for premium feel)
**Properties**: scale, rotate

**Tailwind Implementation**:
```jsx
<img className="transform transition-transform duration-700
                group-hover:scale-110 group-hover:rotate-2" />
```

**Visual Effect**:
```
Normal:          Hover:
┌─────┐          ┌─────┐
│  🥤 │    →     │  🥤  │  ← 10% larger + 2° tilt
└─────┘          └─────┘
```

**Rotation Values**:
- Rotate: 2deg (subtle tilt, not overwhelming)
- Direction: Clockwise
- Origin: Center

---

### Animation 2.3: Hover Overlay Gradient

**Trigger**: Card hover
**Duration**: 500ms
**Effect**: Gradient overlay fades in

**Implementation**:
```jsx
<div className="absolute inset-0 bg-gradient-to-br
                from-white/20 to-transparent
                opacity-0 group-hover:opacity-100
                transition-opacity duration-500" />
```

**Visual Effect**:
```
Before Hover:          After Hover:
┌──────────────┐      ┌──────────────┐
│              │      │░░            │ ← White gradient
│              │  →   │  ░░          │   overlay appears
│              │      │    ░░        │
└──────────────┘      └──────────────┘
```

---

### Animation 2.4: Button Gradient Swap

**Trigger**: Button hover
**Duration**: 300ms
**Effect**: Gradient reverses direction

**Implementation**:
```jsx
<button className="relative overflow-hidden
                   bg-gradient-to-r from-emerald-500 to-teal-600">
  {/* Reverse gradient (hidden by default) */}
  <div className="absolute inset-0
                  bg-gradient-to-r from-teal-600 to-emerald-500
                  opacity-0 group-hover/btn:opacity-100
                  transition-opacity duration-300" />

  {/* Button text */}
  <span className="relative">Add to Cart</span>
</button>
```

**Visual Transition**:
```
Default:         Hover:
┌──────────┐     ┌──────────┐
│ ▓▓░░    │  →  │    ░░▓▓ │  ← Colors swap
└──────────┘     └──────────┘
 Emerald→Teal    Teal→Emerald
```

---

## 3. Tap Animations

### Animation 3.1: Button Tap (Mobile)

**Trigger**: Touch/click on button
**Duration**: 200ms (quick feedback)
**Effect**: Scale down + scale up

**Framer Motion Config**:
```jsx
<motion.button
  whileTap={{ scale: 0.95 }}
  transition={{ duration: 0.2 }}
>
  Add to Cart
</motion.button>
```

**Animation Timeline**:
```
Time:    0ms      100ms     200ms
Scale:   1.0  →   0.95  →   1.0

Visual:
  0ms:   [  Button  ]      ← Normal
  100ms: [ Button ]        ← Slightly smaller
  200ms: [  Button  ]      ← Back to normal
```

---

### Animation 3.2: Card Tap (Mobile)

**Trigger**: Tap entire card (mobile only)
**Duration**: 150ms
**Effect**: Subtle scale pulse

**Framer Motion Config**:
```jsx
<motion.div
  whileTap={{ scale: 0.98 }}
  transition={{ duration: 0.15 }}
>
  <ProductCard />
</motion.div>
```

**Difference from Button**:
- Smaller scale change (0.98 vs 0.95)
- Faster duration (150ms vs 200ms)
- Subtler feedback (entire card vs button)

---

### Animation 3.3: Badge Tap (Future: Quick Add)

**Use Case**: Tap badge to quick-add product
**Duration**: 300ms
**Effect**: Scale pulse + color flash

**Framer Motion Config**:
```jsx
<motion.button
  whileTap={{
    scale: [1, 1.2, 1],
    backgroundColor: ['#EF4444', '#FBBF24', '#EF4444']
  }}
  transition={{ duration: 0.3 }}
>
  {badgeText}
</motion.button>
```

**Visual Effect**:
```
Time:     0ms      150ms     300ms
Scale:    1.0  →   1.2   →   1.0
Color:    Red  →   Yellow →  Red

Effect: "Pulse" animation on tap
```

---

## 4. Glow Pulse Effects

### Animation 4.1: Continuous Glow Pulse

**Use Case**: Promotion badges, featured items
**Duration**: 3000ms (3 seconds per cycle)
**Loop**: Infinite

**CSS Keyframes**:
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

**Framer Motion Alternative**:
```jsx
<motion.div
  animate={{
    filter: ['brightness(1)', 'brightness(1.15)', 'brightness(1)'],
    scale: [1, 1.02, 1]
  }}
  transition={{
    duration: 3,
    repeat: Infinity,
    ease: 'easeInOut'
  }}
>
  <Badge />
</motion.div>
```

**Visual Timeline**:
```
Brightness: 1.0 ──╱──╲──  (cycles forever)
                 0s  1.5s  3s
```

---

### Animation 4.2: Tailwind Pulse (Opacity Only)

**Use Case**: Simple attention-grabber
**Duration**: 2000ms
**Loop**: Infinite

**Implementation**:
```jsx
<div className="animate-pulse">
  SALE
</div>
```

**Built-in Keyframes**:
```css
@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}
```

---

### Animation 4.3: Shadow Pulse (Glow Presets)

**Use Case**: Dynamic glow effects on hover
**Duration**: 2000ms
**Trigger**: Hover

**CSS Implementation**:
```css
@keyframes shadow-pulse {
  0%, 100% {
    box-shadow: 0 15px 45px rgba(251,191,36,0.45);
  }
  50% {
    box-shadow: 0 15px 60px rgba(251,191,36,0.7);
  }
}

.glow-hover:hover {
  animation: shadow-pulse 2s ease-in-out infinite;
}
```

**Effect**: Shadow "breathes" on hover, intensifying and fading

---

## 5. Seasonal Effects

### Animation 5.1: Falling Snowflakes (Winter)

**Season**: December - February
**Particle Count**: 20-30 per card
**Duration**: Random 8-15 seconds per snowflake
**Loop**: Infinite

**Framer Motion Config**:
```jsx
function SnowflakeOverlay() {
  const snowflakes = Array.from({ length: 25 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,  // Random horizontal position (%)
    delay: Math.random() * 5,  // Stagger start time
    duration: 8 + Math.random() * 7  // 8-15 seconds
  }));

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {snowflakes.map(flake => (
        <motion.div
          key={flake.id}
          className="absolute w-2 h-2 bg-white/70 rounded-full"
          style={{ left: `${flake.x}%`, top: '-10px' }}
          animate={{
            y: ['0vh', '110vh'],
            x: [0, Math.sin(flake.id) * 30],  // Gentle sway
            opacity: [0, 0.7, 0.7, 0]
          }}
          transition={{
            duration: flake.duration,
            delay: flake.delay,
            repeat: Infinity,
            ease: 'linear'
          }}
        />
      ))}
    </div>
  );
}
```

**Visual Effect**:
```
Start:                 End:
  ❄
    ❄
      ❄
        ❄           ❄
          ❄           ❄
                        ❄
                          ❄
(Snowflakes fall and sway gently)
```

---

### Animation 5.2: Sparkle Shimmer (Luxury/Premium)

**Use Case**: Premium products, gold-tier items
**Particle Count**: 5-8 sparkles
**Duration**: Random 2-4 seconds per sparkle
**Loop**: Infinite

**Framer Motion Config**:
```jsx
function SparkleOverlay() {
  const sparkles = Array.from({ length: 6 }, (_, i) => ({
    id: i,
    x: 20 + Math.random() * 60,  // Center region
    y: 20 + Math.random() * 60,
    delay: Math.random() * 3,
    duration: 2 + Math.random() * 2
  }));

  return (
    <div className="absolute inset-0 pointer-events-none">
      {sparkles.map(sparkle => (
        <motion.div
          key={sparkle.id}
          className="absolute w-1 h-1"
          style={{
            left: `${sparkle.x}%`,
            top: `${sparkle.y}%`,
            background: 'radial-gradient(circle, #FFD700 0%, transparent 70%)'
          }}
          animate={{
            scale: [0, 1.5, 0],
            opacity: [0, 1, 0],
            rotate: [0, 180]
          }}
          transition={{
            duration: sparkle.duration,
            delay: sparkle.delay,
            repeat: Infinity,
            ease: 'easeInOut'
          }}
        />
      ))}
    </div>
  );
}
```

**Visual Effect**:
```
✨  Sparkles appear, grow, rotate, fade
    Random positions
    Staggered timing
    Creates "shimmering" effect
```

---

### Animation 5.3: Falling Petals (Spring)

**Season**: March - May
**Particle Count**: 15-20 petals
**Duration**: 10-18 seconds per petal
**Loop**: Infinite

**Framer Motion Config**:
```jsx
function PetalOverlay() {
  const petals = Array.from({ length: 18 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    delay: Math.random() * 6,
    duration: 10 + Math.random() * 8,
    rotateAmount: 360 + Math.random() * 720  // 1-3 spins
  }));

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {petals.map(petal => (
        <motion.div
          key={petal.id}
          className="absolute text-2xl"
          style={{ left: `${petal.x}%`, top: '-20px' }}
          animate={{
            y: ['0vh', '110vh'],
            x: [0, Math.sin(petal.id * 2) * 50],  // Wider sway than snow
            rotate: [0, petal.rotateAmount],
            opacity: [0, 0.8, 0.8, 0]
          }}
          transition={{
            duration: petal.duration,
            delay: petal.delay,
            repeat: Infinity,
            ease: 'linear'
          }}
        >
          🌸
        </motion.div>
      ))}
    </div>
  );
}
```

**Visual Effect**:
```
🌸 Petals fall, sway, and spin
   Gentle rotation
   Pink/white colors
   Spring theme
```

---

### Animation 5.4: Confetti Burst (Celebration)

**Use Case**: New product launch, special promotions
**Trigger**: On component mount (one-time)
**Particle Count**: 50-100
**Duration**: 3 seconds total

**Framer Motion Config**:
```jsx
function ConfettiBurst() {
  const confetti = Array.from({ length: 60 }, (_, i) => ({
    id: i,
    x: 50 + (Math.random() - 0.5) * 100,  // Spread from center
    y: -50 + Math.random() * 50,
    color: ['#FF0000', '#00FF00', '#0000FF', '#FFFF00', '#FF00FF'][i % 5],
    rotation: Math.random() * 360
  }));

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {confetti.map(piece => (
        <motion.div
          key={piece.id}
          className="absolute w-2 h-2 rounded-sm"
          style={{
            left: `${piece.x}%`,
            top: `${piece.y}%`,
            backgroundColor: piece.color
          }}
          initial={{ opacity: 1, scale: 1 }}
          animate={{
            y: [0, 120],
            x: [0, (Math.random() - 0.5) * 200],
            rotate: [piece.rotation, piece.rotation + 720],
            opacity: [1, 1, 0]
          }}
          transition={{
            duration: 3,
            ease: 'easeOut'
          }}
        />
      ))}
    </div>
  );
}
```

**Visual Effect**:
```
Explosion from center:
    ╱ ╲
   ╱   ╲  ← Confetti bursts outward
  ╱     ╲    Falls and spins
 ─────────   Fades away after 3s
```

---

## 6. Performance Optimization

### Optimization 6.1: GPU Acceleration

**Use ONLY transform and opacity** (GPU-accelerated):

```jsx
// ✅ GOOD - GPU accelerated
<motion.div
  animate={{
    transform: 'translateY(0px) scale(1)',  // GPU
    opacity: 1  // GPU
  }}
/>

// ❌ BAD - CPU intensive
<motion.div
  animate={{
    height: '200px',  // Triggers layout
    marginTop: '20px',  // Triggers layout
    backgroundColor: '#FF0000'  // Triggers paint
  }}
/>
```

**Allowed Properties**:
- ✅ `transform` (translate, scale, rotate)
- ✅ `opacity`
- ✅ `filter` (use sparingly)

**Avoid**:
- ❌ `width`, `height`
- ❌ `margin`, `padding`
- ❌ `top`, `left` (use `transform` instead)

---

### Optimization 6.2: Will-Change Hint

**For frequently animated elements**:

```css
.product-card {
  will-change: transform, opacity;
}

/* Remove after animation completes */
.product-card.animated {
  will-change: auto;
}
```

**Framer Motion applies this automatically**, but you can add manually for non-FM animations.

---

### Optimization 6.3: Reduce Motion Preference

**Respect user accessibility settings**:

```jsx
import { useReducedMotion } from 'framer-motion';

function ProductCard() {
  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.div
      initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: shouldReduceMotion ? 0 : 0.6 }}
    >
      {/* Card content */}
    </motion.div>
  );
}
```

**Effect**: Disables animations for users with motion sensitivity.

---

### Optimization 6.4: Lazy Loading Animations

**Don't animate offscreen cards**:

```jsx
<motion.div
  viewport={{ once: true }}  // Only animate on first view
>
```

**Saves performance** by not re-animating when scrolling back up.

---

## 7. Accessibility Considerations

### Accessibility 7.1: Focus Visible

**Ensure animations don't hide focus states**:

```jsx
<motion.button
  whileHover={{ scale: 1.05 }}
  className="focus:outline-none focus:ring-4 focus:ring-emerald-500/50"
>
  Add to Cart
</motion.button>
```

**Focus ring must remain visible during all animations**.

---

### Accessibility 7.2: Reduced Motion

**CSS fallback**:

```css
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

**Applies to ALL animations**, even outside Framer Motion.

---

### Accessibility 7.3: Animation Announcements

**For seasonal effects that add context**:

```jsx
<div
  role="img"
  aria-label="Winter holiday theme with falling snowflakes"
  className="snowflake-overlay"
>
  <SnowflakeOverlay />
</div>
```

**Screen readers announce the theme** without describing each individual particle.

---

## Summary

This animation spec defines:

✅ **Entrance Animations**: Fade+slide, stagger, scale+fade (3 variants)
✅ **Hover Animations**: Card scale, image transform, gradient overlay, button swap (4 effects)
✅ **Tap Animations**: Button, card, badge (3 feedback types)
✅ **Glow Pulse**: Continuous, opacity-only, shadow pulse (3 techniques)
✅ **Seasonal Effects**: Snowflakes, sparkles, petals, confetti (4 themes)
✅ **Performance**: GPU acceleration, will-change, reduced motion
✅ **Accessibility**: Focus states, motion preferences, announcements

**All animations**:
- Use Framer Motion v10+
- Target 60fps performance
- Respect `prefers-reduced-motion`
- Maintain focus visibility
- Use GPU-accelerated properties

**Timing Standards**:
- Entrance: 600ms
- Hover: 500ms (card), 700ms (image)
- Tap: 150-200ms
- Pulse: 2-3 seconds
- Seasonal: 8-18 seconds per particle

**Related Documentation**:
- [Card Engine Overview](./card-engine-overview.md)
- [Card Rendering Rules](./card-rendering-rules.md)
- [Card Preset Definitions](./card-preset-definitions.md)
- [Card Template Wiring](./card-template-wiring.md)
