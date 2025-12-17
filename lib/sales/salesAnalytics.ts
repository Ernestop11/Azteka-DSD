/**
 * Sales Analytics
 *
 * Customer analytics: recency, frequency, category mix, brand mix.
 * Provides insights for smart recommendations and rep dashboards.
 */

import { z } from 'zod';

// ============================================================================
// TYPES & SCHEMAS
// ============================================================================

export const OrderHistorySchema = z.object({
  order_id: z.number().int().positive(),
  customer_id: z.number().int().positive(),
  order_date: z.date(),
  total: z.number().positive(),
  items: z.array(
    z.object({
      product_id: z.number().int().positive(),
      sku: z.string(),
      name: z.string(),
      category_id: z.number().int().positive(),
      category_name: z.string().optional(),
      brand_id: z.number().int().positive().optional().nullable(),
      brand_name: z.string().optional().nullable(),
      quantity: z.number().int().positive(),
      price: z.number().positive(),
    })
  ),
});

export type OrderHistory = z.infer<typeof OrderHistorySchema>;

export interface CustomerAnalytics {
  customer_id: number;
  recency: {
    last_order_date: Date | null;
    days_since_last_order: number | null;
    recency_score: number; // 0-100
  };
  frequency: {
    total_orders: number;
    orders_last_30_days: number;
    orders_last_90_days: number;
    avg_days_between_orders: number | null;
    frequency_score: number; // 0-100
  };
  monetary: {
    total_spend: number;
    avg_order_value: number;
    lifetime_value: number;
  };
  category_mix: {
    category_id: number;
    category_name: string;
    order_count: number;
    total_spend: number;
    percentage: number;
  }[];
  brand_mix: {
    brand_id: number;
    brand_name: string;
    order_count: number;
    total_spend: number;
    percentage: number;
  }[];
  top_products: {
    product_id: number;
    sku: string;
    name: string;
    order_count: number;
    total_quantity: number;
    total_spend: number;
  }[];
}

// ============================================================================
// ANALYTICS CALCULATION
// ============================================================================

/**
 * Calculates complete customer analytics
 *
 * @param customerId - Customer ID
 * @param orders - Complete order history
 * @returns Customer analytics
 */
export function calculateCustomerAnalytics(
  customerId: number,
  orders: OrderHistory[]
): CustomerAnalytics {
  const recency = calculateRecency(orders);
  const frequency = calculateFrequency(orders);
  const monetary = calculateMonetary(orders);
  const category_mix = calculateCategoryMix(orders);
  const brand_mix = calculateBrandMix(orders);
  const top_products = calculateTopProducts(orders);

  return {
    customer_id: customerId,
    recency,
    frequency,
    monetary,
    category_mix,
    brand_mix,
    top_products,
  };
}

/**
 * Calculates recency metrics
 */
function calculateRecency(orders: OrderHistory[]): CustomerAnalytics['recency'] {
  if (orders.length === 0) {
    return {
      last_order_date: null,
      days_since_last_order: null,
      recency_score: 0,
    };
  }

  const sortedOrders = [...orders].sort((a, b) => b.order_date.getTime() - a.order_date.getTime());
  const lastOrderDate = sortedOrders[0].order_date;
  const daysSince = Math.floor((Date.now() - lastOrderDate.getTime()) / (1000 * 60 * 60 * 24));

  // Recency score: 100 if ordered today, decreases over time
  const recencyScore = Math.max(0, 100 - daysSince * 2);

  return {
    last_order_date: lastOrderDate,
    days_since_last_order: daysSince,
    recency_score: Math.round(recencyScore),
  };
}

/**
 * Calculates frequency metrics
 */
function calculateFrequency(orders: OrderHistory[]): CustomerAnalytics['frequency'] {
  const now = Date.now();
  const thirtyDaysAgo = now - 30 * 24 * 60 * 60 * 1000;
  const ninetyDaysAgo = now - 90 * 24 * 60 * 60 * 1000;

  const ordersLast30 = orders.filter((o) => o.order_date.getTime() >= thirtyDaysAgo).length;
  const ordersLast90 = orders.filter((o) => o.order_date.getTime() >= ninetyDaysAgo).length;

  // Calculate average days between orders
  let avgDaysBetween: number | null = null;
  if (orders.length > 1) {
    const sortedDates = orders
      .map((o) => o.order_date.getTime())
      .sort((a, b) => a - b);

    const gaps = sortedDates.slice(1).map((date, i) => date - sortedDates[i]);
    const avgGap = gaps.reduce((sum, gap) => sum + gap, 0) / gaps.length;
    avgDaysBetween = Math.round(avgGap / (1000 * 60 * 60 * 24));
  }

  // Frequency score based on orders in last 90 days
  const frequencyScore = Math.min(100, ordersLast90 * 10);

  return {
    total_orders: orders.length,
    orders_last_30_days: ordersLast30,
    orders_last_90_days: ordersLast90,
    avg_days_between_orders: avgDaysBetween,
    frequency_score: Math.round(frequencyScore),
  };
}

/**
 * Calculates monetary metrics
 */
function calculateMonetary(orders: OrderHistory[]): CustomerAnalytics['monetary'] {
  const totalSpend = orders.reduce((sum, o) => sum + o.total, 0);
  const avgOrderValue = orders.length > 0 ? totalSpend / orders.length : 0;

  return {
    total_spend: round2(totalSpend),
    avg_order_value: round2(avgOrderValue),
    lifetime_value: round2(totalSpend),
  };
}

/**
 * Calculates category mix
 */
function calculateCategoryMix(orders: OrderHistory[]): CustomerAnalytics['category_mix'] {
  const categoryStats = new Map<
    number,
    { name: string; order_count: number; total_spend: number }
  >();

  orders.forEach((order) => {
    order.items.forEach((item) => {
      const existing = categoryStats.get(item.category_id);
      if (existing) {
        existing.order_count++;
        existing.total_spend += item.price * item.quantity;
      } else {
        categoryStats.set(item.category_id, {
          name: item.category_name || `Category ${item.category_id}`,
          order_count: 1,
          total_spend: item.price * item.quantity,
        });
      }
    });
  });

  const totalSpend = Array.from(categoryStats.values()).reduce(
    (sum, cat) => sum + cat.total_spend,
    0
  );

  return Array.from(categoryStats.entries())
    .map(([category_id, stats]) => ({
      category_id,
      category_name: stats.name,
      order_count: stats.order_count,
      total_spend: round2(stats.total_spend),
      percentage: round2((stats.total_spend / totalSpend) * 100),
    }))
    .sort((a, b) => b.total_spend - a.total_spend);
}

/**
 * Calculates brand mix
 */
function calculateBrandMix(orders: OrderHistory[]): CustomerAnalytics['brand_mix'] {
  const brandStats = new Map<
    number,
    { name: string; order_count: number; total_spend: number }
  >();

  orders.forEach((order) => {
    order.items.forEach((item) => {
      if (item.brand_id) {
        const existing = brandStats.get(item.brand_id);
        if (existing) {
          existing.order_count++;
          existing.total_spend += item.price * item.quantity;
        } else {
          brandStats.set(item.brand_id, {
            name: item.brand_name || `Brand ${item.brand_id}`,
            order_count: 1,
            total_spend: item.price * item.quantity,
          });
        }
      }
    });
  });

  const totalSpend = Array.from(brandStats.values()).reduce(
    (sum, brand) => sum + brand.total_spend,
    0
  );

  return Array.from(brandStats.entries())
    .map(([brand_id, stats]) => ({
      brand_id,
      brand_name: stats.name,
      order_count: stats.order_count,
      total_spend: round2(stats.total_spend),
      percentage: round2((stats.total_spend / totalSpend) * 100),
    }))
    .sort((a, b) => b.total_spend - a.total_spend)
    .slice(0, 10); // Top 10 brands
}

/**
 * Calculates top products
 */
function calculateTopProducts(
  orders: OrderHistory[]
): CustomerAnalytics['top_products'] {
  const productStats = new Map<
    number,
    { sku: string; name: string; order_count: number; total_quantity: number; total_spend: number }
  >();

  orders.forEach((order) => {
    order.items.forEach((item) => {
      const existing = productStats.get(item.product_id);
      if (existing) {
        existing.order_count++;
        existing.total_quantity += item.quantity;
        existing.total_spend += item.price * item.quantity;
      } else {
        productStats.set(item.product_id, {
          sku: item.sku,
          name: item.name,
          order_count: 1,
          total_quantity: item.quantity,
          total_spend: item.price * item.quantity,
        });
      }
    });
  });

  return Array.from(productStats.entries())
    .map(([product_id, stats]) => ({
      product_id,
      sku: stats.sku,
      name: stats.name,
      order_count: stats.order_count,
      total_quantity: stats.total_quantity,
      total_spend: round2(stats.total_spend),
    }))
    .sort((a, b) => b.order_count - a.order_count)
    .slice(0, 20); // Top 20 products
}

function round2(num: number): number {
  return Math.round(num * 100) / 100;
}

/**
 * Calculates RFM score (Recency, Frequency, Monetary)
 */
export function calculateRFMScore(analytics: CustomerAnalytics): {
  recency: number;
  frequency: number;
  monetary: number;
  total: number;
  segment: 'champion' | 'loyal' | 'at_risk' | 'churned';
} {
  const r = analytics.recency.recency_score;
  const f = analytics.frequency.frequency_score;
  const m = Math.min(100, (analytics.monetary.total_spend / 1000) * 100);

  const total = Math.round((r + f + m) / 3);

  let segment: 'champion' | 'loyal' | 'at_risk' | 'churned';
  if (total >= 75) segment = 'champion';
  else if (total >= 50) segment = 'loyal';
  else if (total >= 25) segment = 'at_risk';
  else segment = 'churned';

  return { recency: r, frequency: f, monetary: m, total, segment };
}
