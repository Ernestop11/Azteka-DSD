/**
 * Print Queue Status API
 *
 * GET /api/print-queue/status - Get print system status for dashboard
 *
 * Returns:
 * - Agent status (online/offline)
 * - Queue depth
 * - Recent job stats
 */

import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { requireAdmin, unauthorizedResponse } from '../../lib/auth'

// How long before we consider an agent offline (10 minutes)
const OFFLINE_THRESHOLD_MS = 10 * 60 * 1000

export async function GET(request: NextRequest) {
  // Require admin authentication
  const user = await requireAdmin(request)
  if (!user) return unauthorizedResponse()

  try {
    // Get all registered agents
    const agents = await prisma.printAgent.findMany({
      where: { active: true },
      orderBy: { lastHeartbeat: 'desc' },
    })

    // Determine agent statuses
    const now = Date.now()
    const agentStatuses = agents.map((agent) => {
      const lastSeen = agent.lastHeartbeat?.getTime() || 0
      const timeSinceHeartbeat = now - lastSeen
      const isOnline = timeSinceHeartbeat < OFFLINE_THRESHOLD_MS

      return {
        name: agent.name,
        isOnline,
        lastHeartbeat: agent.lastHeartbeat,
        timeSinceHeartbeat,
        minutesAgo: Math.round(timeSinceHeartbeat / 60000),
        printerStatus: agent.printerStatus,
        printerName: agent.printerName,
        queueDepth: agent.queueDepth,
        lastError: agent.lastError,
        ipAddress: agent.ipAddress,
      }
    })

    // Check if ANY agent is online
    const anyAgentOnline = agentStatuses.some((a) => a.isOnline)

    // Get queue stats
    const [queuedCount, printingCount, completedToday, failedToday] = await Promise.all([
      prisma.printJob.count({ where: { status: 'QUEUED' } }),
      prisma.printJob.count({ where: { status: 'PRINTING' } }),
      prisma.printJob.count({
        where: {
          status: 'COMPLETED',
          printedAt: { gte: new Date(new Date().setHours(0, 0, 0, 0)) },
        },
      }),
      prisma.printJob.count({
        where: {
          status: 'FAILED',
          createdAt: { gte: new Date(new Date().setHours(0, 0, 0, 0)) },
        },
      }),
    ])

    // Get oldest queued job (to show how long jobs are waiting)
    const oldestQueued = await prisma.printJob.findFirst({
      where: { status: 'QUEUED' },
      orderBy: { createdAt: 'asc' },
      select: { createdAt: true },
    })

    const oldestWaitTime = oldestQueued
      ? Math.round((now - oldestQueued.createdAt.getTime()) / 60000)
      : 0

    return NextResponse.json({
      success: true,
      system: {
        isOnline: anyAgentOnline,
        hasAgents: agents.length > 0,
        agentCount: agents.length,
      },
      agents: agentStatuses,
      queue: {
        pending: queuedCount,
        printing: printingCount,
        completedToday,
        failedToday,
        oldestWaitMinutes: oldestWaitTime,
      },
      alert: !anyAgentOnline && agents.length > 0
        ? {
            type: 'warning',
            title: 'Print Agent Offline',
            message: `No print agents have reported in the last ${Math.round(OFFLINE_THRESHOLD_MS / 60000)} minutes. Print jobs are queuing but not printing.`,
          }
        : agents.length === 0
        ? {
            type: 'info',
            title: 'No Print Agent Configured',
            message: 'Set up a print agent on your warehouse computer to enable automatic printing.',
          }
        : null,
    })
  } catch (error) {
    console.error('[GET /api/print-queue/status] Error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch print status' },
      { status: 500 }
    )
  }
}
