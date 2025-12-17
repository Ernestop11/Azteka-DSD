/**
 * Azteka Catalog Theme Packs
 * Complete seasonal theme configurations for admin editor toggle
 * Each pack includes hero themes, promo themes, showcase themes, icons, and visual settings
 */

export type SeasonalPackId = 'christmas' | 'posadas' | 'dia-muertos' | 'summer-fiesta' | 'back-to-school'

// ============================================================================
// THEME PACK INTERFACE
// ============================================================================

export interface ThemePack {
  id: SeasonalPackId
  name: string
  description: string
  editorLabel: string
  active: boolean

  // Hero Banner Configuration
  heroBanner: {
    theme: 'christmas' | 'summer' | 'dia-muertos' | 'posadas' | 'new-year' | 'default'
    overlay: 'dark' | 'light' | 'gradient' | 'festive'
    defaultHeadline: string
    defaultSubheadline: string
    recommendedCtaText: string
    gradientOverlay: string
    iconSet: string[]
  }

  // Promo Panel Configuration
  promoPanel: {
    variant: 'chedraui' | 'walmart' | 'default'
    customGradient?: {
      from: string
      via: string
      to: string
    }
    badgeText: string
    glowColor: string
    accentGradient: string
    iconSet: string[]
  }

  // Showcase Section Configuration
  showcaseSection: {
    backgroundPattern: 'festive' | 'geometric' | 'gradient'
    ribbonColor: string
    ribbonGradient: string
    decorativeElements: string[]
    customPatternCss?: string
  }

  // Visual Settings
  visualSettings: {
    primaryGradient: string
    secondaryGradient: string
    accentColor: string
    shadowGlow: string
    borderColor: string
    textContrast: 'light' | 'dark'
  }

  // Icon Mappings (maps to Lucide React icons)
  iconMappings: {
    hero: string[] // Icon names for hero decorations
    promo: string[] // Icon names for promo decorations
    showcase: string[] // Icon names for showcase decorations
    category: string[] // Icon names for category badges
  }

  // Recommended Settings
  recommendations: {
    shineIntensity: 'none' | 'subtle' | 'medium' | 'high'
    glowIntensity: 'none' | 'subtle' | 'medium' | 'high'
    animationSpeed: 'slow' | 'normal' | 'fast'
    festiveLevel: 'minimal' | 'moderate' | 'maximum'
  }

  // CSS Class Helpers
  cssClasses: {
    backgroundClass: string
    gradientClass: string
    shadowClass: string
    borderClass: string
    accentClass: string
  }
}

// ============================================================================
// CHRISTMAS PACK
// ============================================================================

export const CHRISTMAS_PACK: ThemePack = {
  id: 'christmas',
  name: 'Navidad Mexicana',
  description: 'Tema festivo navideño con colores rojo, verde y dorado. Perfecto para promociones de diciembre.',
  editorLabel: '🎄 Navidad',
  active: true,

  heroBanner: {
    theme: 'christmas',
    overlay: 'festive',
    defaultHeadline: '¡Feliz Navidad!',
    defaultSubheadline: 'Ofertas especiales de temporada',
    recommendedCtaText: 'Ver Promociones',
    gradientOverlay: 'from-red-600/90 via-green-700/90 to-red-800/90',
    iconSet: ['Snowflake', 'Gift', 'Star', 'Sparkles', 'TreePine'],
  },

  promoPanel: {
    variant: 'default',
    customGradient: {
      from: 'from-red-600',
      via: 'via-green-600',
      to: 'to-red-700',
    },
    badgeText: 'NAVIDAD',
    glowColor: 'shadow-red-500/50',
    accentGradient: 'from-red-500 to-green-600',
    iconSet: ['Star', 'Gift', 'Sparkles', 'Snowflake'],
  },

  showcaseSection: {
    backgroundPattern: 'festive',
    ribbonColor: 'from-red-600 via-green-600 to-red-700',
    ribbonGradient: 'bg-gradient-to-r from-red-600 via-green-600 to-red-700',
    decorativeElements: ['Snowflake', 'Star', 'Gift', 'TreePine'],
    customPatternCss: `
      radial-gradient(circle at 20% 30%, rgba(220, 38, 38, 0.15) 0%, transparent 50%),
      radial-gradient(circle at 80% 70%, rgba(22, 163, 74, 0.15) 0%, transparent 50%)
    `,
  },

  visualSettings: {
    primaryGradient: 'from-red-600 via-green-600 to-red-700',
    secondaryGradient: 'from-green-600 via-red-600 to-green-700',
    accentColor: '#dc2626',
    shadowGlow: 'shadow-red-500/50',
    borderColor: 'border-red-400',
    textContrast: 'light',
  },

  iconMappings: {
    hero: ['Snowflake', 'Gift', 'Star', 'Sparkles', 'TreePine', 'Bell'],
    promo: ['Gift', 'Star', 'Sparkles', 'Percent'],
    showcase: ['Snowflake', 'Star', 'TreePine'],
    category: ['Gift', 'ShoppingBag', 'Package'],
  },

  recommendations: {
    shineIntensity: 'high',
    glowIntensity: 'high',
    animationSpeed: 'normal',
    festiveLevel: 'maximum',
  },

  cssClasses: {
    backgroundClass: 'bg-gradient-to-br from-red-50 via-green-50 to-red-100',
    gradientClass: 'bg-gradient-to-r from-red-600 via-green-600 to-red-700',
    shadowClass: 'shadow-xl shadow-red-500/50',
    borderClass: 'border-2 border-red-400',
    accentClass: 'text-red-600',
  },
}

// ============================================================================
// POSADAS PACK
// ============================================================================

export const POSADAS_PACK: ThemePack = {
  id: 'posadas',
  name: 'Posadas',
  description: 'Tema festivo para las posadas con colores morado, rosa y dorado. Ideal para celebraciones decembrinas.',
  editorLabel: '⭐ Posadas',
  active: true,

  heroBanner: {
    theme: 'posadas',
    overlay: 'festive',
    defaultHeadline: '¡Viva las Posadas!',
    defaultSubheadline: 'Celebra con nosotros',
    recommendedCtaText: 'Ver Ofertas',
    gradientOverlay: 'from-purple-600/90 via-pink-700/90 to-purple-800/90',
    iconSet: ['Star', 'Sparkles', 'PartyPopper', 'Music', 'Flame'],
  },

  promoPanel: {
    variant: 'default',
    customGradient: {
      from: 'from-purple-600',
      via: 'via-pink-600',
      to: 'to-purple-700',
    },
    badgeText: 'POSADAS',
    glowColor: 'shadow-purple-500/50',
    accentGradient: 'from-purple-500 to-pink-600',
    iconSet: ['Star', 'PartyPopper', 'Sparkles', 'Music'],
  },

  showcaseSection: {
    backgroundPattern: 'festive',
    ribbonColor: 'from-purple-600 via-pink-600 to-purple-700',
    ribbonGradient: 'bg-gradient-to-r from-purple-600 via-pink-600 to-purple-700',
    decorativeElements: ['Star', 'Sparkles', 'Music', 'PartyPopper'],
    customPatternCss: `
      radial-gradient(circle at 25% 25%, rgba(168, 85, 247, 0.15) 0%, transparent 50%),
      radial-gradient(circle at 75% 75%, rgba(236, 72, 153, 0.15) 0%, transparent 50%)
    `,
  },

  visualSettings: {
    primaryGradient: 'from-purple-600 via-pink-600 to-purple-700',
    secondaryGradient: 'from-pink-600 via-purple-600 to-pink-700',
    accentColor: '#a855f7',
    shadowGlow: 'shadow-purple-500/50',
    borderColor: 'border-purple-400',
    textContrast: 'light',
  },

  iconMappings: {
    hero: ['Star', 'Sparkles', 'PartyPopper', 'Music', 'Flame', 'Zap'],
    promo: ['Star', 'Sparkles', 'Music', 'Percent'],
    showcase: ['Star', 'PartyPopper', 'Music'],
    category: ['Star', 'Gift', 'ShoppingBag'],
  },

  recommendations: {
    shineIntensity: 'high',
    glowIntensity: 'high',
    animationSpeed: 'normal',
    festiveLevel: 'maximum',
  },

  cssClasses: {
    backgroundClass: 'bg-gradient-to-br from-purple-50 via-pink-50 to-purple-100',
    gradientClass: 'bg-gradient-to-r from-purple-600 via-pink-600 to-purple-700',
    shadowClass: 'shadow-xl shadow-purple-500/50',
    borderClass: 'border-2 border-purple-400',
    accentClass: 'text-purple-600',
  },
}

// ============================================================================
// DÍA DE MUERTOS PACK
// ============================================================================

export const DIA_MUERTOS_PACK: ThemePack = {
  id: 'dia-muertos',
  name: 'Día de Muertos',
  description: 'Tema tradicional mexicano con colores naranja, rosa y morado. Perfecto para celebraciones de noviembre.',
  editorLabel: '💀 Día de Muertos',
  active: true,

  heroBanner: {
    theme: 'dia-muertos',
    overlay: 'festive',
    defaultHeadline: 'Celebramos la Vida',
    defaultSubheadline: 'Tradición y Color',
    recommendedCtaText: 'Descubre Más',
    gradientOverlay: 'from-orange-600/90 via-pink-600/90 to-purple-700/90',
    iconSet: ['Sparkles', 'Star', 'Flower', 'Sun', 'Moon'],
  },

  promoPanel: {
    variant: 'default',
    customGradient: {
      from: 'from-orange-600',
      via: 'via-pink-600',
      to: 'to-purple-700',
    },
    badgeText: 'TRADICIÓN',
    glowColor: 'shadow-orange-500/50',
    accentGradient: 'from-orange-500 to-purple-600',
    iconSet: ['Star', 'Sparkles', 'Sun', 'Flower'],
  },

  showcaseSection: {
    backgroundPattern: 'festive',
    ribbonColor: 'from-orange-600 via-pink-600 to-purple-700',
    ribbonGradient: 'bg-gradient-to-r from-orange-600 via-pink-600 to-purple-700',
    decorativeElements: ['Sparkles', 'Star', 'Flower', 'Sun'],
    customPatternCss: `
      radial-gradient(circle at 30% 30%, rgba(234, 88, 12, 0.15) 0%, transparent 50%),
      radial-gradient(circle at 70% 70%, rgba(126, 34, 206, 0.15) 0%, transparent 50%)
    `,
  },

  visualSettings: {
    primaryGradient: 'from-orange-600 via-pink-600 to-purple-700',
    secondaryGradient: 'from-purple-700 via-pink-600 to-orange-600',
    accentColor: '#ea580c',
    shadowGlow: 'shadow-orange-500/50',
    borderColor: 'border-orange-400',
    textContrast: 'light',
  },

  iconMappings: {
    hero: ['Sparkles', 'Star', 'Flower', 'Sun', 'Moon', 'Flame'],
    promo: ['Star', 'Sparkles', 'Flower', 'Percent'],
    showcase: ['Sparkles', 'Star', 'Flower'],
    category: ['Flower', 'Gift', 'ShoppingBag'],
  },

  recommendations: {
    shineIntensity: 'medium',
    glowIntensity: 'high',
    animationSpeed: 'normal',
    festiveLevel: 'maximum',
  },

  cssClasses: {
    backgroundClass: 'bg-gradient-to-br from-orange-50 via-pink-50 to-purple-100',
    gradientClass: 'bg-gradient-to-r from-orange-600 via-pink-600 to-purple-700',
    shadowClass: 'shadow-xl shadow-orange-500/50',
    borderClass: 'border-2 border-orange-400',
    accentClass: 'text-orange-600',
  },
}

// ============================================================================
// SUMMER FIESTA PACK
// ============================================================================

export const SUMMER_FIESTA_PACK: ThemePack = {
  id: 'summer-fiesta',
  name: 'Fiesta de Verano',
  description: 'Tema vibrante de verano con colores cyan, azul y morado. Ideal para promociones de junio-agosto.',
  editorLabel: '☀️ Verano',
  active: true,

  heroBanner: {
    theme: 'summer',
    overlay: 'festive',
    defaultHeadline: '¡Verano Refrescante!',
    defaultSubheadline: 'Ofertas que refrescan',
    recommendedCtaText: 'Refréscate Ahora',
    gradientOverlay: 'from-cyan-500/90 via-blue-600/90 to-purple-600/90',
    iconSet: ['Sun', 'Droplet', 'Waves', 'IceCream', 'Palmtree'],
  },

  promoPanel: {
    variant: 'walmart',
    customGradient: {
      from: 'from-cyan-500',
      via: 'via-blue-500',
      to: 'to-purple-600',
    },
    badgeText: 'VERANO',
    glowColor: 'shadow-cyan-500/50',
    accentGradient: 'from-cyan-500 to-blue-600',
    iconSet: ['Sun', 'Droplet', 'Waves', 'Zap'],
  },

  showcaseSection: {
    backgroundPattern: 'gradient',
    ribbonColor: 'from-cyan-500 via-blue-500 to-purple-600',
    ribbonGradient: 'bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-600',
    decorativeElements: ['Sun', 'Droplet', 'Waves', 'Sparkles'],
    customPatternCss: `
      radial-gradient(circle at 20% 40%, rgba(6, 182, 212, 0.15) 0%, transparent 50%),
      radial-gradient(circle at 80% 60%, rgba(147, 51, 234, 0.15) 0%, transparent 50%)
    `,
  },

  visualSettings: {
    primaryGradient: 'from-cyan-500 via-blue-500 to-purple-600',
    secondaryGradient: 'from-blue-500 via-cyan-400 to-blue-600',
    accentColor: '#06b6d4',
    shadowGlow: 'shadow-cyan-500/50',
    borderColor: 'border-cyan-400',
    textContrast: 'light',
  },

  iconMappings: {
    hero: ['Sun', 'Droplet', 'Waves', 'IceCream', 'Palmtree', 'Sparkles'],
    promo: ['Sun', 'Droplet', 'Zap', 'Percent'],
    showcase: ['Sun', 'Waves', 'Sparkles'],
    category: ['Sun', 'Droplet', 'ShoppingBag'],
  },

  recommendations: {
    shineIntensity: 'high',
    glowIntensity: 'medium',
    animationSpeed: 'fast',
    festiveLevel: 'moderate',
  },

  cssClasses: {
    backgroundClass: 'bg-gradient-to-br from-cyan-50 via-blue-50 to-purple-100',
    gradientClass: 'bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-600',
    shadowClass: 'shadow-xl shadow-cyan-500/50',
    borderClass: 'border-2 border-cyan-400',
    accentClass: 'text-cyan-600',
  },
}

// ============================================================================
// BACK TO SCHOOL PACK
// ============================================================================

export const BACK_TO_SCHOOL_PACK: ThemePack = {
  id: 'back-to-school',
  name: 'Regreso a Clases',
  description: 'Tema educativo con colores azul, verde y amarillo. Perfecto para promociones de agosto-septiembre.',
  editorLabel: '📚 Regreso a Clases',
  active: true,

  heroBanner: {
    theme: 'default',
    overlay: 'gradient',
    defaultHeadline: '¡Regreso a Clases!',
    defaultSubheadline: 'Todo lo que necesitas',
    recommendedCtaText: 'Prepárate Ya',
    gradientOverlay: 'from-blue-600/90 via-green-600/90 to-blue-700/90',
    iconSet: ['BookOpen', 'PenTool', 'Backpack', 'Star', 'Award'],
  },

  promoPanel: {
    variant: 'default',
    customGradient: {
      from: 'from-blue-600',
      via: 'via-green-600',
      to: 'to-blue-700',
    },
    badgeText: 'ESCOLAR',
    glowColor: 'shadow-blue-500/50',
    accentGradient: 'from-blue-500 to-green-600',
    iconSet: ['Star', 'Award', 'PenTool', 'Percent'],
  },

  showcaseSection: {
    backgroundPattern: 'geometric',
    ribbonColor: 'from-blue-600 via-green-600 to-blue-700',
    ribbonGradient: 'bg-gradient-to-r from-blue-600 via-green-600 to-blue-700',
    decorativeElements: ['BookOpen', 'Star', 'Award', 'PenTool'],
    customPatternCss: `
      radial-gradient(circle at 25% 35%, rgba(37, 99, 235, 0.12) 0%, transparent 50%),
      radial-gradient(circle at 75% 65%, rgba(22, 163, 74, 0.12) 0%, transparent 50%)
    `,
  },

  visualSettings: {
    primaryGradient: 'from-blue-600 via-green-600 to-blue-700',
    secondaryGradient: 'from-green-600 via-blue-600 to-green-700',
    accentColor: '#2563eb',
    shadowGlow: 'shadow-blue-500/50',
    borderColor: 'border-blue-400',
    textContrast: 'light',
  },

  iconMappings: {
    hero: ['BookOpen', 'PenTool', 'Backpack', 'Star', 'Award', 'Sparkles'],
    promo: ['Star', 'Award', 'Percent', 'TrendingUp'],
    showcase: ['BookOpen', 'Star', 'Award'],
    category: ['BookOpen', 'Backpack', 'ShoppingBag'],
  },

  recommendations: {
    shineIntensity: 'medium',
    glowIntensity: 'medium',
    animationSpeed: 'normal',
    festiveLevel: 'moderate',
  },

  cssClasses: {
    backgroundClass: 'bg-gradient-to-br from-blue-50 via-green-50 to-blue-100',
    gradientClass: 'bg-gradient-to-r from-blue-600 via-green-600 to-blue-700',
    shadowClass: 'shadow-xl shadow-blue-500/50',
    borderClass: 'border-2 border-blue-400',
    accentClass: 'text-blue-600',
  },
}

// ============================================================================
// THEME PACK COLLECTION
// ============================================================================

export const THEME_PACKS: Record<SeasonalPackId, ThemePack> = {
  'christmas': CHRISTMAS_PACK,
  'posadas': POSADAS_PACK,
  'dia-muertos': DIA_MUERTOS_PACK,
  'summer-fiesta': SUMMER_FIESTA_PACK,
  'back-to-school': BACK_TO_SCHOOL_PACK,
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

export function getThemePack(id: SeasonalPackId): ThemePack {
  return THEME_PACKS[id]
}

export function getAllThemePacks(): ThemePack[] {
  return Object.values(THEME_PACKS)
}

export function getActiveThemePacks(): ThemePack[] {
  return Object.values(THEME_PACKS).filter(pack => pack.active)
}

export function getThemePackByName(name: string): ThemePack | undefined {
  return Object.values(THEME_PACKS).find(pack => pack.name === name)
}

export function applyThemePack(packId: SeasonalPackId): {
  heroBannerProps: any
  promoPanelProps: any
  showcaseSectionProps: any
} {
  const pack = getThemePack(packId)

  return {
    heroBannerProps: {
      theme: pack.heroBanner.theme,
      overlay: pack.heroBanner.overlay,
      headline: pack.heroBanner.defaultHeadline,
      subheadline: pack.heroBanner.defaultSubheadline,
      ctaText: pack.heroBanner.recommendedCtaText,
    },
    promoPanelProps: {
      variant: pack.promoPanel.variant,
      badge: pack.promoPanel.badgeText,
    },
    showcaseSectionProps: {
      backgroundPattern: pack.showcaseSection.backgroundPattern,
      ribbonColor: pack.showcaseSection.ribbonColor,
    },
  }
}

// ============================================================================
// EXPORT ALL
// ============================================================================

export default THEME_PACKS
