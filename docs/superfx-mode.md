# Super FX Retail Mode

## Files
- `src/superfx/superFXMode.ts`: applies FX stacks given SmartCatalogConfig (Christmas → snow + sparkle, Summer → neon + splash).
- `superFXMap.ts`: scenario → FX layer class lists.
- `superFXBudget.ts`: integrates with `perfBudget` + device detection to cap FX.

## Usage
```ts
import { superFXMode } from '@/superfx';
const config = useSmartCatalog();
superFXMode.apply(config);
```

Budgeting:
- High-end devices + high FPS → full stack (sparkles, neon, string lights).
- Low-end or FPS < 45 → filters neon + heavy sparkle.

FX classes remain the same ones defined in LAP 3–6 (`fx-sparkle-glow`, `fx-papel-picado`, `fx-neon-tube`, `fx-string-lights`, `bg-gradient-radial-spotlight`).
