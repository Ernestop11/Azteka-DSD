'use client'

import { motion } from 'framer-motion'
import { useCartStore } from '@/store/cart'
import { getPublicImageUrl } from '@/lib/imageUrl'

interface ProductCardProps {
  id: string
  name: string
  price: number
  imageUrl?: string
}

export default function ProductCard({ 
  id, 
  name, 
  price, 
  imageUrl = '/placeholder-product.png',
}: ProductCardProps) {
  const { addItem, increment, decrement, getQuantity } = useCartStore()
  const quantity = getQuantity(id)

  const handleIncrement = () => {
    increment(id)
  }

  const handleDecrement = () => {
    decrement(id)
  }

  const handleAddToCart = () => {
    addItem({
      id,
      name,
      price: price || 0,
      quantity: 1,
      imageUrl,
    })
  }

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.2 }}
      className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden cursor-pointer"
    >
      {/* Product Image */}
      <div className="relative w-full aspect-square bg-gray-100 overflow-hidden">
        <img
          src={getPublicImageUrl(imageUrl)}
          alt={name}
          className="w-full h-full object-cover"
          onError={(e) => {
            // Fallback to placeholder if image fails
            e.currentTarget.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="200" height="200"%3E%3Crect fill="%23f3f4f6" width="200" height="200"/%3E%3Ctext fill="%239ca3af" x="50%25" y="50%25" text-anchor="middle" dy=".3em" font-size="14"%3EProduct%3C/text%3E%3C/svg%3E'
          }}
        />
      </div>

      {/* Product Info */}
      <div className="p-3 md:p-4">
        <h4 className="font-semibold text-sm md:text-base text-gray-900 mb-2 line-clamp-2">
          {name}
        </h4>

        {/* Price */}
        <div className="mb-3">
          <span className="text-lg md:text-xl font-bold text-gray-900">
            ${price.toFixed(2)}
          </span>
        </div>

        {/* Quantity Controls or Add to Cart */}
        {quantity > 0 ? (
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 border border-gray-300 rounded-md">
              <button
                onClick={handleDecrement}
                className="px-2 py-1 text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-colors"
                aria-label="Decrease quantity"
              >
                −
              </button>
              <span className="px-2 py-1 text-sm font-medium min-w-[2ch] text-center">
                {quantity}
              </span>
              <button
                onClick={handleIncrement}
                className="px-2 py-1 text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-colors"
                aria-label="Increase quantity"
              >
                +
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={handleAddToCart}
            className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-md transition-colors"
          >
            Add to Cart
          </button>
        )}
      </div>
    </motion.div>
  )
}
