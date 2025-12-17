'use client'

import { motion } from 'framer-motion'
import { getTierInfo, type PriceTier } from '@/lib/pricing/tierCalculator'

interface PriceTierBadgeProps {
  tier: PriceTier
  size?: 'sm' | 'md' | 'lg'
  showIcon?: boolean
  showName?: boolean
  animated?: boolean
}

export default function PriceTierBadge({
  tier,
  size = 'md',
  showIcon = true,
  showName = true,
  animated = true,
}: PriceTierBadgeProps) {
  const tierInfo = getTierInfo(tier)

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-3 py-1 text-sm',
    lg: 'px-4 py-1.5 text-base',
  }

  const BadgeContent = (
    <div
      className={`inline-flex items-center gap-1.5 rounded-full font-bold ${sizeClasses[size]}`}
      style={{
        backgroundColor: tierInfo.bgColor,
        color: tierInfo.textColor,
      }}
    >
      {showIcon && <span>{tierInfo.icon}</span>}
      {showName && <span>{tierInfo.name}</span>}
    </div>
  )

  if (animated) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        whileHover={{ scale: 1.05 }}
      >
        {BadgeContent}
      </motion.div>
    )
  }

  return BadgeContent
}
