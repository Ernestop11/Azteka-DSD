import { Router } from 'express';
import multer from 'multer';
import { join } from 'path';
import { tmpdir } from 'os';
import bgRemover from '../../services/auto-ingest/bgRemover.js';
import imageUploader from '../../services/design/imageUploader.js';
import { unlinkSync } from 'fs';

const router = Router();

const upload = multer({
  dest: join(tmpdir(), 'azteka-bg-remove'),
  limits: { fileSize: 20 * 1024 * 1024 }, // 20MB
  fileFilter: (_req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only images allowed.'));
    }
  },
});

// POST /api/auto/bg-remove
router.post('/', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        error: 'MISSING_FILE',
        message: 'No image file uploaded',
      });
    }

    const outputPath = req.file.path.replace(/\.(jpg|jpeg|png)$/i, '_nobg.png');
    
    // Remove background
    const processedPath = await bgRemover.removeBackground(req.file.path, outputPath);

    // Upload processed image
    const imageUrl = await imageUploader.upload(processedPath, 'products');

    // Cleanup temp files
    try {
      unlinkSync(req.file.path);
      if (processedPath !== req.file.path) {
        unlinkSync(processedPath);
      }
    } catch (cleanupError) {
      // Ignore cleanup errors
    }

    res.json({
      success: true,
      imageUrl,
    });
  } catch (error) {
    console.error('Background removal error:', error);
    res.status(500).json({
      error: 'BG_REMOVAL_ERROR',
      message: error.message || 'Failed to remove background',
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined,
    });
  }
});

export default router;

