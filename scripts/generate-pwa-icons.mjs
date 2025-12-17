#!/usr/bin/env node
/**
 * PWA Icon Generator
 * Generates all required PWA icons from a source SVG or PNG
 * Run: node scripts/generate-pwa-icons.mjs
 */

import { execSync } from 'child_process'
import { existsSync, mkdirSync, writeFileSync, copyFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const publicDir = join(__dirname, '..', 'public')
const iconsDir = join(publicDir, 'icons')
const splashDir = join(publicDir, 'splash')

// Icon sizes needed for PWA
const ICON_SIZES = [32, 72, 96, 128, 144, 152, 180, 192, 384, 512]

// Splash screen sizes for iOS
const SPLASH_SIZES = [
  { width: 2048, height: 2732, name: 'apple-splash-2048-2732.png' },
  { width: 1668, height: 2388, name: 'apple-splash-1668-2388.png' },
  { width: 1536, height: 2048, name: 'apple-splash-1536-2048.png' },
  { width: 1125, height: 2436, name: 'apple-splash-1125-2436.png' },
  { width: 1242, height: 2688, name: 'apple-splash-1242-2688.png' },
  { width: 750, height: 1334, name: 'apple-splash-750-1334.png' },
  { width: 640, height: 1136, name: 'apple-splash-640-1136.png' },
]

// Create directories
if (!existsSync(iconsDir)) mkdirSync(iconsDir, { recursive: true })
if (!existsSync(splashDir)) mkdirSync(splashDir, { recursive: true })

// Try to use sharp if available, otherwise create placeholder PNGs
async function generateIcons() {
  let sharp
  try {
    sharp = (await import('sharp')).default
    console.log('Using sharp for icon generation...')
  } catch {
    console.log('Sharp not available, creating placeholder icons...')
    createPlaceholderIcons()
    return
  }

  const svgPath = join(iconsDir, 'icon.svg')
  if (!existsSync(svgPath)) {
    console.error('Source SVG not found at:', svgPath)
    createPlaceholderIcons()
    return
  }

  // Generate icons
  for (const size of ICON_SIZES) {
    const outputPath = join(iconsDir, `icon-${size}x${size}.png`)
    try {
      await sharp(svgPath)
        .resize(size, size)
        .png()
        .toFile(outputPath)
      console.log(`Generated: icon-${size}x${size}.png`)
    } catch (err) {
      console.error(`Failed to generate ${size}x${size}:`, err.message)
    }
  }

  // Generate apple-touch-icon
  try {
    await sharp(svgPath)
      .resize(180, 180)
      .png()
      .toFile(join(iconsDir, 'apple-touch-icon.png'))
    console.log('Generated: apple-touch-icon.png')
  } catch (err) {
    console.error('Failed to generate apple-touch-icon:', err.message)
  }

  // Generate maskable icons (with padding)
  for (const size of [192, 512]) {
    const outputPath = join(iconsDir, `icon-maskable-${size}x${size}.png`)
    try {
      const padding = Math.round(size * 0.1)
      const innerSize = size - (padding * 2)

      await sharp(svgPath)
        .resize(innerSize, innerSize)
        .extend({
          top: padding,
          bottom: padding,
          left: padding,
          right: padding,
          background: { r: 16, g: 185, b: 129, alpha: 1 }
        })
        .png()
        .toFile(outputPath)
      console.log(`Generated: icon-maskable-${size}x${size}.png`)
    } catch (err) {
      console.error(`Failed to generate maskable ${size}x${size}:`, err.message)
    }
  }

  // Generate splash screens
  for (const splash of SPLASH_SIZES) {
    const outputPath = join(splashDir, splash.name)
    try {
      const iconSize = Math.min(splash.width, splash.height) * 0.3
      const iconBuffer = await sharp(svgPath)
        .resize(Math.round(iconSize), Math.round(iconSize))
        .png()
        .toBuffer()

      await sharp({
        create: {
          width: splash.width,
          height: splash.height,
          channels: 4,
          background: { r: 15, g: 23, b: 42, alpha: 1 }
        }
      })
        .composite([{
          input: iconBuffer,
          gravity: 'center'
        }])
        .png()
        .toFile(outputPath)
      console.log(`Generated: ${splash.name}`)
    } catch (err) {
      console.error(`Failed to generate ${splash.name}:`, err.message)
    }
  }

  console.log('\\nIcon generation complete!')
}

function createPlaceholderIcons() {
  // Create a simple 1x1 transparent PNG as placeholder
  // This is a minimal valid PNG file
  const minimalPng = Buffer.from([
    0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, // PNG signature
    0x00, 0x00, 0x00, 0x0D, 0x49, 0x48, 0x44, 0x52, // IHDR chunk
    0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01,
    0x08, 0x06, 0x00, 0x00, 0x00, 0x1F, 0x15, 0xC4,
    0x89, 0x00, 0x00, 0x00, 0x0A, 0x49, 0x44, 0x41,
    0x54, 0x78, 0x9C, 0x63, 0x00, 0x01, 0x00, 0x00,
    0x05, 0x00, 0x01, 0x0D, 0x0A, 0x2D, 0xB4, 0x00,
    0x00, 0x00, 0x00, 0x49, 0x45, 0x4E, 0x44, 0xAE,
    0x42, 0x60, 0x82
  ])

  console.log('Creating placeholder PNG icons...')

  for (const size of ICON_SIZES) {
    const filePath = join(iconsDir, `icon-${size}x${size}.png`)
    if (!existsSync(filePath)) {
      writeFileSync(filePath, minimalPng)
      console.log(`Created placeholder: icon-${size}x${size}.png`)
    }
  }

  // Apple touch icon
  const applePath = join(iconsDir, 'apple-touch-icon.png')
  if (!existsSync(applePath)) {
    writeFileSync(applePath, minimalPng)
    console.log('Created placeholder: apple-touch-icon.png')
  }

  // Maskable icons
  for (const size of [192, 512]) {
    const filePath = join(iconsDir, `icon-maskable-${size}x${size}.png`)
    if (!existsSync(filePath)) {
      writeFileSync(filePath, minimalPng)
      console.log(`Created placeholder: icon-maskable-${size}x${size}.png`)
    }
  }

  // Splash screens
  for (const splash of SPLASH_SIZES) {
    const filePath = join(splashDir, splash.name)
    if (!existsSync(filePath)) {
      writeFileSync(filePath, minimalPng)
      console.log(`Created placeholder: ${splash.name}`)
    }
  }

  console.log('\\nPlaceholder icons created!')
  console.log('To generate proper icons, install sharp: npm install sharp')
  console.log('Then run: node scripts/generate-pwa-icons.mjs')
}

generateIcons().catch(console.error)
