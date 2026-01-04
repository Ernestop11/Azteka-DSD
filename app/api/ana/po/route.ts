import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { v4 as uuidv4 } from 'uuid'

// GET all purchase orders
export async function GET() {
  try {
    const purchaseOrders = await prisma.purchaseOrder.findMany({
      include: {
        vendor: { select: { id: true, name: true } },
        _count: { select: { items: true } }
      },
      orderBy: { createdAt: 'desc' }
    })

    const orders = purchaseOrders.map(po => ({
      id: po.id,
      poNumber: po.poNumber,
      vendor: po.vendor?.name || 'Sin proveedor',
      vendorId: po.vendorId,
      status: po.status,
      total: Number(po.total),
      itemCount: po._count.items,
      createdAt: po.createdAt.toISOString(),
      expectedDate: po.expectedDate?.toISOString() || null
    }))

    // Get vendors for dropdown
    const vendors = await prisma.vendor.findMany({
      where: { active: true },
      select: { id: true, name: true, code: true },
      orderBy: { name: 'asc' }
    })

    return NextResponse.json({ orders, vendors })
  } catch (error) {
    console.error('PO list error:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

// POST - Create a new purchase order
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { vendorId, expectedDate, notes, items } = body

    if (!vendorId) {
      return NextResponse.json({ error: 'Vendor is required' }, { status: 400 })
    }

    if (!items || items.length === 0) {
      return NextResponse.json({ error: 'At least one item is required' }, { status: 400 })
    }

    // Generate PO number
    const date = new Date()
    const poNumber = `PO-${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, '0')}${String(date.getDate()).padStart(2, '0')}-${Math.random().toString(36).substr(2, 4).toUpperCase()}`

    // Calculate total
    const total = items.reduce((sum: number, item: any) => sum + (item.quantity * item.unitCost), 0)

    // Get product info for items
    const productIds = items.map((i: any) => i.productId).filter(Boolean)
    const products = await prisma.product.findMany({
      where: { id: { in: productIds } },
      select: { id: true, sku: true, name: true }
    })
    const productMap = new Map(products.map(p => [p.id, p]))

    // Create PO with items
    const po = await prisma.purchaseOrder.create({
      data: {
        id: uuidv4(),
        poNumber,
        vendorId,
        status: 'PENDING',
        total,
        notes: notes || null,
        expectedDate: expectedDate ? new Date(expectedDate) : null,
        items: {
          create: items.map((item: any) => {
            const product = productMap.get(item.productId)
            return {
              id: uuidv4(),
              productId: item.productId,
              vendorSku: product?.sku || '',
              description: product?.name || 'Unknown Product',
              quantityOrdered: item.quantity,
              unitCost: item.unitCost,
              totalCost: item.quantity * item.unitCost
            }
          })
        }
      },
      include: {
        vendor: { select: { name: true } },
        items: {
          include: {
            product: { select: { name: true } }
          }
        }
      }
    })

    return NextResponse.json({
      success: true,
      po: {
        id: po.id,
        poNumber: po.poNumber,
        vendor: po.vendor?.name,
        total: Number(po.total),
        itemCount: po.items.length
      }
    })
  } catch (error) {
    console.error('Create PO error:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
