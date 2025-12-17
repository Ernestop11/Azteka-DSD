/**
 * Maps our Product interface to VisualProduct for preset resolution
 * Handles field name differences and provides fallbacks
 */

import { VisualProduct } from './presetTypes'

interface Product {
  id: string
  name: string
  sku: string
  description?: string | null
  price: number | string
  unitsPerCase: number
  imageUrl?: string | null
  backgroundColor?: string | null
  backgroundGradient?: string | null
  featured?: boolean
  seasonal?: boolean
  newArrival?: boolean
  trending?: boolean
  category?: { id: string; name: string } | null
  brand?: { id: string; name: string } | null
  gradientPresetId?: string | number | null
  glowPresetId?: string | null
  splashPresetId?: string | null
  splashOverlay?: string | null
  seasonalStart?: string | null
  seasonalEnd?: string | null
  seasonalTheme?: string | null
}

/**
 * Maps Product to VisualProduct format for preset resolution
 * Provides fallbacks for missing data based on category/brand
 */
export function mapProductToVisual(product: Product, fallbackCategory?: string, fallbackBrand?: string): VisualProduct {
  const priceValue = typeof product.price === 'number' ? product.price : parseFloat(String(product.price)) || 0

  // Use gradientPresetId directly if it's a string preset ID
  let visualPreset: string | null = null
  if (product.gradientPresetId) {
    visualPreset = String(product.gradientPresetId)
  }

  // Fallback presets based on category/brand if no preset assigned
  if (!visualPreset && !product.backgroundGradient && !product.backgroundColor) {
    if (fallbackCategory) {
      const categoryLower = fallbackCategory.toLowerCase()
      if (categoryLower.includes('candy') || categoryLower.includes('dulce')) {
        visualPreset = 'candy-dream'
      } else if (categoryLower.includes('beverage') || categoryLower.includes('jugo') || categoryLower.includes('agua')) {
        visualPreset = 'ocean-breeze'
      } else if (categoryLower.includes('snack') || categoryLower.includes('chip')) {
        visualPreset = 'sunset-glow'
      }
    }
  }

  return {
    sku: product.sku,
    name: product.name,
    price_case: priceValue,
    price_unit: priceValue / product.unitsPerCase,
    // VisualProduct expects number IDs, but we have string UUIDs - use 1 as fallback
    category_id: product.category?.id ? 1 : 1,
    brand_id: product.brand?.id ? 1 : null,
    background_color: product.backgroundColor || null,
    background_gradient: product.backgroundGradient || null,
    text_color: null,
    visual_preset: visualPreset,
    glow_preset: product.glowPresetId || null,
    splash_overlay: product.splashOverlay || null,
    featured: product.featured || false,
    seasonal: product.seasonal || false,
    new_arrival: product.newArrival || false,
    trending: product.trending || false,
    seasonal_start: product.seasonalStart || null,
    seasonal_end: product.seasonalEnd || null,
    seasonal_theme: product.seasonalTheme || null,
    image_url: product.imageUrl || null,
    thumbnail_url: product.imageUrl || null,
    created_at: undefined,
    updated_at: undefined,
  }
}

