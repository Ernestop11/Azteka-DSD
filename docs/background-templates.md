# Background Template Pack

Tailwind now exposes the following background utilities. Apply them via `className="bg-..."` and layer FX as needed.

| Class | Palette | Notes |
| --- | --- | --- |
| `bg-retail-orange` | Target/WalmartMX orange gradient | Great for promo rows + CTA buttons |
| `bg-catalog-blue` | Walmart-style deep blues | Use with white text + glow-edge |
| `bg-holiday-red-deep` | Rich holiday reds | Ideal for hero bands |
| `bg-foil-green` | Metallic green foil | Pair with `glossy-card-surface` |
| `bg-posada-purple` | Neon purple Posada gradient | Great for loyalty modules |
| `bg-latin-fiesta` | Multi-color fiesta ribbon | Works under `fx-papel-picado` |
| `bg-gradient-radial-spotlight` | Radial spotlight fade | Use for hero + product focus |
| `bg-summer-splash` | Summer tropical gradient | Seasonal boards / beverage focus |

## Wrapping Example
```tsx
<section className="relative overflow-hidden rounded-[2rem] bg-retail-orange text-white">
  <div className="fx-sparkle-glow" aria-hidden />
  <div className="relative z-10 p-10 space-y-4">
    <p className="text-xs uppercase tracking-[0.4em]">Retail Ready</p>
    <h2 className="text-4xl font-black">WalmartMX Feature Stack</h2>
  </div>
</section>
```

## Spotlight Wrapper
```tsx
const SpotlightPanel = ({ children }: { children: React.ReactNode }) => (
  <div className="bg-gradient-radial-spotlight rounded-[2.5rem] p-10 text-white shadow-hero-ambient">
    {children}
  </div>
);
```
