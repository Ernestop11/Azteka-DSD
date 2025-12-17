'use client'

import { motion } from 'framer-motion'
import ProductCard from './ProductCard'

interface Product {
  id: string
  name: string
  sku?: string
  price: number | string
  unitsPerCase?: number
  imageUrl?: string | null
  description?: string | null
  inStock?: boolean
  category?: { id?: string; name: string } | string | null
  brand?: { id?: string; name: string } | string | null
}

interface ProductGridProps {
  products: Product[]
  onAddToCart?: (product: Product, quantity: number, isWholesale: boolean) => void
  onProductClick?: (product: Product) => void
  isLoading?: boolean
  columns?: {
    mobile?: number
    tablet?: number
    desktop?: number
  }
}

export default function ProductGrid({
  products,
  onAddToCart,
  onProductClick,
  isLoading = false,
  columns = { mobile: 2, tablet: 3, desktop: 4 },
}: ProductGridProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden animate-pulse"
          >
            <div className="aspect-square bg-gray-200" />
            <div className="p-4 space-y-3">
              <div className="h-4 bg-gray-200 rounded w-3/4" />
              <div className="h-3 bg-gray-200 rounded w-1/2" />
              <div className="h-8 bg-gray-200 rounded" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (products.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 text-lg mb-2">No products found</p>
        <p className="text-sm text-gray-400">Try adjusting your filters</p>
      </div>
    )
  }

  return (
    <div
      className={`grid gap-4 md:gap-6 ${
        columns.mobile === 1
          ? 'grid-cols-1'
          : columns.mobile === 2
          ? 'grid-cols-2'
          : 'grid-cols-2'
      } ${
        columns.tablet === 2
          ? 'md:grid-cols-2'
          : columns.tablet === 3
          ? 'md:grid-cols-3'
          : columns.tablet === 4
          ? 'md:grid-cols-4'
          : 'md:grid-cols-3'
      } ${
        columns.desktop === 3
          ? 'lg:grid-cols-3'
          : columns.desktop === 4
          ? 'lg:grid-cols-4'
          : columns.desktop === 5
          ? 'lg:grid-cols-5'
          : columns.desktop === 6
          ? 'lg:grid-cols-6'
          : 'lg:grid-cols-4'
      }`}
    >
      {products.map((product, index) => (
        <ProductCard
          key={product.id}
          product={product}
          onAddToCart={onAddToCart}
          onClick={onProductClick}
          index={index}
        />
      ))}
    </div>
  )
}

