import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export const dynamic = 'force-dynamic'

/**
 * GET /api/admin/vendors
 * List all vendors with optional filtering
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search') || ''
    const active = searchParams.get('active')
    const includeProducts = searchParams.get('includeProducts') === 'true'
    const includeSkuMappings = searchParams.get('includeSkuMappings') === 'true'

    const vendors = await prisma.vendor.findMany({
      where: {
        ...(search && {
          OR: [
            { name: { contains: search, mode: 'insensitive' } },
            { code: { contains: search, mode: 'insensitive' } },
            { contactName: { contains: search, mode: 'insensitive' } },
          ],
        }),
        ...(active !== null && { active: active === 'true' }),
      },
      include: {
        ...(includeProducts && {
          products: {
            select: {
              id: true,
              name: true,
              sku: true,
              price: true,
              imageUrl: true,
              stock: true,
            },
            take: 10,
          },
        }),
        ...(includeSkuMappings && {
          skuMappings: {
            select: {
              id: true,
              vendorSku: true,
              internalSku: true,
              verified: true,
              product: {
                select: { id: true, name: true },
              },
            },
          },
        }),
        _count: {
          select: {
            products: true,
            purchaseOrders: true,
            skuMappings: true,
          },
        },
      },
      orderBy: { name: 'asc' },
    })

    return NextResponse.json({ data: vendors })
  } catch (error: unknown) {
    console.error('[GET /api/admin/vendors] Error:', error)
    const message = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json(
      { error: 'Failed to fetch vendors', details: message },
      { status: 500 }
    )
  }
}

/**
 * POST /api/admin/vendors
 * Create a new vendor
 */
export async function POST(request: NextRequest) {
  try {
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
    } = body

    if (!name) {
      return NextResponse.json(
        { error: 'Vendor name is required' },
        { status: 400 }
      )
    }

    // Check for duplicate name
    const existing = await prisma.vendor.findUnique({
      where: { name },
    })
    if (existing) {
      return NextResponse.json(
        { error: 'A vendor with this name already exists' },
        { status: 400 }
      )
    }

    // Check for duplicate code if provided
    if (code) {
      const existingCode = await prisma.vendor.findUnique({
        where: { code },
      })
      if (existingCode) {
        return NextResponse.json(
          { error: 'A vendor with this code already exists' },
          { status: 400 }
        )
      }
    }

    const vendor = await prisma.vendor.create({
      data: {
        name,
        code: code || null,
        contactName: contactName || null,
        contactEmail: contactEmail || null,
        contactPhone: contactPhone || null,
        address: address || null,
        paymentTerms: paymentTerms || null,
        leadTimeDays: leadTimeDays || 7,
        notes: notes || null,
        active: true,
      },
    })

    return NextResponse.json({ data: vendor }, { status: 201 })
  } catch (error: unknown) {
    console.error('[POST /api/admin/vendors] Error:', error)
    const message = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json(
      { error: 'Failed to create vendor', details: message },
      { status: 500 }
    )
  }
}
