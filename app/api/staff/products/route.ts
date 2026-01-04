import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { cookies } from 'next/headers'

// GET /api/staff/products - Get all products for employee inventory count
export async function GET(request: NextRequest) {
  try {
    // Check employee session
    const cookieStore = await cookies()
    const sessionCookie = cookieStore.get('employee_session')

    if (!sessionCookie?.value) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Decode and validate session
    try {
      const sessionData = JSON.parse(Buffer.from(sessionCookie.value, 'base64').toString())
      if (!sessionData.employeeId || sessionData.exp < Date.now()) {
        return NextResponse.json({ error: 'Session expired' }, { status: 401 })
      }
    } catch {
      return NextResponse.json({ error: 'Invalid session' }, { status: 401 })
    }

    // Get all products for counting
    const products = await prisma.product.findMany({
      select: {
        id: true,
        name: true,
        sku: true,
        caseSku: true,
        imageUrl: true,
        stock: true,
        warehouseLocation: true,
        unitsPerCase: true,
        expirationDate: true,
        minStock: true,
        inStock: true,
        Brand: {
          select: { id: true, name: true }
        },
        Category: {
          select: { id: true, name: true }
        }
      },
      orderBy: { name: 'asc' }
    })

    // Normalize field names for frontend (Brand -> brand, Category -> category)
    const normalizedProducts = products.map(p => ({
      ...p,
      brand: p.Brand,
      category: p.Category,
      Brand: undefined,
      Category: undefined
    }))

    console.log(`[STAFF/PRODUCTS] Found ${products.length} products`)
    return NextResponse.json({ data: normalizedProducts })
  } catch (error) {
    console.error('Staff products error:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
