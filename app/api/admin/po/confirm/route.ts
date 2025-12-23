import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { requireAdmin, unauthorizedResponse } from '../../../lib/auth'

export const dynamic = 'force-dynamic'

interface POItem {
  vendorSku: string
  description: string
  quantityOrdered: number
  unitCost: number
  totalCost: number
  unitsPerCase: number
  sellableUnits?: number
  matchedProduct?: { id: string; name: string; sku: string } | null
  productId?: string | null
  isNewProduct: boolean
}

/**
 * POST /api/admin/po/confirm
 * Confirm a parsed PO and create it in the database
 * - Creates PurchaseOrder with items
 * - Auto-creates new products (marked as needsReview)
 * - Creates RECEIVING task for employees
 * - Creates work orders for new products
 */
export async function POST(request: NextRequest) {
  // Require admin authentication
  const user = await requireAdmin(request)
  if (!user) return unauthorizedResponse()

  try {
    const body = await request.json()
    const {
      vendorId,
      vendorName,
      poNumber,
      pdfUrl,
      items,
      shippingCost,
      subtotal,
      total,
      expectedDate,
      notes,
    } = body as {
      vendorId: string | null
      vendorName: string | null
      poNumber: string | null
      pdfUrl: string | null
      items: POItem[]
      shippingCost: number
      subtotal: number
      total: number
      expectedDate: string | null
      notes: string | null
    }

    if (!items || items.length === 0) {
      return NextResponse.json(
        { error: 'At least one item is required' },
        { status: 400 }
      )
    }

    // Create or find vendor
    let finalVendorId = vendorId
    if (!finalVendorId && vendorName) {
      // Try to find existing vendor
      let vendor = await prisma.vendor.findUnique({
        where: { name: vendorName },
      })

      // Create new vendor if not found
      if (!vendor) {
        vendor = await prisma.vendor.create({
          data: {
            name: vendorName,
            active: true,
          },
        })
      }
      finalVendorId = vendor.id
    }

    // Process items - create new products as needed
    const processedItems: Array<{
      productId: string | null
      vendorSku: string
      description: string
      quantityOrdered: number
      unitCost: number
      totalCost: number
      unitsPerCase: number
      sellableUnits: number | null
      isNewProduct: boolean
      needsReview: boolean
    }> = []

    // Calculate shipping allocation BEFORE processing items
    // This ensures all products get their proportional share of shipping costs
    const subtotalBeforeShipping = items.reduce((sum, item) => 
      sum + (item.totalCost || item.quantityOrdered * item.unitCost), 0
    )
    const shippingAllocationRate = subtotalBeforeShipping > 0 
      ? (shippingCost || 0) / subtotalBeforeShipping 
      : 0

    const newProducts: Array<{ id: string; name: string; sku: string }> = []
    const skuMappingsToCreate: Array<{
      vendorId: string
      vendorSku: string
      internalSku: string
      productId: string
    }> = []

    for (const item of items) {
      let productId = item.productId || item.matchedProduct?.id || null
      let isNewProduct = item.isNewProduct
      let needsReview = false

      // Calculate landed cost (unit cost + proportional shipping allocation)
      // This ensures shipping is included in product costs from the start
      const itemSubtotal = item.totalCost || item.quantityOrdered * item.unitCost
      const itemShippingAllocation = itemSubtotal * shippingAllocationRate
      const landedUnitCost = item.unitCost + (itemShippingAllocation / item.quantityOrdered)

      // If new product, auto-create it
      if (!productId && isNewProduct) {
        // Generate a temporary SKU
        const tempSku = `NEW-${item.vendorSku}-${Date.now()}`

        // Create the product with landed cost and suggested pricing
        const newProduct = await prisma.product.create({
          data: {
            name: item.description,
            sku: tempSku,
            description: `Auto-created from PO. Vendor SKU: ${item.vendorSku}`,
            price: Math.round(landedUnitCost * 1.50 * 100) / 100, // 50% margin on landed cost
            cost: item.unitCost, // Base cost (without shipping)
            landedCost: Math.round(landedUnitCost * 100) / 100, // Landed cost (with shipping)
            suggestedPrice: Math.round(landedUnitCost * 1.50 * 100) / 100, // Suggested price based on landed cost (50% margin)
            stock: 0,
            inStock: false,
            unitType: 'case',
            unitsPerCase: item.unitsPerCase || 1,
            minOrderQty: 1,
            minStock: 10,
            supplier: vendorName || 'Unknown Vendor',
            updatedAt: new Date(),
          },
        })

        productId = newProduct.id
        needsReview = true
        newProducts.push({
          id: newProduct.id,
          name: newProduct.name,
          sku: newProduct.sku,
        })

        // Create SKU mapping for this vendor
        if (finalVendorId) {
          skuMappingsToCreate.push({
            vendorId: finalVendorId,
            vendorSku: item.vendorSku,
            internalSku: newProduct.sku,
            productId: newProduct.id,
          })
        }
      } else if (productId && finalVendorId) {
        // Create SKU mapping if we have a matched product
        const existingMapping = await prisma.vendorSkuMapping.findUnique({
          where: {
            vendorId_vendorSku: {
              vendorId: finalVendorId,
              vendorSku: item.vendorSku,
            },
          },
        })
        if (!existingMapping) {
          const product = await prisma.product.findUnique({
            where: { id: productId },
            select: { sku: true },
          })
          if (product) {
            skuMappingsToCreate.push({
              vendorId: finalVendorId,
              vendorSku: item.vendorSku,
              internalSku: product.sku,
              productId,
            })
          }
        }
      }

      processedItems.push({
        productId,
        vendorSku: item.vendorSku,
        description: item.description,
        quantityOrdered: item.quantityOrdered,
        unitCost: item.unitCost, // Store base cost
        totalCost: itemSubtotal + itemShippingAllocation, // Include shipping allocation in total
        unitsPerCase: item.unitsPerCase || 1,
        sellableUnits: item.sellableUnits || null,
        isNewProduct,
        needsReview,
      })
    }

    // Create the purchase order with items
    const purchaseOrder = await prisma.purchaseOrder.create({
      data: {
        poNumber: poNumber || null,
        vendorId: finalVendorId,
        supplier: vendorName || 'Unknown Vendor', // Legacy field
        status: 'CONFIRMED',
        pdfUrl: pdfUrl || null,
        subtotal: subtotal || processedItems.reduce((sum, i) => sum + i.totalCost, 0),
        shippingCost: shippingCost || 0,
        total:
          total ||
          processedItems.reduce((sum, i) => sum + i.totalCost, 0) + (shippingCost || 0),
        expectedDate: expectedDate ? new Date(expectedDate) : null,
        notes: notes || null,
        items: {
          create: processedItems.map((item) => ({
            productId: item.productId,
            vendorSku: item.vendorSku,
            description: item.description,
            quantityOrdered: item.quantityOrdered,
            quantityReceived: 0,
            unitCost: item.unitCost,
            totalCost: item.totalCost,
            unitsPerCase: item.unitsPerCase,
            sellableUnits: item.sellableUnits,
            isNewProduct: item.isNewProduct,
            needsReview: item.needsReview,
          })),
        },
      },
      include: {
        vendor: true,
        items: {
          include: {
            product: {
              select: { id: true, name: true, sku: true },
            },
          },
        },
      },
    })

    // Create SKU mappings
    if (skuMappingsToCreate.length > 0) {
      await prisma.vendorSkuMapping.createMany({
        data: skuMappingsToCreate,
        skipDuplicates: true,
      })
    }

    // Create RECEIVING task for employees
    const receivingTask = await prisma.task.create({
      data: {
        type: 'RECEIVING',
        title: `Receive shipment from ${vendorName || 'Unknown Vendor'}`,
        description: `PO #${poNumber || purchaseOrder.id.slice(0, 8)} - ${processedItems.length} items`,
        status: 'PENDING',
        priority: 'NORMAL',
        purchaseOrderId: purchaseOrder.id,
      },
    })

    // Create work orders for new products
    const workOrders: Array<{ id: string; productId: string }> = []
    for (const product of newProducts) {
      const workOrder = await prisma.workOrder.create({
        data: {
          type: 'NEW_PRODUCT_CATALOG',
          title: `Add new product to catalog: ${product.name}`,
          description: `New product auto-created from PO. Needs: SKU update, category, brand, image, price review.`,
          status: 'PENDING',
          priority: 'NORMAL',
          productId: product.id,
          purchaseOrderId: purchaseOrder.id,
          metadata: {
            vendorId: finalVendorId,
            vendorName,
            poId: purchaseOrder.id,
            poNumber,
          },
        },
      })
      workOrders.push({ id: workOrder.id, productId: product.id })
    }

    return NextResponse.json({
      data: {
        purchaseOrder,
        receivingTask,
        newProducts,
        workOrders,
        stats: {
          totalItems: processedItems.length,
          newProductsCreated: newProducts.length,
          workOrdersCreated: workOrders.length,
        },
      },
    })
  } catch (error: unknown) {
    console.error('[POST /api/admin/po/confirm] Error:', error)
    const message = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json(
      { error: 'Failed to confirm PO', details: message },
      { status: 500 }
    )
  }
}
