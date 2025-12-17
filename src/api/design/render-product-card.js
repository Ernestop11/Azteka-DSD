import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import templateRenderer from '../../services/design/templateRenderer.js';

const prisma = new PrismaClient();
const router = Router();

// POST /api/design/render-product-card
router.post('/', async (req, res) => {
  try {
    const {
      productId,
      name,
      description,
      price,
      originalPrice,
      discount,
      imageUrl,
      backgroundColor,
      textColor,
      brandName,
      brandLogo,
      categoryName,
    } = req.body;

    // Validation
    if (!productId && !name) {
      return res.status(400).json({
        error: 'MISSING_FIELDS',
        message: 'Product ID or name is required',
        field: 'productId',
      });
    }

    // Fetch product data if productId provided
    let productData = {};
    if (productId) {
      try {
        const product = await prisma.product.findUnique({
          where: { id: productId },
          include: {
            brand: { select: { name: true, logoUrl: true } },
            category: { select: { name: true } },
            images: { orderBy: { sort_order: 'asc' }, take: 1 },
          },
        });

        if (!product) {
          return res.status(404).json({
            error: 'NOT_FOUND',
            message: 'Product not found',
          });
        }

        productData = {
          name: product.name,
          description: product.description || product.short_description,
          price: product.priceCase || product.price,
          imageUrl: product.images[0]?.image_url || product.imageUrl,
          backgroundColor: product.background_color || product.backgroundColor,
          brandName: product.brand?.name,
          brandLogo: product.brand?.logoUrl,
          categoryName: product.category?.name,
        };
      } catch (dbError) {
        return res.status(500).json({
          error: 'DATABASE_ERROR',
          message: 'Failed to fetch product data',
        });
      }
    }

    // Merge provided data with product data
    const renderData = {
      name: name || productData.name,
      description: description || productData.description,
      price: price !== undefined ? price : productData.price,
      originalPrice,
      discount,
      imageUrl: imageUrl || productData.imageUrl,
      backgroundColor: backgroundColor || productData.backgroundColor || '#f3f4f6',
      textColor,
      brandName: brandName || productData.brandName,
      brandLogo: brandLogo || productData.brandLogo,
      categoryName: categoryName || productData.categoryName,
    };

    // Render design
    const result = await templateRenderer.renderProductCard(renderData);

    // Handle async job
    if (result.jobId) {
      return res.json({
        jobId: result.jobId,
        status: 'pending',
        message: 'Design render job queued',
      });
    }

    // Update product if productId provided
    if (productId && result.imageUrl) {
      try {
        await prisma.product.update({
          where: { id: productId },
          data: {
            imageUrl: result.imageUrl,
          },
        });
      } catch (dbError) {
        console.warn('Failed to update product image:', dbError.message);
      }
    }

    res.json({
      success: true,
      imageUrl: result.imageUrl,
    });
  } catch (error) {
    console.error('Product card render error:', error);

    if (error.message.includes('TIMEOUT')) {
      return res.status(504).json({
        error: 'TIMEOUT',
        message: 'Design render request timed out',
      });
    }

    if (error.message.includes('INVALID_TEMPLATE')) {
      return res.status(400).json({
        error: 'INVALID_TEMPLATE',
        message: 'Product card template not configured',
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
      message: 'Failed to render product card',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
});

export default router;

