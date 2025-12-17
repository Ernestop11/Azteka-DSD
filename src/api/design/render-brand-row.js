import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import templateRenderer from '../../services/design/templateRenderer.js';

const prisma = new PrismaClient();
const router = Router();

// POST /api/design/render-brand-row
router.post('/', async (req, res) => {
  try {
    const {
      brandId,
      brandName,
      brandLogo,
      description,
      backgroundColor,
      textColor,
    } = req.body;

    // Validation
    if (!brandId && !brandName) {
      return res.status(400).json({
        error: 'MISSING_FIELDS',
        message: 'Brand ID or name is required',
        field: 'brandId',
      });
    }

    // Fetch brand data if brandId provided
    let brandData = {};
    if (brandId) {
      try {
        const brand = await prisma.brand.findUnique({
          where: { id: brandId },
          include: {
            _count: {
              select: { products: true },
            },
          },
        });

        if (!brand) {
          return res.status(404).json({
            error: 'NOT_FOUND',
            message: 'Brand not found',
          });
        }

        brandData = {
          brandName: brand.name,
          brandLogo: brand.logoUrl,
          description: brand.description,
          productCount: brand._count.products,
        };
      } catch (dbError) {
        return res.status(500).json({
          error: 'DATABASE_ERROR',
          message: 'Failed to fetch brand data',
        });
      }
    }

    // Merge provided data with brand data
    const renderData = {
      brandName: brandName || brandData.brandName,
      brandLogo: brandLogo || brandData.brandLogo,
      description: description || brandData.description,
      backgroundColor: backgroundColor || '#ffffff',
      textColor: textColor || '#000000',
      productCount: brandData.productCount,
    };

    // Render design
    const result = await templateRenderer.renderBrandRow(renderData);

    // Handle async job
    if (result.jobId) {
      return res.json({
        jobId: result.jobId,
        status: 'pending',
        message: 'Design render job queued',
      });
    }

    // Update brand if brandId provided
    if (brandId && result.imageUrl) {
      try {
        await prisma.brand.update({
          where: { id: brandId },
          data: {
            logoUrl: result.imageUrl, // Or create a separate bannerUrl field
          },
        });
      } catch (dbError) {
        console.warn('Failed to update brand image:', dbError.message);
      }
    }

    res.json({
      success: true,
      imageUrl: result.imageUrl,
    });
  } catch (error) {
    console.error('Brand row render error:', error);

    if (error.message.includes('TIMEOUT')) {
      return res.status(504).json({
        error: 'TIMEOUT',
        message: 'Design render request timed out',
      });
    }

    if (error.message.includes('INVALID_TEMPLATE')) {
      return res.status(400).json({
        error: 'INVALID_TEMPLATE',
        message: 'Brand row template not configured',
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
      message: 'Failed to render brand row design',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
});

export default router;

