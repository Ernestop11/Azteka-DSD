import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export const dynamic = 'force-dynamic'

// POST /api/customer/auth/change-pin - Change customer PIN
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { customerId, currentPin, newPin, token } = body

    if (!customerId || !newPin) {
      return NextResponse.json({ error: 'Customer ID and new PIN required' }, { status: 400 })
    }

    if (newPin.length < 4 || newPin.length > 6) {
      return NextResponse.json({ error: 'PIN must be 4-6 digits' }, { status: 400 })
    }

    if (!/^\d+$/.test(newPin)) {
      return NextResponse.json({ error: 'PIN must contain only digits' }, { status: 400 })
    }

    // Verify session token if provided
    if (token) {
      const session = await prisma.customerSession.findFirst({
        where: {
          token,
          customerId,
          expiresAt: { gt: new Date() }
        }
      })

      if (!session) {
        return NextResponse.json({ error: 'Invalid session' }, { status: 401 })
      }
    }

    // Get customer
    const customer = await prisma.customer.findUnique({
      where: { id: customerId },
      select: { id: true, pin: true }
    })

    if (!customer) {
      return NextResponse.json({ error: 'Customer not found' }, { status: 404 })
    }

    // If customer has existing PIN, verify current PIN
    if (customer.pin && currentPin) {
      let isValid = false

      if (customer.pin.startsWith('$2')) {
        isValid = await bcrypt.compare(currentPin, customer.pin)
      } else {
        // Legacy SHA-256 fallback
        const { createHash } = await import('crypto')
        const hashedInputPin = createHash('sha256').update(currentPin).digest('hex')
        isValid = customer.pin === hashedInputPin
      }

      if (!isValid) {
        return NextResponse.json({ error: 'Current PIN is incorrect' }, { status: 401 })
      }
    }

    // Hash new PIN
    const hashedPin = await bcrypt.hash(newPin, 10)

    // Update PIN
    await prisma.customer.update({
      where: { id: customerId },
      data: { pin: hashedPin }
    })

    return NextResponse.json({
      success: true,
      message: 'PIN updated successfully'
    })
  } catch (error) {
    console.error('[Customer Auth] Change PIN error:', error)
    return NextResponse.json({ error: 'Failed to change PIN' }, { status: 500 })
  }
}
