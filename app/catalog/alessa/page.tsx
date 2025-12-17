'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/lib/api/client'
import { HeroBanner, CategoryTabs, ProductGrid } from '@/components/catalog/alessa'
import type { CatalogProduct } from '@/lib/queries/catalog'
import { toCatalogProduct } from '@/lib/queries/catalog'

export default function AlessaCatalogPage() {
  const [activeCategoryId, setActiveCategoryId] = useState<string | null>(null)
  const [cart, setCart] = useState<Array<{ product: CatalogProduct; quantity: number; isWholesale: boolean }>>([])

  // Fetch products
  const { data: productsData, isLoading } = useQuery<{ products?: any[]; data?: any[]; meta?: any }>({
    queryKey: ['catalog-products', activeCategoryId],
    queryFn: async () => {
      const params = new URLSearchParams()
      if (activeCategoryId) {
        params.set('category', activeCategoryId)
      }
      params.set('limit', '200')
      return apiClient.get(`/catalog/products?${params.toString()}`)
    },
  })

  const rawProducts = productsData?.products || productsData?.data || []
  const products = rawProducts.map(toCatalogProduct)

  // Filter products by category if selected
  const filteredProducts = activeCategoryId
    ? products.filter((p) => {
        const categoryId = typeof p.category === 'string' ? p.category : p.category?.id
        return categoryId === activeCategoryId
      })
    : products

  // Hero banner slides (can be fetched from API or hardcoded)
  const heroSlides = [
    {
      id: '1',
      title: 'Welcome to Our Wholesale Catalog',
      subtitle: 'Premium products for your business',
      imageUrl: '/hero-banner-1.jpg',
      ctaText: 'Shop Now',
      ctaLink: '#products',
    },
    {
      id: '2',
      title: 'Special Wholesale Pricing',
      subtitle: 'Best deals on bulk orders',
      imageUrl: '/hero-banner-2.jpg',
      ctaText: 'View Deals',
      ctaLink: '#products',
    },
  ]

  const handleAddToCart = (product: CatalogProduct, quantity: number, isWholesale: boolean) => {
    setCart((prev) => [...prev, { product, quantity, isWholesale }])
    // You can also integrate with your cart store/hook here
    console.log('Added to cart:', { product: product.name, quantity, isWholesale })
    
    // Show a toast notification (optional)
    // toast.success(`Added ${quantity} ${isWholesale ? 'case' : 'unit'}(s) to cart`)
  }

  const handleProductClick = (product: CatalogProduct) => {
    // Navigate to product detail page or open modal
    console.log('Product clicked:', product.name)
  }

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0)
  const cartTotal = cart.reduce((sum, item) => {
    const productPrice = typeof item.product.price === 'string' 
      ? parseFloat(item.product.price) 
      : item.product.price
    const price = item.isWholesale 
      ? productPrice 
      : productPrice / (item.product.unitsPerCase || 1)
    return sum + price * item.quantity
  }, 0)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Banner */}
      <HeroBanner slides={heroSlides} autoPlay={true} autoPlayInterval={5000} />

      {/* Category Tabs - Sticky */}
      <CategoryTabs
        activeCategoryId={activeCategoryId}
        onCategoryChange={setActiveCategoryId}
      />

      {/* Main Content */}
      <div className="container mx-auto px-4 md:px-6 lg:px-8 py-8">
        {/* Products Grid */}
        <section id="products">
          <div className="mb-6">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
              {activeCategoryId ? 'Products' : 'All Products'}
            </h2>
            <p className="text-gray-600 mt-1">
              {filteredProducts.length} product{filteredProducts.length !== 1 ? 's' : ''} available
            </p>
          </div>

          <ProductGrid
            products={filteredProducts}
            onAddToCart={handleAddToCart}
            onProductClick={handleProductClick}
            isLoading={isLoading}
            columns={{
              mobile: 2,
              tablet: 3,
              desktop: 4,
            }}
          />
        </section>
      </div>

      {/* Floating Cart Button */}
      {cartCount > 0 && (
        <div className="fixed bottom-6 right-6 z-50">
          <button className="bg-gray-900 hover:bg-gray-800 text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-3 transition-all hover:scale-105">
            <span className="font-semibold">Cart ({cartCount})</span>
            <span className="font-bold">${cartTotal.toFixed(2)}</span>
          </button>
        </div>
      )}
    </div>
  )
}

