import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { requireAdmin, unauthorizedResponse } from '../../../lib/auth'

export const dynamic = 'force-dynamic'

// GET /api/admin/po/[id]
// Get PO details with workflow information
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const user = await requireAdmin(request)
  if (!user) return unauthorizedResponse()

  try {
    const po = await prisma.purchaseOrder.findUnique({
      where: { id: params.id },
      include: {
        vendor: {
          select: {
            id: true,
            name: true,
          },
        },
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                sku: true,
              },
            },
          },
        },
        receivingTask: {
          include: {
            assignee: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
              },
            },
          },
        },
      },
    })

    if (!po) {
      return NextResponse.json(
        { error: 'Purchase order not found' },
        { status: 404 }
      )
    }

    // Get work orders for new products from this PO
    const newProductIds = po.items
      .filter(item => item.isNewProduct && item.productId)
      .map(item => item.productId!)
      .filter(Boolean)

    const workOrders = newProductIds.length > 0
      ? await prisma.workOrder.findMany({
          where: {
            productId: { in: newProductIds },
            type: 'NEW_PRODUCT_CATALOG',
          },
          include: {
            product: {
              select: {
                id: true,
                name: true,
                sku: true,
              },
            },
          },
        })
      : []

    // Serialize PO data and ensure numeric values are properly converted
    const serializedPO = {
      ...po,
      total: Number(po.total),
      items: po.items.map(item => ({
        ...item,
        quantityOrdered: Number(item.quantityOrdered),
        quantityReceived: Number(item.quantityReceived),
        unitCost: Number(item.unitCost),
        totalCost: Number(item.totalCost),
        product: item.product ? {
          ...item.product,
          suggestedPrice: item.product.suggestedPrice ? Number(item.product.suggestedPrice) : null,
        } : null,
      })),
      workOrders: workOrders.map(wo => ({
        ...wo,
        product: wo.product ? {
          ...wo.product,
          suggestedPrice: wo.product.suggestedPrice != null ? Number(wo.product.suggestedPrice) : null,
        } : null,
      })),
    }

    return NextResponse.json({
      data: serializedPO,
    })
  } catch (error) {
    console.error('Error fetching PO:', error)
    return NextResponse.json(
      { error: 'Failed to fetch purchase order' },
      { status: 500 }
    )
  }
}

