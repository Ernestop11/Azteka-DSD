import { NextRequest, NextResponse } from 'next/server'
import {
  testPrintConnection,
  printPickingList,
  getAvailablePrinters,
  PRINTER_CONFIG,
} from '@/lib/services/autoPrint'

/**
 * GET /api/admin/print
 * Get printer status and available printers
 */
export async function GET() {
  try {
    const printers = await getAvailablePrinters()

    return NextResponse.json({
      data: {
        configured: PRINTER_CONFIG,
        availablePrinters: printers,
        targetPrinterFound: printers.some((p) =>
          p.toLowerCase().includes('hp') && p.toLowerCase().includes('m281')
        ),
      },
    })
  } catch (error) {
    console.error('[GET /api/admin/print] Error:', error)
    return NextResponse.json(
      { error: 'Failed to get printer status' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/admin/print
 * Send a print job
 *
 * Actions:
 * - test: Send a test page
 * - picking-list: Print picking list for an order
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, orderId, priority = 'NORMAL', copies = 1 } = body

    switch (action) {
      case 'test': {
        const result = await testPrintConnection()
        return NextResponse.json({
          data: {
            action: 'test',
            ...result,
          },
        })
      }

      case 'picking-list': {
        if (!orderId) {
          return NextResponse.json(
            { error: 'orderId is required for picking-list' },
            { status: 400 }
          )
        }

        const result = await printPickingList(orderId, priority, copies)
        return NextResponse.json({
          data: {
            action: 'picking-list',
            orderId,
            ...result,
          },
        })
      }

      default:
        return NextResponse.json(
          { error: 'Invalid action. Use: test, picking-list' },
          { status: 400 }
        )
    }
  } catch (error) {
    console.error('[POST /api/admin/print] Error:', error)
    return NextResponse.json(
      { error: 'Print job failed' },
      { status: 500 }
    )
  }
}
