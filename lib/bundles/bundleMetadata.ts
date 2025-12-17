/**
 * Bundle Metadata
 *
 * Generates bundle thumbnails, descriptions, and display metadata.
 */

import type { UpsellRecipe } from '../cards/upsellRecipes';
import type { BundleProduct } from './bundleEngine';

// ============================================================================
// METADATA GENERATION
// ============================================================================

export interface BundleMetadata {
  title: string;
  description: string;
  shortDescription: string;
  thumbnails: string[]; // Product image URLs
  primaryImage: string; // Main bundle image
  badge: {
    text: string;
    color: string;
    icon?: string;
  };
  tags: string[];
  productCount: number;
  categoryMix: string; // e.g., "Candy + Beverages"
}

/**
 * Generates complete metadata for bundle display
 *
 * @param bundle - Upsell recipe
 * @param products - Products in bundle
 * @returns Display metadata
 */
export function generateBundleMetadata(
  bundle: UpsellRecipe,
  products: BundleProduct[]
): BundleMetadata {
  const thumbnails = products
    .slice(0, 4) // Max 4 thumbnails
    .map((p) => `/images/products/${p.sku}.jpg`);

  const primaryImage = thumbnails[0] || '/images/bundles/default.jpg';

  const categories = Array.from(new Set(products.map((p) => p.category_name).filter((name): name is string => Boolean(name))));
  const categoryMix = categories.slice(0, 2).join(' + ');

  const tags: string[] = [];
  if (bundle.seasonalTheme) tags.push(bundle.seasonalTheme);
  if (bundle.discount && bundle.discount >= 15) tags.push('Great Deal');
  if (products.some((p) => p.featured)) tags.push('Featured');
  tags.push(...categories);

  return {
    title: bundle.title,
    description: bundle.description,
    shortDescription: truncate(bundle.description, 60),
    thumbnails,
    primaryImage,
    badge: {
      text: bundle.badgeText || `Save ${bundle.discount}%`,
      color: bundle.badgeColor || '#10b981',
    },
    tags,
    productCount: products.length,
    categoryMix,
  };
}

/**
 * Generates explanation text for bundle recommendation
 */
export function generateExplanation(context: {
  recentOrderCount?: number;
  cartItemCount?: number;
  seasonalMatch?: boolean;
  categoryMatch?: boolean;
}): string {
  const parts: string[] = [];

  if (context.recentOrderCount && context.recentOrderCount > 0) {
    parts.push(`Based on your last ${context.recentOrderCount} orders`);
  }

  if (context.cartItemCount && context.cartItemCount > 0) {
    parts.push(`Pairs well with items in your cart`);
  }

  if (context.seasonalMatch) {
    parts.push(`Perfect for the current season`);
  }

  if (context.categoryMatch) {
    parts.push(`Common with this category`);
  }

  if (parts.length === 0) {
    return 'Frequently purchased together';
  }

  return parts.join('. ');
}

function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength - 3) + '...';
}
