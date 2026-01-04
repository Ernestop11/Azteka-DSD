import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const sessionToken = cookieStore.get('employee_session')?.value

    if (!sessionToken) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    // Decode session token (simple base64 for now)
    try {
      const decoded = JSON.parse(Buffer.from(sessionToken, 'base64').toString())
      const { employeeId, exp } = decoded

      // Check expiration
      if (Date.now() > exp) {
        return NextResponse.json({ error: 'Session expired' }, { status: 401 })
      }

      const employee = await prisma.employee.findUnique({
        where: { id: employeeId, active: true },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          role: true,
          photoUrl: true,
          timeEntries: {
            where: {
              status: 'ACTIVE',
              clockOut: null
            },
            orderBy: { clockIn: 'desc' },
            take: 1,
            select: { clockIn: true }
          }
        }
      })

      if (!employee) {
        return NextResponse.json({ error: 'Employee not found' }, { status: 404 })
      }

      const activeEntry = employee.timeEntries[0]

      return NextResponse.json({
        employee: {
          id: employee.id,
          firstName: employee.firstName,
          lastName: employee.lastName,
          email: employee.email,
          role: employee.role,
          photoUrl: employee.photoUrl,
          isClockedIn: !!activeEntry,
          clockInTime: activeEntry?.clockIn?.toISOString()
        }
      })
    } catch {
      return NextResponse.json({ error: 'Invalid session' }, { status: 401 })
    }
  } catch (error) {
    console.error('Employee me error:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
