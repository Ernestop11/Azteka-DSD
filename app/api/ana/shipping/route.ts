import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { v4 as uuidv4 } from 'uuid'

// GET all shipping expenses with vendor info
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const vendorId = searchParams.get('vendorId')
    const poId = searchParams.get('poId')

    const where: any = {}
    if (vendorId) where.vendorId = vendorId
    if (poId) where.purchaseOrderId = poId

    const expenses = await prisma.shippingExpense.findMany({
      where,
      include: {
        vendor: { select: { id: true, name: true } },
        purchaseOrder: { select: { id: true, poNumber: true, total: true } }
      },
      orderBy: { createdAt: 'desc' }
    })

    // Get vendors and POs for dropdowns
    const vendors = await prisma.vendor.findMany({
      where: { active: true },
      select: { id: true, name: true, code: true },
      orderBy: { name: 'asc' }
    })

    const purchaseOrders = await prisma.purchaseOrder.findMany({
      where: { status: { not: 'CANCELLED' } },
      select: { id: true, poNumber: true, vendorId: true },
      orderBy: { createdAt: 'desc' },
      take: 50
    })

    // Calculate stats
    const stats = {
      totalExpenses: expenses.length,
      totalAmount: expenses.reduce((sum, e) => sum + Number(e.amount), 0),
      thisMonth: expenses
        .filter(e => {
          const now = new Date()
          const expDate = e.deliveryDate || e.createdAt
          return expDate.getMonth() === now.getMonth() && expDate.getFullYear() === now.getFullYear()
        })
        .reduce((sum, e) => sum + Number(e.amount), 0)
    }

    return NextResponse.json({
      expenses: expenses.map(e => ({
        id: e.id,
        purchaseOrderId: e.purchaseOrderId,
        vendorId: e.vendorId,
        invoiceNumber: e.invoiceNumber,
        invoiceDate: e.invoiceDate?.toISOString() || null,
        deliveryDate: e.deliveryDate?.toISOString() || null,
        amount: Number(e.amount),
        carrierName: e.carrierName,
        trackingNumber: e.trackingNumber,
        notes: e.notes,
        createdAt: e.createdAt.toISOString(),
        vendor: e.vendor ? { id: e.vendor.id, name: e.vendor.name } : null,
        purchaseOrder: e.purchaseOrder ? {
          id: e.purchaseOrder.id,
          poNumber: e.purchaseOrder.poNumber,
          total: Number(e.purchaseOrder.total)
        } : null
      })),
      vendors,
      purchaseOrders,
      stats
    })
  } catch (error) {
    console.error('Shipping expenses list error:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

// POST - Create new shipping expense
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      purchaseOrderId,
      vendorId,
      invoiceNumber,
      invoiceDate,
      deliveryDate,
      amount,
      carrierName,
      trackingNumber,
      notes
    } = body

    if (!amount || amount <= 0) {
      return NextResponse.json({ error: 'El monto es requerido' }, { status: 400 })
    }

    const expense = await prisma.shippingExpense.create({
      data: {
        id: uuidv4(),
        purchaseOrderId: purchaseOrderId || null,
        vendorId: vendorId || null,
        invoiceNumber: invoiceNumber || null,
        invoiceDate: invoiceDate ? new Date(invoiceDate) : null,
        deliveryDate: deliveryDate ? new Date(deliveryDate) : null,
        amount,
        carrierName: carrierName || null,
        trackingNumber: trackingNumber || null,
        notes: notes || null
      },
      include: {
        vendor: { select: { name: true } },
        purchaseOrder: { select: { poNumber: true } }
      }
    })

    return NextResponse.json({
      success: true,
      expense: {
        id: expense.id,
        amount: Number(expense.amount),
        vendor: expense.vendor?.name,
        poNumber: expense.purchaseOrder?.poNumber
      }
    })
  } catch (error) {
    console.error('Create shipping expense error:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
