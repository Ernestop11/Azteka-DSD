/**
 * Customer Pricing Resolution
 *
 * Resolves product pricing with override → promo → default hierarchy.
 * Handles customer-specific pricing, bulk discounts, and promotions.
 */

import { z } from 'zod';

// ============================================================================
// TYPES & SCHEMAS
// ============================================================================

export const PriceOverrideSchema = z.object({
  id: z.number().int().positive(),
  customer_id: z.number().int().positive(),
  product_id: z.number().int().positive(),
  price_case: z.number().positive(),
  price_unit: z.number().positive().optional().nullable(),
  effective_date: z.date().optional(),
  expiration_date: z.date().optional().nullable(),
});

export const PromoSchema = z.object({
  id: z.number().int().positive(),
  name: z.string(),
  product_ids: z.array(z.number().int().positive()),
  category_ids: z.array(z.number().int().positive()).optional(),
  discount_percentage: z.number().min(0).max(100).optional(),
  discount_fixed: z.number().min(0).optional(),
  min_quantity: z.number().int().positive().optional(),
  start_date: z.date(),
  end_date: z.date(),
  active: z.boolean().default(true),
});

export type PriceOverride = z.infer<typeof PriceOverrideSchema>;
export type Promo = z.infer<typeof PromoSchema>;

export interface ProductPricing {
  product_id: number;
  sku: string;
  base_price_case: number;
  base_price_unit?: number | null;
  final_price_case: number;
  final_price_unit?: number | null;
  discount_applied: number; // Amount discounted
  discount_percentage: number; // Percentage discounted
  pricing_source: 'override' | 'promo' | 'default';
  promo_name?: string;
}

// ============================================================================
// PRICING RESOLUTION
// ============================================================================

/**
 * Resolves final pricing for a product
 *
 * Priority: override → promo → default
 *
 * @param productId - Product ID
 * @param customerId - Customer ID
 * @param basePrice - Default product price
 * @param overrides - Customer price overrides
 * @param promos - Active promotions
 * @param quantity - Order quantity (for bulk discounts)
 * @returns Resolved pricing
 */
export function resolveProductPricing(
  productId: number,
  sku: string,
  customerId: number,
  basePrice: { case: number; unit?: number | null },
  overrides: PriceOverride[],
  promos: Promo[],
  quantity: number = 1
): ProductPricing {
  // Check for customer-specific price override
  const override = findActiveOverride(productId, customerId, overrides);

  if (override) {
    return {
      product_id: productId,
      sku,
      base_price_case: basePrice.case,
      base_price_unit: basePrice.unit,
      final_price_case: override.price_case,
      final_price_unit: override.price_unit,
      discount_applied: basePrice.case - override.price_case,
      discount_percentage: ((basePrice.case - override.price_case) / basePrice.case) * 100,
      pricing_source: 'override',
    };
  }

  // Check for active promotions
  const promo = findBestPromo(productId, promos, quantity);

  if (promo) {
    const discountedCase = applyPromoDiscount(basePrice.case, promo);
    const discountedUnit = basePrice.unit ? applyPromoDiscount(basePrice.unit, promo) : null;

    return {
      product_id: productId,
      sku,
      base_price_case: basePrice.case,
      base_price_unit: basePrice.unit,
      final_price_case: discountedCase,
      final_price_unit: discountedUnit,
      discount_applied: basePrice.case - discountedCase,
      discount_percentage: promo.discount_percentage || 0,
      pricing_source: 'promo',
      promo_name: promo.name,
    };
  }

  // Default pricing
  return {
    product_id: productId,
    sku,
    base_price_case: basePrice.case,
    base_price_unit: basePrice.unit,
    final_price_case: basePrice.case,
    final_price_unit: basePrice.unit,
    discount_applied: 0,
    discount_percentage: 0,
    pricing_source: 'default',
  };
}

/**
 * Finds active price override for customer/product
 */
function findActiveOverride(
  productId: number,
  customerId: number,
  overrides: PriceOverride[]
): PriceOverride | null {
  const now = new Date();

  return (
    overrides.find(
      (o) =>
        o.product_id === productId &&
        o.customer_id === customerId &&
        (!o.effective_date || o.effective_date <= now) &&
        (!o.expiration_date || o.expiration_date >= now)
    ) || null
  );
}

/**
 * Finds best applicable promo for product
 */
function findBestPromo(productId: number, promos: Promo[], quantity: number): Promo | null {
  const now = new Date();

  const applicablePromos = promos.filter(
    (p) =>
      p.active &&
      p.start_date <= now &&
      p.end_date >= now &&
      p.product_ids.includes(productId) &&
      (!p.min_quantity || quantity >= p.min_quantity)
  );

  if (applicablePromos.length === 0) return null;

  // Return promo with highest discount
  return applicablePromos.reduce((best, current) => {
    const bestDiscount = best.discount_percentage || best.discount_fixed || 0;
    const currentDiscount = current.discount_percentage || current.discount_fixed || 0;
    return currentDiscount > bestDiscount ? current : best;
  });
}

/**
 * Applies promo discount to price
 */
function applyPromoDiscount(price: number, promo: Promo): number {
  if (promo.discount_percentage) {
    return price * (1 - promo.discount_percentage / 100);
  }

  if (promo.discount_fixed) {
    return Math.max(0, price - promo.discount_fixed);
  }

  return price;
}

/**
 * Calculates bulk pricing for cart
 */
export function calculateCartPricing(
  items: Array<{
    product_id: number;
    sku: string;
    quantity: number;
    base_price: { case: number; unit?: number | null };
  }>,
  customerId: number,
  overrides: PriceOverride[],
  promos: Promo[]
): {
  items: (ProductPricing & { quantity: number; line_total: number })[];
  subtotal: number;
  total_discount: number;
  total: number;
} {
  const pricedItems = items.map((item) => {
    const pricing = resolveProductPricing(
      item.product_id,
      item.sku,
      customerId,
      item.base_price,
      overrides,
      promos,
      item.quantity
    );

    return {
      ...pricing,
      quantity: item.quantity,
      line_total: pricing.final_price_case * item.quantity,
    };
  });

  const subtotal = pricedItems.reduce((sum, item) => sum + item.line_total, 0);
  const totalDiscount = pricedItems.reduce((sum, item) => sum + item.discount_applied * item.quantity, 0);

  return {
    items: pricedItems,
    subtotal: round2(subtotal),
    total_discount: round2(totalDiscount),
    total: round2(subtotal),
  };
}

function round2(num: number): number {
  return Math.round(num * 100) / 100;
}
