# Sales Smart Engine

## Modules
- `src/sales-smart/salesBehaviorModel.ts` — derives behavior profiles (`Weekly Buyer`, `Deal Hunter`, etc.) from purchase signals.
- `reorderPredictor.ts` — predicts next order quantities per SKU.
- `marginOptimizer.ts` — ranks high-margin items.
- `bundleSuggestor.ts` — generates bundle suggestions.
- `priceOverrideEngine.ts` — per-customer effective price lookup.
- `cartAssistEngine.ts` — suggests missing usual SKUs.
- `salesSignals.ts` — event bus for cart/interaction signals.

## Integration
Cursor can import from `src/sales-smart/salesIndex.ts`:
```ts
import { salesBehaviorModel, bundleSuggestor } from '@/sales-smart/salesIndex';
```

Outputs are pure data objects, no UI coupling.
