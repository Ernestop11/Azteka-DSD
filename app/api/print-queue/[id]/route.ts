/**
 * Print Job Status Update API
 *
 * PATCH /api/print-queue/[id] - Update job status (complete, fail, etc.)
 * GET /api/print-queue/[id] - Get single job details
 *
 * Authentication: Bearer token matching PRINT_AGENT_SECRET env var
 */

import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

// Verify print agent authentication
function verifyPrintAgent(request: NextRequest): boolean {
  const authHeader = request.headers.get('authorization')
  if (!authHeader?.startsWith('Bearer ')) return false

  const token = authHeader.slice(7)
  const secret = process.env.PRINT_AGENT_SECRET

  if (!secret) return false
  return token === secret
}

/**
 * GET /api/print-queue/[id]
 * Get details of a specific print job
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!verifyPrintAgent(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { id } = await params

    const job = await prisma.printJob.findUnique({
      where: { id },
    })

    if (!job) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 })
    }

    return NextResponse.json({ success: true, job })
  } catch (error) {
    console.error('[GET /api/print-queue/[id]] Error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch print job' },
      { status: 500 }
    )
  }
}

/**
 * PATCH /api/print-queue/[id]
 * Update job status (called by print agent after printing)
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!verifyPrintAgent(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { id } = await params
    const body = await request.json()
    const { status, errorMsg } = body

    // Validate status
    const validStatuses = ['PRINTING', 'COMPLETED', 'FAILED', 'CANCELLED']
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { error: `Invalid status. Must be one of: ${validStatuses.join(', ')}` },
        { status: 400 }
      )
    }

    const updateData: any = { status }

    if (status === 'COMPLETED') {
      updateData.printedAt = new Date()
    }

    if (status === 'FAILED') {
      updateData.errorMsg = errorMsg || 'Unknown error'
      // Increment retry count
      const currentJob = await prisma.printJob.findUnique({
        where: { id },
        select: { retries: true },
      })
      updateData.retries = (currentJob?.retries || 0) + 1

      // If failed less than 3 times, re-queue it
      if (updateData.retries < 3) {
        updateData.status = 'QUEUED'
        console.log(`[PrintQueue] Job ${id} failed, re-queuing (attempt ${updateData.retries})`)
      }
    }

    const job = await prisma.printJob.update({
      where: { id },
      data: updateData,
    })

    console.log(`[PrintQueue] Job ${id} status updated to ${job.status}`)

    return NextResponse.json({ success: true, job })
  } catch (error) {
    console.error('[PATCH /api/print-queue/[id]] Error:', error)
    return NextResponse.json(
      { error: 'Failed to update print job' },
      { status: 500 }
    )
  }
}
