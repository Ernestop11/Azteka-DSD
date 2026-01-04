import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export const dynamic = 'force-dynamic'

// POST /api/customer/auth/logout - Clear session and cookies
export async function POST(request: NextRequest) {
  try {
    // Get token from cookie
    const token = request.cookies.get('customerToken')?.value

    if (token) {
      // Invalidate session in database
      try {
        await prisma.customerSession.update({
          where: { token },
          data: { usedAt: new Date() }
        })
      } catch (e) {
        // Session may not exist, ignore
      }
    }

    // Clear cookies
    const response = NextResponse.json({ success: true })
    response.cookies.delete('customerToken')
    response.cookies.delete('customerSessionActive')

    return response
  } catch (error) {
    console.error('[Customer Auth] Logout error:', error)
    // Still try to clear cookies even on error
    const response = NextResponse.json({ success: true })
    response.cookies.delete('customerToken')
    response.cookies.delete('customerSessionActive')
    return response
  }
}
