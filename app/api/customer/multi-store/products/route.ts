import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export const dynamic = 'force-dynamic'

// GET /api/customer/multi-store/products - Get frequently ordered products with quantities per store
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const ownerId = searchParams.get('ownerId')

    if (!ownerId) {
      return NextResponse.json({ error: 'Owner ID required' }, { status: 400 })
    }

    // Get the owner and verify they're an OWNER
    const owner = await prisma.customer.findUnique({
      where: { id: ownerId },
      select: { id: true, role: true }
    })

    if (!owner || owner.role !== 'OWNER') {
      return NextResponse.json({ error: 'Not an owner account' }, { status: 403 })
    }

    // Get all sub-stores
    const stores = await prisma.customer.findMany({
      where: { parentCustomerId: ownerId },
      select: { id: true, businessName: true },
      orderBy: { businessName: 'asc' }
    })

    const storeIds = stores.map(s => s.id)

    // Get order items from all stores in the last 90 days
    const ninetyDaysAgo = new Date()
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90)

    const orderItems = await prisma.orderItem.findMany({
      where: {
        order: {
          customerId: { in: storeIds },
          createdAt: { gte: ninetyDaysAgo }
        }
      },
      select: {
        productId: true,
        quantity: true,
        order: {
          select: { customerId: true }
        }
      }
    })

    // Aggregate: productId -> storeId -> total quantity ordered
    const productStoreQuantities: Record<string, Record<string, number>> = {}
    const productOrderCounts: Record<string, number> = {}

    for (const item of orderItems) {
      const { productId, quantity, order } = item
      const storeId = order.customerId

      if (!productStoreQuantities[productId]) {
        productStoreQuantities[productId] = {}
        productOrderCounts[productId] = 0
      }
      productStoreQuantities[productId][storeId] =
        (productStoreQuantities[productId][storeId] || 0) + quantity
      productOrderCounts[productId]++
    }

    // Get the top products (ordered by frequency)
    const sortedProductIds = Object.keys(productOrderCounts)
      .sort((a, b) => productOrderCounts[b] - productOrderCounts[a])
      .slice(0, 50) // Top 50 products

    if (sortedProductIds.length === 0) {
      // If no order history, get featured products instead
      const featuredProducts = await prisma.product.findMany({
        where: { featured: true },
        take: 30,
        select: {
          id: true,
          name: true,
          sku: true,
          price: true,
          imageUrl: true,
          unitsPerCase: true
        }
      })

      return NextResponse.json({
        stores: stores.map(s => ({
          id: s.id,
          name: s.businessName.split(' - ').pop() || s.businessName
        })),
        products: featuredProducts.map(p => ({
          id: p.id,
          name: p.name,
          sku: p.sku,
          price: Number(p.price),
          imageUrl: p.imageUrl,
          unitsPerCase: p.unitsPerCase,
          lastOrderedQuantities: {} // No previous orders
        }))
      })
    }

    // Get product details
    const products = await prisma.product.findMany({
      where: { id: { in: sortedProductIds } },
      select: {
        id: true,
        name: true,
        sku: true,
        price: true,
        imageUrl: true,
        unitsPerCase: true
      }
    })

    // Build response with quantities per store
    const productsWithQuantities = products.map(p => ({
      id: p.id,
      name: p.name,
      sku: p.sku,
      price: Number(p.price),
      imageUrl: p.imageUrl,
      unitsPerCase: p.unitsPerCase,
      lastOrderedQuantities: productStoreQuantities[p.id] || {}
    }))

    // Sort by order frequency
    productsWithQuantities.sort((a, b) => {
      return (productOrderCounts[b.id] || 0) - (productOrderCounts[a.id] || 0)
    })

    return NextResponse.json({
      stores: stores.map(s => ({
        id: s.id,
        name: s.businessName.split(' - ').pop() || s.businessName
      })),
      products: productsWithQuantities
    })
  } catch (error) {
    console.error('[Multi-Store Products API] Error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch products' },
      { status: 500 }
    )
  }
}
