import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const employees = await prisma.employee.findMany({
      orderBy: [
        { role: 'asc' },
        { firstName: 'asc' }
      ],
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        phone: true,
        pin: true,
        role: true,
        hourlyRate: true,
        active: true,
        hireDate: true,
        needsPinReset: true
      }
    })

    return NextResponse.json({ employees })
  } catch (error) {
    console.error('Employees list error:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
