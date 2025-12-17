import { Router } from 'express';
import ingestPoRouter from './ingest-po.js';
import searchImageRouter from './search-image.js';
import bgRemoveRouter from './bg-remove.js';
import enhanceRouter from './enhance.js';
import matchProductRouter from './match-product.js';
import ingestBatchRouter from './ingest-batch.js';

const router = Router();

// Mount all auto-ingestion routes
router.use('/ingest-po', ingestPoRouter);
router.use('/search-image', searchImageRouter);
router.use('/bg-remove', bgRemoveRouter);
router.use('/enhance', enhanceRouter);
router.use('/match-product', matchProductRouter);
router.use('/ingest-batch', ingestBatchRouter);

export default router;

