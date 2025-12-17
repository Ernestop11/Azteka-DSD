'use client'

import { motion } from 'framer-motion'
import { useQuery } from '@tanstack/react-query'
import GlossyProductCard from './GlossyProductCard'
import { getPublicImageUrl } from '@/lib/imageUrl'
import { getPriceTier } from '@/lib/utils/priceTier'
import { toCatalogProduct, type CatalogProduct } from '@/lib/queries/catalog'
import type { CatalogProduct as ExtendedCatalogProduct } from '@/types/catalog'

interface ShowcaseSectionProps {
  title: string
  subtitle?: string
  filter?: 'featured' | 'seasonal' | 'trending'
  limit?: number
  onAddToCart?: (productId: string) => void
  activeTier?: 'A' | 'B' | 'C' | null
  showcase?: CatalogProduct[]
}

export default function ShowcaseSection({
  title,
  subtitle,
  filter = 'featured',
  limit = 8,
  onAddToCart,
  activeTier = null,
  showcase,
}: ShowcaseSectionProps) {
  // Build query params
  const params = new URLSearchParams()
  if (filter === 'featured') params.set('featured', 'true')
  if (filter === 'seasonal') params.set('seasonal', 'true')
  if (filter === 'trending') params.set('trending', 'true')
  params.set('limit', limit.toString())

  const shouldFetch = !showcase || showcase.length === 0
  const { data: productsData, isLoading } = useQuery<{ data: any[] }>({
    queryKey: ['showcase-products', filter, limit],
    queryFn: async () => {
      const res = await fetch(`/api/catalog/products?${params.toString()}`)
      if (!res.ok) throw new Error('Failed to fetch products')
      return res.json()
    },
    enabled: shouldFetch,
  })

  const rawProducts = showcase && showcase.length > 0 ? showcase : productsData?.data || []
  
  // Map products to unified CatalogProduct type
  const mappedProducts = rawProducts.map(toCatalogProduct)
  console.log('[ShowcaseSection] Mapped products:', mappedProducts.length, mappedProducts.slice(0, 3))
  
  // Convert to ExtendedCatalogProduct for component compatibility
  const products = mappedProducts.map((p: CatalogProduct) => {
    const original = rawProducts.find((rp: any) => rp.id === p.id)
    return {
      ...p,
      unitsPerCase: original?.unitsPerCase || 1,
      backgroundColor: original?.backgroundColor || undefined,
      backgroundGradient: original?.backgroundGradient || undefined,
      featured: original?.featured || false,
      seasonal: original?.seasonal || false,
      trending: original?.trending || false,
      tier: original?.tier || undefined,
      priceTierA: original?.priceTierA || undefined,
      priceTierB: original?.priceTierB || undefined,
      priceTierC: original?.priceTierC || undefined,
      points: original?.points || undefined,
      glossLevel: original?.glossLevel || undefined,
      sparkle: original?.sparkle || false,
      badge: original?.badge || undefined,
      theme: original?.theme || undefined,
      cardTheme: original?.cardTheme || 'gradient',
    } as ExtendedCatalogProduct
  })

  if (shouldFetch && isLoading) {
    return (
      <section className="py-8 md:py-12">
        <div className="container mx-auto px-4 md:px-6 lg:px-10">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {Array.from({ length: limit }).map((_, i) => (
              <div key={i} className="aspect-square rounded-2xl bg-gray-200 animate-pulse" />
            ))}
          </div>
        </div>
      </section>
    )
  }

  if (products.length === 0) {
    return null // Don't render if no products
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

  return (
    <section className="py-8 md:py-12">
      <div className="container mx-auto px-4 md:px-6 lg:px-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">{title}</h2>
          {subtitle && <p className="text-lg text-gray-600">{subtitle}</p>}
        </motion.div>

        {/* Product Grid */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, staggerChildren: 0.1 }}
          className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6"
        >
          {products.map((product, index) => {
            console.log("SHOWCASE ITEM", product)
            const productTier = product.tier && ['A', 'B', 'C'].includes(product.tier)
              ? (product.tier as 'A' | 'B' | 'C')
              : getPriceTier(Number(product.price))

            return (
              <GlossyProductCard
                key={product.id}
                product={{
                  id: product.id,
                  name: product.name,
                  brand: typeof product.brand === 'string' ? product.brand : product.brand?.name,
                  price: Number(product.price),
                  imageUrl: getPublicImageUrl(product.imageUrl),
                  backgroundColor: product.backgroundColor || undefined,
                  backgroundGradient: product.backgroundGradient || undefined,
                  badge: getProductBadge(product),
                  tier: productTier,
                  rewardsPoints: product.points ?? (product.featured ? 50 : product.trending ? 25 : undefined),
                  priceTierA: product.priceTierA ?? null,
                  priceTierB: product.priceTierB ?? null,
                  priceTierC: product.priceTierC ?? null,
                  activeTier: activeTier,
                  glossLevel: (product.glossLevel as 'none' | 'soft' | 'premium') || 'none',
                  sparkle: product.sparkle ?? false,
                  theme: (product.theme as 'default' | 'holiday' | 'summer' | 'muertos') || 'default',
                }}
                index={index}
                onAddToCart={() => onAddToCart?.(product.id)}
              />
            )
          })}
        </motion.div>
      </div>
    </section>
  )
}
