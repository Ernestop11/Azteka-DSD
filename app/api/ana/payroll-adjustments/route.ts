import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET all payroll adjustments for a period
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const startStr = searchParams.get('start')
    const endStr = searchParams.get('end')
    const employeeId = searchParams.get('employeeId')

    const where: any = {}

    if (startStr && endStr) {
      where.periodStart = { gte: new Date(startStr) }
      where.periodEnd = { lte: new Date(endStr) }
    }

    if (employeeId) {
      where.employeeId = employeeId
    }

    const adjustments = await prisma.payrollAdjustment.findMany({
      where,
      include: {
        employee: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            role: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json(adjustments)
  } catch (error) {
    console.error('Error fetching payroll adjustments:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

// POST - Create new payroll adjustment (bonus, commission, deduction)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      employeeId,
      type,
      amount,
      description,
      orderId,
      periodStart,
      periodEnd,
      status = 'PENDING'
    } = body

    if (!employeeId || !type || amount === undefined || !periodStart || !periodEnd) {
      return NextResponse.json(
        { error: 'Missing required fields: employeeId, type, amount, periodStart, periodEnd' },
        { status: 400 }
      )
    }

    const adjustment = await prisma.payrollAdjustment.create({
      data: {
        employeeId,
        type,
        amount,
        description,
        orderId,
        periodStart: new Date(periodStart),
        periodEnd: new Date(periodEnd),
        status
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

    return NextResponse.json(adjustment)
  } catch (error) {
    console.error('Error creating payroll adjustment:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
