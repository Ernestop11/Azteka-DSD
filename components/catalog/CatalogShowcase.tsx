'use client'

import { useState } from 'react'
import HeroBanner from './HeroBanner'
import MarqueeScroll from './MarqueeScroll'
import BrandSection from './BrandSection'
import SeasonalSection from './SeasonalSection'
import BundleCard from './BundleCard'
import Billboard from './Billboard'
import PriceTierBar from './PriceTierBar'
import GlossyProductCard from './GlossyProductCard'

// Placeholder Data
const heroData = {
  title: 'Summer Sale Spectacular',
  subtitle: 'Limited Time Offer',
  imageUrl: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=1200',
  theme: 'summer' as const,
}

const marqueeItems = Array.from({ length: 8 }, (_, i) => ({
  id: `marquee-${i}`,
  imageUrl: `https://images.unsplash.com/photo-${1560393464027 + i}-64c3d64e86ab?w=400`,
  title: `Featured Product ${i + 1}`,
  price: 19.99 + i * 5,
  badge: i % 3 === 0 ? 'HOT' : undefined,
}))

const brands = Array.from({ length: 12 }, (_, i) => ({
  id: `brand-${i}`,
  name: `Brand ${String.fromCharCode(65 + i)}`,
  logoUrl: `https://ui-avatars.com/api/?name=Brand+${i}&size=200&background=random`,
  productCount: Math.floor(Math.random() * 100) + 10,
  featured: i % 4 === 0,
}))

const seasonalProducts = Array.from({ length: 8 }, (_, i) => ({
  id: `seasonal-${i}`,
  name: `Holiday Special ${i + 1}`,
  brand: 'Premium Brand',
  price: 29.99 + i * 3,
  originalPrice: i % 2 === 0 ? 39.99 + i * 3 : undefined,
  imageUrl: `https://images.unsplash.com/photo-${1512389142860 + i}-9c9039ea2bd3?w=400`,
  badge: (['NEW', 'SALE', 'HOT', 'LIMITED'] as const)[i % 4],
}))

const bundles = [
  {
    id: 'bundle-1',
    name: 'Ultimate Starter Pack',
    description: 'Everything you need to get started with our premium products',
    products: Array.from({ length: 5 }, (_, i) => ({
      id: `b1-p${i}`,
      name: `Product ${i + 1}`,
      imageUrl: `https://images.unsplash.com/photo-${1505740420928 + i}-5e9d0fed8fb3?w=200`,
    })),
    originalPrice: 149.99,
    bundlePrice: 99.99,
    savings: 50.0,
    badge: 'BEST VALUE' as const,
  },
  {
    id: 'bundle-2',
    name: 'Family Value Bundle',
    description: 'Perfect for the whole family, save big on bulk purchases',
    products: Array.from({ length: 4 }, (_, i) => ({
      id: `b2-p${i}`,
      name: `Family Product ${i + 1}`,
      imageUrl: `https://images.unsplash.com/photo-${1526170375885 + i}-4c04f1e92b33?w=200`,
    })),
    originalPrice: 199.99,
    bundlePrice: 149.99,
    savings: 50.0,
    badge: 'POPULAR' as const,
  },
  {
    id: 'bundle-3',
    name: 'Weekend Essentials',
    description: 'Everything you need for a perfect weekend getaway',
    products: Array.from({ length: 3 }, (_, i) => ({
      id: `b3-p${i}`,
      name: `Weekend Item ${i + 1}`,
      imageUrl: `https://images.unsplash.com/photo-${1434494878577 + i}-52e22de28500?w=200`,
    })),
    originalPrice: 89.99,
    bundlePrice: 59.99,
    savings: 30.0,
    badge: 'LIMITED TIME' as const,
  },
]

const tieredProducts = {
  A: Array.from({ length: 4 }, (_, i) => ({
    id: `tier-a-${i}`,
    name: `Premium Product ${i + 1}`,
    brand: 'Luxury Brand',
    price: 79.99 + i * 10,
    imageUrl: `https://images.unsplash.com/photo-${1523275335684 + i}-37898b6ad2e3?w=400`,
    tier: 'A' as const,
    rewardsPoints: 100,
    rating: 5,
  })),
  B: Array.from({ length: 4 }, (_, i) => ({
    id: `tier-b-${i}`,
    name: `Standard Product ${i + 1}`,
    brand: 'Quality Brand',
    price: 39.99 + i * 5,
    imageUrl: `https://images.unsplash.com/photo-${1517935706615 + i}-c8dce960ca96?w=400`,
    tier: 'B' as const,
    rewardsPoints: 50,
    rating: 4,
  })),
  C: Array.from({ length: 4 }, (_, i) => ({
    id: `tier-c-${i}`,
    name: `Value Product ${i + 1}`,
    brand: 'Budget Brand',
    price: 19.99 + i * 2,
    imageUrl: `https://images.unsplash.com/photo-${1505740420928 + i}-5e9d0fed8fb3?w=400`,
    tier: 'C' as const,
    rewardsPoints: 25,
    rating: 4,
  })),
}

export default function CatalogShowcase() {
  const [activeTier, setActiveTier] = useState<'A' | 'B' | 'C' | null>(null)

  const displayProducts = activeTier
    ? tieredProducts[activeTier]
    : [...tieredProducts.A, ...tieredProducts.B, ...tieredProducts.C]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Banner */}
      <section className="container mx-auto px-6 py-8">
        <HeroBanner
          title={heroData.title}
          subtitle={heroData.subtitle}
          imageUrl={heroData.imageUrl}
          theme={heroData.theme}
          onCtaClick={() => console.log('Hero CTA clicked')}
        />
      </section>

      {/* Marquee Scroll */}
      <section className="mb-12">
        <MarqueeScroll
          items={marqueeItems}
          title="🔥 Trending Now"
          speed={25}
          onItemClick={(item) => console.log('Marquee item clicked:', item)}
        />
      </section>

      {/* Price Tier Bar - Sticky */}
      <PriceTierBar
        activeTier={activeTier}
        onTierSelect={setActiveTier}
        showCounts
        tierCounts={{
          A: tieredProducts.A.length,
          B: tieredProducts.B.length,
          C: tieredProducts.C.length,
        }}
      />

      {/* Tiered Products Grid */}
      <section className="container mx-auto px-6 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {displayProducts.map((product, index) => (
            <GlossyProductCard
              key={product.id}
              product={product}
              index={index}
              onClick={() => console.log('Product clicked:', product.id)}
              onAddToCart={() => console.log('Add to cart:', product.id)}
            />
          ))}
        </div>
      </section>

      {/* Billboard 1 */}
      <section className="container mx-auto px-6 py-12">
        <Billboard
          title="New Arrivals"
          subtitle="Fresh & Exciting"
          description="Discover our latest products, handpicked for quality and value"
          imageUrl="https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800"
          imagePosition="right"
          theme="blue"
          ctaText="Explore Now"
          onCtaClick={() => console.log('Billboard 1 clicked')}
        />
      </section>

      {/* Brand Section */}
      <BrandSection
        brands={brands}
        onBrandClick={(id) => console.log('Brand clicked:', id)}
        onViewAll={() => console.log('View all brands')}
      />

      {/* Billboard 2 */}
      <section className="container mx-auto px-6 py-12">
        <Billboard
          title="Exclusive Deals"
          subtitle="Members Only"
          description="Join our rewards program and unlock exclusive savings on premium products"
          imageUrl="https://images.unsplash.com/photo-1607082349566-187342175e2f?w=800"
          imagePosition="left"
          theme="purple"
          ctaText="Join Now"
          onCtaClick={() => console.log('Billboard 2 clicked')}
        />
      </section>

      {/* Bundles Section */}
      <section className="container mx-auto px-6 py-12">
        <div className="mb-8">
          <h2 className="text-4xl font-bold text-gray-900 mb-2">Bundle & Save</h2>
          <p className="text-lg text-gray-600">
            Curated collections at unbeatable prices
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {bundles.map((bundle, index) => (
            <BundleCard
              key={bundle.id}
              bundle={bundle}
              index={index}
              onClick={() => console.log('Bundle clicked:', bundle.id)}
              onAddToCart={() => console.log('Add bundle to cart:', bundle.id)}
            />
          ))}
        </div>
      </section>

      {/* Seasonal Section - Christmas */}
      <SeasonalSection
        season="christmas"
        products={seasonalProducts}
        onProductClick={(id) => console.log('Seasonal product clicked:', id)}
        onAddToCart={(id) => console.log('Add seasonal to cart:', id)}
      />

      {/* Billboard 3 */}
      <section className="container mx-auto px-6 py-12">
        <Billboard
          title="Free Shipping"
          subtitle="Limited Time"
          description="Get free shipping on all orders over $50. No code needed!"
          imageUrl="https://images.unsplash.com/photo-1556742111-a301076d9d18?w=800"
          imagePosition="right"
          theme="emerald"
          ctaText="Shop Now"
          onCtaClick={() => console.log('Billboard 3 clicked')}
        />
      </section>

      {/* Marquee Scroll 2 */}
      <section className="my-12">
        <MarqueeScroll
          items={marqueeItems.slice().reverse()}
          title="⭐ Customer Favorites"
          speed={35}
          direction="right"
          onItemClick={(item) => console.log('Marquee 2 item clicked:', item)}
        />
      </section>
    </div>
  )
}
