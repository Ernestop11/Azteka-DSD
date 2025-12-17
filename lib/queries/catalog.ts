import { Prisma, PrismaClient } from '@prisma/client'

import { toSlug } from '@/lib/slug'
import { getPublicImageUrl } from '@/lib/imageUrl'
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
        brand: { select: { id: true, name: true, slug: true } },
        category: { select: { id: true, name: true, slug: true } },
      },
    }),
    prisma.product.count({ where }),
  ])

  const mappedRows: CatalogProductRow[] = rows.map((p) => ({
    id: p.id,
    name: p.name,
    slug: toSlug(p.name),
    sku: p.sku,
    description: p.description,
    shortDescription: p.description?.substring(0, 100) || null,
    priceCase: p.price,
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
    categoryName: p.category?.name || null,
    categorySlug: p.category?.slug || null,
    brandId: p.brandId || null,
    brandName: p.brand?.name || null,
    brandSlug: p.brand?.slug || null,
    overridePrice: null,
    overrideCustomerId: customerId || null,
    revenue30d: null,
    units30d: null,
  }))

  return { rows: mappedRows, total }
}

// ============================================================================
// MAP CATALOG PRODUCT ROW
// ============================================================================

export function mapCatalogProductRow(row: CatalogProductRow): CatalogProduct {
  return toCatalogProduct({
    id: row.id,
    name: row.name,
    sku: row.sku || '',
    description: row.description,
    price: typeof row.priceCase === 'string' ? parseFloat(row.priceCase) : row.priceCase || 0,
    brand: row.brandName || '',
    category: row.categoryName || '',
    imageUrl: row.imageUrl || '',
    backgroundGradient: row.backgroundGradient,
    backgroundColor: row.backgroundColor,
    unitsPerCase: row.unitsPerCase || undefined,
    featured: row.featured || false,
    seasonal: false,
    trending: false,
  })
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