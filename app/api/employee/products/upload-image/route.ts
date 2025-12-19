import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { revalidateTag, revalidatePath } from 'next/cache'
import { writeFile, mkdir } from 'fs/promises'
import path from 'path'
import sharp from 'sharp'

// Dynamic import for background removal (heavy dependency)
let removeBackgroundAI: ((input: Buffer) => Promise<Blob>) | null = null

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

async function loadBackgroundRemovalAI() {
  if (!removeBackgroundAI) {
    try {
      const { removeBackground } = await import('@imgly/background-removal-node')
      removeBackgroundAI = removeBackground
    } catch (err) {
      console.warn('AI background removal not available, falling back to basic:', err)
    }
  }
  return removeBackgroundAI
}

/**
 * POST /api/employee/products/upload-image
 * Uploads a product image with optional AI-powered background removal
 *
 * NEW FEATURE: Uses @imgly/background-removal-node for professional-quality
 * background removal that handles complex backgrounds, hair, fur, and soft edges.
 */
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const image = formData.get('image') as File | null
    const productId = formData.get('id') as string | null
    const removeBackground = formData.get('removeBackground') === 'true'
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
      console.log('[Upload] Converting HEIC/HEIF to JPEG...')
      const converter = await loadHeicConverter()
      if (converter) {
        try {
          buffer = await converter({
            buffer,
            format: 'JPEG',
            quality: 0.9
          })
          console.log('[Upload] HEIC conversion successful')
        } catch (heicError) {
          console.error('[Upload] HEIC conversion failed:', heicError)
          return NextResponse.json(
            { error: 'Failed to convert HEIC image. Please convert to JPEG/PNG before uploading.' },
            { status: 400 }
          )
        }
      } else {
        return NextResponse.json(
          { error: 'HEIC format not supported. Please convert to JPEG/PNG before uploading.' },
          { status: 400 }
        )
      }
    }

    // Process image
    let processedBuffer: Buffer
    let usedAI = false

    if (removeBackground) {
      // Try AI-powered background removal first
      const aiRemover = await loadBackgroundRemovalAI()

      if (aiRemover) {
        try {
          console.log('[Upload] Using AI background removal...')
          const blob = await aiRemover(buffer)
          const arrayBuffer = await blob.arrayBuffer()
          processedBuffer = Buffer.from(arrayBuffer)
          usedAI = true
          console.log('[Upload] AI background removal successful')
        } catch (aiError) {
          console.warn('[Upload] AI background removal failed, using fallback:', aiError)
          processedBuffer = await removeWhiteBackgroundBasic(buffer)
        }
      } else {
        // Fallback to basic white background removal
        processedBuffer = await removeWhiteBackgroundBasic(buffer)
      }

      // Resize after background removal
      processedBuffer = await sharp(processedBuffer)
        .resize(800, 800, { fit: 'inside', withoutEnlargement: true })
        .png()
        .toBuffer()

    } else if (enhanceImage) {
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

    // Write file
    await writeFile(filepath, processedBuffer)

    // Update product in database
    const imageUrl = `/uploads/products/${filename}`

    const updatedProduct = await prisma.product.update({
      where: { id: productId },
      data: {
        imageUrl,
        backgroundRemoved: removeBackground
      },
      select: {
        id: true,
        imageUrl: true,
        backgroundRemoved: true
      }
    })

    // Revalidate caches
    revalidateTag('catalog')
    revalidateTag('products')
    revalidatePath('/catalog')
    revalidatePath('/employee/inventory')

    return NextResponse.json({
      success: true,
      imageUrl: updatedProduct.imageUrl,
      backgroundRemoved: updatedProduct.backgroundRemoved,
      usedAI, // NEW: Let frontend know if AI was used
      enhanced: enhanceImage
    })
  } catch (error: any) {
    console.error('[POST /api/employee/products/upload-image] Error:', error)
    return NextResponse.json(
      { error: 'Failed to upload image', details: error.message },
      { status: 500 }
    )
  }
}

/**
 * Basic white/light background removal using Sharp
 * Fallback when AI model is not available
 */
async function removeWhiteBackgroundBasic(inputBuffer: Buffer): Promise<Buffer> {
  try {
    const resizedBuffer = await sharp(inputBuffer)
      .resize(800, 800, { fit: 'inside', withoutEnlargement: true })
      .ensureAlpha()
      .raw()
      .toBuffer({ resolveWithObject: true })

    const { data, info } = resizedBuffer
    const pixels = new Uint8Array(data)
    const pixelCount = info.width * info.height

    for (let i = 0; i < pixelCount; i++) {
      const idx = i * 4
      const r = pixels[idx]
      const g = pixels[idx + 1]
      const b = pixels[idx + 2]

      const isLight = r > 230 && g > 230 && b > 230
      const isLightGray = r > 200 && g > 200 && b > 200 &&
                          Math.abs(r - g) < 20 && Math.abs(g - b) < 20 && Math.abs(r - b) < 20

      if (isLight || isLightGray) {
        pixels[idx + 3] = 0
      }
    }

    return sharp(Buffer.from(pixels), {
      raw: { width: info.width, height: info.height, channels: 4 }
    }).png().toBuffer()
  } catch (err) {
    console.error('Basic background removal failed:', err)
    return sharp(inputBuffer)
      .resize(800, 800, { fit: 'inside', withoutEnlargement: true })
      .png()
      .toBuffer()
  }
}
