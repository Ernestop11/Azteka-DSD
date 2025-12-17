import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

const SESSION_COOKIE = 'session_azteka'

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get(SESSION_COOKIE)?.value

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const session = await prisma.session.findUnique({
      where: { token },
      include: {
        User: {
          select: {
            id: true,
            email: true,
            role: true,
          },
        },
      },
    })

    if (!session || session.expiresAt < new Date()) {
      if (session) {
        await prisma.session
          .delete({ where: { id: session.id } })
          .catch(() => {})
      }
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    return NextResponse.json({
      id: session.User.id,
      email: session.User.email,
      role: session.User.role,
    })
  } catch (error: any) {
    console.error('[AUTH/ME] Error:', error)
    return NextResponse.json(
      { error: 'Unauthorized', details: error?.message },
      { status: 401 }
    )
  }
}
