import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export const dynamic = 'force-dynamic'
export const revalidate = 0

// Public settings endpoint - returns only public-safe business info
// No authentication required - this is intentionally public for header/footer display
export async function GET() {
  try {
    const settings = await prisma.businessSettings.findUnique({
      where: { id: 'default' },
      select: {
        name: true,
        phone: true,
        email: true,
        website: true,
        address: true,
        warehouseAddress: true,
        warehouseCity: true,
        warehouseState: true,
        warehouseZipCode: true,
      },
    })

    if (!settings) {
      // Return defaults if no settings exist
      return NextResponse.json({
        name: 'Azteka DSD',
        phone: '',
        email: '',
        website: '',
        address: '',
        warehouseAddress: '',
        warehouseCity: '',
        warehouseState: '',
        warehouseZipCode: '',
      })
    }

    return NextResponse.json(settings)
  } catch (error) {
    console.error('Error fetching public settings:', error)
    // Return defaults on error
    return NextResponse.json({
      name: 'Azteka DSD',
      phone: '',
      email: '',
      website: '',
      address: '',
      warehouseAddress: '',
      warehouseCity: '',
      warehouseState: '',
      warehouseZipCode: '',
    })
  }
}
