'use client'

import { motion } from 'framer-motion'
import { Award, TrendingUp, Zap } from 'lucide-react'

interface PriceTierBarProps {
  activeTier?: 'A' | 'B' | 'C' | null
  onTierSelect?: (tier: 'A' | 'B' | 'C' | null) => void
  showCounts?: boolean
  tierCounts?: {
    A: number
    B: number
    C: number
  }
  highlightActive?: boolean // Highlight active tier when tiered pricing exists
}

const tiers = [
  {
    id: 'A' as const,
    name: 'Premium',
    icon: Award,
    description: 'Top-tier products',
    gradient: 'from-amber-400 via-yellow-500 to-amber-600',
    bgGradient: 'from-amber-50 to-yellow-50',
    textColor: 'text-amber-700',
    borderColor: 'border-amber-400',
  },
  {
    id: 'B' as const,
    name: 'Standard',
    icon: TrendingUp,
    description: 'Quality essentials',
    gradient: 'from-slate-400 via-gray-500 to-slate-600',
    bgGradient: 'from-slate-50 to-gray-50',
    textColor: 'text-slate-700',
    borderColor: 'border-slate-400',
  },
  {
    id: 'C' as const,
    name: 'Value',
    icon: Zap,
    description: 'Budget-friendly',
    gradient: 'from-orange-500 via-amber-600 to-orange-700',
    bgGradient: 'from-orange-50 to-amber-50',
    textColor: 'text-orange-700',
    borderColor: 'border-orange-500',
  },
]

export default function PriceTierBar({
  activeTier,
  onTierSelect,
  showCounts = true,
  tierCounts,
  highlightActive = false,
}: PriceTierBarProps) {
  return (
    <div className="sticky top-0 z-30 bg-white/95 backdrop-blur-lg border-b-2 border-gray-200 shadow-lg">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center gap-4 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-gray-300">
          {/* All Products Button */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onTierSelect?.(null)}
            className={`
              flex-shrink-0 px-6 py-3 rounded-xl font-bold
              transition-all duration-300
              ${
                activeTier === null
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg scale-105'
                  : 'bg-white text-gray-700 border-2 border-gray-300 hover:border-blue-400'
              }
            `}
          >
            All Products
          </motion.button>

          {/* Tier Buttons */}
          {tiers.map((tier, index) => {
            const Icon = tier.icon
            const isActive = activeTier === tier.id
            const count = tierCounts?.[tier.id]

            return (
              <motion.button
                key={tier.id}
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1, duration: 0.4 }}
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => onTierSelect?.(tier.id)}
                className={`
                  relative flex-shrink-0 px-6 py-3 rounded-xl
                  transition-all duration-300
                  ${
                    isActive
                      ? `bg-gradient-to-r ${tier.gradient} text-white shadow-xl scale-105 ring-2 ring-white/50`
                      : highlightActive && activeTier === tier.id
                      ? `bg-gradient-to-r ${tier.gradient} text-white shadow-lg opacity-90`
                      : `bg-gradient-to-br ${tier.bgGradient} ${tier.textColor} border-2 ${tier.borderColor} hover:shadow-lg`
                  }
                `}
              >
                {/* Glossy Overlay */}
                <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-white/30 via-transparent to-transparent opacity-50 pointer-events-none" />

                {/* Content */}
                <div className="relative flex items-center gap-3">
                  <div
                    className={`
                    p-2 rounded-lg
                    ${
                      isActive
                        ? 'bg-white/20 backdrop-blur-sm'
                        : 'bg-white/50'
                    }
                  `}
                  >
                    <Icon className="w-5 h-5" />
                  </div>

                  <div className="text-left">
                    <div className="font-bold flex items-center gap-2">
                      Tier {tier.id}
                      {showCounts && count !== undefined && (
                        <span
                          className={`
                          text-xs px-2 py-0.5 rounded-full
                          ${
                            isActive
                              ? 'bg-white/30 backdrop-blur-sm'
                              : 'bg-white/70'
                          }
                        `}
                        >
                          {count}
                        </span>
                      )}
                    </div>
                    <div
                      className={`
                      text-xs
                      ${isActive ? 'text-white/90' : 'opacity-75'}
                    `}
                    >
                      {tier.description}
                    </div>
                  </div>
                </div>

                {/* Active Indicator */}
                {isActive && (
                  <motion.div
                    layoutId="activeTier"
                    className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-white rounded-full shadow-lg"
                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                  />
                )}
              </motion.button>
            )
          })}
        </div>

        {/* Active Tier Description */}
        {activeTier && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-3 pt-3 border-t border-gray-200"
          >
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse" />
              Showing Tier {activeTier} products
            </div>
          </motion.div>
        )}
      </div>
    </div>
  )
}
