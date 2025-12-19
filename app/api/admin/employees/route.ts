import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET all employees
export async function GET() {
  try {
    const employees = await prisma.employee.findMany({
      orderBy: [{ active: 'desc' }, { lastName: 'asc' }],
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

    return NextResponse.json({
      employees: employees.map(emp => ({
        ...emp,
        hourlyRate: emp.hourlyRate.toString(),
        isClockedIn: emp.timeEntries.length > 0,
        timeEntries: undefined
      }))
    })
  } catch (error) {
    console.error('Get employees error:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

// POST create new employee
export async function POST(request: NextRequest) {
  try {
    const data = await request.json()

    const { firstName, lastName, phone, email, role, hourlyRate } = data

    if (!firstName || !lastName || !phone) {
      return NextResponse.json({ error: 'First name, last name, and phone are required' }, { status: 400 })
    }

    // Extract last 4 digits as PIN
    const pin = phone.replace(/\D/g, '').slice(-4)

    if (pin.length !== 4) {
      return NextResponse.json({ error: 'Phone number must have at least 4 digits' }, { status: 400 })
    }

    // Check for duplicate phone
    const existing = await prisma.employee.findFirst({
      where: { phone: phone.replace(/\D/g, '') }
    })

    if (existing) {
      return NextResponse.json({ error: 'Employee with this phone number already exists' }, { status: 400 })
    }

    const employee = await prisma.employee.create({
      data: {
        firstName,
        lastName,
        phone: phone.replace(/\D/g, ''),
        pin,
        email: email || null,
        role: role || 'WAREHOUSE',
        hourlyRate: hourlyRate || 0
      }
    })

    return NextResponse.json({
      employee: {
        ...employee,
        hourlyRate: employee.hourlyRate.toString()
      }
    })
  } catch (error) {
    console.error('Create employee error:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

// PUT update employee
export async function PUT(request: NextRequest) {
  try {
    const data = await request.json()
    const { id, firstName, lastName, phone, email, role, hourlyRate, active } = data

    if (!id) {
      return NextResponse.json({ error: 'Employee ID required' }, { status: 400 })
    }

    const updateData: Record<string, unknown> = {}

    if (firstName !== undefined) updateData.firstName = firstName
    if (lastName !== undefined) updateData.lastName = lastName
    if (email !== undefined) updateData.email = email || null
    if (role !== undefined) updateData.role = role
    if (hourlyRate !== undefined) updateData.hourlyRate = hourlyRate
    if (active !== undefined) updateData.active = active

    if (phone !== undefined) {
      const cleanPhone = phone.replace(/\D/g, '')
      updateData.phone = cleanPhone
      updateData.pin = cleanPhone.slice(-4)
    }

    const employee = await prisma.employee.update({
      where: { id },
      data: updateData
    })

    return NextResponse.json({
      employee: {
        ...employee,
        hourlyRate: employee.hourlyRate.toString()
      }
    })
  } catch (error) {
    console.error('Update employee error:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

// DELETE employee (soft delete - set inactive)
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'Employee ID required' }, { status: 400 })
    }

    await prisma.employee.update({
      where: { id },
      data: { active: false }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete employee error:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
