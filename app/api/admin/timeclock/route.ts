import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET time entries with optional filters
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const employeeId = searchParams.get('employeeId')
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')
    const weekOf = searchParams.get('weekOf') // Get week starting from this date

    // Build where clause
    const where: Record<string, unknown> = {}

    if (employeeId) {
      where.employeeId = employeeId
    }

    // Date range filter
    if (startDate || endDate || weekOf) {
      where.clockIn = {}

      if (weekOf) {
        // Calculate week start (Sunday) and end (Saturday)
        const weekStart = new Date(weekOf)
        weekStart.setHours(0, 0, 0, 0)
        // Set to Sunday
        weekStart.setDate(weekStart.getDate() - weekStart.getDay())

        const weekEnd = new Date(weekStart)
        weekEnd.setDate(weekEnd.getDate() + 7)

        where.clockIn = {
          gte: weekStart,
          lt: weekEnd
        }
      } else {
        if (startDate) {
          (where.clockIn as Record<string, Date>).gte = new Date(startDate)
        }
        if (endDate) {
          const end = new Date(endDate)
          end.setHours(23, 59, 59, 999)
          ;(where.clockIn as Record<string, Date>).lte = end
        }
      }
    }

    const timeEntries = await prisma.timeEntry.findMany({
      where,
      include: {
        employee: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            hourlyRate: true,
            role: true
          }
        }
      },
      orderBy: { clockIn: 'desc' }
    })

    // Calculate summary stats
    const employeeStats: Record<string, {
      employeeId: string
      firstName: string
      lastName: string
      hourlyRate: number
      totalHours: number
      totalPay: number
      entries: number
    }> = {}

    for (const entry of timeEntries) {
      const empId = entry.employeeId
      if (!employeeStats[empId]) {
        employeeStats[empId] = {
          employeeId: empId,
          firstName: entry.employee.firstName,
          lastName: entry.employee.lastName,
          hourlyRate: parseFloat(entry.employee.hourlyRate.toString()),
          totalHours: 0,
          totalPay: 0,
          entries: 0
        }
      }

      const hours = entry.hoursWorked ? parseFloat(entry.hoursWorked.toString()) : 0
      employeeStats[empId].totalHours += hours
      employeeStats[empId].totalPay += hours * employeeStats[empId].hourlyRate
      employeeStats[empId].entries++
    }

    return NextResponse.json({
      entries: timeEntries.map(e => ({
        ...e,
        hoursWorked: e.hoursWorked?.toString(),
        employee: {
          ...e.employee,
          hourlyRate: e.employee.hourlyRate.toString()
        }
      })),
      summary: Object.values(employeeStats).map(s => ({
        ...s,
        totalHours: parseFloat(s.totalHours.toFixed(2)),
        totalPay: parseFloat(s.totalPay.toFixed(2))
      }))
    })
  } catch (error) {
    console.error('Get time entries error:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

// PUT to adjust a time entry
export async function PUT(request: NextRequest) {
  try {
    const data = await request.json()
    const { id, clockIn, clockOut, notes } = data

    if (!id) {
      return NextResponse.json({ error: 'Entry ID required' }, { status: 400 })
    }

    const updateData: Record<string, unknown> = {
      status: 'ADJUSTED'
    }

    if (clockIn) updateData.clockIn = new Date(clockIn)
    if (clockOut) updateData.clockOut = new Date(clockOut)
    if (notes !== undefined) updateData.notes = notes

    // Recalculate hours if both times provided
    if (clockIn && clockOut) {
      const hours = (new Date(clockOut).getTime() - new Date(clockIn).getTime()) / (1000 * 60 * 60)
      updateData.hoursWorked = hours
    }

    const entry = await prisma.timeEntry.update({
      where: { id },
      data: updateData,
      include: {
        employee: {
          select: {
            firstName: true,
            lastName: true
          }
        }
      }
    })

    return NextResponse.json({
      entry: {
        ...entry,
        hoursWorked: entry.hoursWorked?.toString()
      }
    })
  } catch (error) {
    console.error('Update time entry error:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

// DELETE a time entry
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'Entry ID required' }, { status: 400 })
    }

    await prisma.timeEntry.delete({
      where: { id }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete time entry error:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
