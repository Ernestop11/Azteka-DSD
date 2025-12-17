# Performance Engine

## Modules
- `src/perf/perfFPS.ts` — moving average FPS monitoring.
- `src/perf/perfMonitor.ts` — main-thread blocking + mount timing.
- `src/perf/perfBudget.ts` — adjusts animation budget based on FPS.
- `src/perf/perfScroll.ts` — detects fast scroll to throttle FX.
- `src/perf/perfHeatmap.ts` — dwell/hover analytics for sections.

## Usage
```ts
import { perfFPS, perfBudget } from '@/perf';

perfFPS.start();
const budget = perfBudget.getBudget();
```

Subscribe to low FPS:
```ts
const unsubscribe = perfFPS.onLowFPS(fps => {
  console.log('Low FPS detected', fps);
});
```

Heatmap:
```ts
perfHeatmap.enterSection('hero');
perfHeatmap.exitSection('hero');
const hotspots = perfHeatmap.getHotspots();
```
