/**
 * Packing Slip Types
 * LAP W1: Warehouse Auto-Print Engine
 */

// ============================================================================
// ORDER DATA TYPES
// ============================================================================

export interface PackingSlipOrder {
  orderId: string
  orderNumber: string
  orderDate: Date
  confirmationDate?: Date
  status: 'pending' | 'confirmed' | 'packed' | 'shipped' | 'delivered'

  // Store information
  store: {
    id: string
    name: string
    code?: string
    address: {
      street: string
      city: string
      state: string
      zipCode: string
      country?: string
    }
    phone?: string
    email?: string
  }

  // Sales rep information
  salesRep?: {
    id: string
    name: string
    phone?: string
    email?: string
  }

  // Line items
  items: PackingSlipItem[]

  // Totals
  totals: {
    subtotal: number
    tax?: number
    discount?: number
    total: number
    itemCount: number
    totalUnits: number
  }

  // Notes
  notes?: string
  warehouseNotes?: string
  deliveryInstructions?: string
}

export interface PackingSlipItem {
  id: string
  productId: string
  productName: string
  sku?: string
  barcode?: string

  // Quantity
  quantity: number
  unitType: 'unit' | 'case' | 'box' | 'pack'
  unitsPerCase?: number

  // Pricing (optional on packing slip)
  unitPrice?: number
  totalPrice?: number

  // Additional info
  category?: string
  brand?: string
  weight?: number
  dimensions?: {
    length: number
    width: number
    height: number
    unit: 'cm' | 'in'
  }

  // Location
  warehouseLocation?: string
  bin?: string
  aisle?: string
}

// ============================================================================
// TEMPLATE CONFIGURATION
// ============================================================================

export interface PackingSlipConfig {
  // Branding
  companyName: string
  logo?: string | Buffer
  tagline?: string

  // Contact information
  warehouseAddress: {
    street: string
    city: string
    state: string
    zipCode: string
    country: string
  }
  warehousePhone: string
  warehouseEmail: string
  website?: string

  // Template options
  includeBarcode: boolean
  includeQRCode: boolean
  includePricing: boolean
  includeSignatureBox: boolean
  includeWarehouseNotes: boolean

  // Colors (hex)
  primaryColor: string
  secondaryColor: string
  accentColor: string

  // Fonts
  fontFamily: string
  headerFontSize: number
  bodyFontSize: number

  // Layout
  pageSize: 'letter' | 'A4'
  margins: {
    top: number
    right: number
    bottom: number
    left: number
  }
}

// ============================================================================
// PRINT JOB TYPES
// ============================================================================

export interface PrintJob {
  id: string
  orderId: string
  orderNumber: string

  // Status
  status: 'pending' | 'printing' | 'completed' | 'failed' | 'cancelled'
  priority: 'low' | 'normal' | 'high' | 'urgent'

  // Timestamps
  createdAt: Date
  startedAt?: Date
  completedAt?: Date

  // Print details
  printerName?: string
  printerIp?: string
  copies: number

  // PDF
  pdfPath?: string
  pdfBuffer?: Buffer
  pdfSize?: number

  // Retry logic
  attemptCount: number
  maxAttempts: number
  lastError?: string

  // Metadata
  createdBy?: string
  triggeredBy: 'manual' | 'auto' | 'api'
}

export interface PrintJobResult {
  success: boolean
  jobId: string
  message: string
  error?: string
  pdfUrl?: string
}

// ============================================================================
// PRINTER CONFIGURATION
// ============================================================================

export interface PrinterConfig {
  id: string
  name: string
  type: 'ipp' | 'cups' | 'windows' | 'network'

  // Connection
  ip?: string
  port?: number
  protocol?: 'ipp' | 'lpd' | 'raw'

  // Capabilities
  paperSizes: string[]
  colorSupport: boolean
  duplexSupport: boolean

  // Default settings
  defaultCopies: number
  defaultOrientation: 'portrait' | 'landscape'

  // Status
  enabled: boolean
  online?: boolean
  lastPing?: Date
}

// ============================================================================
// WAREHOUSE NOTES
// ============================================================================

export interface WarehouseNote {
  type: 'general' | 'fragile' | 'priority' | 'special_handling' | 'refrigerated'
  message: string
  icon?: string
}

export const DEFAULT_WAREHOUSE_NOTES: WarehouseNote[] = [
  {
    type: 'general',
    message: 'Verify all items before packing',
    icon: '✓',
  },
  {
    type: 'fragile',
    message: 'Handle with care - Fragile items',
    icon: '⚠️',
  },
  {
    type: 'refrigerated',
    message: 'Keep refrigerated items cold',
    icon: '❄️',
  },
]

// ============================================================================
// DEFAULT CONFIGURATION
// ============================================================================

export const DEFAULT_PACKING_SLIP_CONFIG: PackingSlipConfig = {
  companyName: 'Azteka DSD / SurtiRico',
  tagline: 'Distribución Directa a Tiendas',

  warehouseAddress: {
    street: 'Warehouse Address',
    city: 'Ciudad',
    state: 'Estado',
    zipCode: '00000',
    country: 'México',
  },
  warehousePhone: '+52 (555) 000-0000',
  warehouseEmail: 'warehouse@azteka-dsd.com',
  website: 'www.azteka-dsd.com',

  includeBarcode: true,
  includeQRCode: true,
  includePricing: false,  // Don't show prices on packing slip
  includeSignatureBox: true,
  includeWarehouseNotes: true,

  primaryColor: '#dc2626',      // Red-600
  secondaryColor: '#1e3a8a',    // Blue-900
  accentColor: '#eab308',       // Gold-500

  fontFamily: 'Helvetica',
  headerFontSize: 18,
  bodyFontSize: 10,

  pageSize: 'letter',
  margins: {
    top: 50,
    right: 50,
    bottom: 50,
    left: 50,
  },
}

// ============================================================================
// TYPE GUARDS
// ============================================================================

export function isValidPackingSlipOrder(order: any): order is PackingSlipOrder {
  return (
    typeof order === 'object' &&
    typeof order.orderId === 'string' &&
    typeof order.orderNumber === 'string' &&
    order.orderDate instanceof Date &&
    Array.isArray(order.items) &&
    typeof order.store === 'object'
  )
}

export function isValidPrintJob(job: any): job is PrintJob {
  return (
    typeof job === 'object' &&
    typeof job.id === 'string' &&
    typeof job.orderId === 'string' &&
    ['pending', 'printing', 'completed', 'failed', 'cancelled'].includes(job.status)
  )
}
