import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { revalidateTag, revalidatePath } from 'next/cache'

/**
 * PATCH /api/employee/products/[id]/sku
 * Updates the SKU for a product (used by barcode scanner)
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { sku } = body

    if (!sku || typeof sku !== 'string') {
      return NextResponse.json(
        { error: 'SKU is required' },
        { status: 400 }
      )
    }

    // Check if product exists
    const existingProduct = await prisma.product.findUnique({
      where: { id }
    })

    if (!existingProduct) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      )
    }

    // Check if SKU is already used by another product
    const skuExists = await prisma.product.findFirst({
      where: {
        sku,
        id: { not: id }
      }
    })

    if (skuExists) {
      return NextResponse.json(
        { error: `SKU "${sku}" is already assigned to another product: ${skuExists.name}` },
        { status: 400 }
      )
    }

    // Update the product SKU
    const updatedProduct = await prisma.product.update({
      where: { id },
      data: { sku },
      select: {
        id: true,
        name: true,
        sku: true,
        updatedAt: true
      }
    })

    // Revalidate caches
    revalidateTag('catalog')
    revalidateTag('products')
    revalidatePath('/catalog')
    revalidatePath('/employee/products')

    return NextResponse.json({
      data: updatedProduct,
      message: 'SKU updated successfully'
    })
  } catch (error: any) {
    console.error('[PATCH /api/employee/products/[id]/sku] Error:', error)
    return NextResponse.json(
      { error: 'Failed to update SKU', details: error.message },
      { status: 500 }
    )
  }
}
