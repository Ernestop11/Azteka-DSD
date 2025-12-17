# Retail Logic Layer

## Analytics
- `retailAnalytics.track('click', { productId })`
- `retailSession` holds region/store type/engagement score.

## Ranker
`retailRanker.getTrendingProducts()` sorts products based on tracked clicks, used to auto-fill showcases.

## Suggestions
`retailSuggestions.getBundleRecommendations()` returns region-aware bundle IDs using trending data.

## Integration Pattern
```ts
import { retailAnalytics } from '@/retail/retailAnalytics';
import { retailSuggestions } from '@/dynamic';

retailAnalytics.track('click', { productId: 'abc' });
const suggestions = useRetailSuggestions();
```

## Smart Interop
`smartCustomerEngine` feeds region/tier into suggestions to align promos with store types.
