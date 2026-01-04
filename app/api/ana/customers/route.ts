import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    // Get all customers with order stats
    const customers = await prisma.customer.findMany({
      where: { active: true },
      include: {
        group: { select: { id: true, name: true } },
        _count: { select: { subStores: true } },
        orders: {
          select: {
            id: true,
            total: true,
            createdAt: true
          },
          orderBy: { createdAt: 'desc' }
        }
      },
      orderBy: { businessName: 'asc' }
    })

    // Format customers with stats
    const formattedCustomers = customers.map(customer => ({
      id: customer.id,
      businessName: customer.businessName,
      contactName: customer.contactName,
      email: customer.email,
      phone: customer.phone,
      address: customer.address,
      city: customer.city,
      priceTier: customer.priceTier,
      groupId: customer.groupId,
      groupName: customer.group?.name || null,
      role: customer.role,
      parentCustomerId: customer.parentCustomerId,
      subStoreCount: customer._count.subStores,
      totalOrders: customer.orders.length,
      totalRevenue: customer.orders.reduce((sum, o) => sum + Number(o.total), 0),
      lastOrderDate: customer.orders[0]?.createdAt?.toISOString() || null
    }))

    // Get customer groups with stats
    const groups = await prisma.customerGroup.findMany({
      include: {
        _count: { select: { customers: true } },
        customers: {
          include: {
            orders: { select: { total: true } }
          }
        }
      },
      orderBy: { name: 'asc' }
    })

    const formattedGroups = groups.map(group => ({
      id: group.id,
      name: group.name,
      email: group.email,
      customerCount: group._count.customers,
      totalRevenue: group.customers.reduce((sum, c) =>
        sum + c.orders.reduce((oSum, o) => oSum + Number(o.total), 0), 0
      )
    }))

    return NextResponse.json({
      customers: formattedCustomers,
      groups: formattedGroups
    })
  } catch (error) {
    console.error('Customers error:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
