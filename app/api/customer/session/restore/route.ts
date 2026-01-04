import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export const dynamic = 'force-dynamic'

// POST /api/customer/session/restore - Restore session from cookie
export async function POST(request: NextRequest) {
  try {
    // Get token from HTTP-only cookie
    const token = request.cookies.get('customerToken')?.value

    if (!token) {
      return NextResponse.json({ valid: false, error: 'No session cookie' }, { status: 401 })
    }

    // Find session
    const session = await prisma.customerSession.findUnique({
      where: { token },
      include: {
        customer: {
          select: {
            id: true,
            businessName: true,
            contactName: true,
            email: true,
            priceTier: true,
            role: true,
            parentCustomerId: true,
          }
        }
      }
    })

    if (!session) {
      // Clear invalid cookies
      const response = NextResponse.json({ valid: false, error: 'Session not found' }, { status: 401 })
      response.cookies.delete('customerToken')
      response.cookies.delete('customerSessionActive')
      return response
    }

    // Check if expired
    if (new Date() > session.expiresAt) {
      // Clear expired cookies
      const response = NextResponse.json({ valid: false, error: 'Session expired' }, { status: 401 })
      response.cookies.delete('customerToken')
      response.cookies.delete('customerSessionActive')
      return response
    }

    // Update last active time
    await prisma.customerSession.update({
      where: { id: session.id },
      data: { lastActiveAt: new Date() }
    })

    return NextResponse.json({
      valid: true,
      token: session.token,
      expiresAt: session.expiresAt.toISOString(),
      customer: session.customer,
    })
  } catch (error) {
    console.error('[Customer Session Restore] Error:', error)
    return NextResponse.json({ valid: false, error: 'Failed to restore session' }, { status: 500 })
  }
}
