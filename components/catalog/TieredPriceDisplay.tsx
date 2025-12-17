'use client'

import { motion } from 'framer-motion'
import {
  calculateTieredPrice,
  formatPrice,
  formatSavings,
  type ProductPricing,
} from '@/lib/pricing/priceDisplay'
import type { PriceTier } from '@/lib/pricing/tierCalculator'
import { TOY_STORE_COLORS, TOY_STORE_SHADOWS } from '@/lib/theme/toyStoreTheme'

interface TieredPriceDisplayProps {
  pricing: ProductPricing
  customerTier: PriceTier
  size?: 'sm' | 'md' | 'lg'
  layout?: 'compact' | 'detailed'
}

export default function TieredPriceDisplay({
  pricing,
  customerTier,
  size = 'md',
  layout = 'detailed',
}: TieredPriceDisplayProps) {
  const calculated = calculateTieredPrice(pricing, customerTier)

  const priceSizeClasses = {
    sm: 'text-xl',
    md: 'text-2xl',
    lg: 'text-3xl',
  }

  const savingsSizeClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
  }

  // Competitive Product Display (Show original price + discount)
  if (pricing.isCompetitive && calculated.showOriginalPrice) {
    return (
      <motion.div
        className="space-y-1"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        {/* Final Price (BIG & BOLD - Toy Store style) */}
        <div className="flex items-baseline gap-2">
          <motion.span
            className={`font-black ${priceSizeClasses[size]}`}
            style={{
              color: TOY_STORE_COLORS.price.discount,
              textShadow: '0 2px 4px rgba(0,0,0,0.1)',
            }}
            whileHover={{ scale: 1.05 }}
          >
            {formatPrice(calculated.finalPrice)}
          </motion.span>

          {/* Original Price (Strikethrough) */}
          <span
            className="text-gray-500 line-through text-sm font-medium"
          >
            {formatPrice(calculated.originalPrice)}
          </span>
        </div>

        {/* Savings Badge (Amazon style) */}
        {layout === 'detailed' && calculated.savings > 0 && (
          <motion.div
            className={`inline-block px-2 py-0.5 rounded ${savingsSizeClasses[size]} font-bold text-white`}
            style={{
              backgroundColor: TOY_STORE_COLORS.badge.sale,
              boxShadow: TOY_STORE_SHADOWS.badge,
            }}
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            whileHover={{ scale: 1.05 }}
          >
            {formatSavings(calculated.savings, calculated.discountPercent)}
          </motion.div>
        )}

        <p className="text-xs text-gray-600">per case</p>
      </motion.div>
    )
  }

  // Exclusive Product Display (Show discount % only)
  if (pricing.isExclusive && calculated.discountPercent > 0) {
    return (
      <motion.div
        className="space-y-1"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        {/* Final Price */}
        <div className="flex items-baseline gap-2">
          <motion.span
            className={`font-black ${priceSizeClasses[size]}`}
            style={{
              color: TOY_STORE_COLORS.primary.red,
              textShadow: '0 2px 4px rgba(0,0,0,0.1)',
            }}
            whileHover={{ scale: 1.05 }}
          >
            {formatPrice(calculated.finalPrice)}
          </motion.span>
        </div>

        {/* Exclusive Discount Badge */}
        {layout === 'detailed' && (
          <motion.div
            className={`inline-block px-2 py-0.5 rounded ${savingsSizeClasses[size]} font-bold text-white`}
            style={{
              backgroundColor: TOY_STORE_COLORS.badge.limited,
              boxShadow: TOY_STORE_SHADOWS.badge,
            }}
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            whileHover={{ scale: 1.05 }}
          >
            🎁 {calculated.discountPercent.toFixed(0)}% OFF (VIP Exclusive)
          </motion.div>
        )}

        <p className="text-xs text-gray-600">per case</p>
      </motion.div>
    )
  }

  // Regular Product Display (No discount)
  return (
    <motion.div
      className="space-y-1"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <motion.span
        className={`font-black ${priceSizeClasses[size]}`}
        style={{
          color: TOY_STORE_COLORS.primary.blue,
          textShadow: '0 2px 4px rgba(0,0,0,0.1)',
        }}
        whileHover={{ scale: 1.05 }}
      >
        {formatPrice(calculated.finalPrice)}
      </motion.span>
      <p className="text-xs text-gray-600">per case</p>
    </motion.div>
  )
}
