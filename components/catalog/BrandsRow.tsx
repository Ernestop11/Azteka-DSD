'use client'

import BrandSection from './BrandSection'
import { useQuery } from '@tanstack/react-query'
import { getPublicImageUrl } from '@/lib/imageUrl'
import type { CatalogBrand } from '@/src/types/catalog'

interface BrandsRowProps {
  title?: string
  onBrandClick?: (brandId: string) => void
  onViewAll?: () => void
}

export default function BrandsRow({ title = 'Shop by Brand', onBrandClick, onViewAll }: BrandsRowProps) {
  const { data: brandsData, isLoading } = useQuery<{ data: CatalogBrand[] }>({
    queryKey: ['catalog-brands'],
    queryFn: async () => {
      const res = await fetch('/api/admin/brands')
      if (!res.ok) throw new Error('Failed to fetch brands')
      return res.json()
    },
  })

  const brands = brandsData?.data || []

  if (isLoading) {
    return (
      <section className="py-8 md:py-12">
        <div className="container mx-auto px-4 md:px-6 lg:px-10">
          <div className="flex gap-4 overflow-x-auto">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="w-32 h-32 bg-gray-200 rounded-xl animate-pulse flex-shrink-0" />
            ))}
          </div>
        </div>
      </section>
    )
  }

  if (brands.length === 0) {
    return null // Don't render if no brands
  }

  return (
    <BrandSection
      brands={brands.map((b) => {
        console.log("BRAND ITEM", b)
        return {
          id: b.id,
          name: b.name,
          logoUrl: getPublicImageUrl(b.imageUrl),
          productCount: undefined, // Can be added if needed
          featured: false,
        }
      })}
      title={title}
      onBrandClick={onBrandClick}
      onViewAll={onViewAll}
    />
  )
}
