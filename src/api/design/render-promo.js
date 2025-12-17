import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import templateRenderer from '../../services/design/templateRenderer.js';

const prisma = new PrismaClient();
const router = Router();

// POST /api/design/render-promo
router.post('/', async (req, res) => {
  try {
    const {
      promotionId,
      title,
      description,
      ctaText,
      ctaLink,
      discount,
      backgroundColor,
      backgroundImage,
      textColor,
      validUntil,
    } = req.body;

    // Validation
    if (!title) {
      return res.status(400).json({
        error: 'MISSING_FIELDS',
        message: 'Title is required',
        field: 'title',
      });
    }

    // Fetch promotion data if promotionId provided
    let promoData = {};
    if (promotionId) {
      try {
        const promotion = await prisma.promotion.findUnique({
          where: { id: promotionId },
        });

        if (!promotion) {
          return res.status(404).json({
            error: 'NOT_FOUND',
            message: 'Promotion not found',
          });
        }

        promoData = {
          title: promotion.title,
          description: promotion.description,
          discount: promotion.discountPercent,
          validUntil: promotion.endDate,
        };
      } catch (dbError) {
        return res.status(500).json({
          error: 'DATABASE_ERROR',
          message: 'Failed to fetch promotion data',
        });
      }
    }

    // Merge provided data with promo data
    const renderData = {
      title: title || promoData.title,
      description: description || promoData.description,
      ctaText: ctaText || 'Shop Now',
      ctaLink,
      discount: discount !== undefined ? discount : promoData.discount,
      backgroundColor: backgroundColor || '#ff6b6b',
      backgroundImage,
      textColor: textColor || '#ffffff',
      validUntil: validUntil || promoData.validUntil,
    };

    // Render design
    const result = await templateRenderer.renderPromo(renderData);

    // Handle async job
    if (result.jobId) {
      return res.json({
        jobId: result.jobId,
        status: 'pending',
        message: 'Design render job queued',
      });
    }

    // Update promotion if promotionId provided
    if (promotionId && result.imageUrl) {
      try {
        // Note: Promotion model may need imageUrl field added
        // For now, we'll store in meta or config
        await prisma.promotion.update({
          where: { id: promotionId },
          data: {
            // If imageUrl field exists:
            // imageUrl: result.imageUrl,
            // Otherwise store in a JSON field or skip
          },
        });
      } catch (dbError) {
        console.warn('Failed to update promotion image:', dbError.message);
      }
    }

    res.json({
      success: true,
      imageUrl: result.imageUrl,
    });
  } catch (error) {
    console.error('Promo render error:', error);

    if (error.message.includes('TIMEOUT')) {
      return res.status(504).json({
        error: 'TIMEOUT',
        message: 'Design render request timed out',
      });
    }

    if (error.message.includes('INVALID_TEMPLATE')) {
      return res.status(400).json({
        error: 'INVALID_TEMPLATE',
        message: 'Promo template not configured',
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
      message: 'Failed to render promo design',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
});

export default router;

