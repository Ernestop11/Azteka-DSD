/**
 * Azteka DSD Catalog - Animation Presets Library
 * Framer Motion animation configurations for catalog components
 *
 * Usage:
 * import { shineSweep, promoBounce } from '@/components/catalog/animation/presets'
 *
 * <motion.div {...shineSweep}>Content</motion.div>
 */

import type { Variants, MotionProps } from 'framer-motion'

// ============================================================================
// SHINE SWEEP ANIMATION
// ============================================================================

/**
 * Shine sweep effect - Light sweeps across element on hover
 * Perfect for: Product cards, brand logos, promo panels
 */
export const shineSweep: MotionProps = {
  initial: { backgroundPosition: '-200% center' },
  whileHover: { backgroundPosition: '200% center' },
  transition: {
    duration: 0.8,
    ease: 'easeInOut',
  },
  style: {
    backgroundImage: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.8) 50%, transparent 100%)',
    backgroundSize: '200% 100%',
    backgroundRepeat: 'no-repeat',
  },
}

/**
 * Shine sweep variants with different speeds
 */
export const shineSweepVariants = {
  slow: {
    ...shineSweep,
    transition: { duration: 1.5, ease: 'easeInOut' },
  },
  medium: shineSweep,
  fast: {
    ...shineSweep,
    transition: { duration: 0.5, ease: 'easeInOut' },
  },
}

// ============================================================================
// PROMO BOUNCE ANIMATION
// ============================================================================

/**
 * Bouncy attention-grabbing animation for promotional elements
 * Perfect for: Promo panels, badges, CTA buttons, discount tags
 */
export const promoBounce: MotionProps = {
  initial: { scale: 1 },
  animate: {
    scale: [1, 1.05, 1, 1.03, 1],
    rotate: [0, -2, 2, -1, 0],
  },
  transition: {
    duration: 2,
    repeat: Infinity,
    repeatDelay: 3,
    ease: 'easeInOut',
  },
}

/**
 * Promo bounce variants with different intensities
 */
export const promoBounceVariants: Record<'subtle' | 'medium' | 'intense', MotionProps> = {
  subtle: {
    ...promoBounce,
    animate: {
      scale: [1, 1.02, 1],
      rotate: [0, -1, 1, 0],
    },
  },
  medium: promoBounce,
  intense: {
    ...promoBounce,
    animate: {
      scale: [1, 1.08, 1, 1.05, 1],
      rotate: [0, -3, 3, -2, 0],
    },
    transition: {
      duration: 1.5,
      repeat: Infinity,
      repeatDelay: 2,
      ease: 'easeInOut',
    },
  },
}

// ============================================================================
// GLOW PULSE ANIMATION
// ============================================================================

/**
 * Pulsing glow effect that draws attention
 * Perfect for: Featured products, new arrivals, sale badges
 */
export const glowPulse: MotionProps = {
  initial: { boxShadow: '0 0 20px rgba(234, 179, 8, 0.3)' },
  animate: {
    boxShadow: [
      '0 0 20px rgba(234, 179, 8, 0.3)',
      '0 0 40px rgba(234, 179, 8, 0.6)',
      '0 0 20px rgba(234, 179, 8, 0.3)',
    ],
  },
  transition: {
    duration: 2,
    repeat: Infinity,
    ease: 'easeInOut',
  },
}

/**
 * Glow pulse with custom color variants
 */
export const glowPulseColor = (color: 'gold' | 'red' | 'green' | 'blue' | 'purple'): MotionProps => {
  const colors = {
    gold: 'rgba(234, 179, 8, COLOR_OPACITY)',
    red: 'rgba(239, 68, 68, COLOR_OPACITY)',
    green: 'rgba(34, 197, 94, COLOR_OPACITY)',
    blue: 'rgba(59, 130, 246, COLOR_OPACITY)',
    purple: 'rgba(168, 85, 247, COLOR_OPACITY)',
  }

  const baseColor = colors[color]

  return {
    initial: { boxShadow: `0 0 20px ${baseColor.replace('COLOR_OPACITY', '0.3')}` },
    animate: {
      boxShadow: [
        `0 0 20px ${baseColor.replace('COLOR_OPACITY', '0.3')}`,
        `0 0 40px ${baseColor.replace('COLOR_OPACITY', '0.6')}`,
        `0 0 20px ${baseColor.replace('COLOR_OPACITY', '0.3')}`,
      ],
    },
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: 'easeInOut',
    },
  }
}

// ============================================================================
// ICON FLOAT ANIMATION
// ============================================================================

/**
 * Gentle floating animation for decorative icons
 * Perfect for: Background icons, seasonal decorations, category icons
 */
export const iconFloat: MotionProps = {
  initial: { y: 0, rotate: 0 },
  animate: {
    y: [-10, 10, -10],
    rotate: [-5, 5, -5],
  },
  transition: {
    duration: 4,
    repeat: Infinity,
    ease: 'easeInOut',
  },
}

/**
 * Icon float with custom delay for staggered effects
 */
export const iconFloatDelayed = (delay: number): MotionProps => ({
  ...iconFloat,
  transition: {
    duration: 4,
    repeat: Infinity,
    ease: 'easeInOut',
    delay,
  },
})

/**
 * Multiple icon float variants
 */
export const iconFloatVariants: Record<'slow' | 'medium' | 'fast', MotionProps> = {
  slow: {
    ...iconFloat,
    transition: { duration: 6, repeat: Infinity, ease: 'easeInOut' },
  },
  medium: iconFloat,
  fast: {
    ...iconFloat,
    transition: { duration: 2.5, repeat: Infinity, ease: 'easeInOut' },
  },
}

// ============================================================================
// SNOWFALL PARALLAX ANIMATION
// ============================================================================

/**
 * Parallax snowfall effect for seasonal themes
 * Perfect for: Christmas backgrounds, winter themes, festive overlays
 *
 * Note: Requires parent container with overflow-hidden
 */
export const snowfallParallax = (speed: 'slow' | 'medium' | 'fast' = 'medium'): MotionProps => {
  const speeds = {
    slow: 15,
    medium: 10,
    fast: 6,
  }

  return {
    initial: { y: -100, opacity: 0 },
    animate: {
      y: ['0vh', '100vh'],
      opacity: [0, 1, 1, 0],
      x: [-20, 20, -20],
    },
    transition: {
      duration: speeds[speed],
      repeat: Infinity,
      ease: 'linear',
    },
  }
}

/**
 * Snowfall variants with different patterns
 */
export const snowfallVariants: Variants = {
  particle1: {
    y: ['0vh', '100vh'],
    x: [-30, 30, -30],
    opacity: [0, 1, 1, 0],
    transition: { duration: 12, repeat: Infinity, ease: 'linear', delay: 0 },
  },
  particle2: {
    y: ['0vh', '100vh'],
    x: [20, -20, 20],
    opacity: [0, 1, 1, 0],
    transition: { duration: 10, repeat: Infinity, ease: 'linear', delay: 2 },
  },
  particle3: {
    y: ['0vh', '100vh'],
    x: [-10, 10, -10],
    opacity: [0, 1, 1, 0],
    transition: { duration: 14, repeat: Infinity, ease: 'linear', delay: 4 },
  },
}

// ============================================================================
// FESTIVE BURST ANIMATION
// ============================================================================

/**
 * Explosive burst animation for celebrations and special occasions
 * Perfect for: Sale announcements, new product launches, achievement badges
 */
export const festiveBurst: MotionProps = {
  initial: { scale: 0, rotate: -180, opacity: 0 },
  animate: { scale: 1, rotate: 0, opacity: 1 },
  exit: { scale: 0, rotate: 180, opacity: 0 },
  transition: {
    type: 'spring',
    stiffness: 200,
    damping: 15,
  },
}

/**
 * Festive burst with continuous animation
 */
export const festiveBurstContinuous: MotionProps = {
  initial: { scale: 1, rotate: 0 },
  animate: {
    scale: [1, 1.2, 1],
    rotate: [0, 360],
  },
  transition: {
    duration: 3,
    repeat: Infinity,
    ease: 'easeInOut',
  },
}

/**
 * Festive burst variants for different occasions
 */
export const festiveBurstVariants: Variants = {
  christmas: {
    scale: [0, 1.2, 1],
    rotate: [0, 360],
    transition: { type: 'spring', stiffness: 150, damping: 12 },
  },
  sale: {
    scale: [0, 1.3, 0.9, 1],
    rotate: [-180, 0],
    transition: { type: 'spring', stiffness: 200, damping: 10 },
  },
  newProduct: {
    scale: [0, 1.1, 1],
    rotate: [0, 180, 360],
    transition: { type: 'spring', stiffness: 180, damping: 14 },
  },
}

// ============================================================================
// SPOTLIGHT REVEAL ANIMATION
// ============================================================================

/**
 * Spotlight reveal effect with radial gradient
 * Perfect for: Hero banners, featured sections, product showcases
 */
export const spotlightReveal: MotionProps = {
  initial: {
    background: 'radial-gradient(circle at 50% 50%, rgba(255,255,255,0) 0%, rgba(0,0,0,0.8) 100%)',
    backgroundSize: '0% 0%',
  },
  animate: {
    backgroundSize: ['0% 0%', '200% 200%'],
  },
  transition: {
    duration: 1.5,
    ease: 'easeOut',
  },
}

/**
 * Spotlight reveal with custom position
 */
export const spotlightRevealFrom = (
  position: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'center'
): MotionProps => {
  const positions = {
    'top-left': '0% 0%',
    'top-right': '100% 0%',
    'bottom-left': '0% 100%',
    'bottom-right': '100% 100%',
    center: '50% 50%',
  }

  return {
    initial: {
      background: `radial-gradient(circle at ${positions[position]}, rgba(255,255,255,0) 0%, rgba(0,0,0,0.8) 100%)`,
      backgroundSize: '0% 0%',
    },
    animate: {
      backgroundSize: ['0% 0%', '200% 200%'],
    },
    transition: {
      duration: 1.5,
      ease: 'easeOut',
    },
  }
}

/**
 * Spotlight with hover tracking (requires mouse position state)
 */
export const spotlightHoverTracking = (mouseX: number, mouseY: number): MotionProps => ({
  animate: {
    background: `radial-gradient(circle at ${mouseX}px ${mouseY}px, rgba(255,255,255,0.2) 0%, transparent 50%)`,
  },
  transition: {
    type: 'spring',
    stiffness: 50,
    damping: 20,
  },
})

// ============================================================================
// COMPOSITE ANIMATIONS (Combining multiple effects)
// ============================================================================

/**
 * Premium product card animation (combines pop, shine, and glow)
 */
export const premiumProductCard: MotionProps = {
  initial: { scale: 1 },
  whileHover: {
    scale: 1.05,
    boxShadow: '0 20px 60px rgba(234, 179, 8, 0.4)',
    y: -8,
  },
  whileTap: { scale: 0.98 },
  transition: {
    type: 'spring',
    stiffness: 300,
    damping: 20,
  },
}

/**
 * Hero banner entrance animation
 */
export const heroBannerEntrance: MotionProps = {
  initial: { opacity: 0, scale: 1.1, y: 20 },
  animate: { opacity: 1, scale: 1, y: 0 },
  transition: {
    duration: 0.8,
    ease: [0.22, 1, 0.36, 1], // Custom easing
  },
}

/**
 * Stagger children animation for grids
 */
export const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1,
    },
  },
}

export const staggerItem: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: 'spring',
      stiffness: 100,
      damping: 12,
    },
  },
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Combines multiple animation presets
 */
export function combineAnimations(...animations: MotionProps[]): MotionProps {
  return animations.reduce((acc, anim) => ({
    ...acc,
    ...anim,
    transition: { ...acc.transition, ...anim.transition },
  }), {})
}

/**
 * Creates a delayed version of any animation
 */
export function withDelay(animation: MotionProps, delay: number): MotionProps {
  return {
    ...animation,
    transition: {
      ...animation.transition,
      delay,
    },
  }
}

/**
 * Conditional animation based on user motion preferences
 */
export function respectMotionPreference(animation: MotionProps): MotionProps {
  if (typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    return {
      initial: animation.animate,
      animate: animation.animate,
      transition: { duration: 0 },
    }
  }
  return animation
}

// ============================================================================
// EXPORT COLLECTIONS
// ============================================================================

/**
 * All shine animations
 */
export const shineAnimations = {
  shineSweep,
  shineSweepVariants,
}

/**
 * All promotional animations
 */
export const promoAnimations = {
  promoBounce,
  promoBounceVariants,
  glowPulse,
  glowPulseColor,
  festiveBurst,
  festiveBurstContinuous,
  festiveBurstVariants,
}

/**
 * All decorative animations
 */
export const decorativeAnimations = {
  iconFloat,
  iconFloatDelayed,
  iconFloatVariants,
  snowfallParallax,
  snowfallVariants,
}

/**
 * All reveal animations
 */
export const revealAnimations = {
  spotlightReveal,
  spotlightRevealFrom,
  spotlightHoverTracking,
  heroBannerEntrance,
}

/**
 * All composite animations
 */
export const compositeAnimations = {
  premiumProductCard,
  staggerContainer,
  staggerItem,
}

/**
 * Complete animation library export
 */
export const animationLibrary = {
  ...shineAnimations,
  ...promoAnimations,
  ...decorativeAnimations,
  ...revealAnimations,
  ...compositeAnimations,
  // Utilities
  combineAnimations,
  withDelay,
  respectMotionPreference,
}

export default animationLibrary
