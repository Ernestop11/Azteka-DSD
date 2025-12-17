/**
 * Catalog Builder Engine
 * 
 * Centralized engine that:
 * - Loads products from database
 * - Assigns them to layout sections (showcase, trending, promos, etc.)
 * - Normalizes all image URLs
 * - Returns a complete, guaranteed-safe layout payload
 */

import prisma from '@/lib/prisma'
import { normalizeProductImage, getPublicImageUrl } from '@/lib/imageUrl'
import { applySeasonalTheme, generateProductColor, generateProductGradient } from '@/lib/utils/colorGenerator'
import { calculateDiscounts, createPromotionalSections } from '@/lib/promoGenerator'
import { applyCategoryVisuals } from '@/lib/cards/categoryVisuals'

import { buildBundlesForCatalog, type CatalogBundle } from './bundleBuilder'

export interface CatalogLayout {
  heroBanner: HeroBanner | null
  showcase: CatalogProduct[]
  promos: CatalogPromo[]
  brands: CatalogBrand[]
  categories: CatalogCategory[]
  trending: CatalogProduct[]
  // Themed sections
  sabritasProducts: CatalogProduct[]
  barcelProducts: CatalogProduct[]
  seasonalProducts: CatalogProduct[]
  drinkProducts: CatalogProduct[]
  // Bundles
  bundles: CatalogBundle[]
}

export interface HeroBanner {
  active: boolean
  title?: string
  headline?: string
  subtitle?: string
  subheadline?: string
  imageUrl?: string
  ctaText?: string
  ctaLink?: string
  theme?: string
}

export interface CatalogProduct {
  id: string
  name: string
  sku: string
  description?: string | null
  price: number
  unitsPerCase: number
  imageUrl: string // Always normalized, never null
  backgroundColor?: string | null
  backgroundGradient?: string | null
  featured: boolean
  seasonal: boolean
  trending: boolean
  category: {
    id: string
    name: string
  } | null
  brand: {
    id: string
    name: string
  } | null
  gradientPresetId?: string | null
  glowPresetId?: string | null
  splashPresetId?: string | null
  createdAt?: Date | string | null
  updatedAt?: Date | string | null
}

export interface CatalogPromo {
  id: string
  title: string
  subtitle?: string | null
  description?: string | null
  imageUrl: string // Always normalized
  imagePosition?: string | null
  theme?: string | null
  ctaText?: string | null
  ctaLink?: string | null
  active: boolean
  displayOrder: number
}

export interface CatalogBrand {
  id: string
  name: string
  slug?: string | null
  imageUrl: string // Always normalized
}

export interface CatalogCategory {
  id: string
  name: string
  slug?: string | null
  imageUrl: string // Always normalized
}

/**
 * Normalize a product from Prisma to CatalogProduct format
 * Auto-applies colors and themes if not set
 */
function normalizeProduct(p: any, index: number): CatalogProduct {
  // Apply seasonal theme (auto-generates colors if missing)
  const theme = applySeasonalTheme(p, index)
  
  return {
    id: p.id || '',
    name: p.name || '',
    sku: p.sku || '',
    description: p.description || null,
    price: Number(p.price) || 0,
    unitsPerCase: p.unitsPerCase || 1,
    imageUrl: normalizeProductImage({ imageUrl: p.imageUrl }), // Always normalized
    backgroundColor: theme.backgroundColor || p.backgroundColor || null,
    backgroundGradient: theme.backgroundGradient || p.backgroundGradient || null,
    featured: p.featured || false,
    seasonal: p.seasonal || false,
    trending: p.trending || false,
    category: p.category ? {
      id: p.category.id || '',
      name: p.category.name || '',
    } : null,
    brand: p.brand ? {
      id: p.brand.id || '',
      name: p.brand.name || '',
    } : null,
    gradientPresetId: p.gradientPresetId || null,
    glowPresetId: p.glowPresetId || null,
    splashPresetId: p.splashPresetId || null,
    createdAt: p.createdAt || null,
    updatedAt: p.updatedAt || null,
  }
}

/**
 * Build the complete catalog layout from database
 * 
 * Guarantees:
 * - All arrays exist (never null)
 * - All imageUrls are normalized to public paths
 * - showcase defaults to first 20 products if no featured products
 * - trending defaults to products 20-40 if no trending products
 */
export async function buildCatalogLayout(): Promise<CatalogLayout> {
  try {
    // STEP 1: Load admin-configured settings from CatalogLayout table
    let heroBanner: HeroBanner | null = null
    try {
      const heroBannerSetting = await prisma.catalogLayout.findUnique({
        where: { key: 'hero_banner' },
      })
      if (heroBannerSetting?.value && heroBannerSetting.active) {
        // Parse the JSON value stored in the database
        const value = typeof heroBannerSetting.value === 'string' 
          ? JSON.parse(heroBannerSetting.value) 
          : heroBannerSetting.value
        heroBanner = {
          active: value.active !== false,
          title: value.title || undefined,
          headline: value.headline || value.title || undefined,
          subtitle: value.subtitle || undefined,
          subheadline: value.subheadline || undefined,
          imageUrl: value.imageUrl || undefined,
          ctaText: value.ctaText || undefined,
          ctaLink: value.ctaLink || undefined,
          theme: value.theme || 'default',
        }
      }
    } catch (e) {
      console.warn('[CatalogBuilder] Error loading hero banner from CatalogLayout:', e)
      // Continue with null heroBanner
    }

    // STEP 2: Fetch first 200 products with relations - only in-stock products
    const allProducts = await prisma.product.findMany({
      where: {
        inStock: true, // Only fetch products that are in stock
      },
      select: {
        id: true,
        name: true,
        sku: true,
        description: true,
        price: true,
        unitsPerCase: true,
        imageUrl: true,
        backgroundColor: true,
        backgroundGradient: true,
        featured: true,
        seasonal: true,
        trending: true,
        inStock: true,
        category: {
          select: {
            id: true,
            name: true,
          },
        },
        brand: {
          select: {
            id: true,
            name: true,
          },
        },
        gradientPresetId: true,
        glowPresetId: true,
        splashPresetId: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: { createdAt: 'desc' },
      take: 200,
    })

    // Normalize all products with auto-generated colors/themes
    let normalizedProducts = allProducts.map((p, index) => normalizeProduct(p, index))
    
    // Apply category-based visual effects to products without custom backgrounds
    // This adds liquid effects for drinks, vibrant backgrounds for snacks, etc.
    normalizedProducts = normalizedProducts.map(p => {
      // Only apply if product doesn't already have custom background
      if (!p.backgroundGradient && !p.backgroundColor && p.category?.name) {
        const withCategoryVisuals = applyCategoryVisuals({
          ...p,
          category: p.category.name,
        })
        return {
          ...p,
          backgroundGradient: withCategoryVisuals.backgroundGradient || p.backgroundGradient,
          backgroundColor: withCategoryVisuals.backgroundColor || p.backgroundColor,
          splashPresetId: withCategoryVisuals.splashPresetId || p.splashPresetId,
          glowPresetId: withCategoryVisuals.glowPresetId || p.glowPresetId,
          gradientPresetId: withCategoryVisuals.gradientPresetId || p.gradientPresetId,
        }
      }
      return p
    })
    
    // Calculate discounts for products
    const productsWithDiscounts = calculateDiscounts(normalizedProducts)

    // STEP 3: Load admin-configured section product IDs
    const loadSectionProductIds = async (key: string): Promise<string[]> => {
      try {
        const setting = await prisma.catalogLayout.findUnique({
          where: { key: `section_${key}` },
        })
        if (setting?.value && setting.active) {
          const value = typeof setting.value === 'string' 
            ? JSON.parse(setting.value) 
            : setting.value
          return Array.isArray(value) ? value : []
        }
      } catch (e) {
        console.warn(`[CatalogBuilder] Error loading section_${key}:`, e)
      }
      return []
    }

    // Build showcase: use admin-configured products, or fallback to featured/auto
    let showcase: CatalogProduct[] = []
    try {
      const configuredIds = await loadSectionProductIds('showcase')
      if (configuredIds.length > 0) {
        // Use admin-configured products in the specified order
        const productMap = new Map(productsWithDiscounts.map(p => [p.id, p]))
        showcase = configuredIds
          .map(id => productMap.get(id))
          .filter((p): p is CatalogProduct => p !== undefined)
      } else {
        // Fallback: featured products, or first 20
        const featured = productsWithDiscounts.filter(p => p.featured)
        showcase = featured.length > 0 
          ? featured.slice(0, 20)
          : productsWithDiscounts.slice(0, 20)
      }
    } catch (e) {
      console.warn('[CatalogBuilder] Error building showcase:', e)
      showcase = productsWithDiscounts.slice(0, 20)
    }

    // Build trending: use admin-configured products, or fallback to trending/auto
    let trending: CatalogProduct[] = []
    try {
      const configuredIds = await loadSectionProductIds('trending')
      if (configuredIds.length > 0) {
        const productMap = new Map(productsWithDiscounts.map(p => [p.id, p]))
        trending = configuredIds
          .map(id => productMap.get(id))
          .filter((p): p is CatalogProduct => p !== undefined)
      } else {
        // Fallback: trending products, or products 20-40
        const trendingProducts = productsWithDiscounts.filter(p => p.trending)
        trending = trendingProducts.length > 0
          ? trendingProducts.slice(0, 20)
          : productsWithDiscounts.slice(20, 40)
      }
    } catch (e) {
      console.warn('[CatalogBuilder] Error building trending:', e)
      trending = productsWithDiscounts.slice(20, 40)
    }

    // Build promos: fetch from BillboardPromo or Promo table
    let promos: CatalogPromo[] = []
    try {
      const billboardPromos = await prisma.billboardPromo.findMany({
        where: { active: true },
        orderBy: { displayOrder: 'asc' },
        select: {
          id: true,
          title: true,
          subtitle: true,
          description: true,
          imageUrl: true,
          imagePosition: true,
          theme: true,
          ctaText: true,
          ctaLink: true,
          active: true,
          displayOrder: true,
        },
      })
      promos = billboardPromos.map((p: any) => ({
        id: p.id || '',
        title: p.title || '',
        subtitle: p.subtitle || null,
        description: p.description || null,
        imageUrl: getPublicImageUrl(p.imageUrl), // Normalized
        imagePosition: p.imagePosition || null,
        theme: p.theme || null,
        ctaText: p.ctaText || null,
        ctaLink: p.ctaLink || null,
        active: p.active ?? true,
        displayOrder: p.displayOrder ?? 0,
      }))
    } catch (e) {
      // Try alternative table name
      try {
        const altPromos = await (prisma as any).promo.findMany({
          where: { active: true },
          orderBy: { displayOrder: 'asc' },
        })
        promos = altPromos.map((p: any) => ({
          id: p.id || '',
          title: p.title || '',
          subtitle: p.subtitle || null,
          description: p.description || null,
          imageUrl: getPublicImageUrl(p.imageUrl), // Normalized
          imagePosition: p.imagePosition || null,
          theme: p.theme || null,
          ctaText: p.ctaText || null,
          ctaLink: p.ctaLink || null,
          active: p.active ?? true,
          displayOrder: p.displayOrder ?? 0,
        }))
      } catch (e2) {
        console.warn('[CatalogBuilder] Error fetching promos:', e2)
        promos = []
      }
    }

    // Build brands: unique brands from products + all brands from DB
    let brands: CatalogBrand[] = []
    try {
      const dbBrands = await prisma.brand.findMany({
        select: {
          id: true,
          name: true,
          slug: true,
          imageUrl: true,
        },
        orderBy: { name: 'asc' },
      })
      
      // Get unique brands from products
      const productBrands = new Map<string, CatalogBrand>()
      normalizedProducts.forEach(p => {
        if (p.brand && !productBrands.has(p.brand.id)) {
          productBrands.set(p.brand.id, {
            id: p.brand.id,
            name: p.brand.name,
            imageUrl: '/coming-soon.png', // Default if no brand image
          })
        }
      })

      // Merge DB brands with product brands, normalize image URLs
      brands = dbBrands.map((b: any) => ({
        id: b.id || '',
        name: b.name || '',
        slug: b.slug || null,
        imageUrl: getPublicImageUrl(b.imageUrl), // Normalized
      }))

      // Add product brands that aren't in DB
      productBrands.forEach((brand, id) => {
        if (!brands.find(b => b.id === id)) {
          brands.push(brand)
        }
      })
    } catch (e) {
      console.warn('[CatalogBuilder] Error fetching brands:', e)
      brands = []
    }

    // Build categories: all categories from DB
    let categories: CatalogCategory[] = []
    try {
      const dbCategories = await prisma.category.findMany({
        select: {
          id: true,
          name: true,
          slug: true,
          imageUrl: true,
        },
        orderBy: { name: 'asc' },
      })
      categories = dbCategories.map((c: any) => ({
        id: c.id || '',
        name: c.name || '',
        slug: c.slug || null,
        imageUrl: getPublicImageUrl(c.imageUrl), // Normalized
      }))
    } catch (e) {
      console.warn('[CatalogBuilder] Error fetching categories:', e)
      categories = []
    }

    // Build themed sections: use admin-configured products, or fallback to auto-generated
    let sabritasProducts: CatalogProduct[] = []
    try {
      const configuredIds = await loadSectionProductIds('sabritas')
      if (configuredIds.length > 0) {
        const productMap = new Map(productsWithDiscounts.map(p => [p.id, p]))
        sabritasProducts = configuredIds
          .map(id => productMap.get(id))
          .filter((p): p is CatalogProduct => p !== undefined)
      } else {
        // Fallback: filter by brand name
        sabritasProducts = productsWithDiscounts
          .filter(p => p.brand?.name?.toLowerCase().includes('sabritas'))
          .slice(0, 8)
      }
    } catch (e) {
      console.warn('[CatalogBuilder] Error building sabritas section:', e)
      sabritasProducts = []
    }

    let barcelProducts: CatalogProduct[] = []
    try {
      const configuredIds = await loadSectionProductIds('barcel')
      if (configuredIds.length > 0) {
        const productMap = new Map(productsWithDiscounts.map(p => [p.id, p]))
        barcelProducts = configuredIds
          .map(id => productMap.get(id))
          .filter((p): p is CatalogProduct => p !== undefined)
      } else {
        // Fallback: filter by brand name
        barcelProducts = productsWithDiscounts
          .filter(p => p.brand?.name?.toLowerCase().includes('barcel'))
          .slice(0, 8)
      }
    } catch (e) {
      console.warn('[CatalogBuilder] Error building barcel section:', e)
      barcelProducts = []
    }

    let seasonalProducts: CatalogProduct[] = []
    try {
      const configuredIds = await loadSectionProductIds('seasonal')
      if (configuredIds.length > 0) {
        const productMap = new Map(productsWithDiscounts.map(p => [p.id, p]))
        seasonalProducts = configuredIds
          .map(id => productMap.get(id))
          .filter((p): p is CatalogProduct => p !== undefined)
      } else {
        // Fallback: filter by seasonal flag
        seasonalProducts = productsWithDiscounts
          .filter(p => p.seasonal)
          .slice(0, 12)
      }
    } catch (e) {
      console.warn('[CatalogBuilder] Error building seasonal section:', e)
      seasonalProducts = []
    }

    let drinkProducts: CatalogProduct[] = []
    try {
      const configuredIds = await loadSectionProductIds('drinks')
      if (configuredIds.length > 0) {
        const productMap = new Map(productsWithDiscounts.map(p => [p.id, p]))
        drinkProducts = configuredIds
          .map(id => productMap.get(id))
          .filter((p): p is CatalogProduct => p !== undefined)
      } else {
        // Fallback: filter by category name
        drinkProducts = productsWithDiscounts
          .filter(p => {
            const categoryName = p.category?.name?.toLowerCase() || ''
            return categoryName.includes('drink') || 
                   categoryName.includes('beverage') || 
                   categoryName.includes('soda') ||
                   categoryName.includes('juice') ||
                   categoryName.includes('water')
          })
          .slice(0, 12)
      }
    } catch (e) {
      console.warn('[CatalogBuilder] Error building drinks section:', e)
      drinkProducts = []
    }

    // Build bundles for catalog
    const bundles = await buildBundlesForCatalog()

    // Return complete layout - all arrays guaranteed to exist, heroBanner from admin settings
    return {
      heroBanner, // From admin CatalogLayout table
      showcase: Array.isArray(showcase) ? showcase : [],
      promos: Array.isArray(promos) ? promos : [],
      brands: Array.isArray(brands) ? brands : [],
      categories: Array.isArray(categories) ? categories : [],
      trending: Array.isArray(trending) ? trending : [],
      sabritasProducts: Array.isArray(sabritasProducts) ? sabritasProducts : [],
      barcelProducts: Array.isArray(barcelProducts) ? barcelProducts : [],
      seasonalProducts: Array.isArray(seasonalProducts) ? seasonalProducts : [],
      drinkProducts: Array.isArray(drinkProducts) ? drinkProducts : [],
      bundles: Array.isArray(bundles) ? bundles : [],
    }
  } catch (error: any) {
    console.error('[CatalogBuilder] Fatal error building layout:', error)
    // Return safe empty layout on any error
    return {
      heroBanner: null,
      showcase: [],
      promos: [],
      brands: [],
      categories: [],
      trending: [],
      sabritasProducts: [],
      barcelProducts: [],
      seasonalProducts: [],
      drinkProducts: [],
      bundles: [],
    }
  }
}

