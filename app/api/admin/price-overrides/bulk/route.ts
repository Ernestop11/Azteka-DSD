import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { requireAdmin, unauthorizedResponse } from '../../../lib/auth'

// POST /api/admin/price-overrides/bulk
export async function POST(request: NextRequest) {
  const user = await requireAdmin(request)
  if (!user) return unauthorizedResponse()

  try {
    const body = await request.json()
    const { operation, customerIds, productIds, overrideType, value, notes } =
      body

    // operation: 'SET_FIXED_PRICE' | 'SET_DISCOUNT_PERCENT' | 'SET_DISCOUNT_AMOUNT' | 'APPLY_TIER'

    if (!operation || !customerIds?.length || !productIds?.length) {
      return NextResponse.json(
        { error: 'operation, customerIds, and productIds are required' },
        { status: 400 }
      )
    }

    const results = []

    for (const customerId of customerIds) {
      for (const productId of productIds) {
        try {
          // Verify customer and product exist
          const [customer, product] = await Promise.all([
            prisma.customer.findUnique({ where: { id: customerId } }),
            prisma.product.findUnique({ where: { id: productId } }),
          ])

          if (!customer || !product) {
            results.push({
              customerId,
              productId,
              success: false,
              error: customer ? 'Product not found' : 'Customer not found',
            })
            continue
          }

          const overrideData: any = {
            customerId,
            productId,
            createdById: user.id,
            active: true,
            notes: notes || null,
          }

          switch (operation) {
            case 'SET_FIXED_PRICE':
              overrideData.overrideType = 'FIXED_PRICE'
              overrideData.fixedPrice = parseFloat(value)
              break
            case 'SET_DISCOUNT_PERCENT':
              overrideData.overrideType = 'PERCENTAGE_DISCOUNT'
              overrideData.discountPercent = parseFloat(value)
              break
            case 'SET_DISCOUNT_AMOUNT':
              overrideData.overrideType = 'FIXED_DISCOUNT'
              overrideData.discountAmount = parseFloat(value)
              break
            default:
              results.push({
                customerId,
                productId,
                success: false,
                error: `Unknown operation: ${operation}`,
              })
              continue
          }

          const override = await prisma.customerPriceOverride.upsert({
            where: {
              customerId_productId_minQuantity: {
                customerId,
                productId,
                minQuantity: null,
              },
            },
            create: overrideData,
            update: overrideData,
          })

          results.push({
            customerId,
            productId,
            success: true,
            overrideId: override.id,
          })
        } catch (error) {
          results.push({
            customerId,
            productId,
            success: false,
            error:
              error instanceof Error ? error.message : 'Unknown error',
          })
        }
      }
    }

    return NextResponse.json({
      data: {
        total: results.length,
        successful: results.filter((r) => r.success).length,
        failed: results.filter((r) => !r.success).length,
        results,
      },
    })
  } catch (error) {
    console.error('Error in bulk price override:', error)
    return NextResponse.json(
      { error: 'Failed to process bulk price override' },
      { status: 500 }
    )
  }
}



