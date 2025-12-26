/**
 * Auto-Print Service for Azteka DSD
 *
 * WORKFLOW:
 * 1. Order created via POST /api/orders
 * 2. processNewOrder() in autoWorkflow.ts triggers
 * 3. printPickingList() generates text-based picking list
 * 4. printTextToHPLaserJet() sends to CUPS printer queue
 * 5. Physical picking list prints automatically
 *
 * PRINTER CONFIGURATION:
 * - Primary: HP Color LaserJet MFP M281fdw (FD3E28)
 * - Address: NPIFD3E28.local / 10.1.10.168
 * - CUPS Name: HP_Color_LaserJet_MFP_M281fdw__FD3E28_
 * - Port: 631 (IPP)
 * - Format: Plain text (printer doesn't support raw HTML)
 *
 * TESTED: 2025-12-20 - Job #1066 printed successfully
 *
 * ENV VARIABLES:
 * - CUPS_PRINTER: Override default printer name
 * - AUTO_PRINT_ENABLED: Set to 'false' to disable auto-printing
 * - PRINTER_HOSTNAME: Override printer hostname
 * - PRINTER_IP: Override printer IP
 */

import prisma from '@/lib/prisma'

// Printer configuration - supports multiple printers
// Primary: HP Color LaserJet MFP M281fdw (online at 10.1.10.168)
// Note: HP LaserJet Pro MFP 4101 exists in CUPS but is currently offline
const PRINTER_CONFIG = {
  hostname: process.env.PRINTER_HOSTNAME || 'NPIFD3E28.local',
  ip: process.env.PRINTER_IP || '10.1.10.168',
  port: 631,
  path: '/ipp/print',
  name: 'HP Color LaserJet MFP M281fdw',
  // CUPS printer names (as shown by lpstat -p)
  cupsPrimary: 'HP_Color_LaserJet_MFP_M281fdw__FD3E28_',
  cupsSecondary: 'HP_LaserJet_Pro_MFP_4101',
}

// Print job types
export type PrintJobType = 'PICKING_LIST' | 'PACKING_SLIP' | 'BOX_LABEL' | 'INVOICE'

interface PrintResult {
  success: boolean
  jobId?: string
  error?: string
}

/**
 * Generate plain text picking list for printers that don't support HTML
 * Uses ASCII formatting for better compatibility
 */
export function generatePickingListText(order: {
  id: string
  orderNumber?: string
  customer?: { name: string; address?: string }
  items: Array<{
    product: { name: string; sku?: string }
    quantity: number
    location?: string
  }>
  createdAt: Date
  priority?: string
}): string {
  const divider = '='.repeat(60)
  const thinDivider = '-'.repeat(60)
  const priorityMarker = order.priority === 'URGENT' ? ' *** URGENT ***' :
                         order.priority === 'HIGH' ? ' * HIGH PRIORITY *' : ''

  const lines: string[] = [
    '',
    divider,
    '            AZTEKA DSD - PICKING LIST' + priorityMarker,
    divider,
    '',
    `  Order #: ${order.orderNumber || order.id.slice(-8).toUpperCase()}`,
    `  Date: ${new Date(order.createdAt).toLocaleDateString('en-US', {
      weekday: 'short', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit'
    })}`,
    `  Customer: ${order.customer?.name || 'Walk-in'}`,
  ]

  if (order.customer?.address) {
    lines.push(`  Address: ${order.customer.address}`)
  }

  lines.push('', thinDivider)
  lines.push('  [ ] PRODUCT                              QTY    LOCATION')
  lines.push(thinDivider)

  order.items.forEach((item, idx) => {
    const name = item.product.name.substring(0, 35).padEnd(35)
    const qty = item.quantity.toString().padStart(3)
    const loc = (item.location || '---').padStart(8)
    lines.push(`  [ ] ${name} ${qty}    ${loc}`)
    if (item.product.sku) {
      lines.push(`      SKU: ${item.product.sku}`)
    }
  })

  lines.push(thinDivider)
  lines.push('')
  lines.push(`  Total Items: ${order.items.reduce((sum, i) => sum + i.quantity, 0)} (${order.items.length} products)`)
  lines.push('')
  lines.push('  Picked by: _______________________  Time: ________')
  lines.push('')
  lines.push(divider)
  lines.push('')

  return lines.join('\n')
}

/**
 * Generate HTML for a picking list (for PDF printing or display)
 */
export function generatePickingListHTML(order: {
  id: string
  orderNumber?: string
  customer?: { name: string; address?: string }
  items: Array<{
    product: { name: string; sku?: string; imageUrl?: string }
    quantity: number
    location?: string // Aisle-Bin-Slot format
  }>
  createdAt: Date
  priority?: string
}): string {
  const priorityColors: Record<string, string> = {
    URGENT: '#ef4444',
    HIGH: '#f97316',
    NORMAL: '#3b82f6',
    LOW: '#6b7280',
  }

  const priorityColor = priorityColors[order.priority || 'NORMAL'] || '#3b82f6'

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Picking List - ${order.orderNumber || order.id}</title>
  <style>
    @page { margin: 0.5in; size: letter; }
    body {
      font-family: Arial, sans-serif;
      font-size: 14px;
      line-height: 1.4;
      color: #1f2937;
    }
    .header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      border-bottom: 3px solid ${priorityColor};
      padding-bottom: 16px;
      margin-bottom: 20px;
    }
    .logo {
      font-size: 28px;
      font-weight: bold;
      color: #1f2937;
    }
    .order-info {
      text-align: right;
    }
    .order-number {
      font-size: 24px;
      font-weight: bold;
      color: ${priorityColor};
    }
    .priority-badge {
      display: inline-block;
      padding: 4px 12px;
      background: ${priorityColor};
      color: white;
      border-radius: 20px;
      font-size: 12px;
      font-weight: bold;
      margin-top: 8px;
    }
    .customer-info {
      background: #f3f4f6;
      padding: 12px 16px;
      border-radius: 8px;
      margin-bottom: 20px;
    }
    .customer-name {
      font-size: 18px;
      font-weight: bold;
    }
    .items-table {
      width: 100%;
      border-collapse: collapse;
    }
    .items-table th {
      background: #1f2937;
      color: white;
      padding: 12px;
      text-align: left;
      font-size: 12px;
      text-transform: uppercase;
    }
    .items-table td {
      padding: 12px;
      border-bottom: 1px solid #e5e7eb;
      vertical-align: middle;
    }
    .items-table tr:nth-child(even) {
      background: #f9fafb;
    }
    .item-row {
      page-break-inside: avoid;
    }
    .product-name {
      font-weight: 600;
      font-size: 16px;
    }
    .product-sku {
      color: #6b7280;
      font-size: 12px;
    }
    .quantity {
      font-size: 24px;
      font-weight: bold;
      text-align: center;
      color: ${priorityColor};
    }
    .location {
      font-family: monospace;
      font-size: 16px;
      font-weight: bold;
      background: #fef3c7;
      padding: 4px 8px;
      border-radius: 4px;
    }
    .checkbox {
      width: 28px;
      height: 28px;
      border: 2px solid #9ca3af;
      border-radius: 4px;
    }
    .footer {
      margin-top: 30px;
      padding-top: 16px;
      border-top: 1px solid #e5e7eb;
      display: flex;
      justify-content: space-between;
    }
    .signature-line {
      width: 200px;
      border-top: 1px solid #1f2937;
      margin-top: 40px;
      padding-top: 8px;
      font-size: 12px;
      color: #6b7280;
    }
    .total-items {
      font-size: 18px;
      font-weight: bold;
    }
  </style>
</head>
<body>
  <div class="header">
    <div>
      <div class="logo">🌮 AZTEKA DSD</div>
      <div style="color: #6b7280; margin-top: 4px;">Picking List</div>
    </div>
    <div class="order-info">
      <div class="order-number">#${order.orderNumber || order.id.slice(-8).toUpperCase()}</div>
      <div style="color: #6b7280; margin-top: 4px;">${new Date(order.createdAt).toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit'
      })}</div>
      ${order.priority ? `<div class="priority-badge">${order.priority}</div>` : ''}
    </div>
  </div>

  <div class="customer-info">
    <div class="customer-name">${order.customer?.name || 'Walk-in Customer'}</div>
    ${order.customer?.address ? `<div style="color: #6b7280; margin-top: 4px;">${order.customer.address}</div>` : ''}
  </div>

  <table class="items-table">
    <thead>
      <tr>
        <th style="width: 40px;">✓</th>
        <th>Product</th>
        <th style="width: 100px; text-align: center;">Qty</th>
        <th style="width: 120px;">Location</th>
      </tr>
    </thead>
    <tbody>
      ${order.items.map((item, index) => `
        <tr class="item-row">
          <td><div class="checkbox"></div></td>
          <td>
            <div class="product-name">${item.product.name}</div>
            ${item.product.sku ? `<div class="product-sku">SKU: ${item.product.sku}</div>` : ''}
          </td>
          <td class="quantity">${item.quantity}</td>
          <td>
            ${item.location ? `<span class="location">${item.location}</span>` : '<span style="color: #9ca3af;">—</span>'}
          </td>
        </tr>
      `).join('')}
    </tbody>
  </table>

  <div class="footer">
    <div class="total-items">
      Total Items: ${order.items.reduce((sum, item) => sum + item.quantity, 0)}
      (${order.items.length} products)
    </div>
    <div class="signature-line">
      Picked by: _________________
    </div>
  </div>
</body>
</html>
  `.trim()
}

/**
 * Queue a print job in the database
 */
export async function queuePrintJob(
  type: PrintJobType,
  payload: Record<string, unknown>,
  copies: number = 1
): Promise<string> {
  const printJob = await prisma.printJob.create({
    data: {
      type,
      payload,
      copies,
      status: 'QUEUED',
    },
  })

  return printJob.id
}

/**
 * Print plain text directly to the HP LaserJet via CUPS
 * Uses the lp command-line tool available on macOS/Linux
 */
export async function printTextToHPLaserJet(
  text: string,
  jobName: string = 'Azteka Print Job',
  copies: number = 1
): Promise<PrintResult> {
  try {
    const { spawn } = await import('child_process')
    const { writeFile, unlink } = await import('fs/promises')
    const { join } = await import('path')
    const { randomUUID } = await import('crypto')

    // Create a temporary text file
    const tempDir = process.env.TMPDIR || '/tmp'
    const tempFile = join(tempDir, `azteka-print-${randomUUID()}.txt`)

    await writeFile(tempFile, text, 'utf-8')

    return new Promise((resolve) => {
      // Print using lp command (CUPS)
      const printerName = process.env.CUPS_PRINTER || PRINTER_CONFIG.cupsPrimary
      const lp = spawn('lp', [
        '-d', printerName,
        '-n', copies.toString(),
        '-t', jobName,
        '-o', 'media=letter',
        '-o', 'cpi=12',  // Characters per inch (font size)
        '-o', 'lpi=8',   // Lines per inch
        tempFile,
      ])

      let output = ''
      let errorOutput = ''

      lp.stdout.on('data', (data) => {
        output += data.toString()
      })

      lp.stderr.on('data', (data) => {
        errorOutput += data.toString()
      })

      lp.on('close', async (code) => {
        // Clean up temp file
        try {
          await unlink(tempFile)
        } catch {
          // Ignore cleanup errors
        }

        if (code === 0) {
          const match = output.match(/request id is (\S+)/)
          resolve({
            success: true,
            jobId: match ? match[1] : undefined,
          })
        } else {
          resolve({
            success: false,
            error: errorOutput || `Print failed with code ${code}`,
          })
        }
      })

      lp.on('error', (err) => {
        resolve({
          success: false,
          error: err.message,
        })
      })
    })
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown print error',
    }
  }
}

/**
 * Print directly to the HP LaserJet via IPP
 * Uses the cups command-line tools available on macOS
 * NOTE: HTML format not supported by printer - use printTextToHPLaserJet for text
 */
export async function printToHPLaserJet(
  html: string,
  jobName: string = 'Azteka Print Job',
  copies: number = 1
): Promise<PrintResult> {
  try {
    // For server-side, we'll use the CUPS lp command which is available on macOS
    // This is more reliable than implementing IPP from scratch

    const { spawn } = await import('child_process')
    const { writeFile, unlink } = await import('fs/promises')
    const { join } = await import('path')
    const { randomUUID } = await import('crypto')

    // Create a temporary HTML file
    const tempDir = process.env.TMPDIR || '/tmp'
    const tempFile = join(tempDir, `azteka-print-${randomUUID()}.html`)

    await writeFile(tempFile, html, 'utf-8')

    // Use wkhtmltopdf to convert HTML to PDF if available, otherwise use lp directly
    // macOS can print HTML via the preview/CUPS system

    return new Promise((resolve) => {
      // Try to print using lp command (CUPS)
      // Use primary printer (HP LaserJet Pro MFP 4101) or fallback to secondary
      const printerName = process.env.CUPS_PRINTER || PRINTER_CONFIG.cupsPrimary
      const lp = spawn('lp', [
        '-d', printerName,
        '-n', copies.toString(),
        '-t', jobName,
        '-o', 'media=letter',
        '-o', 'fit-to-page',
        tempFile,
      ])

      let output = ''
      let errorOutput = ''

      lp.stdout.on('data', (data) => {
        output += data.toString()
      })

      lp.stderr.on('data', (data) => {
        errorOutput += data.toString()
      })

      lp.on('close', async (code) => {
        // Clean up temp file
        try {
          await unlink(tempFile)
        } catch {
          // Ignore cleanup errors
        }

        if (code === 0) {
          // Extract job ID from output (format: "request id is HP_xxx-123 (1 file(s))")
          const match = output.match(/request id is (\S+)/)
          resolve({
            success: true,
            jobId: match ? match[1] : undefined,
          })
        } else {
          resolve({
            success: false,
            error: errorOutput || `Print failed with code ${code}`,
          })
        }
      })

      lp.on('error', (err) => {
        resolve({
          success: false,
          error: err.message,
        })
      })
    })
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown print error',
    }
  }
}

/**
 * Print a picking list for an order
 *
 * UPDATED: Now queues the job for the print agent instead of printing directly.
 * The local print agent will poll for pending jobs and print them.
 *
 * This allows the VPS to work even though it can't directly reach the local printer.
 */
export async function printPickingList(
  orderId: string,
  priority: string = 'NORMAL',
  copies: number = 1
): Promise<PrintResult> {
  try {
    // Fetch order with items (Order doesn't have customer relation)
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        OrderItem: {
          include: {
            Product: true,
          },
        },
      },
    })

    if (!order) {
      return { success: false, error: 'Order not found' }
    }

    // Generate warehouse locations
    const items = order.OrderItem.map((item) => ({
      product: {
        name: item.Product.name,
        sku: item.Product.sku || undefined,
        imageUrl: item.Product.imageUrl || undefined,
      },
      quantity: item.quantity,
      location: item.Product.warehouseLocation || generateWarehouseLocation(item.Product.id),
    }))

    // Generate text-based picking list content
    const textContent = generatePickingListText({
      id: order.id,
      orderNumber: order.id.slice(-8).toUpperCase(),
      customer: order.customerName ? {
        name: order.customerName,
      } : undefined,
      items,
      createdAt: order.createdAt,
      priority,
    })

    // Queue the print job for the local print agent
    // Instead of printing directly, we store the job in the database
    const printJob = await prisma.printJob.create({
      data: {
        type: 'PICKING_LIST',
        payload: {
          orderId,
          orderNumber: order.id.slice(-8).toUpperCase(),
          customerName: order.customerName,
          priority,
          itemCount: items.length,
          items: items.map(i => ({
            name: i.product.name,
            sku: i.product.sku,
            quantity: i.quantity,
            location: i.location,
          })),
          textContent, // Pre-generated text for easy printing
          createdAt: order.createdAt.toISOString(),
        },
        sourceType: 'order',
        sourceId: orderId,
        copies,
        status: 'QUEUED',
      },
    })

    console.log(`[printPickingList] Queued job ${printJob.id} for order ${orderId}`)

    // Return success - the job is queued, print agent will pick it up
    return {
      success: true,
      jobId: printJob.id,
    }
  } catch (error) {
    console.error('[printPickingList] Error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to queue print job',
    }
  }
}

/**
 * Print directly to local printer (used by print agent only)
 * This function is called by the local print agent, NOT by the VPS
 */
export async function printDirectlyToLocalPrinter(
  text: string,
  jobName: string = 'Azteka Print Job',
  copies: number = 1
): Promise<PrintResult> {
  return printTextToHPLaserJet(text, jobName, copies)
}

/**
 * Generate a simulated warehouse location
 * In production, this would come from an inventory management system
 */
function generateWarehouseLocation(productId: string): string {
  // Create a deterministic location based on product ID
  const hash = productId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
  const aisle = String.fromCharCode(65 + (hash % 6)) // A-F
  const bin = ((hash >> 4) % 12) + 1 // 1-12
  const slot = ((hash >> 8) % 4) + 1 // 1-4

  return `${aisle}-${bin.toString().padStart(2, '0')}-${slot}`
}

/**
 * Get list of available printers (via CUPS)
 */
export async function getAvailablePrinters(): Promise<string[]> {
  try {
    const { spawn } = await import('child_process')

    return new Promise((resolve) => {
      const lpstat = spawn('lpstat', ['-p'])
      let output = ''

      lpstat.stdout.on('data', (data) => {
        output += data.toString()
      })

      lpstat.on('close', () => {
        const printers = output
          .split('\n')
          .filter((line) => line.startsWith('printer'))
          .map((line) => {
            const match = line.match(/printer (\S+)/)
            return match ? match[1] : null
          })
          .filter(Boolean) as string[]

        resolve(printers)
      })

      lpstat.on('error', () => {
        resolve([])
      })
    })
  } catch {
    return []
  }
}

/**
 * Test print connection
 */
export async function testPrintConnection(): Promise<PrintResult> {
  const testText = `
========================================
       AZTEKA DSD - TEST PRINT
========================================

Auto-Workflow System Status: ACTIVE

Printer: ${PRINTER_CONFIG.name}
Time: ${new Date().toLocaleString()}
Status: Connected

----------------------------------------

This test confirms the print system is
working correctly. When orders are placed,
picking lists will automatically print
to this printer.

Features enabled:
  [x] Auto-create picking tasks
  [x] Auto-assign to warehouse employees
  [x] Auto-print picking lists
  [x] QR codes for box tracking
  [x] Customer delivery confirmation

========================================
`.trim()

  return printTextToHPLaserJet(testText, 'Azteka Test Print', 1)
}

export { PRINTER_CONFIG }
