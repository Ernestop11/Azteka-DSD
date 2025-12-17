import { Router } from 'express';
import canvaClient from '../../../services/design/canvaClient.js';
import imageUploader from '../../../services/design/imageUploader.js';

const router = Router();

// GET /api/design/status/:id - Check render job status
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { category = 'designs' } = req.query;

    // Check job status with Canva
    const status = await canvaClient.checkRenderStatus(id);

    if (status.status === 'completed' && status.imageUrl) {
      // Download and upload the completed image
      try {
        const uploadedUrl = await imageUploader.uploadFromUrl(status.imageUrl, category);
        
        return res.json({
          jobId: id,
          status: 'completed',
          imageUrl: uploadedUrl,
        });
      } catch (uploadError) {
        // If upload fails, return the Canva URL
        return res.json({
          jobId: id,
          status: 'completed',
          imageUrl: status.imageUrl,
          warning: 'Failed to upload to storage, using Canva URL',
        });
      }
    }

    if (status.status === 'failed') {
      return res.status(500).json({
        jobId: id,
        status: 'failed',
        error: status.error || 'Render job failed',
      });
    }

    // Still pending
    res.json({
      jobId: id,
      status: status.status || 'pending',
      message: 'Render job in progress',
    });
  } catch (error) {
    console.error('Status check error:', error);

    if (error.message.includes('TIMEOUT')) {
      return res.status(504).json({
        error: 'TIMEOUT',
        message: 'Status check timed out',
      });
    }

    res.status(500).json({
      error: 'STATUS_CHECK_ERROR',
      message: 'Failed to check render status',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
});

export default router;

