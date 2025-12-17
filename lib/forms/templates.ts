import { normalizeProductForm, normalizeBrandForm, normalizeCategoryForm } from './normalize'

export const BLANK_PRODUCT_FORM = normalizeProductForm({
  name: '',
  slug: '',
  sku: '',
  description: '',
  priceCase: '',
  unitsPerCase: '',
  tags: '',
  displayOrder: 1,
  backgroundColor: '#ffffff',
  gradientStart: '#ffffff',
  gradientEnd: '#f3f4f6',
  badgeText: '',
  themeId: 'basic',
})

export const DEFAULT_GRADIENT_FORM = normalizeProductForm({
  name: 'Gradient Feature',
  slug: 'gradient-feature',
  sku: 'GRADIENT-FEAT',
  description: 'Preset for candy gradients.',
  priceCase: 24,
  unitsPerCase: 12,
  tags: 'gradient,seasonal',
  displayOrder: 1,
  backgroundColor: '#fef3c7',
  gradientStart: '#fef08a',
  gradientEnd: '#f472b6',
  badgeText: 'Hot',
  themeId: 'gradient',
})

export const DEFAULT_SPLASH_FORM = normalizeProductForm({
  name: 'Splash Collage',
  slug: 'splash-collage',
  sku: 'SPLASH-COLLAGE',
  description: 'Overlay template for PNG collages.',
  priceCase: 32,
  unitsPerCase: 8,
  tags: 'splash,hero',
  displayOrder: 1,
  backgroundColor: '#0f172a',
  gradientStart: '#0f172a',
  gradientEnd: '#1d4ed8',
  badgeText: 'New',
  themeId: 'splash',
})

export const DEFAULT_BRAND_FORM = normalizeBrandForm({
  name: 'New Brand',
  slug: 'new-brand',
  tagline: 'Authentic flavors.',
  description: 'Brand description placeholder.',
  displayOrder: 1,
  primaryColor: '#f97316',
  secondaryColor: '#0ea5e9',
})

export const DEFAULT_CATEGORY_FORM = normalizeCategoryForm({
  name: 'New Category',
  slug: 'new-category',
  description: 'Category description placeholder.',
  themeId: 'basic',
  displayOrder: 1,
})
