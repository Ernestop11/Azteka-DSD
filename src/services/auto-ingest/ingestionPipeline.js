/**
 * Ingestion Pipeline
 * Orchestrates the full auto-ingestion process
 */

import poParser from './poParser.js';
import imageSearch from './imageSearch.js';
import bgRemover from './bgRemover.js';
import enhancer from './enhancer.js';
import matcher from './matcher.js';
import productCreator from './productCreator.js';
import updater from './updater.js';
import imageUploader from '../design/imageUploader.js';
import { unlinkSync } from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';

class IngestionPipeline {
  constructor() {
    this.tempDir = join(tmpdir(), 'azteka-ingest');
  }

  /**
   * Process single product through full pipeline
   */
  async processProduct(productData) {
    const result = {
      product: productData,
      imageUrl: null,
      thumbnailUrl: null,
      match: null,
      created: false,
      updated: false,
      errors: [],
    };

    try {
      // Step 1: Search for product image
      const imageUrl = await imageSearch.search({
        productName: productData.product_name,
        sku: productData.sku,
        brand: productData.brand,
        size: productData.size,
        category: productData.category,
      });

      if (!imageUrl) {
        result.errors.push('No image found');
        return result;
      }

      result.imageUrl = imageUrl;

      // Step 2: Download image
      const tempImagePath = await this.downloadImage(imageUrl);

      try {
        // Step 3: Remove background
        const noBgPath = await bgRemover.removeBackground(tempImagePath);

        // Step 4: Enhance image
        const enhancedPath = await enhancer.enhance(noBgPath, {
          size: 1024,
          format: 'png',
        });

        // Step 5: Create thumbnail
        const thumbnailPath = await enhancer.createThumbnail(enhancedPath, 300);

        // Step 6: Upload images
        const uploadedImageUrl = await imageUploader.upload(enhancedPath, 'products');
        const uploadedThumbnailUrl = await imageUploader.upload(thumbnailPath, 'products');

        result.imageUrl = uploadedImageUrl;
        result.thumbnailUrl = uploadedThumbnailUrl;

        // Step 7: Match product
        const matchResult = await matcher.match(productData);

        if (matchResult.match) {
          // Update existing product
          await updater.update(matchResult.match.id, {
            imageUrl: uploadedImageUrl,
            thumbnail: uploadedThumbnailUrl,
            name: productData.product_name || matchResult.match.name,
            price: productData.price,
            vendor_price: productData.price,
          });

          result.match = matchResult.match;
          result.updated = true;
        } else {
          // Create draft product
          const created = await productCreator.createDraft(
            productData,
            uploadedImageUrl
          );

          result.match = created;
          result.created = true;
        }

        // Cleanup temp files
        this.cleanup([tempImagePath, noBgPath, enhancedPath, thumbnailPath]);
      } catch (error) {
        result.errors.push(`Image processing error: ${error.message}`);
        this.cleanup([tempImagePath]);
      }
    } catch (error) {
      result.errors.push(`Pipeline error: ${error.message}`);
    }

    return result;
  }

  /**
   * Process batch of products
   */
  async processBatch(products) {
    const results = {
      updated: 0,
      created: 0,
      failed: 0,
      items: [],
    };

    for (const product of products) {
      try {
        const result = await this.processProduct(product);
        results.items.push(result);

        if (result.updated) results.updated++;
        else if (result.created) results.created++;
        else if (result.errors.length > 0) results.failed++;
      } catch (error) {
        results.failed++;
        results.items.push({
          product,
          errors: [error.message],
        });
      }

      // Rate limiting
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }

    return results;
  }

  /**
   * Download image to temp file
   */
  async downloadImage(imageUrl) {
    const fetch = (await import('node-fetch')).default;
    const response = await fetch(imageUrl, { timeout: 30000 });

    if (!response.ok) {
      throw new Error(`Failed to download image: ${response.status}`);
    }

    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const ext = imageUrl.match(/\.(jpg|jpeg|png|webp)$/i)?.[1] || 'jpg';
    const tempPath = join(this.tempDir, `img-${Date.now()}.${ext}`);

    const fs = await import('fs/promises');
    await fs.mkdir(this.tempDir, { recursive: true });
    await fs.writeFile(tempPath, buffer);

    return tempPath;
  }

  /**
   * Cleanup temp files
   */
  cleanup(filePaths) {
    for (const path of filePaths) {
      try {
        unlinkSync(path);
      } catch (error) {
        // Ignore cleanup errors
      }
    }
  }
}

export default new IngestionPipeline();

