import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export const dynamic = 'force-dynamic'

// Tier-based price multipliers
const TIER_MULTIPLIERS: Record<string, number> = {
  'A': 0.90, // Best tier - 10% off
  'B': 1.00, // Standard tier
  'C': 1.05, // Basic tier - 5% markup
}

interface Params {
  params: Promise<{ id: string }>
}

// GET /api/rep/customer/[id]/favorites - Get previously ordered products
export async function GET(request: NextRequest, { params }: Params) {
  try {
    const { id: customerId } = await params

    // Get customer with price tier
    const customer = await prisma.customer.findUnique({
      where: { id: customerId },
      select: {
        id: true,
        businessName: true,
        priceTier: true,
      }
    })

    if (!customer) {
      return NextResponse.json({ error: 'Customer not found' }, { status: 404 })
    }

    // Get all products this customer has ordered before with quantities
    const orderItems = await prisma.orderItem.findMany({
      where: {
        Order: {
          customerId: customerId,
        },
      },
      select: {
        productId: true,
        quantity: true,
        price: true,
        Order: {
          select: {
            createdAt: true,
          }
        }
      },
      orderBy: {
        Order: {
          createdAt: 'desc'
        }
      }
    })

    // Aggregate product order data
    const productStats = new Map<string, {
      totalQuantity: number,
      orderCount: number,
      lastOrderDate: Date,
      lastPrice: number
    }>()

    for (const item of orderItems) {
      const existing = productStats.get(item.productId)
      if (existing) {
        existing.totalQuantity += item.quantity
        existing.orderCount += 1
      } else {
        productStats.set(item.productId, {
          totalQuantity: item.quantity,
          orderCount: 1,
          lastOrderDate: item.Order.createdAt,
          lastPrice: Number(item.price),
        })
      }
    }

    const productIds = Array.from(productStats.keys())

    if (productIds.length === 0) {
      return NextResponse.json({
        favorites: [],
        customer: {
          id: customer.id,
          businessName: customer.businessName,
          priceTier: customer.priceTier,
        }
      })
    }

    // Fetch product details
    const products = await prisma.product.findMany({
      where: {
        id: { in: productIds },
      },
      select: {
        id: true,
        name: true,
        sku: true,
        price: true,
        imageUrl: true,
        inStock: true,
        unitsPerCase: true,
        featured: true,
        seasonal: true,
        trending: true,
        special: true,
        backgroundColor: true,
        backgroundGradient: true,
        badge: true,
        Brand: {
          select: { id: true, name: true }
        },
        Category: {
          select: { id: true, name: true }
        },
      }
    })

    // Apply customer pricing
    const tierMultiplier = TIER_MULTIPLIERS[customer.priceTier || 'B'] || 1

    // Get any price overrides for this customer
    const priceOverrides = await prisma.customerPriceOverride.findMany({
      where: {
        customerId: customerId,
        productId: { in: productIds },
        isActive: true,
      },
      select: {
        productId: true,
        price: true,
      }
    }).catch(() => []) // Table might not exist

    const overrideMap = new Map(priceOverrides.map(o => [o.productId, Number(o.price)]))

    // Transform products with customer pricing and order stats
    const favorites = products.map(product => {
      const stats = productStats.get(product.id)!
      const basePrice = Number(product.price || 0)
      const overridePrice = overrideMap.get(product.id)
      const customerPrice = overridePrice ?? (basePrice * tierMultiplier)

      return {
        id: product.id,
        name: product.name,
        sku: product.sku,
        price: basePrice,
        customerPrice: Math.round(customerPrice * 100) / 100,
        imageUrl: product.imageUrl,
        inStock: product.inStock ?? true,
        unitsPerCase: product.unitsPerCase || 1,
        featured: product.featured,
        seasonal: product.seasonal,
        trending: product.trending,
        special: product.special,
        backgroundColor: product.backgroundColor,
        backgroundGradient: product.backgroundGradient,
        badge: product.badge,
        brand: product.Brand,
        category: product.Category,
        // Order statistics
        totalQuantityOrdered: stats.totalQuantity,
        orderCount: stats.orderCount,
        lastOrderDate: stats.lastOrderDate.toISOString(),
        suggestedQuantity: Math.ceil(stats.totalQuantity / stats.orderCount), // Average order qty
      }
    })

    // Sort by order count (most ordered first)
    favorites.sort((a, b) => b.orderCount - a.orderCount)

    return NextResponse.json({
      favorites,
      customer: {
        id: customer.id,
        businessName: customer.businessName,
        priceTier: customer.priceTier,
      }
    })
  } catch (error) {
    console.error('[Rep Customer Favorites API] Error:', error)
    return NextResponse.json({
      favorites: [],
      error: 'Failed to load favorites'
    })
  }
}
