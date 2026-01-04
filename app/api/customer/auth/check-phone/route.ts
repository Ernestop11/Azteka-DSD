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

    // Find customer by phone - need to search across all customers since
    // the stored format may differ (e.g., "(562) 555-0103" vs "5625550103")
    const customers = await prisma.customer.findMany({
      where: { active: true },
      select: {
        id: true,
        businessName: true,
        pin: true,
        phone: true,
      }
    })

    // Find matching customer by normalized phone (exact match only)
    const customer = customers.find(c => {
      const storedNormalized = c.phone?.replace(/\D/g, '') || ''
      // Must have a phone number and match exactly (10 digits)
      if (!storedNormalized || storedNormalized.length < 10) return false
      return storedNormalized === normalizedPhone
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
