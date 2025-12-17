'use client'

import { motion } from 'framer-motion'
import GlossyProductCard from '../GlossyProductCard'

interface ZigzagGridProps {
  products: any[]
  onProductClick?: (product: any) => void
  onAddToCart?: (product: any) => void
  title?: string
  description?: string
}

export default function ZigzagGrid({
  products,
  onProductClick,
  onAddToCart,
  title,
  description
}: ZigzagGridProps) {
  if (!products || products.length === 0) return null

  return (
    <section className="py-12 md:py-16">
      <div className="container mx-auto px-4 md:px-6 lg:px-10">
        {/* Section Header */}
        {title && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl md:text-5xl font-black text-gray-900 mb-4">
              {title}
            </h2>
            {description && (
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                {description}
              </p>
            )}
          </motion.div>
        )}

        {/* Zigzag Grid Layout */}
        <div className="space-y-8 md:space-y-12">
          {products.reduce((rows: any[], product, index) => {
            const rowIndex = Math.floor(index / 3)
            if (!rows[rowIndex]) rows[rowIndex] = []
            rows[rowIndex].push(product)
            return rows
          }, []).map((row, rowIndex) => (
            <motion.div
              key={rowIndex}
              initial={{ opacity: 0, x: rowIndex % 2 === 0 ? -50 : 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: rowIndex * 0.1 }}
              className={`
                grid grid-cols-1 md:grid-cols-3 gap-6
                ${rowIndex % 2 === 1 ? 'md:flex md:flex-row-reverse' : ''}
              `}
            >
              {row.map((product: any, prodIndex: number) => (
                <div
                  key={product.id}
                  className={`
                    ${prodIndex === 1 ? 'md:transform md:translate-y-8' : ''}
                  `}
                >
                  <GlossyProductCard
                    product={product}
                    index={rowIndex * 3 + prodIndex}
                    onClick={() => onProductClick?.(product)}
                    onAddToCart={() => onAddToCart?.(product)}
                  />
                </div>
              ))}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
