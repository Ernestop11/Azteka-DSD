/**
 * Auto Pick-List Builder
 * Generates optimized warehouse picking sequences
 *
 * LAP W1: Final Integration - Warehouse Pick List Algorithm
 */

import prisma from '@/lib/prisma'

// ============================================================================
// TYPES
// ============================================================================

export interface PickListItem {
  lineNumber: number
  productId: string
  productName: string
  sku: string
  brand?: string
  quantity: number
  unitType: string
  unitsPerCase: number
  totalUnits: number
  slot: string
  zone: string
  aisle?: string
  bin?: string
  notes?: string
}

export interface PickZone {
  zone: string
  zoneName: string
  items: PickListItem[]
  totalItems: number
  totalUnits: number
  estimatedPickTime: number // seconds
}

export interface PickList {
  orderId: string
  orderNumber: string
  customerId: string
  customerName: string
  totalItems: number
  totalUnits: number
  estimatedPickTime: number // seconds
  zones: PickZone[]
  pickSequence: PickListItem[] // Optimized sequence
  generatedAt: Date
}

// ============================================================================
// WAREHOUSE LAYOUT CONFIGURATION
// ============================================================================

/**
 * Warehouse zone definitions
 * TODO: Move to database configuration
 */
const WAREHOUSE_ZONES = {
  A: { name: 'Beverages / Bebidas', avgPickTime: 30 },
  B: { name: 'Snacks / Botanas', avgPickTime: 25 },
  C: { name: 'Candy / Dulces', avgPickTime: 20 },
  D: { name: 'Household / Hogar', avgPickTime: 35 },
  E: { name: 'Seasonal / Temporada', avgPickTime: 40 },
  F: { name: 'Bulk / Mayoreo', avgPickTime: 45 },
} as const

/**
 * Category to zone mapping
 * TODO: Replace with product.warehouseZone field
 */
const CATEGORY_TO_ZONE: Record<string, keyof typeof WAREHOUSE_ZONES> = {
  'Beverages': 'A',
  'Sodas': 'A',
  'Water': 'A',
  'Juice': 'A',
  'Snacks': 'B',
  'Chips': 'B',
  'Cookies': 'B',
  'Candy': 'C',
  'Chocolate': 'C',
  'Gum': 'C',
  'Household': 'D',
  'Cleaning': 'D',
  'Personal Care': 'D',
  'Seasonal': 'E',
  'Bulk': 'F',
}

// ============================================================================
// PICK LIST GENERATION
// ============================================================================

/**
 * Build pick list from order ID
 */
export async function buildPickList(orderId: string): Promise<PickList | null> {
  try {
    // Fetch order with full details
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        customer: true,
        items: {
          include: {
            product: {
              include: {
                brand: true,
                category: true,
              },
            },
          },
          orderBy: {
            // Order by product name for initial grouping
            product: {
              name: 'asc',
            },
          },
        },
      },
    })

    if (!order) {
      console.warn(`[PickList] Order ${orderId} not found`)
      return null
    }

    if (order.items.length === 0) {
      console.warn(`[PickList] Order ${orderId} has no items`)
      return null
    }

    // Map items to pick list items
    const pickItems: PickListItem[] = order.items.map((item, index) => {
      const slot = generateSlotLocation(item.product, index)
      const zone = getProductZone(item.product)

      return {
        lineNumber: index + 1,
        productId: item.productId,
        productName: item.product.name,
        sku: item.product.sku,
        brand: item.product.brand?.name,
        quantity: item.quantity,
        unitType: 'case',
        unitsPerCase: item.product.unitsPerCase || 1,
        totalUnits: item.quantity * (item.product.unitsPerCase || 1),
        slot: slot.full,
        zone: zone,
        aisle: slot.aisle,
        bin: slot.bin,
      }
    })

    // Group by zone
    const zones = groupByZone(pickItems)

    // Generate optimized pick sequence
    const pickSequence = optimizePickSequence(pickItems)

    // Calculate totals
    const totalItems = pickItems.length
    const totalUnits = pickItems.reduce((sum, item) => sum + item.totalUnits, 0)
    const estimatedPickTime = calculatePickTime(zones)

    return {
      orderId: order.id,
      orderNumber: formatOrderNumber(order.id, order.createdAt),
      customerId: order.customerId,
      customerName: order.customer.businessName || order.customer.contactName,
      totalItems,
      totalUnits,
      estimatedPickTime,
      zones,
      pickSequence,
      generatedAt: new Date(),
    }
  } catch (error) {
    console.error(`[PickList] Error building pick list for ${orderId}:`, error)
    return null
  }
}

// ============================================================================
// ZONE GROUPING
// ============================================================================

/**
 * Group pick items by warehouse zone
 */
function groupByZone(items: PickListItem[]): PickZone[] {
  const zoneMap = new Map<string, PickListItem[]>()

  // Group items by zone
  items.forEach((item) => {
    const existing = zoneMap.get(item.zone) || []
    existing.push(item)
    zoneMap.set(item.zone, existing)
  })

  // Convert to PickZone array
  const zones: PickZone[] = []

  zoneMap.forEach((zoneItems, zoneCode) => {
    const zoneConfig = WAREHOUSE_ZONES[zoneCode as keyof typeof WAREHOUSE_ZONES]
    const totalItems = zoneItems.length
    const totalUnits = zoneItems.reduce((sum, item) => sum + item.totalUnits, 0)

    zones.push({
      zone: zoneCode,
      zoneName: zoneConfig?.name || `Zone ${zoneCode}`,
      items: sortItemsBySlot(zoneItems),
      totalItems,
      totalUnits,
      estimatedPickTime: (zoneConfig?.avgPickTime || 30) * totalItems,
    })
  })

  // Sort zones alphabetically
  return zones.sort((a, b) => a.zone.localeCompare(b.zone))
}

/**
 * Sort items by slot location within zone
 */
function sortItemsBySlot(items: PickListItem[]): PickListItem[] {
  return items.sort((a, b) => {
    // Sort by aisle, then bin
    if (a.aisle !== b.aisle) {
      return (a.aisle || '').localeCompare(b.aisle || '')
    }
    return (a.bin || '').localeCompare(b.bin || '')
  })
}

// ============================================================================
// PICK SEQUENCE OPTIMIZATION
// ============================================================================

/**
 * Optimize pick sequence for minimal travel distance
 * Uses zone-based traversal with serpentine path
 */
function optimizePickSequence(items: PickListItem[]): PickListItem[] {
  // Group by zone
  const zones = new Map<string, PickListItem[]>()
  items.forEach((item) => {
    const existing = zones.get(item.zone) || []
    existing.push(item)
    zones.set(item.zone, existing)
  })

  // Sort zones alphabetically (A → F)
  const sortedZones = Array.from(zones.keys()).sort()

  // Build serpentine path through zones
  const sequence: PickListItem[] = []
  let reverse = false

  sortedZones.forEach((zone) => {
    const zoneItems = zones.get(zone) || []

    // Sort items by slot
    const sorted = sortItemsBySlot(zoneItems)

    // Reverse every other zone for serpentine path
    if (reverse) {
      sorted.reverse()
    }

    sequence.push(...sorted)
    reverse = !reverse
  })

  return sequence
}

// ============================================================================
// TIME ESTIMATION
// ============================================================================

/**
 * Calculate estimated pick time in seconds
 */
function calculatePickTime(zones: PickZone[]): number {
  // Base time per zone
  const zoneTransitionTime = 60 // 60 seconds to move between zones

  // Sum all zone pick times
  const totalZoneTime = zones.reduce((sum, zone) => sum + zone.estimatedPickTime, 0)

  // Add zone transition time
  const totalTransitionTime = Math.max(0, zones.length - 1) * zoneTransitionTime

  return totalZoneTime + totalTransitionTime
}

/**
 * Format pick time for display
 */
export function formatPickTime(seconds: number): string {
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60

  if (minutes === 0) {
    return `${remainingSeconds}s`
  }

  if (remainingSeconds === 0) {
    return `${minutes}m`
  }

  return `${minutes}m ${remainingSeconds}s`
}

// ============================================================================
// LOCATION UTILITIES
// ============================================================================

/**
 * Get product warehouse zone
 */
function getProductZone(product: any): string {
  // Try category mapping first
  if (product.category?.name) {
    const zone = CATEGORY_TO_ZONE[product.category.name]
    if (zone) return zone
  }

  // Default to zone A
  return 'A'
}

/**
 * Generate slot location for product
 */
function generateSlotLocation(
  product: any,
  index: number
): { full: string; zone: string; aisle: string; bin: string } {
  const zone = getProductZone(product)

  // Generate aisle (1-9) and bin (01-99)
  const aisle = String(Math.floor(index / 10) + 1)
  const bin = String((index % 10) + 1).padStart(2, '0')

  return {
    full: `${zone}${aisle}-${bin}`,
    zone,
    aisle,
    bin,
  }
}

/**
 * Format order number
 */
function formatOrderNumber(orderId: string, createdAt: Date): string {
  const date = new Date(createdAt)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const shortId = orderId.substring(0, 8).toUpperCase()

  return `ORD-${year}${month}${day}-${shortId}`
}

// ============================================================================
// PICK LIST FORMATTING
// ============================================================================

/**
 * Format pick list for printing
 */
export function formatPickListForPrint(pickList: PickList): string {
  const lines: string[] = []

  // Header
  lines.push('='.repeat(80))
  lines.push(`PICK LIST / LISTA DE RECOLECCIÓN`)
  lines.push('='.repeat(80))
  lines.push('')
  lines.push(`Order / Pedido: ${pickList.orderNumber}`)
  lines.push(`Customer / Cliente: ${pickList.customerName}`)
  lines.push(`Total Items / Artículos: ${pickList.totalItems}`)
  lines.push(`Total Units / Unidades: ${pickList.totalUnits}`)
  lines.push(`Est. Time / Tiempo Est.: ${formatPickTime(pickList.estimatedPickTime)}`)
  lines.push(`Generated / Generado: ${pickList.generatedAt.toLocaleString()}`)
  lines.push('')

  // Zone breakdown
  lines.push('='.repeat(80))
  lines.push('PICK BY ZONE / RECOLECTAR POR ZONA')
  lines.push('='.repeat(80))
  lines.push('')

  pickList.zones.forEach((zone) => {
    lines.push(`Zone ${zone.zone}: ${zone.zoneName}`)
    lines.push(`Items: ${zone.totalItems} | Units: ${zone.totalUnits} | Time: ${formatPickTime(zone.estimatedPickTime)}`)
    lines.push('-'.repeat(80))

    zone.items.forEach((item) => {
      lines.push(
        `  [${item.slot}] ${item.productName} (${item.sku})` +
        ` - ${item.quantity} ${item.unitType} (${item.totalUnits} units)`
      )
    })

    lines.push('')
  })

  // Optimized sequence
  lines.push('='.repeat(80))
  lines.push('OPTIMIZED PICK SEQUENCE / SECUENCIA OPTIMIZADA')
  lines.push('='.repeat(80))
  lines.push('')

  pickList.pickSequence.forEach((item, index) => {
    lines.push(
      `${String(index + 1).padStart(3, ' ')}. [${item.slot}] ${item.productName}` +
      ` - ${item.quantity} ${item.unitType}`
    )
  })

  return lines.join('\n')
}

/**
 * Get pick list summary for API responses
 */
export function getPickListSummary(pickList: PickList) {
  return {
    orderId: pickList.orderId,
    orderNumber: pickList.orderNumber,
    customerName: pickList.customerName,
    totalItems: pickList.totalItems,
    totalUnits: pickList.totalUnits,
    estimatedPickTime: pickList.estimatedPickTime,
    estimatedPickTimeFormatted: formatPickTime(pickList.estimatedPickTime),
    zones: pickList.zones.map((zone) => ({
      zone: zone.zone,
      zoneName: zone.zoneName,
      items: zone.totalItems,
      units: zone.totalUnits,
      time: formatPickTime(zone.estimatedPickTime),
    })),
    generatedAt: pickList.generatedAt,
  }
}

// ============================================================================
// BATCH OPERATIONS
// ============================================================================

/**
 * Build pick lists for multiple orders
 */
export async function buildBatchPickLists(orderIds: string[]): Promise<PickList[]> {
  const pickLists: PickList[] = []

  for (const orderId of orderIds) {
    const pickList = await buildPickList(orderId)
    if (pickList) {
      pickLists.push(pickList)
    }
  }

  return pickLists
}

/**
 * Consolidate multiple pick lists into one
 * Useful for batch picking
 */
export function consolidatePickLists(pickLists: PickList[]): PickList {
  // Combine all items
  const allItems: PickListItem[] = []
  const orderNumbers: string[] = []

  pickLists.forEach((pickList) => {
    orderNumbers.push(pickList.orderNumber)
    pickList.pickSequence.forEach((item) => {
      allItems.push(item)
    })
  })

  // Group by zone
  const zones = groupByZone(allItems)

  // Optimize sequence
  const pickSequence = optimizePickSequence(allItems)

  // Calculate totals
  const totalItems = allItems.length
  const totalUnits = allItems.reduce((sum, item) => sum + item.totalUnits, 0)
  const estimatedPickTime = calculatePickTime(zones)

  return {
    orderId: 'BATCH',
    orderNumber: `BATCH-${orderNumbers.join(',')}`,
    customerId: 'MULTIPLE',
    customerName: `${pickLists.length} Orders / Pedidos`,
    totalItems,
    totalUnits,
    estimatedPickTime,
    zones,
    pickSequence,
    generatedAt: new Date(),
  }
}

// ============================================================================
// EXPORTS
// ============================================================================

export const pickListBuilder = {
  buildPickList,
  buildBatchPickLists,
  consolidatePickLists,
  formatPickListForPrint,
  getPickListSummary,
  formatPickTime,
}

export default pickListBuilder
