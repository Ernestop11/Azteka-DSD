import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export const dynamic = 'force-dynamic'

// GET /api/rep/link-analytics/summary - Get quick summary stats for rep dashboard
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const repId = searchParams.get('repId')

    if (!repId) {
      return NextResponse.json({ error: 'Rep ID required' }, { status: 400 })
    }

    // Get rep's customer IDs
    const repCustomers = await prisma.customer.findMany({
      where: { salesRepId: repId },
      select: { id: true }
    })

    const customerIds = repCustomers.map(c => c.id)

    if (customerIds.length === 0) {
      return NextResponse.json({
        totalLinks: 0,
        activeToday: 0,
        ordersFromLinks: 0,
        topCustomer: null
      })
    }

    // Last 24 hours
    const last24h = new Date()
    last24h.setHours(last24h.getHours() - 24)

    // Last 7 days
    const last7d = new Date()
    last7d.setDate(last7d.getDate() - 7)

    // Count all links created for this rep's customers
    const totalLinks = await prisma.customerSession.count({
      where: {
        customerId: { in: customerIds },
        linkPurpose: { not: null }
      }
    })

    // Count links opened in last 24h
    const activeToday = await prisma.customerSession.count({
      where: {
        customerId: { in: customerIds },
        linkPurpose: { not: null },
        lastActiveAt: { gte: last24h }
      }
    })

    // Count orders from links in last 7 days
    const ordersFromLinks = await prisma.customerLinkEvent.count({
      where: {
        customerId: { in: customerIds },
        eventType: 'ORDER_PLACED',
        createdAt: { gte: last7d }
      }
    })

    // Get most engaged customer
    const customerEngagement = await prisma.customerLinkEvent.groupBy({
      by: ['customerId'],
      where: {
        customerId: { in: customerIds },
        createdAt: { gte: last7d }
      },
      _count: { id: true },
      orderBy: { _count: { id: 'desc' } },
      take: 1
    })

    let topCustomer = null
    if (customerEngagement.length > 0) {
      const customer = await prisma.customer.findUnique({
        where: { id: customerEngagement[0].customerId },
        select: { id: true, businessName: true }
      })
      if (customer) {
        topCustomer = {
          ...customer,
          eventCount: customerEngagement[0]._count.id
        }
      }
    }

    return NextResponse.json({
      totalLinks,
      activeToday,
      ordersFromLinks,
      topCustomer
    })
  } catch (error) {
    console.error('[Link Analytics Summary] Error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch summary' },
      { status: 500 }
    )
  }
}
