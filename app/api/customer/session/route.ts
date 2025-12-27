import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { randomBytes } from 'crypto'

export const dynamic = 'force-dynamic'

// POST /api/customer/session - Create a magic link session for a customer
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { customerId, createdById, type = 'MAGIC_LINK' } = body

    if (!customerId) {
      return NextResponse.json({ error: 'Customer ID required' }, { status: 400 })
    }

    // Verify customer exists
    const customer = await prisma.customer.findUnique({
      where: { id: customerId },
      select: { id: true, businessName: true, phone: true }
    })

    if (!customer) {
      return NextResponse.json({ error: 'Customer not found' }, { status: 404 })
    }

    // Generate secure token
    const token = randomBytes(32).toString('hex')

    // Set expiration (12 hours from now)
    const expiresAt = new Date(Date.now() + 12 * 60 * 60 * 1000)

    // Create session
    const session = await prisma.customerSession.create({
      data: {
        customerId,
        token,
        type: type as 'MAGIC_LINK' | 'PIN_LOGIN' | 'DELEGATED',
        createdById,
        expiresAt,
        lastActiveAt: new Date(),
      }
    })

    // Build magic link URL
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://aztekafoods.com'
    const magicLink = `${baseUrl}/c/${token}`

    return NextResponse.json({
      success: true,
      session: {
        id: session.id,
        token: session.token,
        expiresAt: session.expiresAt,
      },
      magicLink,
      customer: {
        id: customer.id,
        businessName: customer.businessName,
      }
    })
  } catch (error) {
    console.error('[Customer Session API] Error creating session:', error)
    return NextResponse.json({ error: 'Failed to create session' }, { status: 500 })
  }
}

// GET /api/customer/session?token=xxx - Validate a session token
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const token = searchParams.get('token')

    if (!token) {
      return NextResponse.json({ error: 'Token required' }, { status: 400 })
    }

    const session = await prisma.customerSession.findUnique({
      where: { token },
      include: {
        customer: {
          select: {
            id: true,
            businessName: true,
            contactName: true,
            phone: true,
            email: true,
            priceTier: true,
            role: true,
            parentCustomerId: true,
            salesRepId: true,
            salesRep: {
              select: { id: true, name: true }
            },
            subStores: {
              select: {
                id: true,
                businessName: true,
                contactName: true,
              }
            }
          }
        }
      }
    })

    if (!session) {
      return NextResponse.json({ error: 'Invalid token', valid: false }, { status: 404 })
    }

    // Check if expired
    if (new Date() > session.expiresAt) {
      return NextResponse.json({ error: 'Token expired', valid: false }, { status: 401 })
    }

    // Check if already used (for magic links - order was placed)
    if (session.type === 'MAGIC_LINK' && session.usedAt) {
      return NextResponse.json({ error: 'Link already used', valid: false }, { status: 401 })
    }

    // Update last active time
    await prisma.customerSession.update({
      where: { id: session.id },
      data: { lastActiveAt: new Date() }
    })

    return NextResponse.json({
      valid: true,
      session: {
        id: session.id,
        type: session.type,
        expiresAt: session.expiresAt,
        createdById: session.createdById,
      },
      customer: session.customer,
    })
  } catch (error) {
    console.error('[Customer Session API] Error validating session:', error)
    return NextResponse.json({ error: 'Failed to validate session' }, { status: 500 })
  }
}

// DELETE /api/customer/session - Invalidate a session (on order completion)
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const token = searchParams.get('token')

    if (!token) {
      return NextResponse.json({ error: 'Token required' }, { status: 400 })
    }

    // Mark session as used
    await prisma.customerSession.update({
      where: { token },
      data: { usedAt: new Date() }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[Customer Session API] Error invalidating session:', error)
    return NextResponse.json({ error: 'Failed to invalidate session' }, { status: 500 })
  }
}
