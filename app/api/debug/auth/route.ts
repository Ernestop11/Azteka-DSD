import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { getSession } from '@/lib/auth/session'

export async function GET(request: NextRequest) {
  try {
    console.log('[DEBUG/AUTH] Reading cookies...')
    const cookieStore = await cookies()
    const sessionCookie = cookieStore.get('session_azteka')
    
    console.log('[DEBUG/AUTH] Session cookie present:', !!sessionCookie)
    console.log('[DEBUG/AUTH] Session cookie value length:', sessionCookie?.value?.length || 0)

    const session = await getSession()

    if (!session) {
      return NextResponse.json({
        ok: false,
        error: 'No valid session',
        cookiePresent: !!sessionCookie,
      })
    }

    return NextResponse.json({
      ok: true,
      user: session.user,
      cookiePresent: true,
    })
  } catch (error: any) {
    console.error('[DEBUG/AUTH] Error:', error)
    return NextResponse.json(
      { ok: false, error: error?.message },
      { status: 500 }
    )
  }
}
