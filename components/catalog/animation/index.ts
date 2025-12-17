/**
 * Azteka DSD Catalog - Animation Library
 * Centralized exports for all animation presets
 */

export {
  // Individual animations
  shineSweep,
  shineSweepVariants,
  promoBounce,
  promoBounceVariants,
  glowPulse,
  glowPulseColor,
  iconFloat,
  iconFloatDelayed,
  iconFloatVariants,
  snowfallParallax,
  snowfallVariants,
  festiveBurst,
  festiveBurstContinuous,
  festiveBurstVariants,
  spotlightReveal,
  spotlightRevealFrom,
  spotlightHoverTracking,

  // Composite animations
  premiumProductCard,
  heroBannerEntrance,
  staggerContainer,
  staggerItem,

  // Collections
  shineAnimations,
  promoAnimations,
  decorativeAnimations,
  revealAnimations,
  compositeAnimations,

  // Utilities
  combineAnimations,
  withDelay,
  respectMotionPreference,

  // Default export
  animationLibrary,
} from './presets'

/**
 * USAGE EXAMPLES:
 *
 * 1. Simple shine effect:
 * import { shineSweep } from '@/components/catalog/animation'
 * <motion.div {...shineSweep}>Shiny card</motion.div>
 *
 * 2. Promo bounce with variant:
 * import { promoBounceVariants } from '@/components/catalog/animation'
 * <motion.div {...promoBounceVariants.intense}>Sale!</motion.div>
 *
 * 3. Custom glow color:
 * import { glowPulseColor } from '@/components/catalog/animation'
 * <motion.div {...glowPulseColor('red')}>Hot deal</motion.div>
 *
 * 4. Staggered grid:
 * import { staggerContainer, staggerItem } from '@/components/catalog/animation'
 * <motion.div variants={staggerContainer} initial="hidden" animate="visible">
 *   {products.map(p => (
 *     <motion.div key={p.id} variants={staggerItem}>
 *       <ProductCard product={p} />
 *     </motion.div>
 *   ))}
 * </motion.div>
 *
 * 5. Combine multiple effects:
 * import { combineAnimations, shineSweep, glowPulse } from '@/components/catalog/animation'
 * <motion.div {...combineAnimations(shineSweep, glowPulse)}>Premium</motion.div>
 *
 * 6. Respect motion preferences:
 * import { respectMotionPreference, premiumProductCard } from '@/components/catalog/animation'
 * <motion.div {...respectMotionPreference(premiumProductCard)}>Accessible</motion.div>
 */
