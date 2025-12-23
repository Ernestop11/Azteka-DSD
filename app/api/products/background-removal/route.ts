/**
 * POST /api/products/background-removal
 * 
 * ISOLATED ENDPOINT: Background removal service
 * This is a separate endpoint that does NOT interfere with normal uploads.
 * 
 * Usage: Call this AFTER uploading an image, from a dedicated admin tool.
 * This endpoint is completely optional and does not break any existing functionality.
 */

import { NextRequest, NextResponse } from 'next/server'
import { readFile, writeFile } from 'fs/promises'
import path from 'path'
import prisma from '@/lib/prisma'
import { revalidateTag, revalidatePath } from 'next/cache'
import { removeBackground } from '@/lib/services/backgroundRemoval'
import sharp from 'sharp'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { productId, imageUrl, useAI = true } = body

    if (!productId) {
      return NextResponse.json(
        { error: 'Product ID is required' },
        { status: 400 }
      )
    }

    if (!imageUrl) {
      return NextResponse.json(
        { error: 'Image URL is required' },
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

    // Read existing image file
    const imagePath = imageUrl.startsWith('/') 
      ? path.join(process.cwd(), 'public', imageUrl)
      : path.join(process.cwd(), 'public', 'uploads', 'products', imageUrl)

    let inputBuffer: Buffer
    try {
      inputBuffer = await readFile(imagePath)
    } catch (err) {
      return NextResponse.json(
        { error: 'Image file not found' },
        { status: 404 }
      )
    }

    // Remove background
    let processedBuffer = await removeBackground(inputBuffer, useAI)

    // Resize and optimize
    processedBuffer = await sharp(processedBuffer)
      .resize(800, 800, { fit: 'inside', withoutEnlargement: true })
      .png({ quality: 90 })
      .toBuffer()

    // Overwrite original file
    await writeFile(imagePath, processedBuffer)

    // Update product in database
    await prisma.product.update({
      where: { id: productId },
      data: {
        backgroundRemoved: true
      }
    })

    // Revalidate caches
    revalidateTag('products')
    revalidateTag('catalog')
    revalidatePath('/admin/products')
    revalidatePath('/employee/inventory')
    revalidatePath('/catalog')

    return NextResponse.json({
      success: true,
      imageUrl,
      backgroundRemoved: true,
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




