/**
 * Print Job Queue
 * Handles queuing and retrying print jobs
 */

export interface PrintJob {
  orderId: string
  retryCount: number
  maxRetries: number
  createdAt: Date
}

export interface PrintJobResult {
  success: boolean
  orderId: string
  error?: string
}

const MAX_RETRIES = 3
const INITIAL_RETRY_DELAY = 1000 // 1 second
const MAX_RETRY_DELAY = 10000 // 10 seconds

/**
 * Calculate exponential backoff delay
 */
function getRetryDelay(retryCount: number): number {
  const delay = INITIAL_RETRY_DELAY * Math.pow(2, retryCount)
  return Math.min(delay, MAX_RETRY_DELAY)
}

/**
 * Queue a print job with retry logic
 */
export async function queuePrintJob(
  orderId: string,
  options: {
    maxRetries?: number
    onSuccess?: (orderId: string) => void
    onFailure?: (orderId: string, error: string) => void
  } = {}
): Promise<PrintJobResult> {
  const { maxRetries = MAX_RETRIES, onSuccess, onFailure } = options

  let retryCount = 0

  while (retryCount <= maxRetries) {
    try {
      const response = await fetch('/api/warehouse/print-slip', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ orderId }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }))
        throw new Error(errorData.error || `HTTP ${response.status}`)
      }

      const result: PrintJobResult = {
        success: true,
        orderId,
      }

      onSuccess?.(orderId)
      return result
    } catch (error: any) {
      retryCount++

      if (retryCount > maxRetries) {
        const result: PrintJobResult = {
          success: false,
          orderId,
          error: error?.message || 'Print job failed after max retries',
        }

        onFailure?.(orderId, result.error || 'Unknown error')
        return result
      }

      // Wait before retrying
      const delay = getRetryDelay(retryCount - 1)
      await new Promise(resolve => setTimeout(resolve, delay))
    }
  }

  // Should never reach here, but TypeScript needs a return
  return {
    success: false,
    orderId,
    error: 'Unexpected error in print job queue',
  }
}

/**
 * Queue multiple print jobs
 */
export async function queuePrintJobs(
  orderIds: string[],
  options: {
    maxRetries?: number
    onSuccess?: (orderId: string) => void
    onFailure?: (orderId: string, error: string) => void
  } = {}
): Promise<PrintJobResult[]> {
  const results = await Promise.allSettled(
    orderIds.map(orderId => queuePrintJob(orderId, options))
  )

  return results.map((result, index) => {
    if (result.status === 'fulfilled') {
      return result.value
    } else {
      return {
        success: false,
        orderId: orderIds[index],
        error: result.reason?.message || 'Unknown error',
      }
    }
  })
}

