'use client'

import { useQuery } from '@tanstack/react-query'
import BrandBundleHero from './BrandBundleHero'
import type { CatalogBrand } from '@/lib/catalogBuilder'

interface BrandBundleHeroesSectionProps {
  brands: CatalogBrand[]
}

function BrandBundleHeroItem({ brandId }: { brandId: string }) {
  const { data: bundleData } = useQuery({
    queryKey: ['brand-bundle', brandId],
    queryFn: async () => {
      const res = await fetch(`/api/admin/bundles/brand/${brandId}`)
      if (!res.ok) return null
      const json = await res.json()
      return json.data
    },
    enabled: !!brandId,
  })

  if (!bundleData) return null

  return (
    <BrandBundleHero
      bundle={bundleData}
      onAddToCart={() => {
        // Cart will open automatically via AddToCartModal
      }}
    />
  )
}

export default function BrandBundleHeroesSection({ brands }: BrandBundleHeroesSectionProps) {
  // Only show first 2 brands to avoid too many API calls
  const featuredBrands = brands.slice(0, 2)

  if (featuredBrands.length === 0) return null

  return (
    <div className="space-y-8 md:space-y-12 px-4 md:px-6 lg:px-10 py-8 md:py-12">
      {featuredBrands.map((brand) => (
        <BrandBundleHeroItem key={brand.id} brandId={brand.id} />
      ))}
    </div>
  )
}

