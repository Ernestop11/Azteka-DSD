/**
 * Admin Preset Picker - Zod Schemas
 *
 * Complete schemas for visual preset selection in Admin UI.
 * Includes full metadata for all 17 gradients, 6 splashes, 5 glows.
 *
 * Metadata includes:
 * - id: unique identifier
 * - label: human-readable name
 * - description: usage guidance
 * - season: seasonal applicability
 * - recommendedFor: product categories/brands
 * - contrast: text readability (high/medium/low)
 * - animation: suggested animation intensity
 */

import { z } from 'zod';

// ============================================================================
// BASE PRESET SCHEMAS
// ============================================================================

export const SeasonalThemeSchema = z.enum([
  'halloween',
  'dia-de-muertos',
  'christmas',
  'valentine',
  'easter',
  'summer',
  'spring',
  'fall',
  'winter',
]);

export const ContrastLevelSchema = z.enum(['high', 'medium', 'low']);

export const AnimationIntensitySchema = z.enum(['none', 'subtle', 'moderate', 'bold']);

// ============================================================================
// GRADIENT PRESET SCHEMA
// ============================================================================

export const GradientPresetMetadataSchema = z.object({
  id: z.string(),
  label: z.string(),
  description: z.string(),

  // Visual properties
  classes: z.string(), // Tailwind classes
  rgb: z.string(), // CSS gradient

  // Categorization
  season: z.array(SeasonalThemeSchema).optional(),
  recommendedFor: z.array(z.string()), // Categories, brands, product types

  // UI guidance
  contrast: ContrastLevelSchema,
  animation: AnimationIntensitySchema,

  // Color palette
  primary_color: z.string(), // Hex color
  accent_color: z.string(), // Hex color

  // Usage stats
  popularity: z.number().min(0).max(100).optional(),
  premium: z.boolean().default(false),
});

export type GradientPresetMetadata = z.infer<typeof GradientPresetMetadataSchema>;

export const GRADIENT_PRESETS_ADMIN: GradientPresetMetadata[] = [
  {
    id: 'candy-dream',
    label: 'Candy Dream',
    description: 'Warm candy-inspired gradient perfect for dulces and sweets',
    classes: 'from-amber-200 via-orange-300 to-rose-400',
    rgb: 'linear-gradient(135deg, #fde68a 0%, #fdba74 50%, #fb7185 100%)',
    season: ['halloween', 'easter'],
    recommendedFor: ['Candy', 'Dulces', 'Lollipops', 'Gummies', 'Mixed Candy'],
    contrast: 'high',
    animation: 'moderate',
    primary_color: '#fb7185',
    accent_color: '#fdba74',
    popularity: 95,
    premium: false,
  },
  {
    id: 'mint-grove',
    label: 'Mint Grove',
    description: 'Fresh minty greens for gum and mint products',
    classes: 'from-lime-200 via-emerald-300 to-teal-400',
    rgb: 'linear-gradient(135deg, #d9f99d 0%, #6ee7b7 50%, #2dd4bf 100%)',
    season: ['spring'],
    recommendedFor: ['Gum', 'Mints', 'Herbal', 'Menthol', 'Fresh'],
    contrast: 'high',
    animation: 'subtle',
    primary_color: '#2dd4bf',
    accent_color: '#6ee7b7',
    popularity: 78,
    premium: false,
  },
  {
    id: 'ocean-breeze',
    label: 'Ocean Breeze',
    description: 'Cool blue gradient for water and blue raspberry',
    classes: 'from-sky-200 via-blue-300 to-indigo-400',
    rgb: 'linear-gradient(135deg, #bae6fd 0%, #93c5fd 50%, #818cf8 100%)',
    season: ['summer'],
    recommendedFor: ['Water', 'Beverages', 'Blue Raspberry', 'Sodas', 'Sports Drinks'],
    contrast: 'high',
    animation: 'moderate',
    primary_color: '#818cf8',
    accent_color: '#93c5fd',
    popularity: 82,
    premium: false,
  },
  {
    id: 'rose-garden',
    label: 'Rose Garden',
    description: 'Romantic pink gradient for strawberry and floral flavors',
    classes: 'from-rose-200 via-pink-200 to-fuchsia-300',
    rgb: 'linear-gradient(135deg, #fecdd3 0%, #fbcfe8 50%, #f0abfc 100%)',
    season: ['valentine'],
    recommendedFor: ['Strawberry', 'Cherry', 'Bubble Gum', 'Pink Lemonade', 'Floral'],
    contrast: 'high',
    animation: 'moderate',
    primary_color: '#f0abfc',
    accent_color: '#fbcfe8',
    popularity: 88,
    premium: false,
  },
  {
    id: 'sunshine',
    label: 'Sunshine',
    description: 'Bright citrus yellow for lemon and tropical',
    classes: 'from-yellow-200 via-amber-200 to-orange-300',
    rgb: 'linear-gradient(135deg, #fef08a 0%, #fde68a 50%, #fdba74 100%)',
    season: ['summer'],
    recommendedFor: ['Lemon', 'Pineapple', 'Mango', 'Tropical', 'Citrus'],
    contrast: 'high',
    animation: 'bold',
    primary_color: '#fdba74',
    accent_color: '#fef08a',
    popularity: 90,
    premium: false,
  },
  {
    id: 'sunset-glow',
    label: 'Sunset Glow',
    description: 'Warm sunset tones for spicy and tamarind products',
    classes: 'from-red-200 via-rose-300 to-amber-200',
    rgb: 'linear-gradient(135deg, #fecaca 0%, #fda4af 50%, #fde68a 100%)',
    season: [],
    recommendedFor: ['Tamarind', 'Spicy Candy', 'Chamoy', 'Hot Snacks', 'Chili'],
    contrast: 'high',
    animation: 'moderate',
    primary_color: '#fda4af',
    accent_color: '#fde68a',
    popularity: 75,
    premium: false,
  },
  {
    id: 'forest-fresh',
    label: 'Forest Fresh',
    description: 'Natural green gradient for lime and herbal',
    classes: 'from-emerald-200 via-green-300 to-lime-200',
    rgb: 'linear-gradient(135deg, #a7f3d0 0%, #86efac 50%, #d9f99d 100%)',
    season: ['spring'],
    recommendedFor: ['Lime', 'Green Apple', 'Matcha', 'Herbal Tea', 'Natural'],
    contrast: 'high',
    animation: 'subtle',
    primary_color: '#86efac',
    accent_color: '#d9f99d',
    popularity: 70,
    premium: false,
  },
  {
    id: 'tropical-sea',
    label: 'Tropical Sea',
    description: 'Aqua blues for coconut and tropical drinks',
    classes: 'from-cyan-200 via-teal-300 to-emerald-300',
    rgb: 'linear-gradient(135deg, #a5f3fc 0%, #5eead4 50%, #6ee7b7 100%)',
    season: ['summer'],
    recommendedFor: ['Coconut', 'Tropical Drinks', 'Aguas Frescas', 'Paletas', 'Beach Vibes'],
    contrast: 'high',
    animation: 'moderate',
    primary_color: '#5eead4',
    accent_color: '#6ee7b7',
    popularity: 85,
    premium: false,
  },
  {
    id: 'berry-bliss',
    label: 'Berry Bliss',
    description: 'Purple berry gradient for grape and mixed fruit',
    classes: 'from-purple-200 via-fuchsia-300 to-pink-300',
    rgb: 'linear-gradient(135deg, #e9d5ff 0%, #f0abfc 50%, #f9a8d4 100%)',
    season: [],
    recommendedFor: ['Grape', 'Mixed Berry', 'Acai', 'Fruit Punch', 'Purple Drinks'],
    contrast: 'high',
    animation: 'moderate',
    primary_color: '#f0abfc',
    accent_color: '#f9a8d4',
    popularity: 80,
    premium: false,
  },
  {
    id: 'twilight',
    label: 'Twilight',
    description: 'Deep blue-purple for blueberry and mystery flavors',
    classes: 'from-blue-200 via-indigo-300 to-purple-300',
    rgb: 'linear-gradient(135deg, #bfdbfe 0%, #a5b4fc 50%, #d8b4fe 100%)',
    season: [],
    recommendedFor: ['Blueberry', 'Mystery Flavor', 'Midnight Snacks', 'Dark Chocolate'],
    contrast: 'medium',
    animation: 'subtle',
    primary_color: '#a5b4fc',
    accent_color: '#d8b4fe',
    popularity: 65,
    premium: true,
  },
  {
    id: 'spring-meadow',
    label: 'Spring Meadow',
    description: 'Light pastel gradient for organic and natural products',
    classes: 'from-amber-100 via-lime-200 to-emerald-200',
    rgb: 'linear-gradient(135deg, #fef3c7 0%, #d9f99d 50%, #a7f3d0 100%)',
    season: ['spring'],
    recommendedFor: ['Organic', 'Natural', 'Light Snacks', 'Health Foods', 'Fresh'],
    contrast: 'high',
    animation: 'subtle',
    primary_color: '#d9f99d',
    accent_color: '#a7f3d0',
    popularity: 60,
    premium: false,
  },
  {
    id: 'cherry-pop',
    label: 'Cherry Pop',
    description: 'Soft pink-red for cherry and strawberry',
    classes: 'from-pink-100 via-rose-200 to-red-200',
    rgb: 'linear-gradient(135deg, #fce7f3 0%, #fecdd3 50%, #fecaca 100%)',
    season: [],
    recommendedFor: ['Cherry', 'Strawberry', 'Watermelon', 'Pink Lemonade'],
    contrast: 'high',
    animation: 'moderate',
    primary_color: '#fecdd3',
    accent_color: '#fecaca',
    popularity: 85,
    premium: false,
  },
  {
    id: 'steel-gray',
    label: 'Steel Gray',
    description: 'Neutral gray for classic and cola flavors',
    classes: 'from-slate-100 via-gray-200 to-zinc-200',
    rgb: 'linear-gradient(135deg, #f1f5f9 0%, #e5e7eb 50%, #e4e4e7 100%)',
    season: [],
    recommendedFor: ['Cola', 'Root Beer', 'Classic Sodas', 'Neutral Products'],
    contrast: 'high',
    animation: 'none',
    primary_color: '#e5e7eb',
    accent_color: '#e4e4e7',
    popularity: 55,
    premium: false,
  },
  {
    id: 'golden-hour',
    label: 'Golden Hour',
    description: 'Warm golden gradient for caramel and butterscotch',
    classes: 'from-orange-100 via-amber-200 to-yellow-200',
    rgb: 'linear-gradient(135deg, #ffedd5 0%, #fde68a 50%, #fef08a 100%)',
    season: ['fall'],
    recommendedFor: ['Caramel', 'Butterscotch', 'Honey', 'Dulce de Leche', 'Premium Sweets'],
    contrast: 'high',
    animation: 'subtle',
    primary_color: '#fde68a',
    accent_color: '#fef08a',
    popularity: 72,
    premium: true,
  },
  {
    id: 'arctic-blue',
    label: 'Arctic Blue',
    description: 'Icy blue gradient for mint ice cream and frozen treats',
    classes: 'from-teal-100 via-cyan-200 to-blue-200',
    rgb: 'linear-gradient(135deg, #ccfbf1 0%, #a5f3fc 50%, #bfdbfe 100%)',
    season: ['winter'],
    recommendedFor: ['Ice Cream', 'Frozen Treats', 'Mint Ice', 'Popsicles', 'Winter Products'],
    contrast: 'high',
    animation: 'subtle',
    primary_color: '#a5f3fc',
    accent_color: '#bfdbfe',
    popularity: 68,
    premium: false,
  },
  {
    id: 'citrus-splash',
    label: 'Citrus Splash',
    description: 'Mixed citrus gradient for fruit punch and variety packs',
    classes: 'from-lime-100 via-amber-100 to-rose-100',
    rgb: 'linear-gradient(135deg, #ecfccb 0%, #fef3c7 50%, #ffe4e6 100%)',
    season: ['summer'],
    recommendedFor: ['Fruit Punch', 'Mixed Citrus', 'Variety Packs', 'Multi-Flavor'],
    contrast: 'high',
    animation: 'moderate',
    primary_color: '#fef3c7',
    accent_color: '#ffe4e6',
    popularity: 77,
    premium: false,
  },
  {
    id: 'coastal-mist',
    label: 'Coastal Mist',
    description: 'Refreshing aqua-green for cucumber and agua fresca',
    classes: 'from-emerald-100 via-teal-200 to-cyan-200',
    rgb: 'linear-gradient(135deg, #d1fae5 0%, #99f6e4 50%, #a5f3fc 100%)',
    season: ['summer'],
    recommendedFor: ['Cucumber', 'Aguas Frescas', 'Spa Water', 'Light Beverages'],
    contrast: 'high',
    animation: 'subtle',
    primary_color: '#99f6e4',
    accent_color: '#a5f3fc',
    popularity: 62,
    premium: false,
  },
];

// ============================================================================
// SPLASH PRESET SCHEMA
// ============================================================================

export const SplashPresetMetadataSchema = z.object({
  id: z.string(),
  label: z.string(),
  description: z.string(),

  // Visual properties
  overlay_url: z.string(),
  preview_svg: z.string().optional(), // Inline SVG for admin preview

  // Categorization
  season: z.array(SeasonalThemeSchema).optional(),
  recommendedFor: z.array(z.string()),

  // UI guidance
  contrast: ContrastLevelSchema,
  animation: AnimationIntensitySchema,

  // Usage stats
  popularity: z.number().min(0).max(100).optional(),
  premium: z.boolean().default(false),
});

export type SplashPresetMetadata = z.infer<typeof SplashPresetMetadataSchema>;

export const SPLASH_PRESETS_ADMIN: SplashPresetMetadata[] = [
  {
    id: 'paleta-drip',
    label: 'Paleta Drip',
    description: 'Watercolor drip effect for popsicles and frozen treats',
    overlay_url: '/overlays/paleta-drip.png',
    preview_svg: '<svg viewBox="0 0 100 100"><path d="M50,10 Q30,40 50,70 Q70,40 50,10" fill="url(#paleta-gradient)"/></svg>',
    season: ['summer'],
    recommendedFor: ['Paletas', 'Popsicles', 'Frozen Treats', 'Ice Cream', 'Summer Specials'],
    contrast: 'low',
    animation: 'bold',
    popularity: 92,
    premium: false,
  },
  {
    id: 'aguas-splash',
    label: 'Aguas Frescas Splash',
    description: 'Liquid splash effect for beverages and drinks',
    overlay_url: '/overlays/aguas-frescas.png',
    preview_svg: '<svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="30" fill="url(#agua-gradient)" opacity="0.7"/></svg>',
    season: ['summer'],
    recommendedFor: ['Aguas Frescas', 'Beverages', 'Drinks', 'Sodas', 'Juices'],
    contrast: 'medium',
    animation: 'moderate',
    popularity: 88,
    premium: false,
  },
  {
    id: 'dulceria-confetti',
    label: 'Dulcería Confetti',
    description: 'Festive confetti burst for candy and variety packs',
    overlay_url: '/overlays/dulceria-confetti.png',
    preview_svg: '<svg viewBox="0 0 100 100"><g><circle cx="20" cy="30" r="3" fill="#ff6b9d"/><circle cx="70" cy="40" r="4" fill="#ffd93d"/></g></svg>',
    season: ['halloween', 'dia-de-muertos'],
    recommendedFor: ['Candy', 'Dulces', 'Variety Packs', 'Party Favors', 'Bundles'],
    contrast: 'medium',
    animation: 'bold',
    popularity: 95,
    premium: false,
  },
  {
    id: 'neon-soda',
    label: 'Neon Soda Burst',
    description: 'Electric neon fizz for specialty sodas and energy drinks',
    overlay_url: '/overlays/neon-soda.png',
    preview_svg: '<svg viewBox="0 0 100 100"><path d="M50,20 L50,80" stroke="url(#neon)" stroke-width="8" opacity="0.9"/></svg>',
    season: [],
    recommendedFor: ['Sodas', 'Energy Drinks', 'Specialty Beverages', 'Neon Brands'],
    contrast: 'low',
    animation: 'bold',
    popularity: 78,
    premium: true,
  },
  {
    id: 'tamarind-splash',
    label: 'Tamarind Splash',
    description: 'Bold powder splash for spicy and tamarind candy',
    overlay_url: '/overlays/tamarind-splash.png',
    preview_svg: '<svg viewBox="0 0 100 100"><path d="M30,50 Q50,20 70,50 Q50,80 30,50" fill="#d97706" opacity="0.6"/></svg>',
    season: [],
    recommendedFor: ['Tamarind', 'Spicy Candy', 'Chamoy', 'Hot Snacks', 'Chili Products'],
    contrast: 'medium',
    animation: 'moderate',
    popularity: 82,
    premium: false,
  },
  {
    id: 'sparkling-powder',
    label: 'Sparkling Powder',
    description: 'Glitter dust overlay for premium and featured bundles',
    overlay_url: '/overlays/sparkling-powder.png',
    preview_svg: '<svg viewBox="0 0 100 100"><g><circle cx="30" cy="30" r="2" fill="#fbbf24" opacity="0.8"/><circle cx="70" cy="60" r="1.5" fill="#fcd34d"/></g></svg>',
    season: ['christmas', 'valentine'],
    recommendedFor: ['Premium', 'Featured', 'Special Edition', 'Luxury Bundles', 'Holiday Specials'],
    contrast: 'medium',
    animation: 'subtle',
    popularity: 70,
    premium: true,
  },
];

// ============================================================================
// GLOW PRESET SCHEMA
// ============================================================================

export const GlowPresetMetadataSchema = z.object({
  id: z.string(),
  label: z.string(),
  description: z.string(),

  // Visual properties
  shadow_classes: z.string(), // Tailwind shadow utilities
  css_shadow: z.string(), // CSS box-shadow value

  // Color info
  primary_color: z.string(),
  glow_intensity: z.number().min(0).max(100),

  // Categorization
  recommendedFor: z.array(z.string()),

  // UI guidance
  animation: AnimationIntensitySchema,

  // Usage stats
  popularity: z.number().min(0).max(100).optional(),
  premium: z.boolean().default(false),
});

export type GlowPresetMetadata = z.infer<typeof GlowPresetMetadataSchema>;

export const GLOW_PRESETS_ADMIN: GlowPresetMetadata[] = [
  {
    id: 'citrus-pop',
    label: 'Citrus Pop',
    description: 'Warm orange glow for citrus and tropical products',
    shadow_classes: 'shadow-[0_15px_45px_rgba(251,191,36,0.45)] drop-shadow-[0_0_25px_rgba(249,115,22,0.65)]',
    css_shadow: '0 15px 45px rgba(251,191,36,0.45), 0 0 25px rgba(249,115,22,0.65)',
    primary_color: '#fb923c',
    glow_intensity: 75,
    recommendedFor: ['Orange', 'Lemon', 'Citrus', 'Tropical', 'Sunshine flavors'],
    animation: 'moderate',
    popularity: 88,
    premium: false,
  },
  {
    id: 'cool-blue',
    label: 'Cool Blue',
    description: 'Cool blue glow for water and blue raspberry',
    shadow_classes: 'shadow-[0_18px_60px_rgba(59,130,246,0.35)] drop-shadow-[0_0_35px_rgba(14,165,233,0.5)]',
    css_shadow: '0 18px 60px rgba(59,130,246,0.35), 0 0 35px rgba(14,165,233,0.5)',
    primary_color: '#3b82f6',
    glow_intensity: 70,
    recommendedFor: ['Blue Raspberry', 'Water', 'Ice', 'Cool Beverages'],
    animation: 'subtle',
    popularity: 85,
    premium: false,
  },
  {
    id: 'sugar-rush',
    label: 'Sugar Rush',
    description: 'Pink glow for candy and bubblegum',
    shadow_classes: 'shadow-[0_12px_35px_rgba(236,72,153,0.4)] drop-shadow-[0_0_30px_rgba(244,114,182,0.45)]',
    css_shadow: '0 12px 35px rgba(236,72,153,0.4), 0 0 30px rgba(244,114,182,0.45)',
    primary_color: '#ec4899',
    glow_intensity: 65,
    recommendedFor: ['Candy', 'Bubblegum', 'Sweet Treats', 'Pink Flavors'],
    animation: 'bold',
    popularity: 92,
    premium: false,
  },
  {
    id: 'botanical',
    label: 'Botanical',
    description: 'Green glow for lime, mint, and herbal products',
    shadow_classes: 'shadow-[0_12px_40px_rgba(34,197,94,0.35)] drop-shadow-[0_0_28px_rgba(16,185,129,0.45)]',
    css_shadow: '0 12px 40px rgba(34,197,94,0.35), 0 0 28px rgba(16,185,129,0.45)',
    primary_color: '#22c55e',
    glow_intensity: 60,
    recommendedFor: ['Lime', 'Mint', 'Herbal', 'Green Apple', 'Natural'],
    animation: 'subtle',
    popularity: 75,
    premium: false,
  },
  {
    id: 'midnight',
    label: 'Midnight Glow',
    description: 'Premium dark glow for featured and luxury products',
    shadow_classes: 'shadow-[0_18px_60px_rgba(15,23,42,0.4)] drop-shadow-[0_0_30px_rgba(59,130,246,0.4)]',
    css_shadow: '0 18px 60px rgba(15,23,42,0.4), 0 0 30px rgba(59,130,246,0.4)',
    primary_color: '#1e293b',
    glow_intensity: 80,
    recommendedFor: ['Premium', 'Featured', 'Dark Chocolate', 'Luxury', 'Mystery Flavors'],
    animation: 'subtle',
    popularity: 68,
    premium: true,
  },
];

// ============================================================================
// ADMIN FORM SCHEMAS
// ============================================================================

export const AdminVisualPresetFormSchema = z.object({
  // Preset selection
  visual_preset: z.string().optional().nullable(),
  glow_preset: z.string().optional().nullable(),
  splash_preset: z.string().optional().nullable(),

  // Custom overrides
  background_color: z.string().regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/).optional().nullable(),
  background_gradient: z.string().optional().nullable(),
  text_color: z.string().regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/).optional().nullable(),
  splash_overlay: z.string().url().optional().nullable(),

  // Enhancement flags
  featured: z.boolean().default(false),
  seasonal: z.boolean().default(false),
  new_arrival: z.boolean().default(false),
  trending: z.boolean().default(false),

  // Seasonal metadata
  seasonal_start: z.string().datetime().optional().nullable(),
  seasonal_end: z.string().datetime().optional().nullable(),
  seasonal_theme: SeasonalThemeSchema.optional().nullable(),
});

export type AdminVisualPresetForm = z.infer<typeof AdminVisualPresetFormSchema>;

// ============================================================================
// PRESET VALIDATION HELPERS
// ============================================================================

export function validateGradientPreset(id: string): GradientPresetMetadata | null {
  return GRADIENT_PRESETS_ADMIN.find((p) => p.id === id) || null;
}

export function validateSplashPreset(id: string): SplashPresetMetadata | null {
  return SPLASH_PRESETS_ADMIN.find((p) => p.id === id) || null;
}

export function validateGlowPreset(id: string): GlowPresetMetadata | null {
  return GLOW_PRESETS_ADMIN.find((p) => p.id === id) || null;
}

export function getPresetsByCategory(category: string): {
  gradients: GradientPresetMetadata[];
  splashes: SplashPresetMetadata[];
  glows: GlowPresetMetadata[];
} {
  const categoryLower = category.toLowerCase();

  return {
    gradients: GRADIENT_PRESETS_ADMIN.filter((p) =>
      p.recommendedFor.some((rec) => rec.toLowerCase().includes(categoryLower))
    ),
    splashes: SPLASH_PRESETS_ADMIN.filter((p) =>
      p.recommendedFor.some((rec) => rec.toLowerCase().includes(categoryLower))
    ),
    glows: GLOW_PRESETS_ADMIN.filter((p) =>
      p.recommendedFor.some((rec) => rec.toLowerCase().includes(categoryLower))
    ),
  };
}

export function getPresetsBySeason(season: z.infer<typeof SeasonalThemeSchema>): {
  gradients: GradientPresetMetadata[];
  splashes: SplashPresetMetadata[];
} {
  return {
    gradients: GRADIENT_PRESETS_ADMIN.filter((p) => p.season?.includes(season)),
    splashes: SPLASH_PRESETS_ADMIN.filter((p) => p.season?.includes(season)),
  };
}
