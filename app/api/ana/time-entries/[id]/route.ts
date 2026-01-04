import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET single time entry
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const entry = await prisma.timeEntry.findUnique({
      where: { id: params.id },
      include: {
        employee: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            role: true,
            hourlyRate: true
          }
        }
      }
    })

    if (!entry) {
      return NextResponse.json({ error: 'Time entry not found' }, { status: 404 })
    }

    return NextResponse.json(entry)
  } catch (error) {
    console.error('Error fetching time entry:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

// PATCH - Update time entry (edit clock in/out times)
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const { clockIn, clockOut, notes, status } = body

    // Get the existing entry
    const existing = await prisma.timeEntry.findUnique({
      where: { id: params.id }
    })

    if (!existing) {
      return NextResponse.json({ error: 'Time entry not found' }, { status: 404 })
    }

    // Calculate hours worked if both times are provided
    let hoursWorked = existing.hoursWorked
    const newClockIn = clockIn ? new Date(clockIn) : existing.clockIn
    const newClockOut = clockOut ? new Date(clockOut) : existing.clockOut

    if (newClockIn && newClockOut) {
      const diff = newClockOut.getTime() - newClockIn.getTime()
      hoursWorked = new Prisma.Decimal(diff / (1000 * 60 * 60))
    }

    // Update the entry
    const updated = await prisma.timeEntry.update({
      where: { id: params.id },
      data: {
        clockIn: newClockIn,
        clockOut: newClockOut,
        hoursWorked,
        notes: notes ?? existing.notes,
        status: status ?? existing.status
      },
      include: {
        employee: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            role: true
          }
        }
      }
    })

    return NextResponse.json(updated)
  } catch (error) {
    console.error('Error updating time entry:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

// DELETE - Remove time entry
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.timeEntry.delete({
      where: { id: params.id }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting time entry:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

// Need to import Prisma for Decimal type
import { Prisma } from '@prisma/client'
