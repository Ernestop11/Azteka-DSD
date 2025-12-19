import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

// GET /api/admin/settings - Fetch business settings
export async function GET() {
  try {
    // Use upsert pattern to always return settings (create default if not exists)
    const settings = await prisma.businessSettings.upsert({
      where: { id: 'default' },
      update: {}, // No update on GET
      create: {
        id: 'default',
        name: 'Azteka DSD',
        address: '',
        city: '',
        state: 'TX',
        zipCode: '',
        phone: '',
        email: '',
        website: '',
        taxId: '',
        warehouseAddress: '',
        warehouseCity: '',
        warehouseState: 'TX',
        warehouseZipCode: '',
        deliveryRadius: 50,
        businessHoursOpen: '06:00',
        businessHoursClose: '18:00',
        businessDays: 'Mon-Sat',
      },
    })

    return NextResponse.json(settings)
  } catch (error) {
    console.error('Failed to fetch business settings:', error)
    return NextResponse.json(
      { error: 'Failed to fetch settings' },
      { status: 500 }
    )
  }
}

// PUT /api/admin/settings - Update business settings
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()

    const settings = await prisma.businessSettings.upsert({
      where: { id: 'default' },
      update: {
        name: body.name,
        address: body.address,
        city: body.city,
        state: body.state,
        zipCode: body.zipCode,
        phone: body.phone,
        email: body.email,
        website: body.website,
        taxId: body.taxId,
        warehouseAddress: body.warehouseAddress,
        warehouseCity: body.warehouseCity,
        warehouseState: body.warehouseState,
        warehouseZipCode: body.warehouseZipCode,
        deliveryRadius: body.deliveryRadius ? parseInt(body.deliveryRadius) : 50,
        businessHoursOpen: body.businessHoursOpen,
        businessHoursClose: body.businessHoursClose,
        businessDays: body.businessDays,
      },
      create: {
        id: 'default',
        name: body.name || 'Azteka DSD',
        address: body.address || '',
        city: body.city || '',
        state: body.state || 'TX',
        zipCode: body.zipCode || '',
        phone: body.phone || '',
        email: body.email || '',
        website: body.website || '',
        taxId: body.taxId || '',
        warehouseAddress: body.warehouseAddress || '',
        warehouseCity: body.warehouseCity || '',
        warehouseState: body.warehouseState || 'TX',
        warehouseZipCode: body.warehouseZipCode || '',
        deliveryRadius: body.deliveryRadius ? parseInt(body.deliveryRadius) : 50,
        businessHoursOpen: body.businessHoursOpen || '06:00',
        businessHoursClose: body.businessHoursClose || '18:00',
        businessDays: body.businessDays || 'Mon-Sat',
      },
    })

    return NextResponse.json(settings)
  } catch (error) {
    console.error('Failed to update business settings:', error)
    return NextResponse.json(
      { error: 'Failed to update settings' },
      { status: 500 }
    )
  }
}
