import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export const dynamic = 'force-dynamic'

// Default settings
const DEFAULT_SETTINGS = {
  backgroundGradient: 'linear-gradient(180deg, #0f3d0f 0%, #1a4d1a 50%, #0d2e0d 100%)',
  backgroundPattern: null,
  patternOpacity: 0.1,
  patternSize: '40px 40px',
  primaryColor: '#d4a853',
  secondaryColor: '#059669',
  animation: null,
  glowEffect: false,
  particleEffect: null,
}

// GET - Fetch catalog settings
export async function GET() {
  try {
    // Try to get settings from database, or return defaults
    const settings = await prisma.catalogSettings.findFirst()

    if (!settings) {
      return NextResponse.json({ data: DEFAULT_SETTINGS })
    }

    return NextResponse.json({
      data: {
        backgroundGradient: settings.backgroundGradient,
        backgroundPattern: settings.backgroundPattern,
        patternOpacity: settings.patternOpacity,
        patternSize: settings.patternSize || '40px 40px',
        primaryColor: settings.primaryColor,
        secondaryColor: settings.secondaryColor,
        animation: settings.animation,
        glowEffect: settings.glowEffect,
        particleEffect: settings.particleEffect,
      }
    })
  } catch (error: any) {
    console.error('[Catalog Settings API] Error:', error)
    // Return defaults on error
    return NextResponse.json({ data: DEFAULT_SETTINGS })
  }
}

// PUT - Update catalog settings (admin only)
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      backgroundGradient,
      backgroundPattern,
      patternOpacity,
      patternSize,
      primaryColor,
      secondaryColor,
      animation,
      glowEffect,
      particleEffect
    } = body

    // Build update data - only include defined fields
    const updateData: Record<string, unknown> = {}

    if (backgroundGradient !== undefined) updateData.backgroundGradient = backgroundGradient
    if (backgroundPattern !== undefined) updateData.backgroundPattern = backgroundPattern
    if (patternOpacity !== undefined) updateData.patternOpacity = patternOpacity
    if (patternSize !== undefined) updateData.patternSize = patternSize
    if (primaryColor !== undefined) updateData.primaryColor = primaryColor
    if (secondaryColor !== undefined) updateData.secondaryColor = secondaryColor
    if (animation !== undefined) updateData.animation = animation
    if (glowEffect !== undefined) updateData.glowEffect = glowEffect
    if (particleEffect !== undefined) updateData.particleEffect = particleEffect

    // Upsert settings
    const settings = await prisma.catalogSettings.upsert({
      where: { id: 'default' },
      update: updateData,
      create: {
        id: 'default',
        backgroundGradient: backgroundGradient || DEFAULT_SETTINGS.backgroundGradient,
        backgroundPattern: backgroundPattern || null,
        patternOpacity: patternOpacity || 0.1,
        patternSize: patternSize || '40px 40px',
        primaryColor: primaryColor || DEFAULT_SETTINGS.primaryColor,
        secondaryColor: secondaryColor || DEFAULT_SETTINGS.secondaryColor,
        animation: animation || null,
        glowEffect: glowEffect || false,
        particleEffect: particleEffect || null,
      }
    })

    return NextResponse.json({
      data: {
        backgroundGradient: settings.backgroundGradient,
        backgroundPattern: settings.backgroundPattern,
        patternOpacity: settings.patternOpacity,
        patternSize: settings.patternSize,
        primaryColor: settings.primaryColor,
        secondaryColor: settings.secondaryColor,
        animation: settings.animation,
        glowEffect: settings.glowEffect,
        particleEffect: settings.particleEffect,
      }
    })
  } catch (error: any) {
    console.error('[Catalog Settings API] PUT Error:', error)
    return NextResponse.json({ error: 'Failed to update settings', details: error.message }, { status: 500 })
  }
}
