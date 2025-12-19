import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { writeFile, mkdir } from 'fs/promises'
import path from 'path'

export async function POST(request: NextRequest) {
  try {
    const { employeeId, photo } = await request.json()

    if (!employeeId) {
      return NextResponse.json({ error: 'Employee ID required' }, { status: 400 })
    }

    // Check if employee exists and is active
    const employee = await prisma.employee.findUnique({
      where: { id: employeeId },
      include: {
        timeEntries: {
          where: {
            status: 'ACTIVE',
            clockOut: null
          },
          take: 1
        }
      }
    })

    if (!employee || !employee.active) {
      return NextResponse.json({ error: 'Employee not found' }, { status: 404 })
    }

    // Check if already clocked in
    if (employee.timeEntries.length > 0) {
      return NextResponse.json({ error: 'Already clocked in' }, { status: 400 })
    }

    // Save photo if provided
    let photoPath: string | undefined
    if (photo && photo.startsWith('data:image')) {
      try {
        const uploadsDir = path.join(process.cwd(), 'public', 'uploads', 'timeclock')
        await mkdir(uploadsDir, { recursive: true })

        const base64Data = photo.replace(/^data:image\/\w+;base64,/, '')
        const buffer = Buffer.from(base64Data, 'base64')
        const filename = `clockin_${employeeId}_${Date.now()}.jpg`
        const filepath = path.join(uploadsDir, filename)

        await writeFile(filepath, buffer)
        photoPath = `/uploads/timeclock/${filename}`
      } catch (err) {
        console.error('Photo save error:', err)
        // Continue without photo
      }
    }

    // Create time entry
    const timeEntry = await prisma.timeEntry.create({
      data: {
        employeeId,
        clockIn: new Date(),
        clockInPhoto: photoPath,
        status: 'ACTIVE'
      }
    })

    return NextResponse.json({
      success: true,
      timeEntry: {
        id: timeEntry.id,
        clockIn: timeEntry.clockIn.toISOString()
      }
    })
  } catch (error) {
    console.error('Clock-in error:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
