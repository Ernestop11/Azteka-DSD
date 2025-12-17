# FX Theme System

## Theme vs Preset
- Theme: high-level concept (christmas, posadas, summer).
- Preset: exact combination of layers + backgrounds.

`fxThemes` map theme → preset. Use `listThemes()` to inspect.

## Applying Themes
```ts
import { fxRuntime } from '@/fx';
fxRuntime.applyTheme('posadas');
```

## Theme Metadata
For editors, use `editorHooks.getThemeMetadata()` which returns:
```ts
{
  name: 'posadas',
  preset: { ... },
  description: 'Posada ...'
}
```

## Preset Examples
- `premiumSeasonal`: `bg-holiday-red-deep` + snow + sparkles.
- `wholesaleMode`: static spotlight, no FX.
- `speedMode`: minimal shimmer for low GPU.

## Integration Pattern
1. `fxRuntime.attachToPage()` (once per layout mount).
2. When user selects theme in admin, call `editorHooks.safeApplyTheme(themeName)`.
3. Persist theme name in CMS for runtime hydration.

## Wholesale vs Premium
- Wholesale Mode: use `fxRuntime.applyPreset('wholesaleMode')`.
- Premium Mode: apply `premiumSeasonal` or `fiestaLatina` plus `fxEngine.enableFx` for bonus layers.
