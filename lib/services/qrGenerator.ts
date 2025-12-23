/**
 * QR Code Generator Service for Azteka DSD
 *
 * Generates QR codes for:
 * - Box labels (scanned by driver and customer)
 * - Delivery confirmation links
 * - Product verification
 */

import QRCode from 'qrcode'
import prisma from '@/lib/prisma'

// Base URL for public-facing pages
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://azteka.app'

interface BoxQRData {
  boxId: string
  orderId: string
  items: Array<{
    productId: string
    productName: string
    quantity: number
  }>
  packedAt: string
  packedBy?: string
}

interface QRCodeResult {
  dataUrl: string  // Base64 PNG image
  svg: string      // SVG markup
  url: string      // The URL encoded in the QR
}

/**
 * Generate QR code for a box
 * Contains box ID and link to view contents
 */
export async function generateBoxQR(boxId: string): Promise<QRCodeResult> {
  const box = await prisma.box.findUnique({
    where: { id: boxId },
    include: {
      items: {
        include: { product: true },
      },
      order: true,
    },
  })

  if (!box) {
    throw new Error('Box not found')
  }

  // URL that anyone can scan to see box contents
  const url = `${BASE_URL}/box/${box.qrCode}`

  // Generate QR codes in both formats
  const [dataUrl, svg] = await Promise.all([
    QRCode.toDataURL(url, {
      width: 200,
      margin: 2,
      color: {
        dark: '#1f2937',
        light: '#ffffff',
      },
      errorCorrectionLevel: 'M',
    }),
    QRCode.toString(url, {
      type: 'svg',
      width: 200,
      margin: 2,
      color: {
        dark: '#1f2937',
        light: '#ffffff',
      },
    }),
  ])

  return { dataUrl, svg, url }
}

/**
 * Generate QR code for delivery confirmation
 * Customer scans to confirm delivery
 */
export async function generateDeliveryConfirmationQR(
  orderId: string
): Promise<QRCodeResult> {
  // Get or create delivery confirmation record
  let confirmation = await prisma.deliveryConfirmation.findUnique({
    where: { orderId },
  })

  if (!confirmation) {
    confirmation = await prisma.deliveryConfirmation.create({
      data: { orderId },
    })
  }

  // URL for customer to confirm delivery (no login required)
  const url = `${BASE_URL}/delivery/confirm/${confirmation.token}`

  const [dataUrl, svg] = await Promise.all([
    QRCode.toDataURL(url, {
      width: 200,
      margin: 2,
      color: {
        dark: '#1f2937',
        light: '#ffffff',
      },
      errorCorrectionLevel: 'M',
    }),
    QRCode.toString(url, {
      type: 'svg',
      width: 200,
      margin: 2,
    }),
  ])

  return { dataUrl, svg, url }
}

/**
 * Generate printable box label HTML
 * Includes QR code, order number, and item summary
 */
export async function generateBoxLabelHTML(boxId: string): Promise<string> {
  const box = await prisma.box.findUnique({
    where: { id: boxId },
    include: {
      items: {
        include: { product: true },
      },
      order: true,
    },
  })

  if (!box) {
    throw new Error('Box not found')
  }

  const qr = await generateBoxQR(boxId)
  const totalItems = box.items.reduce((sum: number, item: { quantity: number }) => sum + item.quantity, 0)

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Box Label - ${box.qrCode}</title>
  <style>
    @page { size: 2in 2in; margin: 0; }
    body {
      font-family: Arial, sans-serif;
      margin: 0;
      padding: 8px;
      width: 2in;
      height: 2in;
      box-sizing: border-box;
    }
    .label {
      display: flex;
      flex-direction: column;
      align-items: center;
      height: 100%;
    }
    .qr {
      width: 100px;
      height: 100px;
    }
    .order-number {
      font-size: 12px;
      font-weight: bold;
      margin-top: 4px;
    }
    .customer {
      font-size: 9px;
      color: #666;
      margin-top: 2px;
      text-align: center;
      max-width: 100%;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    .items-count {
      font-size: 10px;
      margin-top: 4px;
      padding: 2px 8px;
      background: #f3f4f6;
      border-radius: 10px;
    }
    .box-id {
      font-size: 8px;
      color: #999;
      margin-top: auto;
    }
  </style>
</head>
<body>
  <div class="label">
    <img class="qr" src="${qr.dataUrl}" alt="QR Code">
    <div class="order-number">#${box.orderId.slice(-8).toUpperCase()}</div>
    <div class="customer">${box.order?.customerName || 'Customer'}</div>
    <div class="items-count">${totalItems} items</div>
    <div class="box-id">${box.qrCode}</div>
  </div>
</body>
</html>
  `.trim()
}

/**
 * Create a new box for an order
 */
export async function createBox(
  orderId: string,
  items: Array<{ productId: string; quantity: number }>
): Promise<{ id: string; qrCode: string }> {
  // Generate unique QR code identifier
  const qrCode = generateBoxQRCode()

  const box = await prisma.box.create({
    data: {
      orderId,
      qrCode,
      status: 'PACKING',
      items: {
        create: items.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
        })),
      },
    },
  })

  return { id: box.id, qrCode: box.qrCode }
}

/**
 * Generate a unique box QR code identifier
 * Format: BOX-XXXXXX (6 alphanumeric characters)
 */
function generateBoxQRCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789' // Excluding similar chars (0/O, 1/I)
  let code = 'BOX-'
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return code
}

/**
 * Seal a box (mark as ready for delivery)
 */
export async function sealBox(boxId: string): Promise<void> {
  await prisma.box.update({
    where: { id: boxId },
    data: {
      status: 'SEALED',
      sealedAt: new Date(),
    },
  })
}

/**
 * Get box contents by QR code (public endpoint data)
 */
export async function getBoxByQRCode(qrCode: string): Promise<{
  orderId: string
  orderNumber?: string
  customer?: string
  items: Array<{
    name: string
    quantity: number
    imageUrl?: string
  }>
  status: string
  sealedAt?: Date
} | null> {
  const box = await prisma.box.findUnique({
    where: { qrCode },
    include: {
      items: {
        include: { product: true },
      },
      order: true,
    },
  })

  if (!box) {
    return null
  }

  return {
    orderId: box.orderId,
    orderNumber: box.orderId.slice(-8).toUpperCase(),
    customer: box.order?.customerName || undefined,
    items: box.items.map((item: { product: { name: string; imageUrl: string | null }; quantity: number }) => ({
      name: item.product.name,
      quantity: item.quantity,
      imageUrl: item.product.imageUrl || undefined,
    })),
    status: box.status,
    sealedAt: box.sealedAt || undefined,
  }
}

/**
 * Generate QR code for product barcode lookup
 * Employees can scan to see product details
 */
export async function generateProductQR(productId: string): Promise<QRCodeResult> {
  const product = await prisma.product.findUnique({
    where: { id: productId },
  })

  if (!product) {
    throw new Error('Product not found')
  }

  // Use SKU if available, otherwise product ID
  const _code = product.sku || productId
  const url = `${BASE_URL}/product/${productId}`

  const [dataUrl, svg] = await Promise.all([
    QRCode.toDataURL(url, {
      width: 150,
      margin: 1,
      errorCorrectionLevel: 'M',
    }),
    QRCode.toString(url, { type: 'svg', width: 150 }),
  ])

  return { dataUrl, svg, url }
}
