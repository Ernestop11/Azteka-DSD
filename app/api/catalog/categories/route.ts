import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const categories = await prisma.category.findMany({
      orderBy: { name: 'asc' },
      include: {
        _count: {
          select: { Product: true }
        }
      }
    })

    // Map to include product count
    const categoriesWithCount = categories.map(cat => ({
      id: cat.id,
      name: cat.name,
      slug: cat.slug,
      imageUrl: cat.imageUrl,
      productCount: cat._count.Product
    }))

    return NextResponse.json({
      categories: categoriesWithCount
    })
  } catch (error) {
    console.error('Error fetching catalog categories:', error)
    return NextResponse.json(
      { error: 'Failed to fetch categories' },
      { status: 500 }
    )
  }
}
