import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import OpenAI from 'openai'

export const dynamic = 'force-dynamic'

// Use OpenAI GPT-4o for images, Anthropic Claude for PDFs (native support)
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

// POST /api/rep/parse-invoice - Parse invoice image/PDF using AI Vision
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    // Convert file to base64
    const bytes = await file.arrayBuffer()
    const base64 = Buffer.from(bytes).toString('base64')

    // Determine media type
    const isPdf = file.type === 'application/pdf'
    let mediaType: 'image/jpeg' | 'image/png' | 'image/gif' | 'image/webp' = 'image/png'

    if (file.type === 'image/jpeg' || file.type === 'image/jpg') {
      mediaType = 'image/jpeg'
    } else if (file.type === 'image/png') {
      mediaType = 'image/png'
    } else if (file.type === 'image/gif') {
      mediaType = 'image/gif'
    } else if (file.type === 'image/webp') {
      mediaType = 'image/webp'
    }

    // Build the prompt text - optimized for QuickBooks invoices
    const promptText = `You are extracting data from a QuickBooks invoice from Azteka Foods LLC wholesale food distributor.

CRITICAL - READ THE SHIP TO SECTION CAREFULLY:
1. The "Ship To" section contains the CUSTOMER info (the store receiving goods)
2. Look for store numbers! Examples: "La Superior #1", "La Superior 2", "Store #5"
3. The businessName MUST include the store number if present (e.g., "La Superior #1" not just "La Superior")
4. You MUST extract EVERY SINGLE LINE ITEM from the invoice table - there may be 60+ products
5. DO NOT STOP EARLY - continue until you have extracted ALL products

INVOICE STRUCTURE:
- Header: Azteka Foods LLC (seller) - IGNORE this for customer info
- Ship To section: Customer name WITH STORE NUMBER, address, phone - EXTRACT this carefully
- Table columns: Item (SKU) | Description | Qty | Rate | Amount
- Footer: Subtotal, Tax, TOTAL

Return ONLY valid JSON (no markdown, no code blocks, no explanation):
{
  "invoiceNumber": "the Invoice # number",
  "invoiceDate": "YYYY-MM-DD",
  "customer": {
    "businessName": "FULL customer name including store number (e.g., 'La Superior #1' not just 'La Superior')",
    "contactName": "",
    "phone": "10-digit phone from Ship To, e.g. 7072559068",
    "email": "",
    "address": "street address from Ship To",
    "city": "city from Ship To",
    "state": "CA",
    "zipCode": "zip code from Ship To"
  },
  "products": [
    {"sku": "804483001017", "name": "La Zamorana Palanqueta De Coco 1/7", "quantity": 7, "unitPrice": 2.50, "total": 17.50}
  ],
  "subtotal": 0.00,
  "tax": 0.00,
  "total": 0.00,
  "rawText": ""
}

CRITICAL RULES:
1. businessName MUST include store number if present in Ship To (e.g., "La Superior #1", not "La Superior")
2. Phone: Extract exactly as shown, digits only (e.g., "(707) 255-9068" becomes "7072559068")
3. Address, city, zipCode: Extract EXACTLY from Ship To section
4. For EACH product row: sku=Item column, name=Description, quantity=Qty, unitPrice=Rate, total=Amount
5. ALL numbers must be actual numbers not strings
6. Extract the TOTAL from the invoice footer - this is the actual invoice total
7. Count your products - if invoice shows 60 items, you must have 60 products in the array`

    let textContent: string

    if (isPdf) {
      // Use Anthropic Claude for PDFs (native PDF support)
      if (!process.env.ANTHROPIC_API_KEY) {
        console.error('[Parse Invoice] Missing ANTHROPIC_API_KEY for PDF parsing')
        return NextResponse.json({
          error: 'PDF parsing requires Anthropic API key. Please take a screenshot of the invoice and upload as an image instead.',
          details: 'Server configuration issue'
        }, { status: 500 })
      }

      console.log('[Parse Invoice] Using Claude for native PDF parsing')

      try {
        // Use the beta API with PDF document type
        const response = await fetch('https://api.anthropic.com/v1/messages', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': process.env.ANTHROPIC_API_KEY || '',
            'anthropic-version': '2023-06-01',
            'anthropic-beta': 'pdfs-2024-09-25',
          },
          body: JSON.stringify({
            model: 'claude-sonnet-4-20250514',
            max_tokens: 16384,
            messages: [
              {
                role: 'user',
                content: [
                  {
                    type: 'document',
                    source: {
                      type: 'base64',
                      media_type: 'application/pdf',
                      data: base64,
                    },
                  },
                  {
                    type: 'text',
                    text: promptText,
                  },
                ],
              },
            ],
          }),
        })

        if (!response.ok) {
          const errorData = await response.json()
          console.error('[Parse Invoice] Claude API error:', errorData)
          throw new Error(errorData.error?.message || 'Claude API request failed')
        }

        const data = await response.json()
        const content = data.content?.[0]
        textContent = content?.type === 'text' ? content.text : ''

        if (!textContent) {
          throw new Error('No response from Claude')
        }

        console.log('[Parse Invoice] Claude PDF response received, length:', textContent.length)
      } catch (pdfError) {
        console.error('[Parse Invoice] Claude PDF parsing failed:', pdfError)
        return NextResponse.json({
          error: 'Failed to parse this PDF. Please try uploading a screenshot of the invoice instead.',
          details: pdfError instanceof Error ? pdfError.message : 'Unknown error'
        }, { status: 500 })
      }
    } else {
      // Use OpenAI GPT-4o for images
      if (!process.env.OPENAI_API_KEY) {
        console.error('[Parse Invoice] Missing OPENAI_API_KEY')
        return NextResponse.json({ error: 'Server configuration error: Missing API key' }, { status: 500 })
      }

      console.log('[Parse Invoice] Using GPT-4o Vision for image parsing')

      const response = await openai.chat.completions.create({
        model: process.env.OPENAI_VISION_MODEL || 'gpt-4o',
        max_tokens: 16384,
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'image_url',
                image_url: {
                  url: `data:${mediaType};base64,${base64}`,
                  detail: 'high'
                }
              },
              {
                type: 'text',
                text: promptText,
              },
            ],
          },
        ],
      })

      const content = response.choices[0]?.message?.content
      textContent = content || ''

      if (!textContent) {
        throw new Error('No response from GPT-4o')
      }

      console.log('[Parse Invoice] GPT-4o response received, length:', textContent.length)
    }

    // Check if AI refused to process the image
    if (textContent.toLowerCase().includes("can't assist") ||
        textContent.toLowerCase().includes("cannot assist") ||
        textContent.toLowerCase().includes("sorry") && !textContent.includes('{')) {
      console.error('[Parse Invoice] AI refused to process image:', textContent)
      return NextResponse.json({
        error: 'The AI could not process this image. Please try a clearer photo or screenshot of the invoice.',
        details: 'The image may be too blurry, have poor lighting, or contain content that triggered content filters.'
      }, { status: 400 })
    }

    // Parse the JSON response
    let extractedData
    try {
      // Try to find JSON in the response (may be wrapped in markdown)
      let jsonStr = textContent

      // Remove markdown code blocks if present
      const jsonMatch = textContent.match(/```(?:json)?\s*([\s\S]*?)```/)
      if (jsonMatch) {
        jsonStr = jsonMatch[1].trim()
      } else {
        // Try to find raw JSON object
        const rawMatch = textContent.match(/\{[\s\S]*\}/)
        if (rawMatch) {
          jsonStr = rawMatch[0]
        }
      }

      extractedData = JSON.parse(jsonStr)
    } catch (parseError) {
      console.error('[Parse Invoice] Failed to parse GPT-4o response:', textContent.slice(0, 500))
      throw new Error('Failed to parse invoice data from AI response')
    }

    // Look up existing customer - use multiple strategies for accurate matching
    let existingCustomer = null
    const customerName = extractedData.customer?.businessName || ''
    const customerAddress = extractedData.customer?.address || ''
    const customerPhone = extractedData.customer?.phone?.replace(/\D/g, '') || ''

    // Strategy 1: Try exact match on store number (e.g., "La Superior #1")
    const storeNumberMatch = customerName.match(/la\s*superior\s*#?(\d+)/i)
    if (storeNumberMatch) {
      const storeNum = storeNumberMatch[1]
      existingCustomer = await prisma.customer.findFirst({
        where: {
          businessName: { contains: `#${storeNum}`, mode: 'insensitive' }
        },
        select: { id: true, businessName: true, priceTier: true }
      })
      if (existingCustomer) {
        console.log(`[Parse Invoice] Matched by store number #${storeNum}: ${existingCustomer.businessName}`)
      }
    }

    // Strategy 2: Try address match if we have address info
    if (!existingCustomer && customerAddress && customerAddress.length > 5) {
      // Extract street number for matching
      const streetMatch = customerAddress.match(/^(\d+)\s+/)
      if (streetMatch) {
        existingCustomer = await prisma.customer.findFirst({
          where: {
            address: { startsWith: streetMatch[1], mode: 'insensitive' }
          },
          select: { id: true, businessName: true, priceTier: true }
        })
        if (existingCustomer) {
          console.log(`[Parse Invoice] Matched by address ${streetMatch[1]}: ${existingCustomer.businessName}`)
        }
      }
    }

    // Strategy 3: Try phone match (only if 10 digits)
    if (!existingCustomer && customerPhone.length >= 10) {
      const last10 = customerPhone.slice(-10)
      existingCustomer = await prisma.customer.findFirst({
        where: {
          phone: { contains: last10 }
        },
        select: { id: true, businessName: true, priceTier: true }
      })
      if (existingCustomer) {
        console.log(`[Parse Invoice] Matched by phone ${last10}: ${existingCustomer.businessName}`)
      }
    }

    // Strategy 4: If name is very specific (has unique words), try name match
    if (!existingCustomer && customerName.length > 10) {
      // Only do loose match if name is unique enough (not just "La Superior")
      const isGenericSuperior = /^la\s*superior\s*$/i.test(customerName.trim())
      if (!isGenericSuperior) {
        existingCustomer = await prisma.customer.findFirst({
          where: {
            businessName: { equals: customerName, mode: 'insensitive' }
          },
          select: { id: true, businessName: true, priceTier: true }
        })
        if (existingCustomer) {
          console.log(`[Parse Invoice] Matched by exact name: ${existingCustomer.businessName}`)
        }
      }
    }

    if (existingCustomer) {
      extractedData.customer.existingId = existingCustomer.id
      extractedData.customer.isNew = false
      console.log(`[Parse Invoice] Final customer match: ${existingCustomer.businessName} (${existingCustomer.id})`)
    } else {
      extractedData.customer.isNew = true
      console.log(`[Parse Invoice] No customer match found, will create new`)
    }

    // Look up existing products and calculate price variance
    const allProducts = await prisma.product.findMany({
      select: { id: true, name: true, sku: true, price: true }
    })

    // Build lookup maps
    const productMap = new Map(allProducts.map(p => [p.sku?.toLowerCase(), p]))

    // Normalize product name for matching (remove size suffixes, clean up)
    const normalizeName = (name: string): string => {
      return name
        .toLowerCase()
        .replace(/\s+\d+\/\d+\w*$/i, '') // Remove "1/12", "12/6oz", etc.
        .replace(/\s+\d+ct$/i, '') // Remove "24ct"
        .replace(/\s+\d+g$/i, '') // Remove "75g"
        .replace(/\s+\d+ml$/i, '') // Remove "180ml"
        .replace(/\s+\d+oz$/i, '') // Remove "6oz"
        .replace(/[^\w\s]/g, '') // Remove special chars
        .replace(/\s+/g, ' ') // Normalize spaces
        .trim()
    }

    // Extract key words from product name for fuzzy matching
    const extractKeyWords = (name: string): string[] => {
      const normalized = normalizeName(name)
      // Get words longer than 2 chars
      return normalized.split(' ').filter(w => w.length > 2)
    }

    // Calculate similarity score between two product names
    const calculateSimilarity = (name1: string, name2: string): number => {
      const words1 = extractKeyWords(name1)
      const words2 = extractKeyWords(name2)

      if (words1.length === 0 || words2.length === 0) return 0

      let matchCount = 0
      for (const w1 of words1) {
        for (const w2 of words2) {
          // Exact match
          if (w1 === w2) {
            matchCount += 1
            break
          }
          // Fuzzy match (common typos: grin/green, slock/block, etc.)
          if (w1.length >= 4 && w2.length >= 4) {
            // Check if words share same start (3+ chars)
            if (w1.slice(0, 3) === w2.slice(0, 3) && Math.abs(w1.length - w2.length) <= 2) {
              matchCount += 0.8
              break
            }
            // Check if one contains the other
            if (w1.includes(w2) || w2.includes(w1)) {
              matchCount += 0.7
              break
            }
          }
        }
      }

      // Score based on proportion of matched words
      const maxWords = Math.max(words1.length, words2.length)
      return matchCount / maxWords
    }

    // Find best matching product using fuzzy matching
    const findBestMatch = (invoiceProduct: { sku: string, name: string }) => {
      // First try exact SKU match
      if (invoiceProduct.sku) {
        const skuMatch = productMap.get(invoiceProduct.sku.toLowerCase())
        if (skuMatch) return { product: skuMatch, score: 1, matchType: 'sku' }
      }

      // Try fuzzy name matching
      let bestMatch: typeof allProducts[0] | null = null
      let bestScore = 0

      for (const dbProduct of allProducts) {
        const score = calculateSimilarity(invoiceProduct.name, dbProduct.name)
        if (score > bestScore && score >= 0.6) { // Minimum 60% match
          bestScore = score
          bestMatch = dbProduct
        }
      }

      if (bestMatch) {
        return { product: bestMatch, score: bestScore, matchType: 'fuzzy' }
      }

      return null
    }

    // Ensure products array exists
    if (!extractedData.products || !Array.isArray(extractedData.products)) {
      extractedData.products = []
    }

    extractedData.products = extractedData.products.map((product: {
      sku: string
      name: string
      quantity: number
      unitPrice: number
      total: number
    }, index: number) => {
      // Find best match using improved matching
      const matchResult = findBestMatch(product)
      const matched = matchResult?.product || null

      let priceVariance = 0
      let suggestedRule = ''

      if (matched) {
        const basePrice = Number(matched.price)
        if (basePrice > 0) {
          priceVariance = ((product.unitPrice - basePrice) / basePrice) * 100

          // Suggest price rule based on variance
          if (Math.abs(priceVariance) > 0.5) {
            if (priceVariance < 0) {
              const discount = Math.round(Math.abs(priceVariance))
              if (discount === 5 || discount === 10 || discount === 15 || discount === 20) {
                suggestedRule = `${discount}% discount`
              } else {
                suggestedRule = `Fixed $${product.unitPrice.toFixed(2)}`
              }
            } else {
              suggestedRule = `Fixed $${product.unitPrice.toFixed(2)} (markup)`
            }
          }
        }
      }

      return {
        id: `item-${index}`,
        sku: product.sku || '',
        name: product.name,
        quantity: product.quantity,
        unitPrice: product.unitPrice,
        total: product.total,
        isNewProduct: !matched,
        existingProductId: matched?.id,
        matchedProductName: matched?.name,
        matchScore: matchResult?.score,
        matchType: matchResult?.matchType,
        priceVariance: matched ? priceVariance : undefined,
        suggestedRule: suggestedRule || undefined,
      }
    })

    return NextResponse.json(extractedData)
  } catch (error) {
    console.error('[Parse Invoice API] Error:', error)
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Failed to parse invoice'
    }, { status: 500 })
  }
}
