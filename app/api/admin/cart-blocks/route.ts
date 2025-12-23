import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { requireAdmin, unauthorizedResponse } from '../../lib/auth'

// GET - Fetch cart blocks configuration
export async function GET() {
  // Require admin authentication
  const user = await requireAdmin()
  if (!user) return unauthorizedResponse()

  try {
    const settings = await prisma.businessSettings.findFirst({
      select: { cartBlocksConfig: true }
    })

    // Return empty array if no config exists
    const blocks = settings?.cartBlocksConfig || []

    return NextResponse.json({ success: true, data: blocks })
  } catch (error) {
    console.error('[CartBlocks] Error fetching cart blocks:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch cart blocks configuration' },
      { status: 500 }
    )
  }
}

// POST - Save cart blocks configuration
export async function POST(req: NextRequest) {
  // Require admin authentication
  const user = await requireAdmin()
  if (!user) return unauthorizedResponse()

  try {
    const { blocks } = await req.json()

    if (!Array.isArray(blocks)) {
      return NextResponse.json(
        { success: false, error: 'Invalid blocks format - expected array' },
        { status: 400 }
      )
    }

    // Validate block structure
    for (const block of blocks) {
      if (!block.id || !block.type || !block.title) {
        return NextResponse.json(
          { success: false, error: 'Each block must have id, type, and title' },
          { status: 400 }
        )
      }
    }

    // Upsert settings with cart blocks config
    const settings = await prisma.businessSettings.findFirst()

    if (settings) {
      await prisma.businessSettings.update({
        where: { id: settings.id },
        data: { cartBlocksConfig: blocks }
      })
    } else {
      await prisma.businessSettings.create({
        data: {
          businessName: 'Azteka DSD',
          cartBlocksConfig: blocks
        }
      })
    }

    return NextResponse.json({ success: true, message: 'Cart blocks saved successfully' })
  } catch (error) {
    console.error('[CartBlocks] Error saving cart blocks:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to save cart blocks configuration' },
      { status: 500 }
    )
  }
}
