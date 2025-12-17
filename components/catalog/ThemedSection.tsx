'use client'

import { motion } from 'framer-motion'
import GlossyProductCard from './GlossyProductCard'
import type { CatalogProduct } from '@/lib/queries/catalog'

interface ThemedSectionProps {
  theme: 'seasonal' | 'drinks' | 'snacks' | 'holiday' | 'trending'
  title: string
  description?: string
  products: CatalogProduct[]
  columns?: { mobile?: number; tablet?: number; desktop?: number }
}

const themeStyles = {
  seasonal: {
    bg: 'bg-gradient-to-br from-orange-50 via-red-50 to-pink-50',
    accent: 'from-orange-500 to-red-500',
  },
  drinks: {
    bg: 'bg-gradient-to-br from-cyan-50 via-blue-50 to-purple-50',
    accent: 'from-cyan-500 to-blue-500',
  },
  snacks: {
    bg: 'bg-gradient-to-br from-yellow-50 via-orange-50 to-red-50',
    accent: 'from-yellow-500 to-orange-500',
  },
  holiday: {
    bg: 'bg-gradient-to-br from-red-50 via-green-50 to-red-50',
    accent: 'from-red-600 to-green-600',
  },
  trending: {
    bg: 'bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50',
    accent: 'from-purple-500 to-pink-500',
  },
}

export default function ThemedSection({
  theme,
  title,
  description,
  products,
  columns = { mobile: 2, tablet: 3, desktop: 4 },
}: ThemedSectionProps) {
  if (products.length === 0) return null

  const style = themeStyles[theme] || themeStyles.trending

  return (
    <section className={`py-8 md:py-12 lg:py-16 px-4 md:px-6 lg:px-10 ${style.bg}`}>
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-6 md:mb-8"
        >
          <div className={`inline-block px-4 py-2 rounded-full bg-gradient-to-r ${style.accent} text-white text-sm font-bold mb-4`}>
            {theme.toUpperCase()}
          </div>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-black text-gray-900 mb-2">
            {title}
          </h2>
          {description && (
            <p className="text-gray-700 text-base md:text-lg max-w-2xl">
              {description}
            </p>
          )}
        </motion.div>

        {/* Product Grid */}
        <div
          className={`grid grid-cols-${columns.mobile || 2} sm:grid-cols-${columns.tablet || 3} lg:grid-cols-${columns.desktop || 4} gap-4 md:gap-6`}
        >
          {products.slice(0, (columns.desktop || 4) * 2).map((product, index) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.05 }}
            >
              <GlossyProductCard
                product={product}
                index={index}
                onClick={() => (window.location.href = `/catalog/${product.id}`)}
                onAddToCart={() => {
                  // Handle add to cart
                }}
              />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

