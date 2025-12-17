/**
 * Image Uploader
 * Handles uploading generated images to storage
 */

import { writeFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import { join, dirname, basename, extname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

class ImageUploader {
  constructor() {
    // Get upload directory from env or use default
    this.uploadDir = process.env.UPLOAD_DIR || join(process.cwd(), 'uploads');
    this.baseUrl = process.env.UPLOAD_BASE_URL || process.env.CANVA_UPLOAD_BASE_URL || '/uploads';
  }

  /**
   * Upload image file to storage
   * @param {string} filePath - Local file path
   * @param {string} category - Category folder (products, heroes, bundles, etc.)
   * @returns {Promise<string>} Public URL of uploaded image
   */
  async upload(filePath, category = 'designs') {
    try {
      // Ensure category directory exists
      const categoryDir = join(this.uploadDir, category);
      if (!existsSync(categoryDir)) {
        await mkdir(categoryDir, { recursive: true });
      }

      // Generate unique filename
      const timestamp = Date.now();
      const randomStr = Math.random().toString(36).substring(2, 15);
      const extension = extname(filePath) || '.png';
      const filename = `${timestamp}-${randomStr}${extension}`;
      const destPath = join(categoryDir, filename);

      // Read source file
      const fs = await import('fs/promises');
      const fileBuffer = await fs.readFile(filePath);

      // Write to destination
      await writeFile(destPath, fileBuffer);

      // Return public URL
      const publicUrl = `${this.baseUrl}/${category}/${filename}`;
      
      return publicUrl;
    } catch (error) {
      throw new Error(`STORAGE_FAILURE: Failed to upload image: ${error.message}`);
    }
  }

  /**
   * Upload from URL (downloads first, then uploads)
   * @param {string} imageUrl - URL to download
   * @param {string} category - Category folder
   * @returns {Promise<string>} Public URL of uploaded image
   */
  async uploadFromUrl(imageUrl, category = 'designs') {
    try {
      const fetch = (await import('node-fetch')).default;
      const response = await fetch(imageUrl, { timeout: 30000 });

      if (!response.ok) {
        throw new Error(`Failed to download image: ${response.status}`);
      }

      const arrayBuffer = await response.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      
      // Generate filename
      const timestamp = Date.now();
      const randomStr = Math.random().toString(36).substring(2, 15);
      const extension = extname(new URL(imageUrl).pathname) || '.png';
      const filename = `${timestamp}-${randomStr}${extension}`;
      
      // Ensure category directory exists
      const categoryDir = join(this.uploadDir, category);
      if (!existsSync(categoryDir)) {
        await mkdir(categoryDir, { recursive: true });
      }

      const destPath = join(categoryDir, filename);
      await writeFile(destPath, buffer);

      const publicUrl = `${this.baseUrl}/${category}/${filename}`;
      return publicUrl;
    } catch (error) {
      if (error.message.includes('timeout')) {
        throw new Error('TIMEOUT: Image download timed out');
      }
      throw new Error(`STORAGE_FAILURE: Failed to upload from URL: ${error.message}`);
    }
  }

  /**
   * Delete uploaded image
   * @param {string} imageUrl - Public URL of image to delete
   * @returns {Promise<boolean>} Success status
   */
  async delete(imageUrl) {
    try {
      // Extract path from URL
      const urlPath = new URL(imageUrl, 'http://localhost').pathname;
      const filePath = join(this.uploadDir, urlPath.replace(/^\/uploads\//, ''));

      if (existsSync(filePath)) {
        const fs = await import('fs/promises');
        await fs.unlink(filePath);
        return true;
      }

      return false;
    } catch (error) {
      console.error('Failed to delete image:', error);
      return false;
    }
  }
}

export default new ImageUploader();

