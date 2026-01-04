import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export const dynamic = 'force-dynamic'

// GET /api/rep/products/search?q=search+term
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q') || ''

    if (query.length < 2) {
      return NextResponse.json({ products: [] })
    }

    // Get search terms
    const searchTerms = query.toLowerCase().split(/\s+/).filter(t => t.length > 1)
    const firstTerm = searchTerms[0] || query

    // Search products by name or SKU - simpler query
    const products = await prisma.product.findMany({
      where: {
        OR: [
          { sku: { contains: query, mode: 'insensitive' } },
          { name: { contains: query, mode: 'insensitive' } },
          { name: { contains: firstTerm, mode: 'insensitive' } },
        ]
      },
      select: {
        id: true,
        name: true,
        sku: true,
        price: true,
        Category: {
          select: { name: true }
        }
      },
      orderBy: { name: 'asc' },
      take: 30
    })

    // Score and sort results by relevance
    const queryLower = query.toLowerCase()
    const scoredProducts = products.map(product => {
      let score = 0
      const nameLower = product.name.toLowerCase()
      const skuLower = (product.sku || '').toLowerCase()

      // Exact matches
      if (nameLower === queryLower) score += 100
      if (skuLower === queryLower) score += 90

      // SKU contains query
      if (skuLower.includes(queryLower)) score += 50

      // Name starts with query
      if (nameLower.startsWith(queryLower)) score += 40

      // Name contains full query
      if (nameLower.includes(queryLower)) score += 30

      // Count matching words
      for (const term of searchTerms) {
        if (nameLower.includes(term)) score += 10
        if (skuLower.includes(term)) score += 5
      }

      return { ...product, score }
    })

    // Sort by score descending and take top 15
    scoredProducts.sort((a, b) => b.score - a.score)
    const results = scoredProducts.slice(0, 15).map(({ score, Category, ...product }) => ({
      ...product,
      category: Category // Rename to lowercase for frontend
    }))

    return NextResponse.json({ products: results })
  } catch (error) {
    console.error('[Product Search API] Error:', error)
    return NextResponse.json({
      error: 'Failed to search products',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
