import { NextRequest, NextResponse } from 'next/server'
import { writeFile, mkdir } from 'fs/promises'
import path from 'path'
import { existsSync } from 'fs'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    // Create uploads directory if it doesn't exist
    const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'kiosk')
    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true })
    }

    // Generate unique filename
    const ext = path.extname(file.name) || '.jpg'
    const filename = `kiosk-bg-${Date.now()}${ext}`
    const filepath = path.join(uploadDir, filename)

    // Write file
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    await writeFile(filepath, buffer)

    // Return the public URL
    const url = `/uploads/kiosk/${filename}`

    return NextResponse.json({ url })
  } catch (error) {
    console.error('Failed to upload background:', error)
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 })
  }
}
