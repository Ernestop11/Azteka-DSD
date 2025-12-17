import { Router } from 'express';
import multer from 'multer';
import { join } from 'path';
import { tmpdir } from 'os';
import enhancer from '../../services/auto-ingest/enhancer.js';
import imageUploader from '../../services/design/imageUploader.js';
import { unlinkSync } from 'fs';

const router = Router();

const upload = multer({
  dest: join(tmpdir(), 'azteka-enhance'),
  limits: { fileSize: 20 * 1024 * 1024 }, // 20MB
  fileFilter: (_req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only images allowed.'));
    }
  },
});

// POST /api/auto/enhance
router.post('/', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        error: 'MISSING_FILE',
        message: 'No image file uploaded',
      });
    }

    const {
      size = 1024,
      sharpen = 'true',
      format = 'png',
      createThumbnail = 'false',
    } = req.body;

    // Enhance image
    const enhancedPath = await enhancer.enhance(req.file.path, {
      size: parseInt(size, 10),
      sharpen: sharpen === 'true',
      format,
    });

    // Upload enhanced image
    const imageUrl = await imageUploader.upload(enhancedPath, 'products');

    let thumbnailUrl = null;
    if (createThumbnail === 'true') {
      const thumbnailPath = await enhancer.createThumbnail(enhancedPath, 300);
      thumbnailUrl = await imageUploader.upload(thumbnailPath, 'products');
      unlinkSync(thumbnailPath);
    }

    // Cleanup temp files
    try {
      unlinkSync(req.file.path);
      unlinkSync(enhancedPath);
    } catch (cleanupError) {
      // Ignore cleanup errors
    }

    res.json({
      success: true,
      imageUrl,
      thumbnailUrl,
    });
  } catch (error) {
    console.error('Image enhancement error:', error);
    res.status(500).json({
      error: 'ENHANCEMENT_ERROR',
      message: error.message || 'Failed to enhance image',
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined,
    });
  }
});

export default router;

