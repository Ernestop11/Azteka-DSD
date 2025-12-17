import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

/**
 * GET /api/orders/reorder-template
 * Get customer's frequently ordered products for quick reorder
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const customerId = searchParams.get('customerId')
    const limit = parseInt(searchParams.get('limit') || '10')

    if (!customerId) {
      return NextResponse.json(
        { error: 'Customer ID is required' },
        { status: 400 }
      )
    }

    // Get customer's recent orders
    const recentOrders = await prisma.order.findMany({
      where: {
        customerId,
        status: {
          in: ['DELIVERED', 'PICKED'], // Only completed orders
        },
      },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 10, // Last 10 orders
    })

    // Aggregate product frequencies and last quantities
    const productMap = new Map<
      string,
      {
        product: any
        totalOrders: number
        lastQuantity: number
        totalQuantity: number
        lastOrderDate: Date
      }
    >()

    recentOrders.forEach((order) => {
      order.items.forEach((item) => {
        const existing = productMap.get(item.productId)

        if (existing) {
          productMap.set(item.productId, {
            ...existing,
            totalOrders: existing.totalOrders + 1,
            totalQuantity: existing.totalQuantity + item.quantity,
            lastQuantity: item.quantity, // Update to most recent
            lastOrderDate: order.createdAt,
          })
        } else {
          productMap.set(item.productId, {
            product: item.product,
            totalOrders: 1,
            lastQuantity: item.quantity,
            totalQuantity: item.quantity,
            lastOrderDate: order.createdAt,
          })
        }
      })
    })

    // Convert to array and sort by frequency (most ordered first)
    const frequentProducts = Array.from(productMap.values())
      .sort((a, b) => b.totalOrders - a.totalOrders)
      .slice(0, limit)
      .map((item) => ({
        id: item.product.id,
        name: item.product.name,
        sku: item.product.sku,
        imageUrl: item.product.imageUrl,
        price: parseFloat(item.product.price.toString()),
        unitsPerCase: item.product.unitsPerCase,
        lastOrderedQuantity: item.lastQuantity,
        totalOrders: item.totalOrders,
        totalQuantity: item.totalQuantity,
        lastOrderDate: item.lastOrderDate,
        category: item.product.category,
        brand: item.product.brand,
        // Pricing fields
        isCompetitive: item.product.isCompetitive,
        isExclusive: item.product.isExclusive,
        discountTier1: item.product.discountTier1
          ? parseFloat(item.product.discountTier1.toString())
          : null,
        discountTier2: item.product.discountTier2
          ? parseFloat(item.product.discountTier2.toString())
          : null,
        discountTier3: item.product.discountTier3
          ? parseFloat(item.product.discountTier3.toString())
          : null,
        exclusiveDiscount: item.product.exclusiveDiscount,
      }))

    return NextResponse.json({
      success: true,
      data: frequentProducts,
      meta: {
        customerId,
        totalProducts: frequentProducts.length,
        ordersAnalyzed: recentOrders.length,
      },
    })
  } catch (error) {
    console.error('[REORDER_TEMPLATE_ERROR]', error)
    return NextResponse.json(
      { error: 'Failed to fetch reorder template' },
      { status: 500 }
    )
  }
}
