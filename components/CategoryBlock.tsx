'use client'

import { motion } from 'framer-motion'
import ProductCard from './ProductCard'

interface CategoryBlockProps {
  title: string
  subtitle?: string
  productCount?: number
}

export default function CategoryBlock({ 
  title, 
  subtitle,
  productCount = 6 
}: CategoryBlockProps) {
  // Generate placeholder products for this category
  const placeholderProducts = Array.from({ length: productCount }, (_, i) => ({
    id: `cat-${i}`,
    name: `Product ${i + 1}`,
    price: 29.99 + i * 5,
  }))

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-xl md:text-2xl font-bold text-gray-900">{title}</h3>
          {subtitle && (
            <p className="text-sm text-gray-600 mt-1">{subtitle}</p>
          )}
        </div>
        <button className="text-blue-600 hover:text-blue-700 font-medium text-sm md:text-base">
          View all →
        </button>
      </div>

      {/* Horizontal scroll container */}
      <div className="overflow-x-auto scrollbar-hide -mx-4 md:-mx-6 lg:-mx-10 px-4 md:px-6 lg:px-10">
        <div className="flex gap-3 md:gap-5 min-w-max">
          {placeholderProducts.map((product, index) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1, duration: 0.3 }}
              className="flex-shrink-0 w-[160px] md:w-[200px]"
            >
              <ProductCard
                id={product.id}
                name={product.name}
                price={product.price}
                imageUrl="/placeholder-product.png"
              />
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  )
}
