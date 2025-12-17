import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { normalizeProductImage } from '@/lib/imageUrl'
import type { TApiResponse, ErrorResponse } from '@/types/api'

export const dynamic = 'force-dynamic'

interface Promo {
  id: string
  title: string
  subtitle?: string | null
  description?: string | null
  imageUrl: string
  imagePosition?: string
  theme?: string
  ctaText?: string | null
  ctaLink?: string | null
  active: boolean
  displayOrder: number
  productIds?: string[]
  link?: string
}

export async function GET() {
  try {
    // Use BillboardPromo table (correct table name from schema)
    const promos = await prisma.billboardPromo.findMany({
      orderBy: { displayOrder: 'asc' },
    })

    const normalizedPromos: Promo[] = promos.map((promo: any) => ({
      id: promo.id,
      title: promo.title ?? '',
      subtitle: promo.subtitle ?? null,
      description: promo.description ?? null,
      imageUrl: normalizeProductImage({ imageUrl: promo.imageUrl }),
      imagePosition: promo.imagePosition ?? 'right',
      theme: promo.theme ?? 'blue',
      ctaText: promo.ctaText ?? null,
      ctaLink: promo.ctaLink ?? null,
      active: promo.active ?? true,
      displayOrder: promo.displayOrder ?? 0,
      productIds: promo.productIds ?? [],
      link: promo.ctaLink ?? null,
    }))

    const response: TApiResponse<typeof normalizedPromos> = { data: normalizedPromos }
    return NextResponse.json(response)
  } catch (error: any) {
    console.error('[PROMOS] Unexpected error:', error)
    return NextResponse.json({ data: [] })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      title,
      subtitle,
      description,
      imageUrl,
      imagePosition,
      theme,
      ctaText,
      ctaLink,
      active,
      displayOrder,
    } = body

    if (!title || !imageUrl) {
      const err: ErrorResponse = { error: 'Title and image URL are required' }
      return NextResponse.json(err, { status: 400 })
    }

    // Get max display order if not provided
    const maxOrder = displayOrder ?? (await prisma.billboardPromo.count().catch(() => 0) || 0)

    const promo = await prisma.billboardPromo.create({
      data: {
        title,
        subtitle: subtitle || null,
        description: description || null,
        imageUrl,
        imagePosition: imagePosition || 'right',
        theme: theme || 'blue',
        ctaText: ctaText || null,
        ctaLink: ctaLink || null,
        active: active ?? true,
        displayOrder: maxOrder,
      },
    })

    const response: TApiResponse<typeof promo> = { data: promo }
    return NextResponse.json(response)
  } catch (error: any) {
    console.error('Error creating billboard promo:', error)
    const err: ErrorResponse = { error: 'Failed to create billboard promo', details: error?.message }
    return NextResponse.json(err, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, ...updateData } = body

    if (!id) {
      const err: ErrorResponse = { error: 'ID is required' }
      return NextResponse.json(err, { status: 400 })
    }

    const promo = await prisma.billboardPromo.update({
      where: { id },
      data: updateData,
    })

    const response: TApiResponse<typeof promo> = { data: promo }
    return NextResponse.json(response)
  } catch (error: any) {
    console.error('Error updating billboard promo:', error)
    const err: ErrorResponse = { error: 'Failed to update billboard promo', details: error?.message }
    return NextResponse.json(err, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      const err: ErrorResponse = { error: 'ID is required' }
      return NextResponse.json(err, { status: 400 })
    }

    await prisma.billboardPromo.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Error deleting billboard promo:', error)
    const err: ErrorResponse = { error: 'Failed to delete billboard promo', details: error?.message }
    return NextResponse.json(err, { status: 500 })
  }
}
