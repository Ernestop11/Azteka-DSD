# FX Engine Overview

## Purpose
Provides runtime controls for applying FX layers, themes, and presets without modifying components.

## Import
```ts
import { fxEngine, fxRuntime, fxPresets, fxThemes } from '@/fx';
```

## Quick Start
```ts
fxRuntime.attachToPage();
fxRuntime.applyTheme('christmas');
fxEngine.enableFx('sparkleGlowLayer');
```

## State Management
- `fxEngine.registerFxLayer(name, element?)`
- `enableFx`, `disableFx`, `toggleFx`
- `getActiveFx` returns active layer names.

## Layers
See `src/fx/fxLayers.ts` or call `fxLayers.listLayers()`.

| Layer | CSS Class |
| --- | --- |
| confettiLayer | `fx-confetti` |
| snowDriftLayer | `fx-snow-drift` |
| sparkleGlowLayer | `fx-sparkle-glow` |
| papelPicadoLayer | `fx-papel-picado` |
| neonTubeLayer | `fx-neon-tube` |
| stringLightsLayer | `fx-string-lights` |
| goldDustLayer | `macy-gold-dust` |
| snowfallParallaxLayer | `macy-snowflake-parallax` |

## Presets / Themes
- Presets (`premiumSeasonal`, `retailPromo`, `fiestaLatina`, etc.) define background + layer stacks.
- Themes map to presets and add context (Christmas, Posadas, New Year).

## Runtime Hooks
- `fxRuntime.applyPreset('retailPromo')`
- `fxRuntime.applyTheme('posadas')`
- `fxRuntime.autoReduceMotion()` returns boolean.
- `fxRuntime.detectDevice()` detects Tab S9 FE for perf tuning.
- `fxRuntime.attachToPage()` auto applies motion-reduction & device perf.

