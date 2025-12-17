/**
 * Order Preparation
 *
 * Converts cart to API payload format for order submission.
 * Handles validation, formatting, and metadata attachment.
 */

import { z } from 'zod';
import type { Cart, CartItem } from './offlineCart';
import type { ProductPricing } from './customerPricing';

// ============================================================================
// ORDER PAYLOAD SCHEMA
// ============================================================================

export const OrderItemPayloadSchema = z.object({
  product_id: z.number().int().positive(),
  sku: z.string(),
  quantity: z.number().int().positive(),
  price_case: z.number().positive(),
  price_unit: z.number().positive().optional().nullable(),
  discount_applied: z.number().min(0).optional(),
  promo_name: z.string().optional(),
});

export const OrderPayloadSchema = z.object({
  customer_id: z.number().int().positive(),
  items: z.array(OrderItemPayloadSchema).min(1),
  subtotal: z.number().positive(),
  discount_total: z.number().min(0),
  total: z.number().positive(),
  notes: z.string().optional(),
  delivery_date: z.date().optional(),
  metadata: z.record(z.unknown()).optional(),
});

export type OrderItemPayload = z.infer<typeof OrderItemPayloadSchema>;
export type OrderPayload = z.infer<typeof OrderPayloadSchema>;

// ============================================================================
// ORDER PREPARATION
// ============================================================================

/**
 * Prepares order payload from cart
 *
 * @param cart - Shopping cart
 * @param customerId - Customer ID
 * @param pricing - Pricing information for cart items
 * @param options - Additional order options
 * @returns Order payload ready for API
 */
export function prepareOrderPayload(
  cart: Cart,
  customerId: number,
  pricing: {
    items: (ProductPricing & { quantity: number; line_total: number })[];
    subtotal: number;
    total_discount: number;
    total: number;
  },
  options: {
    notes?: string;
    delivery_date?: Date;
    metadata?: Record<string, unknown>;
  } = {}
): OrderPayload {
  const items: OrderItemPayload[] = pricing.items.map((item) => ({
    product_id: item.product_id,
    sku: item.sku,
    quantity: item.quantity,
    price_case: item.final_price_case,
    price_unit: item.final_price_unit,
    discount_applied: item.discount_applied,
    promo_name: item.promo_name,
  }));

  const payload: OrderPayload = {
    customer_id: customerId,
    items,
    subtotal: pricing.subtotal,
    discount_total: pricing.total_discount,
    total: pricing.total,
    notes: options.notes,
    delivery_date: options.delivery_date,
    metadata: options.metadata,
  };

  // Validate before returning
  OrderPayloadSchema.parse(payload);

  return payload;
}

/**
 * Validates order before submission
 */
export function validateOrder(cart: Cart): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (cart.items.length === 0) {
    errors.push('Cart is empty');
  }

  cart.items.forEach((item) => {
    if (item.quantity <= 0) {
      errors.push(`Invalid quantity for ${item.name}`);
    }

    if (item.price_case <= 0) {
      errors.push(`Invalid price for ${item.name}`);
    }
  });

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Calculates order summary
 */
export function calculateOrderSummary(cart: Cart, pricing: {
  subtotal: number;
  total_discount: number;
  total: number;
}): {
  item_count: number;
  total_units: number;
  subtotal: number;
  discount: number;
  total: number;
  avg_discount_percentage: number;
} {
  const item_count = cart.items.length;
  const total_units = cart.items.reduce((sum, item) => sum + item.quantity, 0);
  const avg_discount_percentage =
    pricing.subtotal > 0 ? (pricing.total_discount / (pricing.subtotal + pricing.total_discount)) * 100 : 0;

  return {
    item_count,
    total_units,
    subtotal: pricing.subtotal,
    discount: pricing.total_discount,
    total: pricing.total,
    avg_discount_percentage: Math.round(avg_discount_percentage * 100) / 100,
  };
}
