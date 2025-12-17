# Visual Presets Library

**Document Version**: 1.0
**Last Updated**: 2025-11-18
**Purpose**: Define all available visual presets for product cards in the admin menu editor

---

## Overview

This document catalogs 25+ named visual presets that admins can apply to products in the menu editor. Each preset includes:

- **Gradient colors** (start/end hex values)
- **Tailwind CSS classes** for implementation
- **Recommended use cases** (product types, seasons, themes)
- **Preview examples**

Presets are organized into themed collections for easy browsing.

---

## 1. Fiesta Gradients (Mexican-Inspired)

Vibrant, celebratory gradients inspired by traditional Mexican color palettes. Perfect for festive products, party items, and cultural celebrations.

### Fiesta-01: Sunset Mango
```javascript
{
  name: "Fiesta-01",
  displayName: "Sunset Mango",
  gradientStart: "#FF6B35",  // Warm orange
  gradientEnd: "#F7931E",    // Golden yellow
  tailwindClasses: "bg-gradient-to-br from-orange-500 via-orange-400 to-amber-400",
  recommendedFor: ["Chips", "Snacks", "Citrus drinks", "Party items"],
  textColor: "text-white",
  cardTheme: "elevated"
}
```

### Fiesta-02: Coral Picante
```javascript
{
  name: "Fiesta-02",
  displayName: "Coral Picante",
  gradientStart: "#FF4757",  // Hot pink-red
  gradientEnd: "#FF6348",    // Coral
  tailwindClasses: "bg-gradient-to-br from-red-500 via-rose-400 to-coral-400",
  recommendedFor: ["Spicy snacks", "Hot sauces", "Energy drinks", "Bold candies"],
  textColor: "text-white",
  cardTheme: "neon"
}
```

### Fiesta-03: Lime Zest
```javascript
{
  name: "Fiesta-03",
  displayName: "Lime Zest",
  gradientStart: "#A8E063",  // Bright lime
  gradientEnd: "#56AB2F",    // Deep green
  tailwindClasses: "bg-gradient-to-br from-lime-400 via-green-400 to-green-600",
  recommendedFor: ["Lime products", "Fresh produce", "Health drinks", "Vegetarian items"],
  textColor: "text-white",
  cardTheme: "elevated"
}
```

### Fiesta-04: Turquoise Wave
```javascript
{
  name: "Fiesta-04",
  displayName: "Turquoise Wave",
  gradientStart: "#00D2FF",  // Cyan
  gradientEnd: "#3A7BD5",    // Ocean blue
  tailwindClasses: "bg-gradient-to-br from-cyan-400 via-sky-500 to-blue-600",
  recommendedFor: ["Beverages", "Water products", "Cooling items", "Summer specials"],
  textColor: "text-white",
  cardTheme: "glass"
}
```

### Fiesta-05: Magenta Fiesta
```javascript
{
  name: "Fiesta-05",
  displayName: "Magenta Fiesta",
  gradientStart: "#EC008C",  // Hot magenta
  gradientEnd: "#FC6767",    // Coral pink
  tailwindClasses: "bg-gradient-to-br from-pink-600 via-pink-500 to-rose-400",
  recommendedFor: ["Candy", "Berry flavors", "Party decorations", "Valentine's items"],
  textColor: "text-white",
  cardTheme: "neon"
}
```

### Fiesta-06: Golden Tamarindo
```javascript
{
  name: "Fiesta-06",
  displayName: "Golden Tamarindo",
  gradientStart: "#F09819",  // Golden orange
  gradientEnd: "#EDDE5D",    // Yellow
  tailwindClasses: "bg-gradient-to-br from-orange-400 via-amber-400 to-yellow-400",
  recommendedFor: ["Tamarind candies", "Tropical items", "Premium snacks", "Gold-tier products"],
  textColor: "text-gray-900",
  cardTheme: "elevated"
}
```

### Fiesta-07: Purple Passion
```javascript
{
  name: "Fiesta-07",
  displayName: "Purple Passion",
  gradientStart: "#667EEA",  // Violet
  gradientEnd: "#764BA2",    // Deep purple
  tailwindClasses: "bg-gradient-to-br from-violet-500 via-purple-500 to-purple-700",
  recommendedFor: ["Grape products", "Premium items", "Exotic flavors", "Luxury brands"],
  textColor: "text-white",
  cardTheme: "elevated"
}
```

### Fiesta-08: Chili Rojo
```javascript
{
  name: "Fiesta-08",
  displayName: "Chili Rojo",
  gradientStart: "#C33764",  // Deep red
  gradientEnd: "#1D2671",    // Dark navy
  tailwindClasses: "bg-gradient-to-br from-red-700 via-red-800 to-slate-900",
  recommendedFor: ["Spicy products", "Bold flavors", "Premium meats", "Evening snacks"],
  textColor: "text-white",
  cardTheme: "elevated"
}
```

---

## 2. Candy Tones (Sweet Pastels)

Soft, inviting gradients perfect for candy, desserts, and gentle product categories.

### Candy-01: Cotton Candy
```javascript
{
  name: "Candy-01",
  displayName: "Cotton Candy",
  gradientStart: "#FEC1EA",  // Light pink
  gradientEnd: "#B4E4FF",    // Baby blue
  tailwindClasses: "bg-gradient-to-br from-pink-200 via-pink-100 to-blue-100",
  recommendedFor: ["Soft candies", "Marshmallows", "Kids' items", "Sweet treats"],
  textColor: "text-gray-800",
  cardTheme: "flat"
}
```

### Candy-02: Mint Cream
```javascript
{
  name: "Candy-02",
  displayName: "Mint Cream",
  gradientStart: "#D4F1F4",  // Mint
  gradientEnd: "#B8E6E1",    // Seafoam
  tailwindClasses: "bg-gradient-to-br from-teal-100 via-cyan-50 to-emerald-100",
  recommendedFor: ["Mint products", "Fresh items", "Cooling gum", "Health products"],
  textColor: "text-gray-800",
  cardTheme: "flat"
}
```

### Candy-03: Peach Sorbet
```javascript
{
  name: "Candy-03",
  displayName: "Peach Sorbet",
  gradientStart: "#FFD3A5",  // Peach
  gradientEnd: "#FD6585",    // Coral pink
  tailwindClasses: "bg-gradient-to-br from-orange-200 via-peach-200 to-pink-300",
  recommendedFor: ["Fruit candies", "Peach items", "Summer treats", "Sorbet products"],
  textColor: "text-gray-800",
  cardTheme: "flat"
}
```

### Candy-04: Lavender Dream
```javascript
{
  name: "Candy-04",
  displayName: "Lavender Dream",
  gradientStart: "#E0C3FC",  // Light lavender
  gradientEnd: "#8EC5FC",    // Sky blue
  tailwindClasses: "bg-gradient-to-br from-purple-200 via-violet-100 to-blue-200",
  recommendedFor: ["Floral items", "Relaxation products", "Premium treats", "Spa items"],
  textColor: "text-gray-800",
  cardTheme: "glass"
}
```

### Candy-05: Lemon Sherbet
```javascript
{
  name: "Candy-05",
  displayName: "Lemon Sherbet",
  gradientStart: "#FFF9C4",  // Pale yellow
  gradientEnd: "#FFF59D",    // Light lemon
  tailwindClasses: "bg-gradient-to-br from-yellow-100 via-yellow-50 to-amber-100",
  recommendedFor: ["Lemon candies", "Citrus items", "Light snacks", "Refreshing treats"],
  textColor: "text-gray-800",
  cardTheme: "flat"
}
```

### Candy-06: Strawberry Cream
```javascript
{
  name: "Candy-06",
  displayName: "Strawberry Cream",
  gradientStart: "#FFD6E8",  // Pink cream
  gradientEnd: "#FFA3D7",    // Rose pink
  tailwindClasses: "bg-gradient-to-br from-pink-100 via-rose-100 to-pink-300",
  recommendedFor: ["Strawberry items", "Cream candies", "Milkshakes", "Valentine's treats"],
  textColor: "text-gray-800",
  cardTheme: "flat"
}
```

---

## 3. Beverage Splashes (Dynamic Refreshing)

Bold, energetic gradients designed for beverages and refreshing products.

### Splash-01: Cola Classic
```javascript
{
  name: "Splash-01",
  displayName: "Cola Classic",
  gradientStart: "#8B0000",  // Dark red
  gradientEnd: "#2C0703",    // Almost black
  tailwindClasses: "bg-gradient-to-br from-red-900 via-red-950 to-gray-950",
  recommendedFor: ["Cola drinks", "Dark sodas", "Energy drinks", "Bold beverages"],
  textColor: "text-white",
  cardTheme: "elevated"
}
```

### Splash-02: Orange Crush
```javascript
{
  name: "Splash-02",
  displayName: "Orange Crush",
  gradientStart: "#FF8C00",  // Dark orange
  gradientEnd: "#FFD700",    // Gold
  tailwindClasses: "bg-gradient-to-br from-orange-600 via-orange-400 to-yellow-400",
  recommendedFor: ["Orange sodas", "Citrus drinks", "Vitamin C products", "Energy beverages"],
  textColor: "text-white",
  cardTheme: "neon"
}
```

### Splash-03: Electric Blue
```javascript
{
  name: "Splash-03",
  displayName: "Electric Blue",
  gradientStart: "#00B4DB",  // Electric cyan
  gradientEnd: "#0083B0",    // Deep blue
  tailwindClasses: "bg-gradient-to-br from-cyan-500 via-blue-500 to-blue-700",
  recommendedFor: ["Sports drinks", "Energy drinks", "Water products", "Cool beverages"],
  textColor: "text-white",
  cardTheme: "glass"
}
```

### Splash-04: Lime Splash
```javascript
{
  name: "Splash-04",
  displayName: "Lime Splash",
  gradientStart: "#C6EA8D",  // Pale lime
  gradientEnd: "#39B54A",    // Bright green
  tailwindClasses: "bg-gradient-to-br from-lime-300 via-green-400 to-green-600",
  recommendedFor: ["Lime drinks", "Lemon-lime sodas", "Green energy drinks", "Fresh juices"],
  textColor: "text-white",
  cardTheme: "elevated"
}
```

### Splash-05: Grape Soda
```javascript
{
  name: "Splash-05",
  displayName: "Grape Soda",
  gradientStart: "#9D50BB",  // Purple
  gradientEnd: "#6E48AA",    // Deep purple
  tailwindClasses: "bg-gradient-to-br from-purple-500 via-purple-600 to-purple-800",
  recommendedFor: ["Grape sodas", "Purple drinks", "Berry beverages", "Exotic juices"],
  textColor: "text-white",
  cardTheme: "elevated"
}
```

---

## 4. Premium Metallic Themes

Sophisticated gradients with metallic accents for premium and luxury products.

### Premium-01: Gold Standard
```javascript
{
  name: "Premium-01",
  displayName: "Gold Standard",
  gradientStart: "#FFD700",  // Gold
  gradientEnd: "#B8860B",    // Dark goldenrod
  tailwindClasses: "bg-gradient-to-br from-yellow-400 via-amber-500 to-yellow-700",
  recommendedFor: ["Premium brands", "Luxury items", "Gold-tier products", "Special editions"],
  textColor: "text-gray-900",
  cardTheme: "elevated",
  glowEffect: "shadow-[0_0_30px_rgba(255,215,0,0.5)]"
}
```

### Premium-02: Silver Frost
```javascript
{
  name: "Premium-02",
  displayName: "Silver Frost",
  gradientStart: "#E8E8E8",  // Light silver
  gradientEnd: "#8E8E93",    // Dark silver
  tailwindClasses: "bg-gradient-to-br from-gray-200 via-gray-300 to-gray-500",
  recommendedFor: ["Premium water", "Tech products", "Modern brands", "Platinum items"],
  textColor: "text-gray-900",
  cardTheme: "glass",
  glowEffect: "shadow-[0_0_30px_rgba(200,200,200,0.6)]"
}
```

### Premium-03: Bronze Glow
```javascript
{
  name: "Premium-03",
  displayName: "Bronze Glow",
  gradientStart: "#CD7F32",  // Bronze
  gradientEnd: "#8B4513",    // Saddle brown
  tailwindClasses: "bg-gradient-to-br from-orange-600 via-amber-700 to-brown-700",
  recommendedFor: ["Chocolate items", "Coffee products", "Artisan brands", "Bronze-tier"],
  textColor: "text-white",
  cardTheme: "elevated",
  glowEffect: "shadow-[0_0_30px_rgba(205,127,50,0.4)]"
}
```

### Premium-04: Rose Gold
```javascript
{
  name: "Premium-04",
  displayName: "Rose Gold",
  gradientStart: "#E0BFB8",  // Rose gold light
  gradientEnd: "#B76E79",    // Rose gold dark
  tailwindClasses: "bg-gradient-to-br from-rose-200 via-pink-300 to-rose-400",
  recommendedFor: ["Feminine products", "Luxury treats", "Special occasions", "Valentine's"],
  textColor: "text-gray-900",
  cardTheme: "elevated",
  glowEffect: "shadow-[0_0_30px_rgba(224,191,184,0.5)]"
}
```

### Premium-05: Platinum Shimmer
```javascript
{
  name: "Premium-05",
  displayName: "Platinum Shimmer",
  gradientStart: "#F0F0F0",  // Platinum light
  gradientEnd: "#A9A9A9",    // Dark gray
  tailwindClasses: "bg-gradient-to-br from-slate-100 via-gray-200 to-slate-400",
  recommendedFor: ["Ultra-premium", "Exclusive items", "Limited editions", "Top-tier"],
  textColor: "text-gray-900",
  cardTheme: "glass",
  glowEffect: "shadow-[0_0_40px_rgba(240,240,240,0.7)]"
}
```

---

## 5. Holiday Overlay Packs

Seasonal overlays that can be applied on top of existing gradients for holiday-themed promotions.

### Holiday-Winter: Snowy Wonderland
```javascript
{
  name: "Holiday-Winter",
  displayName: "Snowy Wonderland",
  baseGradient: {
    gradientStart: "#E6F7FF",  // Ice blue
    gradientEnd: "#B3E0FF"     // Sky blue
  },
  overlayPattern: "snowflakes",  // CSS background pattern
  accentColor: "#0066CC",        // Deep winter blue
  badgeText: "Winter Special",
  badgeColor: "blue",
  tailwindClasses: "bg-gradient-to-br from-sky-100 via-blue-50 to-cyan-100",
  overlayCSS: `
    background-image:
      radial-gradient(circle at 20% 30%, rgba(255,255,255,0.8) 2px, transparent 2px),
      radial-gradient(circle at 60% 70%, rgba(255,255,255,0.6) 1px, transparent 1px),
      radial-gradient(circle at 80% 20%, rgba(255,255,255,0.7) 1.5px, transparent 1.5px);
    background-size: 100px 100px, 150px 150px, 120px 120px;
  `,
  seasonDates: "December 1 - February 28",
  recommendedFor: ["Holiday items", "Winter products", "Christmas specials", "New Year treats"]
}
```

### Holiday-Spring: Blossom Fresh
```javascript
{
  name: "Holiday-Spring",
  displayName: "Blossom Fresh",
  baseGradient: {
    gradientStart: "#FFE5EC",  // Soft pink
    gradientEnd: "#D4F1F4"     // Mint
  },
  overlayPattern: "petals",
  accentColor: "#FF69B4",  // Hot pink
  badgeText: "Spring Fresh",
  badgeColor: "pink",
  tailwindClasses: "bg-gradient-to-br from-pink-100 via-rose-50 to-teal-50",
  overlayCSS: `
    background-image:
      radial-gradient(ellipse at 25% 25%, rgba(255,182,193,0.3) 8px, transparent 8px),
      radial-gradient(ellipse at 75% 75%, rgba(255,192,203,0.25) 6px, transparent 6px);
    background-size: 80px 80px, 120px 120px;
  `,
  seasonDates: "March 1 - May 31",
  recommendedFor: ["Easter items", "Fresh produce", "Floral products", "Spring refreshments"]
}
```

### Holiday-Summer: Sunshine Vibes
```javascript
{
  name: "Holiday-Summer",
  displayName: "Sunshine Vibes",
  baseGradient: {
    gradientStart: "#FFF9C4",  // Pale yellow
    gradientEnd: "#FFD54F"     // Amber
  },
  overlayPattern: "sun-rays",
  accentColor: "#FF6F00",  // Deep orange
  badgeText: "Summer Hit",
  badgeColor: "orange",
  tailwindClasses: "bg-gradient-to-br from-yellow-100 via-amber-100 to-orange-200",
  overlayCSS: `
    background-image:
      linear-gradient(45deg, rgba(255,193,7,0.1) 25%, transparent 25%),
      linear-gradient(-45deg, rgba(255,193,7,0.1) 25%, transparent 25%);
    background-size: 60px 60px;
  `,
  seasonDates: "June 1 - August 31",
  recommendedFor: ["Summer beverages", "BBQ items", "Tropical treats", "Cooling products"]
}
```

### Holiday-Fall: Autumn Harvest
```javascript
{
  name: "Holiday-Fall",
  displayName: "Autumn Harvest",
  baseGradient: {
    gradientStart: "#FF9800",  // Orange
    gradientEnd: "#8B4513"     // Saddle brown
  },
  overlayPattern: "leaves",
  accentColor: "#D2691E",  // Chocolate
  badgeText: "Fall Favorite",
  badgeColor: "orange",
  tailwindClasses: "bg-gradient-to-br from-orange-400 via-amber-600 to-brown-600",
  overlayCSS: `
    background-image:
      url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><path d="M50,10 Q60,30 50,50 Q40,30 50,10" fill="rgba(139,69,19,0.2)"/></svg>');
    background-size: 40px 40px;
  `,
  seasonDates: "September 1 - November 30",
  recommendedFor: ["Pumpkin spice", "Thanksgiving items", "Harvest products", "Cozy treats"]
}
```

### Holiday-Valentine: Love & Romance
```javascript
{
  name: "Holiday-Valentine",
  displayName: "Love & Romance",
  baseGradient: {
    gradientStart: "#FF1744",  // Red accent
    gradientEnd: "#F50057"     // Pink accent
  },
  overlayPattern: "hearts",
  accentColor: "#E91E63",  // Pink
  badgeText: "Valentine's",
  badgeColor: "red",
  tailwindClasses: "bg-gradient-to-br from-red-400 via-pink-400 to-rose-500",
  overlayCSS: `
    background-image:
      radial-gradient(circle at 30% 40%, rgba(255,255,255,0.15) 12px, transparent 12px),
      radial-gradient(circle at 70% 60%, rgba(255,255,255,0.12) 10px, transparent 10px);
    background-size: 100px 100px;
  `,
  seasonDates: "February 1 - February 14",
  recommendedFor: ["Chocolate", "Candy hearts", "Rose products", "Romantic gifts"]
}
```

### Holiday-Halloween: Spooky Season
```javascript
{
  name: "Holiday-Halloween",
  displayName: "Spooky Season",
  baseGradient: {
    gradientStart: "#FF6F00",  // Pumpkin orange
    gradientEnd: "#1A1A1A"     // Near black
  },
  overlayPattern: "spooky",
  accentColor: "#9C27B0",  // Purple
  badgeText: "Spooky!",
  badgeColor: "purple",
  tailwindClasses: "bg-gradient-to-br from-orange-600 via-purple-900 to-gray-950",
  overlayCSS: `
    background-image:
      repeating-linear-gradient(90deg, rgba(156,39,176,0.1) 0px, transparent 2px, transparent 10px),
      radial-gradient(circle at 50% 50%, rgba(255,111,0,0.2) 1px, transparent 1px);
    background-size: 20px 20px, 30px 30px;
  `,
  seasonDates: "October 1 - October 31",
  recommendedFor: ["Candy corn", "Spooky treats", "Pumpkin items", "Halloween specials"]
}
```

### Holiday-Christmas: Festive Cheer
```javascript
{
  name: "Holiday-Christmas",
  displayName: "Festive Cheer",
  baseGradient: {
    gradientStart: "#C62828",  // Christmas red
    gradientEnd: "#2E7D32"     // Christmas green
  },
  overlayPattern: "ornaments",
  accentColor: "#FFD700",  // Gold
  badgeText: "Holiday Special",
  badgeColor: "red",
  tailwindClasses: "bg-gradient-to-br from-red-700 via-red-600 to-green-700",
  overlayCSS: `
    background-image:
      radial-gradient(circle at 20% 30%, rgba(255,215,0,0.3) 8px, transparent 8px),
      radial-gradient(circle at 80% 70%, rgba(255,215,0,0.25) 6px, transparent 6px),
      linear-gradient(45deg, rgba(255,255,255,0.05) 25%, transparent 25%);
    background-size: 80px 80px, 100px 100px, 40px 40px;
  `,
  seasonDates: "December 1 - December 25",
  recommendedFor: ["Christmas candy", "Holiday cookies", "Festive drinks", "Gift items"]
}
```

### Holiday-NewYear: Midnight Celebration
```javascript
{
  name: "Holiday-NewYear",
  displayName: "Midnight Celebration",
  baseGradient: {
    gradientStart: "#000000",  // Midnight black
    gradientEnd: "#FFD700"     // Gold
  },
  overlayPattern: "fireworks",
  accentColor: "#FFC107",  // Amber
  badgeText: "New Year!",
  badgeColor: "yellow",
  tailwindClasses: "bg-gradient-to-br from-gray-950 via-slate-800 to-yellow-600",
  overlayCSS: `
    background-image:
      radial-gradient(circle at 10% 20%, rgba(255,215,0,0.4) 2px, transparent 2px),
      radial-gradient(circle at 90% 80%, rgba(255,193,7,0.3) 3px, transparent 3px),
      radial-gradient(circle at 50% 50%, rgba(255,255,255,0.2) 1px, transparent 1px);
    background-size: 100px 100px, 120px 120px, 50px 50px;
  `,
  seasonDates: "December 26 - January 5",
  recommendedFor: ["Party items", "Champagne", "Celebration treats", "Midnight snacks"]
}
```

---

## 6. Card Shape Variations

Different card layouts and structures that can be combined with any gradient preset.

### Shape-01: Default Rounded
```javascript
{
  name: "Shape-01",
  displayName: "Default Rounded",
  tailwindClasses: "rounded-2xl overflow-hidden",
  borderRadius: "1rem",
  aspectRatio: "1:1",
  imagePosition: "center",
  recommendedFor: ["Standard products", "Most use cases"]
}
```

### Shape-02: Elevated Shadow
```javascript
{
  name: "Shape-02",
  displayName: "Elevated Shadow",
  tailwindClasses: "rounded-3xl shadow-2xl overflow-hidden transform hover:scale-105 transition-transform",
  borderRadius: "1.5rem",
  shadowCSS: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
  aspectRatio: "1:1",
  recommendedFor: ["Premium products", "Featured items", "Hero products"]
}
```

### Shape-03: Flat Minimal
```javascript
{
  name: "Shape-03",
  displayName: "Flat Minimal",
  tailwindClasses: "rounded-xl border-2 border-gray-200 overflow-hidden",
  borderRadius: "0.75rem",
  aspectRatio: "1:1",
  recommendedFor: ["Budget items", "Bulk products", "Simple catalog"]
}
```

### Shape-04: Glass Morphism
```javascript
{
  name: "Shape-04",
  displayName: "Glass Morphism",
  tailwindClasses: "rounded-3xl backdrop-blur-lg bg-white/30 border border-white/20 shadow-xl overflow-hidden",
  borderRadius: "1.5rem",
  backdropFilter: "blur(16px)",
  aspectRatio: "1:1",
  recommendedFor: ["Modern products", "Tech items", "Premium beverages"]
}
```

### Shape-05: Neon Glow
```javascript
{
  name: "Shape-05",
  displayName: "Neon Glow",
  tailwindClasses: "rounded-2xl overflow-hidden border-2 border-transparent",
  borderRadius: "1rem",
  glowCSS: "box-shadow: 0 0 20px rgba(var(--glow-color), 0.6), 0 0 40px rgba(var(--glow-color), 0.3);",
  aspectRatio: "1:1",
  recommendedFor: ["Energy drinks", "Bold items", "Night-time products", "Party items"]
}
```

### Shape-06: Outlined Bold
```javascript
{
  name: "Shape-06",
  displayName: "Outlined Bold",
  tailwindClasses: "rounded-2xl border-4 border-gray-800 overflow-hidden",
  borderRadius: "1rem",
  borderWidth: "4px",
  aspectRatio: "1:1",
  recommendedFor: ["High-contrast design", "Bold branding", "Statement products"]
}
```

---

## 7. Glow Effect Specifications

Special glow effects that can be applied to cards for emphasis and seasonal themes.

### Glow-01: Soft Ambient
```css
.glow-soft {
  box-shadow: 0 0 20px rgba(255, 255, 255, 0.3),
              0 0 40px rgba(255, 255, 255, 0.15);
  filter: brightness(1.05);
}
```
**Use case**: General product highlighting, subtle emphasis

### Glow-02: Neon Pulse
```css
.glow-neon {
  box-shadow: 0 0 10px var(--glow-color),
              0 0 20px var(--glow-color),
              0 0 30px var(--glow-color),
              0 0 40px var(--glow-color);
  animation: pulse-glow 2s ease-in-out infinite;
}

@keyframes pulse-glow {
  0%, 100% { filter: brightness(1); }
  50% { filter: brightness(1.2); }
}
```
**Use case**: Energy drinks, featured products, limited-time offers

### Glow-03: Gold Shimmer
```css
.glow-gold {
  box-shadow: 0 0 30px rgba(255, 215, 0, 0.5),
              0 0 60px rgba(255, 215, 0, 0.3),
              inset 0 0 20px rgba(255, 215, 0, 0.1);
  animation: shimmer 3s ease-in-out infinite;
}

@keyframes shimmer {
  0%, 100% { filter: hue-rotate(0deg); }
  50% { filter: hue-rotate(10deg); }
}
```
**Use case**: Premium products, gold-tier items, luxury brands

### Glow-04: Fire Flicker
```css
.glow-fire {
  box-shadow: 0 0 20px rgba(255, 69, 0, 0.6),
              0 0 40px rgba(255, 140, 0, 0.4),
              0 0 60px rgba(255, 69, 0, 0.2);
  animation: flicker 1.5s ease-in-out infinite;
}

@keyframes flicker {
  0%, 100% { opacity: 1; filter: brightness(1); }
  25% { opacity: 0.9; filter: brightness(1.1); }
  50% { opacity: 0.95; filter: brightness(0.95); }
  75% { opacity: 0.92; filter: brightness(1.05); }
}
```
**Use case**: Spicy products, hot sauces, BBQ items

### Glow-05: Ice Frost
```css
.glow-ice {
  box-shadow: 0 0 20px rgba(173, 216, 230, 0.6),
              0 0 40px rgba(135, 206, 250, 0.4),
              inset 0 0 30px rgba(240, 248, 255, 0.2);
  filter: brightness(1.1);
}
```
**Use case**: Frozen products, cold beverages, winter items

### Glow-06: Rainbow Spectrum
```css
.glow-rainbow {
  box-shadow: 0 0 20px rgba(255, 0, 0, 0.3),
              0 0 30px rgba(255, 165, 0, 0.3),
              0 0 40px rgba(255, 255, 0, 0.3),
              0 0 50px rgba(0, 255, 0, 0.3),
              0 0 60px rgba(0, 0, 255, 0.3);
  animation: rainbow-rotate 5s linear infinite;
}

@keyframes rainbow-rotate {
  0% { filter: hue-rotate(0deg); }
  100% { filter: hue-rotate(360deg); }
}
```
**Use case**: Candy, party items, kids' products, festive occasions

---

## 8. Usage in Admin Editor

### Preset Selector Component Structure

```typescript
interface VisualPreset {
  name: string;                    // Internal ID (e.g., "Fiesta-01")
  displayName: string;             // User-facing name
  category: 'fiesta' | 'candy' | 'splash' | 'premium' | 'holiday';
  gradientStart: string;           // Hex color
  gradientEnd: string;             // Hex color
  tailwindClasses: string;         // Complete Tailwind class string
  textColor: string;               // Text color for readability
  cardTheme: 'default' | 'elevated' | 'flat' | 'outlined' | 'glass' | 'neon';
  glowEffect?: string;             // Optional CSS shadow
  overlayCSS?: string;             // Optional overlay pattern
  badgeText?: string;              // Optional badge text
  badgeColor?: string;             // Badge color
  recommendedFor: string[];        // Product suggestions
  seasonDates?: string;            // For holiday presets
}
```

### Example: Applying a Preset in Editor

```typescript
// When admin selects "Fiesta-01: Sunset Mango"
const applyPreset = (preset: VisualPreset) => {
  setProductData({
    ...productData,
    gradientStart: preset.gradientStart,
    gradientEnd: preset.gradientEnd,
    cardTheme: preset.cardTheme,
    badgeText: preset.badgeText || productData.badgeText,
    badgeColor: preset.badgeColor || productData.badgeColor,
  });

  // Update preview in real-time
  updatePreview();
};
```

### Preset Browser UI

```tsx
<div className="preset-browser">
  <h3>Visual Presets</h3>

  {/* Category Tabs */}
  <div className="preset-categories">
    <button onClick={() => setCategory('fiesta')}>Fiesta</button>
    <button onClick={() => setCategory('candy')}>Candy</button>
    <button onClick={() => setCategory('splash')}>Beverage</button>
    <button onClick={() => setCategory('premium')}>Premium</button>
    <button onClick={() => setCategory('holiday')}>Holiday</button>
  </div>

  {/* Preset Grid */}
  <div className="preset-grid grid grid-cols-3 gap-4">
    {presets
      .filter(p => p.category === selectedCategory)
      .map(preset => (
        <div
          key={preset.name}
          onClick={() => applyPreset(preset)}
          className={`preset-card cursor-pointer ${preset.tailwindClasses}`}
          style={{
            background: `linear-gradient(to bottom right, ${preset.gradientStart}, ${preset.gradientEnd})`
          }}
        >
          <p className={preset.textColor}>{preset.displayName}</p>
          <div className="preset-preview-product">
            {/* Mini product card preview */}
          </div>
        </div>
      ))
    }
  </div>
</div>
```

---

## 9. Custom Preset Creation

Admins can also create custom presets by manually selecting colors.

### Custom Preset Form

```typescript
interface CustomPresetForm {
  displayName: string;
  gradientStart: string;  // Color picker
  gradientEnd: string;    // Color picker
  cardTheme: CardTheme;
  glowIntensity: 'none' | 'low' | 'medium' | 'high';
  saveAsPreset: boolean;  // Save for future use
}
```

### Validation Rules

- **Gradient Start**: Must be valid hex color (#RRGGBB)
- **Gradient End**: Must be valid hex color (#RRGGBB)
- **Contrast Check**: System automatically checks if text is readable
- **Name Uniqueness**: Custom presets cannot duplicate existing preset names

---

## 10. Preset Application Priority

When multiple visual properties are set:

1. **Holiday Overlay** (if active season) - highest priority
2. **Custom Gradient** (if admin manually set)
3. **Named Preset** (if selected from library)
4. **Category Default** (fallback)

---

## Summary

This visual presets library provides:

- **25+ named presets** across 5 categories
- **8 holiday overlays** for seasonal promotions
- **6 card shape variations**
- **6 glow effect specifications**
- Complete Tailwind CSS implementation
- Recommended use cases for each preset
- Admin editor integration guidelines

All presets are production-ready and can be immediately applied in the admin menu editor.

---

**Next Steps for Implementation**:
1. Create `VisualPreset` TypeScript type in shared types
2. Build preset selector component in admin UI
3. Add color picker for custom gradients
4. Implement real-time preview with preset application
5. Store preset selections in `Product` model
6. Add seasonal auto-switching logic for holiday overlays
