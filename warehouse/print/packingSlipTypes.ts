/**
 * Packing Slip Types
 * Type definitions for packing slip data
 */

export interface PackingSlipOrder {
  orderId: string
  orderNumber?: string
  orderDate: Date
  confirmationDate?: Date
  status: string
  salesRep?: string
  store?: {
    id: string
    name: string
    code?: string
    address?: {
      street?: string
      city?: string
      state?: string
      zipCode?: string
    }
    phone?: string
    email?: string
  }
  items: Array<{
    productId: string
    productName: string
    brand?: string
    sku?: string
    quantity: number
    unitType?: string
    unitPrice?: number
    totalPrice?: number
    warehouseLocation?: string
  }>
  totals?: {
    subtotal?: number
    tax?: number
    discount?: number
    total?: number
    itemCount?: number
    totalUnits?: number
  }
}

