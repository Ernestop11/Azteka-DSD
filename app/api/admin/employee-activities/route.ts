import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

// GET /api/admin/employee-activities - Fetch activity summary for admin worksheet
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const startDate = searchParams.get('startDate') || new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    const endDate = searchParams.get('endDate') || new Date().toISOString().split('T')[0]

    // Get all warehouse/driver employees
    const employees = await prisma.user.findMany({
      where: {
        role: {
          in: ['WAREHOUSE', 'DRIVER', 'ADMIN', 'SUPER_ADMIN']
        }
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true
      }
    })

    // Get activity counts per employee for the date range
    const activityCounts = await prisma.employeeActivity.groupBy({
      by: ['userId', 'actionType'],
      where: {
        createdAt: {
          gte: new Date(startDate),
          lte: new Date(endDate + 'T23:59:59.999Z')
        }
      },
      _count: {
        id: true
      }
    })

    // Get recent activities
    const recentActivities = await prisma.employeeActivity.findMany({
      where: {
        createdAt: {
          gte: new Date(startDate),
          lte: new Date(endDate + 'T23:59:59.999Z')
        }
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 200
    })

    // Build summary per employee
    const employeeSummary = employees.map(emp => {
      const empActivities = activityCounts.filter(a => a.userId === emp.id)

      const summary = {
        stockUpdates: 0,
        locationUpdates: 0,
        skuUpdates: 0,
        ordersPicked: 0,
        ordersPacked: 0,
        deliveriesCompleted: 0,
        imageUploads: 0,
        totalActions: 0
      }

      empActivities.forEach(a => {
        const count = a._count.id
        summary.totalActions += count

        switch (a.actionType) {
          case 'STOCK_UPDATE':
            summary.stockUpdates = count
            break
          case 'LOCATION_UPDATE':
            summary.locationUpdates = count
            break
          case 'SKU_UPDATE':
            summary.skuUpdates = count
            break
          case 'ORDER_PICKED':
            summary.ordersPicked = count
            break
          case 'ORDER_PACKED':
            summary.ordersPacked = count
            break
          case 'DELIVERY_COMPLETE':
            summary.deliveriesCompleted = count
            break
          case 'IMAGE_UPLOAD':
            summary.imageUploads = count
            break
        }
      })

      return {
        ...emp,
        summary,
        recentActivities: recentActivities
          .filter(a => a.userId === emp.id)
          .slice(0, 20)
      }
    })

    // Sort by total actions (most active first)
    employeeSummary.sort((a, b) => b.summary.totalActions - a.summary.totalActions)

    return NextResponse.json({
      employees: employeeSummary,
      dateRange: { startDate, endDate },
      totalActivities: recentActivities.length
    })
  } catch (error) {
    console.error('Failed to fetch employee activities:', error)
    return NextResponse.json(
      { error: 'Failed to fetch employee activities' },
      { status: 500 }
    )
  }
}
