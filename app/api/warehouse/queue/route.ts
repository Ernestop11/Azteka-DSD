/**
 * Warehouse Queue API
 * GET /api/warehouse/queue - Returns queue state for warehouse panel
 *
 * LAP W1: Final Integration - Warehouse Panel Sync
 */

import { NextRequest, NextResponse } from 'next/server'
import {
  getPrintJobs,
  getQueueSummary,
  getWorkerStatus,
} from '@/warehouse/print/printEngine'
import type { PrintQueueFilters } from '@/warehouse/print/printTypes'

// ============================================================================
// GET QUEUE STATE
// ============================================================================

/**
 * GET /api/warehouse/queue
 * Returns current queue state for React panel
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)

    // Parse query params for filtering
    const filters: PrintQueueFilters = {
      status: parseStatusParam(searchParams.get('status')),
      priority: parsePriorityParam(searchParams.get('priority')),
      limit: parseInt(searchParams.get('limit') || '50'),
      offset: parseInt(searchParams.get('offset') || '0'),
      sortBy: (searchParams.get('sortBy') as any) || 'createdAt',
      sortOrder: (searchParams.get('sortOrder') as any) || 'desc',
    }

    // Get jobs
    const jobs = await getPrintJobs(filters)

    // Get summary
    const summary = await getQueueSummary()

    // Get worker status
    const worker = await getWorkerStatus()

    // Format jobs for client
    const formattedJobs = jobs.map((job) => ({
      id: job.id,
      orderId: job.orderId,
      orderNumber: job.orderNumber,
      status: job.status,
      priority: job.priority,
      printerId: job.printerId,
      copies: job.copies,
      attemptCount: job.attemptCount,
      maxAttempts: job.maxAttempts,
      errorMessage: job.errorMessage,
      createdAt: job.createdAt.toISOString(),
      updatedAt: job.updatedAt?.toISOString() || job.createdAt.toISOString(),
      completedAt: job.completedAt?.toISOString(),
      scheduledFor: job.scheduledFor?.toISOString(),
      lockedBy: job.lockedBy,
      lockedAt: job.lockedAt?.toISOString(),
      metadata: job.metadata,
    }))

    // Return queue state
    return NextResponse.json({
      success: true,
      data: {
        jobs: formattedJobs,
        summary: {
          totalJobs: summary.totalJobs,
          pendingJobs: summary.pendingJobs,
          printingJobs: summary.printingJobs,
          completedJobs: summary.completedJobs,
          failedJobs: summary.failedJobs,
          cancelledJobs: summary.cancelledJobs,
          successRate: summary.successRate,
          averageCompletionTime: summary.averageCompletionTime,
          oldestPendingJob: summary.oldestPendingJob?.toISOString(),
        },
        worker: {
          running: worker?.running || false,
          workerId: worker?.workerId,
        },
        filters,
      },
    })
  } catch (error) {
    console.error('[QueueAPI] Error fetching queue state:', error)

    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'QUEUE_FETCH_FAILED',
          message: error instanceof Error ? error.message : 'Failed to fetch queue state',
        },
      },
      { status: 500 }
    )
  }
}

// ============================================================================
// PARAMETER PARSING
// ============================================================================

/**
 * Parse status parameter
 */
function parseStatusParam(
  param: string | null
): PrintQueueFilters['status'] {
  if (!param) return undefined

  if (param.includes(',')) {
    return param.split(',') as any
  }

  return param as any
}

/**
 * Parse priority parameter
 */
function parsePriorityParam(
  param: string | null
): PrintQueueFilters['priority'] {
  if (!param) return undefined

  if (param.includes(',')) {
    return param.split(',') as any
  }

  return param as any
}
