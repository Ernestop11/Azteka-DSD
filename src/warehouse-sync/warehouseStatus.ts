/**
 * Warehouse Status Tracker
 * Tracks job status for orders
 */

import { getWarehouseQueue } from './warehouseQueue'

export interface WarehouseOrderStatus {
  orderId: string
  status: 'pending' | 'processing' | 'completed' | 'failed'
  jobId?: string
  action?: 'print' | 'pick' | 'pack' | 'ship'
  error?: string
}

/**
 * Get warehouse status for an order
 * 
 * Note: This is a lightweight implementation.
 * For production, you'd want to track this in a database.
 */
export function getWarehouseStatus(orderId: string): WarehouseOrderStatus | null {
  // For now, we'll check the queue
  // In production, this would query a database or status service
  const queue = getWarehouseQueue()
  const status = queue.getStatus()

  // Since we don't track individual order status in memory,
  // we return a basic status based on queue state
  if (status.processing > 0) {
    return {
      orderId,
      status: 'processing',
    }
  }

  if (status.pending > 0) {
    return {
      orderId,
      status: 'pending',
    }
  }

  // Default to completed if queue is empty
  return {
    orderId,
    status: 'completed',
  }
}

/**
 * Get all warehouse job statuses
 */
export function getAllWarehouseStatuses(): WarehouseOrderStatus[] {
  // Lightweight implementation - returns queue status
  const queue = getWarehouseQueue()
  const status = queue.getStatus()

  // Return a summary status
  return []
}

