/**
 * Product Creator
 * Creates draft products when no match is found
 */

import { PrismaClient } from '@prisma/client';
import { OpenAI } from 'openai';

const prisma = new PrismaClient();

class ProductCreator {
  constructor() {
    this.openai = process.env.OPENAI_API_KEY
      ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
      : null;
  }

  /**
   * Create draft product
   * @param {Object} productData - Product data from PO
   * @param {string} imageUrl - Product image URL
   * @returns {Promise<Object>} Created product
   */
  async createDraft(productData, imageUrl = null) {
    const {
      product_name,
      sku,
      vendor_code,
      size,
      quantity,
      brand,
      category,
      price,
    } = productData;

    // Generate slug from name
    const slug = this.generateSlug(product_name || sku || 'unnamed-product');

    // Find or create brand
    let brandId = null;
    if (brand) {
      const existingBrand = await prisma.brand.findFirst({
        where: { name: { equals: brand, mode: 'insensitive' } },
      });

      if (existingBrand) {
        brandId = existingBrand.id;
      } else {
        const newBrand = await prisma.brand.create({
          data: { name: brand },
        });
        brandId = newBrand.id;
      }
    }

    // Find or create category
    let categoryId = null;
    if (category) {
      const categorySlug = this.generateSlug(category);
      const existingCategory = await prisma.category.findUnique({
        where: { slug: categorySlug },
      });

      if (existingCategory) {
        categoryId = existingCategory.id;
      } else {
        const newCategory = await prisma.category.create({
          data: {
            name: category,
            slug: categorySlug,
          },
        });
        categoryId = newCategory.id;
      }
    }

    // Generate AI description if available
    let description = null;
    let tags = [];
    if (this.openai && product_name) {
      try {
        const aiData = await this.generateAIData(product_name, brand, category);
        description = aiData.description;
        tags = aiData.tags || [];
      } catch (error) {
        console.warn('AI data generation failed:', error.message);
      }
    }

    // Create draft product
    const product = await prisma.product.create({
      data: {
        name: product_name || 'Unnamed Product',
        slug,
        sku: sku || `DRAFT-${Date.now()}`,
        description: description || `Product from purchase order: ${product_name || sku}`,
        priceCase: price || 0,
        vendor_price: price || 0,
        cost_case: price || 0,
        units_per_case: this.parseUnitsPerCase(size) || 1,
        unit_type: this.parseUnitType(size) || 'case',
        imageUrl,
        inStock: false, // Draft products are not in stock until reviewed
        categoryId,
        brandId,
        supplier: vendor_code || 'Unknown',
        // Mark as draft
        isHidden: true, // Hidden until admin reviews
        // Store tags in a JSON field if available, or in description
        // tags: tags, // If Product model has tags field
      },
      include: {
        brand: true,
        category: true,
      },
    });

    return product;
  }

  /**
   * Generate AI description and tags
   */
  async generateAIData(productName, brand, category) {
    if (!this.openai) return { description: null, tags: [] };

    try {
      const prompt = `Generate a short product description (max 150 words) and 3-5 relevant tags for this product:
Product: ${productName}
Brand: ${brand || 'Unknown'}
Category: ${category || 'Unknown'}

Return JSON: { "description": "...", "tags": ["tag1", "tag2", ...] }`;

      const response = await this.openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'You are a product description expert. Generate concise, appealing descriptions.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        max_tokens: 200,
        response_format: { type: 'json_object' },
      });

      const content = response.choices[0]?.message?.content;
      if (content) {
        return JSON.parse(content);
      }

      return { description: null, tags: [] };
    } catch (error) {
      console.warn('AI data generation failed:', error.message);
      return { description: null, tags: [] };
    }
  }

  /**
   * Generate URL-friendly slug
   */
  generateSlug(text) {
    if (!text) return `product-${Date.now()}`;

    return text
      .toString()
      .toLowerCase()
      .normalize('NFKD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .substring(0, 100);
  }

  /**
   * Parse units per case from size string
   */
  parseUnitsPerCase(size) {
    if (!size) return 1;

    // Look for pack/case indicators
    const packMatch = size.toString().match(/(\d+)\s*(pack|pcs|units|pieces)/i);
    if (packMatch) {
      return parseInt(packMatch[1], 10);
    }

    return 1;
  }

  /**
   * Parse unit type from size string
   */
  parseUnitType(size) {
    if (!size) return 'case';

    const sizeStr = size.toString().toLowerCase();

    if (sizeStr.includes('g') || sizeStr.includes('gram')) return 'gram';
    if (sizeStr.includes('ml') || sizeStr.includes('liter')) return 'ml';
    if (sizeStr.includes('pack') || sizeStr.includes('pcs')) return 'pack';
    if (sizeStr.includes('case')) return 'case';

    return 'case';
  }
}

export default new ProductCreator();

