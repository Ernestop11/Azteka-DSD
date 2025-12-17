/**
 * Order Validation Utilities
 * Ensures order integrity before processing
 */

import prisma from '@/lib/prisma'
import type { CartProduct, StoreGroup } from '@/context/CartContext'

export interface ValidationError {
  field: string
  message: string
  code: string
}

export interface ValidationResult {
  valid: boolean
  errors: ValidationError[]
}

/**
 * Validate a single order item
 */
async function validateOrderItem(
  productId: string,
  quantity: number,
  index: number
): Promise<ValidationError[]> {
  const errors: ValidationError[] = []

  // Validate productId format
  if (!productId || typeof productId !== 'string') {
    errors.push({
      field: `items[${index}].productId`,
      message: 'Product ID is required and must be a string',
      code: 'INVALID_PRODUCT_ID',
    })
    return errors
  }

  // Validate UUID format
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
  if (!uuidRegex.test(productId)) {
    errors.push({
      field: `items[${index}].productId`,
      message: 'Product ID must be a valid UUID',
      code: 'INVALID_UUID_FORMAT',
    })
    return errors
  }

  // Check if product exists
  try {
    const product = await prisma.product.findUnique({
      where: { id: productId },
    })

    if (!product) {
      errors.push({
        field: `items[${index}].productId`,
        message: `Product with ID ${productId} not found`,
        code: 'PRODUCT_NOT_FOUND',
      })
    }
  } catch (error) {
    errors.push({
      field: `items[${index}].productId`,
      message: 'Failed to validate product existence',
      code: 'PRODUCT_VALIDATION_ERROR',
    })
  }

  // Validate quantity
  if (typeof quantity !== 'number' || quantity <= 0 || !Number.isInteger(quantity)) {
    errors.push({
      field: `items[${index}].quantity`,
      message: 'Quantity must be a positive integer',
      code: 'INVALID_QUANTITY',
    })
  }

  return errors
}

/**
 * Validate customer exists
 */
async function validateCustomer(customerId: string): Promise<ValidationError[]> {
  const errors: ValidationError[] = []

  if (!customerId || typeof customerId !== 'string') {
    errors.push({
      field: 'customerId',
      message: 'Customer ID is required',
      code: 'MISSING_CUSTOMER_ID',
    })
    return errors
  }

  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
  if (!uuidRegex.test(customerId)) {
    errors.push({
      field: 'customerId',
      message: 'Customer ID must be a valid UUID',
      code: 'INVALID_CUSTOMER_UUID',
    })
    return errors
  }

  try {
    const customer = await prisma.customer.findUnique({
      where: { id: customerId },
    })

    if (!customer) {
      errors.push({
        field: 'customerId',
        message: `Customer with ID ${customerId} not found`,
        code: 'CUSTOMER_NOT_FOUND',
      })
    }
  } catch (error) {
    errors.push({
      field: 'customerId',
      message: 'Failed to validate customer existence',
      code: 'CUSTOMER_VALIDATION_ERROR',
    })
  }

  return errors
}

/**
 * Validate store group integrity for MultiStoreOrder
 */
function validateStoreGroup(storeGroup: StoreGroup): ValidationError[] {
  const errors: ValidationError[] = []

  if (!storeGroup.storeId || typeof storeGroup.storeId !== 'string') {
    errors.push({
      field: 'storeGroup.storeId',
      message: 'Store ID is required',
      code: 'MISSING_STORE_ID',
    })
  }

  if (!Array.isArray(storeGroup.items) || storeGroup.items.length === 0) {
    errors.push({
      field: 'storeGroup.items',
      message: 'Store group must have at least one item',
      code: 'EMPTY_STORE_GROUP',
    })
  }

  // Check for duplicate products
  const productIds = new Set<string>()
  storeGroup.items.forEach((item, index) => {
    if (productIds.has(item.id)) {
      errors.push({
        field: `storeGroup.items[${index}].id`,
        message: `Duplicate product ${item.id} in store group`,
        code: 'DUPLICATE_PRODUCT',
      })
    }
    productIds.add(item.id)
  })

  // Validate totals match items
  const calculatedSubtotal = storeGroup.items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  )

  const tolerance = 0.01 // Allow small floating point differences
  if (Math.abs(calculatedSubtotal - storeGroup.subtotal) > tolerance) {
    errors.push({
      field: 'storeGroup.subtotal',
      message: `Subtotal mismatch: calculated ${calculatedSubtotal}, provided ${storeGroup.subtotal}`,
      code: 'SUBTOTAL_MISMATCH',
    })
  }

  return errors
}

/**
 * Validate a complete order
 */
export async function validateOrder(
  customerId: string,
  items: Array<{ productId: string; quantity: number; priceCase: number }>
): Promise<ValidationResult> {
  const errors: ValidationError[] = []

  // Validate customer
  const customerErrors = await validateCustomer(customerId)
  errors.push(...customerErrors)

  // Validate items
  if (!Array.isArray(items) || items.length === 0) {
    errors.push({
      field: 'items',
      message: 'Order must have at least one item',
      code: 'EMPTY_ORDER',
    })
    return { valid: false, errors }
  }

  // Validate each item
  for (let i = 0; i < items.length; i++) {
    const item = items[i]
    const itemErrors = await validateOrderItem(item.productId, item.quantity, i)

    // Validate priceCase
    if (typeof item.priceCase !== 'number' || item.priceCase < 0) {
      itemErrors.push({
        field: `items[${i}].priceCase`,
        message: 'Price must be a non-negative number',
        code: 'INVALID_PRICE',
      })
    }

    errors.push(...itemErrors)
  }

  return {
    valid: errors.length === 0,
    errors,
  }
}

/**
 * Validate a multi-store order (array of orders)
 */
export async function validateMultiOrder(
  orders: Array<{
    customerId: string
    items: Array<{ productId: string; quantity: number; priceCase: number }>
  }>
): Promise<ValidationResult> {
  const errors: ValidationError[] = []

  if (!Array.isArray(orders) || orders.length === 0) {
    errors.push({
      field: 'orders',
      message: 'Multi-order must contain at least one order',
      code: 'EMPTY_MULTI_ORDER',
    })
    return { valid: false, errors }
  }

  // Validate each order
  for (let i = 0; i < orders.length; i++) {
    const order = orders[i]
    const orderErrors = await validateOrder(order.customerId, order.items)
    
    orderErrors.errors.forEach(error => {
      errors.push({
        ...error,
        field: `orders[${i}].${error.field}`,
      })
    })
  }

  return {
    valid: errors.length === 0,
    errors,
  }
}

/**
 * Validate store groups from CartContext
 */
export async function validateStoreGroups(
  storeGroups: StoreGroup[]
): Promise<ValidationResult> {
  const errors: ValidationError[] = []

  if (!Array.isArray(storeGroups) || storeGroups.length === 0) {
    errors.push({
      field: 'storeGroups',
      message: 'Must have at least one store group',
      code: 'EMPTY_STORE_GROUPS',
    })
    return { valid: false, errors }
  }

  // Validate each store group
  for (let i = 0; i < storeGroups.length; i++) {
    const storeGroup = storeGroups[i]
    const groupErrors = validateStoreGroup(storeGroup)
    
    groupErrors.forEach(error => {
      errors.push({
        ...error,
        field: `storeGroups[${i}].${error.field}`,
      })
    })

    // Validate customer for each store
    if (storeGroup.storeId) {
      const customerErrors = await validateCustomer(storeGroup.storeId)
      customerErrors.forEach(error => {
        errors.push({
          ...error,
          field: `storeGroups[${i}].${error.field}`,
        })
      })
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  }
}

