/**
 * Bundle Builder Engine
 * 
 * Fetches and normalizes bundles for catalog display.
 * Similar to catalogBuilder.ts but for product bundles.
 */

import prisma from '@/lib/prisma'
import { getPublicImageUrl } from '@/lib/imageUrl'

export interface CatalogBundle {
  id: string
  name: string
  slug: string
  sku?: string | null
  description?: string | null
  imageUrl: string
  badgeText?: string | null
  badgeColor?: string | null
  price: number
  discountPercent: number
  stock: number
  inStock: boolean
  featured: boolean
  active: boolean
  categoryId?: string | null
  brandId?: string | null
  category?: {
    id: string
    name: string
    slug?: string | null
  } | null
  brand?: {
    id: string
    name: string
    slug?: string | null
  } | null
  products: Array<{
    id: string
    name: string
    sku: string
    price: number
    imageUrl: string
    quantity: number
  }>
  rackOffer?: {
    title: string
    description: string
    imageUrl?: string | null
  }
  totalValue: number // Original total before discount
  savings: number // Amount saved
  savingsPercent: number // Percentage saved
}

/**
 * Build bundles for catalog display
 * Fetches active/featured bundles and normalizes them
 */
export async function buildBundlesForCatalog(): Promise<CatalogBundle[]> {
  try {
    // Fetch active bundles, prioritize featured ones
    // Use select to avoid querying non-existent columns
    const bundles = await (prisma as any).productBundle.findMany({
      where: {
        active: true,
      },
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        imageUrl: true,
        badgeText: true,
        badgeColor: true,
        price: true,
        discountPercent: true,
        stock: true,
        inStock: true,
        featured: true,
        active: true,
        categoryId: true,
        brandId: true,
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        brand: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        items: {
          select: {
            id: true,
            quantity: true,
            product: {
              select: {
                id: true,
                name: true,
                sku: true,
                price: true,
                imageUrl: true,
                unitsPerCase: true,
              },
            },
          },
        },
      },
      orderBy: [
        { featured: 'desc' }, // Featured first
        { createdAt: 'desc' },
      ],
      take: 20, // Limit to 20 bundles for catalog
    })

    // Normalize bundles
    const normalizedBundles: CatalogBundle[] = bundles.map((bundle: any) => {
      const bundlePrice = Number(bundle.price) || 0
      const discountPercent = Number(bundle.discountPercent) || 0

      // Calculate total value from products
      const totalValue = bundle.items.reduce((sum: number, item: any) => {
        const productPrice = Number(item.product?.price || 0)
        return sum + productPrice * (item.quantity || 1)
      }, 0)

      const savings = totalValue - bundlePrice
      const savingsPercent = totalValue > 0 ? (savings / totalValue) * 100 : 0

      // Generate rack offer if bundle is featured or has discount
      const rackOffer = bundle.featured || discountPercent > 10
        ? {
            title: 'Free Display Rack Included!',
            description: `Order this ${bundle.name} bundle and receive a free display rack to showcase all products. Perfect for store setup!`,
            imageUrl: null, // Can be added later
          }
        : undefined

      // Normalize products
      const products = bundle.items.map((item: any) => ({
        id: item.product?.id || '',
        name: item.product?.name || 'Unknown Product',
        sku: item.product?.sku || '',
        price: Number(item.product?.price) || 0,
        imageUrl: getPublicImageUrl(item.product?.imageUrl),
        quantity: item.quantity || 1,
      }))

      return {
        id: bundle.id,
        name: bundle.name,
        slug: bundle.slug || bundle.id, // Fallback to id if slug missing
        sku: (bundle as any).sku || null, // Handle optional sku field
        description: bundle.description || null,
        imageUrl: getPublicImageUrl(bundle.imageUrl),
        badgeText: bundle.badgeText || null,
        badgeColor: bundle.badgeColor || '#10b981',
        price: bundlePrice,
        discountPercent,
        stock: bundle.stock || 0,
        inStock: bundle.inStock ?? true,
        featured: bundle.featured || false,
        active: bundle.active ?? true,
        categoryId: bundle.categoryId || null,
        brandId: bundle.brandId || null,
        category: bundle.category
          ? {
              id: bundle.category.id,
              name: bundle.category.name,
              slug: bundle.category.slug || null,
            }
          : null,
        brand: bundle.brand
          ? {
              id: bundle.brand.id,
              name: bundle.brand.name,
              slug: bundle.brand.slug || null,
            }
          : null,
        products,
        rackOffer,
        totalValue,
        savings,
        savingsPercent,
      }
    })

    return normalizedBundles
  } catch (error: any) {
    console.error('[BundleBuilder] Error building bundles:', error)
    return []
  }
}

