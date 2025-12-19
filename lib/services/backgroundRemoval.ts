/**
 * Background Removal Service
 * 
 * ISOLATED SERVICE: This service is completely separate from main upload flow.
 * It does NOT break any existing functionality.
 * 
 * Usage: Only call this from a dedicated admin tool or post-upload modal.
 * DO NOT use in automatic upload flows.
 */

import sharp from 'sharp'

// Dynamic import for AI background removal (heavy dependency)
let removeBackgroundAI: ((input: Buffer) => Promise<Blob>) | null = null

/**
 * Load AI background removal library (lazy load)
 */
async function loadBackgroundRemovalAI() {
  if (!removeBackgroundAI) {
    try {
      const { removeBackground } = await import('@imgly/background-removal-node')
      removeBackgroundAI = removeBackground
    } catch (err) {
      console.warn('[BackgroundRemoval] AI background removal not available:', err)
    }
  }
  return removeBackgroundAI
}

/**
 * Remove background using AI (professional quality)
 * Handles complex backgrounds, hair, fur, and soft edges.
 */
export async function removeBackgroundAI(inputBuffer: Buffer): Promise<Buffer> {
  try {
    const aiRemover = await loadBackgroundRemovalAI()
    if (!aiRemover) {
      throw new Error('AI background removal library not available')
    }

    console.log('[BackgroundRemoval] Using AI background removal...')
    const blob = await aiRemover(inputBuffer)
    const arrayBuffer = await blob.arrayBuffer()
    const result = Buffer.from(arrayBuffer)
    console.log('[BackgroundRemoval] AI background removal successful')
    return result
  } catch (error) {
    console.error('[BackgroundRemoval] AI background removal failed:', error)
    throw error
  }
}

/**
 * Basic white/light background removal using Sharp
 * Fallback when AI model is not available
 */
export async function removeBackgroundBasic(inputBuffer: Buffer): Promise<Buffer> {
  try {
    const resizedBuffer = await sharp(inputBuffer)
      .resize(800, 800, { fit: 'inside', withoutEnlargement: true })
      .ensureAlpha()
      .raw()
      .toBuffer({ resolveWithObject: true })

    const { data, info } = resizedBuffer
    const pixels = new Uint8Array(data)
    const pixelCount = info.width * info.height

    for (let i = 0; i < pixelCount; i++) {
      const idx = i * 4
      const r = pixels[idx]
      const g = pixels[idx + 1]
      const b = pixels[idx + 2]

      const isLight = r > 230 && g > 230 && b > 230
      const isLightGray = r > 200 && g > 200 && b > 200 &&
                          Math.abs(r - g) < 20 && Math.abs(g - b) < 20 && Math.abs(r - b) < 20

      if (isLight || isLightGray) {
        pixels[idx + 3] = 0 // Make transparent
      }
    }

    return sharp(Buffer.from(pixels), {
      raw: { width: info.width, height: info.height, channels: 4 }
    }).png().toBuffer()
  } catch (err) {
    console.error('[BackgroundRemoval] Basic background removal failed:', err)
    throw err
  }
}

/**
 * Remove background with fallback
 * Tries AI first, falls back to basic if AI fails
 */
export async function removeBackground(inputBuffer: Buffer, useAI: boolean = true): Promise<Buffer> {
  if (useAI) {
    try {
      return await removeBackgroundAI(inputBuffer)
    } catch (aiError) {
      console.warn('[BackgroundRemoval] AI failed, using basic fallback:', aiError)
      return await removeBackgroundBasic(inputBuffer)
    }
  } else {
    return await removeBackgroundBasic(inputBuffer)
  }
}

