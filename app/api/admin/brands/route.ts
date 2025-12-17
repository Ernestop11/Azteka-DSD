import { NextRequest, NextResponse } from 'next/server'

import prisma from '@/lib/prisma'
import type { TApiResponse, ErrorResponse } from '@/types/api'

export async function GET(request: NextRequest) {
  try {
    const brands = await prisma.brand.findMany({
      orderBy: {
        name: 'asc',
      },
    })

    const response: TApiResponse<typeof brands> = { data: brands }
    return NextResponse.json(response)
  } catch (error) {
    console.error('Error fetching brands:', error)
    const err: ErrorResponse = { error: 'Failed to fetch brands' }
    return NextResponse.json(err, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, slug } = body

    if (!name || !slug) {
      const err: ErrorResponse = { error: 'Name and slug are required' }
      return NextResponse.json(err, { status: 400 })
    }

    // Check if slug already exists
    const existing = await prisma.brand.findUnique({
      where: { slug },
    })

    if (existing) {
      const err: ErrorResponse = { error: 'Slug already exists' }
      return NextResponse.json(err, { status: 400 })
    }

    const brand = await prisma.brand.create({
      data: {
        name,
        slug,
      },
    })

    const response: TApiResponse<typeof brand> = { data: brand }
    return NextResponse.json(response)
  } catch (error) {
    console.error('Error creating brand:', error)
    const err: ErrorResponse = { error: 'Failed to create brand' }
    return NextResponse.json(err, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, name, slug } = body

    if (!id) {
      const err: ErrorResponse = { error: 'Brand ID is required' }
      return NextResponse.json(err, { status: 400 })
    }

    const brand = await prisma.brand.update({
      where: { id },
      data: {
        name,
        slug,
      },
    })

    const response: TApiResponse<typeof brand> = { data: brand }
    return NextResponse.json(response)
  } catch (error) {
    console.error('Error updating brand:', error)
    const err: ErrorResponse = { error: 'Failed to update brand' }
    return NextResponse.json(err, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json()
    const { id } = body

    if (!id) {
      const err: ErrorResponse = { error: 'Brand ID is required' }
      return NextResponse.json(err, { status: 400 })
    }

    await prisma.brand.delete({
      where: { id },
    })

    const response: TApiResponse<{ success: boolean }> = { data: { success: true } }
    return NextResponse.json(response)
  } catch (error) {
    console.error('Error deleting brand:', error)
    const err: ErrorResponse = { error: 'Failed to delete brand' }
    return NextResponse.json(err, { status: 500 })
  }
}
