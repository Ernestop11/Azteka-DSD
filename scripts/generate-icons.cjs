#!/usr/bin/env node
/**
 * Azteka Icon Generator
 * Generates all PWA icons, Apple touch icons, and favicons from a source image
 *
 * Usage: node scripts/generate-icons.js [source-image-path]
 * Default: looks for azteka-logo-source.png in project root
 */

const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const SOURCE_IMAGE = process.argv[2] || path.join(__dirname, '..', 'azteka-logo-source.png');
const ICONS_DIR = path.join(__dirname, '..', 'public', 'icons');
const PUBLIC_DIR = path.join(__dirname, '..', 'public');

// Icon sizes needed for PWA and Apple
const ICON_SIZES = [
  { size: 16, name: 'favicon-16x16.png' },
  { size: 32, name: 'favicon-32x32.png' },
  { size: 32, name: 'icon-32x32.png' },
  { size: 72, name: 'icon-72x72.png' },
  { size: 96, name: 'icon-96x96.png' },
  { size: 120, name: 'icon-120x120.png' },
  { size: 128, name: 'icon-128x128.png' },
  { size: 144, name: 'icon-144x144.png' },
  { size: 152, name: 'icon-152x152.png' },
  { size: 180, name: 'icon-180x180.png' },
  { size: 180, name: 'apple-touch-icon.png' },
  { size: 192, name: 'icon-192x192.png' },
  { size: 384, name: 'icon-384x384.png' },
  { size: 512, name: 'icon-512x512.png' },
];

// Maskable icons (with padding for safe zone)
const MASKABLE_SIZES = [
  { size: 192, name: 'icon-maskable-192x192.png' },
  { size: 512, name: 'icon-maskable-512x512.png' },
];

async function generateIcons() {
  console.log('🎨 Azteka Icon Generator');
  console.log('========================\n');

  // Check if source image exists
  if (!fs.existsSync(SOURCE_IMAGE)) {
    console.error(`❌ Source image not found: ${SOURCE_IMAGE}`);
    console.log('\nPlease save the Azteka logo to one of these locations:');
    console.log('  - /Users/ernestoponce/dev/azteka-dsd/azteka-logo-source.png');
    console.log('  - Or provide path as argument: node scripts/generate-icons.js /path/to/image.png');
    process.exit(1);
  }

  console.log(`📁 Source: ${SOURCE_IMAGE}`);
  console.log(`📁 Output: ${ICONS_DIR}\n`);

  // Ensure icons directory exists
  if (!fs.existsSync(ICONS_DIR)) {
    fs.mkdirSync(ICONS_DIR, { recursive: true });
  }

  const sourceBuffer = fs.readFileSync(SOURCE_IMAGE);
  const metadata = await sharp(sourceBuffer).metadata();
  console.log(`📐 Source dimensions: ${metadata.width}x${metadata.height}\n`);

  // Generate standard icons
  console.log('Generating standard icons...');
  for (const { size, name } of ICON_SIZES) {
    const outputPath = path.join(ICONS_DIR, name);
    await sharp(sourceBuffer)
      .resize(size, size, {
        fit: 'contain',
        background: { r: 0, g: 0, b: 0, alpha: 0 }
      })
      .png()
      .toFile(outputPath);
    console.log(`  ✅ ${name} (${size}x${size})`);
  }

  // Generate maskable icons (with safe zone padding - 10% on each side)
  console.log('\nGenerating maskable icons (with safe zone)...');
  for (const { size, name } of MASKABLE_SIZES) {
    const outputPath = path.join(ICONS_DIR, name);
    const innerSize = Math.floor(size * 0.8); // 80% of total size for logo
    const padding = Math.floor(size * 0.1); // 10% padding on each side

    // Create the icon with padding and black background
    await sharp(sourceBuffer)
      .resize(innerSize, innerSize, { fit: 'contain' })
      .extend({
        top: padding,
        bottom: padding,
        left: padding,
        right: padding,
        background: { r: 15, g: 23, b: 42, alpha: 1 } // slate-900 background
      })
      .png()
      .toFile(outputPath);
    console.log(`  ✅ ${name} (${size}x${size})`);
  }

  // Copy apple-touch-icon to public root
  console.log('\nCopying to public root...');
  const appleTouchSrc = path.join(ICONS_DIR, 'apple-touch-icon.png');
  const appleTouchDest = path.join(PUBLIC_DIR, 'apple-touch-icon.png');
  fs.copyFileSync(appleTouchSrc, appleTouchDest);
  console.log('  ✅ apple-touch-icon.png → public/');

  // Generate favicon.ico (multi-size ICO file)
  console.log('\nGenerating favicon.ico...');
  const favicon16 = await sharp(sourceBuffer).resize(16, 16).png().toBuffer();
  const favicon32 = await sharp(sourceBuffer).resize(32, 32).png().toBuffer();

  // For ICO, we'll just use the 32x32 PNG as favicon.ico
  // (browsers handle PNG favicons well now)
  const faviconPath = path.join(PUBLIC_DIR, 'favicon.ico');
  await sharp(sourceBuffer)
    .resize(32, 32)
    .png()
    .toFile(faviconPath);
  console.log('  ✅ favicon.ico (32x32)');

  // Also save as favicon.png for modern browsers
  const faviconPngPath = path.join(PUBLIC_DIR, 'favicon.png');
  await sharp(sourceBuffer)
    .resize(32, 32)
    .png()
    .toFile(faviconPngPath);
  console.log('  ✅ favicon.png (32x32)');

  console.log('\n✨ All icons generated successfully!');
  console.log('\nNext steps:');
  console.log('  1. Check the icons in public/icons/');
  console.log('  2. Run: npm run build:next');
  console.log('  3. Deploy: ./scripts/deploy.sh');
}

generateIcons().catch(err => {
  console.error('Error generating icons:', err);
  process.exit(1);
});
