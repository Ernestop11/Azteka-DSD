import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    // TODO: Use prisma.brand.findMany()
    // TODO: Optionally include product count
    // TODO: Return brands array

    return NextResponse.json({
      brands: [],
      // TODO: Return actual brands from database
    })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch brands' },
      { status: 500 }
    )
  }
}
