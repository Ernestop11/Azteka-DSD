import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import crypto from 'crypto'

export const dynamic = 'force-dynamic'

// POST /api/rep/login - Login for sales reps
export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      )
    }

    // Find user by email with SalesRep info for phone
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
      select: {
        id: true,
        email: true,
        name: true,
        password: true,
        role: true,
        SalesRep: {
          select: {
            phone: true,
          }
        }
      }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      )
    }

    // Check if user has sales rep access (admin, employee, or sales_rep role)
    const allowedRoles = ['admin', 'employee', 'sales_rep', 'manager', 'super_admin']
    if (!allowedRoles.includes(user.role.toLowerCase())) {
      return NextResponse.json(
        { error: 'You do not have access to the Sales Rep app' },
        { status: 403 }
      )
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password)
    if (!isValidPassword) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      )
    }

    // Generate a simple token for the session
    const token = crypto.randomBytes(32).toString('hex')

    // Store session in database
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days

    await prisma.session.create({
      data: {
        id: crypto.randomUUID(),
        userId: user.id,
        token,
        expiresAt,
      }
    })

    // Get PIN from Employee table (employees have direct pin field)
    const employee = await prisma.employee.findFirst({
      where: { email: email.toLowerCase() },
      select: { pin: true }
    })

    // Use Employee PIN if available, otherwise fall back to SalesRep phone last 4
    let repPin = employee?.pin || ''
    if (!repPin && user.SalesRep?.phone) {
      repPin = user.SalesRep.phone.replace(/\D/g, '').slice(-4)
    }
    repPin = repPin || '0000'

    // Return user info and token
    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        pin: repPin, // Last 4 digits of phone
      },
      token,
    })
  } catch (error) {
    console.error('[Rep Login API] Error:', error)
    return NextResponse.json(
      { error: 'Login failed. Please try again.' },
      { status: 500 }
    )
  }
}
