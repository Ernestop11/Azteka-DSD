/**
 * Admin Preset Picker - UI Data Provider
 *
 * Provides grouped preset data for Admin UI components.
 * Returns presets organized by type with preview-ready data.
 *
 * Usage in Admin UI:
 * ```tsx
 * const presets = getAdminPresets();
 * presets.gradients.map(g => <GradientCard key={g.id} {...g} />)
 * ```
 */

import {
  GradientPresetMetadata,
  SplashPresetMetadata,
  GlowPresetMetadata,
  GRADIENT_PRESETS_ADMIN,
  SPLASH_PRESETS_ADMIN,
  GLOW_PRESETS_ADMIN,
  getPresetsByCategory,
  getPresetsBySeason,
} from './adminPresetSchemas';

// ============================================================================
// SIMPLIFIED PRESET DATA FOR UI
// ============================================================================

export interface GradientPickerItem {
  id: string;
  label: string;
  description: string;
  css: string; // CSS gradient for preview
  classes: string; // Tailwind classes
  primary_color: string;
  accent_color: string;
  recommended_for: string[]; // Categories
  season: string[];
  contrast: 'high' | 'medium' | 'low';
  premium: boolean;
  popularity: number;
}

export interface SplashPickerItem {
  id: string;
  label: string;
  description: string;
  svg: string; // Inline SVG preview
  overlay_url: string;
  recommended_for: string[];
  season: string[];
  contrast: 'high' | 'medium' | 'low';
  premium: boolean;
  popularity: number;
}

export interface GlowPickerItem {
  id: string;
  label: string;
  description: string;
  shadow: string; // CSS box-shadow for preview
  classes: string; // Tailwind classes
  primary_color: string;
  glow_intensity: number;
  recommended_for: string[];
  premium: boolean;
  popularity: number;
}

// ============================================================================
// PRESET PICKER DATA PROVIDER
// ============================================================================

export interface AdminPresetPickerData {
  gradients: GradientPickerItem[];
  splashes: SplashPickerItem[];
  glows: GlowPickerItem[];
}

/**
 * Returns all presets formatted for Admin UI pickers
 */
export function getAdminPresets(): AdminPresetPickerData {
  return {
    gradients: GRADIENT_PRESETS_ADMIN.map(mapGradientForPicker),
    splashes: SPLASH_PRESETS_ADMIN.map(mapSplashForPicker),
    glows: GLOW_PRESETS_ADMIN.map(mapGlowForPicker),
  };
}

/**
 * Returns presets filtered by category
 */
export function getAdminPresetsByCategory(category: string): AdminPresetPickerData {
  const filtered = getPresetsByCategory(category);

  return {
    gradients: filtered.gradients.map(mapGradientForPicker),
    splashes: filtered.splashes.map(mapSplashForPicker),
    glows: filtered.glows.map(mapGlowForPicker),
  };
}

/**
 * Returns presets filtered by season
 */
export function getAdminPresetsBySeason(season: string): {
  gradients: GradientPickerItem[];
  splashes: SplashPickerItem[];
} {
  const filtered = getPresetsBySeason(season as any);

  return {
    gradients: filtered.gradients.map(mapGradientForPicker),
    splashes: filtered.splashes.map(mapSplashForPicker),
  };
}

/**
 * Returns most popular presets (sorted by popularity)
 */
export function getPopularPresets(limit: number = 10): AdminPresetPickerData {
  const sortByPopularity = (a: { popularity?: number }, b: { popularity?: number }) =>
    (b.popularity || 0) - (a.popularity || 0);

  return {
    gradients: GRADIENT_PRESETS_ADMIN.sort(sortByPopularity)
      .slice(0, limit)
      .map(mapGradientForPicker),
    splashes: SPLASH_PRESETS_ADMIN.sort(sortByPopularity)
      .slice(0, limit)
      .map(mapSplashForPicker),
    glows: GLOW_PRESETS_ADMIN.sort(sortByPopularity)
      .slice(0, limit)
      .map(mapGlowForPicker),
  };
}

/**
 * Returns premium presets only
 */
export function getPremiumPresets(): AdminPresetPickerData {
  return {
    gradients: GRADIENT_PRESETS_ADMIN.filter((p) => p.premium).map(mapGradientForPicker),
    splashes: SPLASH_PRESETS_ADMIN.filter((p) => p.premium).map(mapSplashForPicker),
    glows: GLOW_PRESETS_ADMIN.filter((p) => p.premium).map(mapGlowForPicker),
  };
}

// ============================================================================
// MAPPING FUNCTIONS
// ============================================================================

function mapGradientForPicker(preset: GradientPresetMetadata): GradientPickerItem {
  return {
    id: preset.id,
    label: preset.label,
    description: preset.description,
    css: preset.rgb,
    classes: preset.classes,
    primary_color: preset.primary_color,
    accent_color: preset.accent_color,
    recommended_for: preset.recommendedFor,
    season: preset.season || [],
    contrast: preset.contrast,
    premium: preset.premium,
    popularity: preset.popularity || 0,
  };
}

function mapSplashForPicker(preset: SplashPresetMetadata): SplashPickerItem {
  // Generate simple SVG preview if none provided
  const defaultSvg = `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
    <rect width="100" height="100" fill="#f3f4f6"/>
    <text x="50" y="50" text-anchor="middle" font-size="12" fill="#6b7280">${preset.label}</text>
  </svg>`;

  return {
    id: preset.id,
    label: preset.label,
    description: preset.description,
    svg: preset.preview_svg || defaultSvg,
    overlay_url: preset.overlay_url,
    recommended_for: preset.recommendedFor,
    season: preset.season || [],
    contrast: preset.contrast,
    premium: preset.premium,
    popularity: preset.popularity || 0,
  };
}

function mapGlowForPicker(preset: GlowPresetMetadata): GlowPickerItem {
  return {
    id: preset.id,
    label: preset.label,
    description: preset.description,
    shadow: preset.css_shadow,
    classes: preset.shadow_classes,
    primary_color: preset.primary_color,
    glow_intensity: preset.glow_intensity,
    recommended_for: preset.recommendedFor,
    premium: preset.premium,
    popularity: preset.popularity || 0,
  };
}

// ============================================================================
// PRESET SEARCH
// ============================================================================

export interface PresetSearchOptions {
  query?: string;
  category?: string;
  season?: string;
  premium_only?: boolean;
  min_popularity?: number;
}

export function searchPresets(options: PresetSearchOptions): AdminPresetPickerData {
  const { query, category, season, premium_only, min_popularity } = options;

  let gradients = [...GRADIENT_PRESETS_ADMIN];
  let splashes = [...SPLASH_PRESETS_ADMIN];
  let glows = [...GLOW_PRESETS_ADMIN];

  // Filter by search query
  if (query) {
    const q = query.toLowerCase();
    gradients = gradients.filter(
      (p) =>
        p.label.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.recommendedFor.some((r) => r.toLowerCase().includes(q))
    );
    splashes = splashes.filter(
      (p) =>
        p.label.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.recommendedFor.some((r) => r.toLowerCase().includes(q))
    );
    glows = glows.filter(
      (p) =>
        p.label.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.recommendedFor.some((r) => r.toLowerCase().includes(q))
    );
  }

  // Filter by category
  if (category) {
    const cat = category.toLowerCase();
    gradients = gradients.filter((p) =>
      p.recommendedFor.some((r) => r.toLowerCase().includes(cat))
    );
    splashes = splashes.filter((p) =>
      p.recommendedFor.some((r) => r.toLowerCase().includes(cat))
    );
    glows = glows.filter((p) =>
      p.recommendedFor.some((r) => r.toLowerCase().includes(cat))
    );
  }

  // Filter by season
  if (season) {
    gradients = gradients.filter((p) => p.season?.includes(season as any));
    splashes = splashes.filter((p) => p.season?.includes(season as any));
  }

  // Filter by premium
  if (premium_only) {
    gradients = gradients.filter((p) => p.premium);
    splashes = splashes.filter((p) => p.premium);
    glows = glows.filter((p) => p.premium);
  }

  // Filter by minimum popularity
  if (min_popularity !== undefined) {
    gradients = gradients.filter((p) => (p.popularity || 0) >= min_popularity);
    splashes = splashes.filter((p) => (p.popularity || 0) >= min_popularity);
    glows = glows.filter((p) => (p.popularity || 0) >= min_popularity);
  }

  return {
    gradients: gradients.map(mapGradientForPicker),
    splashes: splashes.map(mapSplashForPicker),
    glows: glows.map(mapGlowForPicker),
  };
}

// ============================================================================
// PRESET RECOMMENDATIONS
// ============================================================================

/**
 * Returns recommended presets based on product metadata
 */
export function getRecommendedPresetsForProduct(product: {
  category?: string;
  brand?: string;
  name?: string;
  seasonal?: boolean;
  seasonal_theme?: string;
}): AdminPresetPickerData {
  let recommendations: AdminPresetPickerData = {
    gradients: [],
    splashes: [],
    glows: [],
  };

  // Start with seasonal recommendations if applicable
  if (product.seasonal && product.seasonal_theme) {
    const seasonal = getAdminPresetsBySeason(product.seasonal_theme);
    recommendations.gradients.push(...seasonal.gradients);
    recommendations.splashes.push(...seasonal.splashes);
  }

  // Add category-based recommendations
  if (product.category) {
    const categoryPresets = getAdminPresetsByCategory(product.category);
    recommendations.gradients.push(...categoryPresets.gradients);
    recommendations.splashes.push(...categoryPresets.splashes);
    recommendations.glows.push(...categoryPresets.glows);
  }

  // Search by product name keywords
  if (product.name) {
    const namePresets = searchPresets({ query: product.name });
    recommendations.gradients.push(...namePresets.gradients);
    recommendations.splashes.push(...namePresets.splashes);
    recommendations.glows.push(...namePresets.glows);
  }

  // Deduplicate by id
  recommendations.gradients = deduplicateById(recommendations.gradients);
  recommendations.splashes = deduplicateById(recommendations.splashes);
  recommendations.glows = deduplicateById(recommendations.glows);

  // Sort by popularity
  recommendations.gradients.sort((a, b) => b.popularity - a.popularity);
  recommendations.splashes.sort((a, b) => b.popularity - a.popularity);
  recommendations.glows.sort((a, b) => b.popularity - a.popularity);

  return recommendations;
}

function deduplicateById<T extends { id: string }>(items: T[]): T[] {
  const seen = new Set<string>();
  return items.filter((item) => {
    if (seen.has(item.id)) return false;
    seen.add(item.id);
    return true;
  });
}

// ============================================================================
// PRESET GROUPING FOR UI
// ============================================================================

export interface GroupedPresets<T> {
  group_name: string;
  presets: T[];
}

/**
 * Groups gradients by season for tabbed UI
 */
export function getGradientsGroupedBySeason(): GroupedPresets<GradientPickerItem>[] {
  const groups: Record<string, GradientPickerItem[]> = {
    'All Year': [],
    'Summer': [],
    'Fall': [],
    'Winter': [],
    'Spring': [],
    'Holiday': [],
  };

  GRADIENT_PRESETS_ADMIN.forEach((preset) => {
    const item = mapGradientForPicker(preset);

    if (!preset.season || preset.season.length === 0) {
      groups['All Year'].push(item);
    } else {
      preset.season.forEach((s) => {
        if (s === 'summer') groups['Summer'].push(item);
        else if (s === 'fall') groups['Fall'].push(item);
        else if (s === 'winter') groups['Winter'].push(item);
        else if (s === 'spring') groups['Spring'].push(item);
        else groups['Holiday'].push(item);
      });
    }
  });

  return Object.entries(groups).map(([group_name, presets]) => ({
    group_name,
    presets,
  }));
}

/**
 * Groups splashes by use case for admin UI
 */
export function getSplashesGroupedByUseCase(): GroupedPresets<SplashPickerItem>[] {
  return [
    {
      group_name: 'Beverages',
      presets: SPLASH_PRESETS_ADMIN.filter((p) =>
        p.recommendedFor.some((r) => /beverage|drink|soda|agua/i.test(r))
      ).map(mapSplashForPicker),
    },
    {
      group_name: 'Candy & Sweets',
      presets: SPLASH_PRESETS_ADMIN.filter((p) =>
        p.recommendedFor.some((r) => /candy|dulce|sweet/i.test(r))
      ).map(mapSplashForPicker),
    },
    {
      group_name: 'Frozen Treats',
      presets: SPLASH_PRESETS_ADMIN.filter((p) =>
        p.recommendedFor.some((r) => /frozen|paleta|ice/i.test(r))
      ).map(mapSplashForPicker),
    },
    {
      group_name: 'Premium & Special',
      presets: SPLASH_PRESETS_ADMIN.filter((p) => p.premium).map(mapSplashForPicker),
    },
  ];
}

/**
 * Groups glows by intensity
 */
export function getGlowsGroupedByIntensity(): GroupedPresets<GlowPickerItem>[] {
  return [
    {
      group_name: 'Subtle (60-65%)',
      presets: GLOW_PRESETS_ADMIN.filter((p) => p.glow_intensity <= 65).map(mapGlowForPicker),
    },
    {
      group_name: 'Moderate (70-75%)',
      presets: GLOW_PRESETS_ADMIN.filter(
        (p) => p.glow_intensity > 65 && p.glow_intensity <= 75
      ).map(mapGlowForPicker),
    },
    {
      group_name: 'Bold (80%+)',
      presets: GLOW_PRESETS_ADMIN.filter((p) => p.glow_intensity > 75).map(mapGlowForPicker),
    },
  ];
}
