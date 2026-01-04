import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET single purchase order with items
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = await params

    const po = await prisma.purchaseOrder.findUnique({
      where: { id },
      include: {
        vendor: { select: { id: true, name: true, contactEmail: true, contactPhone: true } },
        items: {
          include: {
            product: {
              select: { id: true, name: true, sku: true, imageUrl: true, price: true, cost: true }
            }
          }
        },
        receivingTask: {
          include: {
            assignee: { select: { id: true, firstName: true, lastName: true } }
          }
        },
        shippingExpenses: {
          select: {
            id: true,
            amount: true,
            carrierName: true,
            invoiceNumber: true,
            deliveryDate: true,
            notes: true
          }
        }
      }
    })

    if (!po) {
      return NextResponse.json({ error: 'PO not found' }, { status: 404 })
    }

    // Calculate total shipping for this PO
    const totalShipping = po.shippingExpenses.reduce((sum, e) => sum + Number(e.amount), 0)
    const totalWithShipping = Number(po.total) + totalShipping

    const formattedPO = {
      id: po.id,
      poNumber: po.poNumber,
      status: po.status,
      subtotal: Number(po.subtotal),
      shippingCost: Number(po.shippingCost),
      total: Number(po.total),
      totalWithShipping,
      notes: po.notes,
      createdAt: po.createdAt.toISOString(),
      expectedDate: po.expectedDate?.toISOString() || null,
      receivedDate: po.receivedDate?.toISOString() || null,
      vendor: po.vendor ? {
        id: po.vendor.id,
        name: po.vendor.name,
        email: po.vendor.contactEmail,
        phone: po.vendor.contactPhone
      } : null,
      items: po.items.map(item => ({
        id: item.id,
        productId: item.productId,
        vendorSku: item.vendorSku,
        description: item.description,
        quantity: item.quantityOrdered,
        quantityReceived: item.quantityReceived,
        unitCost: Number(item.unitCost),
        total: Number(item.totalCost),
        unitsPerCase: item.unitsPerCase,
        sellableUnits: item.sellableUnits,
        // Calculate unit price (price per piece if sold by pieces)
        unitPricePerPiece: item.unitsPerCase > 1
          ? Number(item.unitCost) / item.unitsPerCase
          : Number(item.unitCost),
        product: item.product ? {
          id: item.product.id,
          name: item.product.name,
          sku: item.product.sku,
          imageUrl: item.product.imageUrl,
          currentPrice: Number(item.product.price),
          currentCost: item.product.cost ? Number(item.product.cost) : null
        } : null
      })),
      shippingExpenses: po.shippingExpenses.map(e => ({
        id: e.id,
        amount: Number(e.amount),
        carrierName: e.carrierName,
        invoiceNumber: e.invoiceNumber,
        deliveryDate: e.deliveryDate?.toISOString() || null,
        notes: e.notes
      })),
      totalShipping,
      receivingTask: po.receivingTask ? {
        id: po.receivingTask.id,
        status: po.receivingTask.status,
        assignee: po.receivingTask.assignee
          ? `${po.receivingTask.assignee.firstName} ${po.receivingTask.assignee.lastName}`
          : null,
        completedAt: po.receivingTask.completedAt?.toISOString() || null
      } : null
    }

    return NextResponse.json({ po: formattedPO })
  } catch (error) {
    console.error('PO detail error:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

// PATCH - Update PO status
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { status, notes, expectedDate } = body

    const updateData: any = {}
    if (status) updateData.status = status
    if (notes !== undefined) updateData.notes = notes
    if (expectedDate) updateData.expectedDate = new Date(expectedDate)

    // If marking as received, set receivedDate
    if (status === 'RECEIVED') {
      updateData.receivedDate = new Date()
    }

    const updated = await prisma.purchaseOrder.update({
      where: { id },
      data: updateData
    })

    return NextResponse.json({ success: true, po: updated })
  } catch (error) {
    console.error('PO update error:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
