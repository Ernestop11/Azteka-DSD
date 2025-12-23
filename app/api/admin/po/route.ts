import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import { existsSync } from 'fs'
import { requireAdmin, unauthorizedResponse } from '../../lib/auth'

// PDF parsing - use require for Next.js bundling compatibility
// eslint-disable-next-line @typescript-eslint/no-require-imports
const pdfParseModule = require('pdf-parse')
const pdfParse = pdfParseModule.default || pdfParseModule

// OpenAI for complex invoice parsing (optional fallback)
let openai: any = null
try {
  if (process.env.OPENAI_API_KEY) {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const OpenAI = require('openai').default || require('openai')
    openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  }
} catch (e) {
  console.warn('[PO Parse] OpenAI not available:', e)
}

export const dynamic = 'force-dynamic'

/**
 * GET /api/admin/po
 * List all purchase orders with optional filtering
 */
export async function GET(request: NextRequest) {
  // Require admin authentication
  const user = await requireAdmin(request)
  if (!user) return unauthorizedResponse()

  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const vendorId = searchParams.get('vendorId')
    const limit = parseInt(searchParams.get('limit') || '50')

    const purchaseOrders = await prisma.purchaseOrder.findMany({
      where: {
        ...(status && { status: status as never }),
        ...(vendorId && { vendorId }),
      },
      include: {
        vendor: {
          select: { id: true, name: true, code: true },
        },
        receivedBy: {
          select: { id: true, firstName: true, lastName: true },
        },
        items: {
          select: {
            id: true,
            vendorSku: true,
            description: true,
            quantityOrdered: true,
            quantityReceived: true,
            isNewProduct: true,
            needsReview: true,
            productId: true,
          },
        },
        receivingTask: {
          select: {
            id: true,
            status: true,
            assignee: {
              select: { firstName: true, lastName: true },
            },
          },
        },
        _count: {
          select: { items: true },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
    })

    // Calculate stats for each PO and serialize Decimal values
    const posWithStats = purchaseOrders.map((po) => {
      const totalItems = po.items.length
      const receivedItems = po.items.filter(
        (i) => Number(i.quantityReceived) >= Number(i.quantityOrdered)
      ).length
      const newProducts = po.items.filter((i) => i.isNewProduct).length
      const needsReview = po.items.filter((i) => i.needsReview).length

      return {
        ...po,
        total: Number(po.total),
        items: po.items.map(item => ({
          ...item,
          quantityOrdered: Number(item.quantityOrdered),
          quantityReceived: Number(item.quantityReceived),
        })),
        stats: {
          totalItems,
          receivedItems,
          newProducts,
          needsReview,
          progress: totalItems > 0 ? Math.round((receivedItems / totalItems) * 100) : 0,
        },
      }
    })

    return NextResponse.json({ data: posWithStats })
  } catch (error: unknown) {
    console.error('[GET /api/admin/po] Error:', error)
    const message = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json(
      { error: 'Failed to fetch purchase orders', details: message },
      { status: 500 }
    )
  }
}

/**
 * POST /api/admin/po
 * Upload and parse a PO PDF file
 * Returns parsed data for review before confirmation
 */
export async function POST(request: NextRequest) {
  // Require admin authentication
  const user = await requireAdmin(request)
  if (!user) return unauthorizedResponse()

  try {
    const formData = await request.formData()
    const file = formData.get('file') as File | null
    const vendorIdHint = formData.get('vendorId') as string | null

    if (!file) {
      return NextResponse.json(
        { error: 'PDF file is required' },
        { status: 400 }
      )
    }

    // Validate file type
    if (!file.type.includes('pdf') && !file.name.endsWith('.pdf')) {
      return NextResponse.json(
        { error: 'File must be a PDF' },
        { status: 400 }
      )
    }

    // Read file content
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Parse PDF text
    const pdfData = await pdfParse(buffer)
    const text = pdfData.text

    // Save PDF file
    const uploadsDir = join(process.cwd(), 'public', 'uploads', 'po')
    if (!existsSync(uploadsDir)) {
      await mkdir(uploadsDir, { recursive: true })
    }

    const timestamp = Date.now()
    const filename = `po-${timestamp}.pdf`
    const filepath = join(uploadsDir, filename)
    await writeFile(filepath, buffer)
    const pdfUrl = `/uploads/po/${filename}`

    // Parse the PDF text to extract vendor and items
    const parsed = await parsePOText(text, vendorIdHint)

    return NextResponse.json({
      data: {
        pdfUrl,
        rawText: text.substring(0, 2000), // First 2000 chars for debugging
        ...parsed,
      },
    })
  } catch (error: unknown) {
    console.error('[POST /api/admin/po] Error:', error)
    const message = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json(
      { error: 'Failed to parse PO', details: message },
      { status: 500 }
    )
  }
}

/**
 * Parse PO text to extract vendor, items, and shipping cost
 */
async function parsePOText(text: string, vendorIdHint: string | null) {
  const lines = text.split('\n').map((l) => l.trim()).filter(Boolean)

  // Try to detect vendor from text
  let detectedVendor: { id: string; name: string; code: string | null } | null = null
  let detectedVendorConfidence = 0

  // Get all active vendors
  const vendors = await prisma.vendor.findMany({
    where: { active: true },
    select: { id: true, name: true, code: true },
  })

  // If vendor hint provided, use it
  if (vendorIdHint) {
    detectedVendor = vendors.find((v) => v.id === vendorIdHint) || null
    if (detectedVendor) detectedVendorConfidence = 1.0
  }

  // Try to detect vendor from text if not provided
  if (!detectedVendor) {
    const textLower = text.toLowerCase()
    for (const vendor of vendors) {
      if (textLower.includes(vendor.name.toLowerCase())) {
        detectedVendor = vendor
        detectedVendorConfidence = 0.9
        break
      }
      if (vendor.code && textLower.includes(vendor.code.toLowerCase())) {
        detectedVendor = vendor
        detectedVendorConfidence = 0.8
        break
      }
    }
  }

  // Try to detect PO number
  let poNumber: string | null = null
  const poPatterns = [
    /PO\s*#?\s*:?\s*([A-Z0-9-]+)/i,
    /Purchase\s*Order\s*#?\s*:?\s*([A-Z0-9-]+)/i,
    /Order\s*#?\s*:?\s*([A-Z0-9-]+)/i,
    /Invoice\s*#?\s*:?\s*([A-Z0-9-]+)/i,
  ]
  for (const pattern of poPatterns) {
    const match = text.match(pattern)
    if (match) {
      poNumber = match[1]
      break
    }
  }

  // Try to detect shipping cost
  let shippingCost = 0
  const shippingPatterns = [
    /shipping\s*:?\s*\$?([0-9,.]+)/i,
    /freight\s*:?\s*\$?([0-9,.]+)/i,
    /delivery\s*:?\s*\$?([0-9,.]+)/i,
    /S&H\s*:?\s*\$?([0-9,.]+)/i,
  ]
  for (const pattern of shippingPatterns) {
    const match = text.match(pattern)
    if (match) {
      shippingCost = parseFloat(match[1].replace(/,/g, ''))
      break
    }
  }

  // Try to detect total
  let detectedTotal = 0
  const totalPatterns = [
    /total\s*:?\s*\$?([0-9,.]+)/i,
    /grand\s*total\s*:?\s*\$?([0-9,.]+)/i,
    /amount\s*due\s*:?\s*\$?([0-9,.]+)/i,
  ]
  for (const pattern of totalPatterns) {
    const match = text.match(pattern)
    if (match) {
      detectedTotal = parseFloat(match[1].replace(/,/g, ''))
      break
    }
  }

  // Parse line items - try regex first, then AI if needed
  let items = await parseLineItems(lines, detectedVendor?.id || null)
  
  console.log(`[PO Parse] Regex parsing found ${items.length} items`)

  // If regex parsing found very few items or many items with wrong prices, try AI parsing as fallback
  const itemsWithReasonablePrices = items.filter(item => item.unitCost > 0 && item.unitCost < 1000)
  if ((items.length < 2 || itemsWithReasonablePrices.length < items.length * 0.5) && openai && text.length > 500) {
    console.log('[PO Parse] Regex found few items or many with wrong prices, trying AI fallback...')
    try {
      const aiItems = await parseLineItemsWithAI(text, detectedVendor?.id || null)
      if (aiItems.length > items.length || itemsWithReasonablePrices.length < items.length * 0.5) {
        console.log(`[PO Parse] AI found ${aiItems.length} items vs ${items.length} from regex`)
        items = aiItems
      }
    } catch (aiError) {
      console.error('[PO Parse] AI parsing failed, using regex results:', aiError)
    }
  }
  
  // Filter out items that look like addresses or have invalid data
  items = items.filter(item => {
    // Filter out items with descriptions that look like addresses
    if (item.description.match(/^\d+\s+[A-Z]/) && item.description.match(/(St|Street|Ave|Avenue|Rd|Road|Blvd|Suite|Ste)/i)) {
      return false
    }
    if (item.description.match(/^[A-Z][a-z]+\s+[A-Z][a-z]+,\s*[A-Z]{2}\s+\d{5}/)) {
      return false
    }
    // Filter out items with unreasonable prices (likely parsed wrong)
    if (item.unitCost > 1000 || item.unitCost < 0.01) {
      return false
    }
    // Filter out items with very short or very long descriptions
    if (item.description.length < 3 || item.description.length > 200) {
      return false
    }
    return true
  })

  // Calculate subtotal from items
  const subtotal = items.reduce((sum, item) => sum + item.totalCost, 0)

  return {
    vendorId: detectedVendor?.id || null,
    vendorName: detectedVendor?.name || null,
    vendorConfidence: detectedVendorConfidence,
    poNumber,
    expectedDate: null, // Can be extracted if needed
    shippingCost,
    detectedTotal,
    subtotal,
    total: subtotal + shippingCost,
    items,
    itemCount: items.length,
    newProductCount: items.filter((i) => i.isNewProduct).length,
  }
}

/**
 * Parse line items from PO text lines
 */
async function parseLineItems(
  lines: string[],
  vendorId: string | null
): Promise<
  Array<{
    vendorSku: string
    description: string
    quantityOrdered: number
    unitCost: number
    totalCost: number
    unitsPerCase: number
    matchedProduct: { id: string; name: string; sku: string } | null
    isNewProduct: boolean
    confidence: number
  }>
> {
  const items: Array<{
    vendorSku: string
    description: string
    quantityOrdered: number
    unitCost: number
    totalCost: number
    unitsPerCase: number
    matchedProduct: { id: string; name: string; sku: string } | null
    isNewProduct: boolean
    confidence: number
  }> = []

  // Get existing SKU mappings for this vendor
  const skuMappings = vendorId
    ? await prisma.vendorSkuMapping.findMany({
        where: { vendorId },
        include: {
          product: { select: { id: true, name: true, sku: true } },
        },
      })
    : []

  // Get all products for fuzzy matching
  const products = await prisma.product.findMany({
    select: { id: true, name: true, sku: true, caseSku: true },
  })

  // Enhanced patterns for line items - handle various invoice formats
  // Pattern 1: Description | Pzs/Box (like "10x40") | Qty | Unit Price | Amount
  // Example: "Doraditas Tia Rosa 110g    10x40    400    $1.22    $488.00"
  const invoiceTablePattern =
    /^(.+?)\s+(\d+x\d+|\d+)\s+(\d+)\s+\$?([0-9,.]+)\s+\$?([0-9,.]+)$/i

  // Pattern 2: SKU | Description | Qty | Price | Total
  const itemPattern =
    /^([A-Z0-9-]+)\s+(.+?)\s+(\d+)\s+\$?([0-9,.]+)\s+\$?([0-9,.]+)$/i

  // Pattern 3: Qty | SKU | Description | Price
  const altPattern =
    /^(\d+)\s+([A-Z0-9-]+)\s+(.+?)\s+\$?([0-9,.]+)$/i

  // Pattern 4: Description | Qty (with units like "3pzs") | Price | Total
  const descFirstPattern =
    /^(.+?)\s+(\d+)\s*[a-z]*\s+\$?([0-9,.]+)\s+\$?([0-9,.]+)$/i

  // Pattern 5: Description | Qty | Unit Price | Total (no SKU, no Pzs/Box)
  const noSkuPattern =
    /^(.+?)\s+(\d+)\s+\$?([0-9,.]+)\s+\$?([0-9,.]+)$/i

  for (const line of lines) {
    // Skip empty lines, headers, and totals
    const trimmedLine = line.trim()
    if (!trimmedLine || trimmedLine.length < 10) continue
    
    // Skip header lines
    if (trimmedLine.match(/^(INVOICE|PURCHASE|ORDER|TOTAL|SUB|SHIPPING|DATE|VENDOR|THANK|BILL TO|SHIP TO|#|DESCRIPTION|QTY|UNIT|AMOUNT|PZS\/BOX)/i)) continue
    if (trimmedLine.match(/^TOTAL|^SUBTOTAL|^TAX|^SHIPPING|^DUE/i)) continue
    
    // Skip address lines (common patterns)
    if (trimmedLine.match(/^\d+\s+[A-Z][a-z]+\s+(St|Street|Ave|Avenue|Rd|Road|Blvd|Boulevard|Suite|Ste|#)/i)) continue
    if (trimmedLine.match(/^[A-Z][a-z]+\s+[A-Z][a-z]+,\s*[A-Z]{2}\s+\d{5}/i)) continue // City, State ZIP
    if (trimmedLine.match(/^[A-Z][a-z]+\s+[A-Z][a-z]+\s+LLC|INC|CORP/i)) continue // Company names
    if (trimmedLine.match(/^\+1\s*\(?\d{3}\)?\s*\d{3}[-.]?\d{4}/i)) continue // Phone numbers
    if (trimmedLine.match(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/i)) continue // Email addresses

    let match = line.match(invoiceTablePattern)
    let vendorSku = ''
    let description = ''
    let quantity = 0
    let unitCost = 0
    let totalCost = 0
    let unitsPerCase = 1

    if (match) {
      // Invoice table format: Description | Pzs/Box | Qty | Unit Price | Amount
      description = match[1].trim()
      const pzsBox = match[2] // e.g., "10x40" or "6x40"
      quantity = parseInt(match[3])
      unitCost = parseFloat(match[4].replace(/,/g, ''))
      totalCost = parseFloat(match[5].replace(/,/g, ''))
      
      // Parse Pzs/Box format (e.g., "10x40" = 10 pieces per box, 40 boxes)
      if (pzsBox.includes('x')) {
        const [piecesPerBox, boxes] = pzsBox.split('x').map(n => parseInt(n.trim()))
        if (piecesPerBox && boxes) {
          unitsPerCase = piecesPerBox
          // Verify: piecesPerBox * boxes should equal quantity
          if (piecesPerBox * boxes !== quantity) {
            // Use the quantity from the table, but keep unitsPerCase
            console.log(`[PO Parse] Pzs/Box mismatch: ${pzsBox} doesn't match qty ${quantity}`)
          }
        }
      } else {
        // Single number, treat as pieces per box
        unitsPerCase = parseInt(pzsBox) || 1
      }
      
      // Extract SKU from description (look for alphanumeric codes at start or end)
      const skuMatch = description.match(/\b([A-Z0-9-]{3,})\b/)
      vendorSku = skuMatch ? skuMatch[1] : `ITEM-${items.length + 1}`
    } else {
      // Try other patterns
      match = line.match(itemPattern)
      if (match) {
        vendorSku = match[1]
        description = match[2].trim()
        quantity = parseInt(match[3])
        unitCost = parseFloat(match[4].replace(/,/g, ''))
        totalCost = parseFloat(match[5].replace(/,/g, ''))
      } else {
        match = line.match(altPattern)
        if (match) {
          quantity = parseInt(match[1])
          vendorSku = match[2]
          description = match[3].trim()
          unitCost = parseFloat(match[4].replace(/,/g, ''))
          totalCost = quantity * unitCost
        } else {
          // Try description-first pattern
          match = line.match(descFirstPattern)
          if (match) {
            description = match[1].trim()
            quantity = parseInt(match[2])
            unitCost = parseFloat(match[3].replace(/,/g, ''))
            totalCost = parseFloat(match[4].replace(/,/g, ''))
            const skuMatch = description.match(/\b([A-Z0-9-]{3,})\b/)
            vendorSku = skuMatch ? skuMatch[1] : `ITEM-${items.length + 1}`
          } else {
            // Try no-SKU pattern
            match = line.match(noSkuPattern)
            if (match) {
              description = match[1].trim()
              quantity = parseInt(match[2])
              unitCost = parseFloat(match[3].replace(/,/g, ''))
              totalCost = parseFloat(match[4].replace(/,/g, ''))
              const skuMatch = description.match(/\b([A-Z0-9-]{3,})\b/)
              vendorSku = skuMatch ? skuMatch[1] : `ITEM-${items.length + 1}`
            }
          }
        }
      }
    }

    // Validate we have useful data - be more strict
    if (!description || description.length < 3) continue
    if (description.length > 200) continue // Too long, probably not a product
    if (quantity === 0 || unitCost === 0) continue
    if (unitCost > 10000) continue // Probably parsed wrong (like an address)
    if (!vendorSku) vendorSku = `ITEM-${items.length + 1}`
    
    // Additional validation: description shouldn't look like an address
    if (description.match(/^\d+\s+[A-Z]/) && description.match(/(St|Street|Ave|Avenue|Rd|Road|Blvd|Suite)/i)) continue
    if (description.match(/^[A-Z][a-z]+\s+[A-Z][a-z]+,\s*[A-Z]{2}/)) continue

    // Try to match to existing product
    let matchedProduct: { id: string; name: string; sku: string } | null = null
    let confidence = 0
    let isNewProduct = true

    // First check SKU mappings
    const mapping = skuMappings.find(
      (m) => m.vendorSku.toLowerCase() === vendorSku.toLowerCase()
    )
    if (mapping?.product) {
      matchedProduct = mapping.product
      confidence = mapping.verified ? 1.0 : 0.9
      isNewProduct = false
    }

    // If no mapping, try direct SKU match
    if (!matchedProduct) {
      const directMatch = products.find(
        (p) =>
          p.sku.toLowerCase() === vendorSku.toLowerCase() ||
          p.caseSku?.toLowerCase() === vendorSku.toLowerCase()
      )
      if (directMatch) {
        matchedProduct = { id: directMatch.id, name: directMatch.name, sku: directMatch.sku }
        confidence = 0.8
        isNewProduct = false
      }
    }

    // If still no match, try fuzzy matching on name
    if (!matchedProduct) {
      const descWords = description.toLowerCase().split(/\s+/)
      let bestMatch: typeof products[0] | null = null
      let bestScore = 0

      for (const product of products) {
        const nameWords = product.name.toLowerCase().split(/\s+/)
        const matchingWords = descWords.filter((w) =>
          nameWords.some((nw) => nw.includes(w) || w.includes(nw))
        )
        const score = matchingWords.length / Math.max(descWords.length, nameWords.length)
        if (score > bestScore && score > 0.5) {
          bestScore = score
          bestMatch = product
        }
      }

      if (bestMatch && bestScore > 0.6) {
        matchedProduct = { id: bestMatch.id, name: bestMatch.name, sku: bestMatch.sku }
        confidence = bestScore * 0.7 // Lower confidence for fuzzy match
        isNewProduct = false
      }
    }

    items.push({
      vendorSku,
      description,
      quantityOrdered: quantity,
      unitCost,
      totalCost: totalCost || quantity * unitCost,
      unitsPerCase: unitsPerCase, // Use parsed value
      matchedProduct,
      isNewProduct,
      confidence,
    })
  }

  return items
}

/**
 * Parse line items using GPT-4o-mini for complex invoices
 * Fallback when regex parsing finds very few items
 */
async function parseLineItemsWithAI(
  text: string,
  vendorId: string | null
): Promise<
  Array<{
    vendorSku: string
    description: string
    quantityOrdered: number
    unitCost: number
    totalCost: number
    unitsPerCase: number
    matchedProduct: { id: string; name: string; sku: string } | null
    isNewProduct: boolean
    confidence: number
  }>
> {
  if (!openai) {
    console.log('[PO Parse] OpenAI not available, skipping AI fallback')
    return []
  }

  try {
    console.log('[PO Parse] Using AI to parse complex invoice...')
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini', // Use mini for cost efficiency
      messages: [
        {
          role: 'system',
          content: `You are an expert at extracting line items from purchase orders and invoices.
Extract all product line items from the text. For each item, return:
- vendorSku: Product SKU or code (extract from text, or generate if missing)
- description: Full product name/description
- quantityOrdered: Quantity as a number
- unitCost: Unit price as a number (no currency symbols)
- totalCost: Total price as a number (no currency symbols)
- unitsPerCase: Units per case (default to 1 if not found)

Return ONLY a valid JSON array of items. No explanations, just the array.
Example format: [{"vendorSku":"ABC123","description":"Product Name","quantityOrdered":10,"unitCost":1.64,"totalCost":16.40,"unitsPerCase":1}]`,
        },
        {
          role: 'user',
          content: `Extract all line items from this purchase order/invoice:\n\n${text.substring(0, 4000)}`,
        },
      ],
      temperature: 0.1,
      max_tokens: 2000,
    })

    const content = response.choices[0]?.message?.content
    if (!content) {
      console.log('[PO Parse] No content from AI')
      return []
    }

    // Extract JSON from response
    const jsonMatch = content.match(/\[[\s\S]*\]/)
    if (!jsonMatch) {
      console.log('[PO Parse] No JSON array found in AI response')
      return []
    }

    const aiItems = JSON.parse(jsonMatch[0])
    console.log(`[PO Parse] AI extracted ${aiItems.length} items`)

    // Get existing products for matching
    const products = await prisma.product.findMany({
      select: { id: true, name: true, sku: true, caseSku: true },
    })

    const skuMappings = vendorId
      ? await prisma.vendorSkuMapping.findMany({
          where: { vendorId },
          include: {
            product: { select: { id: true, name: true, sku: true } },
          },
        })
      : []

    // Process AI-extracted items and match to products
    const processedItems = aiItems.map((item: any) => {
      let matchedProduct: { id: string; name: string; sku: string } | null = null
      let isNewProduct = true
      let confidence = 0.7 // AI extraction has good confidence

      // Try SKU mapping first
      const mapping = skuMappings.find(
        (m) => m.vendorSku.toLowerCase() === (item.vendorSku || '').toLowerCase()
      )
      if (mapping?.product) {
        matchedProduct = mapping.product
        isNewProduct = false
        confidence = 0.95
      } else {
        // Try direct SKU match
        const directMatch = products.find(
          (p) =>
            p.sku.toLowerCase() === (item.vendorSku || '').toLowerCase() ||
            p.caseSku?.toLowerCase() === (item.vendorSku || '').toLowerCase()
        )
        if (directMatch) {
          matchedProduct = { id: directMatch.id, name: directMatch.name, sku: directMatch.sku }
          isNewProduct = false
          confidence = 0.85
        } else {
          // Try fuzzy name matching
          const descWords = (item.description || '').toLowerCase().split(/\s+/)
          let bestMatch: typeof products[0] | null = null
          let bestScore = 0

          for (const product of products) {
            const nameWords = product.name.toLowerCase().split(/\s+/)
            const matchingWords = descWords.filter((w) =>
              nameWords.some((nw) => nw.includes(w) || w.includes(nw))
            )
            const score = matchingWords.length / Math.max(descWords.length, nameWords.length)
            if (score > bestScore && score > 0.6) {
              bestScore = score
              bestMatch = product
            }
          }

          if (bestMatch && bestScore > 0.6) {
            matchedProduct = { id: bestMatch.id, name: bestMatch.name, sku: bestMatch.sku }
            isNewProduct = false
            confidence = bestScore * 0.7
          }
        }
      }

      return {
        vendorSku: item.vendorSku || `AI-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
        description: item.description || 'Unknown Product',
        quantityOrdered: parseInt(item.quantityOrdered) || 1,
        unitCost: parseFloat(item.unitCost) || 0,
        totalCost: parseFloat(item.totalCost) || parseFloat(item.unitCost || 0) * (parseInt(item.quantityOrdered) || 1),
        unitsPerCase: parseInt(item.unitsPerCase) || 1,
        matchedProduct,
        isNewProduct,
        confidence,
      }
    })

    return processedItems.filter((item: any) => item.description && item.quantityOrdered > 0 && item.unitCost > 0)
  } catch (error) {
    console.error('[PO Parse] AI parsing error:', error)
    return []
  }
}
