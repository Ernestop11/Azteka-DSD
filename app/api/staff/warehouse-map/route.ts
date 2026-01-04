import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { cookies } from 'next/headers'

// Helper to verify employee session
async function getEmployeeFromSession() {
  const cookieStore = await cookies()
  const sessionCookie = cookieStore.get('employee_session')

  if (!sessionCookie?.value) {
    return null
  }

  try {
    const sessionData = JSON.parse(Buffer.from(sessionCookie.value, 'base64').toString())
    if (!sessionData.employeeId || sessionData.exp < Date.now()) {
      return null
    }
    return sessionData.employeeId
  } catch {
    return null
  }
}

// GET /api/staff/warehouse-map - Get the warehouse map
export async function GET(request: NextRequest) {
  try {
    const employeeId = await getEmployeeFromSession()
    if (!employeeId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get the warehouse map from settings or a dedicated table
    // For now, we'll use a simple JSON field approach with Settings
    const setting = await prisma.setting.findFirst({
      where: { key: 'warehouse_map' }
    })

    if (setting?.value) {
      try {
        const map = JSON.parse(setting.value)
        return NextResponse.json({ map })
      } catch {
        return NextResponse.json({ map: null })
      }
    }

    return NextResponse.json({ map: null })
  } catch (error) {
    console.error('Warehouse map get error:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

// POST /api/staff/warehouse-map - Save the warehouse map
export async function POST(request: NextRequest) {
  try {
    const employeeId = await getEmployeeFromSession()
    if (!employeeId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { map } = await request.json()

    if (!map) {
      return NextResponse.json({ error: 'Map data required' }, { status: 400 })
    }

    // Add metadata
    const mapWithMeta = {
      ...map,
      updatedAt: new Date().toISOString(),
      updatedBy: employeeId
    }

    // Upsert the warehouse map setting
    await prisma.setting.upsert({
      where: { key: 'warehouse_map' },
      update: { value: JSON.stringify(mapWithMeta) },
      create: {
        key: 'warehouse_map',
        value: JSON.stringify(mapWithMeta),
        description: 'Warehouse floor layout map'
      }
    })

    return NextResponse.json({ success: true, map: mapWithMeta })
  } catch (error) {
    console.error('Warehouse map save error:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
