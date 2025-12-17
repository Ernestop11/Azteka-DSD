import { Router } from 'express';
import ingestionPipeline from '../../services/auto-ingest/ingestionPipeline.js';

const router = Router();

// POST /api/auto/ingest-batch
router.post('/', async (req, res) => {
  try {
    const { products } = req.body;

    if (!products || !Array.isArray(products)) {
      return res.status(400).json({
        error: 'MISSING_FIELDS',
        message: 'products array is required',
      });
    }

    if (products.length === 0) {
      return res.status(400).json({
        error: 'INVALID_INPUT',
        message: 'products array cannot be empty',
      });
    }

    // Process batch
    const results = await ingestionPipeline.processBatch(products);

    res.json({
      success: true,
      summary: {
        total: products.length,
        updated: results.updated,
        created: results.created,
        failed: results.failed,
      },
      items: results.items.map((item) => ({
        product: item.product.product_name || item.product.sku,
        imageUrl: item.imageUrl,
        match: item.match ? {
          id: item.match.id,
          name: item.match.name,
        } : null,
        created: item.created,
        updated: item.updated,
        errors: item.errors,
      })),
    });
  } catch (error) {
    console.error('Batch ingestion error:', error);
    res.status(500).json({
      error: 'BATCH_INGESTION_ERROR',
      message: 'Failed to process batch',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
});

export default router;

