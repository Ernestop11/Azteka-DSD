import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET single customer with orders and order tracking
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const customer = await prisma.customer.findUnique({
      where: { id: params.id },
      include: {
        group: { select: { id: true, name: true, email: true } },
        subStores: {
          select: {
            id: true,
            businessName: true,
            address: true,
            phone: true
          }
        },
        orders: {
          include: {
            OrderItem: {
              include: {
                Product: { select: { id: true, name: true, imageUrl: true } }
              }
            },
            tasks: {
              include: {
                assignee: { select: { id: true, firstName: true, lastName: true } }
              },
              orderBy: { createdAt: 'asc' }
            },
            deliveryConfirmation: true
          },
          orderBy: { createdAt: 'desc' },
          take: 50
        }
      }
    })

    if (!customer) {
      return NextResponse.json({ error: 'Customer not found' }, { status: 404 })
    }

    // Format the customer data
    const formattedCustomer = {
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
      taxId: customer.taxId,
      group: customer.group ? {
        id: customer.group.id,
        name: customer.group.name,
        email: customer.group.email
      } : null,
      subStores: customer.subStores,
      role: customer.role
    }

    // Format orders with tracking info
    const formattedOrders = customer.orders.map(order => {
      // Determine order stage based on status and tasks
      const pickingTask = order.tasks.find(t => t.type === 'PICKING')
      const packingTask = order.tasks.find(t => t.type === 'PACKING')
      const hasDelivery = !!order.deliveryConfirmation

      let stage = 'pending'
      let stageLabel = 'Pendiente'

      if (order.status === 'delivered' || hasDelivery) {
        stage = 'delivered'
        stageLabel = 'Entregado'
      } else if (order.status === 'in_transit') {
        stage = 'in_transit'
        stageLabel = 'En Camino'
      } else if (packingTask?.status === 'COMPLETED') {
        stage = 'ready'
        stageLabel = 'Listo para Envío'
      } else if (packingTask?.status === 'IN_PROGRESS') {
        stage = 'packing'
        stageLabel = 'Empacando'
      } else if (pickingTask?.status === 'COMPLETED') {
        stage = 'picked'
        stageLabel = 'Recolectado'
      } else if (pickingTask?.status === 'IN_PROGRESS') {
        stage = 'picking'
        stageLabel = 'Recolectando'
      } else if (order.status === 'confirmed') {
        stage = 'confirmed'
        stageLabel = 'Confirmado'
      }

      return {
        id: order.id,
        status: order.status,
        stage,
        stageLabel,
        total: Number(order.total),
        itemCount: order.OrderItem.length,
        items: order.OrderItem.map(item => ({
          id: item.id,
          quantity: item.quantity,
          price: Number(item.price),
          productName: item.Product.name,
          productImage: item.Product.imageUrl
        })),
        notes: order.notes,
        createdAt: order.createdAt.toISOString(),
        tasks: order.tasks.map(task => ({
          id: task.id,
          type: task.type,
          title: task.title,
          status: task.status,
          assignee: task.assignee ? `${task.assignee.firstName} ${task.assignee.lastName}` : null,
          createdAt: task.createdAt.toISOString(),
          completedAt: task.completedAt?.toISOString() || null
        })),
        delivery: order.deliveryConfirmation ? {
          signedBy: order.deliveryConfirmation.signedBy,
          deliveredAt: order.deliveryConfirmation.deliveredAt?.toISOString(),
          notes: order.deliveryConfirmation.notes
        } : null
      }
    })

    // Calculate stats
    const stats = {
      totalOrders: customer.orders.length,
      totalRevenue: customer.orders.reduce((sum, o) => sum + Number(o.total), 0),
      pendingOrders: formattedOrders.filter(o => !['delivered', 'cancelled'].includes(o.stage)).length,
      avgOrderValue: customer.orders.length > 0
        ? customer.orders.reduce((sum, o) => sum + Number(o.total), 0) / customer.orders.length
        : 0
    }

    return NextResponse.json({
      customer: formattedCustomer,
      orders: formattedOrders,
      stats
    })
  } catch (error) {
    console.error('Customer detail error:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
