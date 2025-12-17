import { NextRequest, NextResponse } from 'next/server'

/**
 * POST /api/users/theme
 * Persist user's theme selection (for sales reps)
 */
export async function POST(request: NextRequest) {
  try {
    const { userId, theme } = await request.json()

    if (!userId || !theme) {
      return NextResponse.json(
        { error: 'User ID and theme are required' },
        { status: 400 }
      )
    }

    // Validate theme
    const validThemes = ['toy-store', 'neon-energy', 'fresh-splash', 'luxury-gold']
    if (!validThemes.includes(theme)) {
      return NextResponse.json(
        { error: 'Invalid theme' },
        { status: 400 }
      )
    }

    // TODO: Save to database when User model is updated
    // await prisma.user.update({
    //   where: { id: userId },
    //   data: { preferredTheme: theme },
    // })

    return NextResponse.json({
      success: true,
      message: 'Theme saved successfully',
      userId,
      theme,
    })
  } catch (error) {
    console.error('[THEME_SAVE_ERROR]', error)
    return NextResponse.json(
      { error: 'Failed to save theme' },
      { status: 500 }
    )
  }
}

/**
 * GET /api/users/theme?userId=xxx
 * Get user's saved theme
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      )
    }

    // TODO: Fetch from database when User model is updated
    // const user = await prisma.user.findUnique({
    //   where: { id: userId },
    //   select: { preferredTheme: true },
    // })

    // For now, return default
    return NextResponse.json({
      success: true,
      userId,
      theme: 'toy-store', // Default theme
    })
  } catch (error) {
    console.error('[THEME_FETCH_ERROR]', error)
    return NextResponse.json(
      { error: 'Failed to fetch theme' },
      { status: 500 }
    )
  }
}
