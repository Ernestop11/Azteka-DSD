/**
 * Template Renderer
 * Helper functions for rendering different design types
 */

import canvaClient from './canvaClient.js';
import imageUploader from './imageUploader.js';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const templatesPath = join(__dirname, 'templates.json');
const templates = JSON.parse(readFileSync(templatesPath, 'utf8'));

class TemplateRenderer {
  /**
   * Render hero banner
   * @param {Object} data - Hero data
   * @returns {Promise<{imageUrl: string}>}
   */
  async renderHero(data) {
    const {
      title,
      subtitle,
      headline,
      subheadline,
      ctaText,
      ctaLink,
      backgroundImage,
      backgroundColor,
      backgroundGradient,
      imageUrl,
    } = data;

    const templateId = templates.hero_default || templates.hero_banner;
    if (!templateId) {
      throw new Error('INVALID_TEMPLATE: Hero template not configured');
    }

    const renderData = {
      title: title || headline,
      subtitle: subtitle || subheadline,
      ctaText,
      backgroundImage: backgroundImage || imageUrl,
      backgroundColor,
      backgroundGradient,
    };

    const result = await canvaClient.renderTemplate(templateId, renderData, {
      format: 'PNG',
      quality: 'HIGH',
      width: 1920,
      height: 1080,
    });

    // Handle async job
    if (result.jobId) {
      return { jobId: result.jobId, status: 'pending' };
    }

    // Download and upload image
    const localPath = await canvaClient.downloadImage(result.imageUrl, `/tmp/hero-${Date.now()}.png`);
    const uploadedUrl = await imageUploader.upload(localPath, 'heroes');

    return { imageUrl: uploadedUrl };
  }

  /**
   * Render product card
   * @param {Object} data - Product data
   * @returns {Promise<{imageUrl: string}>}
   */
  async renderProductCard(data) {
    const {
      name,
      description,
      price,
      originalPrice,
      discount,
      imageUrl,
      backgroundColor,
      textColor,
      brandName,
      brandLogo,
      categoryName,
    } = data;

    const templateId = templates.product_card_modern || templates.product_card_default;
    if (!templateId) {
      throw new Error('INVALID_TEMPLATE: Product card template not configured');
    }

    const renderData = {
      title: name,
      description,
      price: price ? `$${price}` : null,
      originalPrice: originalPrice ? `$${originalPrice}` : null,
      discount: discount ? `${discount}% OFF` : null,
      productImage: imageUrl,
      backgroundColor,
      textColor,
      brandName,
      brandLogo,
      categoryName,
    };

    const result = await canvaClient.renderTemplate(templateId, renderData, {
      format: 'PNG',
      quality: 'HIGH',
      width: 800,
      height: 1000,
    });

    if (result.jobId) {
      return { jobId: result.jobId, status: 'pending' };
    }

    const localPath = await canvaClient.downloadImage(result.imageUrl, `/tmp/product-${Date.now()}.png`);
    const uploadedUrl = await imageUploader.upload(localPath, 'products');

    return { imageUrl: uploadedUrl };
  }

  /**
   * Render bundle graphic
   * @param {Object} data - Bundle data
   * @returns {Promise<{imageUrl: string}>}
   */
  async renderBundle(data) {
    const {
      name,
      description,
      price,
      discount,
      products = [],
      backgroundColor,
      badgeText,
      badgeColor,
    } = data;

    const templateId = templates.bundle_promo_1 || templates.bundle_default;
    if (!templateId) {
      throw new Error('INVALID_TEMPLATE: Bundle template not configured');
    }

    const renderData = {
      title: name,
      description,
      price: price ? `$${price}` : null,
      discount: discount ? `${discount}% OFF` : null,
      backgroundColor,
      badgeText,
      badgeColor,
      // Use first product image as main image
      productImage: products[0]?.imageUrl || null,
    };

    const result = await canvaClient.renderTemplate(templateId, renderData, {
      format: 'PNG',
      quality: 'HIGH',
      width: 1200,
      height: 800,
    });

    if (result.jobId) {
      return { jobId: result.jobId, status: 'pending' };
    }

    const localPath = await canvaClient.downloadImage(result.imageUrl, `/tmp/bundle-${Date.now()}.png`);
    const uploadedUrl = await imageUploader.upload(localPath, 'bundles');

    return { imageUrl: uploadedUrl };
  }

  /**
   * Render brand row
   * @param {Object} data - Brand data
   * @returns {Promise<{imageUrl: string}>}
   */
  async renderBrandRow(data) {
    const {
      brandName,
      brandLogo,
      description,
      backgroundColor,
      textColor,
      productCount,
    } = data;

    const templateId = templates.brand_row_neon || templates.brand_row_default;
    if (!templateId) {
      throw new Error('INVALID_TEMPLATE: Brand row template not configured');
    }

    const renderData = {
      brandName,
      brandLogo,
      description,
      backgroundColor,
      textColor,
      subtitle: productCount ? `${productCount} products` : null,
    };

    const result = await canvaClient.renderTemplate(templateId, renderData, {
      format: 'PNG',
      quality: 'HIGH',
      width: 1600,
      height: 400,
    });

    if (result.jobId) {
      return { jobId: result.jobId, status: 'pending' };
    }

    const localPath = await canvaClient.downloadImage(result.imageUrl, `/tmp/brand-${Date.now()}.png`);
    const uploadedUrl = await imageUploader.upload(localPath, 'brands');

    return { imageUrl: uploadedUrl };
  }

  /**
   * Render promotional banner
   * @param {Object} data - Promo data
   * @returns {Promise<{imageUrl: string}>}
   */
  async renderPromo(data) {
    const {
      title,
      description,
      ctaText,
      ctaLink,
      discount,
      backgroundColor,
      backgroundImage,
      textColor,
      validUntil,
    } = data;

    const templateId = templates.promo_banner || templates.promo_default;
    if (!templateId) {
      throw new Error('INVALID_TEMPLATE: Promo template not configured');
    }

    const renderData = {
      title,
      description,
      ctaText,
      discount: discount ? `${discount}% OFF` : null,
      backgroundColor,
      backgroundImage,
      textColor,
      subtitle: validUntil ? `Valid until ${new Date(validUntil).toLocaleDateString()}` : null,
    };

    const result = await canvaClient.renderTemplate(templateId, renderData, {
      format: 'PNG',
      quality: 'HIGH',
      width: 1920,
      height: 600,
    });

    if (result.jobId) {
      return { jobId: result.jobId, status: 'pending' };
    }

    const localPath = await canvaClient.downloadImage(result.imageUrl, `/tmp/promo-${Date.now()}.png`);
    const uploadedUrl = await imageUploader.upload(localPath, 'promos');

    return { imageUrl: uploadedUrl };
  }
}

export default new TemplateRenderer();

