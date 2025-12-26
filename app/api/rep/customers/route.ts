import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getCurrentUser } from '@/app/api/lib/auth'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    // Get current user (sales rep)
    const user = await getCurrentUser(request)

    // For now, get all active customers (later: filter by sales rep)
    // TODO: Filter by salesRepId when auth is fully integrated
    const customers = await prisma.customer.findMany({
      where: {
        active: true,
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

    // Get sales rep info if user has one
    let salesRep = null
    if (user?.id) {
      const rep = await prisma.salesRep.findUnique({
        where: { userId: user.id },
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
