/**
 * Image Enhancer Service
 * Optimizes, resizes, sharpens, and enhances product images
 */

import sharp from 'sharp';
import { readFileSync, writeFileSync, unlinkSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

class ImageEnhancer {
  constructor() {
    this.defaultSize = 1024;
    this.maxSize = 2048;
  }

  /**
   * Enhance image: resize, sharpen, optimize
   * @param {string} imagePath - Input image path
   * @param {Object} options - Enhancement options
   * @returns {Promise<string>} Path to enhanced image
   */
  async enhance(imagePath, options = {}) {
    const {
      size = this.defaultSize,
      sharpen = true,
      removeArtifacts = true,
      addPadding = true,
      centerObject = true,
      format = 'png',
      quality = 90,
    } = options;

    try {
      const imageBuffer = readFileSync(imagePath);
      let pipeline = sharp(imageBuffer);

      // Get image metadata
      const metadata = await pipeline.metadata();
      const { width, height } = metadata;

      // Resize (maintain aspect ratio)
      const targetSize = Math.min(size, this.maxSize);
      if (width > targetSize || height > targetSize) {
        pipeline = pipeline.resize(targetSize, targetSize, {
          fit: 'inside',
          withoutEnlargement: true,
        });
      }

      // Sharpen
      if (sharpen) {
        pipeline = pipeline.sharpen({
          sigma: 1.5,
          flat: 1,
          jagged: 2,
        });
    }

      // Remove artifacts (denoise)
      if (removeArtifacts) {
        pipeline = pipeline.median(3);
      }

      // Convert format
      if (format === 'png') {
        pipeline = pipeline.png({ quality, compressionLevel: 9 });
      } else if (format === 'jpeg' || format === 'jpg') {
        pipeline = pipeline.jpeg({ quality, mozjpeg: true });
      } else if (format === 'webp') {
        pipeline = pipeline.webp({ quality });
      }

      // Add padding and center if needed
      if (addPadding && centerObject) {
        const processedMetadata = await pipeline.metadata();
        const padding = Math.max(processedMetadata.width, processedMetadata.height) * 0.1;
        
        pipeline = pipeline.extend({
          top: padding,
          bottom: padding,
          left: padding,
          right: padding,
          background: { r: 0, g: 0, b: 0, alpha: 0 }, // Transparent
        });
      }

      // Generate output path
      const ext = format === 'jpeg' ? 'jpg' : format;
      const outputPath = imagePath.replace(/\.(jpg|jpeg|png|webp)$/i, `_enhanced.${ext}`);

      // Process and save
      const enhancedBuffer = await pipeline.toBuffer();
      writeFileSync(outputPath, enhancedBuffer);

      return outputPath;
    } catch (error) {
      throw new Error(`IMAGE_ENHANCEMENT_ERROR: ${error.message}`);
    }
  }

  /**
   * Upscale image using AI (if available)
   */
  async upscale(imagePath, scale = 2) {
    // Placeholder for AI upscaling service
    // Could integrate with Real-ESRGAN, Topaz, or similar
    throw new Error('AI upscaling not yet implemented');
  }

  /**
   * Optimize image for web
   */
  async optimizeForWeb(imagePath) {
    return this.enhance(imagePath, {
      size: 1024,
      sharpen: true,
      removeArtifacts: true,
      format: 'webp',
      quality: 85,
    });
  }

  /**
   * Create thumbnail
   */
  async createThumbnail(imagePath, size = 300) {
    try {
      const imageBuffer = readFileSync(imagePath);
      const thumbnailBuffer = await sharp(imageBuffer)
        .resize(size, size, {
          fit: 'cover',
          position: 'center',
        })
        .jpeg({ quality: 80 })
        .toBuffer();

      const thumbnailPath = imagePath.replace(/\.(jpg|jpeg|png|webp)$/i, '_thumb.jpg');
      writeFileSync(thumbnailPath, thumbnailBuffer);

      return thumbnailPath;
    } catch (error) {
      throw new Error(`THUMBNAIL_ERROR: ${error.message}`);
    }
  }
}

export default new ImageEnhancer();

