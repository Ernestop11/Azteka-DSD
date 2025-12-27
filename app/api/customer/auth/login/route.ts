import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { createHash } from 'crypto'
import { randomBytes } from 'crypto'

export const dynamic = 'force-dynamic'

// Hash PIN for storage/comparison
function hashPin(pin: string): string {
  return createHash('sha256').update(pin).digest('hex')
}

// POST /api/customer/auth/login - Login with phone + PIN
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { phone, pin } = body

    if (!phone || !pin) {
      return NextResponse.json({ error: 'Phone and PIN required' }, { status: 400 })
    }

    // Normalize phone
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
        contactName: true,
        phone: true,
        email: true,
        priceTier: true,
        role: true,
        parentCustomerId: true,
        pin: true,
        salesRepId: true,
      }
    })

    if (!customer) {
      return NextResponse.json({ error: 'Account not found' }, { status: 404 })
    }

    // If customer has no PIN, set it (first-time setup)
    if (!customer.pin) {
      const hashedPin = hashPin(pin)
      await prisma.customer.update({
        where: { id: customer.id },
        data: { pin: hashedPin }
      })
    } else {
      // Verify PIN
      const hashedInputPin = hashPin(pin)
      if (customer.pin !== hashedInputPin) {
        return NextResponse.json({ error: 'Invalid PIN' }, { status: 401 })
      }
    }

    // Create session
    const token = randomBytes(32).toString('hex')
    const expiresAt = new Date(Date.now() + 12 * 60 * 60 * 1000) // 12 hours

    await prisma.customerSession.create({
      data: {
        customerId: customer.id,
        token,
        type: 'PIN_LOGIN',
        expiresAt,
        lastActiveAt: new Date(),
      }
    })

    return NextResponse.json({
      success: true,
      token,
      expiresAt: expiresAt.toISOString(),
      customer: {
        id: customer.id,
        businessName: customer.businessName,
        contactName: customer.contactName,
        email: customer.email,
        priceTier: customer.priceTier,
        role: customer.role,
        parentCustomerId: customer.parentCustomerId,
      }
    })
  } catch (error) {
    console.error('[Customer Auth] Login error:', error)
    return NextResponse.json({ error: 'Login failed' }, { status: 500 })
  }
}
