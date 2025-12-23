import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

/**
 * GET /api/admin/payroll
 * Get employee time entries and calculate payroll for a date range
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')

    // Default to this week if no dates provided
    const start = startDate ? new Date(startDate) : (() => {
      const d = new Date()
      d.setDate(d.getDate() - d.getDay()) // Start of week (Sunday)
      d.setHours(0, 0, 0, 0)
      return d
    })()

    const end = endDate ? new Date(endDate) : new Date()

    // Get all active employees with their time entries
    const employees = await prisma.employee.findMany({
      where: { active: true },
      include: {
        timeEntries: {
          where: {
            clockIn: {
              gte: start,
              lte: end
            }
          },
          orderBy: { clockIn: 'desc' }
        }
      },
      orderBy: [
        { lastName: 'asc' },
        { firstName: 'asc' }
      ]
    })

    // Calculate summary for each employee
    const summaries = employees.map(emp => {
      const entries = emp.timeEntries.map(entry => {
        let hoursWorked: number | null = null

        if (entry.clockOut) {
          const clockIn = new Date(entry.clockIn)
          const clockOut = new Date(entry.clockOut)
          hoursWorked = (clockOut.getTime() - clockIn.getTime()) / (1000 * 60 * 60)
        }

        return {
          id: entry.id,
          employeeId: emp.id,
          clockIn: entry.clockIn.toISOString(),
          clockOut: entry.clockOut?.toISOString() || null,
          hoursWorked
        }
      })

      // Sum total hours
      const totalHours = entries.reduce((sum, e) => sum + (e.hoursWorked || 0), 0)

      // Calculate estimated pay
      const hourlyRate = Number(emp.hourlyRate) || 15 // Default $15/hr
      const estimatedPay = totalHours * hourlyRate

      // Check if currently clocked in
      const isClockedIn = entries.some(e => e.clockOut === null)

      return {
        employee: {
          id: emp.id,
          firstName: emp.firstName,
          lastName: emp.lastName,
          role: emp.role,
          hourlyRate,
          active: emp.active
        },
        entries,
        totalHours: Math.round(totalHours * 100) / 100, // Round to 2 decimals
        estimatedPay: Math.round(estimatedPay * 100) / 100,
        isClockedIn
      }
    })

    // Filter out employees with no entries (optional - remove to show all)
    const filteredSummaries = summaries.filter(s => s.entries.length > 0 || s.isClockedIn)

    return NextResponse.json({
      data: filteredSummaries,
      period: {
        start: start.toISOString(),
        end: end.toISOString()
      }
    })
  } catch (error: any) {
    console.error('[GET /api/admin/payroll] Error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch payroll data', details: error.message },
      { status: 500 }
    )
  }
}
