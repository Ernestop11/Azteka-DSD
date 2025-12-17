# Smart Engine Overview

## Purpose
Adds data-driven automation for themes, presets, FX budgets, and layouts without touching components.

## Modules
- `smartThemeEngine`: detects holidays/events, chooses presets/backgrounds.
- `smartDeviceEngine`: device/perf detection, grid + animation budgets.
- `smartCustomerEngine`: store type + region logic for promos.
- `smartPerformanceEngine`: FPS monitoring, auto mode switches.
- `smartRules.applySmartMode()`: orchestrates everything into `SmartCatalogConfig`.
- `useSmartCatalog` hook: provides configs to React pages.

## Usage
```ts
import { useSmartCatalog } from '@/smart/useSmartCatalog';

const config = useSmartCatalog({ theme: 'posadas' });
```

`config` exposes fields defined in `src/smart/types.ts` (theme, preset, fxLayers, backgroundClass, gridVariant, animationBudget, etc.).

## Auto Invocation
Call `smartRules.applySmartMode()` when server-side context is available, or rely on `useSmartCatalog()` client-side for runtime detection.
