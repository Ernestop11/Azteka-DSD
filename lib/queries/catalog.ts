import { Prisma, PrismaClient } from '@prisma/client'

import { toSlug } from '@/lib/slug'
import { getPublicImageUrl } from '@/lib/imageUrl'
import { getCustomerPrice } from '@/lib/pricing/getCustomerPrice'
import type { ProductApiResponse } from '@/types/catalog'

// ============================================================================
// UNIFIED CATALOG PRODUCT TYPE
// ============================================================================

export interface CatalogProduct {
  id: string
  name: string
  sku: string
  description?: string | null
  price: number
  brand: string
  category: string
  imageUrl: string
  backgroundGradient?: string | null
  backgroundColor?: string | null
  unitsPerCase?: number
  featured?: boolean
  seasonal?: boolean
  trending?: boolean
}

// ============================================================================
// PRODUCT MAPPER FUNCTION
// ============================================================================

/**
 * Normalize any product data to unified CatalogProduct type
 * Handles brand/category as string or object
 */
export function toCatalogProduct(p: any): CatalogProduct {
  return {
    id: p.id || '',
    name: p.name || '',
    sku: p.sku || '',
    description: p.description || null,
    price: Number(p.price) || 0,
    brand: typeof p.brand === 'string' ? p.brand : p.brand?.name || '',
    category: typeof p.category === 'string' ? p.category : p.category?.name || '',
    imageUrl: getPublicImageUrl(p.imageUrl),
    backgroundGradient: p.backgroundGradient || null,
    backgroundColor: p.backgroundColor || null,
    unitsPerCase: p.unitsPerCase || undefined,
    featured: p.featured || false,
    seasonal: p.seasonal || false,
    trending: p.trending || false,
  }
}

// ============================================================================
// EXISTING TYPES (preserved for backward compatibility)
// ============================================================================

export type CatalogProductRow = {
  id: string
  name: string
  slug: string | null
  sku: string | null
  description: string | null
  shortDescription: string | null
  priceCase: number | string | null
  vendorPrice: number | string | null
  costCase: number | string | null
  unitsPerCase: number | null
  unitType: string | null
  marginPercent: number | string | null
  backgroundColor: string | null
  backgroundGradient: string | null
  imageUrl: string | null
  thumbnailUrl: string | null
  hasImage: boolean | null
  stock: number | null
  minStock: number | null
  inStock: boolean | null
  supplier: string | null
  featured: boolean | null
  minOrderQty: number | null
  meta: unknown
  businessModes: string[] | null
  displayOrder: number | null
  updatedAt: Date | string | null
  categoryId: string | null
  categoryName: string | null
  categorySlug: string | null
  brandId: string | null
  brandName: string | null
  brandSlug: string | null
  overridePrice: number | string | null
  overrideCustomerId: string | null
  revenue30d: number | string | null
  units30d: number | string | null
}

export type CatalogQueryOptions = {
  customerId?: string | null
  limit?: number
  featuredOnly?: boolean
  ids?: string[]
  categoryId?: string | null
  brandId?: string | null
  search?: string | null
  minPrice?: number | null
  maxPrice?: number | null
  inStock?: boolean | null
  sortBy?: 'name' | 'price' | 'created' | 'updated' | 'popularity'
  sortOrder?: 'asc' | 'desc'
  offset?: number
  page?: number
  pageSize?: number
  sort?: 'velocity' | 'price' | 'alpha' | 'revenue'
}

// ============================================================================
// FETCH CATALOG PRODUCT ROWS
// ============================================================================

export async function fetchCatalogProductRows(
  prisma: PrismaClient,
  options: CatalogQueryOptions
): Promise<{ rows: CatalogProductRow[]; total: number }> {
  const {
    customerId,
    featuredOnly,
    brandId,
    categoryId,
    search,
    page = 1,
    pageSize = 50,
    sort,
    minPrice,
    maxPrice,
  } = options

  const where: Prisma.ProductWhereInput = {
    inStock: true,
    ...(featuredOnly && { featured: true }),
    ...(brandId && { brandId }),
    ...(categoryId && { categoryId }),
    ...(search && {
      OR: [
        { name: { contains: search, mode: 'insensitive' } },
        { sku: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ],
    }),
    ...(minPrice !== undefined && { price: { gte: minPrice } }),
    ...(maxPrice !== undefined && { price: { lte: maxPrice } }),
  }

  const orderBy: Prisma.ProductOrderByWithRelationInput =
    sort === 'price'
      ? { price: 'asc' }
      : sort === 'alpha'
        ? { name: 'asc' }
        : { createdAt: 'desc' }

  const [rows, total] = await Promise.all([
    prisma.product.findMany({
      where,
      orderBy,
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: {
        Brand: { select: { id: true, name: true, slug: true } },
        Category: { select: { id: true, name: true, slug: true } },
      },
    }),
    prisma.product.count({ where }),
  ])

  // Calculate customer-specific prices if customerId is provided
  const mappedRows: CatalogProductRow[] = await Promise.all(
    rows.map(async (p) => {
      const basePrice = Number(p.price)
      let finalPrice = basePrice
      let overridePrice: number | null = null
      let discountAmount = 0
      let discountPercent = 0

      // Get customer-specific price if customerId is provided
      if (customerId) {
        try {
          const priceResult = await getCustomerPrice(p.id, customerId, 1)
          finalPrice = priceResult.finalPrice
          overridePrice = priceResult.overridePrice
          discountAmount = priceResult.discountAmount
          discountPercent = priceResult.discountPercent
        } catch (error) {
          // If price calculation fails, use base price
          console.warn(`[Catalog] Failed to get customer price for product ${p.id}:`, error)
        }
      }

      return {
        id: p.id,
        name: p.name,
        slug: toSlug(p.name),
        sku: p.sku,
        description: p.description,
        shortDescription: p.description?.substring(0, 100) || null,
        priceCase: finalPrice, // Use customer-specific price
        vendorPrice: null,
        costCase: null,
        unitsPerCase: p.unitsPerCase,
        unitType: null,
        marginPercent: null,
        backgroundColor: p.backgroundColor,
        backgroundGradient: p.backgroundGradient,
        imageUrl: getPublicImageUrl(p.imageUrl),
        thumbnailUrl: getPublicImageUrl(p.imageUrl),
        hasImage: !!p.imageUrl,
        stock: null,
        minStock: null,
        inStock: p.inStock,
        supplier: null,
        featured: p.featured || false,
        minOrderQty: null,
        meta: null,
        businessModes: null,
        displayOrder: null,
        updatedAt: p.updatedAt,
        categoryId: p.categoryId || null,
        categoryName: p.Category?.name || null,
        categorySlug: p.Category?.slug || null,
        brandId: p.brandId || null,
        brandName: p.Brand?.name || null,
        brandSlug: p.Brand?.slug || null,
        overridePrice: overridePrice, // Customer-specific override price
        overrideCustomerId: customerId || null,
        revenue30d: null,
        units30d: null,
        // Add discount info for UI display
        basePrice: basePrice,
        discountAmount: discountAmount,
        discountPercent: discountPercent,
      } as CatalogProductRow & { basePrice?: number; discountAmount?: number; discountPercent?: number }
    })
  )

  return { rows: mappedRows, total }
}

// ============================================================================
// MAP CATALOG PRODUCT ROW
// ============================================================================

export function mapCatalogProductRow(row: CatalogProductRow): any {
  // Return format that matches ProductApiResponseSchema
  return {
    id: row.id,
    name: row.name,
    slug: row.slug || '',
    sku: row.sku,
    description: row.description,
    shortDescription: row.shortDescription,
    featured: row.featured || false,
    category: row.categoryId ? {
      id: row.categoryId,
      name: row.categoryName || '',
      slug: row.categorySlug || null,
    } : null,
    brand: row.brandId ? {
      id: row.brandId,
      name: row.brandName || '',
      slug: row.brandSlug || null,
    } : null,
    price: {
      list: typeof row.priceCase === 'string' ? parseFloat(row.priceCase) : row.priceCase || 0,
      final: typeof row.priceCase === 'string' ? parseFloat(row.priceCase) : row.priceCase || 0,
      override: typeof row.overridePrice === 'string' ? parseFloat(row.overridePrice) : row.overridePrice,
      customerId: row.overrideCustomerId,
    },
    visual: {
      imageUrl: row.imageUrl,
      thumbnailUrl: row.thumbnailUrl,
      backgroundColor: row.backgroundColor,
      backgroundGradient: row.backgroundGradient,
    },
    stock: {
      inStock: row.inStock ?? true,
      stockLevel: row.stock,
      minStock: row.minStock,
      unitsPerCase: row.unitsPerCase,
      unitType: row.unitType,
      vendorPrice: typeof row.vendorPrice === 'string' ? parseFloat(row.vendorPrice) : row.vendorPrice,
      costCase: typeof row.costCase === 'string' ? parseFloat(row.costCase) : row.costCase,
      supplier: row.supplier,
      minOrderQty: row.minOrderQty,
    },
    updatedAt: row.updatedAt ? (typeof row.updatedAt === 'string' ? row.updatedAt : row.updatedAt.toISOString()) : new Date().toISOString(),
  }
}

// ============================================================================
// CLIENT-SIDE API QUERY HELPERS
// ============================================================================

/**
 * Client-side helper to fetch catalog products
 * Uses the centralized API client
 */
export async function fetchCatalogProductsClient(
  options: CatalogQueryOptions
): Promise<{ data: CatalogProduct[]; meta: any }> {
  const { apiClient } = await import('@/lib/api/client')
  
  const params = new URLSearchParams()
  if (options.customerId) params.set('customerId', options.customerId)
  if (options.limit) params.set('limit', options.limit.toString())
  if (options.featuredOnly) params.set('featured', 'true')
  if (options.categoryId) params.set('categoryId', options.categoryId)
  if (options.brandId) params.set('brandId', options.brandId)
  if (options.search) params.set('search', options.search)
  if (options.minPrice !== undefined) params.set('minPrice', options.minPrice.toString())
  if (options.maxPrice !== undefined) params.set('maxPrice', options.maxPrice.toString())
  if (options.sort) params.set('sort', options.sort)
  if (options.page) params.set('page', options.page.toString())
  if (options.pageSize) params.set('pageSize', options.pageSize.toString())

  return apiClient.get(`/catalog/products?${params.toString()}`)
}

/**
 * Client-side helper to fetch catalog layout
 */
export async function fetchCatalogLayoutClient(): Promise<any> {
  const { apiClient } = await import('@/lib/api/client')
  return apiClient.get('/admin/catalog/layout')
}