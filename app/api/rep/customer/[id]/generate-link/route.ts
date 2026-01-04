import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
import prisma from '@/lib/prisma'

export const dynamic = 'force-dynamic'

// POST /api/rep/customer/[id]/generate-link
// Generate a typed customer link (HANDOFF, INSTALL, or CATALOG_SHARE)
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const customerId = params.id
    const body = await request.json()
    const { linkPurpose, createdById } = body

    // Validate link purpose
    const validPurposes = ['HANDOFF', 'INSTALL', 'CATALOG_SHARE', 'MVP_DASHBOARD']
    if (!linkPurpose || !validPurposes.includes(linkPurpose)) {
      return NextResponse.json(
        { error: 'Invalid linkPurpose. Must be HANDOFF, INSTALL, CATALOG_SHARE, or MVP_DASHBOARD' },
        { status: 400 }
      )
    }

    // Verify customer exists
    const customer = await prisma.customer.findUnique({
      where: { id: customerId },
      select: { id: true, businessName: true, active: true }
    })

    if (!customer) {
      return NextResponse.json(
        { error: 'Customer not found' },
        { status: 404 }
      )
    }

    if (!customer.active) {
      return NextResponse.json(
        { error: 'Customer is inactive' },
        { status: 400 }
      )
    }

    // Generate secure token (32 bytes = 64 hex chars)
    const token = crypto.randomBytes(32).toString('hex')

    // Set expiration (12 hours)
    const expiresAt = new Date(Date.now() + 12 * 60 * 60 * 1000)

    // Create session with link purpose
    const session = await prisma.customerSession.create({
      data: {
        customerId,
        token,
        type: 'MAGIC_LINK',
        linkPurpose: linkPurpose as 'HANDOFF' | 'INSTALL' | 'CATALOG_SHARE' | 'MVP_DASHBOARD',
        createdById: createdById || null,
        expiresAt,
      }
    })

    // Generate the magic link URL
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://aztekafoods.com'
    const magicLink = `${baseUrl}/c/${token}`

    return NextResponse.json({
      success: true,
      magicLink,
      token,
      expiresAt: session.expiresAt.toISOString(),
      linkPurpose,
      customer: {
        id: customer.id,
        businessName: customer.businessName
      }
    })
  } catch (error) {
    console.error('[Generate Link] Error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to generate link' },
      { status: 500 }
    )
  }
}
