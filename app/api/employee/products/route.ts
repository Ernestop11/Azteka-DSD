import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { requireEmployee, unauthorizedResponse } from '../../lib/auth'

/**
 * GET /api/employee/products
 * 
 * Get all products for employee inventory management
 * Similar to admin/products but for employee role
 */
export async function GET(request: NextRequest) {
  // Require employee authentication
  const user = await requireEmployee(request)
  if (!user) return unauthorizedResponse()

  try {
    // Parse query parameters
    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search')
    const categoryId = searchParams.get('categoryId')
    const brandId = searchParams.get('brandId')
    const inStock = searchParams.get('inStock')

    // Build where clause
    const where: any = {}

    if (search && search.trim()) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { sku: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ]
    }

    if (categoryId && categoryId !== 'all') {
      where.categoryId = categoryId
    }

    if (brandId && brandId !== 'all') {
      where.brandId = brandId
    }

    if (inStock !== null && inStock !== undefined) {
      where.inStock = inStock === 'true'
    }

    // Fetch products with relations
    const products = await prisma.product.findMany({
      where,
      select: {
        id: true,
        name: true,
        sku: true,
        caseSku: true,
        description: true,
        price: true,
        imageUrl: true,
        stock: true,
        minStock: true,
        unitsPerCase: true,
        warehouseLocation: true,
        expirationDate: true,
        lotNumber: true,
        inStock: true,
        allowPresell: true,
        Category: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        Brand: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
      orderBy: {
        name: 'asc',
      },
      take: 10000, // Limit to prevent timeout
    })

    // Transform to match frontend expectations
    const normalizedProducts = products.map((p) => {
      let imageUrl = p.imageUrl
      
      // Fix path shortening
      if (imageUrl && imageUrl.includes('/uploads/prod/')) {
        imageUrl = imageUrl.replace('/uploads/prod/', '/uploads/products/')
      }
      
      if (!imageUrl || imageUrl.trim() === '' || imageUrl === 'null') {
        imageUrl = null
      }

      return {
        ...p,
        imageUrl,
        inStock: p.inStock ?? true,
        allowPresell: p.allowPresell ?? false,
        category: p.Category,
        brand: p.Brand,
      }
    })

    return NextResponse.json({ data: normalizedProducts })
  } catch (error: any) {
    console.error('[GET /api/employee/products] Error:', error)
    return NextResponse.json(
      {
        error: 'Failed to fetch products',
        details: error?.message || String(error),
      },
      { status: 500 }
    )
  }
}

