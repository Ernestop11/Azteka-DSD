/**
 * Debug Session Endpoint
 * GET /api/debug/session - Test session validation
 *
 * Returns current session status and user info if authenticated
 */

import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth/session'

export async function GET(request: NextRequest) {
  try {
    console.log('[DEBUG/SESSION] Testing session validation...')

    const session = await getSession()

    if (!session) {
      console.log('[DEBUG/SESSION] No valid session found')
      return NextResponse.json({
        sessionValid: false,
        error: 'No valid session found',
        cookie: request.cookies.get('session_azteka')?.value ? 'Cookie exists but invalid/expired' : 'No cookie found',
      })
    }

    console.log('[DEBUG/SESSION] Valid session found for user:', session.user.email)
    return NextResponse.json({
      sessionValid: true,
      user: {
        id: session.user.id,
        email: session.user.email,
        name: session.user.name,
        role: session.user.role,
      },
      token: session.token.substring(0, 8) + '...', // Partial token for security
    })
  } catch (error: any) {
    console.error('[DEBUG/SESSION] Error:', error)
    return NextResponse.json({
      sessionValid: false,
      error: 'Session validation error',
      details: error?.message,
    }, { status: 500 })
  }
}
