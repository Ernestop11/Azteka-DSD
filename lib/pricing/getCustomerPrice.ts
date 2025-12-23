import prisma from '@/lib/prisma'
import { Decimal } from '@prisma/client/runtime/library'

export enum OverrideType {
  FIXED_PRICE = 'FIXED_PRICE',
  PERCENTAGE_DISCOUNT = 'PERCENTAGE_DISCOUNT',
  FIXED_DISCOUNT = 'FIXED_DISCOUNT',
  TIERED = 'TIERED',
}

export interface PriceCalculationResult {
  basePrice: number
  overridePrice: number | null
  finalPrice: number
  overrideType: OverrideType | null
  discountAmount: number
  discountPercent: number
  tierApplied: { minQuantity: number; maxQuantity: number | null } | null
  priceTierUsed: 'A' | 'B' | 'C' | null
}

/**
 * Get the effective price for a product for a specific customer
 * Checks: Price overrides → Price tiers → Standard price
 */
export async function getCustomerPrice(
  productId: string,
  customerId: string | null,
  quantity: number = 1
): Promise<PriceCalculationResult> {
  const product = await prisma.product.findUnique({
    where: { id: productId },
    select: {
      id: true,
      price: true,
      priceTierA: true,
      priceTierB: true,
      priceTierC: true,
    },
  })

  if (!product) {
    throw new Error(`Product ${productId} not found`)
  }

  const basePrice = Number(product.price)

  // If no customer, return standard price
  if (!customerId) {
    return {
      basePrice,
      overridePrice: null,
      finalPrice: basePrice,
      overrideType: null,
      discountAmount: 0,
      discountPercent: 0,
      tierApplied: null,
      priceTierUsed: null,
    }
  }

  // Get customer
  const customer = await prisma.customer.findUnique({
    where: { id: customerId },
    select: { priceTier: true },
  })

  // Check for price tier first (A/B/C)
  let tierPrice: number | null = null
  let priceTierUsed: 'A' | 'B' | 'C' | null = null
  if (customer?.priceTier === 'A' && product.priceTierA) {
    tierPrice = Number(product.priceTierA)
    priceTierUsed = 'A'
  } else if (customer?.priceTier === 'B' && product.priceTierB) {
    tierPrice = Number(product.priceTierB)
    priceTierUsed = 'B'
  } else if (customer?.priceTier === 'C' && product.priceTierC) {
    tierPrice = Number(product.priceTierC)
    priceTierUsed = 'C'
  }

  // Check for active price overrides (most specific)
  const activeOverrides = await prisma.customerPriceOverride.findMany({
    where: {
      customerId,
      productId,
      active: true,
      OR: [
        { endDate: null }, // No expiration
        { endDate: { gte: new Date() } }, // Not expired
      ],
      AND: [
        {
          OR: [
            { startDate: null }, // No start date
            { startDate: { lte: new Date() } }, // Started
          ],
        },
      ],
    },
    orderBy: [
      { minQuantity: 'desc' }, // Highest quantity first (for tiered)
    ],
  })

  // Find applicable override (considering quantity for tiered pricing)
  let applicableOverride = activeOverrides.find((override) => {
    if (override.overrideType === 'TIERED') {
      const minQty = override.minQuantity || 0
      const maxQty = override.maxQuantity || Infinity
      return quantity >= minQty && quantity <= maxQty
    }
    return !override.minQuantity || quantity >= override.minQuantity
  })

  // Calculate final price
  let finalPrice = tierPrice || basePrice
  let overridePrice: number | null = null
  let discountAmount = 0
  let discountPercent = 0
  let overrideType: OverrideType | null = null
  let tierApplied: { minQuantity: number; maxQuantity: number | null } | null = null

  if (applicableOverride) {
    overrideType = applicableOverride.overrideType as OverrideType

    switch (applicableOverride.overrideType) {
      case 'FIXED_PRICE':
        overridePrice = Number(applicableOverride.fixedPrice)
        finalPrice = overridePrice
        discountAmount = basePrice - finalPrice
        discountPercent = (discountAmount / basePrice) * 100
        break

      case 'PERCENTAGE_DISCOUNT':
        discountPercent = Number(applicableOverride.discountPercent || 0)
        discountAmount = (basePrice * discountPercent) / 100
        finalPrice = basePrice - discountAmount
        overridePrice = finalPrice
        break

      case 'FIXED_DISCOUNT':
        discountAmount = Number(applicableOverride.discountAmount || 0)
        finalPrice = basePrice - discountAmount
        overridePrice = finalPrice
        discountPercent = (discountAmount / basePrice) * 100
        break

      case 'TIERED':
        overridePrice = Number(applicableOverride.fixedPrice)
        finalPrice = overridePrice
        discountAmount = basePrice - finalPrice
        discountPercent = (discountAmount / basePrice) * 100
        tierApplied = {
          minQuantity: applicableOverride.minQuantity || 0,
          maxQuantity: applicableOverride.maxQuantity || null,
        }
        break
    }
  } else if (tierPrice) {
    // Use tier price if no override
    finalPrice = tierPrice
    discountAmount = basePrice - tierPrice
    discountPercent = (discountAmount / basePrice) * 100
  }

  return {
    basePrice,
    overridePrice,
    finalPrice: Math.max(0, finalPrice), // Ensure non-negative
    overrideType,
    discountAmount: Math.round(discountAmount * 100) / 100,
    discountPercent: Math.round(discountPercent * 100) / 100,
    tierApplied,
    priceTierUsed,
  }
}




