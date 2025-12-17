/**
 * Visual Card Engine - Resolver Functions
 *
 * Production-ready TypeScript implementation of the 7-step rendering pipeline:
 * 1. Data Input (Product)
 * 2. Preset Resolution (resolveVisualPreset)
 * 3. Theme Application (applyCardTheme)
 * 4. Glow Resolution (resolveGlow)
 * 5. Splash Resolution (resolveSplash)
 * 6. Animation Flags (resolveAnimations)
 * 7. Render Output (ResolvedVisualPreset → AppliedCardTheme)
 *
 * Priority Hierarchies (from card-rendering-rules.md):
 * - Gradient: custom gradient > custom color > auto-gradient > preset > default
 * - Splash: custom overlay > seasonal override > preset > none
 * - Glow: featured enhancement > preset > auto-glow > none
 */

import {
  VisualProduct,
  GradientPresetId,
  SplashPresetId,
  GlowPresetId,
  CardThemeId,
  SeasonalTheme,
  ResolvedGradient,
  ResolvedSplash,
  ResolvedGlow,
  AnimationFlags,
  ResolvedVisualPreset,
  AppliedCardTheme,
  GRADIENT_CATALOG,
  SPLASH_CATALOG,
  GLOW_CATALOG,
} from './presetTypes';

// ============================================================================
// SEASONAL DETECTION
// ============================================================================

/**
 * Determines if a product is currently in season based on seasonal_start/end dates
 */
function isProductInSeason(product: VisualProduct): boolean {
  if (!product.seasonal || !product.seasonal_start || !product.seasonal_end) {
    return false;
  }

  const now = new Date();
  const start = new Date(product.seasonal_start);
  const end = new Date(product.seasonal_end);

  return now >= start && now <= end;
}

/**
 * Maps seasonal_theme string to typed SeasonalTheme
 */
function parseSeasonalTheme(theme: string | null | undefined): SeasonalTheme | undefined {
  if (!theme) return undefined;

  const normalized = theme.toLowerCase().trim();
  const validThemes: SeasonalTheme[] = [
    'halloween',
    'dia-de-muertos',
    'christmas',
    'valentine',
    'easter',
    'summer',
    'spring',
    'fall',
    'winter',
  ];

  return validThemes.find((t) => t === normalized);
}

// ============================================================================
// GRADIENT RESOLUTION
// ============================================================================

/**
 * Resolves background gradient with priority hierarchy:
 * 1. product.background_gradient (custom CSS gradient)
 * 2. product.background_color (auto-generate gradient)
 * 3. product.visual_preset (use preset gradient)
 * 4. Default white gradient
 *
 * @param product - Product with visual field mappings
 * @returns Resolved gradient with source attribution
 */
export function resolveGradient(product: VisualProduct): ResolvedGradient {
  // Priority 1: Custom gradient (highest priority)
  if (product.background_gradient) {
    return {
      source: 'custom',
      gradient: product.background_gradient,
    };
  }

  // Priority 2: Auto-generate from background_color
  if (product.background_color) {
    const color = product.background_color;
    // Create subtle gradient: solid at top-left (dd = 87% opacity), fade to near-transparent at bottom-right (22 = 13% opacity)
    const gradient = `linear-gradient(135deg, ${color}dd 0%, ${color}22 100%)`;

    return {
      source: 'auto',
      gradient,
    };
  }

  // Priority 3: Use visual_preset if it maps to a gradient preset
  if (product.visual_preset) {
    const presetId = product.visual_preset as GradientPresetId;
    const preset = GRADIENT_CATALOG[presetId];

    if (preset) {
      return {
        source: 'preset',
        gradient: preset.rgb,
        classes: `bg-gradient-to-br ${preset.classes}`,
        preset_id: preset.id,
      };
    }
  }

  // Priority 4: Default white
  return {
    source: 'default',
    gradient: 'linear-gradient(135deg, #ffffff 0%, #f9fafb 100%)',
    classes: 'bg-white',
  };
}

// ============================================================================
// SPLASH RESOLUTION
// ============================================================================

/**
 * Resolves splash overlay with priority hierarchy:
 * 1. product.splash_overlay (custom URL)
 * 2. Seasonal override (if product is seasonal and in-season)
 * 3. Preset from visual_preset or splash_preset field
 * 4. None
 *
 * @param product - Product with visual field mappings
 * @returns Resolved splash configuration
 */
export function resolveSplash(product: VisualProduct): ResolvedSplash {
  // Priority 1: Custom splash overlay URL
  if (product.splash_overlay) {
    return {
      enabled: true,
      source: 'custom',
      overlay_url: product.splash_overlay,
    };
  }

  // Priority 2: Seasonal override
  if (isProductInSeason(product)) {
    const seasonalTheme = parseSeasonalTheme(product.seasonal_theme);

    if (seasonalTheme) {
      // Find splash preset that matches seasonal theme
      const seasonalSplash = Object.values(SPLASH_CATALOG).find((splash) =>
        splash.seasonal?.includes(seasonalTheme)
      );

      if (seasonalSplash) {
        return {
          enabled: true,
          source: 'seasonal',
          overlay_url: seasonalSplash.overlay_url,
          preset_id: seasonalSplash.id,
          seasonal_theme: seasonalTheme,
        };
      }
    }
  }

  // Priority 3: Preset from visual_preset field
  if (product.visual_preset) {
    const presetId = product.visual_preset as SplashPresetId;
    const preset = SPLASH_CATALOG[presetId];

    if (preset) {
      return {
        enabled: true,
        source: 'preset',
        overlay_url: preset.overlay_url,
        preset_id: preset.id,
      };
    }
  }

  // Priority 4: No splash
  return {
    enabled: false,
    source: 'none',
  };
}

// ============================================================================
// GLOW RESOLUTION
// ============================================================================

/**
 * Resolves glow effect with priority hierarchy:
 * 1. Featured enhancement (if product.featured === true)
 * 2. product.glow_preset (explicit preset)
 * 3. Auto-glow based on gradient preset
 * 4. None
 *
 * @param product - Product with visual field mappings
 * @param resolvedGradient - Previously resolved gradient (for auto-glow logic)
 * @returns Resolved glow configuration
 */
export function resolveGlow(
  product: VisualProduct,
  resolvedGradient: ResolvedGradient
): ResolvedGlow {
  // Priority 1: Featured enhancement
  if (product.featured) {
    // Featured products get "midnight" glow for premium feel
    const featuredGlow = GLOW_CATALOG['midnight'];

    return {
      enabled: true,
      source: 'featured',
      classes: featuredGlow.classes,
      preset_id: 'midnight',
    };
  }

  // Priority 2: Explicit glow_preset
  if (product.glow_preset) {
    const presetId = product.glow_preset as GlowPresetId;
    const preset = GLOW_CATALOG[presetId];

    if (preset) {
      return {
        enabled: true,
        source: 'preset',
        classes: preset.classes,
        preset_id: preset.id,
      };
    }
  }

  // Priority 3: Auto-glow based on gradient preset
  if (resolvedGradient.preset_id) {
    const gradientPreset = GRADIENT_CATALOG[resolvedGradient.preset_id];

    // Map gradient presets to glow presets based on color temperature
    const glowMapping: Partial<Record<GradientPresetId, GlowPresetId | null>> = {
      'candy-dream': 'citrus-pop',
      'mint-grove': 'botanical',
      'ocean-breeze': 'cool-blue',
      'rose-garden': 'sugar-rush',
      'sunshine': 'citrus-pop',
      'sunset-glow': 'citrus-pop',
      'forest-fresh': 'botanical',
      'tropical-sea': 'cool-blue',
      'berry-bliss': 'sugar-rush',
      'twilight': 'cool-blue',
      'spring-meadow': 'botanical',
      'cherry-pop': 'sugar-rush',
      'steel-gray': null, // No auto-glow for neutral
      'golden-hour': 'citrus-pop',
      'arctic-blue': 'cool-blue',
      'citrus-splash': 'citrus-pop',
      'coastal-mist': 'botanical',
    };

    const autoGlowId = glowMapping[gradientPreset.id];

    if (autoGlowId) {
      const autoGlow = GLOW_CATALOG[autoGlowId];

      return {
        enabled: true,
        source: 'auto',
        classes: autoGlow.classes,
        preset_id: autoGlow.id,
      };
    }
  }

  // Priority 4: No glow
  return {
    enabled: false,
    source: 'none',
  };
}

// ============================================================================
// ANIMATION FLAGS
// ============================================================================

/**
 * Resolves animation flags based on product enhancements
 *
 * Animation behavior:
 * - Featured products: All animations enabled, stronger effects
 * - Seasonal products: Glow pulse + badge bounce
 * - New arrivals: Image zoom + badge bounce
 * - Trending: Hover lift + image zoom
 * - Default: Minimal hover lift only
 *
 * @param product - Product with enhancement flags
 * @returns Animation configuration
 */
export function resolveAnimations(product: VisualProduct): AnimationFlags {
  const isFeatured = product.featured;
  const isSeasonal = product.seasonal && isProductInSeason(product);
  const isNew = product.new_arrival;
  const isTrending = product.trending;

  // Featured products get all animations
  if (isFeatured) {
    return {
      enable_hover_lift: true,
      enable_glow_pulse: true,
      enable_image_zoom: true,
      enable_badge_bounce: true,
      hover_scale: 1.05, // 5% scale on hover
    };
  }

  // Seasonal products get glow pulse + badge bounce
  if (isSeasonal) {
    return {
      enable_hover_lift: true,
      enable_glow_pulse: true,
      enable_image_zoom: false,
      enable_badge_bounce: true,
      hover_scale: 1.03,
    };
  }

  // New arrivals get image zoom + badge bounce
  if (isNew) {
    return {
      enable_hover_lift: true,
      enable_glow_pulse: false,
      enable_image_zoom: true,
      enable_badge_bounce: true,
      hover_scale: 1.03,
    };
  }

  // Trending products get hover lift + image zoom
  if (isTrending) {
    return {
      enable_hover_lift: true,
      enable_glow_pulse: false,
      enable_image_zoom: true,
      enable_badge_bounce: false,
      hover_scale: 1.03,
    };
  }

  // Default: minimal hover lift
  return {
    enable_hover_lift: true,
    enable_glow_pulse: false,
    enable_image_zoom: false,
    enable_badge_bounce: false,
    hover_scale: 1.02,
  };
}

// ============================================================================
// TEXT COLOR RESOLUTION
// ============================================================================

/**
 * Resolves text color based on background
 *
 * Logic:
 * 1. If product.text_color is set, use it
 * 2. If using splash theme or dark preset, use white
 * 3. Otherwise use dark gray (#111827)
 *
 * @param product - Product with text_color field
 * @param splash - Resolved splash configuration
 * @param gradient - Resolved gradient configuration
 * @returns CSS color value
 */
export function resolveTextColor(
  product: VisualProduct,
  splash: ResolvedSplash,
  gradient: ResolvedGradient
): string {
  // Priority 1: Explicit text_color
  if (product.text_color) {
    return product.text_color;
  }

  // Priority 2: White text for splash overlays
  if (splash.enabled) {
    return '#ffffff';
  }

  // Priority 3: Check if using dark gradient preset
  const darkPresets: GradientPresetId[] = ['twilight', 'steel-gray'];
  if (gradient.preset_id && darkPresets.includes(gradient.preset_id)) {
    return '#ffffff';
  }

  // Default: dark gray
  return '#111827';
}

// ============================================================================
// THEME DETECTION
// ============================================================================

/**
 * Determines card theme based on visual properties
 *
 * Theme detection logic:
 * - splash: If splash overlay is enabled
 * - gradient: If using gradient preset or custom gradient
 * - basic: Default fallback
 *
 * @param splash - Resolved splash configuration
 * @param gradient - Resolved gradient configuration
 * @returns Card theme ID
 */
export function detectCardTheme(
  splash: ResolvedSplash,
  gradient: ResolvedGradient
): CardThemeId {
  if (splash.enabled) {
    return 'splash';
  }

  if (gradient.source === 'preset' || gradient.source === 'custom') {
    return 'gradient';
  }

  return 'basic';
}

// ============================================================================
// MAIN ORCHESTRATOR: resolveVisualPreset
// ============================================================================

/**
 * Main orchestrator function that resolves all visual properties
 * for a product using the 7-step rendering pipeline.
 *
 * This is the primary entry point for the Visual Card Engine.
 *
 * @param product - Product data with visual field mappings
 * @returns Complete visual preset with all resolved properties
 */
export function resolveVisualPreset(product: VisualProduct): ResolvedVisualPreset {
  // Step 1: Resolve gradient (background layer)
  const gradient = resolveGradient(product);

  // Step 2: Resolve splash (overlay layer)
  const splash = resolveSplash(product);

  // Step 3: Resolve glow (shadow/glow layer)
  const glow = resolveGlow(product, gradient);

  // Step 4: Resolve animation flags
  const animations = resolveAnimations(product);

  // Step 5: Resolve text color
  const textColor = resolveTextColor(product, splash, gradient);

  // Step 6: Detect theme
  const theme = detectCardTheme(splash, gradient);

  // Step 7: Assemble final preset
  return {
    theme,
    gradient,
    splash,
    glow,
    animations,
    text_color: textColor,
    is_featured: product.featured,
    is_seasonal: product.seasonal && isProductInSeason(product),
    is_new: product.new_arrival,
    is_trending: product.trending,
  };
}

// ============================================================================
// THEME APPLICATION: applyCardTheme
// ============================================================================

/**
 * Converts ResolvedVisualPreset into concrete CSS classes and styles
 * that can be directly applied to ProductCard.tsx
 *
 * This function transforms the resolved preset into a format that
 * React components can consume (className strings, inline styles).
 *
 * @param preset - Resolved visual preset from resolveVisualPreset
 * @returns Applied theme with CSS classes and inline styles
 */
export function applyCardTheme(preset: ResolvedVisualPreset): AppliedCardTheme {
  // Background layer
  const background = preset.gradient.gradient;
  const background_classes = preset.gradient.classes;

  // Splash layer
  const splash_overlay_url = preset.splash.enabled ? preset.splash.overlay_url : undefined;

  // Glow layer
  const glow_classes = preset.glow.enabled ? preset.glow.classes : undefined;

  // Border classes
  let border_classes = 'border';

  if (preset.theme === 'splash') {
    border_classes = 'border border-white/10';
  } else if (preset.is_featured) {
    border_classes = 'border-2 border-amber-400';
  } else if (preset.is_seasonal) {
    border_classes = 'border-2 border-rose-300';
  } else {
    border_classes = 'border border-gray-200';
  }

  // Shadow classes
  let shadow_classes = 'shadow-sm';

  if (preset.glow.enabled) {
    // Glow preset provides custom shadow
    shadow_classes = '';
  } else if (preset.is_featured) {
    shadow_classes = 'shadow-lg';
  } else if (preset.theme === 'splash') {
    shadow_classes = 'shadow-2xl';
  }

  // Enhancement badges
  const badges = {
    featured: preset.is_featured,
    seasonal: preset.is_seasonal,
    new: preset.is_new,
    trending: preset.is_trending,
  };

  return {
    background,
    background_classes,
    splash_overlay_url,
    glow_classes,
    text_color: preset.text_color,
    border_classes,
    shadow_classes,
    animations: preset.animations,
    badges,
    theme_id: preset.theme,
    preset_id: preset.gradient.preset_id || preset.splash.preset_id,
    seasonal_theme: preset.splash.seasonal_theme,
  };
}

// ============================================================================
// CONVENIENCE HELPERS
// ============================================================================

/**
 * One-shot helper that combines resolveVisualPreset + applyCardTheme
 *
 * Use this in ProductCard.tsx for direct theme application:
 *
 * ```tsx
 * const theme = getCardTheme(product);
 * return (
 *   <div
 *     className={cn(theme.border_classes, theme.shadow_classes, theme.glow_classes)}
 *     style={{ background: theme.background, color: theme.text_color }}
 *   >
 *     {theme.splash_overlay_url && <img src={theme.splash_overlay_url} />}
 *     ...
 *   </div>
 * );
 * ```
 *
 * @param product - Product data
 * @returns Applied card theme ready for rendering
 */
export function getCardTheme(product: VisualProduct): AppliedCardTheme {
  const preset = resolveVisualPreset(product);
  return applyCardTheme(preset);
}

/**
 * Debug helper that returns human-readable explanation of visual decisions
 *
 * @param product - Product data
 * @returns Debug object with decision reasoning
 */
export function debugVisualPreset(product: VisualProduct): {
  preset: ResolvedVisualPreset;
  decisions: {
    gradient_reason: string;
    splash_reason: string;
    glow_reason: string;
    theme_reason: string;
  };
} {
  const preset = resolveVisualPreset(product);

  const gradient_reason = (() => {
    if (product.background_gradient) return 'Using custom gradient from background_gradient field';
    if (product.background_color) return 'Auto-generated gradient from background_color';
    if (preset.gradient.preset_id) return `Using gradient preset: ${preset.gradient.preset_id}`;
    return 'Using default white gradient';
  })();

  const splash_reason = (() => {
    if (product.splash_overlay) return 'Using custom splash overlay URL';
    if (preset.splash.seasonal_theme) return `Seasonal override: ${preset.splash.seasonal_theme}`;
    if (preset.splash.preset_id) return `Using splash preset: ${preset.splash.preset_id}`;
    return 'No splash overlay';
  })();

  const glow_reason = (() => {
    if (product.featured) return 'Featured product enhancement (midnight glow)';
    if (product.glow_preset) return `Using explicit glow preset: ${product.glow_preset}`;
    if (preset.glow.source === 'auto') return `Auto-glow based on gradient: ${preset.glow.preset_id}`;
    return 'No glow effect';
  })();

  const theme_reason = (() => {
    if (preset.theme === 'splash') return 'Splash theme (overlay enabled)';
    if (preset.theme === 'gradient') return 'Gradient theme (preset or custom)';
    return 'Basic theme (default)';
  })();

  return {
    preset,
    decisions: {
      gradient_reason,
      splash_reason,
      glow_reason,
      theme_reason,
    },
  };
}
