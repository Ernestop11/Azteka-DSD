import { NextRequest, NextResponse } from 'next/server'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import { existsSync } from 'fs'
import { revalidateTag, revalidatePath } from 'next/cache'

import prisma from '@/lib/prisma'
import { normalizeProductImage } from '@/lib/imageUrl'
import { ProductCreateSchema, ProductUpdateSchema } from '@/lib/validation/productSchema'
import type { TApiResponse, ErrorResponse } from '@/types/api'
import { sanitizeIdForFilename } from '@/lib/utils/imageSanitize'
import { requireAdmin, unauthorizedResponse } from '../../lib/auth'

export async function GET(request: NextRequest) {
  // Require admin authentication
  const user = await requireAdmin(request)
  if (!user) return unauthorizedResponse()

  try {
    // Parse query parameters for filtering
    const { searchParams } = new URL(request.url)
    const categoryId = searchParams.get('categoryId')
    const brandId = searchParams.get('brandId')
    const search = searchParams.get('search')

    // Build dynamic where clause
    const where: any = {}

    if (categoryId && categoryId !== 'all') {
      where.categoryId = categoryId
    }

    if (brandId && brandId !== 'all') {
      where.brandId = brandId
    }

    if (search && search.trim()) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { sku: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ]
    }

    // Use minimal select with only core fields that definitely exist
    // Use include for relations to avoid field-by-field selection issues
    // Added take limit to prevent timeout with large datasets
    const products = await prisma.product.findMany({
      where,
      select: {
        id: true,
        name: true,
        sku: true,
        description: true,
        price: true,
        unitsPerCase: true,
        stock: true,
        minStock: true,
        warehouseLocation: true,
        expirationDate: true,
        lotNumber: true,
        imageUrl: true,
        backgroundColor: true,
        backgroundGradient: true,
        featured: true,
        seasonal: true,
        trending: true,
        categoryId: true,
        brandId: true,
        inStock: true,
        allowPresell: true,
        needsReview: true, // Direct field on Product
        createdAt: true,
        updatedAt: true,
        Category: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        Brand: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        // Include PurchaseOrderItem to check if product is new from PO
        PurchaseOrderItem: {
          select: {
            isNewProduct: true,
            needsReview: true,
          },
          where: {
            OR: [
              { isNewProduct: true },
              { needsReview: true },
            ],
          },
          take: 1, // Just need to know if any exist
        },
      },
      orderBy: {
        name: 'asc',
      },
      take: 10000, // Limit to prevent timeout (adjust if needed)
    })

    // Transform relation names and preserve image URLs exactly as stored in database
    const normalizedProducts = products.map((p) => {
      // DON'T normalize imageUrl - return it exactly as stored in database
      // The database has the correct path, and normalization was breaking it
      let imageUrl = p.imageUrl
      
      // Only fix the /prod/ to /products/ path shortening issue
      if (imageUrl && imageUrl.includes('/uploads/prod/')) {
        imageUrl = imageUrl.replace('/uploads/prod/', '/uploads/products/')
      }
      
      // If imageUrl is null/empty, set to null (frontend will handle placeholder)
      if (!imageUrl || imageUrl.trim() === '' || imageUrl === 'null') {
        imageUrl = null
      }
      
      // Check if product needs review (from PO imports)
      // Use direct field first, then check PurchaseOrderItem relation
      const directNeedsReview = p.needsReview === true
      const hasNeedsReviewItem = p.PurchaseOrderItem && p.PurchaseOrderItem.length > 0
      const poNeedsReview = hasNeedsReviewItem && p.PurchaseOrderItem[0]?.needsReview === true
      const isNewProduct = hasNeedsReviewItem && p.PurchaseOrderItem[0]?.isNewProduct === true

      return {
        ...p,
        imageUrl: imageUrl, // Return as-is from database (or null if empty)
        // inStock is already included in select, default to true if null/undefined
        inStock: p.inStock ?? true,
        // allowPresell defaults to false
        allowPresell: p.allowPresell ?? false,
        // Map Prisma relation names to lowercase for frontend consistency
        category: p.Category,
        brand: p.Brand,
        // Add flags for new products from PO (use direct field or PO relation)
        needsReview: directNeedsReview || poNeedsReview || false,
        isNewProduct: isNewProduct || false,
      }
    })

    const response: TApiResponse<typeof normalizedProducts> = { data: normalizedProducts }
    return NextResponse.json(response, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
        'Pragma': 'no-cache',
        'Expires': '0',
      },
    })
  } catch (error: any) {
    console.error('[GET /api/admin/products] Error fetching products:', {
      message: error?.message,
      stack: error?.stack,
      name: error?.name,
      code: error?.code,
      meta: error?.meta,
    })
    const err: ErrorResponse = {
      error: 'Failed to fetch products',
      details: error?.message || String(error),
    }
    return NextResponse.json(err, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  // Require admin authentication
  const user = await requireAdmin(request)
  if (!user) return unauthorizedResponse()

  try {
    // Check if request is FormData (browser sets boundary, so check for multipart)
    const contentType = request.headers.get('content-type') || ''
    let body: any
    let imageFile: File | null = null

    if (contentType.includes('multipart/form-data') || contentType.includes('boundary=')) {
      const formData = await request.formData()
      imageFile = formData.get('image') as File | null
      
      // Extract all form fields
      body = {
        name: formData.get('name'),
        sku: formData.get('sku'),
        description: formData.get('description'),
        price: formData.get('price') ? parseFloat(formData.get('price') as string) : undefined,
        unitsPerCase: formData.get('unitsPerCase') ? parseInt(formData.get('unitsPerCase') as string) : undefined,
        categoryId: formData.get('categoryId') || null,
        brandId: formData.get('brandId') || null,
        imageUrl: formData.get('imageUrl') || null,
        inStock: formData.get('inStock') ? formData.get('inStock') === 'true' : undefined,
        gradientPresetId: formData.get('gradientPresetId') || null,
        glowPresetId: formData.get('glowPresetId') || null,
        splashPresetId: formData.get('splashPresetId') || null,
        featured: formData.get('featured') === 'true',
        seasonal: formData.get('seasonal') === 'true',
        trending: formData.get('trending') === 'true',
        backgroundColor: formData.get('backgroundColor') || null,
        backgroundGradient: formData.get('backgroundGradient') || null,
      }
    } else {
      body = await request.json()
    }
    
    // Validate with Zod schema
    const validationResult = ProductCreateSchema.safeParse(body)
    if (!validationResult.success) {
      const err: ErrorResponse = {
        error: 'Validation failed',
        details: validationResult.error.errors,
      }
      return NextResponse.json(err, { status: 400 })
    }

    const data = validationResult.data

    // Check if SKU already exists
    const existing = await prisma.product.findUnique({
      where: { sku: data.sku },
    })

    if (existing) {
      const err: ErrorResponse = { error: 'SKU already exists' }
      return NextResponse.json(err, { status: 400 })
    }

    // Create product first to get ID
    const product = await prisma.product.create({
      data: {
        name: data.name,
        sku: data.sku,
        description: data.description || null,
        price: data.price,
        unitsPerCase: data.unitsPerCase,
        inStock: data.inStock ?? true,
        categoryId: data.categoryId || null,
        brandId: data.brandId || null,
        imageUrl: data.imageUrl || null,
        // Inventory fields
        stock: data.stock ?? 0,
        warehouseLocation: data.warehouseLocation || null,
        expirationDate: data.expirationDate ? new Date(data.expirationDate) : null,
        lotNumber: data.lotNumber || null,
        // Visual preset fields
        gradientPresetId: data.gradientPresetId || null,
        glowPresetId: data.glowPresetId || null,
        splashPresetId: data.splashPresetId || null,
        // Enhancement flags
        featured: data.featured || false,
        seasonal: data.seasonal || false,
        trending: data.trending || false,
        // Background customization
        backgroundColor: data.backgroundColor || null,
        backgroundGradient: data.backgroundGradient || null,
        // Visual preset fields
        glossLevel: (data as any).glossLevel || 'none',
        sparkle: (data as any).sparkle ?? false,
        badge: (data as any).badge || null,
        theme: (data as any).theme || 'default',
      },
    })

    // Handle image upload if file exists
    let imageUrl = data.imageUrl || null
    if (imageFile) {
      try {
        // Create uploads directory if it doesn't exist
        const uploadsDir = join(process.cwd(), 'public', 'uploads', 'products')
        if (!existsSync(uploadsDir)) {
          await mkdir(uploadsDir, { recursive: true })
        }

        // Sanitize product ID for filename
        const sanitizedId = sanitizeIdForFilename(product.id)
        
        // Save as <productId>.png
        const filename = `${sanitizedId}.png`
        const filepath = join(uploadsDir, filename)

        // Convert file to buffer and save
        const bytes = await imageFile.arrayBuffer()
        const buffer = Buffer.from(bytes)
        await writeFile(filepath, buffer)

        // Update product with image URL
        imageUrl = `/uploads/products/${filename}`
        await prisma.product.update({
          where: { id: product.id },
          data: { imageUrl },
        })
      } catch (error) {
        console.error('Error saving image:', error)
        // Continue without image if upload fails
      }
    }

    // Revalidate ALL caches and paths for real-time sync across ALL pages
    revalidateTag('catalog')
    revalidateTag('products')
    revalidatePath('/catalog')
    revalidatePath(`/catalog/${product.id}`)
    revalidatePath('/employee/inventory')
    revalidatePath('/employee/products')
    revalidatePath('/admin/products')
    revalidatePath('/admin')
    revalidatePath('/')

    // Fetch complete product with relations
    const productWithRelations = await prisma.product.findUnique({
      where: { id: product.id },
      include: {
        Category: true,
        Brand: true,
      },
    })

    // Normalize image URL in response and transform relation names
    const normalizedProduct = productWithRelations ? {
      ...productWithRelations,
      imageUrl: normalizeProductImage({ imageUrl: productWithRelations.imageUrl }),
      category: productWithRelations.Category,
      brand: productWithRelations.Brand,
    } : null

    const response: TApiResponse<typeof normalizedProduct> = { data: normalizedProduct }
    return NextResponse.json(response)
  } catch (error: any) {
    console.error('Error creating product:', error)
    const err: ErrorResponse = {
      error: 'Failed to create product',
      details: error?.message || String(error),
    }
    return NextResponse.json(err, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  // Require admin authentication
  const user = await requireAdmin(request)
  if (!user) return unauthorizedResponse()

  try {
    const contentType = request.headers.get('content-type') || ''
    let id: string = ''
    let body: any = {}
    let imageFile: File | null = null

    // Handle both FormData and JSON
    if (contentType.includes('multipart/form-data') || contentType.includes('boundary=')) {
      const formData = await request.formData()
      id = formData.get("id") as string
      imageFile = formData.get("image") as File | null

      // Extract all form fields
      formData.forEach((value, key) => {
        if (key !== 'image' && key !== 'id') {
          body[key] = value
        }
      })
    } else {
      const json = await request.json()
      id = json.id
      body = json
    }

    if (!id) {
      return NextResponse.json({ error: "ID required" }, { status: 400 })
    }

    const updateData: any = {}

    // String fields
    const stringFields = ['name', 'sku', 'description', 'categoryId', 'brandId', 'imageUrl',
      'backgroundColor', 'backgroundGradient', 'gradientPresetId', 'glowPresetId', 'splashPresetId',
      'badge', 'theme', 'glossLevel', 'badgeText', 'badgeColor', 'tier']
    stringFields.forEach(field => {
      if (body[field] !== undefined) {
        updateData[field] = body[field] || null
      }
    })

    // Number fields
    if (body.price !== undefined) updateData.price = parseFloat(body.price)
    if (body.unitsPerCase !== undefined) updateData.unitsPerCase = parseInt(body.unitsPerCase)
    if (body.priceTierA !== undefined) updateData.priceTierA = body.priceTierA ? parseFloat(body.priceTierA) : null
    if (body.priceTierB !== undefined) updateData.priceTierB = body.priceTierB ? parseFloat(body.priceTierB) : null
    if (body.priceTierC !== undefined) updateData.priceTierC = body.priceTierC ? parseFloat(body.priceTierC) : null
    if (body.points !== undefined) updateData.points = body.points ? parseInt(body.points) : null

    // Boolean fields
    const boolFields = ['inStock', 'featured', 'seasonal', 'trending', 'sparkle']
    boolFields.forEach(field => {
      if (body[field] !== undefined) {
        updateData[field] = body[field] === true || body[field] === 'true'
      }
    })

    // Handle image upload if file exists
    // IMPORTANT: Use product ID as filename for consistency across all UIs
    if (imageFile && imageFile.size > 0) {
      try {
        const uploadsDir = join(process.cwd(), "public", "uploads", "products")
        if (!existsSync(uploadsDir)) {
          await mkdir(uploadsDir, { recursive: true })
        }

        const buffer = Buffer.from(await imageFile.arrayBuffer())
        // Use product ID as filename - overwrites existing image
        const filename = `${id}.png`
        const filepath = join(uploadsDir, filename)
        await writeFile(filepath, buffer)
        updateData.imageUrl = `/uploads/products/${filename}`
      } catch (error) {
        console.error("PUT /products image upload error:", error)
      }
    }

    console.log('[PUT /api/admin/products] Updating product:', { id, updateData })

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ error: "No fields to update" }, { status: 400 })
    }

    const updated = await prisma.product.update({
      where: { id },
      data: updateData,
      include: {
        Category: true,
        Brand: true,
      },
    })

    // Revalidate cache
    // Revalidate ALL caches and paths for real-time sync across ALL pages
    revalidateTag('catalog')
    revalidateTag('products')
    revalidateTag('catalog-layout')
    revalidatePath('/catalog')
    revalidatePath(`/catalog/${id}`)
    revalidatePath('/employee/inventory')
    revalidatePath('/employee/products')
    revalidatePath('/admin/products')
    revalidatePath('/admin')
    revalidatePath('/')

    const normalizedProduct = {
      ...updated,
      imageUrl: normalizeProductImage({ imageUrl: updated.imageUrl }),
      category: updated.Category,
      brand: updated.Brand,
    }

    return NextResponse.json({ data: normalizedProduct })
  } catch (error: any) {
    console.error("PUT /products error:", error)
    return NextResponse.json({ error: "Server error", details: error.message }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  // Require admin authentication
  const user = await requireAdmin(request)
  if (!user) return unauthorizedResponse()

  try {
    const body = await request.json()
    const { id } = body

    if (!id) {
      return NextResponse.json(
        { error: 'Product ID is required' },
        { status: 400 }
      )
    }

    await prisma.product.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting product:', error)
    return NextResponse.json(
      { error: 'Failed to delete product' },
      { status: 500 }
    )
  }
}
