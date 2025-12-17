import type { NormalizedProductForm } from './adminFieldRules'
import type { CardThemeId } from './cardThemes'

export type ProductTemplate = NormalizedProductForm & {
  cardTheme: CardThemeId
  description: string
  imageUrl: string
  overlayImage?: string
  glowClass?: string
  accentColor?: string
}

const BASE_TEMPLATE: Omit<ProductTemplate, 'cardTheme' | 'name' | 'sku'> = {
  priceCase: 24,
  unitsPerCase: 12,
  tags: [],
  displayOrder: 1,
  backgroundColor: '#ffffff',
  gradientStart: '#ffffff',
  gradientEnd: '#f3f4f6',
  badgeText: undefined,
  description: 'Placeholder description for newly created catalog items.',
  imageUrl: '/images/placeholders/menu-default.png',
  overlayImage: undefined,
  glowClass: undefined,
  accentColor: '#111827',
}

export const BASIC_DEFAULT: ProductTemplate = {
  ...BASE_TEMPLATE,
  cardTheme: 'basic',
  name: 'New Menu Item',
  sku: 'BASIC-NEW-001',
  backgroundColor: '#ffffff',
  gradientStart: '#ffffff',
  gradientEnd: '#f3f4f6',
  description: 'Clean product tile with plenty of whitespace for copy or price calls.',
  imageUrl: '/images/placeholders/basic-card.png',
  accentColor: '#1f2937',
  tags: ['core', 'featured'],
}

export const GRADIENT_DEFAULT: ProductTemplate = {
  ...BASE_TEMPLATE,
  cardTheme: 'gradient',
  name: 'Gradient Feature',
  sku: 'GRADIENT-FEAT-001',
  backgroundColor: '#fef3c7',
  gradientStart: '#fef3c7',
  gradientEnd: '#fbcfe8',
  description: 'Vibrant gradient treatment suited for seasonal candy mixes.',
  imageUrl: '/images/placeholders/gradient-card.png',
  accentColor: '#9f1239',
  tags: ['gradient', 'limited'],
}

export const SPLASH_DEFAULT: ProductTemplate = {
  ...BASE_TEMPLATE,
  cardTheme: 'splash',
  name: 'Splash Collage',
  sku: 'SPLASH-COLLAGE-001',
  backgroundColor: '#0f172a',
  gradientStart: '#0f172a',
  gradientEnd: '#1d4ed8',
  description: 'Hero treatment with PNG collage overlays and dramatic glow.',
  imageUrl: '/images/placeholders/splash-card.png',
  overlayImage: '/overlays/sample-splash.png',
  glowClass: 'shadow-[0_25px_75px_rgba(59,130,246,0.45)]',
  accentColor: '#e0f2fe',
  tags: ['hero', 'bundle'],
}

export const HOLIDAY_DEFAULT: ProductTemplate = {
  ...BASE_TEMPLATE,
  cardTheme: 'gradient',
  name: 'Holiday Bundle',
  sku: 'HOLIDAY-MX-001',
  backgroundColor: '#b91c1c',
  gradientStart: '#7f1d1d',
  gradientEnd: '#047857',
  badgeText: 'Holiday',
  description: 'Red and green palette with snowflake cues for seasonal promos.',
  imageUrl: '/images/placeholders/holiday-card.png',
  overlayImage: '/overlays/snowflakes.png',
  glowClass: 'shadow-[0_20px_60px_rgba(185,28,28,0.35)]',
  accentColor: '#fef3c7',
  tags: ['holiday', 'limited'],
}

export const SUMMER_DEFAULT: ProductTemplate = {
  ...BASE_TEMPLATE,
  cardTheme: 'gradient',
  name: 'Summer Refresh',
  sku: 'SUMMER-SUN-001',
  backgroundColor: '#fcd34d',
  gradientStart: '#fde68a',
  gradientEnd: '#f97316',
  badgeText: 'Hot',
  description: 'Bright yellows and warm oranges for peak summer offerings.',
  imageUrl: '/images/placeholders/summer-card.png',
  glowClass: 'shadow-[0_20px_70px_rgba(249,115,22,0.45)]',
  accentColor: '#78350f',
  tags: ['summer', 'refresh'],
}

export const SNACKS_DEFAULT: ProductTemplate = {
  ...BASE_TEMPLATE,
  cardTheme: 'splash',
  name: 'Snack Attack',
  sku: 'SNACKS-FUN-001',
  backgroundColor: '#fdf2f8',
  gradientStart: '#f9a8d4',
  gradientEnd: '#f472b6',
  badgeText: 'New',
  description: 'Playful candy tones perfect for Dulcería assortments.',
  imageUrl: '/images/placeholders/snacks-card.png',
  overlayImage: '/overlays/candy-confetti.png',
  glowClass: 'shadow-[0_18px_60px_rgba(244,114,182,0.4)]',
  accentColor: '#831843',
  tags: ['candy', 'snacks'],
}

export const BEVERAGE_DEFAULT: ProductTemplate = {
  ...BASE_TEMPLATE,
  cardTheme: 'splash',
  name: 'Beverage Flight',
  sku: 'BEV-SPLASH-001',
  backgroundColor: '#0ea5e9',
  gradientStart: '#38bdf8',
  gradientEnd: '#1d4ed8',
  description: 'Cool blues with splash overlay for aguas frescas & specialty drinks.',
  imageUrl: '/images/placeholders/beverage-card.png',
  overlayImage: '/overlays/water-splash.png',
  glowClass: 'shadow-[0_18px_65px_rgba(14,165,233,0.45)]',
  accentColor: '#e0f2fe',
  tags: ['beverage', 'cool'],
}
