'use client'

import { motion } from 'framer-motion'
import { ShoppingCart } from 'lucide-react'
import { getPublicImageUrl } from '@/lib/imageUrl'

interface CompactProductCardProps {
  product: {
    id: string
    name: string
    price: number
    imageUrl: string
    backgroundColor?: string | null
    backgroundGradient?: string | null
    discount?: number
    badge?: 'NEW' | 'SALE' | 'HOT' | 'LIMITED' | null
  }
  index?: number
  onClick?: () => void
  onAddToCart?: () => void
}

export default function CompactProductCard({
  product,
  index = 0,
  onClick,
  onAddToCart,
}: CompactProductCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.05 }}
      whileHover={{ scale: 1.05, y: -4 }}
      className="group relative"
    >
      <div
        className={`relative overflow-hidden rounded-xl shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer ${
          product.backgroundGradient || product.backgroundColor ? '' : 'bg-white'
        }`}
        style={{
          ...(product.backgroundGradient 
            ? { background: product.backgroundGradient }
            : product.backgroundColor 
            ? { backgroundColor: product.backgroundColor }
            : {}
          ),
        }}
        onClick={onClick}
      >
        {/* Discount Badge */}
        {product.discount && product.discount > 0 && (
          <div className="absolute top-2 right-2 z-10 bg-red-600 text-white px-2 py-1 rounded-full text-xs font-bold">
            -{product.discount}%
          </div>
        )}

        {/* Badge */}
        {product.badge && (
          <div className="absolute top-2 left-2 z-10 bg-blue-600 text-white px-2 py-1 rounded-full text-xs font-bold">
            {product.badge}
          </div>
        )}

        {/* Compact Image */}
        <div className="aspect-square overflow-hidden bg-gray-100">
          <img
            src={getPublicImageUrl(product.imageUrl)}
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
          />
        </div>

        {/* Compact Content */}
        <div className="p-3">
          <h3 className="font-semibold text-sm text-gray-900 line-clamp-2 mb-2 min-h-[2.5rem]">
            {product.name}
          </h3>
          
          <div className="flex items-center justify-between">
            <span className="text-lg font-bold text-gray-900">
              ${product.price.toFixed(2)}
            </span>
            
            <button
              onClick={(e) => {
                e.stopPropagation()
                onAddToCart?.()
              }}
              className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              aria-label="Add to cart"
            >
              <ShoppingCart className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

