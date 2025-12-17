import type { Prisma } from '@prisma/client'
import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'

import prisma from '@/lib/prisma'
import { ApiError, handleApiError } from '@/lib/apiErrors'

type RouteParams = {
  params: {
    id: string
  }
}

const decimalToNumber = (value: Prisma.Decimal | number | null | undefined): number | null => {
  if (value === null || value === undefined) return null
  if (typeof value === 'number') return Number.isFinite(value) ? value : null
  return Number(value.toString())
}

export async function GET(_request: NextRequest, context: RouteParams) {
  try {
    const customerId = context.params?.id
    if (!customerId) {
      throw new ApiError(400, 'Customer id is required')
    }

    const customer = await prisma.customer.findUnique({
      where: { id: customerId },
      include: {
        priceOverrides: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                sku: true,
                price: true,
              },
            },
          },
        },
      },
    })

    if (!customer) {
      throw new ApiError(404, 'Customer not found')
    }

    const recentOrders = await prisma.order.findMany({
      where: { customerId },
      orderBy: { createdAt: 'desc' },
      take: 5,
      include: {
        items: {
          include: {
            product: {
              select: { id: true, name: true, sku: true },
            },
          },
        },
      },
    })

    const preferredBrands = await prisma.$queryRaw<
      Array<{ id: string; name: string; orders: number }>
    >`
      SELECT b."id", b."name", COUNT(*)::int AS orders
      FROM "OrderItem" oi
      JOIN "Order" o ON o."id" = oi."orderId" AND o."customerId" = ${customerId}
      JOIN "Product" p ON p."id" = oi."productId"
      LEFT JOIN "Brand" b ON b."id" = p."brandId"
      WHERE b."id" IS NOT NULL
      GROUP BY b."id"
      ORDER BY orders DESC
      LIMIT 5
    `

    return NextResponse.json({
      customer: {
        id: customer.id,
        businessName: customer.businessName,
        contactName: customer.contactName,
        email: customer.email,
        phone: customer.phone,
        address: customer.address,
        city: customer.city,
        state: customer.state,
        zipCode: customer.zipCode,
        active: customer.active,
      },
      priceOverrides: customer.priceOverrides.map((override) => ({
        id: override.id,
        productId: override.productId,
        priceCase: override.priceCase,
        product: override.product
          ? {
              id: override.product.id,
              name: override.product.name,
              sku: override.product.sku,
              listPrice: decimalToNumber(override.product.price) ?? 0,
            }
          : null,
      })),
      recentOrders: recentOrders.map((order) => ({
        id: order.id,
        total: order.total,
        createdAt: order.createdAt,
        itemCount: order.items.length,
      })),
      preferredBrands,
    })
  } catch (error) {
    return handleApiError(error, 'Failed to load customer profile')
  }
}
