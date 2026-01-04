import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import crypto from 'crypto'

export const dynamic = 'force-dynamic'

// POST /api/rep/customers - Add a new customer
export async function POST(request: NextRequest) {
  try {
    // Get sales rep ID from Bearer token
    const authHeader = request.headers.get('Authorization')
    const token = authHeader?.replace('Bearer ', '')
    let salesRepId: string | null = null

    if (token) {
      const session = await prisma.session.findUnique({
        where: { token },
        select: { userId: true }
      })
      if (session?.userId) {
        const salesRep = await prisma.salesRep.findUnique({
          where: { userId: session.userId },
          select: { id: true }
        })
        salesRepId = salesRep?.id || null
      }
    }

    const body = await request.json()
    const {
      businessName,
      contactName = '',
      email = '',
      phone = '',
      address,
      city,
      state = 'TX',
      zipCode = '',
      priceTier = 'B',
      saleDate,
      visitFrequency = '14', // Days between visits (14 = every 2 weeks)
    } = body

    // Validate required fields (only business name, address, and city)
    if (!businessName || !address || !city) {
      return NextResponse.json(
        { error: 'Business name, address, and city are required' },
        { status: 400 }
      )
    }

    // Generate a unique email if not provided (required by schema)
    const customerEmail = email
      ? email.toLowerCase()
      : `${businessName.toLowerCase().replace(/[^a-z0-9]/g, '')}-${Date.now()}@customer.azteka.local`

    // Check if email already exists (only for real emails)
    if (email) {
      const existing = await prisma.customer.findUnique({
        where: { email: customerEmail },
      })

      if (existing) {
        return NextResponse.json(
          { error: 'A customer with this email already exists' },
          { status: 409 }
        )
      }
    }

    // Calculate next scheduled visit from sale date
    const saleDateParsed = saleDate ? new Date(saleDate) : new Date()
    const frequencyDays = parseInt(visitFrequency) || 14
    const nextVisit = new Date(saleDateParsed)
    nextVisit.setDate(nextVisit.getDate() + frequencyDays)

    // Convert frequency days to string format for DB
    const frequencyLabel =
      frequencyDays === 7 ? 'weekly' :
      frequencyDays === 14 ? 'biweekly' :
      frequencyDays === 21 ? '3_weeks' :
      frequencyDays === 28 ? 'monthly' : 'biweekly'

    // Create the customer
    const customer = await prisma.customer.create({
      data: {
        id: crypto.randomUUID(),
        businessName,
        contactName: contactName || businessName,
        email: customerEmail,
        phone: phone || '',
        address,
        city,
        state: (state || 'TX').toUpperCase(),
        zipCode: zipCode || '',
        priceTier: (priceTier || 'B').toUpperCase(),
        active: true,
        visitFrequency: frequencyLabel,
        lastVisitDate: saleDateParsed,
        nextScheduledVisit: nextVisit,
        updatedAt: new Date(),
        ...(salesRepId && { salesRepId }), // Assign to the logged-in sales rep
      },
    })

    return NextResponse.json({
      success: true,
      customer: {
        id: customer.id,
        businessName: customer.businessName,
        contactName: customer.contactName,
        email: customer.email,
        phone: customer.phone,
        address: customer.address,
        city: customer.city,
        state: customer.state,
        zipCode: customer.zipCode,
        priceTier: customer.priceTier,
        lastVisitDate: customer.lastVisitDate?.toISOString() || null,
        nextScheduledVisit: customer.nextScheduledVisit?.toISOString() || null,
        visitFrequency: customer.visitFrequency,
        orderCount: 0,
        lastOrderDate: null,
        totalSpent: 0,
      },
    })
  } catch (error) {
    console.error('[Rep Customers API] POST Error:', error)
    return NextResponse.json(
      { error: 'Failed to add customer' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    // Get current user from Bearer token (repSession stored in localStorage)
    const authHeader = request.headers.get('Authorization')
    const token = authHeader?.replace('Bearer ', '')

    let userId: string | null = null
    let salesRepId: string | null = null

    if (token) {
      // Look up the session to get user ID
      const session = await prisma.session.findUnique({
        where: { token },
        select: { userId: true }
      })
      userId = session?.userId || null

      // Get the sales rep ID for this user
      if (userId) {
        const salesRep = await prisma.salesRep.findUnique({
          where: { userId },
          select: { id: true }
        })
        salesRepId = salesRep?.id || null
      }
    }

    // Filter customers by sales rep ID (if we have one)
    // If no salesRepId found but user is admin/employee, show ALL customers
    // This allows admins and employees to view all customers without needing a SalesRep record
    const user = userId ? await prisma.user.findUnique({
      where: { id: userId },
      select: { role: true }
    }) : null

    const isAdminOrEmployee = user?.role && ['admin', 'super_admin', 'employee', 'manager'].includes(user.role.toLowerCase())

    const customers = await prisma.customer.findMany({
      where: {
        active: true,
        // If user is admin/employee without salesRepId, show all customers
        // If user has salesRepId, show only their customers
        // If no session at all, show nothing
        ...(salesRepId
          ? { salesRepId }
          : isAdminOrEmployee
            ? {} // Show all customers for admins/employees
            : { salesRepId: 'none' } // Show nothing if no valid session
        ),
      },
      orderBy: [
        { lastVisitDate: 'asc' }, // Oldest visits first (needs attention)
        { businessName: 'asc' },
      ],
      select: {
        id: true,
        businessName: true,
        contactName: true,
        email: true,
        phone: true,
        address: true,
        city: true,
        state: true,
        zipCode: true,
        priceTier: true,
        lastVisitDate: true,
        nextScheduledVisit: true,
        visitFrequency: true,
        salesRepId: true,
        _count: {
          select: { orders: true }
        },
        orders: {
          orderBy: { createdAt: 'desc' },
          take: 1,
          select: {
            createdAt: true,
            total: true,
          }
        }
      }
    })

    // Get sales rep info
    let salesRep = null
    if (userId) {
      const rep = await prisma.salesRep.findUnique({
        where: { userId },
        select: {
          id: true,
          name: true,
          email: true,
          territory: true,
        }
      })
      salesRep = rep
    }

    // Transform data
    const transformed = customers.map(c => ({
      id: c.id,
      businessName: c.businessName,
      contactName: c.contactName,
      email: c.email,
      phone: c.phone,
      address: c.address,
      city: c.city,
      state: c.state,
      zipCode: c.zipCode,
      priceTier: c.priceTier,
      lastVisitDate: c.lastVisitDate?.toISOString() || null,
      nextScheduledVisit: c.nextScheduledVisit?.toISOString() || null,
      visitFrequency: c.visitFrequency,
      orderCount: c._count.orders,
      lastOrderDate: c.orders[0]?.createdAt?.toISOString() || null,
      totalSpent: c.orders[0] ? Number(c.orders[0].total) : 0,
    }))

    return NextResponse.json({
      customers: transformed,
      salesRep,
    })
  } catch (error) {
    console.error('[Rep Customers API] Error:', error)
    return NextResponse.json({ customers: [], salesRep: null, error: 'Failed to load customers' })
  }
}
