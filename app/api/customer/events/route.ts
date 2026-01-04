import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export const dynamic = 'force-dynamic'

interface EventPayload {
  eventType: string
  eventData?: Record<string, unknown>
  timestamp?: string
}

// POST /api/customer/events - Batch event ingestion
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { sessionId, events } = body as { sessionId: string; events: EventPayload[] }

    if (!sessionId || !events || !Array.isArray(events)) {
      return NextResponse.json(
        { error: 'sessionId and events array required' },
        { status: 400 }
      )
    }

    // Validate session exists
    const session = await prisma.customerSession.findUnique({
      where: { id: sessionId },
      select: { id: true, customerId: true, linkPurpose: true }
    })

    if (!session) {
      return NextResponse.json(
        { error: 'Invalid session' },
        { status: 401 }
      )
    }

    // Get device info from headers
    const userAgent = request.headers.get('user-agent') || undefined
    const isMobile = request.headers.get('sec-ch-ua-mobile') === '?1'
    const deviceType = isMobile ? 'mobile' : 'desktop'

    // Valid event types
    const validEventTypes = [
      'LINK_OPENED', 'SESSION_STARTED', 'SESSION_ENDED',
      'SCROLL_DEPTH', 'TIME_ON_PAGE',
      'CATEGORY_VIEWED', 'BRAND_VIEWED', 'SEARCH_PERFORMED', 'PRODUCT_VIEWED',
      'PRODUCT_ADDED', 'PRODUCT_REMOVED', 'QUANTITY_CHANGED', 'CART_OPENED',
      'CHECKOUT_STARTED', 'ORDER_PLACED',
      'PWA_PROMPT_SHOWN', 'PWA_INSTALLED', 'PIN_CREATED', 'ONBOARDING_COMPLETED'
    ]

    // Filter and prepare events
    const validEvents = events
      .filter(e => validEventTypes.includes(e.eventType))
      .map(e => ({
        sessionId: session.id,
        customerId: session.customerId,
        eventType: e.eventType as any,
        eventData: e.eventData || null,
        deviceType,
        userAgent,
        createdAt: e.timestamp ? new Date(e.timestamp) : new Date(),
      }))

    if (validEvents.length === 0) {
      return NextResponse.json({ success: true, eventsProcessed: 0 })
    }

    // Batch insert events
    await prisma.customerLinkEvent.createMany({
      data: validEvents
    })

    return NextResponse.json({
      success: true,
      eventsProcessed: validEvents.length
    })
  } catch (error) {
    console.error('[Customer Events] Error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to process events' },
      { status: 500 }
    )
  }
}
