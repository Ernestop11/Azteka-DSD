import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/employee/inventory-count/[id]/items - Get all items for a count session
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const { searchParams } = new URL(request.url)

    const status = searchParams.get('status') // COUNTED, VERIFIED, RECOUNT_NEEDED, CORRECTED
    const counterId = searchParams.get('counterId')
    const needsDateCheck = searchParams.get('needsDateCheck')
    const location = searchParams.get('location')

    const where: Record<string, unknown> = { inventoryCountId: id }
    if (status) where.status = status
    if (counterId) where.counterId = counterId
    if (needsDateCheck === 'true') where.needsDateCheck = true
    if (location) where.warehouseLocation = { startsWith: location }

    const items = await prisma.inventoryCountItem.findMany({
      where,
      include: {
        counter: {
          select: { id: true, firstName: true, lastName: true }
        },
        checker: {
          select: { id: true, firstName: true, lastName: true }
        }
      },
      orderBy: { countedAt: 'desc' }
    })

    // Fetch product details for all items
    const productIds = items.map(item => item.productId)
    const products = await prisma.product.findMany({
      where: { id: { in: productIds } },
      select: {
        id: true,
        name: true,
        sku: true,
        caseSku: true,
        imageUrl: true,
        stock: true,
        warehouseLocation: true,
        unitsPerCase: true,
        cost: true,
        price: true
      }
    })

    const productMap = new Map(products.map(p => [p.id, p]))

    const itemsWithProducts = items.map(item => ({
      ...item,
      product: productMap.get(item.productId)
    }))

    return NextResponse.json({ items: itemsWithProducts })
  } catch (error) {
    console.error('Failed to fetch inventory count items:', error)
    return NextResponse.json(
      { error: 'Failed to fetch inventory count items' },
      { status: 500 }
    )
  }
}

// POST /api/employee/inventory-count/[id]/items - Add/update a count item
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: inventoryCountId } = await params
    const body = await request.json()

    const {
      productId,
      counterId,
      countedCases,
      countedPieces,
      unitsPerCase,
      warehouseLocation,
      needsDateCheck,
      expirationDate,
      lotNumber,
      sku,
      caseSku
    } = body

    if (!productId || !counterId) {
      return NextResponse.json(
        { error: 'productId and counterId are required' },
        { status: 400 }
      )
    }

    // Get product's expected quantity from system
    const product = await prisma.product.findUnique({
      where: { id: productId },
      select: { stock: true, unitsPerCase: true, sku: true, caseSku: true, warehouseLocation: true }
    })

    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      )
    }

    const actualUnitsPerCase = unitsPerCase || product.unitsPerCase || 1
    const countedTotal = (countedCases || 0) * actualUnitsPerCase + (countedPieces || 0)
    const expectedQuantity = product.stock || 0
    const variance = countedTotal - expectedQuantity

    // Use transaction to update both InventoryCountItem AND Product table
    const result = await prisma.$transaction(async (tx) => {
      // 1. Upsert the inventory count item
      const item = await tx.inventoryCountItem.upsert({
        where: {
          inventoryCountId_productId: {
            inventoryCountId,
            productId
          }
        },
        update: {
          counterId,
          countedCases: countedCases || 0,
          countedPieces: countedPieces || 0,
          countedTotal,
          expectedQuantity,
          variance,
          unitsPerCase: actualUnitsPerCase,
          warehouseLocation: warehouseLocation || product.warehouseLocation,
          needsDateCheck: needsDateCheck || false,
          expirationDate: expirationDate ? new Date(expirationDate) : null,
          lotNumber,
          sku: sku || product.sku,
          caseSku: caseSku || product.caseSku,
          status: 'COUNTED',
          countedAt: new Date()
        },
        create: {
          inventoryCountId,
          productId,
          counterId,
          countedCases: countedCases || 0,
          countedPieces: countedPieces || 0,
          countedTotal,
          expectedQuantity,
          variance,
          unitsPerCase: actualUnitsPerCase,
          warehouseLocation: warehouseLocation || product.warehouseLocation,
          needsDateCheck: needsDateCheck || false,
          expirationDate: expirationDate ? new Date(expirationDate) : null,
          lotNumber,
          sku: sku || product.sku,
          caseSku: caseSku || product.caseSku,
          status: 'COUNTED'
        },
        include: {
          counter: {
            select: { id: true, firstName: true, lastName: true }
          }
        }
      })

      // 2. Update the Product table with new SKU, caseSku, location, expiration if provided
      const productUpdates: Record<string, unknown> = {}

      // Update SKU if provided and different
      if (sku && sku !== product.sku) {
        productUpdates.sku = sku
      }

      // Update caseSku if provided and different
      if (caseSku && caseSku !== product.caseSku) {
        productUpdates.caseSku = caseSku
      }

      // Update warehouse location if provided
      if (warehouseLocation && warehouseLocation !== product.warehouseLocation) {
        productUpdates.warehouseLocation = warehouseLocation
      }

      // Update units per case if provided
      if (actualUnitsPerCase && actualUnitsPerCase !== product.unitsPerCase) {
        productUpdates.unitsPerCase = actualUnitsPerCase
      }

      // Update expiration date if provided
      if (expirationDate) {
        productUpdates.expirationDate = new Date(expirationDate)
      }

      // Only update product if there are changes
      if (Object.keys(productUpdates).length > 0) {
        await tx.product.update({
          where: { id: productId },
          data: productUpdates
        })
        console.log(`[INVENTORY COUNT] Updated product ${productId}:`, productUpdates)
      }

      return item
    })

    return NextResponse.json({ item: result }, { status: 201 })
  } catch (error) {
    console.error('Failed to save inventory count item:', error)
    return NextResponse.json(
      { error: 'Failed to save inventory count item' },
      { status: 500 }
    )
  }
}
