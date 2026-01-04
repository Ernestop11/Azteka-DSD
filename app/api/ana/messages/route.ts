import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { cookies } from 'next/headers'

// GET messages - either all conversations or specific customer thread
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const customerId = searchParams.get('customerId')

    if (customerId) {
      // Get conversation with specific customer
      const messages = await prisma.customerMessage.findMany({
        where: {
          OR: [
            { recipientId: customerId },
            { senderId: customerId }
          ]
        },
        orderBy: { createdAt: 'asc' },
        take: 100
      })

      // Get customer info
      const customer = await prisma.customer.findUnique({
        where: { id: customerId },
        select: { id: true, businessName: true, contactName: true, phone: true }
      })

      // Mark unread messages as read
      await prisma.customerMessage.updateMany({
        where: {
          senderId: customerId,
          readAt: null
        },
        data: { readAt: new Date() }
      })

      return NextResponse.json({
        customer,
        messages: messages.map(m => ({
          id: m.id,
          message: m.message,
          isFromCustomer: m.senderId === customerId,
          isRead: !!m.readAt,
          createdAt: m.createdAt.toISOString()
        }))
      })
    }

    // Get all conversations (grouped by customer)
    const messages = await prisma.customerMessage.findMany({
      include: {
        sender: { select: { id: true, businessName: true, contactName: true } },
        recipient: { select: { id: true, businessName: true, contactName: true } }
      },
      orderBy: { createdAt: 'desc' }
    })

    // Group by customer and get latest message per customer
    const conversationMap = new Map<string, any>()

    for (const msg of messages) {
      const customerId = msg.senderId || msg.recipientId
      if (!customerId) continue

      const customer = msg.sender || msg.recipient
      if (!customer) continue

      if (!conversationMap.has(customerId)) {
        conversationMap.set(customerId, {
          customerId,
          customerName: customer.businessName,
          contactName: customer.contactName,
          lastMessage: msg.message,
          lastMessageAt: msg.createdAt.toISOString(),
          isFromCustomer: !!msg.senderId,
          unreadCount: 0
        })
      }

      // Count unread messages from this customer
      if (msg.senderId === customerId && !msg.readAt) {
        const conv = conversationMap.get(customerId)
        conv.unreadCount++
      }
    }

    const conversations = Array.from(conversationMap.values())
      .sort((a, b) => new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime())

    // Get total unread count
    const unreadTotal = await prisma.customerMessage.count({
      where: {
        senderId: { not: null }, // From customer
        readAt: null
      }
    })

    return NextResponse.json({
      conversations,
      unreadTotal
    })
  } catch (error) {
    console.error('Messages error:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

// POST - Send a message to a customer
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { customerId, message } = body

    if (!customerId || !message) {
      return NextResponse.json({ error: 'Customer ID and message required' }, { status: 400 })
    }

    // Get employee session to know who's sending
    const cookieStore = await cookies()
    const sessionToken = cookieStore.get('employee_session')?.value
    let repId: string | null = null

    if (sessionToken) {
      const session = await prisma.employeeSession.findUnique({
        where: { token: sessionToken },
        include: { employee: { select: { id: true } } }
      })
      repId = session?.employee?.id || null
    }

    const newMessage = await prisma.customerMessage.create({
      data: {
        recipientId: customerId,
        repId,
        message,
        readAt: null // Customer hasn't read it yet
      }
    })

    return NextResponse.json({
      success: true,
      message: {
        id: newMessage.id,
        message: newMessage.message,
        isFromCustomer: false,
        isRead: false,
        createdAt: newMessage.createdAt.toISOString()
      }
    })
  } catch (error) {
    console.error('Send message error:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
