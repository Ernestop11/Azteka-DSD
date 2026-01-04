import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export const dynamic = 'force-dynamic'

// GET - List product requests for customer
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: customerId } = await params

    const requests = await prisma.productRequest.findMany({
      where: { customerId },
      orderBy: { createdAt: 'desc' },
      take: 50
    })

    return NextResponse.json({
      requests: requests.map(r => ({
        id: r.id,
        productName: r.productName,
        productSku: r.productSku,
        description: r.description,
        competitorPrice: r.competitorPrice ? Number(r.competitorPrice) : null,
        competitorName: r.competitorName,
        imageUrl: r.imageUrl,
        status: r.status,
        priority: r.priority,
        adminNotes: r.adminNotes,
        createdById: r.createdById,
        reviewedById: r.reviewedById,
        createdAt: r.createdAt.toISOString(),
        reviewedAt: r.reviewedAt?.toISOString() || null
      }))
    })
  } catch (error) {
    console.error('[Product Requests GET] Error:', error)
    return NextResponse.json({ error: 'Failed to load requests' }, { status: 500 })
  }
}

// POST - Create new product request
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: customerId } = await params
    const body = await request.json()

    // Validate required fields
    if (!body.productName || body.productName.trim().length < 2) {
      return NextResponse.json(
        { error: 'Product name is required (min 2 characters)' },
        { status: 400 }
      )
    }

    // Verify customer exists
    const customer = await prisma.customer.findUnique({
      where: { id: customerId },
      select: { id: true, businessName: true }
    })

    if (!customer) {
      return NextResponse.json({ error: 'Customer not found' }, { status: 404 })
    }

    const productRequest = await prisma.productRequest.create({
      data: {
        customerId,
        productName: body.productName.trim(),
        productSku: body.productSku?.trim() || null,
        description: body.description?.trim() || null,
        competitorPrice: body.competitorPrice ? parseFloat(body.competitorPrice) : null,
        competitorName: body.competitorName?.trim() || null,
        imageUrl: body.imageUrl || null,
        status: 'PENDING',
        priority: body.priority || 'NORMAL',
        createdById: body.createdById || 'unknown'
      }
    })

    return NextResponse.json({
      request: {
        id: productRequest.id,
        productName: productRequest.productName,
        status: productRequest.status,
        createdAt: productRequest.createdAt.toISOString()
      }
    })
  } catch (error) {
    console.error('[Product Requests POST] Error:', error)
    return NextResponse.json({ error: 'Failed to create request' }, { status: 500 })
  }
}
