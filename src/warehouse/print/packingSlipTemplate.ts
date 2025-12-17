/**
 * Packing Slip Template
 * Beautiful branded PDF template for Azteka DSD / SurtiRico
 *
 * LAP W1: Warehouse Auto-Print Engine
 */

import type {
  PackingSlipOrder,
  PackingSlipConfig,
  PackingSlipItem,
  WarehouseNote,
} from './packingSlipTypes'

// ============================================================================
// TEMPLATE BUILDER
// ============================================================================

/**
 * PDF Template structure (will be rendered by pdfkit)
 */
export interface PDFTemplate {
  header: PDFHeaderSection
  orderInfo: PDFOrderInfoSection
  storeInfo: PDFStoreInfoSection
  itemsTable: PDFItemsTableSection
  totals: PDFTotalsSection
  signature: PDFSignatureSection
  footer: PDFFooterSection
  barcode?: PDFBarcodeSection
  qrCode?: PDFQRCodeSection
}

export interface PDFHeaderSection {
  companyName: string
  tagline: string
  logo?: string | Buffer
  documentTitle: string
  primaryColor: string
}

export interface PDFOrderInfoSection {
  orderNumber: string
  orderDate: string
  confirmationDate?: string
  status: string
  salesRep?: string
}

export interface PDFStoreInfoSection {
  storeName: string
  storeCode?: string
  address: string
  phone?: string
  email?: string
}

export interface PDFItemsTableSection {
  headers: string[]
  rows: PDFTableRow[]
  columnWidths: number[]
}

export interface PDFTableRow {
  cells: string[]
  isHeader?: boolean
  backgroundColor?: string
}

export interface PDFTotalsSection {
  subtotal: string
  tax?: string
  discount?: string
  total: string
  itemCount: number
  totalUnits: number
}

export interface PDFSignatureSection {
  enabled: boolean
  signatureLabel: string
  dateLabel: string
  nameLabel: string
}

export interface PDFFooterSection {
  notes: string[]
  warehouseInfo: string
  contact: string
}

export interface PDFBarcodeSection {
  data: string
  format: 'CODE128' | 'CODE39' | 'EAN13'
  width: number
  height: number
}

export interface PDFQRCodeSection {
  data: string
  size: number
}

// ============================================================================
// TEMPLATE GENERATOR
// ============================================================================

/**
 * Generate PDF template structure from order and config
 */
export function generatePackingSlipTemplate(
  order: PackingSlipOrder,
  config: PackingSlipConfig
): PDFTemplate {
  return {
    header: generateHeader(config),
    orderInfo: generateOrderInfo(order),
    storeInfo: generateStoreInfo(order.store),
    itemsTable: generateItemsTable(order.items, config),
    totals: generateTotals(order.totals),
    signature: generateSignature(config),
    footer: generateFooter(order, config),
    ...(config.includeBarcode && { barcode: generateBarcode(order.orderId) }),
    ...(config.includeQRCode && { qrCode: generateQRCode(order) }),
  }
}

// ============================================================================
// SECTION GENERATORS
// ============================================================================

function generateHeader(config: PackingSlipConfig): PDFHeaderSection {
  return {
    companyName: config.companyName,
    tagline: config.tagline || '',
    logo: config.logo,
    documentTitle: 'LISTA DE EMPAQUE / PACKING SLIP',
    primaryColor: config.primaryColor,
  }
}

function generateOrderInfo(order: PackingSlipOrder): PDFOrderInfoSection {
  return {
    orderNumber: order.orderNumber,
    orderDate: formatDate(order.orderDate),
    confirmationDate: order.confirmationDate ? formatDate(order.confirmationDate) : undefined,
    status: formatStatus(order.status),
    salesRep: order.salesRep ? order.salesRep.name : undefined,
  }
}

function generateStoreInfo(store: PackingSlipOrder['store']): PDFStoreInfoSection {
  const address = `${store.address.street}, ${store.address.city}, ${store.address.state} ${store.address.zipCode}`

  return {
    storeName: store.name,
    storeCode: store.code,
    address,
    phone: store.phone,
    email: store.email,
  }
}

function generateItemsTable(
  items: PackingSlipItem[],
  config: PackingSlipConfig
): PDFItemsTableSection {
  // Table headers
  const headers = config.includePricing
    ? ['#', 'Producto', 'SKU', 'Cantidad', 'Tipo', 'Precio Unit.', 'Total']
    : ['#', 'Producto', 'SKU', 'Cantidad', 'Tipo', 'Ubicación']

  const columnWidths = config.includePricing
    ? [30, 200, 80, 60, 60, 70, 70]
    : [30, 250, 100, 80, 80, 100]

  // Table rows
  const rows: PDFTableRow[] = items.map((item, index) => {
    const cells = config.includePricing
      ? [
          `${index + 1}`,
          item.productName,
          item.sku || '-',
          item.quantity.toString(),
          formatUnitType(item.unitType),
          item.unitPrice ? `$${item.unitPrice.toFixed(2)}` : '-',
          item.totalPrice ? `$${item.totalPrice.toFixed(2)}` : '-',
        ]
      : [
          `${index + 1}`,
          item.productName,
          item.sku || '-',
          item.quantity.toString(),
          formatUnitType(item.unitType),
          item.warehouseLocation || item.bin || '-',
        ]

    return { cells }
  })

  return {
    headers,
    rows,
    columnWidths,
  }
}

function generateTotals(totals: PackingSlipOrder['totals']): PDFTotalsSection {
  return {
    subtotal: `$${totals.subtotal.toFixed(2)}`,
    tax: totals.tax ? `$${totals.tax.toFixed(2)}` : undefined,
    discount: totals.discount ? `-$${totals.discount.toFixed(2)}` : undefined,
    total: `$${totals.total.toFixed(2)}`,
    itemCount: totals.itemCount,
    totalUnits: totals.totalUnits,
  }
}

function generateSignature(config: PackingSlipConfig): PDFSignatureSection {
  return {
    enabled: config.includeSignatureBox,
    signatureLabel: 'Firma del Receptor / Receiver Signature',
    dateLabel: 'Fecha / Date',
    nameLabel: 'Nombre / Name',
  }
}

function generateFooter(
  order: PackingSlipOrder,
  config: PackingSlipConfig
): PDFFooterSection {
  const notes: string[] = []

  // Standard warehouse notes
  if (config.includeWarehouseNotes) {
    notes.push('• Verificar todos los artículos antes de firmar')
    notes.push('• Reportar faltantes o daños inmediatamente')
    notes.push('• Conservar este documento para control')
  }

  // Custom order notes
  if (order.warehouseNotes) {
    notes.push(`• ${order.warehouseNotes}`)
  }

  if (order.deliveryInstructions) {
    notes.push(`• Instrucciones: ${order.deliveryInstructions}`)
  }

  const warehouseInfo = `${config.warehouseAddress.street}, ${config.warehouseAddress.city}, ${config.warehouseAddress.state} ${config.warehouseAddress.zipCode}`

  const contact = `Tel: ${config.warehousePhone} | Email: ${config.warehouseEmail}`

  return {
    notes,
    warehouseInfo,
    contact,
  }
}

function generateBarcode(orderId: string): PDFBarcodeSection {
  return {
    data: orderId,
    format: 'CODE128',
    width: 2,
    height: 50,
  }
}

function generateQRCode(order: PackingSlipOrder): PDFQRCodeSection {
  // QR code contains order lookup URL or JSON data
  const qrData = JSON.stringify({
    orderId: order.orderId,
    orderNumber: order.orderNumber,
    date: order.orderDate.toISOString(),
    store: order.store.name,
  })

  return {
    data: qrData,
    size: 100,
  }
}

// ============================================================================
// FORMATTING HELPERS
// ============================================================================

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('es-MX', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date)
}

function formatStatus(status: PackingSlipOrder['status']): string {
  const statusMap = {
    pending: 'Pendiente',
    confirmed: 'Confirmado',
    packed: 'Empacado',
    shipped: 'Enviado',
    delivered: 'Entregado',
  }

  return statusMap[status] || status
}

function formatUnitType(unitType: PackingSlipItem['unitType']): string {
  const typeMap = {
    unit: 'Unidad',
    case: 'Caja',
    box: 'Paquete',
    pack: 'Paquete',
  }

  return typeMap[unitType] || unitType
}

// ============================================================================
// TEMPLATE PRESETS
// ============================================================================

/**
 * Preset templates for different scenarios
 */
export const TEMPLATE_PRESETS = {
  standard: {
    name: 'Standard Packing Slip',
    description: 'Standard packing slip with all details',
    includePricing: false,
    includeBarcode: true,
    includeQRCode: true,
    includeSignatureBox: true,
  },

  minimal: {
    name: 'Minimal Packing Slip',
    description: 'Minimal packing slip for quick picking',
    includePricing: false,
    includeBarcode: true,
    includeQRCode: false,
    includeSignatureBox: false,
  },

  detailed: {
    name: 'Detailed Packing Slip',
    description: 'Detailed packing slip with pricing and location',
    includePricing: true,
    includeBarcode: true,
    includeQRCode: true,
    includeSignatureBox: true,
  },
}

// ============================================================================
// VALIDATION
// ============================================================================

/**
 * Validate template data before rendering
 */
export function validateTemplate(template: PDFTemplate): {
  valid: boolean
  errors: string[]
} {
  const errors: string[] = []

  if (!template.header.companyName) {
    errors.push('Company name is required')
  }

  if (!template.orderInfo.orderNumber) {
    errors.push('Order number is required')
  }

  if (!template.storeInfo.storeName) {
    errors.push('Store name is required')
  }

  if (!template.itemsTable.rows || template.itemsTable.rows.length === 0) {
    errors.push('At least one item is required')
  }

  return {
    valid: errors.length === 0,
    errors,
  }
}

// ============================================================================
// EXPORTS
// ============================================================================

export const packingSlipTemplate = {
  generate: generatePackingSlipTemplate,
  validate: validateTemplate,
  presets: TEMPLATE_PRESETS,
  formatters: {
    formatDate,
    formatStatus,
    formatUnitType,
  },
}

export default packingSlipTemplate
