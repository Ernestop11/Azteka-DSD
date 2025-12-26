/**
 * Print Agent Heartbeat API
 *
 * POST /api/print-queue/heartbeat - Agent reports its status
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
 * POST /api/print-queue/heartbeat
 * Agent reports its status and printer info
 */
export async function POST(request: NextRequest) {
  if (!verifyPrintAgent(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const {
      agentName,
      printerStatus = 'ONLINE',
      printerName,
      queueDepth = 0,
      lastError,
    } = body

    if (!agentName) {
      return NextResponse.json(
        { error: 'agentName is required' },
        { status: 400 }
      )
    }

    // Get IP address
    const ipAddress =
      request.headers.get('x-forwarded-for')?.split(',')[0] ||
      request.headers.get('x-real-ip') ||
      'unknown'

    // Upsert agent record
    const agent = await prisma.printAgent.upsert({
      where: { name: agentName },
      update: {
        lastHeartbeat: new Date(),
        printerStatus,
        printerName,
        queueDepth,
        lastError: lastError || null,
        ipAddress,
      },
      create: {
        name: agentName,
        secret: process.env.PRINT_AGENT_SECRET || 'default',
        lastHeartbeat: new Date(),
        printerStatus,
        printerName,
        queueDepth,
        lastError: lastError || null,
        ipAddress,
      },
    })

    // Get count of pending jobs for agent
    const pendingJobs = await prisma.printJob.count({
      where: { status: 'QUEUED' },
    })

    return NextResponse.json({
      success: true,
      agent: {
        id: agent.id,
        name: agent.name,
        lastHeartbeat: agent.lastHeartbeat,
      },
      pendingJobs,
    })
  } catch (error) {
    console.error('[POST /api/print-queue/heartbeat] Error:', error)
    return NextResponse.json(
      { error: 'Failed to update heartbeat' },
      { status: 500 }
    )
  }
}
