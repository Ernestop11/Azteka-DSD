import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const pin = searchParams.get('pin')

    if (!pin || pin.length !== 4) {
      return NextResponse.json({ error: 'Invalid PIN' }, { status: 400 })
    }

    // Find employee by PIN
    const employee = await prisma.employee.findFirst({
      where: {
        pin: pin,
        active: true
      },
      include: {
        timeEntries: {
          where: {
            status: 'ACTIVE',
            clockOut: null
          },
          orderBy: { clockIn: 'desc' },
          take: 1
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
        photoUrl: employee.photoUrl,
        role: employee.role,
        isClockedIn: !!activeEntry,
        lastClockIn: activeEntry?.clockIn?.toISOString()
      }
    })
  } catch (error) {
    console.error('Kiosk lookup error:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
