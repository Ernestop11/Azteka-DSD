/**
 * Warehouse Print Engine
 * Background print job processing with queue management and retry logic
 *
 * LAP W1: Warehouse Auto-Print Engine
 */

import { renderPackingSlip } from './packingSlipRenderer'
import type { PackingSlipOrder } from './packingSlipTypes'
import type {
  PrintQueueEntry,
  PrintJobMetadata,
  PrintQueueFilters,
  PrintQueueSummary,
  IppPrintOptions,
  IppPrintResult,
  AutoPrintSettings,
  PrinterConfig,
} from './printTypes'
import { PrintError, PrintErrorCode } from './printTypes'

// ============================================================================
// CONSTANTS
// ============================================================================

const DEFAULT_MAX_RETRIES = 3
const DEFAULT_RETRY_DELAY_MS = 5000  // 5 seconds
const WORKER_POLL_INTERVAL_MS = 2000  // 2 seconds
const JOB_LOCK_TIMEOUT_MS = 300000    // 5 minutes

// ============================================================================
// IN-MEMORY QUEUE (TEMPORARY - WILL BE REPLACED WITH DATABASE)
// ============================================================================

/**
 * In-memory print queue
 * TODO: Replace with database table (Prisma) once schema is defined
 */
const printQueue: Map<string, PrintQueueEntry> = new Map()

/**
 * In-memory auto-print settings
 * TODO: Replace with database/config file
 */
let autoPrintSettings: AutoPrintSettings = {
  enabled: true,
  triggers: {
    onOrderConfirmed: true,
    onOrderPacked: false,
    onOrderShipped: false,
  },
  defaultPriority: 'normal',
  defaultCopies: 1,
  autoRetry: true,
  maxRetries: DEFAULT_MAX_RETRIES,
  retryDelayMs: DEFAULT_RETRY_DELAY_MS,
  includePricing: false,
}

// ============================================================================
// QUEUE MANAGEMENT
// ============================================================================

/**
 * Queue a new print job
 */
export async function queuePrintJob(params: {
  orderId: string
  orderNumber: string
  priority?: 'low' | 'normal' | 'high' | 'urgent'
  printerId?: string
  copies?: number
  maxAttempts?: number
  metadata?: Partial<PrintJobMetadata>
}): Promise<{ jobId: string }> {
  // Generate unique job ID
  const jobId = `pj_${Date.now()}_${params.orderId}_${Math.random().toString(36).substr(2, 9)}`

  // Check for duplicate jobs (same orderId in queue)
  const existingJob = Array.from(printQueue.values()).find(
    (job) => job.orderId === params.orderId && job.status === 'pending'
  )

  if (existingJob) {
    throw new PrintError(
      PrintErrorCode.DUPLICATE_JOB,
      `Print job already queued for order ${params.orderId}`,
      { existingJobId: existingJob.id }
    )
  }

  // Create queue entry
  const entry: PrintQueueEntry = {
    id: jobId,
    orderId: params.orderId,
    orderNumber: params.orderNumber,
    status: 'pending',
    priority: params.priority || 'normal',
    printerId: params.printerId,
    copies: params.copies || 1,
    attemptCount: 0,
    maxAttempts: params.maxAttempts || DEFAULT_MAX_RETRIES,
    createdAt: new Date(),
    updatedAt: new Date(),
    metadata: params.metadata as PrintJobMetadata,
  }

  // Add to queue
  printQueue.set(jobId, entry)

  console.log(`[PrintEngine] Queued job ${jobId} for order ${params.orderNumber}`)

  return { jobId }
}

/**
 * Get print job by ID
 */
export async function getPrintJob(jobId: string): Promise<PrintQueueEntry | null> {
  return printQueue.get(jobId) || null
}

/**
 * Get all print jobs matching filters
 */
export async function getPrintJobs(filters: PrintQueueFilters = {}): Promise<PrintQueueEntry[]> {
  let jobs = Array.from(printQueue.values())

  // Filter by status
  if (filters.status) {
    const statusArray = Array.isArray(filters.status) ? filters.status : [filters.status]
    jobs = jobs.filter((job) => statusArray.includes(job.status))
  }

  // Filter by priority
  if (filters.priority) {
    const priorityArray = Array.isArray(filters.priority) ? filters.priority : [filters.priority]
    jobs = jobs.filter((job) => priorityArray.includes(job.priority))
  }

  // Filter by orderId
  if (filters.orderId) {
    jobs = jobs.filter((job) => job.orderId === filters.orderId)
  }

  // Filter by storeId (from metadata)
  if (filters.storeId) {
    jobs = jobs.filter((job) => job.metadata?.storeId === filters.storeId)
  }

  // Filter by printerId
  if (filters.printerId) {
    jobs = jobs.filter((job) => job.printerId === filters.printerId)
  }

  // Filter by date range
  if (filters.createdAfter) {
    jobs = jobs.filter((job) => job.createdAt >= filters.createdAfter!)
  }
  if (filters.createdBefore) {
    jobs = jobs.filter((job) => job.createdAt <= filters.createdBefore!)
  }

  // Sort
  const sortBy = filters.sortBy || 'createdAt'
  const sortOrder = filters.sortOrder || 'desc'

  jobs.sort((a, b) => {
    let aVal: any
    let bVal: any

    switch (sortBy) {
      case 'priority':
        const priorityOrder = { urgent: 4, high: 3, normal: 2, low: 1 }
        aVal = priorityOrder[a.priority]
        bVal = priorityOrder[b.priority]
        break
      case 'status':
        aVal = a.status
        bVal = b.status
        break
      case 'updatedAt':
        aVal = a.updatedAt.getTime()
        bVal = b.updatedAt.getTime()
        break
      case 'createdAt':
      default:
        aVal = a.createdAt.getTime()
        bVal = b.createdAt.getTime()
    }

    return sortOrder === 'asc' ? aVal - bVal : bVal - aVal
  })

  // Pagination
  if (filters.offset) {
    jobs = jobs.slice(filters.offset)
  }
  if (filters.limit) {
    jobs = jobs.slice(0, filters.limit)
  }

  return jobs
}

/**
 * Get queue summary statistics
 */
export async function getQueueSummary(): Promise<PrintQueueSummary> {
  const jobs = Array.from(printQueue.values())

  const summary: PrintQueueSummary = {
    totalJobs: jobs.length,
    pendingJobs: jobs.filter((j) => j.status === 'pending').length,
    printingJobs: jobs.filter((j) => j.status === 'printing').length,
    completedJobs: jobs.filter((j) => j.status === 'completed').length,
    failedJobs: jobs.filter((j) => j.status === 'failed').length,
    cancelledJobs: jobs.filter((j) => j.status === 'cancelled').length,
  }

  // Find oldest pending job
  const pendingJobs = jobs.filter((j) => j.status === 'pending')
  if (pendingJobs.length > 0) {
    summary.oldestPendingJob = new Date(
      Math.min(...pendingJobs.map((j) => j.createdAt.getTime()))
    )
  }

  // Calculate average completion time
  const completedJobs = jobs.filter((j) => j.status === 'completed' && j.completedAt)
  if (completedJobs.length > 0) {
    const totalTime = completedJobs.reduce(
      (sum, job) => sum + (job.completedAt!.getTime() - job.createdAt.getTime()),
      0
    )
    summary.averageCompletionTime = totalTime / completedJobs.length
  }

  // Calculate success rate
  const finishedJobs = jobs.filter((j) => j.status === 'completed' || j.status === 'failed')
  if (finishedJobs.length > 0) {
    summary.successRate = (summary.completedJobs / finishedJobs.length) * 100
  }

  return summary
}

/**
 * Update print job status
 */
export async function updatePrintJob(
  jobId: string,
  updates: Partial<PrintQueueEntry>
): Promise<PrintQueueEntry> {
  const job = printQueue.get(jobId)
  if (!job) {
    throw new PrintError(PrintErrorCode.INVALID_ORDER_ID, `Print job ${jobId} not found`)
  }

  const updatedJob: PrintQueueEntry = {
    ...job,
    ...updates,
    updatedAt: new Date(),
  }

  printQueue.set(jobId, updatedJob)

  return updatedJob
}

/**
 * Cancel a print job
 */
export async function cancelPrintJob(jobId: string): Promise<void> {
  const job = printQueue.get(jobId)
  if (!job) {
    throw new PrintError(PrintErrorCode.INVALID_ORDER_ID, `Print job ${jobId} not found`)
  }

  if (job.status === 'completed') {
    throw new PrintError(
      PrintErrorCode.PRINT_JOB_FAILED,
      `Cannot cancel completed job ${jobId}`
    )
  }

  await updatePrintJob(jobId, { status: 'cancelled' })

  console.log(`[PrintEngine] Cancelled job ${jobId}`)
}

/**
 * Delete old completed/failed jobs
 */
export async function cleanupOldJobs(olderThanMs: number = 7 * 24 * 60 * 60 * 1000): Promise<number> {
  const cutoffDate = new Date(Date.now() - olderThanMs)
  const jobs = Array.from(printQueue.values())

  let deletedCount = 0

  for (const job of jobs) {
    if (
      (job.status === 'completed' || job.status === 'failed' || job.status === 'cancelled') &&
      job.updatedAt < cutoffDate
    ) {
      printQueue.delete(job.id)
      deletedCount++
    }
  }

  console.log(`[PrintEngine] Cleaned up ${deletedCount} old jobs`)

  return deletedCount
}

// ============================================================================
// JOB PROCESSING
// ============================================================================

/**
 * Get next job to process (priority-based)
 */
async function getNextJob(): Promise<PrintQueueEntry | null> {
  const pendingJobs = await getPrintJobs({
    status: 'pending',
    sortBy: 'priority',
    sortOrder: 'desc',
    limit: 1,
  })

  return pendingJobs[0] || null
}

/**
 * Lock a job for processing
 */
async function lockJob(jobId: string, workerId: string): Promise<boolean> {
  const job = printQueue.get(jobId)
  if (!job) return false

  // Check if already locked
  if (job.lockedAt && job.lockedBy) {
    const lockAge = Date.now() - job.lockedAt.getTime()
    if (lockAge < JOB_LOCK_TIMEOUT_MS) {
      return false  // Still locked
    }
    // Lock expired, allow re-locking
  }

  await updatePrintJob(jobId, {
    status: 'printing',
    lockedAt: new Date(),
    lockedBy: workerId,
  })

  return true
}

/**
 * Unlock a job after processing
 */
async function unlockJob(jobId: string): Promise<void> {
  await updatePrintJob(jobId, {
    lockedAt: undefined,
    lockedBy: undefined,
  })
}

/**
 * Process a single print job
 */
async function processJob(
  job: PrintQueueEntry,
  order: PackingSlipOrder
): Promise<{ success: boolean; error?: string }> {
  try {
    console.log(`[PrintEngine] Processing job ${job.id} for order ${job.orderNumber}`)

    // Generate PDF
    const pdfBuffer = await renderPackingSlip(order, {
      includePricing: autoPrintSettings.includePricing,
    })

    // Send to printer
    const printResult = await sendToPrinter(pdfBuffer, {
      printerId: job.printerId,
      copies: job.copies,
      jobName: `Packing Slip - ${job.orderNumber}`,
    })

    if (!printResult.success) {
      return { success: false, error: printResult.error }
    }

    console.log(`[PrintEngine] Successfully printed job ${job.id}`)

    return { success: true }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    console.error(`[PrintEngine] Job ${job.id} failed:`, errorMessage)
    return { success: false, error: errorMessage }
  }
}

/**
 * Retry a failed job
 */
async function retryJob(job: PrintQueueEntry): Promise<void> {
  if (job.attemptCount >= job.maxAttempts) {
    console.log(`[PrintEngine] Job ${job.id} exceeded max retries (${job.maxAttempts})`)
    await updatePrintJob(job.id, {
      status: 'failed',
      errorMessage: `Max retries (${job.maxAttempts}) exceeded`,
    })
    return
  }

  // Calculate exponential backoff delay
  const backoffMultiplier = Math.pow(2, job.attemptCount)
  const delayMs = DEFAULT_RETRY_DELAY_MS * backoffMultiplier

  console.log(`[PrintEngine] Retrying job ${job.id} in ${delayMs}ms (attempt ${job.attemptCount + 1}/${job.maxAttempts})`)

  setTimeout(async () => {
    await updatePrintJob(job.id, {
      status: 'pending',
      attemptCount: job.attemptCount + 1,
      scheduledFor: new Date(Date.now() + delayMs),
    })
  }, delayMs)
}

// ============================================================================
// BACKGROUND WORKER
// ============================================================================

let workerRunning = false
let workerInterval: NodeJS.Timeout | null = null

/**
 * Process print queue (background worker)
 */
export async function processPrintQueue(workerId: string = 'default'): Promise<void> {
  if (workerRunning) {
    console.warn('[PrintEngine] Worker already running')
    return
  }

  workerRunning = true
  console.log(`[PrintEngine] Starting worker ${workerId}`)

  workerInterval = setInterval(async () => {
    try {
      // Get next job
      const job = await getNextJob()
      if (!job) return

      // Check if job is scheduled for future
      if (job.scheduledFor && job.scheduledFor > new Date()) {
        return
      }

      // Try to lock job
      const locked = await lockJob(job.id, workerId)
      if (!locked) return

      // Fetch order data (stub - will be wired later)
      const order = await fetchOrderForPrinting(job.orderId)
      if (!order) {
        await updatePrintJob(job.id, {
          status: 'failed',
          errorMessage: 'Order not found',
        })
        await unlockJob(job.id)
        return
      }

      // Process job
      const result = await processJob(job, order)

      if (result.success) {
        // Mark as completed
        await updatePrintJob(job.id, {
          status: 'completed',
          completedAt: new Date(),
        })
      } else {
        // Mark as failed and retry if enabled
        await updatePrintJob(job.id, {
          status: 'failed',
          errorMessage: result.error,
        })

        if (autoPrintSettings.autoRetry) {
          await retryJob(job)
        }
      }

      await unlockJob(job.id)
    } catch (error) {
      console.error('[PrintEngine] Worker error:', error)
    }
  }, WORKER_POLL_INTERVAL_MS)
}

/**
 * Stop background worker
 */
export function stopPrintQueue(): void {
  if (workerInterval) {
    clearInterval(workerInterval)
    workerInterval = null
  }
  workerRunning = false
  console.log('[PrintEngine] Worker stopped')
}

/**
 * Get worker status
 */
export function getWorkerStatus(): { running: boolean; workerId?: string } {
  return {
    running: workerRunning,
    workerId: workerRunning ? 'default' : undefined,
  }
}

// ============================================================================
// RETRY FAILED JOBS
// ============================================================================

/**
 * Retry all failed jobs
 */
export async function retryFailedJobs(): Promise<{ retried: number }> {
  const failedJobs = await getPrintJobs({ status: 'failed' })

  let retriedCount = 0

  for (const job of failedJobs) {
    if (job.attemptCount < job.maxAttempts) {
      await updatePrintJob(job.id, {
        status: 'pending',
        attemptCount: job.attemptCount + 1,
        errorMessage: undefined,
      })
      retriedCount++
    }
  }

  console.log(`[PrintEngine] Retried ${retriedCount} failed jobs`)

  return { retried: retriedCount }
}

// ============================================================================
// AUTO-PRINT INTEGRATION
// ============================================================================

/**
 * Auto-print packing slip when order is confirmed
 */
export async function autoPrintOnConfirm(order: PackingSlipOrder): Promise<{ jobId?: string }> {
  if (!autoPrintSettings.enabled) {
    return {}
  }

  if (!autoPrintSettings.triggers.onOrderConfirmed) {
    return {}
  }

  // Apply filters
  if (autoPrintSettings.filters) {
    const { minOrderValue, maxOrderValue, storeIds, excludeStoreIds } = autoPrintSettings.filters

    if (minOrderValue && order.totals.total < minOrderValue) {
      return {}
    }

    if (maxOrderValue && order.totals.total > maxOrderValue) {
      return {}
    }

    if (storeIds && !storeIds.includes(order.store.id)) {
      return {}
    }

    if (excludeStoreIds && excludeStoreIds.includes(order.store.id)) {
      return {}
    }
  }

  console.log(`[PrintEngine] Auto-printing packing slip for order ${order.orderNumber}`)

  const { jobId } = await queuePrintJob({
    orderId: order.orderId,
    orderNumber: order.orderNumber,
    priority: autoPrintSettings.defaultPriority,
    printerId: autoPrintSettings.defaultPrinterId,
    copies: autoPrintSettings.defaultCopies,
    metadata: {
      storeId: order.store.id,
      storeName: order.store.name,
      salesRepName: order.salesRep,
      itemCount: order.totals.itemCount,
      totalUnits: order.totals.totalUnits,
    },
  })

  return { jobId }
}

/**
 * Get auto-print settings
 */
export function getAutoPrintSettings(): AutoPrintSettings {
  return { ...autoPrintSettings }
}

/**
 * Update auto-print settings
 */
export function updateAutoPrintSettings(updates: Partial<AutoPrintSettings>): void {
  autoPrintSettings = {
    ...autoPrintSettings,
    ...updates,
  }
  console.log('[PrintEngine] Updated auto-print settings')
}

// ============================================================================
// STUB FUNCTIONS (TO BE WIRED LATER)
// ============================================================================

/**
 * Fetch order for printing
 * TODO: Wire to actual database
 */
async function fetchOrderForPrinting(orderId: string): Promise<PackingSlipOrder | null> {
  console.warn(`[STUB] fetchOrderForPrinting(${orderId}) - Not yet wired`)
  return null
}

/**
 * Send PDF to printer
 * TODO: Wire to actual printer
 */
async function sendToPrinter(
  pdfBuffer: Buffer,
  options: {
    printerId?: string
    copies: number
    jobName: string
  }
): Promise<{ success: boolean; jobId?: string; error?: string }> {
  console.warn('[STUB] sendToPrinter() - Not yet wired')
  return { success: true, jobId: `stub-${Date.now()}` }
}

/**
 * Get printer configuration
 * TODO: Wire to actual config
 */
async function getPrinterConfig(printerId: string): Promise<PrinterConfig | null> {
  console.warn(`[STUB] getPrinterConfig(${printerId}) - Not yet wired`)
  return null
}

/**
 * Get default printer
 * TODO: Wire to actual config
 */
async function getDefaultPrinter(): Promise<PrinterConfig | null> {
  console.warn('[STUB] getDefaultPrinter() - Not yet wired')
  return null
}

// ============================================================================
// EXPORTS
// ============================================================================

export const printEngine = {
  // Queue management
  queuePrintJob,
  getPrintJob,
  getPrintJobs,
  getQueueSummary,
  updatePrintJob,
  cancelPrintJob,
  cleanupOldJobs,

  // Job processing
  processPrintQueue,
  stopPrintQueue,
  getWorkerStatus,
  retryFailedJobs,

  // Auto-print
  autoPrintOnConfirm,
  getAutoPrintSettings,
  updateAutoPrintSettings,
}

export default printEngine
