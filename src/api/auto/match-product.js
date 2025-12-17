import { Router } from 'express';
import matcher from '../../services/auto-ingest/matcher.js';

const router = Router();

// POST /api/auto/match-product
router.post('/', async (req, res) => {
  try {
    const { product_name, sku, vendor_code, brand, size, category } = req.body;

    if (!product_name && !sku) {
      return res.status(400).json({
        error: 'MISSING_FIELDS',
        message: 'product_name or sku is required',
      });
    }

    const matchResult = await matcher.match({
      product_name,
      sku,
      vendor_code,
      brand,
      size,
      category,
    });

    if (!matchResult.match) {
      return res.json({
        success: false,
        match: null,
        confidence: matchResult.confidence,
        method: matchResult.method,
        message: 'No matching product found',
      });
    }

    res.json({
      success: true,
      match: {
        id: matchResult.match.id,
        name: matchResult.match.name,
        sku: matchResult.match.sku,
        brand: matchResult.match.brand?.name,
        category: matchResult.match.category?.name,
      },
      confidence: matchResult.confidence,
      method: matchResult.method,
    });
  } catch (error) {
    console.error('Product matching error:', error);
    res.status(500).json({
      error: 'MATCHING_ERROR',
      message: 'Failed to match product',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
});

export default router;

