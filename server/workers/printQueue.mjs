/**
 * Print Queue Worker
 * Background worker that processes print jobs from the queue
 */

import { sendToPrinter } from '../../warehouse/print/printerService.mjs'

let workerInterval = null
let isProcessing = false
let processedCount = 0
let errorCount = 0

/**
 * Start print queue worker
 * Polls database every 5 seconds for queued print jobs
 */
export function startPrintQueueWorker(prisma, io, workerId) {
  console.log(`[PrintQueue] Starting worker: ${workerId}`)

  // Poll every 5 seconds
  workerInterval = setInterval(async () => {
    if (isProcessing) {
      return // Skip if still processing previous batch
    }

    try {
      isProcessing = true
      await processPrintQueue(prisma, io, workerId)
    } catch (error) {
      console.error('[PrintQueue] Error processing queue:', error)
      errorCount++
    } finally {
      isProcessing = false
    }
  }, 5000) // Poll every 5 seconds

  console.log(`[PrintQueue] Worker started, polling every 5 seconds`)
}

/**
 * Process print queue
 * Fetches queued jobs and processes them
 */
async function processPrintQueue(prisma, io, workerId) {
  // For now, we'll use a simple in-memory queue
  // TODO: Add PrintJob model to Prisma schema and use database queue
  
  // Check for new orders that need printing
  // This is a temporary implementation until we have PrintJob model
  const recentOrders = await prisma.order.findMany({
    where: {
      status: { in: ['confirmed', 'processing'] },
      createdAt: {
        gte: new Date(Date.now() - 5 * 60 * 1000), // Last 5 minutes
      },
    },
    take: 10,
    orderBy: { createdAt: 'desc' },
  })

  if (recentOrders.length === 0) {
    return // No jobs to process
  }

  console.log(`[PrintQueue] Found ${recentOrders.length} orders to check`)

  // Process each order (for now, just emit events)
  // In production, this would:
  // 1. Check if print job exists in queue
  // 2. Generate PDF if needed
  // 3. Send to printer
  // 4. Update job status
  // 5. Emit Socket.IO events

  for (const order of recentOrders) {
    try {
      // Emit event that order is ready for printing
      io.emit('print:order:ready', {
        orderId: order.id,
        orderNumber: order.orderNumber || order.id,
        status: order.status,
      })

      processedCount++
    } catch (error) {
      console.error(`[PrintQueue] Error processing order ${order.id}:`, error)
      errorCount++
    }
  }
}

/**
 * Stop print queue worker
 */
export function stopPrintQueueWorker() {
  if (workerInterval) {
    clearInterval(workerInterval)
    workerInterval = null
    console.log('[PrintQueue] Worker stopped')
  }
}

/**
 * Get worker statistics
 */
export function getWorkerStats() {
  return {
    active: workerInterval !== null,
    processing: isProcessing,
    processedCount,
    errorCount,
  }
}

