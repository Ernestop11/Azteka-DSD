import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET single product
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const product = await prisma.product.findUnique({
      where: { id: params.id },
      include: {
        Category: { select: { id: true, name: true } },
        Vendor: { select: { id: true, name: true } }
      }
    })

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }

    return NextResponse.json(product)
  } catch (error) {
    console.error('Product fetch error:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

// PATCH - Update product pricing
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const { price, cost, priceTierA, priceTierB, priceTierC, margin } = body

    const updateData: any = {}

    // Update base price
    if (price !== undefined) {
      updateData.price = price
    }

    // Update cost
    if (cost !== undefined) {
      updateData.cost = cost
    }

    // Update tier prices
    if (priceTierA !== undefined) {
      updateData.priceTierA = priceTierA
    }
    if (priceTierB !== undefined) {
      updateData.priceTierB = priceTierB
    }
    if (priceTierC !== undefined) {
      updateData.priceTierC = priceTierC
    }

    // Update margin
    if (margin !== undefined) {
      updateData.margin = margin
    }

    const updated = await prisma.product.update({
      where: { id: params.id },
      data: updateData,
      include: {
        Category: { select: { id: true, name: true } },
        Vendor: { select: { id: true, name: true } }
      }
    })

    return NextResponse.json(updated)
  } catch (error) {
    console.error('Product update error:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
