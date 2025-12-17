import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

const SESSION_COOKIE = 'session_azteka'

/**
 * GET /api/auth/session
 * Validates the current session and returns user data
 */
export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get(SESSION_COOKIE)?.value

    if (!token) {
      return NextResponse.json({})
    }

    // Find session in database
    const session = await prisma.session.findUnique({
      where: { token },
      include: {
        User: {
          select: {
            id: true,
            email: true,
            name: true,
            role: true,
          },
        },
      },
    })

    // Check if session exists and is not expired
    if (!session || session.expiresAt < new Date()) {
      // Delete expired session
      if (session) {
        await prisma.session.delete({
          where: { id: session.id },
        }).catch(() => {
          // Ignore errors if session already deleted
        })
      }
      return NextResponse.json({})
    }

    // Return user and role
    return NextResponse.json({
      user: {
        id: session.User.id,
        email: session.User.email,
        name: session.User.name,
        role: session.User.role,
      },
      role: session.User.role,
    })
  } catch (error: any) {
    console.error('Session validation error:', error)
    return NextResponse.json({})
  }
}

/**
 * DELETE /api/auth/session
 * Logs out the user by deleting the session and clearing the cookie
 */
export async function DELETE(request: NextRequest) {
  try {
    const token = request.cookies.get(SESSION_COOKIE)?.value

    if (token) {
      // Delete session from database
      await prisma.session.deleteMany({
        where: { token },
      }).catch(() => {
        // Ignore errors if session already deleted
      })
    }

    const response = NextResponse.json({ success: true })
    response.cookies.delete(SESSION_COOKIE)
    return response
  } catch (error: any) {
    console.error('Logout error:', error)
    const response = NextResponse.json({ success: true })
    response.cookies.delete(SESSION_COOKIE)
    return response
  }
}
