/**
 * Catalog UI Visual Theme System
 * 
 * Bolt-grade design system with AI-generated asset support,
 * neon effects, glassmorphism, and polished visual presets.
 */

// ============================================
// COLOR PALETTES
// ============================================

export const neonColors = {
  // Primary neon palette
  cyan: '#00F5FF',
  magenta: '#FF00FF',
  yellow: '#FFFF00',
  lime: '#CCFF00',
  orange: '#FF6B00',
  pink: '#FF69B4',
  purple: '#9D00FF',
  blue: '#0080FF',
  
  // Brand neons (Azteka)
  brandOrange: '#FF6B35',
  brandRed: '#FF4444',
  brandGold: '#FFD700',
  
  // Glow colors
  warmGlow: 'rgba(255, 107, 53, 0.5)',
  coolGlow: 'rgba(0, 245, 255, 0.5)',
  successGlow: 'rgba(204, 255, 0, 0.5)',
  premiumGlow: 'rgba(255, 215, 0, 0.5)',
} as const;

export const gradients = {
  // Brand gradients
  brandPrimary: 'linear-gradient(135deg, #FF6B35 0%, #FF4444 100%)',
  brandSecondary: 'linear-gradient(135deg, #FFD700 0%, #FF6B35 100%)',
  
  // Neon gradients
  neonRainbow: 'linear-gradient(90deg, #00F5FF 0%, #FF00FF 50%, #FFFF00 100%)',
  neonSunset: 'linear-gradient(135deg, #FF6B00 0%, #FF00FF 50%, #9D00FF 100%)',
  neonDawn: 'linear-gradient(135deg, #0080FF 0%, #00F5FF 50%, #CCFF00 100%)',
  
  // Glossy effects
  glossyLight: 'linear-gradient(180deg, rgba(255,255,255,0.4) 0%, rgba(255,255,255,0) 100%)',
  glossyDark: 'linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(0,0,0,0.3) 100%)',
  
  // Shimmer effects
  shimmer: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.6) 50%, transparent 100%)',
  goldShimmer: 'linear-gradient(90deg, transparent 0%, rgba(255,215,0,0.6) 50%, transparent 100%)',
} as const;

// ============================================
// GLOW EFFECTS
// ============================================

export const glowPresets = {
  // Soft glows
  soft: {
    boxShadow: '0 0 20px rgba(255, 107, 53, 0.3)',
  },
  softCool: {
    boxShadow: '0 0 20px rgba(0, 245, 255, 0.3)',
  },
  
  // Medium glows
  medium: {
    boxShadow: '0 0 30px rgba(255, 107, 53, 0.5), 0 0 60px rgba(255, 107, 53, 0.3)',
  },
  mediumCool: {
    boxShadow: '0 0 30px rgba(0, 245, 255, 0.5), 0 0 60px rgba(0, 245, 255, 0.3)',
  },
  
  // Strong glows
  strong: {
    boxShadow: '0 0 40px rgba(255, 107, 53, 0.7), 0 0 80px rgba(255, 107, 53, 0.5), 0 0 120px rgba(255, 107, 53, 0.3)',
  },
  strongCool: {
    boxShadow: '0 0 40px rgba(0, 245, 255, 0.7), 0 0 80px rgba(0, 245, 255, 0.5), 0 0 120px rgba(0, 245, 255, 0.3)',
  },
  
  // Neon glows
  neonPink: {
    boxShadow: '0 0 30px rgba(255, 0, 255, 0.6), 0 0 60px rgba(255, 0, 255, 0.4)',
  },
  neonCyan: {
    boxShadow: '0 0 30px rgba(0, 245, 255, 0.6), 0 0 60px rgba(0, 245, 255, 0.4)',
  },
  neonYellow: {
    boxShadow: '0 0 30px rgba(255, 255, 0, 0.6), 0 0 60px rgba(255, 255, 0, 0.4)',
  },
  neonGold: {
    boxShadow: '0 0 30px rgba(255, 215, 0, 0.6), 0 0 60px rgba(255, 215, 0, 0.4)',
  },
  
  // Product focus glow
  productFocus: {
    boxShadow: '0 0 40px rgba(255, 107, 53, 0.4), 0 0 80px rgba(255, 107, 53, 0.2), 0 8px 32px rgba(0, 0, 0, 0.3)',
  },
} as const;

// ============================================
// GLASSMORPHISM PRESETS
// ============================================

export const glassmorphism = {
  // Light glass
  light: {
    background: 'rgba(255, 255, 255, 0.1)',
    backdropFilter: 'blur(10px)',
    border: '1px solid rgba(255, 255, 255, 0.2)',
  },
  
  // Medium glass
  medium: {
    background: 'rgba(255, 255, 255, 0.15)',
    backdropFilter: 'blur(20px)',
    border: '1px solid rgba(255, 255, 255, 0.3)',
  },
  
  // Strong glass
  strong: {
    background: 'rgba(255, 255, 255, 0.25)',
    backdropFilter: 'blur(30px)',
    border: '1px solid rgba(255, 255, 255, 0.4)',
  },
  
  // Dark glass
  dark: {
    background: 'rgba(0, 0, 0, 0.3)',
    backdropFilter: 'blur(20px)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
  },
  
  // Brand glass
  brand: {
    background: 'rgba(255, 107, 53, 0.1)',
    backdropFilter: 'blur(20px)',
    border: '1px solid rgba(255, 107, 53, 0.3)',
  },
} as const;

// ============================================
// CARD SHAPES & VARIANTS
// ============================================

export const cardVariants = {
  // Standard card
  standard: {
    borderRadius: '16px',
    overflow: 'hidden',
  },
  
  // Glossy card
  glossy: {
    borderRadius: '20px',
    overflow: 'hidden',
    position: 'relative' as const,
    background: 'linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.95) 100%)',
  },
  
  // Neon card
  neon: {
    borderRadius: '16px',
    overflow: 'hidden',
    border: '2px solid transparent',
    background: 'linear-gradient(white, white) padding-box, linear-gradient(135deg, #FF6B35, #FF00FF) border-box',
  },
  
  // Pill shape
  pill: {
    borderRadius: '9999px',
    overflow: 'hidden',
  },
  
  // Elevated card
  elevated: {
    borderRadius: '20px',
    overflow: 'hidden',
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1), 0 0 0 1px rgba(0, 0, 0, 0.05)',
  },
} as const;

// ============================================
// SHADOW PRESETS
// ============================================

export const shadows = {
  // Soft shadows
  soft: '0 2px 8px rgba(0, 0, 0, 0.1)',
  softLarge: '0 4px 16px rgba(0, 0, 0, 0.1)',
  
  // Medium shadows
  medium: '0 4px 16px rgba(0, 0, 0, 0.15)',
  mediumLarge: '0 8px 32px rgba(0, 0, 0, 0.15)',
  
  // Strong shadows
  strong: '0 8px 32px rgba(0, 0, 0, 0.2)',
  strongLarge: '0 12px 48px rgba(0, 0, 0, 0.2)',
  
  // Colored shadows
  brand: '0 8px 32px rgba(255, 107, 53, 0.3)',
  success: '0 8px 32px rgba(204, 255, 0, 0.3)',
  neon: '0 8px 32px rgba(255, 0, 255, 0.3)',
  
  // Reflection shadow (for glossy effects)
  reflection: 'inset 0 -40px 40px -40px rgba(0, 0, 0, 0.15)',
  
  // Drop shadows for images/logos
  drop: 'drop-shadow(0 4px 8px rgba(0, 0, 0, 0.2))',
  dropStrong: 'drop-shadow(0 8px 16px rgba(0, 0, 0, 0.3))',
} as const;

// ============================================
// ANIMATION PRESETS
// ============================================

export const animations = {
  // Hover animations
  hoverGlow: {
    transition: 'all 0.3s ease',
    '&:hover': {
      transform: 'translateY(-4px) scale(1.02)',
      boxShadow: '0 0 30px rgba(255, 107, 53, 0.5), 0 12px 48px rgba(0, 0, 0, 0.2)',
    },
  },
  
  // Pulse animation
  pulse: {
    animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
  },
  
  // Blink animation
  blink: {
    animation: 'blink 1.5s ease-in-out infinite',
  },
  
  // Float animation
  float: {
    animation: 'float 3s ease-in-out infinite',
  },
  
  // Shimmer animation
  shimmer: {
    animation: 'shimmer 2s linear infinite',
  },
  
  // Neon border animation
  neonBorder: {
    animation: 'neonBorder 2s ease-in-out infinite',
  },
} as const;

// ============================================
// KEYFRAME DEFINITIONS (CSS strings)
// ============================================

export const keyframes = {
  pulse: `
    @keyframes pulse {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.7; }
    }
  `,
  
  blink: `
    @keyframes blink {
      0%, 50%, 100% { opacity: 1; }
      25%, 75% { opacity: 0.5; }
    }
  `,
  
  float: `
    @keyframes float {
      0%, 100% { transform: translateY(0px); }
      50% { transform: translateY(-10px); }
    }
  `,
  
  shimmer: `
    @keyframes shimmer {
      0% { background-position: -1000px 0; }
      100% { background-position: 1000px 0; }
    }
  `,
  
  neonBorder: `
    @keyframes neonBorder {
      0%, 100% {
        border-color: #FF6B35;
        box-shadow: 0 0 20px rgba(255, 107, 53, 0.5);
      }
      33% {
        border-color: #FF00FF;
        box-shadow: 0 0 20px rgba(255, 0, 255, 0.5);
      }
      66% {
        border-color: #00F5FF;
        box-shadow: 0 0 20px rgba(0, 245, 255, 0.5);
      }
    }
  `,
  
  confetti: `
    @keyframes confetti {
      0% { transform: translateY(-100%) rotate(0deg); opacity: 1; }
      100% { transform: translateY(100vh) rotate(360deg); opacity: 0; }
    }
  `,
  
  parallax: `
    @keyframes parallax {
      0% { transform: translateY(0px); }
      100% { transform: translateY(-20px); }
    }
  `,
} as const;

// ============================================
// AI ASSET CONFIGURATION
// ============================================

export const aiAssetConfig = {
  // Canva-generated asset paths
  canvaBasePath: '/canva-assets',
  
  // Asset categories
  categories: {
    heroes: 'heroes',
    products: 'products',
    bundles: 'bundles',
    brands: 'brands',
    banners: 'banners',
    backgrounds: 'backgrounds',
  },
  
  // Fallback images
  fallbacks: {
    hero: '/images/fallback-hero.jpg',
    product: '/images/fallback-product.png',
    bundle: '/images/fallback-bundle.png',
    brand: '/images/fallback-brand.png',
    banner: '/images/fallback-banner.jpg',
  },
  
  // Image optimization settings
  optimization: {
    quality: 85,
    format: 'webp',
    fallbackFormat: 'jpg',
  },
} as const;

// ============================================
// UTILITY FUNCTIONS
// ============================================

/**
 * Get AI-generated asset URL with fallback
 */
export const getAiAssetUrl = (
  category: keyof typeof aiAssetConfig.categories,
  assetId: string,
  fallback?: string
): string => {
  const canvaUrl = `${aiAssetConfig.canvaBasePath}/${aiAssetConfig.categories[category]}/${assetId}`;
  return canvaUrl || fallback || aiAssetConfig.fallbacks[category as keyof typeof aiAssetConfig.fallbacks] || '';
};

/**
 * Get neon color for savings badge based on percentage
 */
export const getSavingsNeonColor = (savingsPercent: number): string => {
  if (savingsPercent >= 50) return neonColors.magenta;
  if (savingsPercent >= 30) return neonColors.purple;
  if (savingsPercent >= 20) return neonColors.orange;
  if (savingsPercent >= 10) return neonColors.lime;
  return neonColors.cyan;
};

/**
 * Get glow preset based on product category
 */
export const getCategoryGlow = (category?: string): typeof glowPresets[keyof typeof glowPresets] => {
  if (!category) return glowPresets.soft;
  
  const categoryLower = category.toLowerCase();
  
  if (categoryLower.includes('premium') || categoryLower.includes('luxury')) {
    return glowPresets.neonGold;
  }
  if (categoryLower.includes('new') || categoryLower.includes('featured')) {
    return glowPresets.neonCyan;
  }
  if (categoryLower.includes('sale') || categoryLower.includes('deal')) {
    return glowPresets.neonPink;
  }
  
  return glowPresets.soft;
};

/**
 * Create glossy overlay styles
 */
export const createGlossyOverlay = (): React.CSSProperties => ({
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  height: '50%',
  background: gradients.glossyLight,
  pointerEvents: 'none',
  zIndex: 1,
});

/**
 * Create reflection overlay styles
 */
export const createReflectionOverlay = (): React.CSSProperties => ({
  position: 'absolute',
  bottom: 0,
  left: 0,
  right: 0,
  height: '30%',
  background: gradients.glossyDark,
  pointerEvents: 'none',
  zIndex: 1,
});

/**
 * Create vignette overlay styles
 */
export const createVignetteOverlay = (intensity: 'light' | 'medium' | 'strong' = 'medium'): React.CSSProperties => {
  const opacities = {
    light: 0.3,
    medium: 0.5,
    strong: 0.7,
  };
  
  return {
    position: 'absolute',
    inset: 0,
    background: `radial-gradient(circle at center, transparent 0%, rgba(0, 0, 0, ${opacities[intensity]}) 100%)`,
    pointerEvents: 'none',
    zIndex: 1,
  };
};

/**
 * Combine multiple CSS styles
 */
export const combineStyles = (...styles: React.CSSProperties[]): React.CSSProperties => {
  return Object.assign({}, ...styles);
};

/**
 * Get neon border style
 */
export const getNeonBorderStyle = (color: string = neonColors.brandOrange): React.CSSProperties => ({
  border: `2px solid ${color}`,
  boxShadow: `0 0 10px ${color}, inset 0 0 10px ${color}`,
});

// ============================================
// EXPORT ALL KEYFRAMES AS STRING
// ============================================

export const allKeyframes = Object.values(keyframes).join('\n');

// ============================================
// THEME EXPORTS
// ============================================

export default {
  neonColors,
  gradients,
  glowPresets,
  glassmorphism,
  cardVariants,
  shadows,
  animations,
  keyframes,
  aiAssetConfig,
  // Utility functions
  getAiAssetUrl,
  getSavingsNeonColor,
  getCategoryGlow,
  createGlossyOverlay,
  createReflectionOverlay,
  createVignetteOverlay,
  combineStyles,
  getNeonBorderStyle,
  allKeyframes,
};
