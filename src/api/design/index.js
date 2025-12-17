import { Router } from 'express';
import renderHeroRouter from './render-hero.js';
import renderProductCardRouter from './render-product-card.js';
import renderBundleRouter from './render-bundle.js';
import renderBrandRowRouter from './render-brand-row.js';
import renderPromoRouter from './render-promo.js';
import statusRouter from './status/[id].js';

const router = Router();

// Mount all design routes
router.use('/render-hero', renderHeroRouter);
router.use('/render-product-card', renderProductCardRouter);
router.use('/render-bundle', renderBundleRouter);
router.use('/render-brand-row', renderBrandRowRouter);
router.use('/render-promo', renderPromoRouter);
router.use('/status', statusRouter);

export default router;

