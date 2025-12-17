import { NextRequest, NextResponse } from 'next/server'
import { buildCatalogLayout } from '@/lib/catalogBuilder'
import { createPromotionalSections, generateBlackFridayPromos, generateHolidayPromos } from '@/lib/promoGenerator'
import { getCurrentHolidayTheme } from '@/lib/utils/colorGenerator'
import prisma from '@/lib/prisma'
import type { TApiResponse, ErrorResponse } from '@/types/api'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const key = searchParams.get('key')

    // If key is provided, return specific layout setting
    if (key) {
      const setting = await prisma.catalogLayout.findUnique({
        where: { key },
      })
      
      if (!setting) {
        return NextResponse.json({ value: null, active: false })
      }

      return NextResponse.json({
        key: setting.key,
        value: setting.value,
        active: setting.active,
      })
    }

    // Otherwise, return full layout
    // Use Catalog Builder Engine to build complete layout
    const layout = await buildCatalogLayout()
    
    // Load active seasonal theme from admin
    let activeSeasonalTheme = null
    try {
      const seasonalTheme = await prisma.seasonalTheme.findFirst({
        where: { active: true },
        orderBy: { createdAt: 'desc' },
      })
      if (seasonalTheme) {
        activeSeasonalTheme = {
          season: seasonalTheme.season,
          title: seasonalTheme.title,
          subtitle: seasonalTheme.subtitle,
          description: seasonalTheme.description,
          imageUrl: seasonalTheme.imageUrl,
          startDate: seasonalTheme.startDate,
          endDate: seasonalTheme.endDate,
        }
      }
    } catch (e) {
      console.warn('[Layout API] Error loading seasonal theme:', e)
    }

    // Generate promotional sections
    const holidayTheme = getCurrentHolidayTheme()
    const promotionalSections = createPromotionalSections(
      layout.showcase,
      layout.categories,
      layout.brands
    )
    
    // Generate promotional banners (use admin promos if available, otherwise auto-generate)
    let promoBanners = []
    try {
      const adminPromos = await prisma.billboardPromo.findMany({
        where: { active: true },
        orderBy: { displayOrder: 'asc' },
        take: 3, // Limit to 3 for banner display
      })
      
      if (adminPromos.length > 0) {
        // Use admin-created promos
        promoBanners = adminPromos.map((p: any) => ({
          id: p.id,
          title: p.title,
          subtitle: p.subtitle,
          description: p.description,
          imageUrl: p.imageUrl,
          theme: p.theme || 'default',
          ctaText: p.ctaText,
          ctaLink: p.ctaLink,
          discount: null, // Admin promos don't have auto-calculated discounts
        }))
      } else {
        // Fallback: auto-generate promos
        promoBanners = holidayTheme.name === 'black-friday'
          ? generateBlackFridayPromos(layout.showcase)
          : generateHolidayPromos(layout.showcase)
      }
    } catch (e) {
      console.warn('[Layout API] Error loading promos, using auto-generated:', e)
      promoBanners = holidayTheme.name === 'black-friday'
        ? generateBlackFridayPromos(layout.showcase)
        : generateHolidayPromos(layout.showcase)
    }
    
    // Return enhanced layout with promotional data
    return NextResponse.json({
      ...layout,
      promotionalSections,
      promoBanners,
      holidayTheme: activeSeasonalTheme?.season || holidayTheme.name,
      seasonalTheme: activeSeasonalTheme,
    })
  } catch (error: any) {
    console.error('[Layout API] Error building catalog layout:', error)
    // Return safe empty layout on error
    return NextResponse.json({
      showcase: [],
      promos: [],
      brands: [],
      categories: [],
      trending: [],
      sabritasProducts: [],
      barcelProducts: [],
      seasonalProducts: [],
      drinkProducts: [],
      bundles: [],
      promotionalSections: [],
      promoBanners: [],
      heroBanner: null,
      holidayTheme: null,
      mainPromoBanner: null,
    })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { key, value, active = true } = body

    if (!key || value === undefined) {
      const err: ErrorResponse = { error: 'Key and value are required' }
      return NextResponse.json(err, { status: 400 })
    }

    // Ensure value is stored as JSON (Prisma Json type)
    const jsonValue = typeof value === 'string' ? JSON.parse(value) : value

    // Upsert layout setting
    const layout = await prisma.catalogLayout.upsert({
      where: { key },
      update: {
        value: jsonValue,
        active,
        updatedAt: new Date(),
      },
      create: {
        key,
        value: jsonValue,
        active,
      },
    })

    // Invalidate cache so frontend picks up changes
    const { revalidateTag, revalidatePath } = await import('next/cache')
    revalidateTag('catalog-layout')
    revalidateTag('catalog')
    revalidatePath('/catalog')
    revalidatePath('/')

    const response: TApiResponse<typeof layout> = { data: layout }
    return NextResponse.json(response)
  } catch (error: any) {
    console.error('Error saving catalog layout:', error)
    const err: ErrorResponse = { error: 'Failed to save catalog layout', details: error?.message }
    return NextResponse.json(err, { status: 500 })
  }
}
