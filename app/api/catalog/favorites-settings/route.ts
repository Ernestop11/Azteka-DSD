/**
 * Favorites UI Settings API
 * GET - Fetch favorites UI settings
 * PUT - Update favorites UI settings
 */

import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

// Default settings (matches schema defaults)
const DEFAULT_SETTINGS = {
  id: 'default',
  backgroundGradient: 'linear-gradient(180deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)',
  backgroundPattern: null,
  patternOpacity: 0.1,
  patternSize: '40px 40px',
  cardBackground: 'linear-gradient(135deg, #ffffff 0%, #f9fafb 100%)',
  cardBorderRadius: '16px',
  cardShadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
  cardHoverScale: 1.02,
  // New fields matching Catalog builder
  cardStylePreset: 'dark-red',
  imageBg: 'linear-gradient(180deg, #1e293b 0%, #334155 100%)',
  imageEffect: 'none',
  primaryColor: '#10b981',
  accentColor: '#3b82f6',
  animation: null,
  glowEffect: false,
  headerBackground: 'rgba(15,23,42,0.8)',
  bottomBarStyle: 'gradient',
}

export async function GET() {
  try {
    let settings = await prisma.favoritesUISettings.findUnique({
      where: { id: 'default' },
    })

    // Return defaults if not yet created
    if (!settings) {
      settings = DEFAULT_SETTINGS as typeof settings
    }

    return NextResponse.json({ data: settings })
  } catch (error) {
    console.error('[GET /api/catalog/favorites-settings]', error)
    return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()

    // Upsert settings
    const settings = await prisma.favoritesUISettings.upsert({
      where: { id: 'default' },
      update: {
        backgroundGradient: body.backgroundGradient,
        backgroundPattern: body.backgroundPattern,
        patternOpacity: body.patternOpacity,
        patternSize: body.patternSize,
        cardBackground: body.cardBackground,
        cardBorderRadius: body.cardBorderRadius,
        cardShadow: body.cardShadow,
        cardHoverScale: body.cardHoverScale,
        // New fields
        cardStylePreset: body.cardStylePreset,
        imageBg: body.imageBg,
        imageEffect: body.imageEffect,
        primaryColor: body.primaryColor,
        accentColor: body.accentColor,
        animation: body.animation,
        glowEffect: body.glowEffect,
        headerBackground: body.headerBackground,
        bottomBarStyle: body.bottomBarStyle,
      },
      create: {
        id: 'default',
        backgroundGradient: body.backgroundGradient || DEFAULT_SETTINGS.backgroundGradient,
        backgroundPattern: body.backgroundPattern,
        patternOpacity: body.patternOpacity ?? DEFAULT_SETTINGS.patternOpacity,
        patternSize: body.patternSize || DEFAULT_SETTINGS.patternSize,
        cardBackground: body.cardBackground || DEFAULT_SETTINGS.cardBackground,
        cardBorderRadius: body.cardBorderRadius || DEFAULT_SETTINGS.cardBorderRadius,
        cardShadow: body.cardShadow || DEFAULT_SETTINGS.cardShadow,
        cardHoverScale: body.cardHoverScale ?? DEFAULT_SETTINGS.cardHoverScale,
        // New fields
        cardStylePreset: body.cardStylePreset || DEFAULT_SETTINGS.cardStylePreset,
        imageBg: body.imageBg || DEFAULT_SETTINGS.imageBg,
        imageEffect: body.imageEffect || DEFAULT_SETTINGS.imageEffect,
        primaryColor: body.primaryColor || DEFAULT_SETTINGS.primaryColor,
        accentColor: body.accentColor || DEFAULT_SETTINGS.accentColor,
        animation: body.animation,
        glowEffect: body.glowEffect ?? DEFAULT_SETTINGS.glowEffect,
        headerBackground: body.headerBackground || DEFAULT_SETTINGS.headerBackground,
        bottomBarStyle: body.bottomBarStyle || DEFAULT_SETTINGS.bottomBarStyle,
      },
    })

    return NextResponse.json({ data: settings })
  } catch (error) {
    console.error('[PUT /api/catalog/favorites-settings]', error)
    return NextResponse.json({ error: 'Failed to save settings' }, { status: 500 })
  }
}
