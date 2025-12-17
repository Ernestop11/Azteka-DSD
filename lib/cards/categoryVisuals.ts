/**
 * Category-Based Visual Effects System
 * 
 * Automatically assigns visual presets and backgrounds to products
 * based on their category. Perfect for transparent PNG grocery products.
 */

export interface CategoryVisual {
  backgroundGradient?: string
  backgroundColor?: string
  splashPresetId?: string
  glowPresetId?: string
  gradientPresetId?: string
  theme?: 'default' | 'holiday' | 'summer' | 'muertos'
  glossLevel?: 'none' | 'soft' | 'premium'
  sparkle?: boolean
}

/**
 * Category visual mappings
 * Drinks/Beverages: Liquid effects, colorful gradients, splash overlays
 * Snacks: Vibrant backgrounds, texture patterns
 * Other: Neutral but appealing backgrounds
 */
const CATEGORY_VISUALS: Record<string, CategoryVisual> = {
  // Drink categories
  'drink': {
    backgroundGradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)',
    splashPresetId: 'liquid-splash',
    glowPresetId: 'cool-glow',
    theme: 'default',
    glossLevel: 'premium',
    sparkle: true,
  },
  'beverage': {
    backgroundGradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 50%, #43e97b 100%)',
    splashPresetId: 'bubble-effect',
    glowPresetId: 'refreshing-glow',
    theme: 'summer',
    glossLevel: 'soft',
    sparkle: false,
  },
  'soda': {
    backgroundGradient: 'linear-gradient(135deg, #fa709a 0%, #fee140 50%, #30cfd0 100%)',
    splashPresetId: 'soda-splash',
    glowPresetId: 'vibrant-glow',
    theme: 'default',
    glossLevel: 'premium',
    sparkle: true,
  },
  'juice': {
    backgroundGradient: 'linear-gradient(135deg, #ff9a9e 0%, #fecfef 50%, #fecfef 100%)',
    splashPresetId: 'juice-drops',
    glowPresetId: 'soft-glow',
    theme: 'summer',
    glossLevel: 'soft',
    sparkle: false,
  },
  'water': {
    backgroundGradient: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 50%, #d299c2 100%)',
    splashPresetId: 'ice-condensation',
    glowPresetId: 'cool-mist',
    theme: 'summer',
    glossLevel: 'soft',
    sparkle: false,
  },
  
  // Snack categories
  'snack': {
    backgroundGradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 50%, #4facfe 100%)',
    splashPresetId: 'chip-texture',
    glowPresetId: 'warm-glow',
    theme: 'default',
    glossLevel: 'soft',
    sparkle: false,
  },
  'chip': {
    backgroundGradient: 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 50%, #ff8a80 100%)',
    splashPresetId: 'chip-texture',
    glowPresetId: 'warm-glow',
    theme: 'default',
    glossLevel: 'soft',
    sparkle: false,
  },
  'cookie': {
    backgroundGradient: 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 50%, #a8edea 100%)',
    splashPresetId: 'cookie-pattern',
    glowPresetId: 'soft-glow',
    theme: 'default',
    glossLevel: 'soft',
    sparkle: false,
  },
  'candy': {
    backgroundGradient: 'linear-gradient(135deg, #ff9a9e 0%, #fecfef 50%, #fecfef 100%)',
    splashPresetId: 'candy-gradient',
    glowPresetId: 'vibrant-glow',
    theme: 'holiday',
    glossLevel: 'premium',
    sparkle: true,
  },
  
  // Food categories
  'food': {
    backgroundGradient: 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 50%, #ff8a80 100%)',
    glowPresetId: 'warm-glow',
    theme: 'default',
    glossLevel: 'soft',
    sparkle: false,
  },
  'grocery': {
    backgroundGradient: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 50%, #d299c2 100%)',
    glowPresetId: 'soft-glow',
    theme: 'default',
    glossLevel: 'soft',
    sparkle: false,
  },
}

/**
 * Get visual preset for a category
 */
export function getCategoryVisual(categoryName: string | null | undefined): CategoryVisual | null {
  if (!categoryName) return null
  
  const normalized = categoryName.toLowerCase().trim()
  
  // Direct match
  if (CATEGORY_VISUALS[normalized]) {
    return CATEGORY_VISUALS[normalized]
  }
  
  // Partial match (e.g., "soft drinks" contains "drink")
  for (const [key, visual] of Object.entries(CATEGORY_VISUALS)) {
    if (normalized.includes(key) || key.includes(normalized)) {
      return visual
    }
  }
  
  return null
}

/**
 * Apply category visuals to a product if it doesn't have custom visuals
 */
export function applyCategoryVisuals<T extends {
  category?: string | { name: string } | null
  backgroundGradient?: string | null
  backgroundColor?: string | null
  splashPresetId?: string | null
  glowPresetId?: string | null
  gradientPresetId?: string | null
  theme?: string | null
  glossLevel?: string | null
  sparkle?: boolean | null
}>(product: T): T {
  // If product already has custom visuals, don't override
  if (product.backgroundGradient || product.backgroundColor) {
    return product
  }
  
  const categoryName = typeof product.category === 'string' 
    ? product.category 
    : product.category?.name || null
  
  const categoryVisual = getCategoryVisual(categoryName)
  
  if (!categoryVisual) {
    return product
  }
  
  // Apply category visuals only if product doesn't have them
  return {
    ...product,
    backgroundGradient: product.backgroundGradient || categoryVisual.backgroundGradient || null,
    backgroundColor: product.backgroundColor || categoryVisual.backgroundColor || null,
    splashPresetId: product.splashPresetId || categoryVisual.splashPresetId || null,
    glowPresetId: product.glowPresetId || categoryVisual.glowPresetId || null,
    gradientPresetId: product.gradientPresetId || categoryVisual.gradientPresetId || null,
    theme: (product.theme as any) || categoryVisual.theme || 'default',
    glossLevel: (product.glossLevel as any) || categoryVisual.glossLevel || 'none',
    sparkle: product.sparkle ?? categoryVisual.sparkle ?? false,
  }
}

/**
 * Get default background for products with no category match
 */
export function getDefaultProductBackground(): string {
  return 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)'
}

