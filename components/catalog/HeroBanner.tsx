'use client'

import { motion } from 'framer-motion'
import { ChevronRight, Sparkles, Gift, Star, PartyPopper } from 'lucide-react'

export interface HeroBannerProps {
  title: string
  subtitle?: string
  imageUrl: string
  ctaText?: string
  ctaLink?: string
  theme?: 'christmas' | 'summer' | 'dia-muertos' | 'posadas' | 'new-year' | 'default'
  overlay?: 'dark' | 'light' | 'gradient' | 'festive'
  onCtaClick?: () => void
  // Alternative naming for compatibility
  headline?: string
  subheadline?: string
}

const themeGradients = {
  christmas: 'from-red-600/90 via-green-700/90 to-red-800/90',
  summer: 'from-cyan-500/90 via-blue-600/90 to-purple-600/90',
  'dia-muertos': 'from-orange-600/90 via-pink-600/90 to-purple-700/90',
  posadas: 'from-purple-600/90 via-pink-700/90 to-purple-800/90',
  'new-year': 'from-yellow-600/90 via-amber-700/90 to-yellow-800/90',
  default: 'from-blue-600/90 via-indigo-700/90 to-purple-800/90',
}

const themeIcons = {
  christmas: Sparkles,
  summer: Sparkles,
  'dia-muertos': Sparkles,
  posadas: Star,
  'new-year': PartyPopper,
  default: Sparkles,
}

const overlayStyles: Record<string, string> = {
  dark: 'bg-black/60',
  light: 'bg-white/40',
  gradient: 'bg-gradient-to-r from-black/80 via-black/40 to-transparent',
  festive: 'bg-gradient-to-r from-red-800/80 via-green-700/80 to-red-800/80',
}

export default function HeroBanner({
  title,
  subtitle,
  imageUrl,
  ctaText = 'Shop Now',
  ctaLink,
  theme = 'default',
  overlay = 'gradient',
  onCtaClick,
  headline,
  subheadline,
}: HeroBannerProps) {
  // Support alternative naming
  const displayTitle = headline || title
  const displaySubtitle = subheadline || subtitle
  const ThemeIcon = themeIcons[theme]
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      whileInView={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.8, type: 'spring' }}
      viewport={{ once: true }}
      className="relative overflow-hidden rounded-3xl shadow-2xl group"
    >
      {/* Background Image with Ken Burns Animation */}
      <div className="relative h-96 md:h-[500px] lg:h-[600px] overflow-hidden">
        <motion.img
          initial={{ scale: 1, x: 0, y: 0 }}
          animate={{ 
            scale: [1, 1.15, 1],
            x: [0, -20, 0],
            y: [0, -10, 0]
          }}
          transition={{ 
            duration: 20, 
            repeat: Infinity, 
            repeatType: 'reverse', 
            ease: 'linear' 
          }}
          src={imageUrl || '/coming-soon.png'}
          alt={title}
          className="w-full h-full object-cover"
          onError={(e) => {
            const target = e.target as HTMLImageElement
            if (target.src !== '/coming-soon.png') {
              target.src = '/coming-soon.png'
            }
          }}
        />

        {/* Overlay */}
        <div className={`absolute inset-0 ${overlayStyles[overlay] || overlayStyles.gradient}`} />

        {/* Gradient Accent */}
        <div
          className={`absolute inset-0 bg-gradient-to-t ${themeGradients[theme]} opacity-60 mix-blend-multiply`}
        />

        {/* Glossy Top Shine */}
        <div className="absolute top-0 left-0 right-0 h-1/3 bg-gradient-to-b from-white/20 via-white/5 to-transparent pointer-events-none" />

        {/* Animated Festive Icons */}
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 90, 0],
            opacity: [0.3, 0.6, 0.3],
          }}
          transition={{ duration: 3, repeat: Infinity }}
          className="absolute top-10 right-10"
        >
          <ThemeIcon className="w-16 h-16 text-white/40" />
        </motion.div>

        <motion.div
          animate={{
            scale: [1, 1.3, 1],
            rotate: [0, -90, 0],
            opacity: [0.2, 0.5, 0.2],
          }}
          transition={{ duration: 4, repeat: Infinity, delay: 1 }}
          className="absolute bottom-20 left-10"
        >
          <ThemeIcon className="w-20 h-20 text-white/30" />
        </motion.div>

        <motion.div
          animate={{
            y: [0, -20, 0],
            rotate: [0, 5, 0],
            opacity: [0.25, 0.5, 0.25],
          }}
          transition={{ duration: 5, repeat: Infinity, delay: 0.5 }}
          className="absolute top-1/3 left-20"
        >
          <ThemeIcon className="w-12 h-12 text-white/35" />
        </motion.div>

        {/* Content Container */}
        <div className="absolute inset-0 flex items-center">
          <div className="container mx-auto px-6 md:px-12">
            <div className="max-w-2xl space-y-6">
              {/* Subtitle */}
              {displaySubtitle && (
                <motion.div
                  initial={{ opacity: 0, x: -50 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2, duration: 0.6 }}
                  className="inline-block px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full"
                >
                  <span className="text-white text-sm font-semibold uppercase tracking-wider">
                    {displaySubtitle}
                  </span>
                </motion.div>
              )}

              {/* Title */}
              <motion.h1
                initial={{ opacity: 0, x: -50 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4, duration: 0.6 }}
                className="text-5xl md:text-6xl lg:text-7xl font-black text-white leading-tight drop-shadow-2xl"
                style={{
                  textShadow: '0 4px 20px rgba(0,0,0,0.7), 0 0 60px rgba(255,255,255,0.2)',
                }}
              >
                {displayTitle}
              </motion.h1>

              {/* CTA Button */}
              {(ctaText || onCtaClick) && (
                <motion.div
                  initial={{ opacity: 0, x: -50 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.6, duration: 0.6 }}
                >
                  <motion.button
                    whileHover={{ scale: 1.05, x: 10 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={onCtaClick}
                    className="
                      group/btn
                      px-8 py-4 rounded-full
                      bg-white text-gray-900
                      font-bold text-lg
                      shadow-2xl hover:shadow-white/50
                      flex items-center gap-3
                      transition-all duration-300
                    "
                  >
                    {ctaText}
                    <ChevronRight className="w-6 h-6 group-hover/btn:translate-x-1 transition-transform" />
                  </motion.button>
                </motion.div>
              )}
            </div>
          </div>
        </div>

        {/* Bottom Fade */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black/80 to-transparent pointer-events-none" />
      </div>
    </motion.div>
  )
}
