'use client'

import { motion } from 'framer-motion'
import GlossyProductCard from '../GlossyProductCard'
import PromoPanel from '../PromoPanel'
import type { CatalogProduct } from '@/src/types/catalog'

export interface PromoInsert {
  position: number // Insert after this product index
  productImage: string
  title: string
  discount: number
  description?: string
  variant?: 'chedraui' | 'walmart' | 'default'
  onCtaClick?: () => void
}

export interface MidPromoRowProps {
  products: CatalogProduct[]
  promos: PromoInsert[]
  columns?: number
  gap?: number
  onProductClick?: (productId: string) => void
  onAddToCart?: (productId: string) => void
  activeTier?: 'A' | 'B' | 'C' | null
}

export default function MidPromoRow({
  products,
  promos,
  columns = 4,
  gap = 6,
  onProductClick,
  onAddToCart,
  activeTier,
}: MidPromoRowProps) {
  // Build layout with products and promos interspersed
  const buildLayout = () => {
    const layout: Array<{ type: 'product' | 'promo'; data: any; index: number }> = []
    let productIndex = 0

    products.forEach((product, idx) => {
      layout.push({ type: 'product', data: product, index: productIndex++ })

      // Check if there's a promo to insert after this product
      const promo = promos.find(p => p.position === idx)
      if (promo) {
        layout.push({ type: 'promo', data: promo, index: productIndex++ })
      }
    })

    return layout
  }

  const layout = buildLayout()

  const gridColsClass = `grid-cols-1 sm:grid-cols-2 lg:grid-cols-${columns}`
  const gapClass = `gap-${gap}`

  return (
    <div className={`grid ${gridColsClass} ${gapClass}`}>
      {layout.map((item, index) => {
        if (item.type === 'product') {
          const product = item.data as CatalogProduct

          return (
            <motion.div
              key={`product-${product.id}`}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{
                delay: index * 0.03,
                duration: 0.5,
              }}
            >
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
            </motion.div>
          )
        } else {
          const promo = item.data as PromoInsert

          return (
            <motion.div
              key={`promo-${index}`}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{
                delay: index * 0.03,
                duration: 0.6,
                type: 'spring',
              }}
              className={`
                ${columns >= 4 ? 'lg:col-span-2' : 'lg:col-span-1'}
                sm:col-span-2
              `}
            >
              <PromoPanel
                productImage={promo.productImage}
                title={promo.title}
                discount={promo.discount}
                description={promo.description}
                variant={promo.variant}
                onCtaClick={promo.onCtaClick}
                index={index}
              />
            </motion.div>
          )
        }
      })}
    </div>
  )
}
