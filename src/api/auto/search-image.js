import { Router } from 'express';
import imageSearch from '../../services/auto-ingest/imageSearch.js';

const router = Router();

// POST /api/auto/search-image
router.post('/', async (req, res) => {
  try {
    const { productName, sku, brand, size, category } = req.body;

    if (!productName && !sku) {
      return res.status(400).json({
        error: 'MISSING_FIELDS',
        message: 'productName or sku is required',
      });
    }

    const imageUrl = await imageSearch.search({
      productName,
      sku,
      brand,
      size,
      category,
    });

    if (!imageUrl) {
      return res.status(404).json({
        error: 'IMAGE_NOT_FOUND',
        message: 'No image found for this product',
      });
    }

    res.json({
      success: true,
      imageUrl,
    });
  } catch (error) {
    console.error('Image search error:', error);
    res.status(500).json({
      error: 'SEARCH_ERROR',
      message: 'Failed to search for image',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
});

export default router;

