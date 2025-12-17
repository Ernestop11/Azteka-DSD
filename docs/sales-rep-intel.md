# Sales Rep Intelligence Engine

## Modules
- `repVisitScorer.ts` — priority scoring for customer visits based on recency, seasonal demand, order volume, missed reorders.
- `repProductMemory.ts` — remembers per-customer “usual SKUs.”
- `repRouteRanker.ts` — ranks daily route stops.
- `missingSkuDetector.ts` — detects missing usual SKUs in cart context.
- `repCartAdvisor.ts` — aggregates missing SKUs, bundle suggestions, high-margin recommendations.
- `repSessionMemory.ts` — tracks rep session state.
- Barrel: `repIndex.ts`.

## Integration
```ts
import { repRouteRanker, repCartAdvisor } from '@/sales-rep-intel/repIndex';
```

Outputs are pure data structures; Cursor can map them to tablet UI flows.
