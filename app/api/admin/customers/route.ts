import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const active = searchParams.get('active')
    const limit = parseInt(searchParams.get('limit') || '100')
    const search = searchParams.get('search')

    const where: any = {}
    
    if (active === 'true') {
      where.active = true
    }
    
    if (search) {
      where.OR = [
        { businessName: { contains: search, mode: 'insensitive' } },
        { contactName: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ]
    }

    const customers = await prisma.customer.findMany({
      where,
      take: limit,
      orderBy: {
        businessName: 'asc',
      },
    })

    return NextResponse.json({ data: customers })
  } catch (error: any) {
    console.error('Error fetching customers:', error)
    return NextResponse.json(
      { error: 'Failed to fetch customers', details: error?.message },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, storeName, address, city, state, zip, phone, email, priceTier } = body

    // TODO: Check admin permissions
    // TODO: Validate request body (name, storeName required)
    // TODO: Use prisma.customer.create() with all fields
    // TODO: Return created customer

    return NextResponse.json({
      message: 'Create customer placeholder',
      customer: null,
      // TODO: Return actual created customer
    })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to create customer' },
      { status: 500 }
    )
  }
}
