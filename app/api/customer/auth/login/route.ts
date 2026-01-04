import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import { randomBytes } from 'crypto'

export const dynamic = 'force-dynamic'

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

    // Find customer by phone - search all active customers and match normalized
    const customers = await prisma.customer.findMany({
      where: { active: true },
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

    // Find matching customer by normalized phone (exact match only)
    const customer = customers.find(c => {
      const storedNormalized = c.phone?.replace(/\D/g, '') || ''
      // Must have a phone number and match exactly (10 digits)
      if (!storedNormalized || storedNormalized.length < 10) return false
      return storedNormalized === normalizedPhone
    })

    if (!customer) {
      return NextResponse.json({ error: 'Account not found' }, { status: 404 })
    }

    // If customer has no PIN, set it (first-time setup)
    if (!customer.pin) {
      const hashedPin = await bcrypt.hash(pin, 10)
      await prisma.customer.update({
        where: { id: customer.id },
        data: { pin: hashedPin }
      })
    } else {
      // Verify PIN - support both bcrypt and legacy SHA-256
      let isValid = false

      // Try bcrypt first (starts with $2)
      if (customer.pin.startsWith('$2')) {
        isValid = await bcrypt.compare(pin, customer.pin)
      } else {
        // Legacy SHA-256 fallback
        const { createHash } = await import('crypto')
        const hashedInputPin = createHash('sha256').update(pin).digest('hex')
        isValid = customer.pin === hashedInputPin

        // Migrate to bcrypt if valid
        if (isValid) {
          const newHash = await bcrypt.hash(pin, 10)
          await prisma.customer.update({
            where: { id: customer.id },
            data: { pin: newHash }
          })
        }
      }

      if (!isValid) {
        return NextResponse.json({ error: 'Invalid PIN' }, { status: 401 })
      }
    }

    // Create session - OWNERs get 30-day sessions, others get 7-day sessions
    const token = randomBytes(32).toString('hex')
    const sessionDuration = customer.role === 'OWNER'
      ? 30 * 24 * 60 * 60 * 1000  // 30 days for owners
      : 7 * 24 * 60 * 60 * 1000   // 7 days for others
    const expiresAt = new Date(Date.now() + sessionDuration)

    await prisma.customerSession.create({
      data: {
        customerId: customer.id,
        token,
        type: 'PIN_LOGIN',
        expiresAt,
        lastActiveAt: new Date(),
      }
    })

    // Create response with session cookie for PWA persistence
    const response = NextResponse.json({
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

    // Set HTTP-only cookie for better PWA session persistence
    response.cookies.set('customerToken', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      expires: expiresAt,
      path: '/',
    })

    // Also set a non-httpOnly cookie so client JS can check auth status
    response.cookies.set('customerSessionActive', 'true', {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      expires: expiresAt,
      path: '/',
    })

    return response
  } catch (error) {
    console.error('[Customer Auth] Login error:', error)
    return NextResponse.json({ error: 'Login failed' }, { status: 500 })
  }
}
