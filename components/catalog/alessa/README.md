# Alessa-Style Catalog Components

Modern, clean catalog UI components inspired by [lasreinas.alessacloud.com/order](https://lasreinas.alessacloud.com/order).

## Components

### 1. HeroBanner
Full-width promotional carousel with auto-play, navigation arrows, and dot indicators.

**Features:**
- Auto-play with configurable interval
- Smooth transitions with Framer Motion
- Navigation arrows and dot indicators
- Responsive height (400px mobile, 500px tablet, 600px desktop)
- Gradient overlay for text readability

**Usage:**
```tsx
import { HeroBanner } from '@/components/catalog/alessa'

<HeroBanner
  slides={[
    {
      id: '1',
      title: 'Welcome',
      subtitle: 'Subtitle text',
      imageUrl: '/hero-1.jpg',
      ctaText: 'Shop Now',
      ctaLink: '#products',
    },
  ]}
  autoPlay={true}
  autoPlayInterval={5000}
/>
```

### 2. CategoryTabs
Horizontal scrollable category navigation with sticky positioning.

**Features:**
- Sticky header (stays at top when scrolling)
- Horizontal scroll with smooth scrolling
- Active state highlighting
- "All" button to clear filters
- Responsive design

**Usage:**
```tsx
import { CategoryTabs } from '@/components/catalog/alessa'

<CategoryTabs
  activeCategoryId={selectedCategoryId}
  onCategoryChange={(categoryId) => setSelectedCategoryId(categoryId)}
/>
```

### 3. ProductCard
Modern product card with wholesale case/unit pricing toggle.

**Features:**
- Toggle between case and unit pricing
- Quantity selector
- Stock status badge
- Category/brand badges
- Add to cart button
- Responsive image handling with fallback

**Usage:**
```tsx
import { ProductCard } from '@/components/catalog/alessa'

<ProductCard
  product={product}
  onAddToCart={(product, quantity, isWholesale) => {
    // Handle add to cart
  }}
  onClick={(product) => {
    // Handle product click (navigate to detail)
  }}
  index={0}
/>
```

### 4. ProductGrid
Responsive grid layout for products.

**Features:**
- Configurable columns (mobile, tablet, desktop)
- Loading skeleton states
- Empty state handling
- Framer Motion animations

**Usage:**
```tsx
import { ProductGrid } from '@/components/catalog/alessa'

<ProductGrid
  products={products}
  onAddToCart={handleAddToCart}
  onProductClick={handleProductClick}
  isLoading={isLoading}
  columns={{
    mobile: 2,
    tablet: 3,
    desktop: 4,
  }}
/>
```

## Example Page

See `/app/catalog/alessa/page.tsx` for a complete example implementation.

## Styling

All components use Tailwind CSS and follow the Alessa design aesthetic:
- Clean, modern design
- Proper spacing and typography
- Smooth animations
- Responsive layouts
- Accessible interactions

## Integration

To integrate into your existing catalog:

1. Import the components:
```tsx
import { HeroBanner, CategoryTabs, ProductGrid } from '@/components/catalog/alessa'
```

2. Use them in your page:
```tsx
<HeroBanner slides={heroSlides} />
<CategoryTabs activeCategoryId={categoryId} onCategoryChange={setCategoryId} />
<ProductGrid products={products} onAddToCart={handleAddToCart} />
```

## Notes

- All components use `'use client'` directive for interactivity
- Next.js Image component is used for optimized images
- Framer Motion is used for animations
- Components are fully typed with TypeScript
- Compatible with existing CatalogProduct type

