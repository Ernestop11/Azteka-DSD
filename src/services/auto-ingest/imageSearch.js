/**
 * Image Search Service
 * Searches for product images using Bing Image Search API and SerpAPI fallback
 */

import fetch from 'node-fetch';

class ImageSearch {
  constructor() {
    this.bingApiKey = process.env.BING_SEARCH_API_KEY;
    this.serpApiKey = process.env.SERP_API_KEY;
    
    this.domainPriorities = [
      'sabritas.com',
      'gamesa.com.mx',
      'ricolino.com.mx',
      'barcel.com.mx',
      'marinela.com.mx',
      'pepsico.com',
      'grupo-bimbo.com',
    ];
  }

  /**
   * Search for product image
   * @param {Object} params - Search parameters
   * @returns {Promise<string|null>} Image URL or null
   */
  async search(params) {
    const { productName, sku, brand, size, category } = params;

    // Build search query
    const query = this.buildQuery(productName, sku, brand, size, category);

    // Try Bing first
    try {
      const imageUrl = await this.searchBing(query);
      if (imageUrl) return imageUrl;
    } catch (error) {
      console.warn('Bing search failed:', error.message);
    }

    // Fallback to SerpAPI
    try {
      const imageUrl = await this.searchSerpAPI(query);
      if (imageUrl) return imageUrl;
    } catch (error) {
      console.warn('SerpAPI search failed:', error.message);
    }

    // Fallback to domain-prioritized search
    try {
      const imageUrl = await this.searchWithDomainPriority(query);
      if (imageUrl) return imageUrl;
    } catch (error) {
      console.warn('Domain-prioritized search failed:', error.message);
    }

    return null;
  }

  /**
   * Build search query from product data
   */
  buildQuery(productName, sku, brand, size, category) {
    const parts = [];

    if (brand) parts.push(brand);
    if (productName) parts.push(productName);
    if (size) parts.push(size);
    if (category) parts.push(category);
    if (sku) parts.push(sku);

    // Add Mexican wholesale context
    if (parts.length > 0) {
      return `${parts.join(' ')} mexico wholesale product image`;
    }

    return 'mexican snacks wholesale product image';
  }

  /**
   * Search using Bing Image Search API
   */
  async searchBing(query) {
    if (!this.bingApiKey) {
      throw new Error('BING_SEARCH_API_KEY not configured');
    }

    try {
      const url = `https://api.bing.microsoft.com/v7.0/images/search?q=${encodeURIComponent(query)}&count=5&safeSearch=Strict&imageType=Photo&size=Large`;
      
      const response = await fetch(url, {
        headers: {
          'Ocp-Apim-Subscription-Key': this.bingApiKey,
        },
        timeout: 10000,
      });

      if (!response.ok) {
        throw new Error(`Bing API error: ${response.status}`);
      }

      const data = await response.json();
      const images = data.value || [];

      // Prefer images from priority domains
      for (const domain of this.domainPriorities) {
        const domainImage = images.find((img) => 
          img.hostPageUrl && img.hostPageUrl.includes(domain)
        );
        if (domainImage && domainImage.contentUrl) {
          return domainImage.contentUrl;
        }
      }

      // Return first valid image
      if (images.length > 0 && images[0].contentUrl) {
        return images[0].contentUrl;
      }

      return null;
    } catch (error) {
      throw new Error(`BING_SEARCH_ERROR: ${error.message}`);
    }
  }

  /**
   * Search using SerpAPI
   */
  async searchSerpAPI(query) {
    if (!this.serpApiKey) {
      throw new Error('SERP_API_KEY not configured');
    }

    try {
      const url = `https://serpapi.com/search.json?engine=google_images&q=${encodeURIComponent(query)}&api_key=${this.serpApiKey}&num=5&safe=active`;
      
      const response = await fetch(url, { timeout: 10000 });

      if (!response.ok) {
        throw new Error(`SerpAPI error: ${response.status}`);
      }

      const data = await response.json();
      const images = data.images_results || [];

      // Prefer images from priority domains
      for (const domain of this.domainPriorities) {
        const domainImage = images.find((img) => 
          img.link && img.link.includes(domain)
        );
        if (domainImage && domainImage.original) {
          return domainImage.original;
        }
      }

      // Return first valid image
      if (images.length > 0 && images[0].original) {
        return images[0].original;
      }

      return null;
    } catch (error) {
      throw new Error(`SERPAPI_SEARCH_ERROR: ${error.message}`);
    }
  }

  /**
   * Search with domain priority (heuristic fallback)
   */
  async searchWithDomainPriority(query) {
    // Try Bing with domain-specific queries
    for (const domain of this.domainPriorities) {
      try {
        const domainQuery = `${query} site:${domain}`;
        const imageUrl = await this.searchBing(domainQuery);
        if (imageUrl) return imageUrl;
      } catch (error) {
        // Continue to next domain
        continue;
      }
    }

    return null;
  }

  /**
   * Search multiple products in batch
   */
  async searchBatch(products) {
    const results = [];

    for (const product of products) {
      try {
        const imageUrl = await this.search({
          productName: product.product_name,
          sku: product.sku,
          brand: product.brand,
          size: product.size,
          category: product.category,
        });

        results.push({
          product,
          imageUrl,
          success: !!imageUrl,
        });

        // Rate limiting
        await new Promise((resolve) => setTimeout(resolve, 500));
      } catch (error) {
        results.push({
          product,
          imageUrl: null,
          success: false,
          error: error.message,
        });
      }
    }

    return results;
  }
}

export default new ImageSearch();

