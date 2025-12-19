import { NextRequest, NextResponse } from 'next/server'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import { existsSync } from 'fs'
import prisma from '@/lib/prisma'
import { revalidateTag, revalidatePath } from 'next/cache'
import sharp from 'sharp'

/**
 * POST /api/admin/products/uploadImage
 * 
 * FIXED: Now matches employee upload endpoint strategy:
 * - Uses productId as filename (not timestamp) for consistency
 * - Updates database after upload
 * - Invalidates cache for real-time sync
 * - Processes image with Sharp for optimization
 */
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('image') as File
    const productId = formData.get('productId') as string | null

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      )
    }

    if (!productId) {
      return NextResponse.json(
        { error: 'Product ID is required' },
        { status: 400 }
      )
    }

    // Verify product exists
    const product = await prisma.product.findUnique({
      where: { id: productId }
    })

    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      )
    }

    // Validate file type
    const mimeType = (file.type || '').toLowerCase()
    const allowedMimeTypes = ['image/png', 'image/jpeg', 'image/jpg']
    if (!allowedMimeTypes.includes(mimeType)) {
      return NextResponse.json(
        { error: 'File must be a PNG or JPG image' },
        { status: 400 }
      )
    }

    // Create uploads directory if it doesn't exist
    const uploadsDir = join(process.cwd(), 'public', 'uploads', 'products')
    if (!existsSync(uploadsDir)) {
      await mkdir(uploadsDir, { recursive: true })
    }

    // FIXED: Use productId as filename for consistency across all UIs
    // This ensures the same product always uses the same filename
    const filename = `${productId}.png`
    const filepath = join(uploadsDir, filename)

    // Convert file to buffer
    const bytes = await file.arrayBuffer()
    let buffer = Buffer.from(bytes)

    // Process image with Sharp: resize and optimize
    buffer = await sharp(buffer)
      .resize(800, 800, { fit: 'inside', withoutEnlargement: true })
      .png({ quality: 90 })
      .toBuffer()

    // Save processed image
    await writeFile(filepath, buffer)

    // FIXED: Update database - this was missing!
    const imageUrl = `/uploads/products/${filename}`

    const updatedProduct = await prisma.product.update({
      where: { id: productId },
      data: { imageUrl },
      select: {
        id: true,
        imageUrl: true
      }
    })

    // FIXED: Invalidate ALL caches for real-time sync across ALL pages
    revalidateTag('products')
    revalidateTag('catalog')
    revalidatePath('/admin/products')
    revalidatePath('/admin')
    revalidatePath('/employee/inventory')
    revalidatePath('/employee/products')
    revalidatePath('/catalog')
    revalidatePath('/')

    return NextResponse.json({
      success: true,
      imageUrl: updatedProduct.imageUrl
    })
  } catch (error: any) {
    console.error('[POST /api/admin/products/uploadImage] Error:', error)
    return NextResponse.json(
      {
        error: 'Failed to upload image',
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    )
  }
}
