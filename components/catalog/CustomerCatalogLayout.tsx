'use client'

import { useQuery } from '@tanstack/react-query'
import QuickReorderSection from './QuickReorderSection'
import { useCart } from '@/hooks/useCart'
import type { PriceTier } from '@/lib/pricing/tierCalculator'

interface CustomerCatalogLayoutProps {
  customerId?: string
  customerTier?: PriceTier
  children: React.ReactNode
}

export default function CustomerCatalogLayout({
  customerId,
  customerTier = 1,
  children,
}: CustomerCatalogLayoutProps) {
  const { add } = useCart()

  // Fetch reorder template
  const { data: reorderData } = useQuery({
    queryKey: ['reorder-template', customerId],
    queryFn: async () => {
      if (!customerId) return null

      const res = await fetch(`/api/orders/reorder-template?customerId=${customerId}&limit=10`)
      if (!res.ok) throw new Error('Failed to fetch reorder template')
      return res.json()
    },
    enabled: !!customerId,
  })

  const reorderProducts = reorderData?.data || []

  const handleAddToCart = (productId: string, quantity: number) => {
    const product = reorderProducts.find((p: any) => p.id === productId)
    if (product) {
      add({
        id: product.id,
        name: product.name,
        price: product.price,
        quantity,
        imageUrl: product.imageUrl,
        sku: product.sku,
        unitsPerCase: product.unitsPerCase,
      })
    }
  }

  const handleReorderAll = () => {
    reorderProducts.forEach((product: any) => {
      if (product.lastOrderedQuantity > 0) {
        add({
          id: product.id,
          name: product.name,
          price: product.price,
          quantity: product.lastOrderedQuantity,
          imageUrl: product.imageUrl,
          sku: product.sku,
          unitsPerCase: product.unitsPerCase,
        })
      }
    })
  }

  return (
    <div>
      {/* Quick Reorder Section - Top Priority for Customers */}
      {reorderProducts.length > 0 && (
        <div className="px-4 md:px-6 lg:px-10 pt-6">
          <QuickReorderSection
            products={reorderProducts}
            customerTier={customerTier}
            onAddToCart={handleAddToCart}
            onReorderAll={handleReorderAll}
          />
        </div>
      )}

      {/* Rest of Catalog */}
      {children}
    </div>
  )
}
