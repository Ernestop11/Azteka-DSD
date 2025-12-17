import { NextRequest, NextResponse } from 'next/server'

import prisma from '@/lib/prisma'
import type { TApiResponse, ErrorResponse } from '@/types/api'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url)
    const brandId = url.searchParams.get('brandId') ?? undefined
    const featured = url.searchParams.get('featured') ?? undefined

    // Fetch bundles from database (model is ProductBundle)
    const bundles = await (prisma as any).productBundle.findMany({
      where: {
        active: true,
        ...(brandId && { brandId }),
        ...(featured === 'true' && { featured: true }),
      },
      include: {
        brand: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                sku: true,
                price: true,
                imageUrl: true,
              },
            },
          },
        },
      },
      orderBy: [
        { featured: 'desc' },
        { name: 'asc' },
      ],
    })

    const response: TApiResponse<typeof bundles> = {
      data: bundles,
      meta: {
        total: bundles.length,
      },
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('[catalog/bundles] Failed to fetch bundles', error)
    const err: ErrorResponse = { error: 'Failed to load bundles' }
    return NextResponse.json(err, { status: 500 })
  }
}
