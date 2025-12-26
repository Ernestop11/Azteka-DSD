/**
 * Print Queue API
 *
 * GET /api/print-queue - Get pending print jobs (for print agent)
 * POST /api/print-queue - Create a new print job
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

  // If no secret configured, reject all requests
  if (!secret) {
    console.warn('[PrintQueue] PRINT_AGENT_SECRET not configured')
    return false
  }

  return token === secret
}

/**
 * GET /api/print-queue
 * Returns pending print jobs for the agent to process
 */
export async function GET(request: NextRequest) {
  // Verify agent authentication
  if (!verifyPrintAgent(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    // Get agent name from query params (for heartbeat update)
    const { searchParams } = new URL(request.url)
    const agentName = searchParams.get('agent')

    // Update agent heartbeat if agent name provided
    if (agentName) {
      await prisma.printAgent.upsert({
        where: { name: agentName },
        update: {
          lastHeartbeat: new Date(),
          printerStatus: 'ONLINE',
          ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
        },
        create: {
          name: agentName,
          secret: process.env.PRINT_AGENT_SECRET || 'default',
          lastHeartbeat: new Date(),
          printerStatus: 'ONLINE',
          ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
        },
      })
    }

    // Get pending/queued jobs
    const jobs = await prisma.printJob.findMany({
      where: {
        status: 'QUEUED',
      },
      orderBy: [
        { createdAt: 'asc' }, // Oldest first (FIFO)
      ],
      take: 10, // Batch of 10 jobs at a time
    })

    return NextResponse.json({
      success: true,
      jobs,
      count: jobs.length,
    })
  } catch (error) {
    console.error('[GET /api/print-queue] Error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch print jobs' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/print-queue
 * Create a new print job (called from autoWorkflow)
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { type, payload, sourceType, sourceId, copies = 1, printerId } = body

    if (!type || !payload) {
      return NextResponse.json(
        { error: 'type and payload are required' },
        { status: 400 }
      )
    }

    // Validate type
    const validTypes = ['PICKING_LIST', 'PACKING_SLIP', 'BOX_LABEL', 'INVOICE', 'DELIVERY_SHEET']
    if (!validTypes.includes(type)) {
      return NextResponse.json(
        { error: `Invalid type. Must be one of: ${validTypes.join(', ')}` },
        { status: 400 }
      )
    }

    const job = await prisma.printJob.create({
      data: {
        type,
        payload,
        sourceType,
        sourceId,
        copies,
        printerId,
        status: 'QUEUED',
      },
    })

    console.log(`[PrintQueue] Created job ${job.id} (${type}) for ${sourceType}:${sourceId}`)

    return NextResponse.json({
      success: true,
      job,
    })
  } catch (error) {
    console.error('[POST /api/print-queue] Error:', error)
    return NextResponse.json(
      { error: 'Failed to create print job' },
      { status: 500 }
    )
  }
}
