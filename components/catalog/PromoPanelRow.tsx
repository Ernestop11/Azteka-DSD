'use client'

import { motion } from 'framer-motion'
import { useQuery } from '@tanstack/react-query'
import Billboard from './Billboard'
import { getPublicImageUrl } from '@/lib/imageUrl'
import type { PromoPanel } from '@/src/types/catalog'

interface PromoPanelRowProps {
  limit?: number
}

export default function PromoPanelRow({ limit = 3 }: PromoPanelRowProps) {
  // Fetch active billboard promos from admin settings
  const { data: promosData, isLoading } = useQuery<{ promos?: PromoPanel[]; data?: PromoPanel[] }>({
    queryKey: ['billboard-promos'],
    queryFn: async () => {
      const res = await fetch('/api/admin/catalog/promos')
      if (!res.ok) throw new Error('Failed to fetch promos')
      return res.json()
    },
  })

  const promoList: PromoPanel[] = Array.isArray(promosData?.promos)
    ? promosData?.promos
    : Array.isArray(promosData?.data)
      ? promosData?.data as PromoPanel[]
      : []

  const promos = promoList.filter((p) => p.active !== false).slice(0, limit)

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
        {Array.from({ length: limit }).map((_, i) => (
          <div key={i} className="h-64 bg-gray-200 rounded-2xl animate-pulse" />
        ))}
      </div>
    )
  }

  if (promos.length === 0) {
    return null // Don't render if no promos
  }

  return (
    <section className="py-8 md:py-12">
      <div className="container mx-auto px-4 md:px-6 lg:px-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {promos.map((promo: PromoPanel, index: number) => {
            console.log("PROMO ITEM", promo)
            return (
            <motion.div
              key={promo.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-100px' }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
            >
              <Billboard
                title={promo.title}
                subtitle={promo.subtitle}
                description={promo.description}
                imageUrl={getPublicImageUrl(promo.imageUrl)}
                imagePosition={promo.imagePosition || 'right'}
                theme={promo.theme || 'blue'}
                ctaText={promo.ctaText}
                onCtaClick={() => {
                  if (promo.ctaLink) {
                    window.location.href = promo.ctaLink
                  }
                }}
              />
            </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
