import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import type { TApiResponse, ErrorResponse } from '@/types/api'

export async function GET(request: NextRequest) {
  try {
    const themes = await prisma.seasonalTheme.findMany({
      orderBy: { season: 'asc' },
    })

    const response: TApiResponse<typeof themes> = { data: themes }
    return NextResponse.json(response)
  } catch (error: any) {
    console.error('Error fetching seasonal themes:', error)
    const err: ErrorResponse = { error: 'Failed to fetch seasonal themes' }
    return NextResponse.json(err, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { season, active, title, subtitle, description, imageUrl, startDate, endDate } = body

    if (!season || !title) {
      const err: ErrorResponse = { error: 'Season and title are required' }
      return NextResponse.json(err, { status: 400 })
    }

    const theme = await prisma.seasonalTheme.create({
      data: {
        season,
        active: active ?? false,
        title,
        subtitle: subtitle || null,
        description: description || null,
        imageUrl: imageUrl || null,
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
      },
    })

    const response: TApiResponse<typeof theme> = { data: theme }
    return NextResponse.json(response)
  } catch (error: any) {
    console.error('Error creating seasonal theme:', error)
    const err: ErrorResponse = { error: 'Failed to create seasonal theme', details: error?.message }
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

    // Handle date conversion
    const data: any = { ...updateData }
    if (data.startDate) data.startDate = new Date(data.startDate)
    if (data.endDate) data.endDate = new Date(data.endDate)

    const theme = await prisma.seasonalTheme.update({
      where: { id },
      data,
    })

    const response: TApiResponse<typeof theme> = { data: theme }
    return NextResponse.json(response)
  } catch (error: any) {
    console.error('Error updating seasonal theme:', error)
    const err: ErrorResponse = { error: 'Failed to update seasonal theme', details: error?.message }
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

    await prisma.seasonalTheme.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Error deleting seasonal theme:', error)
    const err: ErrorResponse = { error: 'Failed to delete seasonal theme', details: error?.message }
    return NextResponse.json(err, { status: 500 })
  }
}

