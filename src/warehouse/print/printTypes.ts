/**
 * Warehouse Print API Types
 * Type definitions for print endpoints and print job management
 *
 * LAP W1: Warehouse Auto-Print Engine
 */

// ============================================================================
// API REQUEST/RESPONSE TYPES
// ============================================================================

/**
 * Print slip request body
 */
export interface PrintSlipRequest {
  orderId: string
  priority?: 'low' | 'normal' | 'high' | 'urgent'
  printerId?: string  // Optional specific printer ID
  copies?: number     // Number of copies (default: 1)
  includePricing?: boolean  // Override config to show/hide pricing
}

/**
 * Print slip response
 */
export interface PrintSlipResponse {
  success: boolean
  jobId?: string
  message: string
  pdfUrl?: string  // Optional URL to download PDF
  printStatus?: 'queued' | 'printing' | 'completed' | 'failed'
  error?: {
    code: string
    message: string
    details?: unknown
  }
}

/**
 * Print job status request
 */
export interface PrintJobStatusRequest {
  jobId: string
}

/**
 * Print job status response
 */
export interface PrintJobStatusResponse {
  success: boolean
  job?: PrintJobDetails
  error?: {
    code: string
    message: string
  }
}

/**
 * Print job details
 */
export interface PrintJobDetails {
  id: string
  orderId: string
  orderNumber: string
  status: 'pending' | 'printing' | 'completed' | 'failed' | 'cancelled'
  priority: 'low' | 'normal' | 'high' | 'urgent'
  printerId?: string
  copies: number
  attemptCount: number
  maxAttempts: number
  createdAt: Date
  updatedAt: Date
  completedAt?: Date
  errorMessage?: string
  pdfUrl?: string
}

/**
 * Reprint request
 */
export interface ReprintRequest {
  orderId: string
  reason?: string
  priority?: 'low' | 'normal' | 'high' | 'urgent'
}

/**
 * Bulk print request
 */
export interface BulkPrintRequest {
  orderIds: string[]
  priority?: 'low' | 'normal' | 'high' | 'urgent'
  printerId?: string
}

/**
 * Bulk print response
 */
export interface BulkPrintResponse {
  success: boolean
  totalOrders: number
  successCount: number
  failureCount: number
  jobs: Array<{
    orderId: string
    jobId?: string
    status: 'queued' | 'failed'
    error?: string
  }>
}

// ============================================================================
// PRINT QUEUE TYPES
// ============================================================================

/**
 * Print queue entry
 */
export interface PrintQueueEntry {
  id: string
  orderId: string
  orderNumber: string
  status: 'pending' | 'printing' | 'completed' | 'failed' | 'cancelled'
  priority: 'low' | 'normal' | 'high' | 'urgent'
  printerId?: string
  copies: number
  attemptCount: number
  maxAttempts: number
  createdAt: Date
  updatedAt: Date
  scheduledFor?: Date  // For delayed printing
  lockedAt?: Date      // When worker picked it up
  lockedBy?: string    // Worker ID
  errorMessage?: string
  errorStack?: string
  metadata?: PrintJobMetadata
}

/**
 * Print job metadata
 */
export interface PrintJobMetadata {
  storeId: string
  storeName: string
  salesRepId?: string
  salesRepName?: string
  itemCount: number
  totalUnits: number
  requestedBy?: string  // User who triggered print
  requestedAt?: Date
  customNotes?: string
}

/**
 * Print queue filter options
 */
export interface PrintQueueFilters {
  status?: PrintQueueEntry['status'] | PrintQueueEntry['status'][]
  priority?: PrintQueueEntry['priority'] | PrintQueueEntry['priority'][]
  orderId?: string
  storeId?: string
  printerId?: string
  createdAfter?: Date
  createdBefore?: Date
  limit?: number
  offset?: number
  sortBy?: 'createdAt' | 'updatedAt' | 'priority' | 'status'
  sortOrder?: 'asc' | 'desc'
}

/**
 * Print queue summary
 */
export interface PrintQueueSummary {
  totalJobs: number
  pendingJobs: number
  printingJobs: number
  completedJobs: number
  failedJobs: number
  cancelledJobs: number
  oldestPendingJob?: Date
  averageCompletionTime?: number  // milliseconds
  successRate?: number  // percentage
}

// ============================================================================
// PRINTER CONFIGURATION TYPES
// ============================================================================

/**
 * Printer configuration
 */
export interface PrinterConfig {
  id: string
  name: string
  type: 'ipp' | 'cups' | 'windows' | 'network'
  url?: string  // IPP URL (e.g., ipp://192.168.1.100:631/printers/warehouse)
  host?: string
  port?: number
  queue?: string  // CUPS queue name
  isDefault?: boolean
  enabled: boolean
  location?: string  // Physical location (e.g., "Warehouse Station 2")
  capabilities?: PrinterCapabilities
  metadata?: {
    model?: string
    manufacturer?: string
    serialNumber?: string
    lastHealthCheck?: Date
    paperSize?: string
  }
}

/**
 * Printer capabilities
 */
export interface PrinterCapabilities {
  color: boolean
  duplex: boolean
  paperSizes: string[]
  maxCopies: number
  resolutionDpi?: number
}

/**
 * Printer status
 */
export interface PrinterStatus {
  id: string
  online: boolean
  ready: boolean
  errorMessage?: string
  jobsInQueue: number
  paperLow?: boolean
  tonerLow?: boolean
  lastChecked: Date
}

// ============================================================================
// IPP PRINTING TYPES
// ============================================================================

/**
 * IPP print job options
 */
export interface IppPrintOptions {
  printerUrl: string
  jobName: string
  copies?: number
  sides?: 'one-sided' | 'two-sided-long-edge' | 'two-sided-short-edge'
  orientation?: 'portrait' | 'landscape'
  mediaSize?: 'letter' | 'legal' | 'a4'
  quality?: 'draft' | 'normal' | 'high'
  colorMode?: 'monochrome' | 'color'
}

/**
 * IPP print result
 */
export interface IppPrintResult {
  success: boolean
  jobId?: number  // IPP job ID
  jobUri?: string
  jobState?: 'pending' | 'processing' | 'completed' | 'cancelled' | 'aborted'
  errorMessage?: string
  errorCode?: string
}

// ============================================================================
// AUTO-PRINT CONFIGURATION
// ============================================================================

/**
 * Auto-print settings
 */
export interface AutoPrintSettings {
  enabled: boolean
  triggers: {
    onOrderConfirmed: boolean
    onOrderPacked: boolean
    onOrderShipped: boolean
  }
  defaultPriority: 'low' | 'normal' | 'high' | 'urgent'
  defaultPrinterId?: string
  defaultCopies: number
  autoRetry: boolean
  maxRetries: number
  retryDelayMs: number
  includePricing: boolean
  filters?: {
    minOrderValue?: number  // Only auto-print if order total >= value
    maxOrderValue?: number
    storeIds?: string[]     // Only auto-print for specific stores
    excludeStoreIds?: string[]
    salesRepIds?: string[]  // Only auto-print for specific reps
  }
}

// ============================================================================
// ERROR TYPES
// ============================================================================

/**
 * Print error codes
 */
export enum PrintErrorCode {
  INVALID_ORDER_ID = 'INVALID_ORDER_ID',
  ORDER_NOT_FOUND = 'ORDER_NOT_FOUND',
  ORDER_NOT_CONFIRMED = 'ORDER_NOT_CONFIRMED',
  PRINTER_NOT_FOUND = 'PRINTER_NOT_FOUND',
  PRINTER_OFFLINE = 'PRINTER_OFFLINE',
  PDF_GENERATION_FAILED = 'PDF_GENERATION_FAILED',
  PRINT_JOB_FAILED = 'PRINT_JOB_FAILED',
  QUEUE_FULL = 'QUEUE_FULL',
  INVALID_PRIORITY = 'INVALID_PRIORITY',
  DUPLICATE_JOB = 'DUPLICATE_JOB',
  MAX_RETRIES_EXCEEDED = 'MAX_RETRIES_EXCEEDED',
  NETWORK_ERROR = 'NETWORK_ERROR',
  UNKNOWN_ERROR = 'UNKNOWN_ERROR',
}

/**
 * Print error
 */
export class PrintError extends Error {
  constructor(
    public code: PrintErrorCode,
    message: string,
    public details?: unknown
  ) {
    super(message)
    this.name = 'PrintError'
  }
}

// ============================================================================
// VALIDATION TYPES
// ============================================================================

/**
 * Print request validation result
 */
export interface PrintRequestValidation {
  valid: boolean
  errors: string[]
  warnings?: string[]
}

// ============================================================================
// EXPORT ALL TYPES
// ============================================================================

export type {
  PrintSlipRequest,
  PrintSlipResponse,
  PrintJobStatusRequest,
  PrintJobStatusResponse,
  PrintJobDetails,
  ReprintRequest,
  BulkPrintRequest,
  BulkPrintResponse,
  PrintQueueEntry,
  PrintJobMetadata,
  PrintQueueFilters,
  PrintQueueSummary,
  PrinterConfig,
  PrinterCapabilities,
  PrinterStatus,
  IppPrintOptions,
  IppPrintResult,
  AutoPrintSettings,
  PrintRequestValidation,
}

export { PrintErrorCode, PrintError }
