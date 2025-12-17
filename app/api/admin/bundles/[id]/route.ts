import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { writeFile, mkdir, unlink } from 'fs/promises'
import { join } from 'path'
import { existsSync } from 'fs'
import { revalidateTag, revalidatePath } from 'next/cache'
import { getPublicImageUrl } from '@/lib/imageUrl'
import type { TApiResponse, ErrorResponse } from '@/types/api'

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

// GET - Get single bundle
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const bundle = await (prisma as any).productBundle.findUnique({
      where: { id: params.id },
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
                unitsPerCase: true,
              },
            },
          },
        },
      },
    })

    if (!bundle) {
      return NextResponse.json({ error: 'Bundle not found' }, { status: 404 })
    }

    const normalizedBundle = {
      ...bundle,
      imageUrl: getPublicImageUrl(bundle.imageUrl),
      price: Number(bundle.price),
      discountPercent: Number(bundle.discountPercent),
      stock: bundle.stock || 0,
      minStock: bundle.minStock || 5,
    }

    const response: TApiResponse<typeof normalizedBundle> = { data: normalizedBundle }
    return NextResponse.json(response)
  } catch (error: any) {
    console.error('Error fetching bundle:', error)
    const err: ErrorResponse = {
      error: 'Failed to fetch bundle',
      details: error?.message || String(error),
    }
    return NextResponse.json(err, { status: 500 })
  }
}

// PUT - Update bundle
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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
    const inStock = formData.get('inStock') === 'true'
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
    const removeImage = formData.get('removeImage') === 'true'

    // Get existing bundle
    const existingBundle = await (prisma as any).productBundle.findUnique({
      where: { id: params.id },
    })

    if (!existingBundle) {
      return NextResponse.json({ error: 'Bundle not found' }, { status: 404 })
    }

    // Calculate price from items if not provided
    let finalPrice = price || Number(existingBundle.price)
    if (!price && items.length > 0) {
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
      if (discountPercent > 0) {
        finalPrice = finalPrice * (1 - discountPercent / 100)
      }
    }

    // Handle image upload
    let imageUrl: string | null = existingBundle.imageUrl
    if (removeImage) {
      // Delete old image if exists
      if (imageUrl && imageUrl.startsWith('/uploads/')) {
        const oldImagePath = join(process.cwd(), 'public', imageUrl)
        if (existsSync(oldImagePath)) {
          await unlink(oldImagePath).catch(() => {})
        }
      }
      imageUrl = null
    } else if (imageFile) {
      try {
        // Delete old image if exists
        if (imageUrl && imageUrl.startsWith('/uploads/')) {
          const oldImagePath = join(process.cwd(), 'public', imageUrl)
          if (existsSync(oldImagePath)) {
            await unlink(oldImagePath).catch(() => {})
          }
        }

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
        // Keep existing image on error
      }
    }

    // Update bundle
    const bundle = await (prisma as any).productBundle.update({
      where: { id: params.id },
      data: {
        name,
        slug,
        sku: sku !== null ? sku : existingBundle.sku,
        description: description !== null ? description : existingBundle.description,
        imageUrl,
        badgeText: badgeText !== null ? badgeText : existingBundle.badgeText,
        badgeColor,
        discountPercent,
        price: finalPrice,
        stock,
        minStock,
        inStock,
        featured,
        active,
        categoryId: categoryId !== null ? categoryId : existingBundle.categoryId,
        brandId: brandId !== null ? brandId : existingBundle.brandId,
        businessModes: businessModes || [],
      },
    })

    // Update bundle items - delete old, create new
    if (items.length > 0) {
      // Delete existing items
      await (prisma as any).bundleItem.deleteMany({
        where: { bundleId: params.id },
      })

      // Create new items
      await Promise.all(
        items.map((item: any) =>
          (prisma as any).bundleItem.create({
            data: {
              bundleId: params.id,
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
    revalidatePath(`/admin/bundles/${params.id}`)
    revalidatePath('/catalog')

    // Revalidate cache
    revalidateTag('bundles')
    revalidatePath('/admin/bundles')
    revalidatePath(`/admin/bundles/${params.id}`)
    revalidatePath('/catalog')

    const response: TApiResponse<typeof bundle> = { data: bundle }
    return NextResponse.json(response)
  } catch (error: any) {
    console.error('[BUNDLES API] Error updating bundle:', error)
    console.error('[BUNDLES API] Error details:', {
      message: error?.message,
      stack: error?.stack,
      name: error?.name,
      bundleId: params.id,
    })
    const err: ErrorResponse = {
      error: 'Failed to update bundle',
      details: error?.message || String(error),
    }
    return NextResponse.json(err, { status: 500 })
  }
}

// DELETE - Delete bundle
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const bundle = await (prisma as any).productBundle.findUnique({
      where: { id: params.id },
    })

    if (!bundle) {
      return NextResponse.json({ error: 'Bundle not found' }, { status: 404 })
    }

    // Delete image file if exists
    if (bundle.imageUrl && bundle.imageUrl.startsWith('/uploads/')) {
      const imagePath = join(process.cwd(), 'public', bundle.imageUrl)
      if (existsSync(imagePath)) {
        await unlink(imagePath).catch(() => {})
      }
    }

    // Delete bundle (cascades to items)
    await (prisma as any).productBundle.delete({
      where: { id: params.id },
    })

    // Revalidate cache
    revalidateTag('bundles')
    revalidatePath('/admin/bundles')
    revalidatePath('/catalog')

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Error deleting bundle:', error)
    const err: ErrorResponse = {
      error: 'Failed to delete bundle',
      details: error?.message || String(error),
    }
    return NextResponse.json(err, { status: 500 })
  }
}

