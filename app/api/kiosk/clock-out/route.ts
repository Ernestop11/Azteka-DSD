import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { writeFile, mkdir } from 'fs/promises'
import path from 'path'
import { Decimal } from '@prisma/client/runtime/library'

export async function POST(request: NextRequest) {
  try {
    const { employeeId, photo } = await request.json()

    if (!employeeId) {
      return NextResponse.json({ error: 'Employee ID required' }, { status: 400 })
    }

    // Find active time entry
    const activeEntry = await prisma.timeEntry.findFirst({
      where: {
        employeeId,
        status: 'ACTIVE',
        clockOut: null
      },
      orderBy: { clockIn: 'desc' }
    })

    if (!activeEntry) {
      return NextResponse.json({ error: 'Not clocked in' }, { status: 400 })
    }

    // Save photo if provided
    let photoPath: string | undefined
    if (photo && photo.startsWith('data:image')) {
      try {
        const uploadsDir = path.join(process.cwd(), 'public', 'uploads', 'timeclock')
        await mkdir(uploadsDir, { recursive: true })

        const base64Data = photo.replace(/^data:image\/\w+;base64,/, '')
        const buffer = Buffer.from(base64Data, 'base64')
        const filename = `clockout_${employeeId}_${Date.now()}.jpg`
        const filepath = path.join(uploadsDir, filename)

        await writeFile(filepath, buffer)
        photoPath = `/uploads/timeclock/${filename}`
      } catch (err) {
        console.error('Photo save error:', err)
        // Continue without photo
      }
    }

    // Calculate hours worked
    const clockOut = new Date()
    const clockIn = activeEntry.clockIn
    const hoursWorked = (clockOut.getTime() - clockIn.getTime()) / (1000 * 60 * 60)

    // Update time entry
    const updatedEntry = await prisma.timeEntry.update({
      where: { id: activeEntry.id },
      data: {
        clockOut,
        clockOutPhoto: photoPath,
        hoursWorked: new Decimal(hoursWorked.toFixed(2)),
        status: 'COMPLETED'
      }
    })

    return NextResponse.json({
      success: true,
      timeEntry: {
        id: updatedEntry.id,
        clockIn: updatedEntry.clockIn.toISOString(),
        clockOut: updatedEntry.clockOut?.toISOString(),
        hoursWorked: hoursWorked.toFixed(2)
      }
    })
  } catch (error) {
    console.error('Clock-out error:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
