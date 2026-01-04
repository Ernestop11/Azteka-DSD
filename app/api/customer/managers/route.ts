import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

// GET - Fetch all managers for an owner
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const ownerId = searchParams.get('ownerId')

    if (!ownerId) {
      return NextResponse.json({ error: 'Owner ID required' }, { status: 400 })
    }

    const managers = await prisma.storeManager.findMany({
      where: {
        ownerId,
        active: true
      },
      include: {
        assignments: {
          where: { active: true },
          select: {
            id: true,
            storeId: true,
            role: true,
            createdAt: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    // Transform to include assignedStores as array of store IDs
    const formattedManagers = managers.map(m => ({
      id: m.id,
      name: m.name,
      phone: m.phone,
      email: m.email,
      assignedStores: m.assignments.map(a => a.storeId),
      createdAt: m.createdAt
    }))

    return NextResponse.json({ managers: formattedManagers })
  } catch (error) {
    console.error('Error fetching managers:', error)
    return NextResponse.json({ error: 'Failed to fetch managers' }, { status: 500 })
  }
}

// POST - Create a new manager
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { ownerId, name, phone, email, assignedStores } = body

    if (!ownerId || !name || !phone) {
      return NextResponse.json({ error: 'Owner ID, name, and phone are required' }, { status: 400 })
    }

    // Create manager with assignments
    const manager = await prisma.storeManager.create({
      data: {
        ownerId,
        name,
        phone,
        email: email || null,
        assignments: {
          create: (assignedStores || []).map((storeId: string) => ({
            storeId,
            role: 'MANAGER'
          }))
        }
      },
      include: {
        assignments: {
          select: {
            id: true,
            storeId: true,
            role: true
          }
        }
      }
    })

    return NextResponse.json({
      manager: {
        id: manager.id,
        name: manager.name,
        phone: manager.phone,
        email: manager.email,
        assignedStores: manager.assignments.map(a => a.storeId),
        createdAt: manager.createdAt
      }
    })
  } catch (error) {
    console.error('Error creating manager:', error)
    return NextResponse.json({ error: 'Failed to create manager' }, { status: 500 })
  }
}

// PUT - Update a manager
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, name, phone, email, assignedStores } = body

    if (!id) {
      return NextResponse.json({ error: 'Manager ID required' }, { status: 400 })
    }

    // Update manager details
    const manager = await prisma.storeManager.update({
      where: { id },
      data: {
        name,
        phone,
        email: email || null
      }
    })

    // Update assignments if provided
    if (assignedStores !== undefined) {
      // Remove existing assignments
      await prisma.storeManagerAssignment.deleteMany({
        where: { managerId: id }
      })

      // Create new assignments
      if (assignedStores.length > 0) {
        await prisma.storeManagerAssignment.createMany({
          data: assignedStores.map((storeId: string) => ({
            managerId: id,
            storeId,
            role: 'MANAGER'
          }))
        })
      }
    }

    // Fetch updated manager with assignments
    const updatedManager = await prisma.storeManager.findUnique({
      where: { id },
      include: {
        assignments: {
          where: { active: true },
          select: { storeId: true }
        }
      }
    })

    return NextResponse.json({
      manager: {
        id: updatedManager?.id,
        name: updatedManager?.name,
        phone: updatedManager?.phone,
        email: updatedManager?.email,
        assignedStores: updatedManager?.assignments.map(a => a.storeId) || [],
        createdAt: updatedManager?.createdAt
      }
    })
  } catch (error) {
    console.error('Error updating manager:', error)
    return NextResponse.json({ error: 'Failed to update manager' }, { status: 500 })
  }
}

// DELETE - Soft delete a manager
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'Manager ID required' }, { status: 400 })
    }

    await prisma.storeManager.update({
      where: { id },
      data: { active: false }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting manager:', error)
    return NextResponse.json({ error: 'Failed to delete manager' }, { status: 500 })
  }
}
