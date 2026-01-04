import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    // Get all products with category and vendor info including pricing
    const products = await prisma.product.findMany({
      select: {
        id: true,
        name: true,
        sku: true,
        stock: true,
        minStock: true,
        imageUrl: true,
        price: true,
        cost: true,
        margin: true,
        priceTierA: true,
        priceTierB: true,
        priceTierC: true,
        categoryId: true,
        vendorId: true,
        unitType: true,
        unitsPerCase: true,
        Category: {
          select: { id: true, name: true, slug: true }
        },
        Vendor: {
          select: { id: true, name: true, code: true }
        }
      },
      orderBy: { name: 'asc' }
    })

    // Get categories with product counts
    const categoryCounts = await prisma.product.groupBy({
      by: ['categoryId'],
      _count: { id: true }
    })

    const categories = await prisma.category.findMany({
      select: {
        id: true,
        name: true,
        slug: true,
        imageUrl: true
      },
      orderBy: { displayOrder: 'asc' }
    })

    // Map categories with counts and low stock counts
    const categoriesWithCounts = categories.map(cat => {
      const catProducts = products.filter(p => p.categoryId === cat.id)
      const lowStockCount = catProducts.filter(p => p.stock < p.minStock).length
      return {
        id: cat.id,
        name: cat.name,
        slug: cat.slug,
        imageUrl: cat.imageUrl,
        productCount: catProducts.length,
        lowStockCount
      }
    }).filter(c => c.productCount > 0)

    // Get vendors with product counts
    const vendors = await prisma.vendor.findMany({
      where: { active: true },
      select: {
        id: true,
        name: true,
        code: true
      },
      orderBy: { name: 'asc' }
    })

    const vendorsWithCounts = vendors.map(vendor => {
      const vendorProducts = products.filter(p => p.vendorId === vendor.id)
      const lowStockCount = vendorProducts.filter(p => p.stock < p.minStock).length
      return {
        id: vendor.id,
        name: vendor.name,
        code: vendor.code,
        productCount: vendorProducts.length,
        lowStockCount
      }
    }).filter(v => v.productCount > 0)

    // Calculate summary
    const totalProducts = products.length
    const lowStockCount = products.filter(p => p.stock < p.minStock && p.stock > 0).length
    const outOfStockCount = products.filter(p => p.stock === 0).length
    const totalValue = products.reduce((sum, p) => sum + (p.stock * Number(p.price)), 0)

    // Format products for response with pricing info
    const formattedProducts = products.map(p => {
      const cost = p.cost ? Number(p.cost) : null
      const price = Number(p.price)
      const margin = cost ? ((price - cost) / price * 100) : null

      return {
        id: p.id,
        name: p.name,
        sku: p.sku,
        stock: p.stock,
        minStock: p.minStock,
        imageUrl: p.imageUrl,
        price,
        cost,
        margin: margin?.toFixed(1),
        priceTierA: p.priceTierA ? Number(p.priceTierA) : null,
        priceTierB: p.priceTierB ? Number(p.priceTierB) : null,
        priceTierC: p.priceTierC ? Number(p.priceTierC) : null,
        categoryId: p.categoryId,
        vendorId: p.vendorId,
        categoryName: p.Category?.name,
        vendorName: p.Vendor?.name,
        unitType: p.unitType,
        unitsPerCase: p.unitsPerCase,
        // Calculated profit metrics
        grossProfit: cost ? (price - cost) : null,
        profitPerUnit: cost && p.unitsPerCase ? ((price - cost) / p.unitsPerCase) : null
      }
    })

    return NextResponse.json({
      categories: categoriesWithCounts,
      vendors: vendorsWithCounts,
      products: formattedProducts,
      summary: {
        totalProducts,
        lowStockCount,
        outOfStockCount,
        totalValue
      }
    })
  } catch (error) {
    console.error('Inventory API error:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
