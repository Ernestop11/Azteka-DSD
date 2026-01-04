import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    // Get start of week (Monday)
    const startOfWeek = new Date(today)
    const day = startOfWeek.getDay()
    const diff = day === 0 ? 6 : day - 1
    startOfWeek.setDate(startOfWeek.getDate() - diff)

    const now = new Date()

    // Count currently clocked in employees
    const clockedInToday = await prisma.timeEntry.count({
      where: {
        status: 'ACTIVE',
        clockOut: null,
      }
    })

    // Get currently clocked in employees with details
    const activeTimeEntries = await prisma.timeEntry.findMany({
      where: {
        status: 'ACTIVE',
        clockOut: null,
      },
      include: {
        employee: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            role: true,
            photoUrl: true
          }
        }
      },
      orderBy: { clockIn: 'desc' }
    })

    // Calculate hours worked for each active employee
    const clockedIn = activeTimeEntries.map(entry => {
      const clockInTime = new Date(entry.clockIn)
      const hoursWorked = (now.getTime() - clockInTime.getTime()) / (1000 * 60 * 60)
      const hours = Math.floor(hoursWorked)
      const minutes = Math.floor((hoursWorked - hours) * 60)

      return {
        id: entry.employee.id,
        firstName: entry.employee.firstName,
        lastName: entry.employee.lastName,
        role: entry.employee.role,
        photoUrl: entry.employee.photoUrl,
        clockIn: entry.clockIn.toISOString(),
        hoursWorked: hoursWorked.toFixed(2),
        duration: `${hours}h ${minutes}m`
      }
    })

    // Get total hours this week
    const weekEntries = await prisma.timeEntry.findMany({
      where: {
        clockIn: { gte: startOfWeek },
        status: 'COMPLETED',
      },
      select: { hoursWorked: true }
    })

    const totalHoursThisWeek = weekEntries.reduce((sum, e) => sum + (Number(e.hoursWorked) || 0), 0)

    // Get POs that need attention (PENDING, CONFIRMED, IN_TRANSIT, RECEIVING)
    const activePOStatuses = ['PENDING', 'CONFIRMED', 'IN_TRANSIT', 'RECEIVING']
    const pendingPOs = await prisma.purchaseOrder.count({
      where: { status: { in: activePOStatuses } }
    })

    // Get recent POs with details
    const recentPOs = await prisma.purchaseOrder.findMany({
      where: { status: { in: [...activePOStatuses, 'RECEIVED', 'STOCKED'] } },
      include: {
        vendor: { select: { name: true } },
        _count: { select: { items: true } }
      },
      orderBy: { createdAt: 'desc' },
      take: 5
    })

    // Get orders today
    const ordersToday = await prisma.order.count({
      where: {
        createdAt: { gte: today, lt: tomorrow }
      }
    })

    // Get deliveries today (orders with status 'delivering' or 'delivered' today)
    const deliveriesToday = await prisma.order.count({
      where: {
        status: { in: ['delivering', 'delivered'] },
        updatedAt: { gte: today, lt: tomorrow }
      }
    })

    // Recent activity - get time entries from this week as activities
    const recentTimeEntries = await prisma.timeEntry.findMany({
      where: {
        clockIn: { gte: startOfWeek }
      },
      include: {
        employee: { select: { firstName: true, lastName: true } }
      },
      orderBy: { clockIn: 'desc' },
      take: 10
    })

    // Convert time entries to activities
    const activities = recentTimeEntries.map(entry => ({
      id: entry.id,
      type: entry.clockOut ? 'CLOCK_OUT' : 'CLOCK_IN',
      description: entry.clockOut
        ? `${entry.employee.firstName} ${entry.employee.lastName} fichó salida`
        : `${entry.employee.firstName} ${entry.employee.lastName} fichó entrada`,
      time: (entry.clockOut || entry.clockIn).toISOString(),
      employee: entry.employee.firstName
    }))

    // Format recent POs for the dashboard
    const formattedPOs = recentPOs.map(po => ({
      id: po.id,
      poNumber: po.poNumber,
      vendor: po.vendor?.name || 'Sin proveedor',
      status: po.status,
      total: Number(po.total),
      itemCount: po._count.items,
      createdAt: po.createdAt.toISOString(),
      expectedDate: po.expectedDate?.toISOString() || null
    }))

    return NextResponse.json({
      stats: {
        clockedInToday,
        totalHoursThisWeek,
        pendingPOs,
        pendingDeposits: 0, // TODO: Add deposits table
        ordersToday,
        deliveriesToday
      },
      clockedIn,
      activities,
      recentPOs: formattedPOs
    })
  } catch (error) {
    console.error('Ana dashboard error:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
