import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

// GET - Fetch all customer messages for admin review
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const repId = searchParams.get('repId')
    const unreadOnly = searchParams.get('unreadOnly') === 'true'

    // Build where clause
    const where: any = {}

    // If filtering by rep
    if (repId) {
      where.repId = repId
    }

    // Get messages grouped by customer
    const messages = await prisma.customerMessage.findMany({
      where: {
        ...where,
        senderId: { not: null } // Only customer-sent messages
      },
      orderBy: { createdAt: 'desc' },
      include: {
        sender: {
          select: {
            id: true,
            businessName: true,
            contactName: true,
            phone: true,
            salesRepId: true,
            salesRep: {
              select: {
                id: true,
                name: true
              }
            }
          }
        }
      }
    })

    // Group by customer for conversation view
    const conversationsMap = new Map<string, {
      customerId: string
      businessName: string
      contactName: string
      phone: string
      salesRep: { id: string; name: string } | null
      messages: any[]
      unreadCount: number
      lastMessage: any
    }>()

    for (const msg of messages) {
      if (!msg.sender) continue

      const customerId = msg.sender.id
      if (!conversationsMap.has(customerId)) {
        conversationsMap.set(customerId, {
          customerId,
          businessName: msg.sender.businessName,
          contactName: msg.sender.contactName,
          phone: msg.sender.phone,
          salesRep: msg.sender.salesRep,
          messages: [],
          unreadCount: 0,
          lastMessage: null
        })
      }

      const conv = conversationsMap.get(customerId)!
      conv.messages.push({
        id: msg.id,
        message: msg.message,
        isFromCustomer: true,
        readAt: msg.readAt,
        createdAt: msg.createdAt
      })

      if (!msg.readAt) {
        conv.unreadCount++
      }

      if (!conv.lastMessage || new Date(msg.createdAt) > new Date(conv.lastMessage.createdAt)) {
        conv.lastMessage = msg
      }
    }

    // Also fetch replies (messages from admin/rep to customers)
    const replies = await prisma.customerMessage.findMany({
      where: {
        senderId: null, // From admin/rep
        recipientId: { not: null }
      },
      orderBy: { createdAt: 'desc' }
    })

    // Add replies to conversations
    for (const reply of replies) {
      if (reply.recipientId && conversationsMap.has(reply.recipientId)) {
        const conv = conversationsMap.get(reply.recipientId)!
        conv.messages.push({
          id: reply.id,
          message: reply.message,
          isFromCustomer: false,
          repId: reply.repId,
          readAt: reply.readAt,
          createdAt: reply.createdAt
        })
      }
    }

    // Sort messages within each conversation
    for (const conv of conversationsMap.values()) {
      conv.messages.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
    }

    // Convert to array and sort by last message date
    let conversations = Array.from(conversationsMap.values())
      .sort((a, b) => {
        const aDate = a.lastMessage?.createdAt || 0
        const bDate = b.lastMessage?.createdAt || 0
        return new Date(bDate).getTime() - new Date(aDate).getTime()
      })

    // Filter unread only if requested
    if (unreadOnly) {
      conversations = conversations.filter(c => c.unreadCount > 0)
    }

    // Calculate totals
    const totalUnread = conversations.reduce((sum, c) => sum + c.unreadCount, 0)

    return NextResponse.json({
      conversations,
      totalUnread,
      totalConversations: conversations.length
    })
  } catch (error) {
    console.error('Error fetching admin messages:', error)
    return NextResponse.json({ error: 'Failed to fetch messages' }, { status: 500 })
  }
}

// POST - Send a reply from admin/rep to customer
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { customerId, message, repId } = body

    if (!customerId || !message?.trim()) {
      return NextResponse.json({ error: 'Customer ID and message required' }, { status: 400 })
    }

    // Create the reply message
    const newMessage = await prisma.customerMessage.create({
      data: {
        senderId: null, // From admin/rep
        recipientId: customerId,
        repId: repId || null,
        message: message.trim()
      }
    })

    return NextResponse.json({
      success: true,
      message: {
        id: newMessage.id,
        message: newMessage.message,
        isFromCustomer: false,
        repId: newMessage.repId,
        createdAt: newMessage.createdAt
      }
    })
  } catch (error) {
    console.error('Error sending reply:', error)
    return NextResponse.json({ error: 'Failed to send reply' }, { status: 500 })
  }
}
