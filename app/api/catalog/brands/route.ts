import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const brands = await prisma.brand.findMany({
      orderBy: { name: 'asc' },
      include: {
        _count: {
          select: { Product: true }
        }
      }
    })

    // Map to include product count
    const brandsWithCount = brands.map(brand => ({
      id: brand.id,
      name: brand.name,
      slug: brand.slug,
      imageUrl: brand.imageUrl,
      productCount: brand._count.Product
    }))

    return NextResponse.json({
      brands: brandsWithCount
    })
  } catch (error) {
    console.error('Error fetching catalog brands:', error)
    return NextResponse.json(
      { error: 'Failed to fetch brands' },
      { status: 500 }
    )
  }
}
