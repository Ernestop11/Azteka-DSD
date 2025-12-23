import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { revalidateTag, revalidatePath } from 'next/cache'
import { catalogCache } from '@/lib/cache'
import { writeFile, mkdir } from 'fs/promises'
import path from 'path'
import sharp from 'sharp'
import { uploadToVps, isVpsUploadEnabled } from '@/lib/services/vpsUpload'

// Dynamic import for HEIC conversion
let heicConvert: ((options: { buffer: Buffer; format: 'JPEG' | 'PNG'; quality?: number }) => Promise<Buffer>) | null = null

async function loadHeicConverter() {
  if (!heicConvert) {
    try {
      const mod = await import('heic-convert')
      heicConvert = mod.default || mod
    } catch (err) {
      console.warn('HEIC converter not available:', err)
    }
  }
  return heicConvert
}

/**
 * POST /api/employee/products/upload-image
 * Uploads a product image with standard optimization
 * 
 * NOTE: Background removal has been moved to a separate service:
 * Use /api/products/background-removal for background removal (optional, isolated)
 */
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const image = formData.get('image') as File | null
    const productId = formData.get('id') as string | null
    // Background removal removed - use separate endpoint if needed
    const enhanceImage = formData.get('enhance') === 'true'

    if (!image) {
      return NextResponse.json(
        { error: 'No image file provided' },
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

    // Create uploads directory if it doesn't exist
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads', 'products')
    await mkdir(uploadsDir, { recursive: true })

    // Use product ID as filename for consistency across all UIs
    const filename = `${productId}.png`
    const filepath = path.join(uploadsDir, filename)

    // Read file buffer
    const bytes = await image.arrayBuffer()
    let buffer = Buffer.from(bytes)

    // Check if HEIC/HEIF format and convert to JPEG
    const mimeType = image.type?.toLowerCase() || ''
    const fileName = image.name?.toLowerCase() || ''
    const isHeic = mimeType.includes('heic') || mimeType.includes('heif') ||
                   fileName.endsWith('.heic') || fileName.endsWith('.heif')

    if (isHeic) {
      console.log('[Upload] Detected HEIC/HEIF format, converting to JPEG...')
      const converter = await loadHeicConverter()
      if (converter) {
        try {
          buffer = await converter({
            buffer,
            format: 'JPEG',
            quality: 0.9
          })
          console.log('[Upload] HEIC conversion successful')
        } catch (heicError: any) {
          console.error('[Upload] HEIC conversion failed:', heicError)
          // More helpful error message
          const errorMsg = heicError?.message || 'Unknown conversion error'
          return NextResponse.json(
            { 
              error: 'Failed to convert HEIC image', 
              details: `HEIC conversion error: ${errorMsg}. The heic-convert package may need to be installed or configured.`,
              suggestion: 'Try converting the image to JPEG/PNG using your device before uploading.'
            },
            { status: 400 }
          )
        }
      } else {
        console.warn('[Upload] HEIC converter not available - heic-convert package may not be installed')
        return NextResponse.json(
          { 
            error: 'HEIC format not supported', 
            details: 'The heic-convert package is not available. Please install it or convert the image to JPEG/PNG before uploading.',
            suggestion: 'Convert HEIC images to JPEG/PNG using your device\'s photo app before uploading.'
          },
          { status: 400 }
        )
      }
    }

    // Process image (background removal removed - use separate endpoint)
    let processedBuffer: Buffer

    if (enhanceImage) {
      // NEW FEATURE: Image enhancement - sharpen, boost colors
      processedBuffer = await sharp(buffer)
        .resize(800, 800, { fit: 'inside', withoutEnlargement: true })
        .sharpen({ sigma: 1.5 })
        .modulate({ saturation: 1.15, brightness: 1.05 })
        .png({ quality: 90 })
        .toBuffer()
    } else {
      // Standard optimization
      processedBuffer = await sharp(buffer)
        .resize(800, 800, { fit: 'inside', withoutEnlargement: true })
        .png({ quality: 85 })
        .toBuffer()
    }

    let imageUrl: string

    // Try VPS upload first (single source of truth)
    if (isVpsUploadEnabled()) {
      console.log('[Employee Upload] VPS upload enabled, uploading directly to VPS...')
      const vpsResult = await uploadToVps(processedBuffer, filename, 'products')

      if (vpsResult.success) {
        imageUrl = vpsResult.url
        console.log('[Employee Upload] VPS upload successful:', imageUrl)
      } else {
        console.warn('[Employee Upload] VPS upload failed, falling back to local:', vpsResult.error)
        // Fall back to local
        await writeFile(filepath, processedBuffer)
        imageUrl = `/uploads/products/${filename}`
      }
    } else {
      console.log('[Employee Upload] VPS upload not available, saving locally...')
      await writeFile(filepath, processedBuffer)
      imageUrl = `/uploads/products/${filename}`
    }

    // Update database with the image URL (add cache busting timestamp)
    const cacheBustUrl = `${imageUrl}?v=${Date.now()}`
    const updatedProduct = await prisma.product.update({
      where: { id: productId },
      data: {
        imageUrl: cacheBustUrl,
        updatedAt: new Date() // Force updatedAt to change
      },
      select: {
        id: true,
        imageUrl: true,
        updatedAt: true
      }
    })
    console.log('[Employee Upload] Database updated:', updatedProduct.id, updatedProduct.imageUrl)

    // Revalidate caches for real-time sync across ALL pages
    revalidateTag('catalog')
    revalidateTag('products')
    revalidatePath('/catalog')
    revalidatePath('/employee/inventory')
    revalidatePath('/employee/products')
    revalidatePath('/admin/products')
    revalidatePath('/admin')

    // CRITICAL: Clear catalogCache (TTLCache) used by frontend catalog
    // This ensures frontend catalog sees updates immediately without refresh
    catalogCache.clear()

    return NextResponse.json({
      success: true,
      imageUrl: updatedProduct.imageUrl,
      enhanced: enhanceImage,
      uploadedTo: isVpsUploadEnabled() ? 'vps' : 'local',
      message: 'Image uploaded successfully. Use /api/products/background-removal for background removal if needed.'
    })
  } catch (error: any) {
    console.error('[POST /api/employee/products/upload-image] Error:', error)
    return NextResponse.json(
      { error: 'Failed to upload image', details: error.message },
      { status: 500 }
    )
  }
}

