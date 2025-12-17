# Smart Device Logic

## Detection
- `detectSamsungTab()` → SM-X5xx user agents (Galaxy Tab S9 FE).
- `detectiPad()` → identifies iPads for tablet layouts.
- `detectLowEndAndroid()` → low hardware concurrency (≤ 4 cores).
- `detectPerformanceTier()` → returns device string + perf tier (`high`, `mid`, `low`).

## Grid Selection
- `chooseGrid(device)` → `'tablet-wide'` for Samsung Tab S9 FE, `'tablet'` for other tablets, `'desktop'` otherwise.

## Animation Budget
- `chooseAnimationBudget(performanceTier)` → `'high'` for desktop, `'medium'` for Samsung, `'low'` for low-end Android.

## Performance Hooks
- `smartPerformanceEngine.autoSwitch()` monitors FPS, forces `speedMode` if < 40 FPS.
- Tab S9 FE gets scroll optimizations via `performanceTools.applyTabS9Optimizations()`.

## Customer Personalization
- `smartCustomerEngine` adds price mode, layout preference, and region-based backgrounds without altering components. Use `smartRules.applySmartMode()` to combine everything into `SmartCatalogConfig`.
