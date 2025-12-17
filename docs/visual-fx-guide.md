## Azteka Visual FX System

### Tailwind Tokens
```js
// tailwind.config.js already extended with:
bg-gold-foil, bg-holiday-red, bg-festival-green, bg-promo-blue, bg-posada-stars
shadow-glow-soft, shadow-glow-hard, shadow-glow-edge
animate-shine, animate-retail-bounce
```

### Background Pack Utilities
- `bg-flowing-holiday` – flowing Macy gradient container. Wrap hero/CTA sections.
- `bg-gold-foil` – metallic foil block. Works well for brand reels and VIP promos.
- `festive-icon-scatter` – overlay scatter layer (stack on relative parent).
- `posada-stars` – repeating star field. Combine with `bg-slate-900`.
- `glossy-card-surface` – base for translucent cards (apply `backdrop-blur` if using Tailwind).
- `shine-sweep` – adds pseudo-element sweep; works on any `.relative`.
- `product-pop-hover` – 3D hover pop for product tiles. Apply to card root.

Example:
```tsx
<section className="relative bg-flowing-holiday posada-stars rounded-[2rem] p-8 text-white">
  <div className="shine-sweep glossy-card-surface rounded-[1.5rem] p-6">
    <p className="text-sm uppercase tracking-[0.4em]">Hot Promo</p>
    <h2 className="text-4xl font-black">Holiday Doorbusters</h2>
  </div>
</section>
```

### Layout Templates
See `src/components/layout/CatalogHomeLayout.tsx` for:
- `CatalogHomeLayout` – top-level page frame with hero/promo slots.
- `PromoPanel` – accepts accent variants `holiday-red | festival-green | promo-blue`.
- `ShowcaseRibbonFrame` – curved ribbon hero with CTA and image.
- `CategoryGallery` – festive category grid with edged frame.
- `BrandGoldScroll` – looping gold-card marquee for brand logos.

Usage:
```tsx
<CatalogHomeLayout
  hero={<Hero enableMacyTheme snowfallIntensity="medium" />}
  promos={[
    <PromoPanel key="doorbusters" title="Doorbusters" badge="48h Only">
      <span className="rounded-full bg-white/20 px-3 py-1 text-xs">+25% margins</span>
    </PromoPanel>,
  ]}
  showcase={<ShowcaseRibbonFrame image="/hero.jpg" title="Spotlight" body="Tell a story." />}
  categories={
    <CategoryGallery title="Shop by Category">
      {categories.map(cat => (
        <button key={cat.id} className="shine-sweep rounded-2xl bg-white p-4 text-left shadow-glow-soft product-pop-hover">
          <p className="text-sm font-black text-emerald-600">{cat.name}</p>
          <p className="text-xs text-slate-500">{cat.count} productos</p>
        </button>
      ))}
    </CategoryGallery>
  }
  brands={<BrandGoldScroll brands={featuredBrands} />}/>
```

### Integration Notes for Cursor
1. **Performance**: classes rely on CSS-only gradients/inline SVG; no external images except hero art.
2. **Tablet First**: use `tablet`, `tabletWide`, `laptop` breakpoints from Tailwind extension.
3. **Optional Macy Layer**: `Hero` component accepts `enableMacyTheme` and `snowfallIntensity`.
4. **Marquee Smoothness**: use `marquee-smooth` + `paused` to enable hover pause.
5. **3D Hover**: apply `product-pop-hover` sparingly (cards, brand tags) to avoid GPU flood.
