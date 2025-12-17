# Smart Theme Logic

## Holiday Detection
- Nov–Dec ⇒ Christmas (`premiumSeasonal`)
- Dec 16–24 ⇒ Posadas (`fiestaLatina`)
- Oct ⇒ Día de Muertos (maps to fiesta gradient)
- May–Aug ⇒ Summer (`retailPromo`)

`smartThemeEngine.detectHoliday()` returns `{ theme, season, event }`.

## Event Days
`detectEventDays()` returns `blackFriday`, `cyberMonday`, `backToSchool` when in range, letting editors trigger special promos.

## Preset Selection
`choosePreset(timeOfDay, season, holiday)` picks different presets based on time & season; editors can override via `editorTheme`.

## Background Overrides
`chooseBackground(theme, device)` ensures Tab S9 FE gets radial spotlight backgrounds; region promos from `smartCustomerEngine` can override final background class.

## Flow
1. Smart rules detect theme → preset → background.
2. Editor override (if provided) takes precedence.
3. `smartPerformanceEngine` may downshift to `speedMode` if FPS is low.
