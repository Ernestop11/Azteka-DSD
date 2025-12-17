import { z } from 'zod'

export const CategorySummarySchema = z.object({
  id: z.string(),
  name: z.string(),
  slug: z.string().nullable().optional(),
  productCount: z.number().int().nonnegative().nullable().optional(),
  parentId: z.string().nullable().optional(),
})

export const BrandSummarySchema = z.object({
  id: z.string(),
  name: z.string(),
  slug: z.string().nullable().optional(),
  logoUrl: z.string().nullable().optional(),
  isFeatured: z.boolean().optional(),
  featuredScore: z.number().nullable().optional(),
})

const PriceSchema = z.object({
  list: z.number().nonnegative(),
  final: z.number().nonnegative(),
  override: z.number().nonnegative().nullable(),
  customerId: z.string().nullable(),
  marginPercent: z.number().nullable().optional(),
})

const VisualSchema = z.object({
  imageUrl: z.string().nullable(),
  thumbnailUrl: z.string().nullable().optional(),
  backgroundColor: z.string().nullable(),
  backgroundGradient: z.string().nullable(),
  heroImage: z.string().nullable().optional(),
  badgeText: z.string().nullable().optional(),
  badgeColor: z.string().nullable().optional(),
  preset: z.string().nullable().optional(),
  splashOverlay: z.string().nullable().optional(),
  glowClass: z.string().nullable().optional(),
  seasonalTheme: z.string().nullable().optional(),
  animationFlags: z.record(z.boolean()).optional(),
})

const StockSchema = z.object({
  inStock: z.boolean(),
  stockLevel: z.number().nullable(),
  minStock: z.number().nullable(),
  unitsPerCase: z.number().nullable(),
  unitType: z.string().nullable().optional(),
  vendorPrice: z.number().nullable(),
  costCase: z.number().nullable(),
  supplier: z.string().nullable(),
  minOrderQty: z.number().nullable().optional(),
})

export const ProductApiResponseSchema = z.object({
  id: z.string(),
  name: z.string(),
  slug: z.string(),
  sku: z.string().nullable(),
  description: z.string().nullable(),
  shortDescription: z.string().nullable(),
  featured: z.boolean().optional(),
  category: CategorySummarySchema.nullable(),
  brand: BrandSummarySchema.nullable(),
  price: PriceSchema,
  visual: VisualSchema,
  stock: StockSchema,
  tags: z.array(z.string()).optional(),
  businessModes: z.array(z.string()).optional(),
  metrics: z
    .object({
      revenue30d: z.number().nullable(),
      units30d: z.number().nullable(),
    })
    .optional(),
  updatedAt: z.string(),
})

export const BrandApiResponseSchema = BrandSummarySchema.extend({
  revenue30d: z.number().nullable(),
  units30d: z.number().nullable(),
  productCount: z.number().nullable().optional(),
})

export const CategoryNodeSchema: z.ZodType<
  z.infer<typeof CategorySummarySchema> & { children?: Array<z.infer<typeof CategorySummarySchema>> }
> = CategorySummarySchema.extend({
  children: z.lazy(() => CategoryNodeSchema.array()).optional(),
})

export const CategoryApiResponseSchema = CategoryNodeSchema

export const BundleItemSchema = z.object({
  bundleId: z.string(),
  productId: z.string(),
  sku: z.string().nullable().optional(),
  name: z.string().nullable().optional(),
  quantity: z.number().int().positive(),
})

export const BundleApiResponseSchema = z.object({
  id: z.string(),
  name: z.string(),
  slug: z.string(),
  description: z.string().nullable(),
  imageUrl: z.string().nullable(),
  badgeText: z.string().nullable(),
  badgeColor: z.string().nullable(),
  price: z.number().nonnegative(),
  discountPercent: z.number().nullable(),
  stock: z.number().nullable(),
  inStock: z.boolean().optional(),
  type: z.enum(['brand', 'category', 'seasonal']),
  brand: BrandSummarySchema.nullable().optional(),
  category: CategorySummarySchema.nullable().optional(),
  items: z.array(BundleItemSchema).optional(),
  metrics: z
    .object({
      revenue30d: z.number().nullable(),
      units30d: z.number().nullable(),
    })
    .optional(),
})
