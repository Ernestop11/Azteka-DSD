import { NextRequest, NextResponse } from 'next/server'

import prisma from '@/lib/prisma'
import type { TApiResponse, ErrorResponse } from '@/types/api'

export async function GET(request: NextRequest) {
  try {
    const categories = await prisma.category.findMany({
      orderBy: {
        name: 'asc',
      },
    })

    const response: TApiResponse<typeof categories> = { data: categories }
    return NextResponse.json(response)
  } catch (error) {
    console.error('Error fetching categories:', error)
    const err: ErrorResponse = { error: 'Failed to fetch categories' }
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
    const existing = await prisma.category.findUnique({
      where: { slug },
    })

    if (existing) {
      const err: ErrorResponse = { error: 'Slug already exists' }
      return NextResponse.json(err, { status: 400 })
    }

    const category = await prisma.category.create({
      data: {
        name,
        slug,
      },
    })

    const response: TApiResponse<typeof category> = { data: category }
    return NextResponse.json(response)
  } catch (error) {
    console.error('Error creating category:', error)
    const err: ErrorResponse = { error: 'Failed to create category' }
    return NextResponse.json(err, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, name, slug } = body

    if (!id) {
      const err: ErrorResponse = { error: 'Category ID is required' }
      return NextResponse.json(err, { status: 400 })
    }

    const category = await prisma.category.update({
      where: { id },
      data: {
        name,
        slug,
      },
    })

    const response: TApiResponse<typeof category> = { data: category }
    return NextResponse.json(response)
  } catch (error) {
    console.error('Error updating category:', error)
    const err: ErrorResponse = { error: 'Failed to update category' }
    return NextResponse.json(err, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json()
    const { id } = body

    if (!id) {
      const err: ErrorResponse = { error: 'Category ID is required' }
      return NextResponse.json(err, { status: 400 })
    }

    await prisma.category.delete({
      where: { id },
    })

    const response: TApiResponse<{ success: boolean }> = { data: { success: true } }
    return NextResponse.json(response)
  } catch (error) {
    console.error('Error deleting category:', error)
    const err: ErrorResponse = { error: 'Failed to delete category' }
    return NextResponse.json(err, { status: 500 })
  }
}
