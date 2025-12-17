# Behavior-Guided Highlights

## Modules
- `highlightEngine.ts`: combines behavior profile, season, and perf budget to output highlight suggestions.
- `highlightTypes.ts`: typed instructions (spotlightSavings, highlightCategories, highlightTierC, etc.).
- `highlightConditions.ts`: rule mapping for Deal Hunter, Explorer, Retail Tourist, and seasonal pushes.

## Usage
```ts
import { highlightEngine } from '@/highlights';

const highlights = highlightEngine.generate();
// [{ instruction: 'spotlightSavings', reason: 'user price sensitivity detected' }]
```

Cursor can wire these instructions to specific UI treatments (e.g., add savings badges, highlight seasonal cards).
