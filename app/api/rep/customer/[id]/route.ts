import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    // Fetch customer with orders and price overrides
    const customer = await prisma.customer.findUnique({
      where: { id },
      include: {
        orders: {
          select: {
            id: true,
            createdAt: true,
            total: true,
            status: true,
            OrderItem: {
              select: { id: true }
            }
          },
          orderBy: { createdAt: 'desc' },
          take: 25
        },
        priceOverrides: {
          include: {
            product: {
              select: { id: true, name: true, sku: true }
            }
          }
        }
      }
    })

    if (!customer) {
      return NextResponse.json({ error: 'Customer not found' }, { status: 404 })
    }

    // Calculate stats
    const orderCount = customer.orders.length
    const totalSpent = customer.orders.reduce((sum, order) => sum + Number(order.total), 0)
    const lastOrderDate = customer.orders[0]?.createdAt || null

    // Format orders
    const orders = customer.orders.map(order => ({
      id: order.id,
      orderNumber: order.id.slice(0, 8).toUpperCase(),
      createdAt: order.createdAt.toISOString(),
      total: Number(order.total),
      status: order.status,
      itemCount: order.OrderItem.length
    }))

    return NextResponse.json({
      customer: {
        id: customer.id,
        businessName: customer.businessName,
        contactName: customer.contactName || '',
        email: customer.email || '',
        phone: customer.phone || '',
        address: customer.address || '',
        city: customer.city || '',
        state: customer.state || '',
        zipCode: customer.zipCode || '',
        priceTier: customer.priceTier || 'B',
        latitude: customer.latitude ? Number(customer.latitude) : null,
        longitude: customer.longitude ? Number(customer.longitude) : null,
        notes: customer.notes || '',
        lastVisitDate: customer.lastVisitDate?.toISOString() || null,
        nextScheduledVisit: customer.nextScheduledVisit?.toISOString() || null,
        visitFrequency: customer.visitFrequency || null,
        orderCount,
        lastOrderDate: lastOrderDate?.toISOString() || null,
        totalSpent
      },
      orders,
      priceOverrides: customer.priceOverrides.map(po => ({
        id: po.id,
        productId: po.productId,
        productName: po.product.name,
        productSku: po.product.sku,
        overrideType: po.overrideType,
        value: Number(po.value),
        validFrom: po.validFrom?.toISOString() || null,
        validUntil: po.validUntil?.toISOString() || null
      }))
    })
  } catch (error) {
    console.error('[Rep Customer API] Error:', error)
    return NextResponse.json({ error: 'Failed to load customer' }, { status: 500 })
  }
}
