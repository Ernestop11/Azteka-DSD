import { NextRequest, NextResponse } from 'next/server'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import { existsSync } from 'fs'

function sanitizeFilename(str: string): string {
  return str.replace(/[^a-zA-Z0-9-_]/g, '-').toLowerCase()
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    // Accept both 'file' and 'image' field names
    const imageFile = (formData.get('file') as File | null) || (formData.get('image') as File | null)
    const type = (formData.get('type') as string) || 'catalog'
    const season = formData.get('season') as string | null

    if (!imageFile) {
      return NextResponse.json({ error: 'Image file is required' }, { status: 400 })
    }

    // Get file extension
    const originalName = imageFile.name || 'image.png'
    const ext = originalName.split('.').pop()?.toLowerCase() || 'png'
    const timestamp = Date.now()

    // Determine upload directory based on type
    let uploadsDir: string
    let filename: string
    let subFolder: string = ''

    if (type === 'hero-banner') {
      uploadsDir = join(process.cwd(), 'public', 'uploads', 'catalog', 'hero')
      subFolder = 'hero'
      filename = `hero-banner.${ext}`
    } else if (type === 'billboard-promo') {
      uploadsDir = join(process.cwd(), 'public', 'uploads', 'catalog', 'promos')
      subFolder = 'promos'
      filename = `promo-${timestamp}.${ext}`
    } else if (type === 'seasonal' && season) {
      uploadsDir = join(process.cwd(), 'public', 'uploads', 'catalog', 'seasonal')
      subFolder = 'seasonal'
      filename = `${sanitizeFilename(season)}.${ext}`
    } else if (type === 'backdrop') {
      // Product backdrop images (juice splash, decorative effects)
      uploadsDir = join(process.cwd(), 'public', 'uploads', 'catalog', 'backdrops')
      subFolder = 'backdrops'
      filename = `backdrop-${timestamp}.${ext}`
    } else if (type === 'background') {
      // Block background images (Santa, bokeh, rays)
      uploadsDir = join(process.cwd(), 'public', 'uploads', 'catalog', 'backgrounds')
      subFolder = 'backgrounds'
      filename = `bg-${timestamp}.${ext}`
    } else if (type === 'brand-logo') {
      // Brand logo uploads
      uploadsDir = join(process.cwd(), 'public', 'uploads', 'catalog', 'brands')
      subFolder = 'brands'
      filename = `brand-${timestamp}.${ext}`
    } else {
      uploadsDir = join(process.cwd(), 'public', 'uploads', 'catalog')
      subFolder = ''
      filename = `image-${timestamp}.${ext}`
    }

    // Create directory if it doesn't exist
    if (!existsSync(uploadsDir)) {
      await mkdir(uploadsDir, { recursive: true })
    }

    const filepath = join(uploadsDir, filename)

    // Save file
    const bytes = await imageFile.arrayBuffer()
    const buffer = Buffer.from(bytes)
    await writeFile(filepath, buffer)

    // Return relative path - use 'url' for compatibility with frontend
    const imageUrl = subFolder
      ? `/uploads/catalog/${subFolder}/${filename}`
      : `/uploads/catalog/${filename}`

    return NextResponse.json({ success: true, url: imageUrl, imageUrl })
  } catch (error: unknown) {
    console.error('Error uploading catalog image:', error)
    const message = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ error: 'Failed to upload image', details: message }, { status: 500 })
  }
}

