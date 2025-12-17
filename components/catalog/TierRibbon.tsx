'use client'

import { motion } from 'framer-motion'
import { Award } from 'lucide-react'

interface TierRibbonProps {
  tier: 'A' | 'B' | 'C'
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right'
  size?: 'sm' | 'md' | 'lg'
  animated?: boolean
}

const tierConfig = {
  A: {
    gradient: 'from-amber-400 via-yellow-500 to-amber-600',
    label: 'Premium',
    iconColor: 'text-white',
  },
  B: {
    gradient: 'from-slate-300 via-slate-400 to-slate-500',
    label: 'Standard',
    iconColor: 'text-white',
  },
  C: {
    gradient: 'from-orange-600 via-amber-700 to-orange-800',
    label: 'Value',
    iconColor: 'text-white',
  },
}

const sizeClasses = {
  sm: 'px-2 py-0.5 text-xs',
  md: 'px-3 py-1 text-xs',
  lg: 'px-4 py-1.5 text-sm',
}

const positionClasses = {
  'top-left': 'top-3 left-3',
  'top-right': 'top-3 right-3',
  'bottom-left': 'bottom-3 left-3',
  'bottom-right': 'bottom-3 right-3',
}

export default function TierRibbon({
  tier,
  position = 'top-left',
  size = 'md',
  animated = true,
}: TierRibbonProps) {
  const config = tierConfig[tier]
  const positionClass = positionClasses[position]
  const sizeClass = sizeClasses[size]

  const ribbon = (
    <div
      className={`
        absolute ${positionClass} z-20
        px-3 py-1 rounded-full
        bg-gradient-to-r ${config.gradient}
        shadow-lg backdrop-blur-sm
        flex items-center gap-1
        ${sizeClass}
        font-bold text-white
      `}
    >
      <Award className={`w-3 h-3 ${config.iconColor}`} />
      <span>Tier {tier}</span>
    </div>
  )

  if (animated) {
    return (
      <motion.div
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{
          type: 'spring',
          stiffness: 200,
          damping: 15,
          delay: 0.2,
        }}
        className={`absolute ${positionClass} z-20`}
      >
        <div
          className={`
            px-3 py-1 rounded-full
            bg-gradient-to-r ${config.gradient}
            shadow-lg backdrop-blur-sm
            flex items-center gap-1
            ${sizeClass}
            font-bold text-white
          `}
        >
          <Award className={`w-3 h-3 ${config.iconColor}`} />
          <span>Tier {tier}</span>
        </div>
      </motion.div>
    )
  }

  return ribbon
}

