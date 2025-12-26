import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export const dynamic = 'force-dynamic'

// POST - Record a customer visit
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const customer = await prisma.customer.update({
      where: { id },
      data: {
        lastVisitDate: new Date(),
      },
    })

    return NextResponse.json({ success: true, lastVisitDate: customer.lastVisitDate })
  } catch (error) {
    console.error('[Rep Visit API] Error:', error)
    return NextResponse.json({ error: 'Failed to record visit' }, { status: 500 })
  }
}
