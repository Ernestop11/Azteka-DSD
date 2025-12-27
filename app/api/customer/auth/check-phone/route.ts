import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export const dynamic = 'force-dynamic'

// POST /api/customer/auth/check-phone - Check if phone number exists
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { phone } = body

    if (!phone) {
      return NextResponse.json({ error: 'Phone number required' }, { status: 400 })
    }

    // Normalize phone - remove all non-digits
    const normalizedPhone = phone.replace(/\D/g, '')

    // Find customer by phone
    const customer = await prisma.customer.findFirst({
      where: {
        phone: {
          contains: normalizedPhone,
        },
        active: true,
      },
      select: {
        id: true,
        businessName: true,
        pin: true,
      }
    })

    if (!customer) {
      return NextResponse.json({
        error: 'No account found with this phone number. Contact your sales rep to get set up.',
        found: false
      }, { status: 404 })
    }

    return NextResponse.json({
      found: true,
      businessName: customer.businessName,
      hasPin: !!customer.pin,
    })
  } catch (error) {
    console.error('[Customer Auth] Check phone error:', error)
    return NextResponse.json({ error: 'Failed to check phone number' }, { status: 500 })
  }
}
