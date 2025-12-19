import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { revalidateTag, revalidatePath } from 'next/cache'
import { cookies } from 'next/headers'

// Helper to get current user from session
async function getCurrentUser() {
  try {
    const cookieStore = await cookies()
    const sessionToken = cookieStore.get('session')?.value
    if (!sessionToken) return null

    const session = await prisma.session.findUnique({
      where: { id: sessionToken },
      include: { user: { select: { id: true, name: true, email: true, role: true } } }
    })

    if (!session || session.expiresAt < new Date()) return null
    return session.user
  } catch {
    return null
  }
}

// Helper to log activity
async function logActivity(
  userId: string,
  actionType: string,
  entityType: string,
  entityId: string,
  entityName: string,
  description: string,
  metadata?: any
) {
  try {
    await prisma.employeeActivity.create({
      data: {
        userId,
        actionType: actionType as any,
        entityType,
        entityId,
        entityName,
        description,
        metadata
      }
    })
  } catch (err) {
    console.error('Failed to log activity:', err)
  }
}

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
    const { stock, warehouseLocation, unitsPerCase, inStock, sku, caseSku, expirationDate, lotNumber, categoryId, brandId } = body

    // Get current user for activity logging
    const currentUser = await getCurrentUser()

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

    // Handle case SKU
    if (caseSku !== undefined) {
      updateData.caseSku = caseSku || null
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
        caseSku: true,
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

    // Log activities for tracking
    if (currentUser) {
      const activities: Promise<void>[] = []

      // Stock change
      if (typeof stock === 'number' && stock !== existingProduct.stock) {
        const diff = stock - Number(existingProduct.stock)
        const action = diff > 0 ? 'added' : 'removed'
        activities.push(logActivity(
          currentUser.id,
          'STOCK_UPDATE',
          'product',
          id,
          existingProduct.name,
          `${action} ${Math.abs(diff)} units (${existingProduct.stock} → ${stock})`,
          { oldStock: existingProduct.stock, newStock: stock, diff }
        ))
      }

      // Location change
      if (warehouseLocation !== undefined && warehouseLocation !== existingProduct.warehouseLocation) {
        activities.push(logActivity(
          currentUser.id,
          'LOCATION_UPDATE',
          'product',
          id,
          existingProduct.name,
          `Set location to ${warehouseLocation || 'none'}`,
          { oldLocation: existingProduct.warehouseLocation, newLocation: warehouseLocation }
        ))
      }

      // SKU change
      if (sku !== undefined && sku !== existingProduct.sku) {
        activities.push(logActivity(
          currentUser.id,
          'SKU_UPDATE',
          'product',
          id,
          existingProduct.name,
          `Updated SKU to ${sku}`,
          { oldSku: existingProduct.sku, newSku: sku }
        ))
      }

      // Expiration change
      if (expirationDate !== undefined) {
        const oldExp = existingProduct.expirationDate?.toISOString().split('T')[0]
        const newExp = expirationDate ? new Date(expirationDate).toISOString().split('T')[0] : null
        if (oldExp !== newExp) {
          activities.push(logActivity(
            currentUser.id,
            'EXPIRATION_UPDATE',
            'product',
            id,
            existingProduct.name,
            `Set expiration to ${newExp || 'none'}`,
            { oldExpiration: oldExp, newExpiration: newExp }
          ))
        }
      }

      // Category/Brand change
      if ((categoryId !== undefined && categoryId !== existingProduct.categoryId) ||
          (brandId !== undefined && brandId !== existingProduct.brandId)) {
        activities.push(logActivity(
          currentUser.id,
          'PRODUCT_CLASSIFY',
          'product',
          id,
          existingProduct.name,
          `Updated classification`,
          {
            oldCategoryId: existingProduct.categoryId,
            newCategoryId: categoryId,
            oldBrandId: existingProduct.brandId,
            newBrandId: brandId
          }
        ))
      }

      // Execute all activity logs in parallel (non-blocking)
      Promise.all(activities).catch(console.error)
    }

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
