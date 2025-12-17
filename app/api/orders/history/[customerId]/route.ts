import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'

import prisma from '@/lib/prisma'
import { ApiError, handleApiError } from '@/lib/apiErrors'
import { loadBundleManifest } from '@/lib/bundles'
import type { TApiResponse } from '@/types/api'

type RouteParams = {
  params: {
    customerId: string
  }
}

export async function GET(_request: NextRequest, context: RouteParams) {
  try {
    const customerId = context.params?.customerId
    if (!customerId) {
      throw new ApiError(400, 'customerId is required')
    }

    const [orders, categoryMix, trendline, manifest] = await Promise.all([
      prisma.order.findMany({
        where: { customerId },
        orderBy: { createdAt: 'desc' },
        take: 25,
        include: {
          items: {
            include: {
              product: { select: { id: true, sku: true, name: true, categoryId: true } },
            },
          },
        },
      }),
      prisma.$queryRaw<Array<{ category: string; units: number }>>`
        SELECT COALESCE(c."name", 'Uncategorized') AS category, COALESCE(SUM(oi."quantity"), 0)::int AS units
        FROM "OrderItem" oi
        JOIN "Order" o ON o."id" = oi."orderId" AND o."customerId" = ${customerId}
        LEFT JOIN "Product" p ON p."id" = oi."productId"
        LEFT JOIN "Category" c ON c."id" = p."categoryId"
        WHERE o."createdAt" >= NOW() - INTERVAL '120 days'
        GROUP BY COALESCE(c."name", 'Uncategorized')
        ORDER BY units DESC
      `,
      prisma.$queryRaw<Array<{ month: string; total: number }>>`
        SELECT TO_CHAR(date_trunc('month', o."createdAt"), 'YYYY-MM') AS month,
               COALESCE(SUM(o."total"), 0)::numeric AS total
        FROM "Order" o
        WHERE o."customerId" = ${customerId}
          AND o."createdAt" >= NOW() - INTERVAL '180 days'
        GROUP BY date_trunc('month', o."createdAt")
        ORDER BY month DESC
        LIMIT 6
      `,
      loadBundleManifest(),
    ])

    const bundleMatches = orders.map((order) => {
      const orderSkus = new Set(
        order.items
          .map((item) => item.product?.sku?.toLowerCase())
          .filter(Boolean) as string[]
      )

      const bundles = manifest.bundles.filter((bundle) =>
        (bundle.triggerProducts ?? []).some((trigger) => {
          const normalized = trigger.toLowerCase().replace(/^sku:/, '')
          return orderSkus.has(normalized)
        })
      )

      return {
        orderId: order.id,
        bundles: bundles.map((bundle) => ({
          id: bundle.id,
          name: bundle.name,
          type: bundle.type,
        })),
      }
    })

    const payload = {
      orders: orders.map((order) => ({
        id: order.id,
        total: order.total,
        createdAt: order.createdAt,
        itemCount: order.items.length,
      })),
      bundleMatches,
      categoryMix,
      trendline: trendline.reverse(),
    }

    const response: TApiResponse<typeof payload> = { data: payload }
    return NextResponse.json(response)
  } catch (error) {
    return handleApiError(error, 'Failed to load order history')
  }
}
