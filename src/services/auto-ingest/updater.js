/**
 * Product Updater
 * Updates existing product records with new data and images
 */

import { PrismaClient } from '@prisma/client';
import { OpenAI } from 'openai';

const prisma = new PrismaClient();

class ProductUpdater {
  constructor() {
    this.openai = process.env.OPENAI_API_KEY
      ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
      : null;
  }

  /**
   * Update product with new data and image
   * @param {string} productId - Product ID
   * @param {Object} updates - Update data
   * @returns {Promise<Object>} Updated product
   */
  async update(productId, updates) {
    const {
      imageUrl,
      thumbnail,
      name,
      description,
      tags,
      brandId,
      categoryId,
      price,
      vendor_price,
    } = updates;

    const updateData = {};

    // Update image
    if (imageUrl) {
      updateData.imageUrl = imageUrl;
    }

    if (thumbnail) {
      updateData.thumbnail = thumbnail;
    }

    // Update name (AI enhanced if available)
    if (name) {
      updateData.name = name;
    }

    // Update description (AI generated if available)
    if (description) {
      updateData.description = description;
    } else if (name && this.openai) {
      // Generate description if not provided
      try {
        const aiDescription = await this.generateDescription(name);
        if (aiDescription) {
          updateData.description = aiDescription;
        }
      } catch (error) {
        console.warn('Failed to generate description:', error.message);
      }
    }

    // Update tags (if Product model supports tags)
    // if (tags && Array.isArray(tags)) {
    //   updateData.tags = tags;
    // }

    // Update brand
    if (brandId) {
      updateData.brandId = brandId;
    }

    // Update category
    if (categoryId) {
      updateData.categoryId = categoryId;
    }

    // Update prices
    if (price !== undefined) {
      updateData.priceCase = price;
    }

    if (vendor_price !== undefined) {
      updateData.vendor_price = vendor_price;
    }

    // Update product
    const updated = await prisma.product.update({
      where: { id: productId },
      data: updateData,
      include: {
        brand: true,
        category: true,
        images: true,
      },
    });

    return updated;
  }

  /**
   * Generate AI description for product
   */
  async generateDescription(productName) {
    if (!this.openai || !productName) return null;

    try {
      const response = await this.openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'Generate a concise product description (max 100 words).',
          },
          {
            role: 'user',
            content: `Write a short product description for: ${productName}`,
          },
        ],
        max_tokens: 150,
      });

      return response.choices[0]?.message?.content?.trim() || null;
    } catch (error) {
      console.warn('Description generation failed:', error.message);
      return null;
    }
  }

  /**
   * Update product image and create thumbnail
   */
  async updateImage(productId, imageUrl, thumbnailUrl = null) {
    const updateData = { imageUrl };

    if (thumbnailUrl) {
      updateData.thumbnail = thumbnailUrl;
    }

    return await prisma.product.update({
      where: { id: productId },
      data: updateData,
    });
  }

  /**
   * Batch update products
   */
  async updateBatch(updates) {
    const results = [];

    for (const update of updates) {
      try {
        const { productId, ...updateData } = update;
        const updated = await this.update(productId, updateData);
        results.push({
          productId,
          success: true,
          product: updated,
        });
      } catch (error) {
        results.push({
          productId: update.productId,
          success: false,
          error: error.message,
        });
      }
    }

    return results;
  }
}

export default new ProductUpdater();

