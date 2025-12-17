/**
 * Order Sanitization Utilities
 * Strips unexpected fields and normalizes data types
 */

export interface RawOrderItem {
  productId?: any
  quantity?: any
  priceCase?: any
  priceUnit?: any
  [key: string]: any
}

export interface SanitizedOrderItem {
  productId: string
  quantity: number
  priceCase: number
}

export interface RawOrder {
  customerId?: any
  items?: any[]
  metadata?: any
  [key: string]: any
}

export interface SanitizedOrder {
  customerId: string
  items: SanitizedOrderItem[]
  metadata?: Record<string, any>
}

/**
 * Sanitize a single order item
 */
export function sanitizeOrderItem(item: RawOrderItem): SanitizedOrderItem | null {
  if (!item || typeof item !== 'object') {
    return null
  }

  // Extract and validate productId
  const productId = item.productId
  if (!productId || typeof productId !== 'string') {
    return null
  }

  // Extract and normalize quantity
  let quantity = item.quantity
  if (typeof quantity === 'string') {
    quantity = parseInt(quantity, 10)
  }
  if (typeof quantity !== 'number' || isNaN(quantity) || quantity <= 0) {
    return null
  }
  quantity = Math.floor(quantity) // Ensure integer

  // Extract and normalize priceCase
  let priceCase = item.priceCase
  if (priceCase === undefined || priceCase === null) {
    // Fallback to priceUnit if priceCase not provided
    priceCase = item.priceUnit
  }
  if (typeof priceCase === 'string') {
    priceCase = parseFloat(priceCase)
  }
  if (typeof priceCase !== 'number' || isNaN(priceCase) || priceCase < 0) {
    return null
  }
  priceCase = Number(priceCase.toFixed(2)) // Round to 2 decimals

  return {
    productId: String(productId).trim(),
    quantity,
    priceCase,
  }
}

/**
 * Sanitize order metadata
 */
function sanitizeMetadata(metadata: any): Record<string, any> | undefined {
  if (!metadata || typeof metadata !== 'object') {
    return undefined
  }

  // Only allow safe, serializable values
  const sanitized: Record<string, any> = {}
  for (const [key, value] of Object.entries(metadata)) {
    if (typeof key !== 'string') continue

    // Allow primitive types and arrays of primitives
    if (
      value === null ||
      typeof value === 'string' ||
      typeof value === 'number' ||
      typeof value === 'boolean' ||
      (Array.isArray(value) && value.every(v => 
        typeof v === 'string' || typeof v === 'number' || typeof v === 'boolean'
      ))
    ) {
      sanitized[key] = value
    }
  }

  return Object.keys(sanitized).length > 0 ? sanitized : undefined
}

/**
 * Sanitize a complete order
 */
export function sanitizeOrder(order: RawOrder): SanitizedOrder | null {
  if (!order || typeof order !== 'object') {
    return null
  }

  // Extract and validate customerId
  const customerId = order.customerId
  if (!customerId || typeof customerId !== 'string') {
    return null
  }

  // Extract and sanitize items
  const items = order.items
  if (!Array.isArray(items) || items.length === 0) {
    return null
  }

  const sanitizedItems: SanitizedOrderItem[] = []
  for (const item of items) {
    const sanitized = sanitizeOrderItem(item)
    if (sanitized) {
      sanitizedItems.push(sanitized)
    }
  }

  if (sanitizedItems.length === 0) {
    return null
  }

  // Sanitize metadata
  const metadata = sanitizeMetadata(order.metadata)

  return {
    customerId: String(customerId).trim(),
    items: sanitizedItems,
    metadata,
  }
}

/**
 * Sanitize an array of orders (multi-order)
 */
export function sanitizeMultiOrder(orders: any[]): SanitizedOrder[] {
  if (!Array.isArray(orders)) {
    return []
  }

  const sanitized: SanitizedOrder[] = []
  for (const order of orders) {
    const sanitizedOrder = sanitizeOrder(order)
    if (sanitizedOrder) {
      sanitized.push(sanitizedOrder)
    }
  }

  return sanitized
}

