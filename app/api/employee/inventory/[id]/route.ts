import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { revalidateTag, revalidatePath } from 'next/cache'

/**
 * PATCH /api/employee/inventory/[id]
 * Updates inventory for a product (stock, location, units per case, SKU, expiration, lot)
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { stock, warehouseLocation, unitsPerCase, inStock, sku, expirationDate, lotNumber, categoryId, brandId } = body

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

    // Build update data
    const updateData: any = {}

    if (typeof stock === 'number') {
      updateData.stock = Math.max(0, stock)
      updateData.inStock = stock > 0
    }

    if (warehouseLocation !== undefined) {
      updateData.warehouseLocation = warehouseLocation || null
    }

    if (typeof unitsPerCase === 'number') {
      updateData.unitsPerCase = Math.max(1, unitsPerCase)
    }

    if (typeof inStock === 'boolean') {
      updateData.inStock = inStock
    }

    // Handle SKU update
    if (sku !== undefined && sku !== existingProduct.sku) {
      // Check if new SKU is already in use by another product
      if (sku) {
        const skuExists = await prisma.product.findFirst({
          where: {
            sku: sku,
            id: { not: id }
          }
        })
        if (skuExists) {
          return NextResponse.json(
            { error: `SKU "${sku}" is already in use by another product` },
            { status: 400 }
          )
        }
      }
      updateData.sku = sku || existingProduct.sku
    }

    // Handle expiration date
    if (expirationDate !== undefined) {
      updateData.expirationDate = expirationDate ? new Date(expirationDate) : null
    }

    // Handle lot number
    if (lotNumber !== undefined) {
      updateData.lotNumber = lotNumber || null
    }

    // Handle category
    if (categoryId !== undefined) {
      updateData.categoryId = categoryId || null
    }

    // Handle brand
    if (brandId !== undefined) {
      updateData.brandId = brandId || null
    }

    // Update the product
    const updatedProduct = await prisma.product.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        name: true,
        sku: true,
        stock: true,
        warehouseLocation: true,
        unitsPerCase: true,
        inStock: true,
        expirationDate: true,
        lotNumber: true,
        categoryId: true,
        brandId: true,
        updatedAt: true,
        Category: {
          select: { id: true, name: true }
        },
        Brand: {
          select: { id: true, name: true }
        }
      }
    })

    // Revalidate caches
    revalidateTag('catalog')
    revalidateTag('products')
    revalidatePath('/catalog')
    revalidatePath('/employee/inventory')

    return NextResponse.json({
      data: updatedProduct,
      message: 'Inventory updated successfully'
    })
  } catch (error: any) {
    console.error('[PATCH /api/employee/inventory/[id]] Error:', error)
    return NextResponse.json(
      { error: 'Failed to update inventory', details: error.message },
      { status: 500 }
    )
  }
}
