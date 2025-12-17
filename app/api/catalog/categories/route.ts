import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    // TODO: Use prisma.category.findMany()
    // TODO: Optionally include product count
    // TODO: Return categories array

    return NextResponse.json({
      categories: [],
      // TODO: Return actual categories from database
    })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch categories' },
      { status: 500 }
    )
  }
}
