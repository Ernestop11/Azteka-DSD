import { NextRequest, NextResponse } from 'next/server'
import { createHash } from 'crypto'
import prisma from '@/lib/prisma'

export const dynamic = 'force-dynamic'

// POST /api/customer/onboard - Set customer PIN during onboarding
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { token, pin, customerId } = body

    if (!token || !pin || !customerId) {
      return NextResponse.json(
        { error: 'Token, PIN, and customerId are required' },
        { status: 400 }
      )
    }

    // Validate PIN format
    if (!/^\d{4,6}$/.test(pin)) {
      return NextResponse.json(
        { error: 'PIN must be 4-6 digits' },
        { status: 400 }
      )
    }

    // Validate the session
    const session = await prisma.customerSession.findUnique({
      where: { token },
      include: {
        customer: {
          select: { id: true, businessName: true, pin: true }
        }
      }
    })

    if (!session) {
      return NextResponse.json(
        { error: 'Invalid session' },
        { status: 401 }
      )
    }

    if (new Date() > session.expiresAt) {
      return NextResponse.json(
        { error: 'Session expired' },
        { status: 401 }
      )
    }

    if (session.customerId !== customerId) {
      return NextResponse.json(
        { error: 'Customer ID mismatch' },
        { status: 401 }
      )
    }

    // Hash the PIN
    const hashedPin = createHash('sha256').update(pin).digest('hex')

    // Update customer with new PIN
    await prisma.customer.update({
      where: { id: customerId },
      data: { pin: hashedPin }
    })

    // Track PIN_CREATED event if session has link purpose
    if (session.linkPurpose) {
      await prisma.customerLinkEvent.create({
        data: {
          sessionId: session.id,
          customerId,
          eventType: 'PIN_CREATED',
          eventData: { linkPurpose: session.linkPurpose },
          deviceType: request.headers.get('sec-ch-ua-mobile') === '?1' ? 'mobile' : 'desktop',
          userAgent: request.headers.get('user-agent') || undefined,
        }
      })

      // Also track ONBOARDING_COMPLETED
      await prisma.customerLinkEvent.create({
        data: {
          sessionId: session.id,
          customerId,
          eventType: 'ONBOARDING_COMPLETED',
          eventData: { linkPurpose: session.linkPurpose },
          deviceType: request.headers.get('sec-ch-ua-mobile') === '?1' ? 'mobile' : 'desktop',
          userAgent: request.headers.get('user-agent') || undefined,
        }
      })
    }

    return NextResponse.json({
      success: true,
      message: 'PIN set successfully',
      customer: {
        id: customerId,
        businessName: session.customer.businessName
      }
    })
  } catch (error) {
    console.error('[Customer Onboard] Error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to set PIN' },
      { status: 500 }
    )
  }
}
