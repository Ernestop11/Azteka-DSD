/**
 * Common Type Definitions
 *
 * Shared types used across all modules.
 * Provides consistent type signatures for Cursor autocomplete.
 */

import { z } from 'zod';

// ============================================================================
// PRODUCT TYPES
// ============================================================================

export const ProductSchema = z.object({
  id: z.number().int().positive(),
  sku: z.string(),
  name: z.string(),
  category_id: z.number().int().positive(),
  category_name: z.string().optional(),
  brand_id: z.number().int().positive().optional().nullable(),
  brand_name: z.string().optional().nullable(),
  price_case: z.number().positive(),
  price_unit: z.number().positive().optional().nullable(),
  in_stock: z.boolean().default(true),
  featured: z.boolean().default(false),
  seasonal: z.boolean().default(false),
  seasonal_theme: z.string().optional().nullable(),
  seasonal_start: z.string().optional().nullable(),
  seasonal_end: z.string().optional().nullable(),
  new_arrival: z.boolean().default(false),
  trending: z.boolean().default(false),
  image_url: z.string().url().optional().nullable(),
  thumbnail_url: z.string().url().optional().nullable(),
  description: z.string().optional().nullable(),
  // Visual fields
  background_color: z.string().optional().nullable(),
  background_gradient: z.string().optional().nullable(),
  text_color: z.string().optional().nullable(),
  visual_preset: z.string().optional().nullable(),
  glow_preset: z.string().optional().nullable(),
  splash_overlay: z.string().optional().nullable(),
});

export type Product = z.infer<typeof ProductSchema>;

// ============================================================================
// CUSTOMER TYPES
// ============================================================================

export const CustomerSchema = z.object({
  id: z.number().int().positive(),
  name: z.string(),
  email: z.string().email().optional().nullable(),
  phone: z.string().optional().nullable(),
  store_type: z.string().optional().nullable(),
  location: z.string().optional().nullable(),
  active: z.boolean().default(true),
  credit_limit: z.number().min(0).optional().nullable(),
  payment_terms: z.string().optional().nullable(),
  created_at: z.date().optional(),
  updated_at: z.date().optional(),
});

export type Customer = z.infer<typeof CustomerSchema>;

// ============================================================================
// ORDER TYPES
// ============================================================================

export const OrderItemSchema = z.object({
  id: z.number().int().positive().optional(),
  order_id: z.number().int().positive().optional(),
  product_id: z.number().int().positive(),
  sku: z.string(),
  name: z.string(),
  quantity: z.number().int().positive(),
  price_case: z.number().positive(),
  price_unit: z.number().positive().optional().nullable(),
  discount_applied: z.number().min(0).optional(),
  line_total: z.number().positive(),
});

export const OrderSchema = z.object({
  id: z.number().int().positive(),
  customer_id: z.number().int().positive(),
  order_date: z.date(),
  delivery_date: z.date().optional().nullable(),
  status: z.enum(['pending', 'confirmed', 'shipped', 'delivered', 'cancelled']),
  items: z.array(OrderItemSchema),
  subtotal: z.number().positive(),
  discount_total: z.number().min(0),
  tax: z.number().min(0).optional(),
  total: z.number().positive(),
  notes: z.string().optional().nullable(),
  created_at: z.date().optional(),
  updated_at: z.date().optional(),
});

export type OrderItem = z.infer<typeof OrderItemSchema>;
export type Order = z.infer<typeof OrderSchema>;

// ============================================================================
// CATEGORY & BRAND TYPES
// ============================================================================

export const CategorySchema = z.object({
  id: z.number().int().positive(),
  name: z.string(),
  slug: z.string(),
  description: z.string().optional().nullable(),
  parent_id: z.number().int().positive().optional().nullable(),
  display_order: z.number().int().default(0),
  active: z.boolean().default(true),
});

export const BrandSchema = z.object({
  id: z.number().int().positive(),
  name: z.string(),
  slug: z.string(),
  logo_url: z.string().url().optional().nullable(),
  active: z.boolean().default(true),
});

export type Category = z.infer<typeof CategorySchema>;
export type Brand = z.infer<typeof BrandSchema>;

// ============================================================================
// API RESPONSE TYPES
// ============================================================================

export interface APIResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: unknown;
  };
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
  };
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// ============================================================================
// UTILITY TYPES
// ============================================================================

export type ID = number;

export type Timestamp = Date | string;

export type Nullable<T> = T | null;

export type Optional<T> = T | undefined;

export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

// ============================================================================
// VALIDATION HELPERS
// ============================================================================

/**
 * Type guard: checks if value is a valid Product
 */
export function isProduct(value: unknown): value is Product {
  return ProductSchema.safeParse(value).success;
}

/**
 * Type guard: checks if value is a valid Customer
 */
export function isCustomer(value: unknown): value is Customer {
  return CustomerSchema.safeParse(value).success;
}

/**
 * Type guard: checks if value is a valid Order
 */
export function isOrder(value: unknown): value is Order {
  return OrderSchema.safeParse(value).success;
}
