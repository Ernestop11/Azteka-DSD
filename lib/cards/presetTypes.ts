/**
 * Visual Card Engine - Type Definitions
 *
 * Complete TypeScript types for the 7-layer composition system:
 * animations → interactive → content → image → splash → glow → gradient → structure
 *
 * These types are used by the resolver functions to ensure type-safe
 * visual property resolution with proper priority hierarchies.
 */

import { z } from 'zod';

// ============================================================================
// PRODUCT SCHEMA (subset for visual rendering)
// ============================================================================

export const VisualProductSchema = z.object({
  // Core identifiers
  sku: z.string(),
  name: z.string(),

  // Pricing
  price_case: z.number().positive(),
  price_unit: z.number().positive().optional().nullable(),

  // Relationships
  category_id: z.number().int().positive(),
  brand_id: z.number().int().positive().optional().nullable(),

  // Visual field mappings (from card-template-wiring.md)
  background_color: z.string().optional().nullable(),
  background_gradient: z.string().optional().nullable(),
  text_color: z.string().optional().nullable(),

  visual_preset: z.string().optional().nullable(),
  glow_preset: z.string().optional().nullable(),
  splash_overlay: z.string().optional().nullable(),

  // Enhancement flags
  featured: z.boolean().default(false),
  seasonal: z.boolean().default(false),
  new_arrival: z.boolean().default(false),
  trending: z.boolean().default(false),

  // Seasonal metadata
  seasonal_start: z.string().optional().nullable(),
  seasonal_end: z.string().optional().nullable(),
  seasonal_theme: z.string().optional().nullable(),

  // Media
  image_url: z.string().url().optional().nullable(),
  thumbnail_url: z.string().url().optional().nullable(),

  // Metadata
  created_at: z.date().optional(),
  updated_at: z.date().optional(),
});

export type VisualProduct = z.infer<typeof VisualProductSchema>;

// ============================================================================
// PRESET DEFINITIONS
// ============================================================================

export type GradientPresetId =
  | 'candy-dream'
  | 'mint-grove'
  | 'ocean-breeze'
  | 'rose-garden'
  | 'sunshine'
  | 'sunset-glow'
  | 'forest-fresh'
  | 'tropical-sea'
  | 'berry-bliss'
  | 'twilight'
  | 'spring-meadow'
  | 'cherry-pop'
  | 'steel-gray'
  | 'golden-hour'
  | 'arctic-blue'
  | 'citrus-splash'
  | 'coastal-mist';

export type SplashPresetId =
  | 'paleta-drip'
  | 'aguas-splash'
  | 'dulceria-confetti'
  | 'neon-soda'
  | 'tamarind-splash'
  | 'sparkling-powder';

export type GlowPresetId =
  | 'citrus-pop'
  | 'cool-blue'
  | 'sugar-rush'
  | 'botanical'
  | 'midnight';

export type CardThemeId = 'basic' | 'gradient' | 'splash';

export type SeasonalTheme =
  | 'halloween'
  | 'dia-de-muertos'
  | 'christmas'
  | 'valentine'
  | 'easter'
  | 'summer'
  | 'spring'
  | 'fall'
  | 'winter';

// ============================================================================
// GRADIENT PRESET DEFINITIONS
// ============================================================================

export interface GradientPreset {
  id: GradientPresetId;
  name: string;
  classes: string;
  rgb: string; // CSS gradient for inline styles
  category_hint?: string;
  seasonal?: SeasonalTheme[];
}

export const GRADIENT_CATALOG: Record<GradientPresetId, GradientPreset> = {
  'candy-dream': {
    id: 'candy-dream',
    name: 'Candy Dream',
    classes: 'from-amber-200 via-orange-300 to-rose-400',
    rgb: 'linear-gradient(135deg, #fde68a 0%, #fdba74 50%, #fb7185 100%)',
    category_hint: 'candy, dulces, sweets',
    seasonal: ['halloween', 'easter'],
  },
  'mint-grove': {
    id: 'mint-grove',
    name: 'Mint Grove',
    classes: 'from-lime-200 via-emerald-300 to-teal-400',
    rgb: 'linear-gradient(135deg, #d9f99d 0%, #6ee7b7 50%, #2dd4bf 100%)',
    category_hint: 'gum, mint, fresh',
  },
  'ocean-breeze': {
    id: 'ocean-breeze',
    name: 'Ocean Breeze',
    classes: 'from-sky-200 via-blue-300 to-indigo-400',
    rgb: 'linear-gradient(135deg, #bae6fd 0%, #93c5fd 50%, #818cf8 100%)',
    category_hint: 'water, beverages, sodas',
  },
  'rose-garden': {
    id: 'rose-garden',
    name: 'Rose Garden',
    classes: 'from-rose-200 via-pink-200 to-fuchsia-300',
    rgb: 'linear-gradient(135deg, #fecdd3 0%, #fbcfe8 50%, #f0abfc 100%)',
    category_hint: 'strawberry, floral',
    seasonal: ['valentine'],
  },
  'sunshine': {
    id: 'sunshine',
    name: 'Sunshine',
    classes: 'from-yellow-200 via-amber-200 to-orange-300',
    rgb: 'linear-gradient(135deg, #fef08a 0%, #fde68a 50%, #fdba74 100%)',
    category_hint: 'lemon, tropical',
    seasonal: ['summer'],
  },
  'sunset-glow': {
    id: 'sunset-glow',
    name: 'Sunset Glow',
    classes: 'from-red-200 via-rose-300 to-amber-200',
    rgb: 'linear-gradient(135deg, #fecaca 0%, #fda4af 50%, #fde68a 100%)',
    category_hint: 'spicy, hot, tamarind',
  },
  'forest-fresh': {
    id: 'forest-fresh',
    name: 'Forest Fresh',
    classes: 'from-emerald-200 via-green-300 to-lime-200',
    rgb: 'linear-gradient(135deg, #a7f3d0 0%, #86efac 50%, #d9f99d 100%)',
    category_hint: 'lime, herbal, matcha',
  },
  'tropical-sea': {
    id: 'tropical-sea',
    name: 'Tropical Sea',
    classes: 'from-cyan-200 via-teal-300 to-emerald-300',
    rgb: 'linear-gradient(135deg, #a5f3fc 0%, #5eead4 50%, #6ee7b7 100%)',
    category_hint: 'coconut, pineapple',
    seasonal: ['summer'],
  },
  'berry-bliss': {
    id: 'berry-bliss',
    name: 'Berry Bliss',
    classes: 'from-purple-200 via-fuchsia-300 to-pink-300',
    rgb: 'linear-gradient(135deg, #e9d5ff 0%, #f0abfc 50%, #f9a8d4 100%)',
    category_hint: 'grape, berry, mixed fruit',
  },
  'twilight': {
    id: 'twilight',
    name: 'Twilight',
    classes: 'from-blue-200 via-indigo-300 to-purple-300',
    rgb: 'linear-gradient(135deg, #bfdbfe 0%, #a5b4fc 50%, #d8b4fe 100%)',
    category_hint: 'blueberry, mystery flavor',
  },
  'spring-meadow': {
    id: 'spring-meadow',
    name: 'Spring Meadow',
    classes: 'from-amber-100 via-lime-200 to-emerald-200',
    rgb: 'linear-gradient(135deg, #fef3c7 0%, #d9f99d 50%, #a7f3d0 100%)',
    category_hint: 'light, fresh, organic',
    seasonal: ['spring'],
  },
  'cherry-pop': {
    id: 'cherry-pop',
    name: 'Cherry Pop',
    classes: 'from-pink-100 via-rose-200 to-red-200',
    rgb: 'linear-gradient(135deg, #fce7f3 0%, #fecdd3 50%, #fecaca 100%)',
    category_hint: 'cherry, strawberry',
  },
  'steel-gray': {
    id: 'steel-gray',
    name: 'Steel Gray',
    classes: 'from-slate-100 via-gray-200 to-zinc-200',
    rgb: 'linear-gradient(135deg, #f1f5f9 0%, #e5e7eb 50%, #e4e4e7 100%)',
    category_hint: 'neutral, classic, cola',
  },
  'golden-hour': {
    id: 'golden-hour',
    name: 'Golden Hour',
    classes: 'from-orange-100 via-amber-200 to-yellow-200',
    rgb: 'linear-gradient(135deg, #ffedd5 0%, #fde68a 50%, #fef08a 100%)',
    category_hint: 'caramel, honey, butterscotch',
  },
  'arctic-blue': {
    id: 'arctic-blue',
    name: 'Arctic Blue',
    classes: 'from-teal-100 via-cyan-200 to-blue-200',
    rgb: 'linear-gradient(135deg, #ccfbf1 0%, #a5f3fc 50%, #bfdbfe 100%)',
    category_hint: 'ice, mint ice cream',
    seasonal: ['winter'],
  },
  'citrus-splash': {
    id: 'citrus-splash',
    name: 'Citrus Splash',
    classes: 'from-lime-100 via-amber-100 to-rose-100',
    rgb: 'linear-gradient(135deg, #ecfccb 0%, #fef3c7 50%, #ffe4e6 100%)',
    category_hint: 'mixed citrus, fruit punch',
  },
  'coastal-mist': {
    id: 'coastal-mist',
    name: 'Coastal Mist',
    classes: 'from-emerald-100 via-teal-200 to-cyan-200',
    rgb: 'linear-gradient(135deg, #d1fae5 0%, #99f6e4 50%, #a5f3fc 100%)',
    category_hint: 'cucumber, agua fresca',
  },
};

// ============================================================================
// SPLASH PRESET DEFINITIONS
// ============================================================================

export interface SplashPreset {
  id: SplashPresetId;
  label: string;
  hint: string;
  overlay_url: string;
  category_hint?: string;
  seasonal?: SeasonalTheme[];
}

export const SPLASH_CATALOG: Record<SplashPresetId, SplashPreset> = {
  'paleta-drip': {
    id: 'paleta-drip',
    label: 'Paleta Drip',
    hint: 'Use for popsicles and frozen treats; upload watercolor drip overlays.',
    overlay_url: '/overlays/paleta-drip.png',
    category_hint: 'paletas, popsicles, frozen',
    seasonal: ['summer'],
  },
  'aguas-splash': {
    id: 'aguas-splash',
    label: 'Aguas Frescas Splash',
    hint: 'Great for beverages and agua fresca menu cards.',
    overlay_url: '/overlays/aguas-frescas.png',
    category_hint: 'beverages, agua fresca, drinks',
  },
  'dulceria-confetti': {
    id: 'dulceria-confetti',
    label: 'Dulcería Confetti',
    hint: 'Candy bursts and confetti overlays for snack bundles.',
    overlay_url: '/overlays/dulceria-confetti.png',
    category_hint: 'candy, dulces, variety packs',
    seasonal: ['halloween', 'dia-de-muertos'],
  },
  'neon-soda': {
    id: 'neon-soda',
    label: 'Neon Soda Burst',
    hint: 'Highlights specialty sodas with neon fizz effects.',
    overlay_url: '/overlays/neon-soda.png',
    category_hint: 'sodas, energy drinks, specialty beverages',
  },
  'tamarind-splash': {
    id: 'tamarind-splash',
    label: 'Tamarind Splash',
    hint: 'Bold tamarind powder splash for spicy candy.',
    overlay_url: '/overlays/tamarind-splash.png',
    category_hint: 'spicy, tamarind, chamoy',
  },
  'sparkling-powder': {
    id: 'sparkling-powder',
    label: 'Sparkling Powder',
    hint: 'Glitter dust overlay for premium bundles.',
    overlay_url: '/overlays/sparkling-powder.png',
    category_hint: 'premium, featured, special edition',
  },
};

// ============================================================================
// GLOW PRESET DEFINITIONS
// ============================================================================

export interface GlowPreset {
  id: GlowPresetId;
  label: string;
  classes: string;
  css_filter?: string;
  category_hint?: string;
}

export const GLOW_CATALOG: Record<GlowPresetId, GlowPreset> = {
  'citrus-pop': {
    id: 'citrus-pop',
    label: 'Citrus Pop',
    classes: 'shadow-[0_15px_45px_rgba(251,191,36,0.45)] drop-shadow-[0_0_25px_rgba(249,115,22,0.65)]',
    category_hint: 'orange, lemon, citrus',
  },
  'cool-blue': {
    id: 'cool-blue',
    label: 'Cool Blue',
    classes: 'shadow-[0_18px_60px_rgba(59,130,246,0.35)] drop-shadow-[0_0_35px_rgba(14,165,233,0.5)]',
    category_hint: 'blue raspberry, ice',
  },
  'sugar-rush': {
    id: 'sugar-rush',
    label: 'Sugar Rush',
    classes: 'shadow-[0_12px_35px_rgba(236,72,153,0.4)] drop-shadow-[0_0_30px_rgba(244,114,182,0.45)]',
    category_hint: 'candy, sweets, bubblegum',
  },
  'botanical': {
    id: 'botanical',
    label: 'Botanical',
    classes: 'shadow-[0_12px_40px_rgba(34,197,94,0.35)] drop-shadow-[0_0_28px_rgba(16,185,129,0.45)]',
    category_hint: 'lime, mint, herbal',
  },
  'midnight': {
    id: 'midnight',
    label: 'Midnight Glow',
    classes: 'shadow-[0_18px_60px_rgba(15,23,42,0.4)] drop-shadow-[0_0_30px_rgba(59,130,246,0.4)]',
    category_hint: 'premium, dark chocolate, mystery',
  },
};

// ============================================================================
// RESOLVED VISUAL OUTPUT
// ============================================================================

export interface ResolvedGradient {
  source: 'custom' | 'auto' | 'preset' | 'default';
  gradient: string; // CSS gradient value
  classes?: string; // Tailwind classes (optional)
  preset_id?: GradientPresetId;
}

export interface ResolvedSplash {
  enabled: boolean;
  source: 'custom' | 'preset' | 'seasonal' | 'none';
  overlay_url?: string;
  preset_id?: SplashPresetId;
  seasonal_theme?: SeasonalTheme;
}

export interface ResolvedGlow {
  enabled: boolean;
  source: 'featured' | 'preset' | 'auto' | 'none';
  classes?: string;
  preset_id?: GlowPresetId;
}

export interface AnimationFlags {
  enable_hover_lift: boolean;
  enable_glow_pulse: boolean;
  enable_image_zoom: boolean;
  enable_badge_bounce: boolean;
  hover_scale: number;
}

export interface ResolvedVisualPreset {
  theme: CardThemeId;
  gradient: ResolvedGradient;
  splash: ResolvedSplash;
  glow: ResolvedGlow;
  animations: AnimationFlags;
  text_color: string;
  is_featured: boolean;
  is_seasonal: boolean;
  is_new: boolean;
  is_trending: boolean;
}

// ============================================================================
// CARD THEME OUTPUT
// ============================================================================

export interface AppliedCardTheme {
  // Background layer
  background: string; // CSS background value
  background_classes?: string;

  // Splash layer
  splash_overlay_url?: string;

  // Glow layer
  glow_classes?: string;

  // Text layer
  text_color: string;

  // Border & shadow
  border_classes: string;
  shadow_classes: string;

  // Animation configuration
  animations: AnimationFlags;

  // Enhancement badges
  badges: {
    featured: boolean;
    seasonal: boolean;
    new: boolean;
    trending: boolean;
  };

  // Metadata
  theme_id: CardThemeId;
  preset_id?: GradientPresetId | SplashPresetId;
  seasonal_theme?: SeasonalTheme;
}
