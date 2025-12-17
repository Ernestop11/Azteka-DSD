'use client'

import MarqueeScroll from './MarqueeScroll'
import { useQuery } from '@tanstack/react-query'
import { getPublicImageUrl } from '@/lib/imageUrl'
import { toCatalogProduct, type CatalogProduct } from '@/lib/queries/catalog'

interface TrendingRowProps {
  title?: string
  limit?: number
  onItemClick?: (productId: string) => void
  trending?: any[] // Accept trending products from layout
}

export default function TrendingRow({ title = 'Trending Now', limit = 8, onItemClick, trending }: TrendingRowProps) {
  // Use provided trending products or fetch from API
  const shouldFetch = !trending || trending.length === 0
  const { data: productsData, isLoading } = useQuery<{ data: any[] }>({
    queryKey: ['trending-products'],
    queryFn: async () => {
      const res = await fetch('/api/catalog/products?trending=true&limit=20')
      if (!res.ok) throw new Error('Failed to fetch trending products')
      return res.json()
    },
    enabled: shouldFetch,
  })

  const rawProducts = trending && trending.length > 0 
    ? trending 
    : (productsData?.data || []).filter((p: any) => p.trending).slice(0, limit)
  
  // Map products to unified CatalogProduct type
  const products = rawProducts.map(toCatalogProduct)
  console.log('[TrendingRow] Mapped products:', products.length, products.slice(0, 3))

  if (isLoading) {
    return (
      <section className="py-8 md:py-12">
        <div className="container mx-auto px-4 md:px-6 lg:px-10">
          <div className="h-48 bg-gray-200 rounded-2xl animate-pulse" />
        </div>
      </section>
    )
  }

  if (products.length === 0) {
    return null // Don't render if no trending products
  }

  return (
    <section className="py-8 md:py-12 bg-gradient-to-br from-orange-50 via-red-50 to-pink-50">
      <div className="container mx-auto px-4 md:px-6 lg:px-10">
        <MarqueeScroll
          title={title}
          items={products.map((p) => {
            console.log("TRENDING ITEM", p)
            return {
              id: p.id,
              imageUrl: getPublicImageUrl(p.imageUrl),
              title: p.name,
              price: Number(p.price),
              badge: 'HOT' as const,
            }
          })}
          speed={40}
          direction="left"
          pauseOnHover
          onItemClick={(item) => onItemClick?.(item.id)}
        />
      </div>
    </section>
  )
}
