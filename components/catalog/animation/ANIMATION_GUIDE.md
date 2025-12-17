# Azteka DSD Catalog - Animation Guide

Complete guide to using the animation presets library with Framer Motion.

---

## 📦 Installation

All animations are already included. Import from:

```tsx
import { shineSweep, promoBounce, glowPulse } from '@/components/catalog/animation'
```

---

## 🎨 Available Animations

### 1. **shineSweep** - Light sweep effect

**Perfect for:** Product cards, brand logos, promo panels

```tsx
import { motion } from 'framer-motion'
import { shineSweep } from '@/components/catalog/animation'

<motion.div {...shineSweep} className="glossy-card">
  <img src={product.image} alt={product.name} />
</motion.div>
```

**Variants available:**
```tsx
import { shineSweepVariants } from '@/components/catalog/animation'

<motion.div {...shineSweepVariants.slow}>Slow shine</motion.div>
<motion.div {...shineSweepVariants.medium}>Medium shine</motion.div>
<motion.div {...shineSweepVariants.fast}>Fast shine</motion.div>
```

---

### 2. **promoBounce** - Attention-grabbing bounce

**Perfect for:** Promo panels, badges, CTA buttons, discount tags

```tsx
import { promoBounce } from '@/components/catalog/animation'

<motion.div {...promoBounce} className="bg-red-500 text-white p-4 rounded-lg">
  <span className="text-2xl font-bold">50% OFF!</span>
</motion.div>
```

**Variants available:**
```tsx
import { promoBounceVariants } from '@/components/catalog/animation'

<motion.span {...promoBounceVariants.subtle}>Subtle bounce</motion.span>
<motion.span {...promoBounceVariants.medium}>Medium bounce</motion.span>
<motion.span {...promoBounceVariants.intense}>INTENSE!</motion.span>
```

---

### 3. **glowPulse** - Pulsing glow effect

**Perfect for:** Featured products, new arrivals, sale badges

```tsx
import { glowPulse } from '@/components/catalog/animation'

<motion.div {...glowPulse} className="rounded-lg p-6">
  <ProductCard product={featuredProduct} />
</motion.div>
```

**Custom colors:**
```tsx
import { glowPulseColor } from '@/components/catalog/animation'

<motion.div {...glowPulseColor('gold')}>Gold glow</motion.div>
<motion.div {...glowPulseColor('red')}>Red glow</motion.div>
<motion.div {...glowPulseColor('green')}>Green glow</motion.div>
<motion.div {...glowPulseColor('blue')}>Blue glow</motion.div>
<motion.div {...glowPulseColor('purple')}>Purple glow</motion.div>
```

---

### 4. **iconFloat** - Gentle floating animation

**Perfect for:** Background icons, seasonal decorations, category icons

```tsx
import { iconFloat } from '@/components/catalog/animation'
import { Snowflake } from 'lucide-react'

<motion.div {...iconFloat} className="absolute top-10 right-10 opacity-20">
  <Snowflake className="w-16 h-16 text-blue-300" />
</motion.div>
```

**Staggered floating (for multiple icons):**
```tsx
import { iconFloatDelayed } from '@/components/catalog/animation'

{[0, 0.5, 1, 1.5, 2].map((delay, i) => (
  <motion.div
    key={i}
    {...iconFloatDelayed(delay)}
    className="absolute"
    style={{ top: `${i * 20}%`, left: `${i * 15}%` }}
  >
    <Sparkles className="w-12 h-12 text-yellow-300 opacity-30" />
  </motion.div>
))}
```

**Variants:**
```tsx
import { iconFloatVariants } from '@/components/catalog/animation'

<motion.div {...iconFloatVariants.slow}>Slow float</motion.div>
<motion.div {...iconFloatVariants.medium}>Medium float</motion.div>
<motion.div {...iconFloatVariants.fast}>Fast float</motion.div>
```

---

### 5. **snowfallParallax** - Parallax snowfall effect

**Perfect for:** Christmas backgrounds, winter themes, festive overlays

**⚠️ Requires:** Parent container with `overflow-hidden`

```tsx
import { snowfallParallax } from '@/components/catalog/animation'
import { Snowflake } from 'lucide-react'

<div className="relative overflow-hidden h-screen">
  {/* Background snowfall */}
  {Array.from({ length: 20 }).map((_, i) => (
    <motion.div
      key={i}
      {...snowfallParallax('medium')}
      className="absolute text-white opacity-70"
      style={{
        left: `${Math.random() * 100}%`,
        animationDelay: `${Math.random() * 5}s`,
      }}
    >
      <Snowflake className="w-6 h-6" />
    </motion.div>
  ))}

  {/* Your content */}
  <HeroBanner theme="christmas" />
</div>
```

**Different speeds:**
```tsx
<motion.div {...snowfallParallax('slow')}>Slow fall</motion.div>
<motion.div {...snowfallParallax('medium')}>Medium fall</motion.div>
<motion.div {...snowfallParallax('fast')}>Fast fall</motion.div>
```

**Using variants:**
```tsx
import { snowfallVariants } from '@/components/catalog/animation'

<motion.div variants={snowfallVariants} animate="particle1">
  <Snowflake />
</motion.div>
<motion.div variants={snowfallVariants} animate="particle2">
  <Snowflake />
</motion.div>
<motion.div variants={snowfallVariants} animate="particle3">
  <Snowflake />
</motion.div>
```

---

### 6. **festiveBurst** - Explosive burst animation

**Perfect for:** Sale announcements, new product launches, achievement badges

```tsx
import { festiveBurst } from '@/components/catalog/animation'

<motion.div {...festiveBurst} className="bg-red-500 text-white p-6 rounded-full">
  <span className="text-3xl">🎉</span>
  <p className="font-bold">NEW!</p>
</motion.div>
```

**Continuous burst:**
```tsx
import { festiveBurstContinuous } from '@/components/catalog/animation'

<motion.div {...festiveBurstContinuous} className="inline-block">
  <span className="text-4xl">✨</span>
</motion.div>
```

**Occasion variants:**
```tsx
import { festiveBurstVariants } from '@/components/catalog/animation'

<motion.div variants={festiveBurstVariants} animate="christmas">
  Christmas burst!
</motion.div>

<motion.div variants={festiveBurstVariants} animate="sale">
  Sale burst!
</motion.div>

<motion.div variants={festiveBurstVariants} animate="newProduct">
  New product burst!
</motion.div>
```

---

### 7. **spotlightReveal** - Spotlight reveal effect

**Perfect for:** Hero banners, featured sections, product showcases

```tsx
import { spotlightReveal } from '@/components/catalog/animation'

<motion.div {...spotlightReveal} className="relative">
  <HeroBanner
    imageUrl="/hero-christmas.jpg"
    headline="¡Ofertas Especiales!"
  />
</motion.div>
```

**Custom spotlight position:**
```tsx
import { spotlightRevealFrom } from '@/components/catalog/animation'

<motion.div {...spotlightRevealFrom('top-left')}>
  Reveal from top-left
</motion.div>

<motion.div {...spotlightRevealFrom('center')}>
  Reveal from center
</motion.div>

<motion.div {...spotlightRevealFrom('bottom-right')}>
  Reveal from bottom-right
</motion.div>
```

**Hover tracking spotlight:**
```tsx
import { useState } from 'react'
import { spotlightHoverTracking } from '@/components/catalog/animation'

function SpotlightCard() {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 })

  return (
    <motion.div
      {...spotlightHoverTracking(mousePos.x, mousePos.y)}
      onMouseMove={(e) => {
        const rect = e.currentTarget.getBoundingClientRect()
        setMousePos({
          x: e.clientX - rect.left,
          y: e.clientY - rect.top,
        })
      }}
      className="relative w-full h-64 bg-gray-900 rounded-lg"
    >
      <p className="text-white">Move your mouse!</p>
    </motion.div>
  )
}
```

---

## 🎯 Composite Animations

Pre-built combinations for common use cases:

### **premiumProductCard**

Complete premium card animation (pop + glow + lift):

```tsx
import { premiumProductCard } from '@/components/catalog/animation'

<motion.div {...premiumProductCard} className="glossy-card">
  <GlossyProductCard product={product} />
</motion.div>
```

---

### **heroBannerEntrance**

Smooth entrance animation for hero sections:

```tsx
import { heroBannerEntrance } from '@/components/catalog/animation'

<motion.div {...heroBannerEntrance}>
  <HeroBanner
    imageUrl="/hero.jpg"
    headline="Welcome!"
    theme="christmas"
  />
</motion.div>
```

---

### **staggerContainer + staggerItem**

Staggered animation for product grids:

```tsx
import { staggerContainer, staggerItem } from '@/components/catalog/animation'

<motion.div
  variants={staggerContainer}
  initial="hidden"
  animate="visible"
  className="grid grid-cols-4 gap-6"
>
  {products.map((product) => (
    <motion.div key={product.id} variants={staggerItem}>
      <GlossyProductCard product={product} />
    </motion.div>
  ))}
</motion.div>
```

---

## 🛠️ Utility Functions

### **combineAnimations**

Combine multiple animation presets:

```tsx
import { combineAnimations, shineSweep, glowPulse } from '@/components/catalog/animation'

<motion.div {...combineAnimations(shineSweep, glowPulse)}>
  Both shine AND glow!
</motion.div>
```

---

### **withDelay**

Add delay to any animation:

```tsx
import { withDelay, promoBounce } from '@/components/catalog/animation'

<motion.div {...withDelay(promoBounce, 0.5)}>
  Delayed bounce
</motion.div>
```

---

### **respectMotionPreference**

Automatically respects user's motion preferences:

```tsx
import { respectMotionPreference, premiumProductCard } from '@/components/catalog/animation'

<motion.div {...respectMotionPreference(premiumProductCard)}>
  Accessible animation (disabled if user prefers reduced motion)
</motion.div>
```

---

## 📚 Complete Integration Example

### CatalogPage.tsx with Animations

```tsx
'use client'

import { motion } from 'framer-motion'
import {
  heroBannerEntrance,
  staggerContainer,
  staggerItem,
  premiumProductCard,
  promoBounceVariants,
  glowPulseColor,
  iconFloatDelayed,
  respectMotionPreference,
} from '@/components/catalog/animation'
import {
  HeroBanner,
  ProductGrid,
  PromoPanel,
  GlossyProductCard,
} from '@/components/catalog'
import { Sparkles, Star, Zap } from 'lucide-react'

export default function CatalogPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Floating decorative icons */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <motion.div {...iconFloatDelayed(0)} className="absolute top-20 left-10">
          <Sparkles className="w-12 h-12 text-yellow-300 opacity-20" />
        </motion.div>
        <motion.div {...iconFloatDelayed(1)} className="absolute top-40 right-20">
          <Star className="w-16 h-16 text-blue-300 opacity-20" />
        </motion.div>
        <motion.div {...iconFloatDelayed(2)} className="absolute bottom-40 left-1/4">
          <Zap className="w-14 h-14 text-purple-300 opacity-20" />
        </motion.div>
      </div>

      {/* Hero with entrance animation */}
      <motion.section {...heroBannerEntrance}>
        <HeroBanner
          imageUrl="/hero-christmas.jpg"
          headline="¡Ofertas Navideñas!"
          subheadline="Hasta 50% de Descuento"
          theme="christmas"
          overlay="festive"
        />
      </motion.section>

      {/* Featured promo with bounce */}
      <section className="container mx-auto px-6 py-12">
        <motion.div {...respectMotionPreference(promoBounceVariants.medium)}>
          <PromoPanel
            productImage="/products/featured.jpg"
            title="Oferta Especial"
            discount={50}
            description="Por tiempo limitado"
            badge="HOT"
            variant="chedraui"
          />
        </motion.div>
      </section>

      {/* Product grid with stagger animation */}
      <main className="container mx-auto px-6 py-12">
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {products.map((product) => (
            <motion.div key={product.id} variants={staggerItem}>
              <motion.div {...premiumProductCard}>
                <GlossyProductCard
                  product={product}
                  onAddToCart={() => handleAddToCart(product.id)}
                />
              </motion.div>
            </motion.div>
          ))}
        </motion.div>
      </main>

      {/* Featured product with glow */}
      <section className="container mx-auto px-6 py-12">
        <motion.div {...glowPulseColor('gold')} className="rounded-lg">
          <GlossyProductCard
            product={featuredProduct}
            featured
            onAddToCart={() => handleAddToCart(featuredProduct.id)}
          />
        </motion.div>
      </section>
    </div>
  )
}
```

---

## 🎨 Seasonal Integration

### Christmas Theme with Snowfall

```tsx
import { snowfallParallax, heroBannerEntrance } from '@/components/catalog/animation'
import { Snowflake } from 'lucide-react'

<div className="relative overflow-hidden min-h-screen">
  {/* Snowfall background */}
  {Array.from({ length: 30 }).map((_, i) => (
    <motion.div
      key={i}
      {...snowfallParallax('medium')}
      className="absolute text-white"
      style={{
        left: `${Math.random() * 100}%`,
        top: `-${Math.random() * 100}px`,
      }}
    >
      <Snowflake className="w-4 h-4 opacity-60" />
    </motion.div>
  ))}

  {/* Content */}
  <motion.div {...heroBannerEntrance}>
    <HeroBanner theme="christmas" />
  </motion.div>
</div>
```

---

## ⚡ Performance Tips

1. **Use `respectMotionPreference`** for all non-essential animations
2. **Limit snowfall particles** to ~20-30 for smooth performance
3. **Use `viewport={{ once: true }}`** for scroll-triggered animations
4. **Avoid animating expensive properties** like `filter` or `backdrop-filter`
5. **Use `will-change` sparingly** and only when needed

```tsx
// Good: Transforms and opacity
<motion.div animate={{ scale: 1.05, opacity: 0.8 }} />

// Bad: Expensive properties
<motion.div animate={{ filter: 'blur(10px)' }} />
```

---

## 🔗 Related Documentation

- [LAP3_COMPLETE.md](../../../LAP3_COMPLETE.md) - Full LAP #3 summary
- [catalog-theme-packs.ts](../../../seasons/catalog-theme-packs.ts) - Seasonal themes
- [catalog-presets.json](../../../editor/catalog-presets.json) - Editor configurations
- [AZTEKA_CATALOG_MVP_COMPONENTS.md](../../../AZTEKA_CATALOG_MVP_COMPONENTS.md) - Component API

---

## ✅ Animation Checklist

When adding animations to components:

- [ ] Import from `@/components/catalog/animation`
- [ ] Use `respectMotionPreference` for accessibility
- [ ] Test on mobile devices for performance
- [ ] Add `viewport={{ once: true }}` for scroll animations
- [ ] Combine with Tailwind visual tokens for best results
- [ ] Use appropriate animation intensity (subtle for wholesale, intense for retail)
- [ ] Test with `prefers-reduced-motion` enabled

---

**Animation library complete!** 🎉

All 7 animation presets delivered with variants, utilities, and complete examples.
