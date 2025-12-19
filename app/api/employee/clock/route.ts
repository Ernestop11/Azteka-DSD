import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { cookies } from 'next/headers'

// Helper to get current user from session
async function getCurrentUser() {
  try {
    const cookieStore = await cookies()
    const sessionToken = cookieStore.get('session')?.value
    if (!sessionToken) return null

    const session = await prisma.session.findUnique({
      where: { id: sessionToken },
      include: { user: { select: { id: true, name: true, email: true, role: true } } }
    })

    if (!session || session.expiresAt < new Date()) return null
    return session.user
  } catch {
    return null
  }
}

// GET /api/employee/clock - Get current clock status
export async function GET() {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    // Find employee by email
    const employee = await prisma.employee.findFirst({
      where: { email: user.email },
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
      return NextResponse.json({
        hasEmployee: false,
        isClockedIn: false,
        message: 'No employee record linked to this account'
      })
    }

    const activeEntry = employee.timeEntries[0]

    return NextResponse.json({
      hasEmployee: true,
      employeeId: employee.id,
      employeeName: `${employee.firstName} ${employee.lastName}`,
      isClockedIn: !!activeEntry,
      clockInTime: activeEntry?.clockIn?.toISOString() || null,
      timeEntryId: activeEntry?.id || null
    })
  } catch (error) {
    console.error('Clock status error:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

// POST /api/employee/clock - Clock in (auto clock-in when accessing employee portal)
export async function POST() {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    // Find employee by email
    const employee = await prisma.employee.findFirst({
      where: { email: user.email },
      include: {
        timeEntries: {
          where: {
            status: 'ACTIVE',
            clockOut: null
          },
          take: 1
        }
      }
    })

    if (!employee) {
      return NextResponse.json({
        success: false,
        message: 'No employee record linked to this account'
      })
    }

    // Already clocked in
    if (employee.timeEntries.length > 0) {
      const activeEntry = employee.timeEntries[0]
      return NextResponse.json({
        success: true,
        alreadyClockedIn: true,
        clockInTime: activeEntry.clockIn.toISOString(),
        timeEntryId: activeEntry.id,
        message: 'Already clocked in'
      })
    }

    // Clock in
    const timeEntry = await prisma.timeEntry.create({
      data: {
        employeeId: employee.id,
        clockIn: new Date(),
        status: 'ACTIVE',
        notes: 'Auto clock-in via employee portal'
      }
    })

    // Log activity
    try {
      await prisma.employeeActivity.create({
        data: {
          userId: user.id,
          actionType: 'CLOCK_IN',
          entityType: 'timeEntry',
          entityId: timeEntry.id,
          entityName: `${employee.firstName} ${employee.lastName}`,
          description: 'Clocked in via employee portal'
        }
      })
    } catch (e) {
      console.error('Failed to log clock-in activity:', e)
    }

    return NextResponse.json({
      success: true,
      alreadyClockedIn: false,
      clockInTime: timeEntry.clockIn.toISOString(),
      timeEntryId: timeEntry.id,
      message: 'Successfully clocked in'
    })
  } catch (error) {
    console.error('Clock-in error:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

// DELETE /api/employee/clock - Clock out
export async function DELETE() {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    // Find employee by email
    const employee = await prisma.employee.findFirst({
      where: { email: user.email },
      include: {
        timeEntries: {
          where: {
            status: 'ACTIVE',
            clockOut: null
          },
          take: 1
        }
      }
    })

    if (!employee || employee.timeEntries.length === 0) {
      return NextResponse.json({
        success: false,
        message: 'Not currently clocked in'
      })
    }

    const activeEntry = employee.timeEntries[0]
    const clockOut = new Date()
    const hoursWorked = (clockOut.getTime() - activeEntry.clockIn.getTime()) / (1000 * 60 * 60)

    // Update time entry
    await prisma.timeEntry.update({
      where: { id: activeEntry.id },
      data: {
        clockOut,
        hoursWorked: Math.round(hoursWorked * 100) / 100,
        status: 'COMPLETED'
      }
    })

    // Log activity
    try {
      await prisma.employeeActivity.create({
        data: {
          userId: user.id,
          actionType: 'CLOCK_OUT',
          entityType: 'timeEntry',
          entityId: activeEntry.id,
          entityName: `${employee.firstName} ${employee.lastName}`,
          description: `Clocked out after ${hoursWorked.toFixed(2)} hours`
        }
      })
    } catch (e) {
      console.error('Failed to log clock-out activity:', e)
    }

    return NextResponse.json({
      success: true,
      clockOutTime: clockOut.toISOString(),
      hoursWorked: Math.round(hoursWorked * 100) / 100,
      message: 'Successfully clocked out'
    })
  } catch (error) {
    console.error('Clock-out error:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
