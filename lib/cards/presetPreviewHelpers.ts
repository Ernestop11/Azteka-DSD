/**
 * Preset Preview Helpers
 *
 * Type-safe helper functions for rendering preset preview swatches
 * in admin UI. Provides gradient, glow, and splash preview utilities.
 *
 * Usage:
 * ```tsx
 * <div style={getGradientPreviewStyle('candy-dream')} />
 * <div style={getGlowPreviewShadow('citrus-pop')} />
 * <div dangerouslySetInnerHTML={{ __html: getSplashPreviewSvg('paleta-drip') }} />
 * ```
 */

import {
  GRADIENT_PRESETS_ADMIN,
  SPLASH_PRESETS_ADMIN,
  GLOW_PRESETS_ADMIN,
  GradientPresetMetadata,
  SplashPresetMetadata,
  GlowPresetMetadata,
} from './adminPresetSchemas';

import type { CSSProperties } from 'react';

// ============================================================================
// GRADIENT PREVIEW HELPERS
// ============================================================================

export interface GradientPreviewStyle extends CSSProperties {
  background: string;
  width?: string;
  height?: string;
  borderRadius?: string;
}

/**
 * Returns inline style object for gradient preview swatch
 *
 * @param id - Gradient preset ID
 * @param size - Optional size ('sm' | 'md' | 'lg')
 * @returns React CSSProperties for gradient preview
 */
export function getGradientPreviewStyle(
  id: string,
  size: 'sm' | 'md' | 'lg' = 'md'
): GradientPreviewStyle | null {
  const preset = GRADIENT_PRESETS_ADMIN.find((p) => p.id === id);

  if (!preset) {
    console.warn(`Gradient preset '${id}' not found`);
    return null;
  }

  const sizes = {
    sm: { width: '48px', height: '48px', borderRadius: '6px' },
    md: { width: '80px', height: '80px', borderRadius: '8px' },
    lg: { width: '120px', height: '120px', borderRadius: '12px' },
  };

  return {
    background: preset.rgb,
    ...sizes[size],
    transition: 'transform 0.2s ease, box-shadow 0.2s ease',
  };
}

/**
 * Returns Tailwind classes for gradient preview
 *
 * @param id - Gradient preset ID
 * @returns Tailwind class string
 */
export function getGradientPreviewClasses(id: string): string | null {
  const preset = GRADIENT_PRESETS_ADMIN.find((p) => p.id === id);

  if (!preset) {
    console.warn(`Gradient preset '${id}' not found`);
    return null;
  }

  return `bg-gradient-to-br ${preset.classes}`;
}

/**
 * Returns gradient metadata for tooltip/label display
 */
export function getGradientPreviewMeta(id: string): GradientPresetMetadata | null {
  const preset = GRADIENT_PRESETS_ADMIN.find((p) => p.id === id);
  return preset || null;
}

// ============================================================================
// GLOW PREVIEW HELPERS
// ============================================================================

export interface GlowPreviewStyle extends CSSProperties {
  width?: string;
  height?: string;
  borderRadius?: string;
  backgroundColor?: string;
  boxShadow: string;
  filter?: string;
}

/**
 * Returns inline style object for glow preview swatch
 *
 * @param id - Glow preset ID
 * @param size - Optional size
 * @param backgroundHex - Optional background color (default: white)
 * @returns React CSSProperties for glow preview
 */
export function getGlowPreviewShadow(
  id: string,
  size: 'sm' | 'md' | 'lg' = 'md',
  backgroundHex: string = '#ffffff'
): GlowPreviewStyle | null {
  const preset = GLOW_PRESETS_ADMIN.find((p) => p.id === id);

  if (!preset) {
    console.warn(`Glow preset '${id}' not found`);
    return null;
  }

  const sizes = {
    sm: { width: '48px', height: '48px', borderRadius: '6px' },
    md: { width: '80px', height: '80px', borderRadius: '8px' },
    lg: { width: '120px', height: '120px', borderRadius: '12px' },
  };

  return {
    backgroundColor: backgroundHex,
    boxShadow: preset.css_shadow,
    ...sizes[size],
    transition: 'transform 0.2s ease, box-shadow 0.2s ease',
  };
}

/**
 * Returns Tailwind classes for glow preview
 */
export function getGlowPreviewClasses(id: string): string | null {
  const preset = GLOW_PRESETS_ADMIN.find((p) => p.id === id);

  if (!preset) {
    console.warn(`Glow preset '${id}' not found`);
    return null;
  }

  return preset.shadow_classes;
}

/**
 * Returns glow metadata for tooltip/label display
 */
export function getGlowPreviewMeta(id: string): GlowPresetMetadata | null {
  const preset = GLOW_PRESETS_ADMIN.find((p) => p.id === id);
  return preset || null;
}

// ============================================================================
// SPLASH PREVIEW HELPERS
// ============================================================================

/**
 * Returns SVG string for splash preview thumbnail
 *
 * @param id - Splash preset ID
 * @returns SVG string (safe for dangerouslySetInnerHTML)
 */
export function getSplashPreviewSvg(id: string): string | null {
  const preset = SPLASH_PRESETS_ADMIN.find((p) => p.id === id);

  if (!preset) {
    console.warn(`Splash preset '${id}' not found`);
    return null;
  }

  // Return preview SVG if available, otherwise generate placeholder
  if (preset.preview_svg) {
    return preset.preview_svg;
  }

  // Generate default placeholder SVG
  return `
    <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" style="width: 100%; height: 100%;">
      <defs>
        <linearGradient id="splash-bg-${id}" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#f3f4f6;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#e5e7eb;stop-opacity:1" />
        </linearGradient>
      </defs>
      <rect width="100" height="100" fill="url(#splash-bg-${id})" />
      <text
        x="50"
        y="50"
        text-anchor="middle"
        dominant-baseline="middle"
        font-family="system-ui, -apple-system, sans-serif"
        font-size="10"
        fill="#6b7280"
      >
        ${preset.label}
      </text>
    </svg>
  `.trim();
}

/**
 * Returns splash overlay URL for actual rendering
 */
export function getSplashOverlayUrl(id: string): string | null {
  const preset = SPLASH_PRESETS_ADMIN.find((p) => p.id === id);

  if (!preset) {
    console.warn(`Splash preset '${id}' not found`);
    return null;
  }

  return preset.overlay_url;
}

/**
 * Returns splash metadata for tooltip/label display
 */
export function getSplashPreviewMeta(id: string): SplashPresetMetadata | null {
  const preset = SPLASH_PRESETS_ADMIN.find((p) => p.id === id);
  return preset || null;
}

// ============================================================================
// COMBINED PREVIEW HELPERS
// ============================================================================

export type PresetType = 'gradient' | 'glow' | 'splash';

/**
 * Returns preview style for any preset type
 *
 * @param type - Preset type
 * @param id - Preset ID
 * @param size - Size variant
 * @returns Appropriate style object or SVG string
 */
export function getPresetPreview(
  type: PresetType,
  id: string,
  size: 'sm' | 'md' | 'lg' = 'md'
): GradientPreviewStyle | GlowPreviewStyle | string | null {
  switch (type) {
    case 'gradient':
      return getGradientPreviewStyle(id, size);
    case 'glow':
      return getGlowPreviewShadow(id, size);
    case 'splash':
      return getSplashPreviewSvg(id);
    default:
      return null;
  }
}

type PresetMeta =
  | GradientPresetMetadata
  | GlowPresetMetadata
  | SplashPresetMetadata
  | null

/**
 * Returns metadata for any preset type
 */
export function getPresetMeta(type: PresetType, id: string): PresetMeta {
  switch (type) {
    case 'gradient':
      return getGradientPreviewMeta(id);
    case 'glow':
      return getGlowPreviewMeta(id);
    case 'splash':
      return getSplashPreviewMeta(id);
    default:
      return null;
  }
}

// ============================================================================
// PRESET VALIDATION
// ============================================================================

/**
 * Checks if a preset ID exists
 */
export function isValidPresetId(type: PresetType, id: string): boolean {
  switch (type) {
    case 'gradient':
      return GRADIENT_PRESETS_ADMIN.some((p) => p.id === id);
    case 'glow':
      return GLOW_PRESETS_ADMIN.some((p) => p.id === id);
    case 'splash':
      return SPLASH_PRESETS_ADMIN.some((p) => p.id === id);
    default:
      return false;
  }
}

/**
 * Returns all preset IDs of a given type
 */
export function getAllPresetIds(type: PresetType): string[] {
  switch (type) {
    case 'gradient':
      return GRADIENT_PRESETS_ADMIN.map((p) => p.id);
    case 'glow':
      return GLOW_PRESETS_ADMIN.map((p) => p.id);
    case 'splash':
      return SPLASH_PRESETS_ADMIN.map((p) => p.id);
    default:
      return [];
  }
}

// ============================================================================
// SWATCH GRID HELPERS
// ============================================================================

export interface SwatchGridConfig {
  columns: number;
  gap: string;
  swatchSize: 'sm' | 'md' | 'lg';
}

/**
 * Returns Tailwind grid classes for preset swatch grid
 */
export function getSwatchGridClasses(config: SwatchGridConfig): string {
  const colClasses = {
    1: 'grid-cols-1',
    2: 'grid-cols-2',
    3: 'grid-cols-3',
    4: 'grid-cols-4',
    5: 'grid-cols-5',
    6: 'grid-cols-6',
  };

  const gapClasses = {
    '0': 'gap-0',
    '1': 'gap-1',
    '2': 'gap-2',
    '3': 'gap-3',
    '4': 'gap-4',
    '6': 'gap-6',
  };

  return `grid ${colClasses[config.columns as keyof typeof colClasses] || 'grid-cols-4'} ${
    gapClasses[config.gap as keyof typeof gapClasses] || 'gap-3'
  }`;
}

/**
 * Returns recommended grid config based on preset type and screen size
 */
export function getRecommendedGridConfig(
  type: PresetType,
  screenSize: 'mobile' | 'tablet' | 'desktop' = 'desktop'
): SwatchGridConfig {
  const configs: Record<string, Record<PresetType, SwatchGridConfig>> = {
    mobile: {
      gradient: { columns: 2, gap: '2', swatchSize: 'sm' },
      glow: { columns: 2, gap: '2', swatchSize: 'sm' },
      splash: { columns: 2, gap: '2', swatchSize: 'md' },
    },
    tablet: {
      gradient: { columns: 3, gap: '3', swatchSize: 'md' },
      glow: { columns: 3, gap: '3', swatchSize: 'md' },
      splash: { columns: 3, gap: '3', swatchSize: 'md' },
    },
    desktop: {
      gradient: { columns: 4, gap: '4', swatchSize: 'md' },
      glow: { columns: 4, gap: '4', swatchSize: 'md' },
      splash: { columns: 3, gap: '4', swatchSize: 'lg' },
    },
  };

  return configs[screenSize][type];
}

// ============================================================================
// COLOR CONTRAST HELPERS
// ============================================================================

/**
 * Returns recommended text color based on background brightness
 * Useful for gradient preset labels
 */
export function getContrastTextColor(backgroundColor: string): '#000000' | '#ffffff' {
  // Remove # if present
  const hex = backgroundColor.replace('#', '');

  // Convert to RGB
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);

  // Calculate relative luminance
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;

  return luminance > 0.5 ? '#000000' : '#ffffff';
}

/**
 * Returns contrast-safe text color for gradient preset
 */
export function getGradientTextColor(id: string): '#000000' | '#ffffff' {
  const preset = GRADIENT_PRESETS_ADMIN.find((p) => p.id === id);

  if (!preset) return '#000000';

  // Use primary color as basis for contrast calculation
  return getContrastTextColor(preset.primary_color);
}
