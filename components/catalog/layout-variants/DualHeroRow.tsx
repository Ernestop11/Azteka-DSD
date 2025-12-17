'use client'

import { motion } from 'framer-motion'
import HeroBanner from '../HeroBanner'

export interface DualHeroRowProps {
  primaryHero: {
    imageUrl: string
    headline: string
    subheadline?: string
    theme?: 'christmas' | 'summer' | 'dia-muertos' | 'posadas' | 'new-year' | 'default'
    ctaText?: string
    onCtaClick?: () => void
  }
  secondaryHero: {
    imageUrl: string
    headline: string
    subheadline?: string
    theme?: 'christmas' | 'summer' | 'dia-muertos' | 'posadas' | 'new-year' | 'default'
    ctaText?: string
    onCtaClick?: () => void
  }
  layout?: 'stacked' | 'side-by-side'
  gap?: number
}

export default function DualHeroRow({
  primaryHero,
  secondaryHero,
  layout = 'stacked',
  gap = 6,
}: DualHeroRowProps) {
  if (layout === 'side-by-side') {
    return (
      <div className={`grid lg:grid-cols-2 gap-${gap}`}>
        {/* Primary Hero */}
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, type: 'spring' }}
        >
          <HeroBanner
            imageUrl={primaryHero.imageUrl}
            title={primaryHero.headline || 'Premium Wholesale Products'}
            subtitle={primaryHero.subheadline}
            theme={primaryHero.theme}
            ctaText={primaryHero.ctaText}
            onCtaClick={primaryHero.onCtaClick}
          />
        </motion.div>

        {/* Secondary Hero */}
        <motion.div
          initial={{ opacity: 0, x: 50 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2, type: 'spring' }}
        >
          <HeroBanner
            imageUrl={secondaryHero.imageUrl}
            title={secondaryHero.headline || 'Premium Wholesale Products'}
            subtitle={secondaryHero.subheadline}
            theme={secondaryHero.theme}
            ctaText={secondaryHero.ctaText}
            onCtaClick={secondaryHero.onCtaClick}
          />
        </motion.div>
      </div>
    )
  }

  // Stacked layout
  return (
    <div className={`space-y-${gap}`}>
      {/* Primary Hero - Larger */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
      >
        <HeroBanner
          imageUrl={primaryHero.imageUrl}
          title={primaryHero.headline || 'Premium Wholesale Products'}
          subtitle={primaryHero.subheadline}
          theme={primaryHero.theme}
          ctaText={primaryHero.ctaText}
          onCtaClick={primaryHero.onCtaClick}
        />
      </motion.div>

      {/* Secondary Hero - Smaller */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="max-h-96 overflow-hidden"
      >
        <div className="transform scale-90 origin-top">
          <HeroBanner
            imageUrl={secondaryHero.imageUrl}
            title={secondaryHero.headline || 'Premium Wholesale Products'}
            subtitle={secondaryHero.subheadline}
            theme={secondaryHero.theme}
            ctaText={secondaryHero.ctaText}
            onCtaClick={secondaryHero.onCtaClick}
          />
        </div>
      </motion.div>
    </div>
  )
}
