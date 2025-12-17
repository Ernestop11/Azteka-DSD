# Auto-Showcase Engine

## Modules
- `autoShowcaseEngine.ts`: builds heroSpotlight/trendingRow/bundleFocus lists using retailRanker + behavior profiles.
- `autoPromoEngine.ts`: outputs promo card models based on customer tier + seasonal theme.
- `autoSeasonEngine.ts`: resolves seasonal hero metadata from smart theme detection.
- `autoShowcaseRegistry.ts`: lookup for available showcase block keys (string refs only).

## Usage
```ts
import { autoShowcaseEngine, autoPromoEngine, autoSeasonEngine } from '@/showcase-auto';

const showcasePlan = autoShowcaseEngine.buildShowcase();
const promos = autoPromoEngine.buildPromos();
const seasonalHero = autoSeasonEngine.resolveSeasonalHero();
```

Cursor can map plan keys to actual UI components later in LAP #9+.
