import type { ReactNode } from 'react';

interface CatalogHomeLayoutProps {
  hero: ReactNode;
  marquee?: ReactNode;
  promos?: ReactNode;
  showcase?: ReactNode;
  categories?: ReactNode;
  brands?: ReactNode;
  footer?: ReactNode;
}

export function CatalogHomeLayout({
  hero,
  marquee,
  promos,
  showcase,
  categories,
  brands,
  footer,
}: CatalogHomeLayoutProps) {
  return (
    <div className="min-h-screen bg-slate-950/95 text-white">
      <section className="relative bg-flowing-holiday posada-stars">
        <div className="relative z-10 mx-auto w-full max-w-6xl px-6 py-14 tabletWide:px-8">
          {hero}
        </div>
      </section>

      {marquee && <section className="bg-slate-900/80 px-4 py-6">{marquee}</section>}

      <section className="bg-white px-4 py-10 text-slate-900">
        <div className="mx-auto grid w-full max-w-6xl gap-4 tablet:grid-cols-2 tabletWide:grid-cols-3">
          {promos}
        </div>
      </section>

      {showcase && (
        <section className="bg-slate-50 px-4 py-12">
          <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 tabletWide:flex-row">
            {showcase}
          </div>
        </section>
      )}

      {categories && (
        <section className="bg-gradient-to-b from-white to-emerald-50 px-4 py-12">
          <div className="mx-auto w-full max-w-6xl">{categories}</div>
        </section>
      )}

      {brands && (
        <section className="bg-gold-foil px-4 py-12">
          <div className="mx-auto w-full max-w-6xl">{brands}</div>
        </section>
      )}

      {footer && <footer className="bg-slate-900 px-4 py-10">{footer}</footer>}
    </div>
  );
}

interface PromoPanelProps {
  title: string;
  subtitle?: string;
  badge?: string;
  accent?: 'holiday-red' | 'festival-green' | 'promo-blue';
  children?: ReactNode;
}

export function PromoPanel({ title, subtitle, badge, accent = 'holiday-red', children }: PromoPanelProps) {
  const accentClass =
    accent === 'festival-green'
      ? 'bg-gradient-to-br from-emerald-600 via-lime-400 to-amber-300'
      : accent === 'promo-blue'
        ? 'bg-gradient-to-br from-slate-900 via-blue-700 to-cyan-400'
        : 'bg-gradient-to-br from-rose-700 via-red-500 to-amber-400';

  return (
    <article className={`shine-sweep relative overflow-hidden rounded-3xl p-6 text-white shadow-glow-soft ${accentClass}`}>
      <div className="absolute inset-0 opacity-30 posada-stars" aria-hidden="true" />
      <div className="relative space-y-4">
        <div className="flex items-center justify-between gap-4">
          <h3 className="text-2xl font-black">{title}</h3>
          {badge && (
            <span className="rounded-full bg-white/20 px-3 py-1 text-xs font-black uppercase tracking-wide">{badge}</span>
          )}
        </div>
        {subtitle && <p className="text-sm text-white/80">{subtitle}</p>}
        <div className="flex flex-wrap gap-3">{children}</div>
      </div>
    </article>
  );
}

interface ShowcaseRibbonProps {
  image: string;
  title: string;
  body: string;
  cta?: ReactNode;
}

export function ShowcaseRibbonFrame({ image, title, body, cta }: ShowcaseRibbonProps) {
  return (
    <div className="relative flex flex-1 flex-col overflow-hidden rounded-[2.5rem] bg-white shadow-glow-edge tabletWide:flex-row tabletWide:items-stretch">
      <div className="absolute -left-10 top-12 h-10 w-[120%] -rotate-6 bg-gradient-to-r from-amber-400 to-rose-400 opacity-80 blur-2xl" />
      <div className="flex flex-1 flex-col gap-6 p-8 tabletWide:flex-row">
        <div className="flex-1 space-y-4">
          <h2 className="text-3xl font-black text-slate-900">{title}</h2>
          <p className="text-base text-slate-600">{body}</p>
          {cta}
        </div>
        <div className="flex-1">
          <div className="shine-sweep overflow-hidden rounded-3xl border border-white/40 bg-slate-900/5">
            <img src={image} alt={title} className="h-full w-full object-cover product-pop-hover" loading="lazy" />
          </div>
        </div>
      </div>
    </div>
  );
}

interface CategoryGalleryProps {
  children: ReactNode;
  title?: string;
  description?: string;
}

export function CategoryGallery({ children, title, description }: CategoryGalleryProps) {
  return (
    <div className="space-y-6">
      {title && (
        <header className="space-y-2 text-center">
          <p className="text-xs font-black uppercase tracking-[0.3em] text-emerald-600">Colecciones</p>
          <h3 className="text-3xl font-black text-slate-900">{title}</h3>
          {description && <p className="text-base text-slate-600">{description}</p>}
        </header>
      )}
      <div className="relative rounded-[2rem] border border-amber-200/60 bg-white/80 p-6 shadow-lg">
        <div className="pointer-events-none absolute inset-0 rounded-[2rem] border border-white/50 opacity-60" />
        <div className="grid gap-4 tablet:grid-cols-2 laptop:grid-cols-3">{children}</div>
      </div>
    </div>
  );
}

interface BrandScrollProps {
  brands: Array<{ id: string; name: string; logo: string; inventory?: string }>;
}

export function BrandGoldScroll({ brands }: BrandScrollProps) {
  return (
    <div className="overflow-hidden rounded-[2rem] bg-gold-foil p-1">
      <div className="marquee-smooth flex gap-6 whitespace-nowrap py-4" style={{ ['--marquee-speed' as string]: '28s' }}>
        {brands.concat(brands).map(brand => (
          <div
            key={`${brand.id}-${Math.random()}`}
            className="product-pop-hover flex min-w-[220px] items-center gap-3 rounded-2xl bg-white/90 px-4 py-3 text-slate-900 shadow-glow-soft"
          >
            <img src={brand.logo} alt={brand.name} className="h-10 w-10 rounded-full object-cover" />
            <div>
              <p className="text-sm font-black">{brand.name}</p>
              {brand.inventory && <p className="text-xs text-slate-500">{brand.inventory}</p>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
