/**
 * Warehouse Sync Engine
 * Lightweight engine for warehouse operations
 */

import { getWarehouseQueue } from './warehouseQueue'
import type { WarehouseJob } from './warehouseQueue'
import { triggerPrint } from '@/lib/print/triggerPrint'

/**
 * Initialize warehouse sync engine
 */
export function initializeWarehouseSync() {
  const queue = getWarehouseQueue()

  // Set up job processor
  queue.setProcessor(async (job: WarehouseJob) => {
    switch (job.action) {
      case 'print':
        await handlePrintJob(job)
        break
      case 'pick':
        // Future: handle pick job
        console.log('[Warehouse] Pick job not yet implemented:', job.orderId)
        break
      case 'pack':
        // Future: handle pack job
        console.log('[Warehouse] Pack job not yet implemented:', job.orderId)
        break
      case 'ship':
        // Future: handle ship job
        console.log('[Warehouse] Ship job not yet implemented:', job.orderId)
        break
      default:
        throw new Error(`Unknown warehouse action: ${job.action}`)
    }
  })
}

/**
 * Handle print job
 */
async function handlePrintJob(job: WarehouseJob): Promise<void> {
  const success = await triggerPrint(job.orderId, {
    onSuccess: (orderId) => {
      console.log(`[Warehouse] Print job completed for order ${orderId}`)
    },
    onFailure: (orderId, error) => {
      console.error(`[Warehouse] Print job failed for order ${orderId}:`, error)
      throw new Error(error)
    },
  })

  if (!success) {
    throw new Error('Print job failed')
  }
}

/**
 * Queue a warehouse job
 */
export function queueWarehouseJob(
  orderId: string,
  action: 'print' | 'pick' | 'pack' | 'ship',
  payload?: Record<string, any>
): string {
  const queue = getWarehouseQueue()
  return queue.enqueue({
    orderId,
    action,
    payload,
    maxRetries: 3,
  })
}

/**
 * Get warehouse queue status
 */
export function getWarehouseQueueStatus() {
  const queue = getWarehouseQueue()
  return queue.getStatus()
}

// Initialize on module load
if (typeof window !== 'undefined') {
  initializeWarehouseSync()
}

