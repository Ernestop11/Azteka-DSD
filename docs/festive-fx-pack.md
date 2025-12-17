# Festive FX Pack

Use these utilities to layer holiday FX onto any section without rebuilding components. All classes live in `src/index.css`.

## Layer Classes
| Class | Description | Best Use |
| --- | --- | --- |
| `fx-confetti` | Animated confetti drizzle with blend-mode screen | Hero backgrounds, section separators |
| `fx-snow-drift` | Slow drifting snowflakes (`animate-snowfall` friendly) | Christmas promos, winter bundles |
| `fx-sparkle-glow` | New Year sparkles pulsing via `sparkleTwinkle` | Countdown CTAs, loyalty numbers |
| `fx-papel-picado` | Decorative paper overlay w/ cutout grid | Posada, Día de Muertos storytelling |
| `fx-string-lights` | Twin light strings that glow asynchronously | Header wraps, marquee containers |
| `fx-neon-tube` | Pill-shaped neon label (Chedraui styling) | Price tags, “nuevo” badges |

Each FX layer is pointer-events none, so you can stack them in absolutely positioned wrappers:

```tsx
<section className="relative bg-holiday-red-deep rounded-[2rem] overflow-hidden text-white">
  <div className="fx-confetti" aria-hidden />
  <div className="fx-sparkle-glow" aria-hidden />
  <div className="relative z-10 p-10">
    <p className="fx-neon-tube inline-block text-xs">Noche Buena</p>
    <h2 className="mt-4 text-4xl font-black">Doorbusters en Posadas</h2>
  </div>
</section>
```

### Animation Tokens
Tailwind classes now available:

- `animate-confetti`
- `animate-snow-drift`
- `animate-sparkle-glow`
- `animate-string-lights`
- `animate-neon-pulse`

Example:

```tsx
<div className="bg-posada-purple rounded-2xl p-8 text-white">
  <div className="h-24 w-full rounded-xl bg-white/10 animate-string-lights" />
</div>
```

### Combination Tips
- Layer `fx-papel-picado` over `bg-latin-fiesta` for Día de Muertos cards.
- Use `fx-string-lights` on a `relative` container; its padding accounts for the hanging bulbs.
- Apply `gpu-boost` (from performance pack) when stacking more than two animated layers.
