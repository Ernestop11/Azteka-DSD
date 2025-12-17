/**
 * Warehouse Print Slip API Endpoint
 * POST /api/warehouse/print-slip
 *
 * LAP W1: Warehouse Auto-Print Engine
 */

import { NextRequest, NextResponse } from 'next/server'
import { renderPackingSlip } from '@/warehouse/print/packingSlipRenderer'
import type { PackingSlipOrder } from '@/warehouse/print/packingSlipTypes'
import type {
  PrintSlipRequest,
  PrintSlipResponse,
  PrintErrorCode,
} from '@/warehouse/print/printTypes'
import { PrintError } from '@/warehouse/print/printTypes'
import prisma from '@/lib/prisma'
import { buildPrintPayload, validatePayloadShape } from '@/warehouse/print/orderMapper'

// ============================================================================
// CONSTANTS
// ============================================================================

const MAX_COPIES = 10
const DEFAULT_COPIES = 1
const VALID_PRIORITIES = ['low', 'normal', 'high', 'urgent'] as const

// ============================================================================
// VALIDATION
// ============================================================================

/**
 * Validate print slip request
 */
function validateRequest(body: unknown): {
  valid: boolean
  errors: string[]
  data?: PrintSlipRequest
} {
  const errors: string[] = []

  // Check body exists
  if (!body || typeof body !== 'object') {
    return { valid: false, errors: ['Request body is required'] }
  }

  const req = body as Partial<PrintSlipRequest>

  // Validate orderId
  if (!req.orderId || typeof req.orderId !== 'string') {
    errors.push('orderId is required and must be a string')
  } else if (req.orderId.trim().length === 0) {
    errors.push('orderId cannot be empty')
  }

  // Validate priority (optional)
  if (req.priority && !VALID_PRIORITIES.includes(req.priority)) {
    errors.push(`priority must be one of: ${VALID_PRIORITIES.join(', ')}`)
  }

  // Validate copies (optional)
  if (req.copies !== undefined) {
    if (typeof req.copies !== 'number' || req.copies < 1) {
      errors.push('copies must be a positive number')
    } else if (req.copies > MAX_COPIES) {
      errors.push(`copies cannot exceed ${MAX_COPIES}`)
    }
  }

  // Validate printerId (optional)
  if (req.printerId !== undefined && typeof req.printerId !== 'string') {
    errors.push('printerId must be a string')
  }

  // Validate includePricing (optional)
  if (req.includePricing !== undefined && typeof req.includePricing !== 'boolean') {
    errors.push('includePricing must be a boolean')
  }

  if (errors.length > 0) {
    return { valid: false, errors }
  }

  return {
    valid: true,
    errors: [],
    data: {
      orderId: req.orderId!.trim(),
      priority: req.priority || 'normal',
      printerId: req.printerId,
      copies: req.copies || DEFAULT_COPIES,
      includePricing: req.includePricing,
    },
  }
}

// ============================================================================
// ORDER FETCHING (INTEGRATED WITH ORDER MAPPER)
// ============================================================================

/**
 * Fetch order by ID and build print payload
 * Uses orderMapper.ts for normalized order → packing slip transformation
 */
async function fetchOrder(orderId: string): Promise<PackingSlipOrder | null> {
  try {
    // Use centralized order mapper
    const payload = await buildPrintPayload(orderId)

    if (!payload) {
      console.warn(`[PrintSlip] Failed to build payload for order ${orderId}`)
      return null
    }

    // Validate payload shape
    const validation = validatePayloadShape(payload)
    if (!validation.valid) {
      console.error(`[PrintSlip] Invalid payload shape:`, validation.errors)
      return null
    }

    console.log(`[PrintSlip] Successfully built payload for order ${payload.orderNumber}`)
    return payload
  } catch (error) {
    console.error(`[PrintSlip] Error fetching order ${orderId}:`, error)
    return null
  }
}

// ============================================================================
// PRINTING (STUB - TO BE WIRED LATER)
// ============================================================================

/**
 * Send PDF to printer via IPP
 * TODO: Wire this to actual printer once infrastructure is set up
 */
async function sendToPrinter(
  pdfBuffer: Buffer,
  options: {
    printerId?: string
    copies: number
    jobName: string
  }
): Promise<{ success: boolean; jobId?: string; error?: string }> {
  // STUB: This will be replaced with actual IPP printing

  // Example of what this will look like:
  // const printer = options.printerId
  //   ? await getPrinterConfig(options.printerId)
  //   : await getDefaultPrinter()
  //
  // if (!printer) {
  //   return { success: false, error: 'Printer not found' }
  // }
  //
  // const ippClient = new IppClient(printer.url)
  // const result = await ippClient.printJob({
  //   data: pdfBuffer,
  //   copies: options.copies,
  //   jobName: options.jobName,
  // })
  //
  // return {
  //   success: result.statusCode === 'successful-ok',
  //   jobId: result.jobId?.toString(),
  //   error: result.error,
  // }

  console.warn('[STUB] sendToPrinter() - Not yet wired to actual printer')

  // Simulate success for testing
  return {
    success: true,
    jobId: `stub-job-${Date.now()}`,
  }
}

// ============================================================================
// PRINT JOB QUEUE (STUB - TO BE IMPLEMENTED IN PHASE 3)
// ============================================================================

/**
 * Queue print job for background processing
 * TODO: Implement in Phase 3
 */
async function queuePrintJob(params: {
  orderId: string
  priority: 'low' | 'normal' | 'high' | 'urgent'
  printerId?: string
  copies: number
  pdfBuffer?: Buffer
}): Promise<{ jobId: string }> {
  // STUB: This will be implemented in Phase 3
  // Will create entry in print queue database table

  console.warn('[STUB] queuePrintJob() - Will be implemented in Phase 3')

  return {
    jobId: `job-${Date.now()}-${params.orderId}`,
  }
}

// ============================================================================
// MAIN HANDLER
// ============================================================================

/**
 * POST /api/warehouse/print-slip
 * Generate and print packing slip for an order
 */
export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body = await request.json()

    // Validate request
    const validation = validateRequest(body)
    if (!validation.valid) {
      const response: PrintSlipResponse = {
        success: false,
        message: 'Invalid request',
        error: {
          code: 'VALIDATION_ERROR',
          message: validation.errors.join(', '),
          details: validation.errors,
        },
      }
      return NextResponse.json(response, { status: 400 })
    }

    const req = validation.data!

    // Fetch order
    const order = await fetchOrder(req.orderId)
    if (!order) {
      throw new PrintError(
        'ORDER_NOT_FOUND' as PrintErrorCode,
        `Order ${req.orderId} not found`
      )
    }

    // Check order status (must be confirmed)
    if (order.status === 'pending') {
      throw new PrintError(
        'ORDER_NOT_CONFIRMED' as PrintErrorCode,
        `Order ${req.orderId} is not yet confirmed`
      )
    }

    // Generate PDF
    let pdfBuffer: Buffer
    try {
      pdfBuffer = await renderPackingSlip(order, {
        includePricing: req.includePricing,
      })
    } catch (error) {
      throw new PrintError(
        'PDF_GENERATION_FAILED' as PrintErrorCode,
        'Failed to generate packing slip PDF',
        error
      )
    }

    // Queue print job (creates job ID)
    const { jobId } = await queuePrintJob({
      orderId: req.orderId,
      priority: req.priority || 'normal',
      printerId: req.printerId,
      copies: req.copies || DEFAULT_COPIES,
      pdfBuffer,
    })

    // Notify Express worker to process the job
    // Worker will handle actual printing in background
    const workerUrl = process.env.WORKER_URL || 'http://localhost:3003'
    fetch(`${workerUrl}/api/queue/notify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jobId,
        orderId: req.orderId,
        orderNumber: order.orderNumber || order.orderId,
        priority: req.priority || 'normal',
        printerId: req.printerId,
        copies: req.copies || DEFAULT_COPIES,
      }),
    }).catch((error) => {
      console.error('[PrintSlip] Failed to notify worker:', error)
      // Job is still queued, worker will pick it up on next poll
    })

    // Return success response
    const response: PrintSlipResponse = {
      success: true,
      jobId,
      message: `Packing slip queued for order ${order.orderNumber}`,
      printStatus: 'queued',
    }

    return NextResponse.json(response, { status: 200 })
  } catch (error) {
    // Handle known errors
    if (error instanceof PrintError) {
      const response: PrintSlipResponse = {
        success: false,
        message: error.message,
        error: {
          code: error.code,
          message: error.message,
          details: error.details,
        },
      }

      const statusCode = getStatusCodeForError(error.code)
      return NextResponse.json(response, { status: statusCode })
    }

    // Handle unknown errors
    console.error('Unexpected error in print-slip endpoint:', error)

    const response: PrintSlipResponse = {
      success: false,
      message: 'Internal server error',
      error: {
        code: 'UNKNOWN_ERROR',
        message: error instanceof Error ? error.message : 'Unknown error occurred',
      },
    }

    return NextResponse.json(response, { status: 500 })
  }
}

// ============================================================================
// UTILITIES
// ============================================================================

/**
 * Map error code to HTTP status code
 */
function getStatusCodeForError(code: string): number {
  switch (code) {
    case 'INVALID_ORDER_ID':
    case 'INVALID_PRIORITY':
      return 400
    case 'ORDER_NOT_FOUND':
    case 'PRINTER_NOT_FOUND':
      return 404
    case 'ORDER_NOT_CONFIRMED':
    case 'PRINTER_OFFLINE':
    case 'QUEUE_FULL':
    case 'DUPLICATE_JOB':
      return 409
    case 'PDF_GENERATION_FAILED':
    case 'PRINT_JOB_FAILED':
    case 'NETWORK_ERROR':
    case 'MAX_RETRIES_EXCEEDED':
      return 500
    default:
      return 500
  }
}

// ============================================================================
// HEALTH CHECK (GET)
// ============================================================================

/**
 * GET /api/warehouse/print-slip
 * Health check endpoint
 */
export async function GET() {
  return NextResponse.json({
    status: 'ok',
    endpoint: '/api/warehouse/print-slip',
    methods: ['POST'],
    version: '1.0.0',
  })
}
