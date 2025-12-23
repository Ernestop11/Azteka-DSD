import { NextRequest, NextResponse } from 'next/server'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import { existsSync } from 'fs'
import prisma from '@/lib/prisma'
import { revalidateTag, revalidatePath } from 'next/cache'
import { catalogCache } from '@/lib/cache'
import sharp from 'sharp'
import { requireAdmin, unauthorizedResponse } from '../../../lib/auth'
import { uploadToVps, isVpsUploadEnabled } from '@/lib/services/vpsUpload'

/**
 * POST /api/admin/products/uploadImage
 *
 * UPGRADED: Now uploads directly to VPS for single source of truth
 * - Tries VPS upload first (production)
 * - Falls back to local if VPS unavailable (dev)
 * - Uses productId as filename for consistency
 * - Updates database after upload
 * - Invalidates cache for real-time sync
 */
export async function POST(request: NextRequest) {
  // Require admin authentication
  const user = await requireAdmin(request)
  if (!user) return unauthorizedResponse()

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

    // Use productId as filename for consistency
    const filename = `${productId}.png`

    // Convert file to buffer
    const bytes = await file.arrayBuffer()
    const inputBuffer = Buffer.from(bytes)

    // Process image with Sharp: resize and optimize
    const processedBuffer = await sharp(inputBuffer)
      .resize(800, 800, { fit: 'inside', withoutEnlargement: true })
      .png({ quality: 85, compressionLevel: 6 })
      .toBuffer()

    let imageUrl: string

    // Try VPS upload first (single source of truth)
    if (isVpsUploadEnabled()) {
      console.log('[Upload] VPS upload enabled, uploading directly to VPS...')
      const vpsResult = await uploadToVps(processedBuffer, filename, 'products')

      if (vpsResult.success) {
        imageUrl = vpsResult.url
        console.log('[Upload] VPS upload successful:', imageUrl)
      } else {
        console.warn('[Upload] VPS upload failed, falling back to local:', vpsResult.error)
        // Fall back to local
        imageUrl = await saveLocally(processedBuffer, filename)
      }
    } else {
      console.log('[Upload] VPS upload not available, saving locally...')
      imageUrl = await saveLocally(processedBuffer, filename)
    }

    // Update database with the image URL
    const updatedProduct = await prisma.product.update({
      where: { id: productId },
      data: { imageUrl },
      select: {
        id: true,
        imageUrl: true
      }
    })

    // Invalidate ALL caches for real-time sync
    revalidateTag('products')
    revalidateTag('catalog')
    revalidatePath('/admin/products')
    revalidatePath('/admin')
    revalidatePath('/employee/inventory')
    revalidatePath('/employee/products')
    revalidatePath('/catalog')
    revalidatePath('/')

    // Clear catalogCache (TTLCache)
    catalogCache.clear()

    return NextResponse.json({
      success: true,
      imageUrl: updatedProduct.imageUrl,
      uploadedTo: isVpsUploadEnabled() ? 'vps' : 'local'
    })
  } catch (error: unknown) {
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

/**
 * Save file locally (fallback for development)
 */
async function saveLocally(buffer: Buffer, filename: string): Promise<string> {
  const uploadsDir = join(process.cwd(), 'public', 'uploads', 'products')
  if (!existsSync(uploadsDir)) {
    await mkdir(uploadsDir, { recursive: true })
  }

  const filepath = join(uploadsDir, filename)
  await writeFile(filepath, buffer)

  return `/uploads/products/${filename}`
}
