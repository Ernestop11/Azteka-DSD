import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import { existsSync } from 'fs'
import { sanitizeIdForFilename } from '@/lib/utils/imageSanitize'

/**
 * POST /api/admin/categories/uploadImage
 * Uploads an image for a category
 */
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const categoryId = formData.get('categoryId') as string | null
    const imageFile = formData.get('image') as File | null

    if (!categoryId) {
      return NextResponse.json(
        { error: 'Category ID is required' },
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

    // Verify category exists
    const category = await prisma.category.findUnique({
      where: { id: categoryId },
    })

    if (!category) {
      return NextResponse.json(
        { error: 'Category not found' },
        { status: 404 }
      )
    }

    // Sanitize category ID for filename
    const sanitizedId = sanitizeIdForFilename(categoryId)

    // Create uploads directory if it doesn't exist
    const uploadsDir = join(process.cwd(), 'public', 'uploads', 'categories')
    if (!existsSync(uploadsDir)) {
      await mkdir(uploadsDir, { recursive: true })
    }

    // Save as <categoryId>.png
    const filename = `${sanitizedId}.png`
    const filepath = join(uploadsDir, filename)

    // Convert file to buffer and save
    const bytes = await imageFile.arrayBuffer()
    const buffer = Buffer.from(bytes)
    await writeFile(filepath, buffer)

    // Update category with image URL
    const imageUrl = `/uploads/categories/${filename}`
    const updatedCategory = await prisma.category.update({
      where: { id: categoryId },
      data: { imageUrl },
    })

    return NextResponse.json({
      success: true,
      category: updatedCategory,
      imageUrl,
    })
  } catch (error: any) {
    console.error('Error uploading category image:', error)
    return NextResponse.json(
      {
        error: 'Failed to upload category image',
        details: error?.message || String(error),
      },
      { status: 500 }
    )
  }
}

