# Interactive Retail AI Layer

## Modules
- `src/ai-retail/aiRetailEngine.ts`: orchestrates smart config, behavior profile, ranking, layout suggestions, FX stack, and explanation strings.
- `aiSignals.ts`: lightweight signal bus for interactions (`addToCart`, `productLongView`, `fastScroll`, etc.).
- `aiBehaviorModel.ts`: maps signals → behavior profiles (Deal Hunter, Exploration Mode, Repeat Buyer, Retail Tourist).
- `aiRanker.ts`: ranks products using dwell/click data from `retailAnalytics` + behavior weightings.
- `aiExplain.ts`: human-readable summary for devtools.
- `debug/aiRetailDebugger.ts`: logs the entire AI decision flow.

## Usage
```ts
import { aiRetailEngine } from '@/ai-retail';
const plan = aiRetailEngine.generate();
console.log(plan.recommendedLayouts, plan.recommendedShowcaseProducts);
```
