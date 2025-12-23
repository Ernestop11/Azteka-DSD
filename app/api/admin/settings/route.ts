import { NextRequest, NextResponse } from 'next/server'
import { revalidateTag, revalidatePath } from 'next/cache'
import prisma from '@/lib/prisma'

const SESSION_COOKIE = 'session_azteka'

async function checkAuth(request: NextRequest) {
  const token = request.cookies.get(SESSION_COOKIE)?.value
  if (!token) {
    console.log('[SETTINGS AUTH] No token found')
    return null
  }

  try {
    const session = await prisma.session.findUnique({
      where: { token },
      include: {
        User: {
          select: {
            id: true,
            role: true,
            email: true,
          },
        },
      },
    })

    if (!session) {
      console.log('[SETTINGS AUTH] No session found for token')
      return null
    }

    if (session.expiresAt < new Date()) {
      console.log('[SETTINGS AUTH] Session expired')
      return null
    }

    // Check if user is admin
    if (session.User.role !== 'ADMIN' && session.User.role !== 'SUPER_ADMIN') {
      console.log('[SETTINGS AUTH] User is not admin, role:', session.User.role)
      return null
    }

    console.log('[SETTINGS AUTH] Auth successful for user:', session.User.email)
    return session.User
  } catch (error: any) {
    console.error('[SETTINGS AUTH] Error:', error)
    return null
  }
}

// GET /api/admin/settings - Fetch business settings
export async function GET(request: NextRequest) {
  const user = await checkAuth(request)
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const settings = await prisma.businessSettings.upsert({
      where: { id: 'default' },
      update: {},
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

    // Invalidate cache so other pages get fresh data
    revalidateTag('business-settings')
    revalidatePath('/catalog')
    revalidatePath('/driver/today')
    revalidatePath('/kiosk')

    return NextResponse.json(settings)
  } catch (error: any) {
    console.error('[GET /api/admin/settings] Error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch settings', details: error?.message },
      { status: 500 }
    )
  }
}

// PUT /api/admin/settings - Update business settings
export async function PUT(request: NextRequest) {
  const user = await checkAuth(request)
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json()

    const deliveryRadius = typeof body.deliveryRadius === 'number' 
      ? body.deliveryRadius 
      : (body.deliveryRadius ? parseInt(String(body.deliveryRadius)) : 50)

    const settings = await prisma.businessSettings.upsert({
      where: { id: 'default' },
      update: {
        name: body.name ?? '',
        address: body.address ?? '',
        city: body.city ?? '',
        state: body.state ?? 'TX',
        zipCode: body.zipCode ?? '',
        phone: body.phone ?? '',
        email: body.email ?? '',
        website: body.website ?? '',
        taxId: body.taxId ?? '',
        warehouseAddress: body.warehouseAddress ?? '',
        warehouseCity: body.warehouseCity ?? '',
        warehouseState: body.warehouseState ?? 'TX',
        warehouseZipCode: body.warehouseZipCode ?? '',
        deliveryRadius: deliveryRadius,
        businessHoursOpen: body.businessHoursOpen ?? '06:00',
        businessHoursClose: body.businessHoursClose ?? '18:00',
        businessDays: body.businessDays ?? 'Mon-Sat',
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
        deliveryRadius: deliveryRadius,
        businessHoursOpen: body.businessHoursOpen || '06:00',
        businessHoursClose: body.businessHoursClose || '18:00',
        businessDays: body.businessDays || 'Mon-Sat',
      },
    })

    console.log('[PUT /api/admin/settings] Settings saved:', {
      name: settings.name,
      phone: settings.phone,
      warehouseAddress: settings.warehouseAddress
    })

    // Invalidate cache so catalog, driver, kiosk pages get fresh data
    revalidateTag('business-settings')
    revalidatePath('/catalog')
    revalidatePath('/driver/today')
    revalidatePath('/kiosk')
    revalidatePath('/api/settings/public')
    revalidatePath('/api/catalog/settings')

    return NextResponse.json(settings)
  } catch (error: any) {
    console.error('[PUT /api/admin/settings] Error:', error)
    return NextResponse.json(
      { error: 'Failed to update settings', details: error?.message },
      { status: 500 }
    )
  }
}
