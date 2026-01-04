import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export const dynamic = 'force-dynamic'

// GET /api/rep/link-analytics - Get analytics for a rep's customers
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const repId = searchParams.get('repId')
    const customerId = searchParams.get('customerId')
    const days = parseInt(searchParams.get('days') || '30')

    if (!repId) {
      return NextResponse.json({ error: 'Rep ID required' }, { status: 400 })
    }

    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)

    // Build where clause
    const whereClause: any = {
      createdAt: { gte: startDate }
    }

    // If specific customer, filter by that
    if (customerId) {
      whereClause.customerId = customerId
    } else {
      // Otherwise, filter by rep's customers
      const repCustomers = await prisma.customer.findMany({
        where: { salesRepId: repId },
        select: { id: true }
      })
      whereClause.customerId = { in: repCustomers.map(c => c.id) }
    }

    // Get events grouped by type
    const eventsByType = await prisma.customerLinkEvent.groupBy({
      by: ['eventType'],
      where: whereClause,
      _count: { id: true }
    })

    // Get events by day for chart
    const eventsByDay = await prisma.$queryRaw`
      SELECT
        DATE(created_at) as date,
        event_type,
        COUNT(*) as count
      FROM customer_link_events
      WHERE created_at >= ${startDate}
        AND customer_id IN (
          SELECT id FROM customers WHERE sales_rep_id = ${repId}
        )
      GROUP BY DATE(created_at), event_type
      ORDER BY date DESC
      LIMIT 100
    ` as { date: Date; event_type: string; count: bigint }[]

    // Get unique sessions (link opens)
    const uniqueSessions = await prisma.customerSession.count({
      where: {
        createdAt: { gte: startDate },
        customer: { salesRepId: repId },
        linkPurpose: { not: null }
      }
    })

    // Get conversion metrics
    const conversions = await prisma.customerLinkEvent.groupBy({
      by: ['customerId'],
      where: {
        ...whereClause,
        eventType: 'ORDER_PLACED'
      },
      _count: { id: true }
    })

    // Get top products viewed
    const productViews = await prisma.customerLinkEvent.findMany({
      where: {
        ...whereClause,
        eventType: 'PRODUCT_VIEWED'
      },
      select: { eventData: true }
    })

    // Aggregate product view counts
    const productViewCounts: Record<string, { name: string; count: number }> = {}
    productViews.forEach(event => {
      const data = event.eventData as { productId?: string; productName?: string } | null
      if (data?.productId) {
        if (!productViewCounts[data.productId]) {
          productViewCounts[data.productId] = { name: data.productName || 'Unknown', count: 0 }
        }
        productViewCounts[data.productId].count++
      }
    })

    const topProducts = Object.entries(productViewCounts)
      .map(([id, { name, count }]) => ({ id, name, views: count }))
      .sort((a, b) => b.views - a.views)
      .slice(0, 10)

    // Get search queries
    const searches = await prisma.customerLinkEvent.findMany({
      where: {
        ...whereClause,
        eventType: 'SEARCH_PERFORMED'
      },
      select: { eventData: true }
    })

    const searchTerms: Record<string, number> = {}
    searches.forEach(event => {
      const data = event.eventData as { query?: string } | null
      if (data?.query) {
        const query = data.query.toLowerCase()
        searchTerms[query] = (searchTerms[query] || 0) + 1
      }
    })

    const topSearches = Object.entries(searchTerms)
      .map(([term, count]) => ({ term, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10)

    return NextResponse.json({
      period: { days, startDate, endDate: new Date() },
      summary: {
        totalEvents: eventsByType.reduce((sum, e) => sum + e._count.id, 0),
        uniqueSessions,
        conversions: conversions.length,
        conversionRate: uniqueSessions > 0
          ? ((conversions.length / uniqueSessions) * 100).toFixed(1) + '%'
          : '0%'
      },
      eventsByType: eventsByType.map(e => ({
        type: e.eventType,
        count: e._count.id
      })),
      eventsByDay: eventsByDay.map(e => ({
        date: e.date,
        type: e.event_type,
        count: Number(e.count)
      })),
      topProducts,
      topSearches
    })
  } catch (error) {
    console.error('[Link Analytics] Error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch analytics' },
      { status: 500 }
    )
  }
}
