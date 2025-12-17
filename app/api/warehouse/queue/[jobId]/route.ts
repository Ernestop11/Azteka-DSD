/**
 * Warehouse Queue Job Details API
 * GET /api/warehouse/queue/[jobId] - Get job details
 * DELETE /api/warehouse/queue/[jobId] - Delete job
 *
 * LAP W1: Final Integration
 */

import { NextRequest, NextResponse } from 'next/server'
import { getPrintJob, cancelPrintJob, updatePrintJob } from '@/warehouse/print/printEngine'

// ============================================================================
// GET JOB DETAILS
// ============================================================================

export async function GET(
  request: NextRequest,
  { params }: { params: { jobId: string } }
) {
  try {
    const jobId = params.jobId

    const job = await getPrintJob(jobId)

    if (!job) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'JOB_NOT_FOUND',
            message: `Print job ${jobId} not found`,
          },
        },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: {
        job: {
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
          errorStack: job.errorStack,
          createdAt: job.createdAt.toISOString(),
          updatedAt: job.updatedAt?.toISOString() || job.createdAt.toISOString(),
          completedAt: job.completedAt?.toISOString(),
          scheduledFor: job.scheduledFor?.toISOString(),
          lockedBy: job.lockedBy,
          lockedAt: job.lockedAt?.toISOString(),
          metadata: job.metadata,
        },
      },
    })
  } catch (error) {
    console.error(`[QueueAPI] Error fetching job ${params.jobId}:`, error)

    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'JOB_FETCH_FAILED',
          message: error instanceof Error ? error.message : 'Failed to fetch job',
        },
      },
      { status: 500 }
    )
  }
}

// ============================================================================
// DELETE JOB
// ============================================================================

export async function DELETE(
  request: NextRequest,
  { params }: { params: { jobId: string } }
) {
  try {
    const jobId = params.jobId

    // Cancel job (will mark as cancelled)
    await cancelPrintJob(jobId)

    return NextResponse.json({
      success: true,
      message: `Job ${jobId} cancelled successfully`,
    })
  } catch (error) {
    console.error(`[QueueAPI] Error deleting job ${params.jobId}:`, error)

    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'JOB_DELETE_FAILED',
          message: error instanceof Error ? error.message : 'Failed to delete job',
        },
      },
      { status: 500 }
    )
  }
}
