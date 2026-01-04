import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

// GET - Fetch messages for a customer
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const customerId = searchParams.get('customerId')

    if (!customerId) {
      return NextResponse.json({ error: 'Customer ID required' }, { status: 400 })
    }

    // Get all messages where customer is sender or recipient
    const messages = await prisma.customerMessage.findMany({
      where: {
        OR: [
          { senderId: customerId },
          { recipientId: customerId }
        ]
      },
      orderBy: { createdAt: 'asc' },
      include: {
        sender: {
          select: { id: true, businessName: true }
        }
      }
    })

    // Mark unread messages to this customer as read
    await prisma.customerMessage.updateMany({
      where: {
        recipientId: customerId,
        readAt: null
      },
      data: {
        readAt: new Date()
      }
    })

    return NextResponse.json({
      messages: messages.map(m => ({
        id: m.id,
        message: m.message,
        isFromCustomer: m.senderId === customerId,
        senderName: m.sender?.businessName || 'Azteka Support',
        repId: m.repId,
        readAt: m.readAt,
        createdAt: m.createdAt
      }))
    })
  } catch (error) {
    console.error('Error fetching messages:', error)
    return NextResponse.json({ error: 'Failed to fetch messages' }, { status: 500 })
  }
}

// POST - Send a message from customer
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { customerId, message } = body

    if (!customerId || !message?.trim()) {
      return NextResponse.json({ error: 'Customer ID and message required' }, { status: 400 })
    }

    // Get customer to find their sales rep
    const customer = await prisma.customer.findUnique({
      where: { id: customerId },
      select: { salesRepId: true, businessName: true }
    })

    if (!customer) {
      return NextResponse.json({ error: 'Customer not found' }, { status: 404 })
    }

    // Create the message
    const newMessage = await prisma.customerMessage.create({
      data: {
        senderId: customerId,
        recipientId: null, // Going to rep/admin
        repId: customer.salesRepId,
        message: message.trim()
      }
    })

    return NextResponse.json({
      success: true,
      message: {
        id: newMessage.id,
        message: newMessage.message,
        isFromCustomer: true,
        senderName: customer.businessName,
        createdAt: newMessage.createdAt
      }
    })
  } catch (error) {
    console.error('Error sending message:', error)
    return NextResponse.json({ error: 'Failed to send message' }, { status: 500 })
  }
}
