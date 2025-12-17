# Customer Preference Engine

## Modules
- `preferenceProfile.ts` — builds preference models (categories, price sensitivity).
- `preferenceSignals.ts` — captures liked products, promo interest, etc.
- `reorderHistoryModel.ts` — stores reorder cycles for LAP #9 predictor.
- `specialPriceEngine.ts` — bridges preference pricing with `priceOverrideEngine`.
- `preferredCategoryRanker.ts` — ranks categories for auto-showcase usage.
- `customerSuggestor.ts` — outputs recommendation models (recommended products, seasonal ideas).

## Usage
```ts
import { preferenceProfile, customerSuggestor } from '@/customer-pref/customerPrefIndex';

const profile = preferenceProfile.getCustomerPreferenceProfile(customerId);
const suggestions = customerSuggestor.buildSuggestions(customerId);
```

Outputs feed LAP #8 highlight/showcase engines but remain UI-agnostic.
