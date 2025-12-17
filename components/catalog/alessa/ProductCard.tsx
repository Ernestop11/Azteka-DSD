'use client'

import { useState } from 'react'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { ShoppingCart, Package, Box } from 'lucide-react'

interface Product {
  id: string
  name: string
  sku?: string
  price: number | string
  unitsPerCase?: number
  imageUrl?: string | null
  description?: string | null
  inStock?: boolean
  // Support both object and string formats for category/brand
  category?: { id?: string; name: string } | string | null
  brand?: { id?: string; name: string } | string | null
}

interface ProductCardProps {
  product: Product
  onAddToCart?: (product: Product, quantity: number, isWholesale: boolean) => void
  onClick?: (product: Product) => void
  index?: number
}

export default function ProductCard({
  product,
  onAddToCart,
  onClick,
  index = 0,
}: ProductCardProps) {
  const [isWholesale, setIsWholesale] = useState(true)
  const [quantity, setQuantity] = useState(1)
  const [imageError, setImageError] = useState(false)

  const unitsPerCase = product.unitsPerCase || 1
  const casePrice = typeof product.price === 'string' ? parseFloat(product.price) : product.price
  const unitPrice = casePrice / unitsPerCase

  const displayPrice = isWholesale ? casePrice : unitPrice
  const displayLabel = isWholesale ? 'Case' : 'Unit'
  const displayQuantity = isWholesale ? quantity : quantity * unitsPerCase

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation()
    onAddToCart?.(product, displayQuantity, isWholesale)
  }

  const handleCardClick = () => {
    onClick?.(product)
  }

  // Handle both CatalogProduct (string) and object formats
  const categoryName =
    typeof product.category === 'string'
      ? product.category
      : (product.category as any)?.name || null
  const brandName =
    typeof product.brand === 'string' ? product.brand : (product.brand as any)?.name || null

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
      onClick={handleCardClick}
    >
      {/* Image Container */}
      <div className="relative aspect-square bg-gray-100">
        {product.imageUrl && !imageError ? (
          <Image
            src={product.imageUrl}
            alt={product.name}
            fill
            className="object-cover"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
            <Package className="w-16 h-16 text-gray-400" />
          </div>
        )}

        {/* Stock Badge */}
        {product.inStock === false && (
          <div className="absolute top-2 right-2 bg-red-500 text-white text-xs font-semibold px-2 py-1 rounded">
            Out of Stock
          </div>
        )}

        {/* Category/Brand Badge */}
        {categoryName && (
          <div className="absolute top-2 left-2 bg-white/90 backdrop-blur-sm text-gray-700 text-xs font-medium px-2 py-1 rounded">
            {categoryName}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Product Name */}
        <h3 className="font-semibold text-gray-900 mb-1 line-clamp-2 min-h-[2.5rem]">
          {product.name}
        </h3>

        {/* SKU */}
        {product.sku && (
          <p className="text-xs text-gray-500 mb-2">SKU: {product.sku}</p>
        )}

        {/* Brand */}
        {brandName && (
          <p className="text-xs text-gray-600 mb-3 font-medium">{brandName}</p>
        )}

        {/* Price Toggle */}
        <div className="flex items-center justify-between mb-3">
          <div>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-bold text-gray-900">
                ${displayPrice.toFixed(2)}
              </span>
              <span className="text-sm text-gray-500">/{displayLabel}</span>
            </div>
            {!isWholesale && (
              <p className="text-xs text-gray-500 mt-0.5">
                ${casePrice.toFixed(2)} per case ({unitsPerCase} units)
              </p>
            )}
          </div>

          {/* Toggle Button */}
          <button
            onClick={(e) => {
              e.stopPropagation()
              setIsWholesale(!isWholesale)
              setQuantity(1)
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors text-xs font-medium text-gray-700"
          >
            {isWholesale ? (
              <>
                <Box className="w-3.5 h-3.5" />
                Case
              </>
            ) : (
              <>
                <Package className="w-3.5 h-3.5" />
                Unit
              </>
            )}
          </button>
        </div>

        {/* Quantity Selector */}
        <div className="flex items-center gap-2 mb-3">
          <button
            onClick={(e) => {
              e.stopPropagation()
              setQuantity(Math.max(1, quantity - 1))
            }}
            className="w-8 h-8 flex items-center justify-center border border-gray-300 rounded hover:bg-gray-50 transition-colors"
          >
            −
          </button>
          <span className="flex-1 text-center font-medium text-gray-900">
            {quantity} {isWholesale ? 'case' : 'unit'}
            {quantity !== 1 ? 's' : ''}
          </span>
          <button
            onClick={(e) => {
              e.stopPropagation()
              setQuantity(quantity + 1)
            }}
            className="w-8 h-8 flex items-center justify-center border border-gray-300 rounded hover:bg-gray-50 transition-colors"
          >
            +
          </button>
        </div>

        {/* Add to Cart Button */}
        <button
          onClick={handleAddToCart}
          disabled={product.inStock === false}
          className="w-full bg-gray-900 hover:bg-gray-800 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-semibold py-2.5 rounded-lg transition-colors flex items-center justify-center gap-2"
        >
          <ShoppingCart className="w-4 h-4" />
          Add to Cart
        </button>
      </div>
    </motion.div>
  )
}

