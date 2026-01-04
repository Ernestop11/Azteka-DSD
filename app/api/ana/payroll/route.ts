import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const startStr = searchParams.get('start')
    const endStr = searchParams.get('end')

    if (!startStr || !endStr) {
      return NextResponse.json({ error: 'Start and end dates required' }, { status: 400 })
    }

    const startDate = new Date(startStr)
    const endDate = new Date(endStr)

    // Get all active employees with full pay configuration
    const employees = await prisma.employee.findMany({
      where: {
        active: true
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        hourlyRate: true,
        role: true,
        payType: true,
        salary: true,
        commissionRate: true,
        bonusEligible: true
      },
      orderBy: { firstName: 'asc' }
    })

    // Get time entries for the period (all employees)
    const timeEntries = await prisma.timeEntry.findMany({
      where: {
        clockIn: { gte: startDate, lte: endDate }
      },
      include: {
        employee: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            hourlyRate: true,
            role: true,
          }
        }
      },
      orderBy: { clockIn: 'asc' }
    })

    // Calculate payroll summaries per employee
    const summaryMap = new Map<string, {
      employeeId: string
      employee: typeof employees[0]
      totalHours: number
      regularHours: number
      overtimeHours: number
      grossPay: number
      entries: typeof timeEntries
    }>()

    // Initialize summaries for all employees
    employees.forEach(emp => {
      summaryMap.set(emp.id, {
        employeeId: emp.id,
        employee: emp,
        totalHours: 0,
        regularHours: 0,
        overtimeHours: 0,
        grossPay: 0,
        entries: []
      })
    })

    // Process time entries
    timeEntries.forEach(entry => {
      const summary = summaryMap.get(entry.employeeId)
      if (summary) {
        const hours = Number(entry.hoursWorked) || 0
        summary.totalHours += hours
        summary.entries.push(entry)
      }
    })

    // Calculate regular/overtime hours and pay
    summaryMap.forEach(summary => {
      const rate = Number(summary.employee.hourlyRate) || 0
      const totalHours = summary.totalHours

      // Overtime after 40 hours per week
      if (totalHours > 40) {
        summary.regularHours = 40
        summary.overtimeHours = totalHours - 40
        // Regular pay + 1.5x overtime
        summary.grossPay = (40 * rate) + (summary.overtimeHours * rate * 1.5)
      } else {
        summary.regularHours = totalHours
        summary.overtimeHours = 0
        summary.grossPay = totalHours * rate
      }
    })

    // Convert to array and filter out employees with no hours
    const summaries = Array.from(summaryMap.values())
      .filter(s => s.totalHours > 0)
      .sort((a, b) => a.employee.firstName.localeCompare(b.employee.firstName))

    // Get currently clocked in employees
    const now = new Date()
    const activeClockIns = await prisma.timeEntry.findMany({
      where: {
        status: 'ACTIVE',
        clockOut: null
      },
      include: {
        employee: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            role: true
          }
        }
      },
      orderBy: { clockIn: 'desc' }
    })

    // Calculate duration for active clock-ins
    const clockedIn = activeClockIns.map(entry => {
      const clockInTime = new Date(entry.clockIn)
      const hoursWorked = (now.getTime() - clockInTime.getTime()) / (1000 * 60 * 60)
      const hours = Math.floor(hoursWorked)
      const minutes = Math.floor((hoursWorked - hours) * 60)

      return {
        id: entry.id,
        employeeId: entry.employeeId,
        employee: entry.employee,
        clockIn: entry.clockIn.toISOString(),
        duration: `${hours}h ${minutes}m`,
        hoursWorked: hoursWorked.toFixed(2)
      }
    })

    // Get payroll adjustments for the period (bonuses, commissions, deductions)
    let adjustments: any[] = []
    try {
      adjustments = await prisma.payrollAdjustment.findMany({
        where: {
          periodStart: { gte: startDate },
          periodEnd: { lte: endDate }
        },
        include: {
          employee: {
            select: {
              id: true,
              firstName: true,
              lastName: true
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      })
    } catch (e) {
      // Table might not exist yet if schema hasn't been pushed
      console.log('PayrollAdjustment table not available yet')
    }

    // Attach adjustments to each summary
    const summariesWithAdjustments = summaries.map(summary => ({
      ...summary,
      adjustments: adjustments.filter(a => a.employeeId === summary.employeeId)
    }))

    return NextResponse.json({
      employees,
      timeEntries,
      summaries: summariesWithAdjustments,
      clockedIn,
      adjustments
    })
  } catch (error) {
    console.error('Payroll error:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
