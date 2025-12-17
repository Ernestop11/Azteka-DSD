'use client'

import { motion } from 'framer-motion'
import GlossyProductCard from '../GlossyProductCard'
import type { CatalogProduct } from '@/src/types/catalog'

export interface MasonryGridProps {
  products: CatalogProduct[]
  columns?: {
    mobile?: number
    tablet?: number
    desktop?: number
  }
  gap?: number
  onProductClick?: (productId: string) => void
  onAddToCart?: (productId: string) => void
  activeTier?: 'A' | 'B' | 'C' | null
  shimmerEffect?: boolean
}

export default function MasonryGrid({
  products,
  columns = { mobile: 1, tablet: 2, desktop: 3 },
  gap = 6,
  onProductClick,
  onAddToCart,
  activeTier,
  shimmerEffect = true,
}: MasonryGridProps) {
  // Calculate staggered heights (creates masonry effect)
  const getCardHeight = (index: number): string => {
    const heights = ['h-96', 'h-[28rem]', 'h-[32rem]', 'h-[26rem]']
    return heights[index % heights.length]
  }

  const getColumnClass = () => {
    return `
      grid-cols-${columns.mobile || 1}
      md:grid-cols-${columns.tablet || 2}
      lg:grid-cols-${columns.desktop || 3}
    `
  }

  return (
    <div className={`grid ${getColumnClass()} gap-${gap} auto-rows-auto`}>
      {products.map((product, index) => (
        <motion.div
          key={product.id}
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{
            delay: index * 0.05,
            duration: 0.6,
            type: 'spring',
            stiffness: 100,
          }}
          className={`relative ${getCardHeight(index)} overflow-hidden rounded-2xl`}
        >
          {/* Shimmer Effect Layer */}
          {shimmerEffect && (
            <div className="absolute inset-0 opacity-0 hover:opacity-100 transition-opacity duration-700 pointer-events-none">
              <motion.div
                animate={{
                  x: ['-200%', '200%'],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  repeatDelay: 3,
                  ease: 'easeInOut',
                }}
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12"
              />
            </div>
          )}

          {/* Product Card */}
          <div className="h-full">
            <GlossyProductCard
              product={{
                id: product.id,
                name: product.name,
                brand: product.brand,
                price: product.price,
                originalPrice: product.originalPrice,
                imageUrl: product.imageUrl,
                tier: product.tier || undefined,
                rewardsPoints: product.rewardsPoints || product.points,
                points: product.points || product.rewardsPoints,
                rating: product.rating,
                seasonal: product.seasonal || undefined,
                priceTierA: product.priceTierA,
                priceTierB: product.priceTierB,
                priceTierC: product.priceTierC,
                activeTier: activeTier || product.activeTier || undefined,
                glossLevel: product.glossLevel || undefined,
                sparkle: product.sparkle || false,
                badge: product.badge || undefined,
                theme: product.theme || undefined,
              }}
              index={index}
              onClick={() => onProductClick?.(product.id)}
              onAddToCart={() => onAddToCart?.(product.id)}
            />
          </div>
        </motion.div>
      ))}
    </div>
  )
}
