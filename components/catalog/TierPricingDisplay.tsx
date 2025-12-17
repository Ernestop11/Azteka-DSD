'use client'

import { motion } from 'framer-motion'
import { Award, TrendingUp } from 'lucide-react'

interface TierPricingDisplayProps {
  product: {
    id: string
    name: string
    price: number
    priceTierA?: number | null
    priceTierB?: number | null
    priceTierC?: number | null
    tier?: 'A' | 'B' | 'C' | null
  }
  currentTier?: 'A' | 'B' | 'C'
}

export default function TierPricingDisplay({
  product,
  currentTier,
}: TierPricingDisplayProps) {
  const tiers = [
    { id: 'A', price: product.priceTierA, label: 'Tier A', color: 'from-green-500 to-emerald-600' },
    { id: 'B', price: product.priceTierB, label: 'Tier B', color: 'from-blue-500 to-cyan-600' },
    { id: 'C', price: product.priceTierC, label: 'Tier C', color: 'from-purple-500 to-pink-600' },
  ].filter(tier => tier.price !== null && tier.price !== undefined)

  if (tiers.length === 0) return null

  const activeTier = currentTier || product.tier
  const basePrice = product.price

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Award className="w-4 h-4 text-gray-600" />
        <span className="text-sm font-semibold text-gray-700">Tier Pricing</span>
      </div>

      <div className="space-y-2">
        {tiers.map((tier, index) => {
          const isActive = tier.id === activeTier
          const savings = basePrice - (tier.price || 0)
          const savingsPercent = ((savings / basePrice) * 100).toFixed(0)

          return (
            <motion.div
              key={tier.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`
                relative p-3 rounded-lg border-2 transition-all
                ${isActive 
                  ? 'border-blue-500 bg-blue-50 shadow-md' 
                  : 'border-gray-200 bg-white hover:border-gray-300'
                }
              `}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full bg-gradient-to-r ${tier.color}`} />
                  <span className={`text-sm font-semibold ${isActive ? 'text-blue-700' : 'text-gray-700'}`}>
                    {tier.label}
                  </span>
                  {isActive && (
                    <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs font-bold rounded-full">
                      ACTIVE
                    </span>
                  )}
                </div>
                <div className="text-right">
                  <div className={`text-lg font-bold ${isActive ? 'text-blue-700' : 'text-gray-900'}`}>
                    ${(tier.price || 0).toFixed(2)}
                  </div>
                  {savings > 0 && (
                    <div className="flex items-center gap-1 text-xs text-green-600">
                      <TrendingUp className="w-3 h-3" />
                      <span>Save {savingsPercent}%</span>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )
        })}
      </div>

      {!activeTier && (
        <p className="text-xs text-gray-500 italic">
          Select a tier to see pricing
        </p>
      )}
    </div>
  )
}

