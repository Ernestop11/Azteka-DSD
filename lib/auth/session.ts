import { cookies } from 'next/headers'
import prisma from '@/lib/prisma'

const SESSION_COOKIE = 'session_azteka'

export async function getSession() {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get(SESSION_COOKIE)?.value

    if (!token) {
      console.log('[SESSION] No session cookie found')
      return null
    }

    console.log('[SESSION] Session cookie found, validating...')

    // Find session in database
    const session = await prisma.session.findUnique({
      where: { token },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
            role: true,
          },
        },
      },
    })

    if (!session) {
      console.log('[SESSION] Session not found in database')
      return null
    }

    // Check if session is expired
    if (session.expiresAt < new Date()) {
      console.log('[SESSION] Session expired')
      // Clean up expired session
      await prisma.session.delete({ where: { id: session.id } }).catch(() => {})
      return null
    }

    console.log('[SESSION] Session valid for user:', session.user.email)
    return {
      token: session.token,
      user: session.user,
    }
  } catch (error: any) {
    console.error('[SESSION] Error reading session:', error)
    return null
  }
}

export async function deleteSession(token: string) {
  try {
    await prisma.session.deleteMany({
      where: { token },
    })
    console.log('[SESSION] Session deleted')
  } catch (error) {
    console.error('[SESSION] Error deleting session:', error)
  }
}
