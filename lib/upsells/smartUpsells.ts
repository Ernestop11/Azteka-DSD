/**
 * Smart Upsell Bundle Generator
 * Generates intelligent upsell suggestions based on product, brand, and category
 */

import type { CatalogProduct } from '@/lib/queries/catalog'

export interface UpsellBundle {
  id: string
  title: string
  description: string
  products: CatalogProduct[]
  totalPrice: number
  savings?: number
  type: 'variety' | 'bulk' | 'complementary' | 'sameBrand'
}

/**
 * Generate variety pack upsell (e.g., "One of each Boing flavor")
 */
export function generateVarietyPackUpsell(
  product: CatalogProduct,
  allProducts: CatalogProduct[]
): UpsellBundle | null {
  if (!product.brand) return null

  const brandName = typeof product.brand === 'string' ? product.brand : product.brand.name
  const categoryName = typeof product.category === 'string' ? product.category : product.category?.name

  // Find similar products from same brand and category
  const similarProducts = allProducts.filter(p => {
    const pBrand = typeof p.brand === 'string' ? p.brand : p.brand?.name
    const pCategory = typeof p.category === 'string' ? p.category : p.category?.name
    return pBrand === brandName &&
           pCategory === categoryName &&
           p.id !== product.id
  })

  if (similarProducts.length === 0) return null

  // Take up to 5 similar products + the current product
  const bundleProducts = [product, ...similarProducts.slice(0, 5)]
  const totalPrice = bundleProducts.reduce((sum, p) => sum + Number(p.price), 0)
  const individualPrice = bundleProducts.reduce((sum, p) => sum + Number(p.price), 0)
  const savings = individualPrice * 0.1 // 10% bundle discount

  return {
    id: `variety-${product.id}`,
    title: `${brandName} Variety Pack`,
    description: `One case of each ${categoryName} flavor`,
    products: bundleProducts,
    totalPrice: totalPrice - savings,
    savings,
    type: 'variety'
  }
}

/**
 * Generate bulk discount upsell (e.g., "Buy 3 cases, save 15%")
 */
export function generateBulkUpsell(product: CatalogProduct): UpsellBundle {
  const bulkQuantity = 3
  const totalPrice = Number(product.price) * bulkQuantity
  const savings = totalPrice * 0.15 // 15% discount

  return {
    id: `bulk-${product.id}`,
    title: `${bulkQuantity} Cases - Save 15%`,
    description: `Stock up and save on ${product.name}`,
    products: Array(bulkQuantity).fill(product),
    totalPrice: totalPrice - savings,
    savings,
    type: 'bulk'
  }
}

/**
 * Generate complementary products upsell (e.g., chips with drinks)
 */
export function generateComplementaryUpsell(
  product: CatalogProduct,
  allProducts: CatalogProduct[]
): UpsellBundle | null {
  const categoryName = typeof product.category === 'string' ? product.category : product.category?.name

  // Define complementary category pairs
  const complementaryPairs: Record<string, string[]> = {
    'Drinks': ['Snacks', 'Chips'],
    'Beverages': ['Snacks', 'Chips'],
    'Snacks': ['Drinks', 'Beverages'],
    'Chips': ['Drinks', 'Beverages'],
    'Candy': ['Drinks', 'Beverages'],
  }

  if (!categoryName || !complementaryPairs[categoryName]) return null

  const complementaryCategories = complementaryPairs[categoryName]

  // Find complementary products
  const complementaryProducts = allProducts.filter(p => {
    const pCategory = typeof p.category === 'string' ? p.category : p.category?.name
    return pCategory && complementaryCategories.includes(pCategory)
  }).slice(0, 2)

  if (complementaryProducts.length === 0) return null

  const bundleProducts = [product, ...complementaryProducts]
  const totalPrice = bundleProducts.reduce((sum, p) => sum + Number(p.price), 0)
  const savings = totalPrice * 0.08 // 8% combo discount

  return {
    id: `complementary-${product.id}`,
    title: 'Perfect Combo Deal',
    description: 'Complete your order with these matching products',
    products: bundleProducts,
    totalPrice: totalPrice - savings,
    savings,
    type: 'complementary'
  }
}

/**
 * Generate same-brand upsell (e.g., "More from Boing")
 */
export function generateSameBrandUpsell(
  product: CatalogProduct,
  allProducts: CatalogProduct[]
): UpsellBundle | null {
  if (!product.brand) return null

  const brandName = typeof product.brand === 'string' ? product.brand : product.brand.name

  // Find other products from same brand (different category)
  const brandProducts = allProducts.filter(p => {
    const pBrand = typeof p.brand === 'string' ? p.brand : p.brand?.name
    const pCategory = typeof p.category === 'string' ? p.category : p.category?.name
    const productCategory = typeof product.category === 'string' ? product.category : product.category?.name
    return pBrand === brandName &&
           pCategory !== productCategory &&
           p.id !== product.id
  }).slice(0, 3)

  if (brandProducts.length === 0) return null

  const bundleProducts = [product, ...brandProducts]
  const totalPrice = bundleProducts.reduce((sum, p) => sum + Number(p.price), 0)
  const savings = totalPrice * 0.1 // 10% brand loyalty discount

  return {
    id: `brand-${product.id}`,
    title: `More from ${brandName}`,
    description: 'Explore other great products from this brand',
    products: bundleProducts,
    totalPrice: totalPrice - savings,
    savings,
    type: 'sameBrand'
  }
}

/**
 * Get all upsell bundles for a product
 */
export function getUpsellBundles(
  product: CatalogProduct,
  allProducts: CatalogProduct[]
): UpsellBundle[] {
  const bundles: UpsellBundle[] = []

  // 1. Variety pack (most relevant for wholesale)
  const varietyBundle = generateVarietyPackUpsell(product, allProducts)
  if (varietyBundle) bundles.push(varietyBundle)

  // 2. Bulk discount
  const bulkBundle = generateBulkUpsell(product)
  bundles.push(bulkBundle)

  // 3. Complementary products
  const complementaryBundle = generateComplementaryUpsell(product, allProducts)
  if (complementaryBundle) bundles.push(complementaryBundle)

  // 4. Same brand products
  const sameBrandBundle = generateSameBrandUpsell(product, allProducts)
  if (sameBrandBundle) bundles.push(sameBrandBundle)

  return bundles.slice(0, 3) // Return top 3 most relevant bundles
}
