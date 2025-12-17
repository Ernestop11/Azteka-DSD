/**
 * Order to Print Payload Mapper
 * Maps Prisma order structure to packing slip template format
 *
 * LAP W1: Final Integration - Order Confirmation → Print Pipeline
 */

import prisma from '@/lib/prisma'
import type { PackingSlipOrder } from './packingSlipTypes'

// ============================================================================
// VALIDATION
// ============================================================================

/**
 * Validate order is ready for printing
 */
export function validateOrderForPrint(order: any): {
  valid: boolean
  errors: string[]
} {
  const errors: string[] = []

  if (!order) {
    errors.push('Order not found')
    return { valid: false, errors }
  }

  if (!order.id) {
    errors.push('Order ID missing')
  }

  if (!order.customer) {
    errors.push('Order customer missing')
  }

  if (!order.items || order.items.length === 0) {
    errors.push('Order has no items')
  }

  // Validate order status is printable
  const printableStatuses = ['NEW', 'PICKING', 'PICKED', 'OUT_FOR_DELIVERY']
  if (order.status && !printableStatuses.includes(order.status)) {
    errors.push(`Order status '${order.status}' is not printable`)
  }

  return {
    valid: errors.length === 0,
    errors,
  }
}

// ============================================================================
// PAYLOAD BUILDER
// ============================================================================

/**
 * Build print payload from order ID
 * Main integration point - fetches order and maps to packing slip format
 */
export async function buildPrintPayload(orderId: string): Promise<PackingSlipOrder | null> {
  try {
    // Fetch order with all relations
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        customer: true,
        user: true,
        items: {
          include: {
            product: {
              include: {
                brand: true,
                category: true,
              },
            },
          },
        },
      },
    })

    if (!order) {
      console.warn(`[OrderMapper] Order ${orderId} not found`)
      return null
    }

    // Validate order
    const validation = validateOrderForPrint(order)
    if (!validation.valid) {
      console.error(`[OrderMapper] Order ${orderId} validation failed:`, validation.errors)
      return null
    }

    // Map to packing slip format
    return mapOrderToPackingSlip(order)
  } catch (error) {
    console.error(`[OrderMapper] Error building print payload for ${orderId}:`, error)
    return null
  }
}

/**
 * Map Prisma order to PackingSlipOrder format
 */
function mapOrderToPackingSlip(order: any): PackingSlipOrder {
  return {
    // Order identification
    orderId: order.id,
    orderNumber: formatOrderNumber(order.id, order.createdAt),
    orderDate: order.createdAt,
    confirmationDate: order.createdAt, // Use createdAt as confirmation (or add confirmedAt field)
    status: mapOrderStatus(order.status),
    salesRep: order.user?.name || undefined,

    // Store/customer information
    store: {
      id: order.customer.id,
      name: order.customer.businessName || order.customer.contactName || 'Unknown Customer',
      code: generateStoreCode(order.customer),
      address: {
        street: order.customer.address || '',
        city: order.customer.city || '',
        state: order.customer.state || '',
        zipCode: order.customer.zipCode || '',
      },
      phone: order.customer.phone || undefined,
      email: order.customer.email || undefined,
    },

    // Line items
    items: order.items.map((item: any, index: number) => ({
      productId: item.productId,
      productName: item.product.name,
      brand: item.product.brand?.name || undefined,
      sku: item.product.sku || undefined,
      quantity: item.quantity,
      unitType: 'case', // Default to case
      unitsPerCase: item.product.unitsPerCase || 1,
      unitPrice: Number(item.priceCase),
      totalPrice: Number(item.priceCase) * item.quantity,
      warehouseLocation: generateWarehouseLocation(item.product, index),
    })),

    // Totals
    totals: {
      subtotal: Number(order.total),
      tax: undefined, // Tax not currently tracked separately
      discount: 0,
      total: Number(order.total),
      itemCount: order.items.length,
      totalUnits: order.items.reduce((sum: number, item: any) => {
        return sum + (item.quantity * (item.product.unitsPerCase || 1))
      }, 0),
    },
  }
}

// ============================================================================
// MAPPING UTILITIES
// ============================================================================

/**
 * Map OrderStatus enum to packing slip status
 */
function mapOrderStatus(status: string): PackingSlipOrder['status'] {
  switch (status) {
    case 'NEW':
      return 'confirmed'
    case 'PICKING':
      return 'confirmed'
    case 'PICKED':
      return 'packed'
    case 'OUT_FOR_DELIVERY':
      return 'shipped'
    case 'DELIVERED':
      return 'delivered'
    case 'CANCELLED':
      return 'pending' // Map cancelled to pending to avoid errors
    default:
      return 'pending'
  }
}

/**
 * Format order number for display
 */
function formatOrderNumber(orderId: string, createdAt: Date): string {
  // Format: ORD-YYYYMMDD-XXXX
  const date = new Date(createdAt)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const shortId = orderId.substring(0, 8).toUpperCase()

  return `ORD-${year}${month}${day}-${shortId}`
}

/**
 * Generate store code from customer data
 */
function generateStoreCode(customer: any): string | undefined {
  if (!customer.businessName) return undefined

  // Create 2-3 letter code from business name
  const words = customer.businessName.split(' ')
  if (words.length >= 2) {
    return words.slice(0, 2).map(w => w[0]).join('').toUpperCase()
  }

  return customer.businessName.substring(0, 3).toUpperCase()
}

/**
 * Generate warehouse location from product data
 * TODO: Replace with actual warehouse location field when available
 */
function generateWarehouseLocation(product: any, index: number): string | undefined {
  // Temporary location assignment based on category/brand
  // This should be replaced with actual warehouse.location field

  if (product.category?.name) {
    const categoryCode = product.category.name.substring(0, 1).toUpperCase()
    const slot = String(index + 1).padStart(2, '0')
    return `${categoryCode}1-${slot}`
  }

  // Default to sequential slots
  const zone = String.fromCharCode(65 + (index % 5)) // A-E
  const slot = String(Math.floor(index / 5) + 1).padStart(2, '0')
  return `${zone}1-${slot}`
}

// ============================================================================
// BATCH OPERATIONS
// ============================================================================

/**
 * Build print payloads for multiple orders
 */
export async function buildBatchPrintPayloads(
  orderIds: string[]
): Promise<Array<{ orderId: string; payload: PackingSlipOrder | null; error?: string }>> {
  const results = await Promise.allSettled(
    orderIds.map(async (orderId) => {
      const payload = await buildPrintPayload(orderId)
      return { orderId, payload }
    })
  )

  return results.map((result, index) => {
    if (result.status === 'fulfilled') {
      return result.value
    } else {
      return {
        orderId: orderIds[index],
        payload: null,
        error: result.reason?.message || 'Unknown error',
      }
    }
  })
}

/**
 * Validate payload shape matches packing slip requirements
 */
export function validatePayloadShape(payload: any): {
  valid: boolean
  errors: string[]
} {
  const errors: string[] = []

  // Required fields
  if (!payload.orderId) errors.push('Missing orderId')
  if (!payload.orderNumber) errors.push('Missing orderNumber')
  if (!payload.orderDate) errors.push('Missing orderDate')
  if (!payload.status) errors.push('Missing status')

  // Store validation
  if (!payload.store) {
    errors.push('Missing store')
  } else {
    if (!payload.store.id) errors.push('Missing store.id')
    if (!payload.store.name) errors.push('Missing store.name')
    if (!payload.store.address) errors.push('Missing store.address')
  }

  // Items validation
  if (!payload.items || !Array.isArray(payload.items)) {
    errors.push('Missing or invalid items array')
  } else if (payload.items.length === 0) {
    errors.push('Items array is empty')
  } else {
    payload.items.forEach((item: any, index: number) => {
      if (!item.productId) errors.push(`Item ${index}: missing productId`)
      if (!item.productName) errors.push(`Item ${index}: missing productName`)
      if (typeof item.quantity !== 'number') errors.push(`Item ${index}: invalid quantity`)
    })
  }

  // Totals validation
  if (!payload.totals) {
    errors.push('Missing totals')
  } else {
    if (typeof payload.totals.total !== 'number') errors.push('Invalid totals.total')
    if (typeof payload.totals.itemCount !== 'number') errors.push('Invalid totals.itemCount')
    if (typeof payload.totals.totalUnits !== 'number') errors.push('Invalid totals.totalUnits')
  }

  return {
    valid: errors.length === 0,
    errors,
  }
}

// ============================================================================
// EXPORTS
// ============================================================================

export const orderMapper = {
  buildPrintPayload,
  buildBatchPrintPayloads,
  validateOrderForPrint,
  validatePayloadShape,
  mapOrderToPackingSlip,
}

export default orderMapper
