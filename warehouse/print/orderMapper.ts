/**
 * Order Mapper
 * Maps Prisma order to PackingSlipOrder format
 */

import prisma from '@/lib/prisma'
import type { PackingSlipOrder } from './packingSlipTypes'

/**
 * Build print payload from order ID
 */
export async function buildPrintPayload(orderId: string): Promise<PackingSlipOrder | null> {
  try {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        customer: true,
        items: {
          include: {
            product: {
              include: {
                brand: true,
              },
            },
          },
        },
      },
    })

    if (!order) return null

    return {
      orderId: order.id,
      orderNumber: order.id,
      orderDate: order.createdAt,
      confirmationDate: order.createdAt,
      status: order.status,
      store: order.customer ? {
        id: order.customer.id,
        name: order.customer.businessName || order.customer.contactName || 'Unknown',
        address: {
          street: order.customer.address || undefined,
          city: order.customer.city || undefined,
          state: order.customer.state || undefined,
          zipCode: order.customer.zipCode || undefined,
        },
        phone: order.customer.phone || undefined,
        email: order.customer.email || undefined,
      } : undefined,
      items: order.items.map(item => ({
        productId: item.productId,
        productName: item.product?.name || 'Unknown Product',
        brand: item.product?.brand?.name,
        sku: item.product?.sku,
        quantity: item.quantity,
        unitPrice: Number(item.priceCase),
        totalPrice: Number(item.priceCase) * item.quantity,
      })),
      totals: {
        total: Number(order.total),
        itemCount: order.items.length,
        totalUnits: order.items.reduce((sum, i) => sum + i.quantity, 0),
      },
    }
  } catch (error) {
    console.error('Error building print payload:', error)
    return null
  }
}

/**
 * Validate payload shape
 */
export function validatePayloadShape(payload: PackingSlipOrder): { valid: boolean; errors: string[] } {
  const errors: string[] = []

  if (!payload.orderId) errors.push('Missing orderId')
  if (!payload.orderDate) errors.push('Missing orderDate')
  if (!payload.status) errors.push('Missing status')
  if (!Array.isArray(payload.items) || payload.items.length === 0) {
    errors.push('Missing or empty items array')
  }

  return {
    valid: errors.length === 0,
    errors,
  }
}

/**
 * Map Prisma order to PackingSlipOrder (legacy function for compatibility)
 */
export function mapOrderToPackingSlip(order: any): PackingSlipOrder {
  return {
    orderId: order.id,
    orderNumber: order.id,
    orderDate: order.createdAt,
    confirmationDate: order.createdAt,
    status: order.status,
    store: order.customer ? {
      id: order.customer.id,
      name: order.customer.businessName || order.customer.contactName || 'Unknown',
      address: {
        street: order.customer.address || undefined,
        city: order.customer.city || undefined,
        state: order.customer.state || undefined,
        zipCode: order.customer.zipCode || undefined,
      },
      phone: order.customer.phone || undefined,
      email: order.customer.email || undefined,
    } : undefined,
    items: order.items.map((item: any) => ({
      productId: item.productId,
      productName: item.product?.name || 'Unknown Product',
      brand: item.product?.brand?.name,
      sku: item.product?.sku,
      quantity: item.quantity,
      unitPrice: Number(item.priceCase),
      totalPrice: Number(item.priceCase) * item.quantity,
    })),
    totals: {
      total: Number(order.total),
      itemCount: order.items.length,
      totalUnits: order.items.reduce((sum: number, i: any) => sum + i.quantity, 0),
    },
  }
}

