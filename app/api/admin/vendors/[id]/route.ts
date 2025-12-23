import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export const dynamic = 'force-dynamic'

/**
 * GET /api/admin/vendors/[id]
 * Get a single vendor with full details
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const vendor = await prisma.vendor.findUnique({
      where: { id },
      include: {
        products: {
          select: {
            id: true,
            name: true,
            sku: true,
            price: true,
            cost: true,
            imageUrl: true,
            stock: true,
            inStock: true,
            Category: { select: { id: true, name: true } },
            Brand: { select: { id: true, name: true } },
          },
          orderBy: { name: 'asc' },
        },
        skuMappings: {
          include: {
            product: {
              select: { id: true, name: true, sku: true },
            },
          },
          orderBy: { vendorSku: 'asc' },
        },
        purchaseOrders: {
          select: {
            id: true,
            poNumber: true,
            status: true,
            total: true,
            createdAt: true,
            _count: { select: { items: true } },
          },
          orderBy: { createdAt: 'desc' },
          take: 20,
        },
        _count: {
          select: {
            products: true,
            purchaseOrders: true,
            skuMappings: true,
          },
        },
      },
    })

    if (!vendor) {
      return NextResponse.json({ error: 'Vendor not found' }, { status: 404 })
    }

    return NextResponse.json({ data: vendor })
  } catch (error: unknown) {
    console.error('[GET /api/admin/vendors/[id]] Error:', error)
    const message = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json(
      { error: 'Failed to fetch vendor', details: message },
      { status: 500 }
    )
  }
}

/**
 * PUT /api/admin/vendors/[id]
 * Update a vendor
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const {
      name,
      code,
      contactName,
      contactEmail,
      contactPhone,
      address,
      paymentTerms,
      leadTimeDays,
      notes,
      active,
    } = body

    // Build update data
    const updateData: Record<string, unknown> = {}
    if (name !== undefined) updateData.name = name
    if (code !== undefined) updateData.code = code || null
    if (contactName !== undefined) updateData.contactName = contactName || null
    if (contactEmail !== undefined) updateData.contactEmail = contactEmail || null
    if (contactPhone !== undefined) updateData.contactPhone = contactPhone || null
    if (address !== undefined) updateData.address = address || null
    if (paymentTerms !== undefined) updateData.paymentTerms = paymentTerms || null
    if (leadTimeDays !== undefined) updateData.leadTimeDays = leadTimeDays
    if (notes !== undefined) updateData.notes = notes || null
    if (active !== undefined) updateData.active = active

    // Check for duplicate name if changing
    if (name) {
      const existing = await prisma.vendor.findFirst({
        where: { name, NOT: { id } },
      })
      if (existing) {
        return NextResponse.json(
          { error: 'A vendor with this name already exists' },
          { status: 400 }
        )
      }
    }

    // Check for duplicate code if changing
    if (code) {
      const existingCode = await prisma.vendor.findFirst({
        where: { code, NOT: { id } },
      })
      if (existingCode) {
        return NextResponse.json(
          { error: 'A vendor with this code already exists' },
          { status: 400 }
        )
      }
    }

    const vendor = await prisma.vendor.update({
      where: { id },
      data: updateData,
      include: {
        _count: {
          select: {
            products: true,
            purchaseOrders: true,
            skuMappings: true,
          },
        },
      },
    })

    return NextResponse.json({ data: vendor })
  } catch (error: unknown) {
    console.error('[PUT /api/admin/vendors/[id]] Error:', error)
    const message = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json(
      { error: 'Failed to update vendor', details: message },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/admin/vendors/[id]
 * Soft delete (deactivate) a vendor
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    // Check if vendor has active purchase orders
    const activePOs = await prisma.purchaseOrder.count({
      where: {
        vendorId: id,
        status: { notIn: ['RECEIVED', 'STOCKED', 'CANCELLED'] },
      },
    })

    if (activePOs > 0) {
      return NextResponse.json(
        { error: `Cannot delete vendor with ${activePOs} active purchase orders` },
        { status: 400 }
      )
    }

    // Soft delete - just deactivate
    await prisma.vendor.update({
      where: { id },
      data: { active: false },
    })

    return NextResponse.json({ success: true })
  } catch (error: unknown) {
    console.error('[DELETE /api/admin/vendors/[id]] Error:', error)
    const message = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json(
      { error: 'Failed to delete vendor', details: message },
      { status: 500 }
    )
  }
}
