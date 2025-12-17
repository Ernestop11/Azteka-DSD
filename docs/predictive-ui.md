# Predictive UI & Preloading

## Modules
- `src/preload/preloadImages.ts` — raw image preload helper.
- `src/preload/preloadSections.ts` — queue/process sections.
- `src/preload/preloadPredictor.ts` — predicts next sections based on scroll direction + performance tier.

## Usage
```ts
import { preloadPredictor } from '@/dynamic';

preloadPredictor.predictNextSections(
  { sections: [{ id: 'promo', top: 1200, imageUrls: ['/promo.png'] }] },
  window.scrollY
);
```

For Tab S9 FE or low-tier devices, predictor skips heavy FX layers automatically.

## Scroll Integration
Combine with `perfScroll.onFastScroll` to pause preloading until user stops flick-scrolling.
