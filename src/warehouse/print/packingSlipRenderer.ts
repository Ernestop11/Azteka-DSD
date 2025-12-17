/**
 * Packing Slip PDF Renderer
 * Renders beautiful PDFs using PDFKit
 *
 * LAP W1: Warehouse Auto-Print Engine
 */

import PDFDocument from 'pdfkit'
import type {
  PackingSlipOrder,
  PackingSlipConfig,
  DEFAULT_PACKING_SLIP_CONFIG,
} from './packingSlipTypes'
import { generatePackingSlipTemplate, validateTemplate } from './packingSlipTemplate'
import type { PDFTemplate } from './packingSlipTemplate'

// ============================================================================
// MAIN RENDERER
// ============================================================================

/**
 * Render packing slip to PDF buffer
 */
export async function renderPackingSlip(
  order: PackingSlipOrder,
  config: Partial<PackingSlipConfig> = {}
): Promise<Buffer> {
  // Merge with default config
  const fullConfig: PackingSlipConfig = {
    ...DEFAULT_PACKING_SLIP_CONFIG,
    ...config,
  } as any

  // Generate template structure
  const template = generatePackingSlipTemplate(order, fullConfig)

  // Validate template
  const validation = validateTemplate(template)
  if (!validation.valid) {
    throw new Error(`Invalid template: ${validation.errors.join(', ')}`)
  }

  // Create PDF
  return await createPDF(template, fullConfig)
}

// ============================================================================
// PDF CREATION
// ============================================================================

async function createPDF(
  template: PDFTemplate,
  config: PackingSlipConfig
): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    try {
      // Create PDF document
      const doc = new PDFDocument({
        size: config.pageSize,
        margins: config.margins,
        info: {
          Title: `Packing Slip - ${template.orderInfo.orderNumber}`,
          Author: config.companyName,
          Subject: 'Packing Slip',
          Creator: 'Azteka DSD Warehouse System',
        },
      })

      // Collect PDF chunks
      const chunks: Buffer[] = []
      doc.on('data', (chunk) => chunks.push(chunk))
      doc.on('end', () => resolve(Buffer.concat(chunks)))
      doc.on('error', reject)

      // Get page dimensions
      const pageWidth = doc.page.width
      const pageHeight = doc.page.height
      const contentWidth = pageWidth - config.margins.left - config.margins.right

      let currentY = config.margins.top

      // ========================================================================
      // RENDER HEADER
      // ========================================================================

      currentY = renderHeader(doc, template.header, config, currentY, contentWidth)
      currentY += 20

      // ========================================================================
      // RENDER ORDER INFO + BARCODE/QR
      // ========================================================================

      const orderInfoHeight = renderOrderInfo(
        doc,
        template.orderInfo,
        config,
        currentY,
        contentWidth * 0.6
      )

      // Render barcode/QR on the right side
      if (template.barcode || template.qrCode) {
        renderCodesSection(
          doc,
          template.barcode,
          template.qrCode,
          config,
          currentY,
          contentWidth * 0.65,
          contentWidth * 0.35
        )
      }

      currentY += orderInfoHeight + 20

      // ========================================================================
      // RENDER STORE INFO
      // ========================================================================

      currentY = renderStoreInfo(doc, template.storeInfo, config, currentY, contentWidth)
      currentY += 20

      // ========================================================================
      // RENDER ITEMS TABLE
      // ========================================================================

      currentY = renderItemsTable(doc, template.itemsTable, config, currentY, contentWidth)
      currentY += 20

      // ========================================================================
      // RENDER TOTALS
      // ========================================================================

      if (config.includePricing) {
        currentY = renderTotals(doc, template.totals, config, currentY, contentWidth)
        currentY += 20
      } else {
        // Just show item counts
        currentY = renderItemCounts(doc, template.totals, config, currentY, contentWidth)
        currentY += 20
      }

      // ========================================================================
      // RENDER SIGNATURE BOX
      // ========================================================================

      if (template.signature.enabled) {
        currentY = renderSignature(doc, template.signature, config, currentY, contentWidth)
        currentY += 20
      }

      // ========================================================================
      // RENDER FOOTER
      // ========================================================================

      renderFooter(doc, template.footer, config, pageHeight - config.margins.bottom - 60)

      // Finalize PDF
      doc.end()
    } catch (error) {
      reject(error)
    }
  })
}

// ============================================================================
// SECTION RENDERERS
// ============================================================================

function renderHeader(
  doc: typeof PDFDocument,
  header: PDFTemplate['header'],
  config: PackingSlipConfig,
  startY: number,
  width: number
): number {
  let y = startY

  // Company name
  doc
    .font('Helvetica-Bold')
    .fontSize(config.headerFontSize + 6)
    .fillColor(config.primaryColor)
    .text(header.companyName, config.margins.left, y, {
      width,
      align: 'center',
    })

  y += 30

  // Tagline
  if (header.tagline) {
    doc
      .font('Helvetica')
      .fontSize(config.bodyFontSize + 2)
      .fillColor('#666666')
      .text(header.tagline, config.margins.left, y, {
        width,
        align: 'center',
      })

    y += 20
  }

  // Document title
  doc
    .font('Helvetica-Bold')
    .fontSize(config.headerFontSize)
    .fillColor('#000000')
    .text(header.documentTitle, config.margins.left, y, {
      width,
      align: 'center',
    })

  y += 30

  // Horizontal line
  doc
    .strokeColor(config.primaryColor)
    .lineWidth(2)
    .moveTo(config.margins.left, y)
    .lineTo(config.margins.left + width, y)
    .stroke()

  return y + 10
}

function renderOrderInfo(
  doc: typeof PDFDocument,
  orderInfo: PDFTemplate['orderInfo'],
  config: PackingSlipConfig,
  startY: number,
  width: number
): number {
  let y = startY

  doc.font('Helvetica-Bold').fontSize(config.bodyFontSize + 2).fillColor('#000000')

  const lineHeight = 15

  // Order number
  doc.text(`Pedido #: `, config.margins.left, y, { continued: true })
  doc.font('Helvetica').text(orderInfo.orderNumber)
  y += lineHeight

  // Order date
  doc.font('Helvetica-Bold').text(`Fecha: `, config.margins.left, y, { continued: true })
  doc.font('Helvetica').text(orderInfo.orderDate)
  y += lineHeight

  // Confirmation date
  if (orderInfo.confirmationDate) {
    doc.font('Helvetica-Bold').text(`Confirmado: `, config.margins.left, y, { continued: true })
    doc.font('Helvetica').text(orderInfo.confirmationDate)
    y += lineHeight
  }

  // Status
  doc.font('Helvetica-Bold').text(`Estado: `, config.margins.left, y, { continued: true })
  doc.font('Helvetica').text(orderInfo.status)
  y += lineHeight

  // Sales rep
  if (orderInfo.salesRep) {
    doc.font('Helvetica-Bold').text(`Vendedor: `, config.margins.left, y, { continued: true })
    doc.font('Helvetica').text(orderInfo.salesRep)
    y += lineHeight
  }

  return y - startY
}

function renderCodesSection(
  doc: typeof PDFDocument,
  barcode: PDFTemplate['barcode'] | undefined,
  qrCode: PDFTemplate['qrCode'] | undefined,
  config: PackingSlipConfig,
  startY: number,
  startX: number,
  width: number
): void {
  // For now, just add placeholder text
  // Real barcode/QR generation would require additional libraries (bwip-js, qrcode)

  if (barcode) {
    doc
      .font('Helvetica')
      .fontSize(8)
      .fillColor('#666666')
      .text(`Barcode: ${barcode.data}`, startX, startY, {
        width,
        align: 'right',
      })
  }

  if (qrCode) {
    doc
      .font('Helvetica')
      .fontSize(8)
      .fillColor('#666666')
      .text('QR Code', startX, startY + 20, {
        width,
        align: 'right',
      })
  }
}

function renderStoreInfo(
  doc: typeof PDFDocument,
  storeInfo: PDFTemplate['storeInfo'],
  config: PackingSlipConfig,
  startY: number,
  width: number
): number {
  let y = startY

  // Section title
  doc
    .font('Helvetica-Bold')
    .fontSize(config.bodyFontSize + 2)
    .fillColor(config.primaryColor)
    .text('DESTINO / DESTINATION', config.margins.left, y)

  y += 20

  // Store name
  doc
    .font('Helvetica-Bold')
    .fontSize(config.bodyFontSize + 1)
    .fillColor('#000000')
    .text(storeInfo.storeName, config.margins.left, y)

  if (storeInfo.storeCode) {
    doc.font('Helvetica').text(` (${storeInfo.storeCode})`, { continued: true })
  }

  y += 15

  // Address
  doc.font('Helvetica').fontSize(config.bodyFontSize).text(storeInfo.address, config.margins.left, y)

  y += 15

  // Contact info
  if (storeInfo.phone || storeInfo.email) {
    const contact = [storeInfo.phone, storeInfo.email].filter(Boolean).join(' | ')
    doc.text(contact, config.margins.left, y)
    y += 15
  }

  return y
}

function renderItemsTable(
  doc: typeof PDFDocument,
  table: PDFTemplate['itemsTable'],
  config: PackingSlipConfig,
  startY: number,
  width: number
): number {
  let y = startY

  // Section title
  doc
    .font('Helvetica-Bold')
    .fontSize(config.bodyFontSize + 2)
    .fillColor(config.primaryColor)
    .text('ARTÍCULOS / ITEMS', config.margins.left, y)

  y += 20

  const rowHeight = 20
  const headerHeight = 25

  // Calculate column positions
  const colX: number[] = []
  let currentX = config.margins.left
  table.columnWidths.forEach((width) => {
    colX.push(currentX)
    currentX += width
  })

  // Draw header row
  doc
    .rect(config.margins.left, y, width, headerHeight)
    .fillAndStroke(config.secondaryColor, config.secondaryColor)

  doc.font('Helvetica-Bold').fontSize(config.bodyFontSize).fillColor('#FFFFFF')

  table.headers.forEach((header, i) => {
    doc.text(header, colX[i] + 5, y + 7, {
      width: table.columnWidths[i] - 10,
      align: 'left',
    })
  })

  y += headerHeight

  // Draw data rows
  doc.fillColor('#000000').font('Helvetica').fontSize(config.bodyFontSize - 1)

  table.rows.forEach((row, rowIndex) => {
    // Alternate row colors
    if (rowIndex % 2 === 0) {
      doc.rect(config.margins.left, y, width, rowHeight).fillAndStroke('#f9fafb', '#e5e7eb')
    } else {
      doc.rect(config.margins.left, y, width, rowHeight).fillAndStroke('#ffffff', '#e5e7eb')
    }

    doc.fillColor('#000000')

    row.cells.forEach((cell, i) => {
      doc.text(cell, colX[i] + 5, y + 5, {
        width: table.columnWidths[i] - 10,
        align: i === 0 ? 'center' : 'left',
      })
    })

    y += rowHeight
  })

  return y
}

function renderTotals(
  doc: typeof PDFDocument,
  totals: PDFTemplate['totals'],
  config: PackingSlipConfig,
  startY: number,
  width: number
): number {
  let y = startY

  const labelX = config.margins.left + width - 250
  const valueX = config.margins.left + width - 100

  doc.font('Helvetica').fontSize(config.bodyFontSize)

  // Subtotal
  doc.text('Subtotal:', labelX, y)
  doc.text(totals.subtotal, valueX, y, { align: 'right', width: 100 })
  y += 15

  // Tax
  if (totals.tax) {
    doc.text('IVA:', labelX, y)
    doc.text(totals.tax, valueX, y, { align: 'right', width: 100 })
    y += 15
  }

  // Discount
  if (totals.discount) {
    doc.text('Descuento:', labelX, y)
    doc.text(totals.discount, valueX, y, { align: 'right', width: 100 })
    y += 15
  }

  // Total
  doc
    .font('Helvetica-Bold')
    .fontSize(config.bodyFontSize + 2)
    .text('TOTAL:', labelX, y)
  doc.text(totals.total, valueX, y, { align: 'right', width: 100 })

  return y + 20
}

function renderItemCounts(
  doc: typeof PDFDocument,
  totals: PDFTemplate['totals'],
  config: PackingSlipConfig,
  startY: number,
  width: number
): number {
  let y = startY

  doc.font('Helvetica-Bold').fontSize(config.bodyFontSize + 1)

  doc.text(
    `Total de artículos: ${totals.itemCount} | Total de unidades: ${totals.totalUnits}`,
    config.margins.left,
    y
  )

  return y + 15
}

function renderSignature(
  doc: typeof PDFDocument,
  signature: PDFTemplate['signature'],
  config: PackingSlipConfig,
  startY: number,
  width: number
): number {
  let y = startY

  const boxHeight = 80
  const boxWidth = width / 2 - 10

  // Signature box
  doc.rect(config.margins.left, y, boxWidth, boxHeight).stroke('#000000')

  doc.font('Helvetica').fontSize(config.bodyFontSize - 1)

  doc.text(signature.signatureLabel, config.margins.left + 10, y + 5)
  doc.text(signature.nameLabel, config.margins.left + 10, y + boxHeight - 25)

  // Date box
  doc.rect(config.margins.left + boxWidth + 20, y, boxWidth, boxHeight).stroke('#000000')

  doc.text(signature.dateLabel, config.margins.left + boxWidth + 30, y + 5)

  return y + boxHeight
}

function renderFooter(
  doc: typeof PDFDocument,
  footer: PDFTemplate['footer'],
  config: PackingSlipConfig,
  startY: number
): void {
  let y = startY

  // Horizontal line
  const width = doc.page.width - config.margins.left - config.margins.right

  doc
    .strokeColor('#cccccc')
    .lineWidth(1)
    .moveTo(config.margins.left, y)
    .lineTo(config.margins.left + width, y)
    .stroke()

  y += 10

  // Notes
  doc.font('Helvetica').fontSize(config.bodyFontSize - 1).fillColor('#666666')

  footer.notes.forEach((note) => {
    doc.text(note, config.margins.left, y, { width })
    y += 12
  })

  y += 5

  // Warehouse info
  doc.fontSize(config.bodyFontSize - 2).text(footer.warehouseInfo, config.margins.left, y, {
    width,
    align: 'center',
  })

  y += 12

  doc.text(footer.contact, config.margins.left, y, {
    width,
    align: 'center',
  })
}

// ============================================================================
// EXPORT
// ============================================================================

export const packingSlipRenderer = {
  render: renderPackingSlip,
}

export default packingSlipRenderer
