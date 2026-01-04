import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { cookies } from 'next/headers'

// POST /api/staff/pin-login - Login with PIN only (like kiosk)
export async function POST(request: NextRequest) {
  try {
    const { pin } = await request.json()

    if (!pin || pin.length !== 4) {
      return NextResponse.json({ error: 'Valid 4-digit PIN required' }, { status: 400 })
    }

    // Find employee by PIN
    const employee = await prisma.employee.findFirst({
      where: {
        pin: pin,
        active: true
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        role: true,
        photoUrl: true,
        phone: true
      }
    })

    if (!employee) {
      return NextResponse.json({ error: 'Employee not found' }, { status: 401 })
    }

    // Check if currently clocked in
    const activeTimeEntry = await prisma.timeEntry.findFirst({
      where: {
        employeeId: employee.id,
        status: 'ACTIVE',
        clockOut: null
      }
    })

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
        role: employee.role,
        photoUrl: employee.photoUrl,
        isClockedIn: !!activeTimeEntry
      }
    })
  } catch (error) {
    console.error('PIN login error:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
