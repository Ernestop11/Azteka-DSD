/**
 * POST /api/products/background-removal
 *
 * ISOLATED ENDPOINT: Background removal service using rembg with alpha matting
 * This produces Canva-like clean edges with no black fringe artifacts.
 *
 * Usage: Call this AFTER uploading an image, from a dedicated admin tool.
 * This endpoint is completely optional and does not break any existing functionality.
 *
 * UPGRADED: Now uses rembg (Python) with alpha matting for professional quality
 */

import { NextRequest, NextResponse } from 'next/server'
import { writeFile, mkdir, readFile, unlink } from 'fs/promises'
import { existsSync } from 'fs'
import path from 'path'
import prisma from '@/lib/prisma'
import { revalidateTag, revalidatePath } from 'next/cache'
import { catalogCache } from '@/lib/cache'
import { uploadToVps, isVpsUploadEnabled } from '@/lib/services/vpsUpload'
import sharp from 'sharp'
import { exec } from 'child_process'
import { promisify } from 'util'

const execAsync = promisify(exec)

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { productId, imageUrl, useAI = true, field = 'imageUrl' } = body

    if (!productId) {
      return NextResponse.json(
        { error: 'Product ID is required' },
        { status: 400 }
      )
    }

    // Validate field parameter
    const validFields = ['imageUrl', 'splashImageUrl']
    if (!validFields.includes(field)) {
      return NextResponse.json(
        { error: 'Invalid field. Must be imageUrl or splashImageUrl' },
        { status: 400 }
      )
    }

    // Verify product exists and get current image
    const product = await prisma.product.findUnique({
      where: { id: productId },
      select: { id: true, imageUrl: true, splashImageUrl: true, name: true }
    })

    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      )
    }

    // Use provided imageUrl or fall back to product's current image based on field
    const sourceUrl = imageUrl || (field === 'splashImageUrl' ? product.splashImageUrl : product.imageUrl)

    if (!sourceUrl) {
      return NextResponse.json(
        { error: `No image URL available for this product's ${field}` },
        { status: 400 }
      )
    }

    console.log('[BG Removal] Starting for product:', productId, 'field:', field)
    console.log('[BG Removal] Source URL:', sourceUrl)

    // Load image - try local file first, then fetch via HTTP
    let inputBuffer: Buffer
    try {
      // Clean URL (remove cache busting params)
      const cleanUrl = sourceUrl.split('?')[0]

      // First try reading from local filesystem (works on VPS where files are stored)
      if (cleanUrl.startsWith('/uploads/')) {
        const localPath = path.join(process.cwd(), 'public', cleanUrl)
        console.log('[BG Removal] Trying local file:', localPath)

        if (existsSync(localPath)) {
          const { readFile } = await import('fs/promises')
          inputBuffer = await readFile(localPath)
          console.log('[BG Removal] Loaded from local file, size:', inputBuffer.length, 'bytes')
        } else {
          // Fall back to HTTP fetch (for development or when file is on different server)
          const fetchUrl = cleanUrl.startsWith('http')
            ? cleanUrl
            : `http://localhost:${process.env.PORT || 3002}${cleanUrl}`

          console.log('[BG Removal] Local file not found, fetching from:', fetchUrl)

          const response = await fetch(fetchUrl, {
            headers: { 'Accept': 'image/*' }
          })

          if (!response.ok) {
            throw new Error(`Failed to fetch image: ${response.status}`)
          }

          const arrayBuffer = await response.arrayBuffer()
          inputBuffer = Buffer.from(arrayBuffer)
          console.log('[BG Removal] Fetched via HTTP, size:', inputBuffer.length, 'bytes')
        }
      } else if (cleanUrl.startsWith('http')) {
        // External URL - fetch directly
        console.log('[BG Removal] Fetching external URL:', cleanUrl)
        const response = await fetch(cleanUrl, {
          headers: { 'Accept': 'image/*' }
        })

        if (!response.ok) {
          throw new Error(`Failed to fetch image: ${response.status}`)
        }

        const arrayBuffer = await response.arrayBuffer()
        inputBuffer = Buffer.from(arrayBuffer)
        console.log('[BG Removal] Fetched from external URL, size:', inputBuffer.length, 'bytes')
      } else {
        throw new Error('Invalid image URL format')
      }
    } catch (err: any) {
      console.error('[BG Removal] Load error:', err)
      return NextResponse.json(
        { error: 'Failed to load image', details: err.message },
        { status: 404 }
      )
    }

    // Remove background using rembg (Python) with alpha matting
    // This produces Canva-like clean edges with no fringe artifacts
    console.log('[BG Removal] Processing with rembg + alpha matting...')

    // Create temp files for rembg processing
    const tempDir = path.join(process.cwd(), 'tmp')
    if (!existsSync(tempDir)) {
      await mkdir(tempDir, { recursive: true })
    }

    const inputPath = path.join(tempDir, `${productId}-input.png`)
    const outputPath = path.join(tempDir, `${productId}-output.png`)

    // Save input to temp file
    await writeFile(inputPath, inputBuffer)

    // Run rembg with alpha matting via Python script
    const pythonPath = path.join(process.cwd(), '.venv', 'bin', 'python3')
    const scriptPath = path.join(process.cwd(), 'scripts', 'remove-bg.py')

    try {
      const { stdout, stderr } = await execAsync(
        `"${pythonPath}" "${scriptPath}" "${inputPath}" "${outputPath}"`,
        { timeout: 120000 } // 2 minute timeout
      )
      console.log('[BG Removal] rembg output:', stdout)
      if (stderr) console.log('[BG Removal] rembg stderr:', stderr)
    } catch (execError: any) {
      console.error('[BG Removal] rembg failed:', execError)
      // Cleanup temp files
      await unlink(inputPath).catch(() => {})
      throw new Error(`Background removal failed: ${execError.message}`)
    }

    // Read the processed output
    let processedBuffer = await readFile(outputPath)

    // Cleanup temp files
    await unlink(inputPath).catch(() => {})
    await unlink(outputPath).catch(() => {})

    // Final optimization with sharp
    processedBuffer = await sharp(processedBuffer)
      .resize(800, 800, { fit: 'inside', withoutEnlargement: true })
      .png({ quality: 90 })
      .toBuffer()

    console.log('[BG Removal] Processing complete, size:', processedBuffer.length, 'bytes')

    // Upload to VPS (or local fallback)
    // Use different filename suffix for secondary images to avoid overwriting main image
    const filename = field === 'splashImageUrl' ? `${productId}-secondary.png` : `${productId}.png`
    let newImageUrl: string

    if (isVpsUploadEnabled()) {
      console.log('[BG Removal] Uploading to VPS...')
      const vpsResult = await uploadToVps(processedBuffer, filename, 'products')

      if (vpsResult.success) {
        newImageUrl = vpsResult.url
        console.log('[BG Removal] VPS upload successful:', newImageUrl)
      } else {
        console.warn('[BG Removal] VPS upload failed, saving locally:', vpsResult.error)
        newImageUrl = await saveLocally(processedBuffer, filename)
      }
    } else {
      console.log('[BG Removal] Saving locally...')
      newImageUrl = await saveLocally(processedBuffer, filename)
    }

    // Update database with cache busting timestamp
    const cacheBustUrl = `${newImageUrl}?v=${Date.now()}`

    // Update the correct field based on request
    const updateData: { imageUrl?: string; splashImageUrl?: string; updatedAt: Date } = {
      updatedAt: new Date()
    }
    if (field === 'splashImageUrl') {
      updateData.splashImageUrl = cacheBustUrl
    } else {
      updateData.imageUrl = cacheBustUrl
    }

    await prisma.product.update({
      where: { id: productId },
      data: updateData
    })

    console.log('[BG Removal] Database updated', field, 'with:', cacheBustUrl)

    // Clear all caches
    revalidateTag('products')
    revalidateTag('catalog')
    revalidatePath('/admin/products')
    revalidatePath('/admin/inventory-seed')
    revalidatePath('/employee/inventory')
    revalidatePath('/catalog')
    catalogCache.clear()

    return NextResponse.json({
      success: true,
      imageUrl: cacheBustUrl,
      message: 'Background removed successfully'
    })
  } catch (error: any) {
    console.error('[POST /api/products/background-removal] Error:', error)
    return NextResponse.json(
      { error: 'Failed to remove background', details: error.message },
      { status: 500 }
    )
  }
}

/**
 * Save file locally (fallback)
 */
async function saveLocally(buffer: Buffer, filename: string): Promise<string> {
  const uploadsDir = path.join(process.cwd(), 'public', 'uploads', 'products')
  if (!existsSync(uploadsDir)) {
    await mkdir(uploadsDir, { recursive: true })
  }

  const filepath = path.join(uploadsDir, filename)
  await writeFile(filepath, buffer)

  return `/uploads/products/${filename}`
}





