import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/employee/inventory-count - List all inventory count sessions
export async function GET() {
  try {
    const counts = await prisma.inventoryCount.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: { items: true }
        }
      }
    })

    return NextResponse.json({ counts })
  } catch (error) {
    console.error('Failed to fetch inventory counts:', error)
    return NextResponse.json(
      { error: 'Failed to fetch inventory counts' },
      { status: 500 }
    )
  }
}

// POST /api/employee/inventory-count - Create new inventory count session
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, notes } = body

    if (!name) {
      return NextResponse.json(
        { error: 'Name is required' },
        { status: 400 }
      )
    }

    // Check for existing open count
    const existingOpen = await prisma.inventoryCount.findFirst({
      where: { status: 'OPEN' }
    })

    if (existingOpen) {
      return NextResponse.json(
        { error: 'There is already an open inventory count session', existingCount: existingOpen },
        { status: 400 }
      )
    }

    // Create new count session
    const count = await prisma.inventoryCount.create({
      data: {
        name,
        notes,
        status: 'OPEN',
        snapshotTakenAt: new Date()
      }
    })

    return NextResponse.json({ count }, { status: 201 })
  } catch (error) {
    console.error('Failed to create inventory count:', error)
    return NextResponse.json(
      { error: 'Failed to create inventory count' },
      { status: 500 }
    )
  }
}
