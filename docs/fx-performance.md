# FX Performance Layer

## Performance Tools
```ts
import { performanceTools } from '@/fx';
```

- `performanceTools.forceLayer(element)` → apply translateZ + will-change.
- `applyTabS9Optimizations()` → adds `tab-s9-scroll-boost`.
- `renderThrottle(callback, limit)` → throttle heavy animations.
- `animationBudget(max)` → limit animated elements; remove `data-animated` from extras.
- `gradientFix(element)` → adds `gradient-mobile-fix`.

## Observer Budget
Use `fxObserver.shouldLimitFx()` to check FPS < 40 before applying additional layers.

## Motion Reduction
`fxRuntime.autoReduceMotion()` returns `true` if user requested reduced motion; apply `speedMode`.

## Scroll Perf
Wrap scrollable panes with `tab-s9-scroll-boost` to stabilize Tab S9 FE inertial scroll.

## Lazy FX
Use `fxObserver.createLazyFxObserver('shine-sweep')` to apply classes when in viewport.
