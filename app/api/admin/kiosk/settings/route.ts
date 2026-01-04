import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET - Fetch kiosk settings
export async function GET() {
  try {
    const businessSettings = await prisma.businessSettings.findUnique({
      where: { id: 'default' }
    })

    if (businessSettings?.kioskSettings) {
      return NextResponse.json({ settings: businessSettings.kioskSettings })
    }

    // Return default settings if none exist
    return NextResponse.json({ settings: null })
  } catch (error) {
    console.error('Failed to fetch kiosk settings:', error)
    return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 })
  }
}

// POST - Save kiosk settings
export async function POST(request: NextRequest) {
  try {
    const { settings } = await request.json()

    await prisma.businessSettings.upsert({
      where: { id: 'default' },
      update: { kioskSettings: settings },
      create: { id: 'default', kioskSettings: settings }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to save kiosk settings:', error)
    return NextResponse.json({ error: 'Failed to save settings' }, { status: 500 })
  }
}
