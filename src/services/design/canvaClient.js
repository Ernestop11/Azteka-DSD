/**
 * Canva API Client
 * Handles all interactions with Canva Design API
 */

import fetch from 'node-fetch';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs/promises';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const CANVA_API_BASE = 'https://api.canva.com/rest/v1';
const CANVA_RENDER_BASE = 'https://api.canva.com/rest/v1/designs';

class CanvaClient {
  constructor() {
    this.apiKey = process.env.CANVA_API_KEY;
    this.brandKitId = process.env.CANVA_BRAND_KIT_ID;
    this.teamId = process.env.CANVA_TEAM_ID;
    this.projectFolderId = process.env.CANVA_PROJECT_FOLDER_ID;
    
    if (!this.apiKey) {
      console.warn('⚠️  CANVA_API_KEY not set. Design automation will be disabled.');
    }
  }

  /**
   * Get authorization header
   */
  getAuthHeader() {
    if (!this.apiKey) {
      throw new Error('CANVA_API_KEY not configured');
    }
    return {
      'Authorization': `Bearer ${this.apiKey}`,
      'Content-Type': 'application/json',
    };
  }

  /**
   * Render a design template with data
   * @param {string} templateId - Canva template ID
   * @param {Object} data - Template data (text, images, colors)
   * @param {Object} options - Render options (format, quality)
   * @returns {Promise<{jobId?: string, imageUrl?: string, status: string}>}
   */
  async renderTemplate(templateId, data, options = {}) {
    if (!this.apiKey) {
      throw new Error('CANVA_API_KEY not configured');
    }

    const {
      format = 'PNG',
      quality = 'HIGH',
      width = null,
      height = null,
    } = options;

    try {
      const payload = {
        designId: templateId,
        brandKitId: this.brandKitId || undefined,
        exports: [
          {
            format: format.toUpperCase(),
            quality: quality.toUpperCase(),
            ...(width && height ? { width, height } : {}),
          },
        ],
        data: this.prepareTemplateData(data),
      };

      const response = await fetch(`${CANVA_RENDER_BASE}/${templateId}/render`, {
        method: 'POST',
        headers: this.getAuthHeader(),
        body: JSON.stringify(payload),
        timeout: 30000, // 30 second timeout
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        
        if (response.status === 429) {
          throw new Error('API_RATE_LIMIT: Canva API rate limit exceeded');
        }
        
        if (response.status === 404) {
          throw new Error(`INVALID_TEMPLATE: Template ${templateId} not found`);
        }
        
        if (response.status === 400) {
          throw new Error(`MISSING_FIELDS: ${errorData.message || 'Invalid template data'}`);
        }

        throw new Error(`Canva API error: ${response.status} ${response.statusText}`);
      }

      const result = await response.json();

      // Check if async job
      if (result.jobId) {
        return {
          jobId: result.jobId,
          status: 'pending',
          message: 'Render job queued',
        };
      }

      // Check if direct URL
      if (result.exports && result.exports[0]?.url) {
        return {
          imageUrl: result.exports[0].url,
          status: 'completed',
        };
      }

      throw new Error('Unexpected response format from Canva API');
    } catch (error) {
      if (error.message.includes('timeout') || error.message.includes('TIMEOUT')) {
        throw new Error('TIMEOUT: Canva API request timed out');
      }
      throw error;
    }
  }

  /**
   * Check status of async render job
   * @param {string} jobId - Render job ID
   * @returns {Promise<{status: string, imageUrl?: string, error?: string}>}
   */
  async checkRenderStatus(jobId) {
    if (!this.apiKey) {
      throw new Error('CANVA_API_KEY not configured');
    }

    try {
      const response = await fetch(`${CANVA_RENDER_BASE}/jobs/${jobId}`, {
        method: 'GET',
        headers: this.getAuthHeader(),
        timeout: 10000,
      });

      if (!response.ok) {
        throw new Error(`Failed to check job status: ${response.status}`);
      }

      const result = await response.json();

      if (result.status === 'completed' && result.exports?.[0]?.url) {
        return {
          status: 'completed',
          imageUrl: result.exports[0].url,
        };
      }

      if (result.status === 'failed') {
        return {
          status: 'failed',
          error: result.error || 'Render job failed',
        };
      }

      return {
        status: result.status || 'pending',
      };
    } catch (error) {
      if (error.message.includes('timeout')) {
        throw new Error('TIMEOUT: Status check timed out');
      }
      throw error;
    }
  }

  /**
   * Prepare template data for Canva API
   * Converts our data format to Canva's expected format
   */
  prepareTemplateData(data) {
    const canvaData = {};

    // Map text fields
    if (data.title) canvaData.title = { text: String(data.title) };
    if (data.subtitle) canvaData.subtitle = { text: String(data.subtitle) };
    if (data.headline) canvaData.headline = { text: String(data.headline) };
    if (data.description) canvaData.description = { text: String(data.description) };
    if (data.ctaText) canvaData.ctaText = { text: String(data.ctaText) };

    // Map image fields
    if (data.imageUrl) canvaData.image = { url: String(data.imageUrl) };
    if (data.backgroundImage) canvaData.backgroundImage = { url: String(data.backgroundImage) };
    if (data.productImage) canvaData.productImage = { url: String(data.productImage) };

    // Map color fields
    if (data.backgroundColor) canvaData.backgroundColor = { color: String(data.backgroundColor) };
    if (data.textColor) canvaData.textColor = { color: String(data.textColor) };
    if (data.accentColor) canvaData.accentColor = { color: String(data.accentColor) };

    // Map brand fields
    if (data.brandName) canvaData.brandName = { text: String(data.brandName) };
    if (data.brandLogo) canvaData.brandLogo = { url: String(data.brandLogo) };

    // Map price fields
    if (data.price) canvaData.price = { text: String(data.price) };
    if (data.originalPrice) canvaData.originalPrice = { text: String(data.originalPrice) };
    if (data.discount) canvaData.discount = { text: String(data.discount) };

    return canvaData;
  }

  /**
   * Download image from URL
   * @param {string} imageUrl - URL to download
   * @param {string} outputPath - Local path to save
   * @returns {Promise<string>} Path to downloaded file
   */
  async downloadImage(imageUrl, outputPath) {
    try {
      const response = await fetch(imageUrl, {
        timeout: 30000,
      });

      if (!response.ok) {
        throw new Error(`Failed to download image: ${response.status}`);
      }

      const arrayBuffer = await response.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      await fs.writeFile(outputPath, buffer);

      return outputPath;
    } catch (error) {
      if (error.message.includes('timeout')) {
        throw new Error('TIMEOUT: Image download timed out');
      }
      throw new Error(`STORAGE_FAILURE: Failed to download image: ${error.message}`);
    }
  }
}

export default new CanvaClient();

