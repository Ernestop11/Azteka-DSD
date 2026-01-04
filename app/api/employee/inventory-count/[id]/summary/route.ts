import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/employee/inventory-count/[id]/summary - Get summary report for a count session
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    // Get the count session
    const count = await prisma.inventoryCount.findUnique({
      where: { id }
    })

    if (!count) {
      return NextResponse.json(
        { error: 'Inventory count not found' },
        { status: 404 }
      )
    }

    // Get all items with product data
    const items = await prisma.inventoryCountItem.findMany({
      where: { inventoryCountId: id },
      include: {
        counter: {
          select: { id: true, firstName: true, lastName: true }
        },
        checker: {
          select: { id: true, firstName: true, lastName: true }
        }
      }
    })

    // Get product details
    const productIds = items.map(item => item.productId)
    const products = await prisma.product.findMany({
      where: { id: { in: productIds } },
      select: {
        id: true,
        name: true,
        sku: true,
        cost: true,
        price: true,
        unitsPerCase: true
      }
    })
    const productMap = new Map(products.map(p => [p.id, p]))

    // Calculate totals
    let totalCases = 0
    let totalCapitalCost = 0
    let totalCapitalSell = 0
    let totalVariance = 0
    let positiveVariance = 0
    let negativeVariance = 0

    // Status counts
    const statusCounts = {
      COUNTED: 0,
      VERIFIED: 0,
      RECOUNT_NEEDED: 0,
      CORRECTED: 0
    }

    // Counter stats
    const counterStats = new Map<string, {
      id: string
      name: string
      itemsCounted: number
      corrections: number
    }>()

    // Checker stats
    const checkerStats = new Map<string, {
      id: string
      name: string
      itemsVerified: number
      correctionsMade: number
    }>()

    // Discrepancies (items with significant variance)
    const discrepancies: Array<{
      productId: string
      productName: string
      sku: string
      expected: number
      counted: number
      variance: number
      variancePercent: number
    }> = []

    // Flagged items (need date check)
    let flaggedCount = 0

    for (const item of items) {
      const product = productMap.get(item.productId)
      if (!product) continue

      const cost = Number(product.cost || 0)
      const price = Number(product.price || 0)
      const unitsPerCase = item.unitsPerCase || product.unitsPerCase || 1

      // Calculate cases from total (for display)
      const cases = Math.floor(item.countedTotal / unitsPerCase)
      totalCases += cases

      // Capital calculations
      totalCapitalCost += item.countedTotal * cost
      totalCapitalSell += item.countedTotal * price

      // Variance
      totalVariance += item.variance
      if (item.variance > 0) positiveVariance += item.variance
      if (item.variance < 0) negativeVariance += item.variance

      // Status counts
      statusCounts[item.status as keyof typeof statusCounts]++

      // Counter stats
      if (item.counter) {
        const counterId = item.counter.id
        const counterName = `${item.counter.firstName} ${item.counter.lastName}`
        const existing = counterStats.get(counterId) || {
          id: counterId,
          name: counterName,
          itemsCounted: 0,
          corrections: 0
        }
        existing.itemsCounted++
        if (item.status === 'CORRECTED') existing.corrections++
        counterStats.set(counterId, existing)
      }

      // Checker stats
      if (item.checker) {
        const checkerId = item.checker.id
        const checkerName = `${item.checker.firstName} ${item.checker.lastName}`
        const existing = checkerStats.get(checkerId) || {
          id: checkerId,
          name: checkerName,
          itemsVerified: 0,
          correctionsMade: 0
        }
        existing.itemsVerified++
        if (item.status === 'CORRECTED') existing.correctionsMade++
        checkerStats.set(checkerId, existing)
      }

      // Check for significant variance (>5% or >10 units)
      const variancePercent = item.expectedQuantity > 0
        ? (item.variance / item.expectedQuantity) * 100
        : (item.variance !== 0 ? 100 : 0)

      if (Math.abs(variancePercent) > 5 || Math.abs(item.variance) > 10) {
        discrepancies.push({
          productId: item.productId,
          productName: product.name,
          sku: product.sku,
          expected: item.expectedQuantity,
          counted: item.countedTotal,
          variance: item.variance,
          variancePercent: Math.round(variancePercent * 10) / 10
        })
      }

      // Flagged items
      if (item.needsDateCheck) flaggedCount++
    }

    // Sort discrepancies by absolute variance
    discrepancies.sort((a, b) => Math.abs(b.variance) - Math.abs(a.variance))

    const summary = {
      count,
      totals: {
        itemsCounted: items.length,
        totalCases,
        totalCapitalCost: Math.round(totalCapitalCost * 100) / 100,
        totalCapitalSell: Math.round(totalCapitalSell * 100) / 100,
        totalVariance,
        positiveVariance,
        negativeVariance,
        flaggedForDateCheck: flaggedCount
      },
      statusCounts,
      counterStats: Array.from(counterStats.values()),
      checkerStats: Array.from(checkerStats.values()),
      discrepancies: discrepancies.slice(0, 50) // Top 50 discrepancies
    }

    return NextResponse.json({ summary })
  } catch (error) {
    console.error('Failed to generate inventory count summary:', error)
    return NextResponse.json(
      { error: 'Failed to generate summary' },
      { status: 500 }
    )
  }
}
