# Azteka Catalog Visual Tokens - Tailwind Extension

Add these custom classes to your `tailwind.config.js` to enable premium visual tokens across all catalog components.

## Installation

Add to your `tailwind.config.js`:

```javascript
module.exports = {
  theme: {
    extend: {
      // Background Gradients
      backgroundImage: {
        // Gold Foil Effect
        'gold-foil': 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 50%, #fbbf24 100%)',
        'gold-texture': `
          radial-gradient(circle at 30% 30%, rgba(255,255,255,0.4) 0%, transparent 50%),
          radial-gradient(circle at 70% 70%, rgba(0,0,0,0.2) 0%, transparent 50%),
          linear-gradient(135deg, #fbbf24 0%, #f59e0b 50%, #fbbf24 100%)
        `,

        // Holiday Themes
        'holiday-red': 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)',
        'holiday-green': 'linear-gradient(135deg, #16a34a 0%, #15803d 100%)',
        'festival-green': 'linear-gradient(135deg, #22c55e 0%, #16a34a 50%, #15803d 100%)',
        'christmas-gradient': 'linear-gradient(90deg, #dc2626 0%, #16a34a 50%, #dc2626 100%)',

        // Seasonal Themes
        'summer-gradient': 'linear-gradient(135deg, #06b6d4 0%, #3b82f6 50%, #a855f7 100%)',
        'dia-muertos-gradient': 'linear-gradient(135deg, #ea580c 0%, #ec4899 50%, #7e22ce 100%)',
        'posadas-gradient': 'linear-gradient(135deg, #a855f7 0%, #ec4899 50%, #a855f7 100%)',
        'new-year-gradient': 'linear-gradient(135deg, #eab308 0%, #f59e0b 50%, #eab308 100%)',

        // Promo Variants
        'chedraui-gradient': 'linear-gradient(135deg, #dc2626 0%, #f97316 100%)',
        'walmart-gradient': 'linear-gradient(135deg, #2563eb 0%, #06b6d4 100%)',

        // Premium Effects
        'glossy-card-surface': `
          linear-gradient(to bottom right, rgba(255,255,255,0.4) 0%, rgba(255,255,255,0.1) 50%, transparent 100%)
        `,
        'shine-sweep': `
          linear-gradient(to right, transparent 0%, rgba(255,255,255,0.4) 50%, transparent 100%)
        `,
        'glow-edge': `
          radial-gradient(circle at center, rgba(255,255,255,0.8) 0%, transparent 70%)
        `,
      },

      // Box Shadows
      boxShadow: {
        'glow-gold': '0 10px 40px -10px rgba(251, 191, 36, 0.5)',
        'glow-red': '0 10px 40px -10px rgba(220, 38, 38, 0.5)',
        'glow-blue': '0 10px 40px -10px rgba(59, 130, 246, 0.5)',
        'glow-purple': '0 10px 40px -10px rgba(168, 85, 247, 0.5)',
        'glow-pink': '0 10px 40px -10px rgba(236, 72, 153, 0.5)',
        'emboss-light': 'inset 0 2px 4px rgba(255,255,255,0.4), inset 0 -2px 4px rgba(0,0,0,0.1)',
        'emboss-deep': 'inset 0 4px 8px rgba(255,255,255,0.5), inset 0 -4px 8px rgba(0,0,0,0.2)',
      },

      // Animations
      animation: {
        'shine': 'shine 3s ease-in-out infinite',
        'shine-fast': 'shine 1.5s ease-in-out infinite',
        'glow-pulse': 'glow-pulse 2s ease-in-out infinite',
        'float': 'float 3s ease-in-out infinite',
        'product-pop': 'product-pop 0.3s ease-out',
        'festive-bounce': 'festive-bounce 2s ease-in-out infinite',
      },

      keyframes: {
        shine: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(200%)' },
        },
        'glow-pulse': {
          '0%, 100%': { opacity: '0.5' },
          '50%': { opacity: '1' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        'product-pop': {
          '0%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.05)' },
          '100%': { transform: 'scale(1)' },
        },
        'festive-bounce': {
          '0%, 100%': { transform: 'translateY(0) rotate(0deg)' },
          '25%': { transform: 'translateY(-10px) rotate(5deg)' },
          '75%': { transform: 'translateY(-5px) rotate(-5deg)' },
        },
      },

      // Colors (Tier System)
      colors: {
        tier: {
          a: {
            50: '#fffbeb',
            100: '#fef3c7',
            500: '#f59e0b',
            600: '#d97706',
            700: '#b45309',
          },
          b: {
            50: '#f8fafc',
            100: '#f1f5f9',
            500: '#64748b',
            600: '#475569',
            700: '#334155',
          },
          c: {
            50: '#fff7ed',
            100: '#ffedd5',
            500: '#f97316',
            600: '#ea580c',
            700: '#c2410c',
          },
        },
      },
    },
  },
  plugins: [
    // Custom utility classes
    function ({ addUtilities }) {
      const newUtilities = {
        // Glossy Card Effect
        '.glossy-card': {
          position: 'relative',
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            inset: '0',
            background: 'linear-gradient(to bottom right, rgba(255,255,255,0.4) 0%, rgba(255,255,255,0.1) 50%, transparent 100%)',
            opacity: '0.7',
            pointerEvents: 'none',
          },
        },

        // Shine Effect on Hover
        '.shine-hover': {
          position: 'relative',
          overflow: 'hidden',
          '&::after': {
            content: '""',
            position: 'absolute',
            inset: '0',
            background: 'linear-gradient(to right, transparent 0%, rgba(255,255,255,0.4) 50%, transparent 100%)',
            transform: 'translateX(-100%)',
            transition: 'transform 1s',
          },
          '&:hover::after': {
            transform: 'translateX(100%)',
          },
        },

        // Product Pop Animation on Hover
        '.product-pop-hover': {
          transition: 'transform 0.3s ease-out',
          '&:hover': {
            transform: 'scale(1.05) translateY(-5px)',
          },
        },

        // Emboss Effect
        '.embossed': {
          boxShadow: 'inset 0 2px 4px rgba(255,255,255,0.4), inset 0 -2px 4px rgba(0,0,0,0.1)',
        },

        // Glow Edge
        '.glow-edge': {
          position: 'relative',
          '&::before': {
            content: '""',
            position: 'absolute',
            inset: '-2px',
            background: 'radial-gradient(circle at center, rgba(255,255,255,0.8) 0%, transparent 70%)',
            borderRadius: 'inherit',
            opacity: '0',
            transition: 'opacity 0.3s',
          },
          '&:hover::before': {
            opacity: '1',
          },
        },

        // Festive Star Pattern
        '.posada-stars': {
          backgroundImage: `
            radial-gradient(circle at 20% 30%, rgba(255, 200, 50, 0.15) 0%, transparent 50%),
            radial-gradient(circle at 80% 70%, rgba(255, 100, 150, 0.12) 0%, transparent 50%),
            radial-gradient(circle at 50% 50%, rgba(100, 150, 255, 0.1) 0%, transparent 50%)
          `,
        },

        // Festive Edge Pattern
        '.festive-edges': {
          position: 'relative',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: '0',
            left: '0',
            right: '0',
            height: '3px',
            backgroundImage: 'repeating-linear-gradient(90deg, transparent, transparent 10px, rgba(255,255,255,0.5) 10px, rgba(255,255,255,0.5) 20px)',
            opacity: '0.3',
          },
          '&::after': {
            content: '""',
            position: 'absolute',
            bottom: '0',
            left: '0',
            right: '0',
            height: '3px',
            backgroundImage: 'repeating-linear-gradient(90deg, transparent, transparent 10px, rgba(255,255,255,0.5) 10px, rgba(255,255,255,0.5) 20px)',
            opacity: '0.3',
          },
        },
      }

      addUtilities(newUtilities)
    },
  ],
}
```

---

## Usage Examples

### Gold Foil Brand Card

```tsx
<div className="bg-gold-foil glossy-card shine-hover embossed">
  <img src={brandLogo} alt="Brand" />
</div>
```

### Holiday Product Card

```tsx
<div className="bg-christmas-gradient glossy-card product-pop-hover">
  <div className="festive-edges posada-stars">
    {/* Product content */}
  </div>
</div>
```

### Promo Panel

```tsx
<div className="bg-chedraui-gradient shine-hover shadow-glow-red">
  {/* Promo content */}
</div>
```

### Tier Badge

```tsx
<div className="bg-gradient-to-r from-tier-a-500 to-tier-a-600 shadow-glow-gold">
  Tier A - Premium
</div>
```

### Glossy Product Card

```tsx
<div className="glossy-card shine-hover glow-edge product-pop-hover">
  {/* Product content */}
</div>
```

---

## Class Reference

### Background Gradients
- `bg-gold-foil` - Gold gradient
- `bg-gold-texture` - Gold with texture overlay
- `bg-holiday-red` - Red gradient
- `bg-holiday-green` - Green gradient
- `bg-festival-green` - Bright green gradient
- `bg-christmas-gradient` - Red to green gradient
- `bg-summer-gradient` - Cyan to purple gradient
- `bg-dia-muertos-gradient` - Orange to purple gradient
- `bg-posadas-gradient` - Purple to pink gradient
- `bg-chedraui-gradient` - Red to orange gradient
- `bg-walmart-gradient` - Blue to cyan gradient

### Effects
- `glossy-card` - Glossy overlay effect
- `shine-hover` - Shine sweep on hover
- `product-pop-hover` - Scale + lift on hover
- `embossed` - Emboss shadow effect
- `glow-edge` - Glowing edge on hover
- `posada-stars` - Festive star pattern background
- `festive-edges` - Decorative edge pattern

### Shadows
- `shadow-glow-gold` - Gold glow shadow
- `shadow-glow-red` - Red glow shadow
- `shadow-glow-blue` - Blue glow shadow
- `shadow-glow-purple` - Purple glow shadow
- `shadow-glow-pink` - Pink glow shadow

### Animations
- `animate-shine` - Shine sweep animation
- `animate-shine-fast` - Fast shine animation
- `animate-glow-pulse` - Pulsing glow
- `animate-float` - Floating motion
- `animate-product-pop` - Pop scale animation
- `animate-festive-bounce` - Festive bounce

---

## Component Integration

All catalog components are compatible with these tokens. Use them to enhance visual appeal:

```tsx
// HeroBanner with tokens
<HeroBanner
  className="shine-hover"
  theme="christmas"
  // ...props
/>

// PromoPanel with tokens
<PromoPanel
  className="bg-chedraui-gradient shadow-glow-red animate-glow-pulse"
  // ...props
/>

// BrandCard with tokens
<div className="bg-gold-texture glossy-card shine-hover embossed shadow-glow-gold">
  {/* Brand content */}
</div>

// ProductCard with tokens
<div className="glossy-card product-pop-hover glow-edge">
  {/* Product content */}
</div>
```

---

**Ready to use!** Import this config and your catalog will have premium visual effects.
