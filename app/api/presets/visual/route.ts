import { NextRequest, NextResponse } from 'next/server'

/**
 * GET /api/presets/visual
 * Returns all available visual presets for Admin UI
 */
export async function GET(request: NextRequest) {
  try {
    // Try to import presets - wrap in try/catch for import errors
    let gradients: any[] = []
    let splashes: any[] = []
    let glows: any[] = []

    try {
      const { GRADIENT_CATALOG, SPLASH_CATALOG, GLOW_CATALOG } = await import('@/lib/cards/presetTypes')

      if (!GRADIENT_CATALOG || !SPLASH_CATALOG || !GLOW_CATALOG) {
        console.warn('[Presets API] Missing catalog imports - returning empty arrays')
        return NextResponse.json({
          gradients: [],
          splashes: [],
          glows: [],
          total: {
            gradients: 0,
            splashes: 0,
            glows: 0,
          },
        })
      }

      // Convert catalog objects to arrays
      gradients = Object.values(GRADIENT_CATALOG).map((preset: any) => ({
        id: preset.id,
        name: preset.name,
        classes: preset.classes,
        rgb: preset.rgb,
        categoryHint: preset.category_hint,
        seasonal: preset.seasonal || [],
      }))

      splashes = Object.values(SPLASH_CATALOG).map((preset: any) => ({
        id: preset.id,
        label: preset.label,
        hint: preset.hint,
        overlayUrl: preset.overlay_url,
        categoryHint: preset.category_hint,
        seasonal: preset.seasonal || [],
      }))

      glows = Object.values(GLOW_CATALOG).map((preset: any) => ({
        id: preset.id,
        label: preset.label,
        classes: preset.classes,
        categoryHint: preset.category_hint,
      }))
    } catch (importError: any) {
      console.error('[Presets API] Error importing or processing catalogs:', importError)
      // Return empty arrays gracefully
      return NextResponse.json({
        gradients: [],
        splashes: [],
        glows: [],
        total: {
          gradients: 0,
          splashes: 0,
          glows: 0,
        },
      })
    }

    console.log('[Presets API] Returning presets:', {
      gradients: gradients.length,
      splashes: splashes.length,
      glows: glows.length,
    })

    return NextResponse.json({
      gradients,
      splashes,
      glows,
      total: {
        gradients: gradients.length,
        splashes: splashes.length,
        glows: glows.length,
      },
    })
  } catch (error: any) {
    console.error('[Presets API] Error fetching visual presets:', {
      message: error?.message,
      stack: error?.stack,
      name: error?.name,
    })
    return NextResponse.json(
      {
        error: 'Failed to fetch visual presets',
        details: error?.message || String(error),
        gradients: [],
        splashes: [],
        glows: [],
      },
      { status: 500 }
    )
  }
}
