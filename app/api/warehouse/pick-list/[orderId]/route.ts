/**
 * Warehouse Pick List API
 * GET /api/warehouse/pick-list/[orderId] - Generate pick list for order
 *
 * LAP W1: Final Integration - Pick List Generation
 */

import { NextRequest, NextResponse } from 'next/server'
import { buildPickList, getPickListSummary, formatPickListForPrint } from '@/warehouse/print/pickListBuilder'

// ============================================================================
// GET PICK LIST
// ============================================================================

export async function GET(
  request: NextRequest,
  { params }: { params: { orderId: string } }
) {
  try {
    const orderId = params.orderId
    const { searchParams } = new URL(request.url)
    const format = searchParams.get('format') || 'json' // 'json' | 'text'

    // Generate pick list
    const pickList = await buildPickList(orderId)

    if (!pickList) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'PICK_LIST_FAILED',
            message: `Failed to generate pick list for order ${orderId}`,
          },
        },
        { status: 404 }
      )
    }

    // Return formatted text if requested
    if (format === 'text') {
      const textBuffer = await formatPickListForPrint(pickList)
      const text = textBuffer.toString('utf-8')
      return new NextResponse(text, {
        headers: {
          'Content-Type': 'text/plain; charset=utf-8',
          'Content-Disposition': `attachment; filename="pick-list-${pickList.orderNumber || pickList.orderId}.txt"`,
        },
      })
    }

    // Return JSON summary
    return NextResponse.json({
      success: true,
      data: {
        pickList: {
          orderId: pickList.orderId,
          orderNumber: pickList.orderNumber,
          customerId: pickList.customerId,
          customerName: pickList.customerName,
          totalItems: pickList.totalItems,
          totalUnits: pickList.totalUnits,
          estimatedPickTime: pickList.estimatedPickTime,
          zones: (pickList.zones || []).map((zone) => ({
            zone: zone.zone,
            zoneName: zone.zoneName,
            totalItems: zone.totalItems,
            totalUnits: zone.totalUnits,
            estimatedPickTime: zone.estimatedPickTime,
            items: zone.items.map((item) => ({
              lineNumber: item.lineNumber,
              productName: item.productName,
              sku: item.sku,
              brand: item.brand,
              quantity: item.quantity,
              unitType: item.unitType,
              totalUnits: item.totalUnits,
              slot: item.slot,
              aisle: item.aisle,
              bin: item.bin,
            })),
          })),
          pickSequence: (pickList.pickSequence || []).map((item) => ({
            lineNumber: item.lineNumber,
            productName: item.productName,
            sku: item.sku,
            quantity: item.quantity,
            slot: item.slot,
            zone: item.zone,
          })),
          generatedAt: pickList.generatedAt?.toISOString() || pickList.createdAt.toISOString(),
        },
        summary: await getPickListSummary(orderId),
      },
    })
  } catch (error) {
    console.error(`[PickListAPI] Error generating pick list for ${params.orderId}:`, error)

    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'PICK_LIST_ERROR',
          message: error instanceof Error ? error.message : 'Failed to generate pick list',
        },
      },
      { status: 500 }
    )
  }
}
