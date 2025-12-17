import { z } from 'zod'

/**
 * Validation schema for Product visual fields
 * Matches Prisma schema and card-template-wiring.md
 */
export const ProductVisualSchema = z.object({
  // Visual preset fields
  gradientPresetId: z.string().nullable().optional(),
  glowPresetId: z.string().nullable().optional(),
  splashPresetId: z.string().nullable().optional(),
  
  // Enhancement flags
  featured: z.boolean().default(false).optional(),
  seasonal: z.boolean().default(false).optional(),
  trending: z.boolean().default(false).optional(),
  
  // Background customization
  backgroundColor: z.union([
    z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Must be a valid hex color'),
    z.string().length(0),
    z.null(),
  ]).optional(),
  backgroundGradient: z.string().nullable().optional(),
})

export const ProductCreateSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  sku: z.string().min(1, 'SKU is required'),
  description: z.string().nullable().optional(),
  price: z.number().positive('Price must be positive'),
  unitsPerCase: z.number().int().positive('Units per case must be positive'),
  categoryId: z.string().uuid().nullable().optional(),
  brandId: z.string().uuid().nullable().optional(),
  imageUrl: z.string().url().nullable().optional(),
  inStock: z.boolean().default(true).optional(),
}).merge(ProductVisualSchema)

// FIXED: More lenient update schema that handles partial updates correctly
export const ProductUpdateSchema = z.object({
  id: z.string().uuid('Invalid product ID'),
  // All fields optional for partial updates
  name: z.string().min(1).optional(),
  sku: z.string().min(1).optional(),
  description: z.string().nullable().optional(),
  price: z.number().positive().optional(),
  unitsPerCase: z.number().int().positive().optional(),
  categoryId: z.string().uuid().nullable().optional(),
  brandId: z.string().uuid().nullable().optional(),
  // More lenient imageUrl - accepts URL, empty string, null, or undefined
  imageUrl: z.union([
    z.string().url(),
    z.string().length(0),
    z.null(),
    z.undefined()
  ]).optional(),
  inStock: z.boolean().optional(),
}).merge(ProductVisualSchema.partial())

export type ProductCreateInput = z.infer<typeof ProductCreateSchema>
export type ProductUpdateInput = z.infer<typeof ProductUpdateSchema>
export type ProductVisualInput = z.infer<typeof ProductVisualSchema>
