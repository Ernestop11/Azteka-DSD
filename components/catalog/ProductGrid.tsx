'use client'

import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import ToyStoreProductCard from './ToyStoreProductCard'
import { getPublicImageUrl } from '@/lib/imageUrl'
import { getPriceTier } from '@/lib/utils/priceTier'
import type { CatalogProduct } from '@/src/types/catalog'
import type { PriceTier } from '@/lib/pricing/tierCalculator'

interface ProductGridProps {
  products: CatalogProduct[]
  title?: string
  onAddToCart?: (product: CatalogProduct) => void
  onQuickView?: (product: CatalogProduct) => void
  activeTier?: 'A' | 'B' | 'C' | null
  customerTier?: PriceTier
  columns?: {
    mobile?: number
    tablet?: number
    desktop?: number
  }
  isLoading?: boolean
}

export default function ProductGrid({
  products,
  title,
  onAddToCart,
  onQuickView,
  activeTier = null,
  customerTier = 1,
  columns = { mobile: 1, tablet: 2, desktop: 4 },
  isLoading = false,
}: ProductGridProps) {
  const router = useRouter()
  if (products.length === 0) {
    return (
      <section className="py-8 md:py-12">
        <div className="container mx-auto px-4 md:px-6 lg:px-10">
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg mb-2">No products found</p>
            <p className="text-sm text-gray-400">Try adjusting your filters</p>
          </div>
        </div>
      </section>
    )
  }

  const getProductBadge = (product: CatalogProduct): 'NEW' | 'SALE' | 'HOT' | 'LIMITED' | undefined => {
    if (product.badge && ['NEW', 'SALE', 'HOT', 'LIMITED'].includes(product.badge)) {
      return product.badge as 'NEW' | 'SALE' | 'HOT' | 'LIMITED'
    }
    if (product.trending) return 'HOT'
    if (product.featured) return 'NEW'
    if (product.seasonal) return 'LIMITED'
    return undefined
  }

  const gridCols = `grid-cols-${columns.mobile || 1} sm:grid-cols-${columns.tablet || 2} lg:grid-cols-${columns.desktop || 4}`

  return (
    <section className="py-8 md:py-12">
      <div className="container mx-auto px-4 md:px-6 lg:px-10">
        {title && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="mb-8"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900">{title}</h2>
          </motion.div>
        )}

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, staggerChildren: 0.05 }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6"
        >
          {products.map((product, index) => (
            <ToyStoreProductCard
              key={product.id}
              product={{
                id: product.id,
                name: product.name,
                sku: product.sku || '',
                description: product.description,
                price: Number(product.price),
                imageUrl: product.imageUrl,
                unitsPerCase: product.unitsPerCase,
                category: product.category,
                brand: product.brand,
                isCompetitive: (product as any).isCompetitive || false,
                isExclusive: (product as any).isExclusive || false,
                discountTier1: (product as any).discountTier1,
                discountTier2: (product as any).discountTier2,
                discountTier3: (product as any).discountTier3,
                exclusiveDiscount: (product as any).exclusiveDiscount,
                badge: product.badge,
                featured: product.featured,
                trending: product.trending,
                seasonal: product.seasonal,
              }}
              customerTier={customerTier}
              onAddToCart={() => onAddToCart?.(product)}
              onQuickView={() => onQuickView?.(product)}
              onClick={() => router.push(`/catalog/${product.id}`)}
            />
          ))}
        </motion.div>
      </div>
    </section>
  )
}
