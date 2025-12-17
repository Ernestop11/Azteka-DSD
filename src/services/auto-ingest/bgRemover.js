/**
 * Background Remover Service
 * Removes backgrounds from product images using multiple services
 */

import fetch from 'node-fetch';
import { readFileSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

class BGRemover {
  constructor() {
    this.removeBgApiKey = process.env.REMOVE_BG_API_KEY;
    this.clipdropApiKey = process.env.CLIPDROP_API_KEY;
    this.canvaApiKey = process.env.CANVA_API_KEY;
  }

  /**
   * Remove background from image
   * @param {string} imagePath - Local path to image file
   * @param {string} outputPath - Output path for processed image
   * @returns {Promise<string>} Path to processed image
   */
  async removeBackground(imagePath, outputPath = null) {
    // Try services in order of preference
    const services = [
      () => this.removeWithRemoveBg(imagePath, outputPath),
      () => this.removeWithClipDrop(imagePath, outputPath),
      () => this.removeWithCanva(imagePath, outputPath),
    ];

    for (const service of services) {
      try {
        const result = await service();
        if (result) return result;
      } catch (error) {
        console.warn('Background removal service failed:', error.message);
        continue;
      }
    }

    throw new Error('All background removal services failed');
  }

  /**
   * Remove background using Remove.bg API
   */
  async removeWithRemoveBg(imagePath, outputPath) {
    if (!this.removeBgApiKey) {
      throw new Error('REMOVE_BG_API_KEY not configured');
    }

    try {
      const imageBuffer = readFileSync(imagePath);
      const FormData = (await import('form-data')).default;
      const formData = new FormData();
      formData.append('image_file', imageBuffer, { filename: 'image.jpg', contentType: 'image/jpeg' });
      formData.append('size', 'regular');

      const response = await fetch('https://api.remove.bg/v1.0/removebg', {
        method: 'POST',
        headers: {
          'X-Api-Key': this.removeBgApiKey,
          ...formData.getHeaders(),
        },
        body: formData,
        timeout: 30000,
      });

      if (!response.ok) {
        throw new Error(`Remove.bg API error: ${response.status}`);
      }

      const resultBuffer = await response.arrayBuffer();
      const finalPath = outputPath || imagePath.replace(/\.(jpg|jpeg|png)$/i, '_nobg.png');
      writeFileSync(finalPath, Buffer.from(resultBuffer));

      return finalPath;
    } catch (error) {
      throw new Error(`REMOVE_BG_ERROR: ${error.message}`);
    }
  }

  /**
   * Remove background using ClipDrop API
   */
  async removeWithClipDrop(imagePath, outputPath) {
    if (!this.clipdropApiKey) {
      throw new Error('CLIPDROP_API_KEY not configured');
    }

    try {
      const imageBuffer = readFileSync(imagePath);
      const FormData = (await import('form-data')).default;
      const formData = new FormData();
      formData.append('image_file', imageBuffer, { filename: 'image.jpg', contentType: 'image/jpeg' });

      const response = await fetch('https://clipdrop-api.co/remove-background/v1', {
        method: 'POST',
        headers: {
          'x-api-key': this.clipdropApiKey,
          ...formData.getHeaders(),
        },
        body: formData,
        timeout: 30000,
      });

      if (!response.ok) {
        throw new Error(`ClipDrop API error: ${response.status}`);
      }

      const resultBuffer = await response.arrayBuffer();
      const finalPath = outputPath || imagePath.replace(/\.(jpg|jpeg|png)$/i, '_nobg.png');
      writeFileSync(finalPath, Buffer.from(resultBuffer));

      return finalPath;
    } catch (error) {
      throw new Error(`CLIPDROP_ERROR: ${error.message}`);
    }
  }

  /**
   * Remove background using Canva API (if available)
   */
  async removeWithCanva(imagePath, outputPath) {
    if (!this.canvaApiKey) {
      throw new Error('CANVA_API_KEY not configured');
    }

    // Canva API background removal would go here
    // This is a placeholder as Canva's API may not have direct background removal
    throw new Error('Canva background removal not yet implemented');
  }
}

export default new BGRemover();

