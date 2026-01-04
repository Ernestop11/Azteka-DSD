import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { randomUUID } from 'crypto'

export const dynamic = 'force-dynamic'

// POST /api/admin/sync-products/quick-create
// Quickly create a new category or brand
export async function POST(request: NextRequest) {
  try {
    const { type, name, productId, applyToProduct } = await request.json()

    if (!type || !name) {
      return NextResponse.json({ error: 'type and name required' }, { status: 400 })
    }

    if (type !== 'category' && type !== 'brand') {
      return NextResponse.json({ error: 'type must be "category" or "brand"' }, { status: 400 })
    }

    let created: { id: string; name: string }

    if (type === 'category') {
      // Check if already exists
      const existing = await prisma.category.findFirst({
        where: { name: { equals: name, mode: 'insensitive' } },
      })

      if (existing) {
        created = existing
      } else {
        // Create slug from name
        const slug = name
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-|-$/g, '')

        created = await prisma.category.create({
          data: {
            id: randomUUID(),
            name,
            slug,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        })
      }

      // Apply to product if requested
      if (applyToProduct && productId) {
        await prisma.product.update({
          where: { id: productId },
          data: { categoryId: created.id, updatedAt: new Date() },
        })
      }
    } else {
      // Brand
      const existing = await prisma.brand.findFirst({
        where: { name: { equals: name, mode: 'insensitive' } },
      })

      if (existing) {
        created = existing
      } else {
        const slug = name
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-|-$/g, '')

        created = await prisma.brand.create({
          data: {
            id: randomUUID(),
            name,
            slug,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        })
      }

      // Apply to product if requested
      if (applyToProduct && productId) {
        await prisma.product.update({
          where: { id: productId },
          data: { brandId: created.id, updatedAt: new Date() },
        })
      }
    }

    return NextResponse.json({
      success: true,
      type,
      created,
      appliedToProduct: applyToProduct && productId ? productId : null,
    })
  } catch (error) {
    console.error('[Quick Create] Error:', error)
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Failed to create',
    }, { status: 500 })
  }
}
