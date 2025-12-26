import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export const dynamic = 'force-dynamic'

// Tier pricing multipliers
const TIER_MULTIPLIERS: Record<string, number> = {
  'A': 0.90, // Best tier - 10% off
  'B': 1.00, // Standard tier - no discount
  'C': 1.05, // Basic tier - 5% markup
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const customerId = searchParams.get('customerId')

    // Get customer for pricing
    let customer = null
    let priceOverrides: Map<string, number> = new Map()

    if (customerId) {
      customer = await prisma.customer.findUnique({
        where: { id: customerId },
        select: {
          id: true,
          priceTier: true,
          priceOverrides: {
            where: { active: true },
            select: {
              productId: true,
              overrideType: true,
              fixedPrice: true,
              discountPercent: true,
              discountAmount: true,
            }
          }
        }
      })

      // Build override map
      if (customer?.priceOverrides) {
        for (const override of customer.priceOverrides) {
          if (override.fixedPrice) {
            priceOverrides.set(override.productId, Number(override.fixedPrice))
          }
        }
      }
    }

    // Get products
    const products = await prisma.product.findMany({
      where: {
        inStock: true,
      },
      orderBy: [
        { featured: 'desc' },
        { name: 'asc' },
      ],
      select: {
        id: true,
        name: true,
        sku: true,
        price: true,
        imageUrl: true,
        inStock: true,
        unitsPerCase: true,
        Brand: {
          select: { id: true, name: true }
        },
        Category: {
          select: { id: true, name: true }
        }
      }
    })

    // Get categories
    const categories = await prisma.category.findMany({
      orderBy: { displayOrder: 'asc' },
      select: {
        id: true,
        name: true,
      }
    })

    // Apply customer pricing
    const tierMultiplier = customer?.priceTier
      ? TIER_MULTIPLIERS[customer.priceTier] || 1
      : 1

    const transformedProducts = products.map(product => {
      const basePrice = Number(product.price)

      // Check for direct price override first
      let customerPrice = priceOverrides.get(product.id)

      // If no override, apply tier pricing
      if (customerPrice === undefined) {
        customerPrice = Math.round(basePrice * tierMultiplier * 100) / 100
      }

      return {
        id: product.id,
        name: product.name,
        sku: product.sku,
        price: basePrice,
        customerPrice: customerPrice !== basePrice ? customerPrice : undefined,
        imageUrl: product.imageUrl,
        inStock: product.inStock,
        unitsPerCase: product.unitsPerCase,
        brand: product.Brand,
        category: product.Category,
      }
    })

    return NextResponse.json({
      products: transformedProducts,
      categories,
      customerTier: customer?.priceTier || 'B',
    })
  } catch (error) {
    console.error('[Rep Products API] Error:', error)
    return NextResponse.json({ products: [], categories: [] }, { status: 500 })
  }
}
