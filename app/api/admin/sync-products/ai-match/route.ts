import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import Anthropic from '@anthropic-ai/sdk'

export const dynamic = 'force-dynamic'

// POST /api/admin/sync-products/ai-match
// Uses AI to find the best matches for products that need enrichment
export async function POST(request: NextRequest) {
  try {
    const { productIds } = await request.json()

    if (!productIds || !Array.isArray(productIds) || productIds.length === 0) {
      return NextResponse.json({ error: 'productIds array required' }, { status: 400 })
    }

    // Get products that need matching (max 20 at a time)
    const productsToMatch = await prisma.product.findMany({
      where: {
        id: { in: productIds.slice(0, 20) },
        OR: [
          { imageUrl: null },
          { categoryId: null },
        ],
      },
      select: {
        id: true,
        name: true,
        sku: true,
        price: true,
      },
    })

    if (productsToMatch.length === 0) {
      return NextResponse.json({ matches: [] })
    }

    // Get all complete products (have image AND category) as potential matches
    const completeProducts = await prisma.product.findMany({
      where: {
        imageUrl: { not: null },
        categoryId: { not: null },
      },
      select: {
        id: true,
        name: true,
        sku: true,
        price: true,
        Category: { select: { id: true, name: true } },
        Brand: { select: { id: true, name: true } },
      },
      take: 500, // Limit for performance
    })

    // Get categories and brands for suggestions
    const [categories, brands] = await Promise.all([
      prisma.category.findMany({ select: { id: true, name: true }, orderBy: { name: 'asc' } }),
      prisma.brand.findMany({ select: { id: true, name: true }, orderBy: { name: 'asc' } }),
    ])

    // Build product catalog summary for AI
    const catalogSummary = completeProducts.map(p => ({
      id: p.id,
      name: p.name,
      sku: p.sku,
      category: p.Category?.name,
      brand: p.Brand?.name,
    }))

    const unmatchedProducts = productsToMatch.map(p => ({
      id: p.id,
      name: p.name,
      sku: p.sku,
      price: Number(p.price),
    }))

    // Use Claude to find best matches
    const anthropic = new Anthropic()

    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 4000,
      messages: [{
        role: 'user',
        content: `You are a product matching expert for a wholesale food distributor (Mexican candies, snacks, beverages).

TASK: Match unmatched products to existing catalog products OR suggest category/brand if no match exists.

UNMATCHED PRODUCTS (need matching):
${JSON.stringify(unmatchedProducts, null, 2)}

EXISTING CATALOG (complete products):
${JSON.stringify(catalogSummary.slice(0, 200), null, 2)}

AVAILABLE CATEGORIES:
${categories.map(c => c.name).join(', ')}

AVAILABLE BRANDS:
${brands.map(b => b.name).join(', ')}

For EACH unmatched product, return ONE of:
1. If it's likely a DUPLICATE of an existing product (same product, different name):
   { "type": "merge", "sourceId": "unmatched_id", "targetId": "existing_id", "confidence": 0.9, "reason": "why they match" }

2. If it's a NEW product but you can identify its category/brand:
   { "type": "enrich", "productId": "unmatched_id", "categoryName": "Candy", "brandName": "De La Rosa", "confidence": 0.8, "reason": "identified from name" }

3. If you need a NEW category/brand created:
   { "type": "create", "productId": "unmatched_id", "newCategory": "New Category Name", "newBrand": "New Brand Name", "confidence": 0.7, "reason": "new product line" }

Return ONLY a JSON array of recommendations, no explanation:
[
  { "type": "merge", ... },
  { "type": "enrich", ... }
]

MATCHING TIPS:
- "Mazapan" variations (De La Rosa, Coronado) are usually DIFFERENT brands, not duplicates
- Size variants (1/12, 24ct, etc.) may be same product different packaging
- Spanish/English names may be same product (Paleta = Lollipop)
- SKU barcodes starting same often = same product
- Price similarity can indicate same product`
      }],
    })

    // Parse AI response
    let recommendations: Array<{
      type: 'merge' | 'enrich' | 'create'
      sourceId?: string
      targetId?: string
      productId?: string
      categoryName?: string
      brandName?: string
      newCategory?: string
      newBrand?: string
      confidence: number
      reason: string
    }> = []

    const textContent = response.content.find(c => c.type === 'text')
    if (textContent && textContent.type === 'text') {
      try {
        // Extract JSON from response
        const jsonMatch = textContent.text.match(/\[[\s\S]*\]/)
        if (jsonMatch) {
          recommendations = JSON.parse(jsonMatch[0])
        }
      } catch (parseError) {
        console.error('[AI Match] Failed to parse response:', parseError)
      }
    }

    // Enrich recommendations with full product/category/brand data
    const enrichedRecommendations = await Promise.all(
      recommendations.map(async (rec) => {
        const result: Record<string, unknown> = { ...rec }

        if (rec.type === 'merge' && rec.targetId) {
          const target = completeProducts.find(p => p.id === rec.targetId)
          if (target) {
            result.targetProduct = {
              id: target.id,
              name: target.name,
              sku: target.sku,
              category: target.Category?.name,
              brand: target.Brand?.name,
            }
          }
        }

        if (rec.type === 'enrich') {
          // Find category/brand IDs
          if (rec.categoryName) {
            const cat = categories.find(c =>
              c.name.toLowerCase() === rec.categoryName?.toLowerCase()
            )
            if (cat) result.categoryId = cat.id
          }
          if (rec.brandName) {
            const brand = brands.find(b =>
              b.name.toLowerCase() === rec.brandName?.toLowerCase()
            )
            if (brand) result.brandId = brand.id
          }
        }

        return result
      })
    )

    return NextResponse.json({
      matches: enrichedRecommendations,
      categories,
      brands,
    })
  } catch (error) {
    console.error('[AI Match] Error:', error)
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'AI matching failed',
    }, { status: 500 })
  }
}
