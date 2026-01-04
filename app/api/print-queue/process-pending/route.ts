import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// POST - Process all pending print jobs (called when Mac wakes up)
export async function POST(request: NextRequest) {
  try {
    // Find all pending print jobs
    const pendingJobs = await prisma.printJob.findMany({
      where: {
        status: 'PENDING'
      },
      orderBy: {
        createdAt: 'asc'
      }
    })

    if (pendingJobs.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No pending jobs to process',
        processed: 0
      })
    }

    // Mark jobs as ready to be picked up by the print agent
    // The print agent will poll for these and print them
    const updatedJobs = await prisma.printJob.updateMany({
      where: {
        status: 'PENDING'
      },
      data: {
        status: 'QUEUED',
        updatedAt: new Date()
      }
    })

    // Log the wake-up print processing
    console.log(`[Print Queue] Mac woke up - queued ${updatedJobs.count} pending jobs for printing`)

    return NextResponse.json({
      success: true,
      message: `Queued ${updatedJobs.count} jobs for printing`,
      processed: updatedJobs.count,
      jobs: pendingJobs.map(j => ({
        id: j.id,
        type: j.type,
        createdAt: j.createdAt
      }))
    })
  } catch (error) {
    console.error('Failed to process pending print jobs:', error)
    return NextResponse.json(
      { error: 'Failed to process pending jobs' },
      { status: 500 }
    )
  }
}

// GET - Check pending jobs count
export async function GET() {
  try {
    const pendingCount = await prisma.printJob.count({
      where: {
        status: 'PENDING'
      }
    })

    const queuedCount = await prisma.printJob.count({
      where: {
        status: 'QUEUED'
      }
    })

    return NextResponse.json({
      pending: pendingCount,
      queued: queuedCount,
      total: pendingCount + queuedCount
    })
  } catch (error) {
    console.error('Failed to get pending count:', error)
    return NextResponse.json({ error: 'Failed to get count' }, { status: 500 })
  }
}
