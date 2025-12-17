import { Router } from 'express';
import multer from 'multer';
import { join } from 'path';
import { tmpdir } from 'os';
import poParser from '../../services/auto-ingest/poParser.js';
import ingestionPipeline from '../../services/auto-ingest/ingestionPipeline.js';

const router = Router();

// Configure multer for file uploads
const upload = multer({
  dest: join(tmpdir(), 'azteka-po-uploads'),
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB
  },
  fileFilter: (_req, file, cb) => {
    const allowedMimes = [
      'application/pdf',
      'text/csv',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'image/jpeg',
      'image/png',
      'image/jpg',
    ];
    
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Allowed: PDF, CSV, Excel, JPEG, PNG'));
    }
  },
});

// POST /api/auto/ingest-po
router.post('/', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        error: 'MISSING_FILE',
        message: 'No file uploaded',
      });
    }

    const { autoProcess = 'false' } = req.body;
    const filePath = req.file.path;
    const fileType = req.file.mimetype;

    let products = [];

    // Parse file based on type
    try {
      if (fileType === 'application/pdf') {
        const result = await poParser.parsePDF(filePath);
        products = result.products || [];
      } else if (fileType === 'text/csv') {
        const result = await poParser.parseCSV(filePath);
        products = result.products || [];
      } else if (
        fileType === 'application/vnd.ms-excel' ||
        fileType === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      ) {
        const result = await poParser.parseExcel(filePath);
        products = result.products || [];
      } else if (fileType.startsWith('image/')) {
        const result = await poParser.parseImage(filePath);
        products = result.products || [];
      } else {
        return res.status(400).json({
          error: 'UNSUPPORTED_FILE_TYPE',
          message: `File type ${fileType} not supported`,
        });
      }
    } catch (parseError) {
      return res.status(400).json({
        error: 'PARSING_ERROR',
        message: parseError.message,
        details: process.env.NODE_ENV === 'development' ? parseError.stack : undefined,
      });
    }

    // Auto-process if requested
    if (autoProcess === 'true') {
      try {
        const results = await ingestionPipeline.processBatch(products);
        return res.json({
          success: true,
          parsed: products.length,
          processed: results,
        });
      } catch (processError) {
        return res.status(500).json({
          error: 'PROCESSING_ERROR',
          message: 'Failed to process products',
          parsed: products.length,
          details: process.env.NODE_ENV === 'development' ? processError.message : undefined,
        });
      }
    }

    // Return parsed products only
    res.json({
      success: true,
      products,
      count: products.length,
      message: 'Products parsed successfully. Set autoProcess=true to process automatically.',
    });
  } catch (error) {
    console.error('PO ingestion error:', error);
    res.status(500).json({
      error: 'INGESTION_ERROR',
      message: 'Failed to ingest purchase order',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
});

export default router;

