import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import templateRenderer from '../../services/design/templateRenderer.js';
import imageUploader from '../../services/design/imageUploader.js';

const prisma = new PrismaClient();
const router = Router();

// POST /api/design/render-hero
router.post('/', async (req, res) => {
  try {
    const {
      title,
      subtitle,
      headline,
      subheadline,
      ctaText,
      ctaLink,
      backgroundImage,
      backgroundColor,
      backgroundGradient,
      imageUrl,
      layoutSectionId, // Optional: update layout section
    } = req.body;

    // Validation
    if (!title && !headline) {
      return res.status(400).json({
        error: 'MISSING_FIELDS',
        message: 'Title or headline is required',
        field: 'title',
      });
    }

    // Render design
    const result = await templateRenderer.renderHero({
      title,
      subtitle,
      headline,
      subheadline,
      ctaText,
      ctaLink,
      backgroundImage,
      backgroundColor,
      backgroundGradient,
      imageUrl,
    });

    // Handle async job
    if (result.jobId) {
      // Store job info for status checking
      // In production, you'd store this in a database
      return res.json({
        jobId: result.jobId,
        status: 'pending',
        message: 'Design render job queued',
      });
    }

    // Update layout section if provided
    if (layoutSectionId && result.imageUrl) {
      try {
        await prisma.layoutSection.update({
          where: { id: layoutSectionId },
          data: {
            config: {
              ...(await prisma.layoutSection.findUnique({ where: { id: layoutSectionId } }))?.config || {},
              heroImage: result.imageUrl,
            },
          },
        });

        // Update hero section if exists
        const heroSection = await prisma.heroSection.findUnique({
          where: { sectionId: layoutSectionId },
        });

        if (heroSection) {
          await prisma.heroSection.update({
            where: { sectionId: layoutSectionId },
            data: {
              backgroundImage: result.imageUrl,
            },
          });
        }
      } catch (dbError) {
        // Non-critical - log but don't fail
        console.warn('Failed to update layout section:', dbError.message);
      }
    }

    res.json({
      success: true,
      imageUrl: result.imageUrl,
    });
  } catch (error) {
    console.error('Hero render error:', error);

    // Handle specific error types
    if (error.message.includes('TIMEOUT')) {
      return res.status(504).json({
        error: 'TIMEOUT',
        message: 'Design render request timed out',
        details: error.message,
      });
    }

    if (error.message.includes('INVALID_TEMPLATE')) {
      return res.status(400).json({
        error: 'INVALID_TEMPLATE',
        message: 'Hero template not configured or invalid',
        details: error.message,
      });
    }

    if (error.message.includes('API_RATE_LIMIT')) {
      return res.status(429).json({
        error: 'API_RATE_LIMIT',
        message: 'Canva API rate limit exceeded. Please try again later.',
      });
    }

    if (error.message.includes('MISSING_FIELDS')) {
      return res.status(400).json({
        error: 'MISSING_FIELDS',
        message: error.message,
      });
    }

    if (error.message.includes('STORAGE_FAILURE')) {
      return res.status(500).json({
        error: 'STORAGE_FAILURE',
        message: 'Failed to save generated image',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined,
      });
    }

    res.status(500).json({
      error: 'RENDER_ERROR',
      message: 'Failed to render hero design',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
});

export default router;

