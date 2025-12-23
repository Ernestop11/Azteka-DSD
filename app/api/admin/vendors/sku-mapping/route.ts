import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export const dynamic = 'force-dynamic'

/**
 * GET /api/admin/vendors/sku-mapping
 * Get all SKU mappings, optionally filtered by vendor
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const vendorId = searchParams.get('vendorId')
    const search = searchParams.get('search') || ''

    const mappings = await prisma.vendorSkuMapping.findMany({
      where: {
        ...(vendorId && { vendorId }),
        ...(search && {
          OR: [
            { vendorSku: { contains: search, mode: 'insensitive' } },
            { internalSku: { contains: search, mode: 'insensitive' } },
          ],
        }),
      },
      include: {
        vendor: {
          select: { id: true, name: true, code: true },
        },
        product: {
          select: {
            id: true,
            name: true,
            sku: true,
            imageUrl: true,
            price: true,
          },
        },
      },
      orderBy: [{ vendor: { name: 'asc' } }, { vendorSku: 'asc' }],
    })

    return NextResponse.json({ data: mappings })
  } catch (error: unknown) {
    console.error('[GET /api/admin/vendors/sku-mapping] Error:', error)
    const message = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json(
      { error: 'Failed to fetch SKU mappings', details: message },
      { status: 500 }
    )
  }
}

/**
 * POST /api/admin/vendors/sku-mapping
 * Create a new SKU mapping
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { vendorId, vendorSku, internalSku, productId, verified } = body

    if (!vendorId || !vendorSku || !internalSku) {
      return NextResponse.json(
        { error: 'vendorId, vendorSku, and internalSku are required' },
        { status: 400 }
      )
    }

    // Check for duplicate mapping
    const existing = await prisma.vendorSkuMapping.findUnique({
      where: { vendorId_vendorSku: { vendorId, vendorSku } },
    })
    if (existing) {
      return NextResponse.json(
        { error: 'This vendor SKU mapping already exists' },
        { status: 400 }
      )
    }

    // If productId provided, verify it exists and get its SKU
    let resolvedProductId = productId
    if (!productId && internalSku) {
      // Try to find product by internal SKU
      const product = await prisma.product.findUnique({
        where: { sku: internalSku },
      })
      if (product) {
        resolvedProductId = product.id
      }
    }

    const mapping = await prisma.vendorSkuMapping.create({
      data: {
        vendorId,
        vendorSku: vendorSku.trim(),
        internalSku: internalSku.trim(),
        productId: resolvedProductId || null,
        verified: verified ?? false,
        confidence: 1.0,
      },
      include: {
        vendor: { select: { id: true, name: true } },
        product: { select: { id: true, name: true, sku: true } },
      },
    })

    return NextResponse.json({ data: mapping }, { status: 201 })
  } catch (error: unknown) {
    console.error('[POST /api/admin/vendors/sku-mapping] Error:', error)
    const message = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json(
      { error: 'Failed to create SKU mapping', details: message },
      { status: 500 }
    )
  }
}

/**
 * PUT /api/admin/vendors/sku-mapping
 * Update an existing SKU mapping
 */
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, internalSku, productId, verified } = body

    if (!id) {
      return NextResponse.json(
        { error: 'Mapping ID is required' },
        { status: 400 }
      )
    }

    const updateData: Record<string, unknown> = {}
    if (internalSku !== undefined) updateData.internalSku = internalSku.trim()
    if (productId !== undefined) updateData.productId = productId || null
    if (verified !== undefined) updateData.verified = verified

    const mapping = await prisma.vendorSkuMapping.update({
      where: { id },
      data: updateData,
      include: {
        vendor: { select: { id: true, name: true } },
        product: { select: { id: true, name: true, sku: true } },
      },
    })

    return NextResponse.json({ data: mapping })
  } catch (error: unknown) {
    console.error('[PUT /api/admin/vendors/sku-mapping] Error:', error)
    const message = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json(
      { error: 'Failed to update SKU mapping', details: message },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/admin/vendors/sku-mapping
 * Delete a SKU mapping
 */
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { error: 'Mapping ID is required' },
        { status: 400 }
      )
    }

    await prisma.vendorSkuMapping.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error: unknown) {
    console.error('[DELETE /api/admin/vendors/sku-mapping] Error:', error)
    const message = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json(
      { error: 'Failed to delete SKU mapping', details: message },
      { status: 500 }
    )
  }
}
