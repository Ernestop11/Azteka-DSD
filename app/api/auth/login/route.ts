import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import { randomBytes } from 'crypto'

const SESSION_COOKIE = 'session_azteka'
const SESSION_DURATION = 30 * 24 * 60 * 60 * 1000 // 30 days

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password } = body

    console.log('[LOGIN] Attempting login for:', email)

    // Validate input
    if (!email || !password) {
      console.log('[LOGIN] Missing email or password')
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      )
    }

    // Find user by email
    // Using select to avoid Prisma schema mismatch if customerId column doesn't exist in DB
    let user
    try {
      user = await prisma.user.findUnique({
        where: { email: email.toLowerCase().trim() },
        select: {
          id: true,
          email: true,
          password: true,
          name: true,
          role: true,
        },
      })
      console.log('[LOGIN] User lookup result:', user ? 'Found' : 'Not found')
    } catch (prismaError: any) {
      console.error('[LOGIN] Prisma error:', prismaError)
      return NextResponse.json(
        { error: 'Database error', details: prismaError?.message },
        { status: 500 }
      )
    }

    if (!user) {
      console.log('[LOGIN] User not found')
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      )
    }

    // Verify password
    let isValidPassword = false
    try {
      isValidPassword = await bcrypt.compare(password, user.password)
      console.log('[LOGIN] Password check:', isValidPassword ? 'Valid' : 'Invalid')
    } catch (bcryptError: any) {
      console.error('[LOGIN] Bcrypt error:', bcryptError)
      return NextResponse.json(
        { error: 'Password verification failed' },
        { status: 500 }
      )
    }
    
    if (!isValidPassword) {
      console.log('[LOGIN] Invalid password')
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      )
    }

    // Generate random token
    const token = randomBytes(32).toString('hex')
    const expiresAt = new Date(Date.now() + SESSION_DURATION)

    console.log('[LOGIN] Creating session for user:', user.id)

    // Create session in database
    try {
      await prisma.session.create({
        data: {
          id: randomBytes(16).toString('hex'), // Generate unique session ID
          token,
          userId: user.id,
          expiresAt,
        },
      })
      console.log('[LOGIN] Session created successfully')
    } catch (sessionError: any) {
      console.error('[LOGIN] Session creation error:', sessionError)
      return NextResponse.json(
        { error: 'Failed to create session', details: sessionError?.message },
        { status: 500 }
      )
    }

    // Create response
    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    })

    // Set HTTP-only cookie
    response.cookies.set(SESSION_COOKIE, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 30,
    })

    console.log('[LOGIN] Login successful, cookie set:', SESSION_COOKIE)
    return response
  } catch (error: any) {
    console.error('[LOGIN] Unexpected error:', error)
    return NextResponse.json(
      { error: 'Login failed', details: error?.message },
      { status: 500 }
    )
  }
}
