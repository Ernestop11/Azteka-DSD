# Retail Layout Engine

## Files
- `src/retail-layout/retailLayoutEngine.ts`: generates layout patterns from SmartCatalogConfig.
- `retailLayoutRegistry.ts`: maps layout keys → component names (string refs).
- `layoutConditions.ts`: seasonal + customer rules (Christmas inserts Showcase, speedMode uses MasonryLight, etc.).
- `layoutWeights.ts`: tier/performance/seasonal weighting maps.
- `debug/layoutDebugger.ts`: logs layout pattern, FX stack, theme, device/perf budget, dwell hotspots, suggestions.

## Usage
```ts
import { retailLayoutEngine } from '@/retail-layout';
import { useSmartCatalog } from '@/smart/useSmartCatalog';

const config = useSmartCatalog();
const pattern = retailLayoutEngine.generateLayoutPattern(config);
```

Use `layoutDebugger.log(config, pattern, fxStack)` during development.
