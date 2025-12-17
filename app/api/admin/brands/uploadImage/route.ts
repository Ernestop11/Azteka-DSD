import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import { existsSync } from 'fs'
import { sanitizeIdForFilename } from '@/lib/utils/imageSanitize'

/**
 * POST /api/admin/brands/uploadImage
 * Uploads an image for a brand
 */
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const brandId = formData.get('brandId') as string | null
    const imageFile = formData.get('image') as File | null

    if (!brandId) {
      return NextResponse.json(
        { error: 'Brand ID is required' },
        { status: 400 }
      )
    }

    if (!imageFile) {
      return NextResponse.json(
        { error: 'Image file is required' },
        { status: 400 }
      )
    }

    // Validate file type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
    if (!validTypes.includes(imageFile.type)) {
      return NextResponse.json(
        { error: 'Invalid file type. Please upload JPG, PNG, or WebP images.' },
        { status: 400 }
      )
    }

    // Validate file size (5MB max)
    if (imageFile.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'File too large. Maximum size is 5MB.' },
        { status: 400 }
      )
    }

    // Verify brand exists
    const brand = await prisma.brand.findUnique({
      where: { id: brandId },
    })

    if (!brand) {
      return NextResponse.json(
        { error: 'Brand not found' },
        { status: 404 }
      )
    }

    // Sanitize brand ID for filename
    const sanitizedId = sanitizeIdForFilename(brandId)

    // Create uploads directory if it doesn't exist
    const uploadsDir = join(process.cwd(), 'public', 'uploads', 'brands')
    if (!existsSync(uploadsDir)) {
      await mkdir(uploadsDir, { recursive: true })
    }

    // Save as <brandId>.png
    const filename = `${sanitizedId}.png`
    const filepath = join(uploadsDir, filename)

    // Convert file to buffer and save
    const bytes = await imageFile.arrayBuffer()
    const buffer = Buffer.from(bytes)
    await writeFile(filepath, buffer)

    // Update brand with image URL
    const imageUrl = `/uploads/brands/${filename}`
    const updatedBrand = await prisma.brand.update({
      where: { id: brandId },
      data: { imageUrl },
    })

    return NextResponse.json({
      success: true,
      brand: updatedBrand,
      imageUrl,
    })
  } catch (error: any) {
    console.error('Error uploading brand image:', error)
    return NextResponse.json(
      {
        error: 'Failed to upload brand image',
        details: error?.message || String(error),
      },
      { status: 500 }
    )
  }
}

