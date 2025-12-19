'use client'

import { useEffect, useRef, useState } from 'react'
import dynamic from 'next/dynamic'

// Dynamically import Lottie to avoid SSR issues
const Lottie = dynamic(() => import('lottie-react'), { ssr: false })

/**
 * NEW FEATURE: Lottie Animation Badges for Products
 *
 * Add eye-catching animated badges to products:
 * - Sale/discount indicators
 * - "New" product badges
 * - "Hot" trending indicators
 * - Sparkle effects
 * - Custom animations from LottieFiles
 */

// Pre-built animation data (inline to avoid network requests)
const ANIMATIONS = {
  // Simple sparkle effect
  sparkle: {
    v: "5.7.4",
    fr: 30,
    ip: 0,
    op: 60,
    w: 100,
    h: 100,
    assets: [],
    layers: [{
      ty: 4,
      nm: "sparkle",
      sr: 1,
      ks: {
        o: { a: 1, k: [{ t: 0, s: [100] }, { t: 30, s: [0] }, { t: 60, s: [100] }] },
        r: { a: 1, k: [{ t: 0, s: [0] }, { t: 60, s: [360] }] },
        p: { a: 0, k: [50, 50] },
        a: { a: 0, k: [0, 0] },
        s: { a: 1, k: [{ t: 0, s: [100, 100] }, { t: 30, s: [120, 120] }, { t: 60, s: [100, 100] }] }
      },
      shapes: [{
        ty: "sr",
        sy: 1,
        d: 1,
        pt: { a: 0, k: 4 },
        p: { a: 0, k: [0, 0] },
        r: { a: 0, k: 0 },
        ir: { a: 0, k: 10 },
        or: { a: 0, k: 25 }
      }, {
        ty: "fl",
        c: { a: 0, k: [1, 0.84, 0, 1] },
        o: { a: 0, k: 100 }
      }]
    }]
  },

  // Pulse effect for "hot" items
  pulse: {
    v: "5.7.4",
    fr: 30,
    ip: 0,
    op: 45,
    w: 100,
    h: 100,
    assets: [],
    layers: [{
      ty: 4,
      nm: "pulse",
      sr: 1,
      ks: {
        o: { a: 1, k: [{ t: 0, s: [100] }, { t: 22, s: [50] }, { t: 45, s: [100] }] },
        p: { a: 0, k: [50, 50] },
        s: { a: 1, k: [{ t: 0, s: [100, 100] }, { t: 22, s: [115, 115] }, { t: 45, s: [100, 100] }] }
      },
      shapes: [{
        ty: "el",
        p: { a: 0, k: [0, 0] },
        s: { a: 0, k: [40, 40] }
      }, {
        ty: "fl",
        c: { a: 0, k: [1, 0.2, 0.2, 1] },
        o: { a: 0, k: 100 }
      }]
    }]
  },

  // Bounce effect for new items
  bounce: {
    v: "5.7.4",
    fr: 30,
    ip: 0,
    op: 30,
    w: 100,
    h: 100,
    assets: [],
    layers: [{
      ty: 4,
      nm: "bounce",
      sr: 1,
      ks: {
        o: { a: 0, k: 100 },
        p: { a: 1, k: [
          { t: 0, s: [50, 50] },
          { t: 10, s: [50, 40] },
          { t: 20, s: [50, 55] },
          { t: 30, s: [50, 50] }
        ]},
        s: { a: 0, k: [100, 100] }
      },
      shapes: [{
        ty: "rc",
        p: { a: 0, k: [0, 0] },
        s: { a: 0, k: [60, 25] },
        r: { a: 0, k: 5 }
      }, {
        ty: "fl",
        c: { a: 0, k: [0.2, 0.8, 0.2, 1] },
        o: { a: 0, k: 100 }
      }]
    }]
  }
}

export type BadgeType = 'sale' | 'new' | 'hot' | 'trending' | 'sparkle' | 'custom'

interface LottieBadgeProps {
  type: BadgeType
  text?: string
  size?: number
  className?: string
  loop?: boolean
  customAnimation?: object
}

export function LottieBadge({
  type,
  text,
  size = 40,
  className = '',
  loop = true,
  customAnimation
}: LottieBadgeProps) {
  const [animationData, setAnimationData] = useState<object | null>(null)

  useEffect(() => {
    // Select animation based on type
    switch (type) {
      case 'sale':
      case 'hot':
        setAnimationData(ANIMATIONS.pulse)
        break
      case 'new':
        setAnimationData(ANIMATIONS.bounce)
        break
      case 'sparkle':
      case 'trending':
        setAnimationData(ANIMATIONS.sparkle)
        break
      case 'custom':
        if (customAnimation) {
          setAnimationData(customAnimation)
        }
        break
      default:
        setAnimationData(ANIMATIONS.sparkle)
    }
  }, [type, customAnimation])

  if (!animationData) return null

  const getBadgeColors = () => {
    switch (type) {
      case 'sale':
        return 'bg-red-500 text-white'
      case 'new':
        return 'bg-green-500 text-white'
      case 'hot':
        return 'bg-orange-500 text-white'
      case 'trending':
        return 'bg-purple-500 text-white'
      default:
        return 'bg-yellow-400 text-black'
    }
  }

  const getDefaultText = () => {
    switch (type) {
      case 'sale': return 'SALE'
      case 'new': return 'NEW'
      case 'hot': return 'HOT'
      case 'trending': return '🔥'
      default: return ''
    }
  }

  return (
    <div className={`relative inline-flex items-center justify-center ${className}`}>
      {/* Lottie animation background */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ width: size, height: size }}
      >
        <Lottie
          animationData={animationData}
          loop={loop}
          style={{ width: '100%', height: '100%' }}
        />
      </div>

      {/* Text overlay */}
      {(text || getDefaultText()) && (
        <span
          className={`relative z-10 px-2 py-0.5 rounded-full text-xs font-bold ${getBadgeColors()}`}
          style={{ fontSize: size * 0.3 }}
        >
          {text || getDefaultText()}
        </span>
      )}
    </div>
  )
}

/**
 * Standalone sparkle effect that can be overlaid on any element
 */
export function SparkleOverlay({
  size = 60,
  position = 'top-right',
  className = ''
}: {
  size?: number
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'center'
  className?: string
}) {
  const positionClasses = {
    'top-left': 'top-0 left-0 -translate-x-1/4 -translate-y-1/4',
    'top-right': 'top-0 right-0 translate-x-1/4 -translate-y-1/4',
    'bottom-left': 'bottom-0 left-0 -translate-x-1/4 translate-y-1/4',
    'bottom-right': 'bottom-0 right-0 translate-x-1/4 translate-y-1/4',
    'center': 'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2'
  }

  return (
    <div
      className={`absolute pointer-events-none ${positionClasses[position]} ${className}`}
      style={{ width: size, height: size }}
    >
      <Lottie
        animationData={ANIMATIONS.sparkle}
        loop={true}
        style={{ width: '100%', height: '100%' }}
      />
    </div>
  )
}

export default LottieBadge
