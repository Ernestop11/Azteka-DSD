import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import imageSearch from '../../../services/auto-ingest/imageSearch.js';
import bgRemover from '../../../services/auto-ingest/bgRemover.js';
import enhancer from '../../../services/auto-ingest/enhancer.js';
import templateRenderer from '../../../services/design/templateRenderer.js';
import imageUploader from '../../../services/design/imageUploader.js';
import { unlinkSync } from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';
import fetch from 'node-fetch';

const prisma = new PrismaClient();
const router = Router({ mergeParams: true });

// POST /api/products/:id/force-regenerate
router.post('/:id/force-regenerate', async (req, res) => {
  try {
    const { id } = req.params;
    const { regenerateDesign = 'true' } = req.body;

    // Get product
    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        brand: true,
        category: true,
      },
    });

    if (!product) {
      return res.status(404).json({
        error: 'NOT_FOUND',
        message: 'Product not found',
      });
    }

    const result = {
      productId: id,
      productName: product.name,
      steps: {
        imageSearch: null,
        bgRemoval: null,
        enhancement: null,
        designGeneration: null,
        upload: null,
      },
      imageUrl: null,
      designAssetUrl: null,
      errors: [],
    };

    // Step 1: Search for new image
    try {
      const imageUrl = await imageSearch.search({
        productName: product.name,
        sku: product.sku,
        brand: product.brand?.name,
        category: product.category?.name,
      });

      if (!imageUrl) {
        result.errors.push('No image found');
        return res.status(404).json({
          error: 'IMAGE_NOT_FOUND',
          message: 'Could not find product image',
          result,
        });
      }

      result.steps.imageSearch = imageUrl;

      // Step 2: Download image
      const tempDir = join(tmpdir(), 'azteka-regen');
      const tempImagePath = join(tempDir, `img-${Date.now()}.jpg`);

      const imageResponse = await fetch(imageUrl, { timeout: 30000 });
      if (!imageResponse.ok) {
        throw new Error(`Failed to download image: ${imageResponse.status}`);
      }

      const imageBuffer = await imageResponse.arrayBuffer();
      const fs = await import('fs/promises');
      await fs.mkdir(tempDir, { recursive: true });
      await fs.writeFile(tempImagePath, Buffer.from(imageBuffer));

      try {
        // Step 3: Remove background
        const noBgPath = await bgRemover.removeBackground(tempImagePath);

        // Step 4: Enhance image
        const enhancedPath = await enhancer.enhance(noBgPath, {
          size: 1024,
          format: 'png',
        });

        // Step 5: Create thumbnail
        const thumbnailPath = await enhancer.createThumbnail(enhancedPath, 300);

        // Step 6: Upload images
        const uploadedImageUrl = await imageUploader.upload(enhancedPath, 'products');
        const uploadedThumbnailUrl = await imageUploader.upload(thumbnailPath, 'products');

        result.steps.bgRemoval = 'success';
        result.steps.enhancement = 'success';
        result.steps.upload = uploadedImageUrl;
        result.imageUrl = uploadedImageUrl;

        // Step 7: Generate design asset (if requested)
        if (regenerateDesign === 'true' && process.env.CANVA_API_KEY) {
          try {
            const designResult = await templateRenderer.renderProductCard({
              name: product.name,
              description: product.description,
              price: product.priceCase || product.price,
              imageUrl: uploadedImageUrl,
              brandName: product.brand?.name,
              brandLogo: product.brand?.logoUrl,
              categoryName: product.category?.name,
            });

            if (designResult.imageUrl) {
              result.steps.designGeneration = designResult.imageUrl;
              result.designAssetUrl = designResult.imageUrl;
            }
          } catch (designError) {
            result.errors.push(`Design generation failed: ${designError.message}`);
          }
        }

        // Step 8: Update product
        await prisma.product.update({
          where: { id },
          data: {
            imageUrl: uploadedImageUrl,
            thumbnail: uploadedThumbnailUrl,
          },
        });

        // Cleanup temp files
        try {
          unlinkSync(tempImagePath);
          unlinkSync(noBgPath);
          unlinkSync(enhancedPath);
          unlinkSync(thumbnailPath);
        } catch (cleanupError) {
          // Ignore cleanup errors
        }

        res.json({
          success: true,
          message: 'Product image regenerated successfully',
          result,
        });
      } catch (processError) {
        result.errors.push(`Image processing failed: ${processError.message}`);
        
        // Cleanup on error
        try {
          unlinkSync(tempImagePath);
        } catch (cleanupError) {
          // Ignore
        }

        res.status(500).json({
          error: 'REGENERATION_ERROR',
          message: 'Failed to regenerate product image',
          result,
        });
      }
    } catch (error) {
      result.errors.push(`Image search failed: ${error.message}`);
      res.status(500).json({
        error: 'REGENERATION_ERROR',
        message: 'Failed to regenerate product image',
        result,
      });
    }
  } catch (error) {
    console.error('Force regenerate error:', error);
    res.status(500).json({
      error: 'REGENERATION_ERROR',
      message: 'Failed to regenerate product',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
});

export default router;

