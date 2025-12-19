import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

// GET /api/employee/activities - Fetch activity logs (for admin worksheet)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const actionType = searchParams.get('actionType')
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')
    const limit = parseInt(searchParams.get('limit') || '100')
    const offset = parseInt(searchParams.get('offset') || '0')

    const where: any = {}

    if (userId) {
      where.userId = userId
    }

    if (actionType) {
      where.actionType = actionType
    }

    if (startDate || endDate) {
      where.createdAt = {}
      if (startDate) {
        where.createdAt.gte = new Date(startDate)
      }
      if (endDate) {
        where.createdAt.lte = new Date(endDate + 'T23:59:59.999Z')
      }
    }

    const [activities, total] = await Promise.all([
      prisma.employeeActivity.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              role: true
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset
      }),
      prisma.employeeActivity.count({ where })
    ])

    return NextResponse.json({
      data: activities,
      total,
      limit,
      offset
    })
  } catch (error) {
    console.error('Failed to fetch activities:', error)
    return NextResponse.json(
      { error: 'Failed to fetch activities' },
      { status: 500 }
    )
  }
}

// POST /api/employee/activities - Log a new activity
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      userId,
      actionType,
      entityType,
      entityId,
      entityName,
      description,
      metadata
    } = body

    if (!userId || !actionType || !description) {
      return NextResponse.json(
        { error: 'userId, actionType, and description are required' },
        { status: 400 }
      )
    }

    const activity = await prisma.employeeActivity.create({
      data: {
        userId,
        actionType,
        entityType,
        entityId,
        entityName,
        description,
        metadata
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    })

    return NextResponse.json(activity, { status: 201 })
  } catch (error) {
    console.error('Failed to log activity:', error)
    return NextResponse.json(
      { error: 'Failed to log activity' },
      { status: 500 }
    )
  }
}
