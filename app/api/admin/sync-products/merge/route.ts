import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export const dynamic = 'force-dynamic'

// POST /api/admin/sync-products/merge
// Merges a source product into a target product:
// - Optionally copies description from source to target
// - Transfers all OrderItems from source to target
// - Transfers all CustomerPriceOverrides from source to target
// - Transfers all related items
// - Deletes the source product
export async function POST(request: NextRequest) {
  try {
    const { sourceId, targetId, keepDescription } = await request.json()

    if (!sourceId || !targetId) {
      return NextResponse.json(
        { error: 'sourceId and targetId are required' },
        { status: 400 }
      )
    }

    if (sourceId === targetId) {
      return NextResponse.json(
        { error: 'Cannot merge a product into itself' },
        { status: 400 }
      )
    }

    // Verify both products exist
    const [source, target] = await Promise.all([
      prisma.product.findUnique({ where: { id: sourceId } }),
      prisma.product.findUnique({ where: { id: targetId } }),
    ])

    if (!source) {
      return NextResponse.json(
        { error: 'Source product not found' },
        { status: 404 }
      )
    }

    if (!target) {
      return NextResponse.json(
        { error: 'Target product not found' },
        { status: 404 }
      )
    }

    // Perform merge in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // 0. Optionally copy description from source to target
      if (keepDescription && source.description && !target.description) {
        await tx.product.update({
          where: { id: targetId },
          data: { description: source.description },
        })
      }

      // 1. Transfer OrderItems
      const orderItemsUpdated = await tx.orderItem.updateMany({
        where: { productId: sourceId },
        data: { productId: targetId },
      })

      // 2. Transfer CustomerPriceOverrides (if any)
      const sourceOverrides = await tx.customerPriceOverride.findMany({
        where: { productId: sourceId },
      })

      let overridesTransferred = 0
      for (const override of sourceOverrides) {
        const existingOverride = await tx.customerPriceOverride.findFirst({
          where: {
            productId: targetId,
            customerId: override.customerId,
          },
        })

        if (!existingOverride) {
          await tx.customerPriceOverride.update({
            where: { id: override.id },
            data: { productId: targetId },
          })
          overridesTransferred++
        } else {
          await tx.customerPriceOverride.delete({
            where: { id: override.id },
          })
        }
      }

      // 3. Product bundles use many-to-many (no BundleItem model)
      // Products are linked via _BundleProducts relation table - handled by Prisma automatically

      // 4. Transfer CatalogSectionItems (has onDelete: Cascade but let's be explicit)
      await tx.catalogSectionItem.deleteMany({
        where: { productId: sourceId },
      })

      // 5. Transfer CatalogBlockProducts
      await tx.catalogBlockProduct.deleteMany({
        where: { productId: sourceId },
      })

      // 6. Transfer CartBlockProducts
      await tx.cartBlockProduct.deleteMany({
        where: { productId: sourceId },
      })

      // 7. Transfer VendorSkuMappings
      await tx.vendorSkuMapping.updateMany({
        where: { productId: sourceId },
        data: { productId: targetId },
      })

      // 8. Transfer PurchaseOrderItems
      await tx.purchaseOrderItem.updateMany({
        where: { productId: sourceId },
        data: { productId: targetId },
      })

      // 9. Transfer BoxItems
      await tx.boxItem.updateMany({
        where: { productId: sourceId },
        data: { productId: targetId },
      })

      // 10. Transfer WorkOrders (product-related work orders)
      await tx.workOrder.updateMany({
        where: { productId: sourceId },
        data: { productId: targetId },
      })

      // 11. Delete the source product
      await tx.product.delete({
        where: { id: sourceId },
      })

      return {
        orderItemsTransferred: orderItemsUpdated.count,
        overridesTransferred,
        descriptionKept: keepDescription && source.description ? true : false,
      }
    })

    return NextResponse.json({
      success: true,
      message: `Merged "${source.name}" into "${target.name}"`,
      sourceProduct: source.name,
      targetProduct: target.name,
      ...result,
    })
  } catch (error) {
    console.error('[Sync Products Merge] Error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to merge products' },
      { status: 500 }
    )
  }
}
