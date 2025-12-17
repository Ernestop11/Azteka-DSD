import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import templateRenderer from '../../services/design/templateRenderer.js';

const prisma = new PrismaClient();
const router = Router();

// POST /api/design/render-bundle
router.post('/', async (req, res) => {
  try {
    const {
      bundleId,
      name,
      description,
      price,
      discount,
      backgroundColor,
      badgeText,
      badgeColor,
      products,
    } = req.body;

    // Validation
    if (!bundleId && !name) {
      return res.status(400).json({
        error: 'MISSING_FIELDS',
        message: 'Bundle ID or name is required',
        field: 'bundleId',
      });
    }

    // Fetch bundle data if bundleId provided
    let bundleData = {};
    if (bundleId) {
      try {
        const bundle = await prisma.productBundle.findUnique({
          where: { id: bundleId },
          include: {
            products: {
              where: { isHidden: false, inStock: true },
              include: {
                images: { orderBy: { sort_order: 'asc' }, take: 1 },
              },
            },
          },
        });

        if (!bundle) {
          return res.status(404).json({
            error: 'NOT_FOUND',
            message: 'Bundle not found',
          });
        }

        bundleData = {
          name: bundle.name,
          description: bundle.description,
          price: bundle.price,
          discount: bundle.discountPercent,
          backgroundColor: '#f3f4f6',
          badgeText: bundle.badgeText,
          badgeColor: bundle.badgeColor,
          products: bundle.products.map((p) => ({
            name: p.name,
            imageUrl: p.images[0]?.image_url || p.imageUrl,
          })),
        };
      } catch (dbError) {
        return res.status(500).json({
          error: 'DATABASE_ERROR',
          message: 'Failed to fetch bundle data',
        });
      }
    }

    // Merge provided data with bundle data
    const renderData = {
      name: name || bundleData.name,
      description: description || bundleData.description,
      price: price !== undefined ? price : bundleData.price,
      discount: discount !== undefined ? discount : bundleData.discount,
      backgroundColor: backgroundColor || bundleData.backgroundColor,
      badgeText: badgeText || bundleData.badgeText,
      badgeColor: badgeColor || bundleData.badgeColor,
      products: products || bundleData.products || [],
    };

    // Render design
    const result = await templateRenderer.renderBundle(renderData);

    // Handle async job
    if (result.jobId) {
      return res.json({
        jobId: result.jobId,
        status: 'pending',
        message: 'Design render job queued',
      });
    }

    // Update bundle if bundleId provided
    if (bundleId && result.imageUrl) {
      try {
        await prisma.productBundle.update({
          where: { id: bundleId },
          data: {
            imageUrl: result.imageUrl,
          },
        });
      } catch (dbError) {
        console.warn('Failed to update bundle image:', dbError.message);
      }
    }

    res.json({
      success: true,
      imageUrl: result.imageUrl,
    });
  } catch (error) {
    console.error('Bundle render error:', error);

    if (error.message.includes('TIMEOUT')) {
      return res.status(504).json({
        error: 'TIMEOUT',
        message: 'Design render request timed out',
      });
    }

    if (error.message.includes('INVALID_TEMPLATE')) {
      return res.status(400).json({
        error: 'INVALID_TEMPLATE',
        message: 'Bundle template not configured',
      });
    }

    if (error.message.includes('API_RATE_LIMIT')) {
      return res.status(429).json({
        error: 'API_RATE_LIMIT',
        message: 'Canva API rate limit exceeded',
      });
    }

    if (error.message.includes('STORAGE_FAILURE')) {
      return res.status(500).json({
        error: 'STORAGE_FAILURE',
        message: 'Failed to save generated image',
      });
    }

    res.status(500).json({
      error: 'RENDER_ERROR',
      message: 'Failed to render bundle design',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
});

export default router;

