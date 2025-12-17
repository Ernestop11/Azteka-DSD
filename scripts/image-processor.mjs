import sharp from 'sharp';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { PrismaClient } from '@prisma/client';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const prisma = new PrismaClient();

/**
 * Process product image - creates multiple sizes
 * @param {string} inputPath - Path to input image file
 * @param {string} productId - Product ID for naming
 * @returns {Promise<Object>} Object with thumbnail, medium, and original URLs
 */
export async function processProductImage(inputPath, productId) {
  const outputDir = path.join(__dirname, '../public/uploads/products');
  
  // Ensure directories exist
  await fs.mkdir(`${outputDir}/thumbnails`, { recursive: true });
  await fs.mkdir(`${outputDir}/medium`, { recursive: true });
  await fs.mkdir(`${outputDir}/original`, { recursive: true });
  
  const timestamp = Date.now();
  const baseName = `${productId}-${timestamp}`;
  
  // Create thumbnails (150x150)
  const thumbnailPath = `${outputDir}/thumbnails/${baseName}.jpg`;
  await sharp(inputPath)
    .resize(150, 150, { fit: 'cover' })
    .jpeg({ quality: 80 })
    .toFile(thumbnailPath);
    
  // Create medium size (300x300)  
  const mediumPath = `${outputDir}/medium/${baseName}.jpg`;
  await sharp(inputPath)
    .resize(300, 300, { fit: 'cover' })
    .jpeg({ quality: 85 })
    .toFile(mediumPath);
    
  // Keep original (max 800px width, maintain aspect ratio)
  const originalPath = `${outputDir}/original/${baseName}.jpg`;
  await sharp(inputPath)
    .resize(800, null, { withoutEnlargement: true })
    .jpeg({ quality: 90 })
    .toFile(originalPath);
    
  const imageUrls = {
    thumbnail: `/uploads/products/thumbnails/${baseName}.jpg`,
    medium: `/uploads/products/medium/${baseName}.jpg`,
    original: `/uploads/products/original/${baseName}.jpg`
  };
  
  // Update BOTH schema approaches for compatibility
  try {
    // 1. Update direct fields (for Sonnet 4.5 APIs)
    await prisma.product.update({
      where: { id: productId },
      data: {
        imageUrl: imageUrls.original,
        thumbnailUrl: imageUrls.thumbnail,
        mediumUrl: imageUrls.medium,
        hasImage: true,
      },
    });
    
    // 2. Create/update ProductImage record (for relation approach)
    const existingImage = await prisma.productImage.findFirst({
      where: {
        product_id: productId,
        isPrimary: true,
      },
    });
    
    if (existingImage) {
      await prisma.productImage.update({
        where: { id: existingImage.id },
        data: {
          image_url: imageUrls.original,
          thumbnail_url: imageUrls.thumbnail,
          medium_url: imageUrls.medium,
        },
      });
    } else {
      await prisma.productImage.create({
        data: {
          product_id: productId,
          image_url: imageUrls.original,
          thumbnail_url: imageUrls.thumbnail,
          medium_url: imageUrls.medium,
          isPrimary: true,
          sort_order: 0,
        },
      });
    }
  } catch (error) {
    console.warn(`⚠️  Could not update database for product ${productId}:`, error.message);
    // Continue even if DB update fails - files are still created
  }
  
  return imageUrls;
}

/**
 * Process bundle image - creates thumbnail and original
 * @param {string} inputPath - Path to input image file
 * @param {string} bundleId - Bundle ID for naming
 * @returns {Promise<Object>} Object with thumbnail and original URLs
 */
export async function processBundleImage(inputPath, bundleId) {
  const outputDir = path.join(__dirname, '../public/uploads/bundles');
  
  // Ensure directories exist
  await fs.mkdir(`${outputDir}/thumbnails`, { recursive: true });
  await fs.mkdir(`${outputDir}/original`, { recursive: true });
  
  const baseName = `${bundleId}-${Date.now()}`;
  
  // Create thumbnail (200x200)
  const thumbnailPath = `${outputDir}/thumbnails/${baseName}.jpg`;
  await sharp(inputPath)
    .resize(200, 200, { fit: 'cover' })
    .jpeg({ quality: 80 })
    .toFile(thumbnailPath);
    
  // Keep original (max 1200px width)
  const originalPath = `${outputDir}/original/${baseName}.jpg`;
  await sharp(inputPath)
    .resize(1200, null, { withoutEnlargement: true })
    .jpeg({ quality: 90 })
    .toFile(originalPath);
    
  return {
    thumbnail: `/uploads/bundles/thumbnails/${baseName}.jpg`,
    original: `/uploads/bundles/original/${baseName}.jpg`
  };
}

/**
 * Validate image file
 * @param {string} filePath - Path to image file
 * @returns {Promise<boolean>} True if valid image
 */
export async function validateImage(filePath) {
  try {
    const metadata = await sharp(filePath).metadata();
    const validFormats = ['jpeg', 'jpg', 'png', 'webp'];
    return validFormats.includes(metadata.format);
  } catch (error) {
    return false;
  }
}

