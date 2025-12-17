/**
 * Product Matcher
 * Matches extracted products to existing products using similarity algorithms
 */

import { PrismaClient } from '@prisma/client';
import { OpenAI } from 'openai';
import stringSimilarity from 'string-similarity';

const prisma = new PrismaClient();

class ProductMatcher {
  constructor() {
    this.openai = process.env.OPENAI_API_KEY
      ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
      : null;
    
    this.similarityThreshold = 0.7; // 70% similarity threshold
  }

  /**
   * Match product to existing products
   * @param {Object} product - Product data from PO
   * @returns {Promise<{match: Object|null, confidence: number, method: string}>}
   */
  async match(product) {
    const { product_name, sku, vendor_code, brand, size } = product;

    // Try multiple matching strategies
    const strategies = [
      () => this.matchBySKU(sku),
      () => this.matchByVendorCode(vendor_code),
      () => this.matchByNameAndBrand(product_name, brand),
      () => this.matchByEmbedding(product_name, brand),
      () => this.matchByNameSimilarity(product_name, brand, size),
    ];

    for (const strategy of strategies) {
      try {
        const result = await strategy();
        if (result && result.confidence >= this.similarityThreshold) {
          return result;
        }
      } catch (error) {
        console.warn('Matching strategy failed:', error.message);
        continue;
      }
    }

    return { match: null, confidence: 0, method: 'none' };
  }

  /**
   * Match by exact SKU
   */
  async matchBySKU(sku) {
    if (!sku) return null;

    const product = await prisma.product.findFirst({
      where: { sku: { equals: sku, mode: 'insensitive' } },
      include: { brand: true, category: true },
    });

    if (product) {
      return {
        match: product,
        confidence: 1.0,
        method: 'sku_exact',
      };
    }

    return null;
  }

  /**
   * Match by vendor code
   */
  async matchByVendorCode(vendorCode) {
    if (!vendorCode) return null;

    // Assuming vendor_code might be stored in a field or metadata
    const product = await prisma.product.findFirst({
      where: {
        OR: [
          { sku: { contains: vendorCode, mode: 'insensitive' } },
          { name: { contains: vendorCode, mode: 'insensitive' } },
        ],
      },
      include: { brand: true, category: true },
    });

    if (product) {
      return {
        match: product,
        confidence: 0.85,
        method: 'vendor_code',
      };
    }

    return null;
  }

  /**
   * Match by name and brand
   */
  async matchByNameAndBrand(name, brand) {
    if (!name) return null;

    const where = {
      name: { contains: name.substring(0, 50), mode: 'insensitive' },
    };

    if (brand) {
      where.brand = {
        name: { contains: brand, mode: 'insensitive' },
      };
    }

    const product = await prisma.product.findFirst({
      where,
      include: { brand: true, category: true },
    });

    if (product) {
      const nameSimilarity = stringSimilarity.compareTwoStrings(
        name.toLowerCase(),
        product.name.toLowerCase()
      );

      return {
        match: product,
        confidence: nameSimilarity * (brand ? 0.95 : 0.8),
        method: 'name_brand',
      };
    }

    return null;
  }

  /**
   * Match using embedding similarity (if OpenAI available)
   */
  async matchByEmbedding(name, brand) {
    if (!this.openai || !name) return null;

    try {
      // Generate embedding for search query
      const queryEmbedding = await this.generateEmbedding(`${brand || ''} ${name}`);

      // Get all products with embeddings (if stored)
      // For now, use name similarity as fallback
      return await this.matchByNameSimilarity(name, brand);
    } catch (error) {
      console.warn('Embedding matching failed:', error.message);
      return null;
    }
  }

  /**
   * Match by name similarity using string similarity
   */
  async matchByNameSimilarity(name, brand, size) {
    if (!name) return null;

    // Normalize size for matching
    const normalizedSize = this.normalizeSize(size);

    // Search for similar products
    const products = await prisma.product.findMany({
      where: {
        OR: [
          { name: { contains: name.substring(0, 30), mode: 'insensitive' } },
          { sku: { contains: name.substring(0, 20), mode: 'insensitive' } },
        ],
      },
      include: { brand: true, category: true },
      take: 20,
    });

    if (products.length === 0) return null;

    // Calculate similarity scores
    const scored = products.map((product) => {
      const nameScore = stringSimilarity.compareTwoStrings(
        name.toLowerCase(),
        product.name.toLowerCase()
      );

      let brandScore = 0.5;
      if (brand && product.brand) {
        brandScore = stringSimilarity.compareTwoStrings(
          brand.toLowerCase(),
          product.brand.name.toLowerCase()
        );
      }

      let sizeScore = 0.5;
      if (normalizedSize && product.units_per_case) {
        // Simple size matching
        sizeScore = normalizedSize === product.units_per_case ? 1.0 : 0.5;
      }

      // Weighted confidence
      const confidence = (nameScore * 0.6) + (brandScore * 0.3) + (sizeScore * 0.1);

      return { product, confidence };
    });

    // Sort by confidence
    scored.sort((a, b) => b.confidence - a.confidence);

    const bestMatch = scored[0];
    if (bestMatch.confidence >= this.similarityThreshold) {
      return {
        match: bestMatch.product,
        confidence: bestMatch.confidence,
        method: 'name_similarity',
      };
    }

    return null;
  }

  /**
   * Normalize size string to number
   */
  normalizeSize(size) {
    if (!size) return null;

    // Extract number from size string (e.g., "50g" -> 50, "500ml" -> 500)
    const match = size.toString().match(/(\d+)/);
    return match ? parseInt(match[1], 10) : null;
  }

  /**
   * Generate embedding using OpenAI
   */
  async generateEmbedding(text) {
    if (!this.openai) return null;

    try {
      const response = await this.openai.embeddings.create({
        model: 'text-embedding-3-small',
        input: text,
      });

      return response.data[0].embedding;
    } catch (error) {
      throw new Error(`EMBEDDING_ERROR: ${error.message}`);
    }
  }

  /**
   * Match multiple products in batch
   */
  async matchBatch(products) {
    const results = [];

    for (const product of products) {
      try {
        const matchResult = await this.match(product);
        results.push({
          product,
          ...matchResult,
        });
      } catch (error) {
        results.push({
          product,
          match: null,
          confidence: 0,
          method: 'error',
          error: error.message,
        });
      }
    }

    return results;
  }
}

export default new ProductMatcher();

