import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export const dynamic = 'force-dynamic'

const DAYS_OF_WEEK = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']

// GET /api/rep/route-customers - Get customers scheduled for a specific day
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const day = searchParams.get('day') || 'today'

    const today = new Date()
    let targetDate = today
    let targetDayOfWeek = DAYS_OF_WEEK[today.getDay()]

    // Parse the day parameter
    if (day !== 'today') {
      const dayIndex = DAYS_OF_WEEK.indexOf(day.toLowerCase())
      if (dayIndex !== -1) {
        targetDayOfWeek = day.toLowerCase()
        // Calculate the date for this day of week
        const currentDayIndex = today.getDay()
        let daysUntil = dayIndex - currentDayIndex
        if (daysUntil < 0) daysUntil += 7
        targetDate = new Date(today)
        targetDate.setDate(today.getDate() + daysUntil)
      }
    }

    // Get all customers
    const allCustomers = await prisma.customer.findMany({
      select: {
        id: true,
        businessName: true,
        contactName: true,
        phone: true,
        address: true,
        city: true,
        state: true,
        zipCode: true,
        latitude: true,
        longitude: true,
        priceTier: true,
        lastVisitDate: true,
        nextScheduledVisit: true,
        visitFrequency: true,
        preferredDays: true,
      },
      orderBy: [
        { lastVisitDate: 'asc' },
        { businessName: 'asc' }
      ]
    })

    // Filter customers for the target day
    const scheduledCustomers: typeof allCustomers = []
    const availableCustomers: typeof allCustomers = []

    for (const customer of allCustomers) {
      const isScheduledForDay = checkIfScheduledForDay(customer, targetDate, targetDayOfWeek)

      if (isScheduledForDay) {
        scheduledCustomers.push(customer)
      } else {
        availableCustomers.push(customer)
      }
    }

    // Sort scheduled customers by priority (overdue first)
    scheduledCustomers.sort((a, b) => {
      const aPriority = getVisitPriority(a)
      const bPriority = getVisitPriority(b)
      return bPriority - aPriority
    })

    return NextResponse.json({
      scheduled: scheduledCustomers,
      available: availableCustomers,
      targetDate: targetDate.toISOString(),
      dayOfWeek: targetDayOfWeek
    })
  } catch (error) {
    console.error('[Route Customers API] Error:', error)
    return NextResponse.json({
      error: 'Failed to load route customers'
    }, { status: 500 })
  }
}

function checkIfScheduledForDay(
  customer: {
    nextScheduledVisit: Date | null
    preferredDays: string[]
    lastVisitDate: Date | null
    visitFrequency: string | null
  },
  targetDate: Date,
  targetDayOfWeek: string
): boolean {
  // Check 1: nextScheduledVisit is on target date
  if (customer.nextScheduledVisit) {
    const scheduledDate = new Date(customer.nextScheduledVisit)
    if (scheduledDate.toDateString() === targetDate.toDateString()) {
      return true
    }
  }

  // Check 2: preferredDays includes target day
  if (customer.preferredDays && customer.preferredDays.length > 0) {
    if (customer.preferredDays.some(d => d.toLowerCase() === targetDayOfWeek)) {
      // Also check if they're due for a visit
      if (isOverdueForVisit(customer)) {
        return true
      }
    }
  }

  // Check 3: Overdue for visit (based on frequency) - show on today only
  if (targetDate.toDateString() === new Date().toDateString()) {
    if (isOverdueForVisit(customer)) {
      return true
    }
  }

  return false
}

function isOverdueForVisit(customer: {
  lastVisitDate: Date | null
  visitFrequency: string | null
}): boolean {
  if (!customer.lastVisitDate) return true // Never visited

  const lastVisit = new Date(customer.lastVisitDate)
  const daysSinceVisit = Math.floor(
    (Date.now() - lastVisit.getTime()) / (1000 * 60 * 60 * 24)
  )

  const frequencyDays = parseInt(customer.visitFrequency || '14')
  return daysSinceVisit >= frequencyDays
}

function getVisitPriority(customer: {
  lastVisitDate: Date | null
  visitFrequency: string | null
}): number {
  if (!customer.lastVisitDate) return 100 // Never visited = highest priority

  const lastVisit = new Date(customer.lastVisitDate)
  const daysSinceVisit = Math.floor(
    (Date.now() - lastVisit.getTime()) / (1000 * 60 * 60 * 24)
  )

  const frequencyDays = parseInt(customer.visitFrequency || '14')
  const daysOverdue = daysSinceVisit - frequencyDays

  if (daysOverdue > 0) return 50 + daysOverdue // Overdue
  if (daysOverdue >= -2) return 25 // Due soon
  return 0 // Not due
}

// POST /api/rep/route-customers - Save a custom route order
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { day, customerIds } = body

    // For now, just return success - route order is stored in localStorage
    // In the future, we could save this to a SavedRoute table

    return NextResponse.json({
      success: true,
      message: 'Route order saved',
      day,
      stops: customerIds.length
    })
  } catch (error) {
    console.error('[Route Customers API] Save Error:', error)
    return NextResponse.json({
      error: 'Failed to save route order'
    }, { status: 500 })
  }
}
