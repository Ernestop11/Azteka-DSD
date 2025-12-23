import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export const dynamic = 'force-dynamic'

// Helper to normalize image URLs
function normalizeProductImage(imageUrl: string | null | undefined): string {
  if (!imageUrl) return ''

  // If it's already a full URL, return as-is
  if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
    return imageUrl
  }

  // If it starts with /uploads, it's a local path
  if (imageUrl.startsWith('/uploads')) {
    return imageUrl
  }

  // Otherwise prepend /uploads/products/
  return `/uploads/products/${imageUrl}`
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        Category: {
          select: {
            id: true,
            name: true,
            slug: true
          }
        },
        Brand: {
          select: {
            id: true,
            name: true,
            slug: true
          }
        }
      }
    })

    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      )
    }

    // Transform product for frontend
    const transformedProduct = {
      id: product.id,
      name: product.name,
      sku: product.sku,
      description: product.description,
      price: Number(product.price),
      cost: product.cost ? Number(product.cost) : null,
      margin: product.margin ? Number(product.margin) : null,
      inStock: product.inStock,
      stock: product.stock,
      minStock: product.minStock,
      imageUrl: normalizeProductImage(product.imageUrl),
      supplier: product.supplier,
      category: product.Category,
      brand: product.Brand,
      createdAt: product.createdAt,
      updatedAt: product.updatedAt
    }

    return NextResponse.json({
      product: transformedProduct
    })
  } catch (error) {
    console.error('Error fetching product:', error)
    return NextResponse.json(
      { error: 'Failed to fetch product' },
      { status: 500 }
    )
  }
}
