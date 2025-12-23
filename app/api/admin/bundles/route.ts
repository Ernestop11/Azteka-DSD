import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import { existsSync } from 'fs'
import { revalidateTag, revalidatePath } from 'next/cache'
import { getPublicImageUrl } from '@/lib/imageUrl'
import type { TApiResponse, ErrorResponse } from '@/types/api'
import { requireAdmin, unauthorizedResponse } from '../../lib/auth'

export const dynamic = 'force-dynamic'

// Helper to generate slug from name
function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

// GET - List all bundles
export async function GET(request: NextRequest) {
  // Require admin authentication
  const user = await requireAdmin()
  if (!user) return unauthorizedResponse()

  try {
    const { searchParams } = new URL(request.url)
    const active = searchParams.get('active')
    const categoryId = searchParams.get('categoryId')
    const brandId = searchParams.get('brandId')
    const featured = searchParams.get('featured')
    const search = searchParams.get('search')
    const limit = parseInt(searchParams.get('limit') || '100')
    const offset = parseInt(searchParams.get('offset') || '0')

    const where: any = {}
    
    if (active !== null) where.active = active === 'true'
    if (categoryId) where.categoryId = categoryId
    if (brandId) where.brandId = brandId
    if (featured !== null) where.featured = featured === 'true'
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { sku: { contains: search, mode: 'insensitive' } },
      ]
    }

    const [bundles, total] = await Promise.all([
      (prisma as any).productBundle.findMany({
        where,
        include: {
          category: {
            select: { id: true, name: true, slug: true },
          },
          brand: {
            select: { id: true, name: true, slug: true },
          },
          items: {
            include: {
              product: {
                select: {
                  id: true,
                  name: true,
                  sku: true,
                  price: true,
                  imageUrl: true,
                },
              },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset,
      }),
      (prisma as any).productBundle.count({ where }),
    ])

    const normalizedBundles = bundles.map((bundle: any) => ({
      ...bundle,
      imageUrl: getPublicImageUrl(bundle.imageUrl),
      price: Number(bundle.price),
      discountPercent: Number(bundle.discountPercent),
      stock: bundle.stock || 0,
      minStock: bundle.minStock || 5,
    }))

    const response: TApiResponse<typeof normalizedBundles> = {
      data: normalizedBundles,
      meta: {
        total,
        limit,
        offset,
        hasMore: offset + limit < total,
      },
    }

    return NextResponse.json(response)
  } catch (error: any) {
    console.error('Error fetching bundles:', error)
    const err: ErrorResponse = {
      error: 'Failed to fetch bundles',
      details: error?.message || String(error),
    }
    return NextResponse.json(err, { status: 500 })
  }
}

// POST - Create new bundle
export async function POST(request: NextRequest) {
  // Require admin authentication
  const user = await requireAdmin()
  if (!user) return unauthorizedResponse()

  try {
    const formData = await request.formData()
    
    const name = formData.get('name') as string
    if (!name) {
      return NextResponse.json({ error: 'Bundle name is required' }, { status: 400 })
    }

    const slug = generateSlug(name)
    const sku = formData.get('sku') as string | null
    const description = formData.get('description') as string | null
    const categoryId = formData.get('categoryId') as string | null
    const brandId = formData.get('brandId') as string | null
    const price = formData.get('price') ? parseFloat(formData.get('price') as string) : null
    const discountPercent = formData.get('discountPercent') ? parseFloat(formData.get('discountPercent') as string) : 0
    const stock = formData.get('stock') ? parseInt(formData.get('stock') as string) : 0
    const minStock = formData.get('minStock') ? parseInt(formData.get('minStock') as string) : 5
    const inStock = formData.get('inStock') === 'true' || formData.get('inStock') === null
    const featured = formData.get('featured') === 'true'
    const active = formData.get('active') !== 'false'
    const badgeText = formData.get('badgeText') as string | null
    const badgeColor = (formData.get('badgeColor') as string) || '#10b981'
    const businessModes = formData.get('businessModes') 
      ? JSON.parse(formData.get('businessModes') as string) 
      : []
    const itemsJson = formData.get('items') as string
    const items = itemsJson ? JSON.parse(itemsJson) : []
    const imageFile = formData.get('image') as File | null

    // Calculate price from items if not provided
    let finalPrice = price
    if (!finalPrice && items.length > 0) {
      const productIds = items.map((item: any) => item.productId)
      const products = await prisma.product.findMany({
        where: { id: { in: productIds } },
        select: { id: true, price: true },
      })
      
      finalPrice = items.reduce((total: number, item: any) => {
        const product = products.find(p => p.id === item.productId)
        const productPrice = Number(product?.price || 0)
        return total + (productPrice * (item.quantity || 1))
      }, 0)
      
      // Apply discount
      if (discountPercent > 0 && finalPrice !== null) {
        finalPrice = finalPrice * (1 - discountPercent / 100)
      }
    }

    if (!finalPrice || finalPrice <= 0) {
      return NextResponse.json({ error: 'Bundle price is required or could not be calculated' }, { status: 400 })
    }

    // Handle image upload
    let imageUrl: string | null = null
    if (imageFile) {
      try {
        const uploadsDir = join(process.cwd(), 'public', 'uploads', 'bundles')
        if (!existsSync(uploadsDir)) {
          await mkdir(uploadsDir, { recursive: true })
        }

        const bytes = await imageFile.arrayBuffer()
        const buffer = Buffer.from(bytes)
        const filename = `${Date.now()}-${imageFile.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`
        const filepath = join(uploadsDir, filename)
        
        await writeFile(filepath, buffer)
        imageUrl = `/uploads/bundles/${filename}`
      } catch (error) {
        console.error('Error saving bundle image:', error)
        // Continue without image
      }
    }

    // Create bundle
    const bundle = await (prisma as any).productBundle.create({
      data: {
        name,
        slug,
        sku: sku || null,
        description: description || null,
        imageUrl,
        badgeText: badgeText || null,
        badgeColor,
        discountPercent,
        price: finalPrice,
        stock,
        minStock,
        inStock,
        featured,
        active,
        categoryId: categoryId || null,
        brandId: brandId || null,
        businessModes: businessModes || [],
      },
    })

    // Create bundle items
    if (items.length > 0) {
      await Promise.all(
        items.map((item: any) =>
          (prisma as any).bundleItem.create({
            data: {
              bundleId: bundle.id,
              productId: item.productId,
              quantity: item.quantity || 1,
            },
          })
        )
      )
    }

    // Revalidate cache
    revalidateTag('bundles')
    revalidatePath('/admin/bundles')
    revalidatePath('/catalog')

    const response: TApiResponse<typeof bundle> = { data: bundle }
    return NextResponse.json(response, { status: 201 })
  } catch (error: any) {
    console.error('[BUNDLES API] Error creating bundle:', error)
    console.error('[BUNDLES API] Error details:', {
      message: error?.message,
      stack: error?.stack,
      name: error?.name,
    })
    const err: ErrorResponse = {
      error: 'Failed to create bundle',
      details: error?.message || String(error),
    }
    return NextResponse.json(err, { status: 500 })
  }
}

