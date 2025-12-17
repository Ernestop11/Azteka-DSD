# Warehouse Picking Optimization Engine

## Modules
- `inventoryMap.ts` — bin mapping for products.
- `pickPathOptimizer.ts` — generates pick steps per order.
- `pickBatcher.ts` — batches orders by SKU/zone overlap.
- `pickWavePlanner.ts` — schedules morning/midday/closing waves.
- `stockConsumptionPredictor.ts` — forecasts inventory depletion.
- Barrel: `pickIndex.ts`.

## Usage
```ts
import { pickPathOptimizer, pickBatcher } from '@/warehouse-pick/pickIndex';

const path = pickPathOptimizer.optimize({ orderId: '123', productIds: ['SKU1', 'SKU2'] });
const batches = pickBatcher.batchOrders(orders);
```

Outputs are purely data for future warehouse UI hooks.
