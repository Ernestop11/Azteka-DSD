import { Prisma } from '@prisma/client'
import { NextResponse } from 'next/server'

import prisma from '@/lib/prisma'
import { catalogCache } from '@/lib/cache'
import { CategoryApiResponseSchema } from '@/lib/schemas/catalog'
import type { CategoryApiResponse } from '@/types/catalog'
import { toSlug } from '@/lib/slug'

const CACHE_TTL = 60_000

type CategoryRow = {
  id: string
  name: string
  slug: string | null
  productCount: number | string | null
}

type SubcategoryRow = {
  id: string
  name: string
  categoryId: string
  productCount: number | string | null
  slug: string | null
}

const asCount = (value: unknown) => {
  if (value === null || value === undefined) return 0
  if (typeof value === 'number') return value
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : 0
}

export async function GET() {
  try {
    const cacheKey = 'categories:tree'
    const cached = catalogCache.get<{ categories: CategoryApiResponse[] }>(cacheKey)
    if (cached) {
      return NextResponse.json({ categories: cached.categories, cached: true })
    }

    const [categories, subcategories] = await Promise.all([
      prisma.$queryRaw(
        Prisma.sql`
          SELECT
            c."id",
            c."name",
            c."slug",
            COUNT(p."id")::int AS "productCount"
          FROM "Category" c
          LEFT JOIN "Product" p ON p."categoryId" = c."id" AND COALESCE(p."isHidden", false) = false
          GROUP BY c."id"
          ORDER BY c."displayOrder" ASC, c."name" ASC
        `
      ) as Promise<CategoryRow[]>,
      prisma.$queryRaw(
        Prisma.sql`
          SELECT
            s."id",
            s."name",
            s."categoryId",
            COUNT(p."id")::int AS "productCount",
            NULL::text AS "slug"
          FROM "Subcategory" s
          LEFT JOIN "Product" p ON p."subcategoryId" = s."id" AND COALESCE(p."isHidden", false) = false
          GROUP BY s."id"
          ORDER BY s."displayOrder" ASC, s."name" ASC
        `
      ) as Promise<SubcategoryRow[]>,
    ])

    const subByCategory = subcategories.reduce<Record<string, SubcategoryRow[]>>((acc, sub) => {
      acc[sub.categoryId] = acc[sub.categoryId] ?? []
      acc[sub.categoryId].push(sub)
      return acc
    }, {})

    const mapped = categories.map<CategoryApiResponse>((category) => ({
      id: category.id,
      name: category.name,
      slug: category.slug ?? toSlug(category.name),
      productCount: asCount(category.productCount),
      parentId: null,
      children: (subByCategory[category.id] ?? []).map((sub) => ({
        id: sub.id,
        name: sub.name,
        slug: sub.slug ?? toSlug(sub.name),
        productCount: asCount(sub.productCount),
        parentId: category.id,
      })),
    }))

    const categoriesTree = CategoryApiResponseSchema.array().parse(mapped)
    catalogCache.set(cacheKey, { categories: categoriesTree }, CACHE_TTL)

    return NextResponse.json({ categories: categoriesTree })
  } catch (error) {
    console.error('[api/categories/tree] Failed', error)
    return NextResponse.json({ error: 'Failed to load categories' }, { status: 500 })
  }
}
