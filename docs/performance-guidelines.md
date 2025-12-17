# Performance Guidelines (Tab S9 FE / Mobile)

## GPU Helpers
- `gpu-boost`: forces `translateZ(0)` + `will-change` to keep heavy FX on the GPU.
- `gradient-mobile-fix`: use on gradient-heavy wrappers to stabilize iOS/tablet color bands.
- `tab-s9-scroll-boost`: attach to scroll containers (`div`, `section`) to enable smooth inertial scrolling and stable gutters on Galaxy Tab S9 FE.

```tsx
<div className="tab-s9-scroll-boost overflow-y-auto">
  {/* catalog grid */}
</div>
```

## Motion Reduction
The CSS pack pauses all FX when `prefers-reduced-motion` is enabled. If you create custom animations, wrap them with `motion-safe` utilities or honor the media query.

```tsx
<div className="motion-safe:animate-spin">
  <Icon />
</div>
```

## Layer Budget
- Limit to **two animated overlays** per section; add `gpu-boost` when stacking `fx-confetti` with `fx-string-lights`.
- Prefer `product-pop-hover` over more expensive box-shadows for hover depth.

## Scroll & Paint
- Use `contain: layout paint` via `tab-s9-scroll-boost` to isolate grid repaint costs.
- For marquee/auto-scroll components, keep `marquee-smooth` on wrappers and pause on hover to reduce CPU spikes.
