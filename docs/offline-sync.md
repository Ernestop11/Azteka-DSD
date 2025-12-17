# Offline Sync Engine

## Modules
- `offlineDB.ts` — local storage abstraction with schema versioning.
- `offlineCacheSchema.ts` — defines cached entity shapes.
- `syncQueue.ts` — offline action queue (add/remove cart, update qty, submit order).
- `syncConflictResolver.ts` — resolves conflicts (price changes, stock updates).
- `syncScheduler.ts` — flush queue with exponential backoff placeholder.
- Barrel: `offlineIndex.ts`.

## Usage
```ts
import { offlineDB, syncQueue, syncScheduler } from '@/offline-sync/offlineIndex';

const cache = offlineDB.read();
offlineDB.write(cache);
syncQueue.enqueue({ type: 'addToCart', payload: { productId: 'SKU1', quantity: 2 } });
await syncScheduler.flush();
```

Built for future tablet/offline flows without touching UI yet.
