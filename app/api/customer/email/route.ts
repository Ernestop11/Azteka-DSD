import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

// GET - Check if customer has email on file
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const customerId = searchParams.get('customerId')

    if (!customerId) {
      return NextResponse.json({ error: 'Customer ID required' }, { status: 400 })
    }

    const customer = await prisma.customer.findUnique({
      where: { id: customerId },
      select: { email: true, businessName: true }
    })

    if (!customer) {
      return NextResponse.json({ error: 'Customer not found' }, { status: 404 })
    }

    return NextResponse.json({
      hasEmail: !!customer.email && customer.email.length > 0,
      email: customer.email || null
    })
  } catch (error) {
    console.error('Error checking customer email:', error)
    return NextResponse.json({ error: 'Failed to check email' }, { status: 500 })
  }
}

// POST - Update customer email
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { customerId, email } = body

    if (!customerId) {
      return NextResponse.json({ error: 'Customer ID required' }, { status: 400 })
    }

    if (!email || !email.includes('@')) {
      return NextResponse.json({ error: 'Valid email required' }, { status: 400 })
    }

    // Check if email is already used by another customer
    const existingCustomer = await prisma.customer.findFirst({
      where: {
        email,
        id: { not: customerId }
      }
    })

    if (existingCustomer) {
      return NextResponse.json({ error: 'Email already in use' }, { status: 409 })
    }

    const customer = await prisma.customer.update({
      where: { id: customerId },
      data: { email },
      select: { id: true, email: true, businessName: true }
    })

    return NextResponse.json({
      success: true,
      customer: {
        id: customer.id,
        email: customer.email,
        businessName: customer.businessName
      }
    })
  } catch (error) {
    console.error('Error updating customer email:', error)
    return NextResponse.json({ error: 'Failed to update email' }, { status: 500 })
  }
}
