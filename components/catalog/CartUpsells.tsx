'use client'

import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { Sparkles, ArrowRight } from 'lucide-react'
// @ts-ignore - upsellRecipes may not have types
import { findApplicableUpsells } from '@/lib/cards/upsellRecipes'
import { useCart } from '@/context/CartContext'
import GlossyProductCard from './GlossyProductCard'
import { getPublicImageUrl } from '@/lib/imageUrl'
import type { CatalogProduct } from '@/lib/queries/catalog'

interface CartUpsellsProps {
  onAddProduct: (product: CatalogProduct) => void
}

export default function CartUpsells({ onAddProduct }: CartUpsellsProps) {
  const { items, totals } = useCart()

  // Fetch all products for upsell matching
  const { data: productsData } = useQuery<{ data: CatalogProduct[] }>({
    queryKey: ['catalog-products-for-upsells'],
    queryFn: async () => {
      const res = await fetch('/api/catalog/products?limit=200')
      if (!res.ok) throw new Error('Failed to fetch products')
      return res.json()
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  })

  const allProducts = productsData?.data || []

  // Calculate cart state for upsell matching
  const cartProductIds = items.map(item => item.id).map(id => parseInt(id) || 0)
  const cartCategoryIds: number[] = [] // TODO: Extract from items if category info available
  const cartBrandIds: number[] = [] // TODO: Extract from items if brand info available
  const cartTotalValue = totals.subtotal

  // Find applicable upsells
  const upsellRecipes = findApplicableUpsells({
    cartProductIds,
    cartCategoryIds,
    cartBrandIds,
    cartTotalValue,
    currentSeason: 'default', // TODO: Get from date/season
  })

  if (upsellRecipes.length === 0 || allProducts.length === 0) {
    return null
  }

  // Get recommended products from first upsell recipe
  const topRecipe = upsellRecipes[0]
  const recommendedProductIds = topRecipe.recommendedProductIds || []
  const recommendedProducts = allProducts
    .filter(p => recommendedProductIds.includes(parseInt(p.id) || 0))
    .slice(0, 4) // Show max 4 upsell products

  if (recommendedProducts.length === 0) {
    return null
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="mt-6 p-4 bg-gradient-to-r from-yellow-50 to-orange-50 border-2 border-orange-200 rounded-xl"
    >
      <div className="flex items-center gap-2 mb-3">
        <Sparkles className="w-5 h-5 text-orange-600" />
        <h3 className="font-bold text-orange-900">Complete Your Order</h3>
      </div>
      <p className="text-sm text-orange-800 mb-4">
        {topRecipe.description || 'Add these items to complete your bundle and save!'}
      </p>

      <div className="grid grid-cols-2 gap-3">
        {recommendedProducts.map((product) => (
          <motion.div
            key={product.id}
            whileHover={{ scale: 1.02 }}
            className="bg-white rounded-lg p-2 border border-orange-200 cursor-pointer"
            onClick={() => onAddProduct(product)}
          >
            <div className="flex items-center gap-2">
              <div className="w-12 h-12 bg-gray-100 rounded overflow-hidden flex-shrink-0">
                <img
                  src={getPublicImageUrl(product.imageUrl)}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-gray-900 truncate">{product.name}</p>
                <p className="text-xs text-gray-600">${Number(product.price).toFixed(2)}</p>
              </div>
              <ArrowRight className="w-4 h-4 text-orange-600 flex-shrink-0" />
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  )
}

