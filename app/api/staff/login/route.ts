import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { cookies } from 'next/headers'

export async function POST(request: NextRequest) {
  try {
    const { email, pin } = await request.json()

    if (!email || !pin) {
      return NextResponse.json({ error: 'Email and PIN required' }, { status: 400 })
    }

    // Normalize email
    const normalizedEmail = email.toLowerCase().trim()

    // Find employee by email and PIN
    const employee = await prisma.employee.findFirst({
      where: {
        email: normalizedEmail,
        pin: pin,
        active: true
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        role: true,
        needsPinReset: true,
        phone: true
      }
    })

    if (!employee) {
      return NextResponse.json({ error: 'Invalid email or PIN' }, { status: 401 })
    }

    // Check if PIN reset is needed
    if (employee.needsPinReset) {
      // Create a temporary session for PIN reset
      const resetToken = Buffer.from(JSON.stringify({
        employeeId: employee.id,
        type: 'pin_reset',
        exp: Date.now() + 10 * 60 * 1000 // 10 minutes
      })).toString('base64')

      const cookieStore = await cookies()
      cookieStore.set('pin_reset_token', resetToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 600 // 10 minutes
      })

      return NextResponse.json({
        needsPinReset: true,
        message: 'PIN reset required'
      })
    }

    // Create session token (24 hour expiry)
    const sessionToken = Buffer.from(JSON.stringify({
      employeeId: employee.id,
      role: employee.role,
      exp: Date.now() + 24 * 60 * 60 * 1000
    })).toString('base64')

    // Set session cookie
    const cookieStore = await cookies()
    cookieStore.set('employee_session', sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 86400 // 24 hours
    })

    return NextResponse.json({
      success: true,
      employee: {
        id: employee.id,
        firstName: employee.firstName,
        lastName: employee.lastName,
        email: employee.email,
        role: employee.role
      }
    })
  } catch (error) {
    console.error('Staff login error:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
