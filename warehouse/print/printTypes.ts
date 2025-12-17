/**
 * Print Types
 * Type definitions for print slip functionality
 */

export type PrintErrorCode =
  | 'VALIDATION_ERROR'
  | 'ORDER_NOT_FOUND'
  | 'ORDER_NOT_CONFIRMED'
  | 'PRINTER_NOT_FOUND'
  | 'PRINTER_OFFLINE'
  | 'PDF_GENERATION_FAILED'
  | 'PRINT_JOB_FAILED'
  | 'NETWORK_ERROR'
  | 'QUEUE_FULL'
  | 'DUPLICATE_JOB'
  | 'MAX_RETRIES_EXCEEDED'
  | 'UNKNOWN_ERROR'

export interface PrintSlipRequest {
  orderId: string
  priority?: 'low' | 'normal' | 'high' | 'urgent'
  printerId?: string
  copies?: number
  includePricing?: boolean
}

export interface PrintSlipResponse {
  success: boolean
  jobId?: string
  message?: string
  printStatus?: 'queued' | 'printing' | 'completed' | 'failed'
  error?: {
    code: PrintErrorCode
    message: string
    details?: any
  }
}

export class PrintError extends Error {
  constructor(
    public code: PrintErrorCode,
    message: string,
    public details?: any
  ) {
    super(message)
    this.name = 'PrintError'
  }
}

// Additional types for print queue UI (if needed)
export interface PrintQueueEntry {
  id?: string
  jobId: string
  orderId: string
  orderNumber?: string
  status: 'queued' | 'printing' | 'completed' | 'failed' | 'cancelled'
  priority: 'low' | 'normal' | 'high' | 'urgent'
  createdAt: Date | string
  updatedAt?: Date | string
  completedAt?: Date | string
  scheduledFor?: Date | string
  lockedBy?: string
  lockedAt?: Date | string
  error?: string
  errorMessage?: string
  attemptCount?: number
  maxAttempts?: number
  copies?: number
  printerId?: string
  metadata?: Record<string, any>
}

export interface PrintQueueSummary {
  total?: number
  queued?: number
  printing?: number
  completed?: number
  failed?: number
  // Alternative naming for compatibility
  totalJobs?: number
  pendingJobs?: number
  printingJobs?: number
  completedJobs?: number
  failedJobs?: number
  cancelledJobs?: number
  successRate?: number
  averageCompletionTime?: number
  oldestPendingJob?: Date
}

export interface PrintQueueFilters {
  status?: PrintQueueEntry['status']
  priority?: PrintQueueEntry['priority']
  orderId?: string
  limit?: number
  offset?: number
  sortBy?: 'createdAt' | 'priority' | 'status'
  sortOrder?: 'asc' | 'desc'
}

