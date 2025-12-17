import type { CSSProperties } from 'react';
import { Percent } from 'lucide-react';

interface HeroProps {
  enableMacyTheme?: boolean;
  snowfallIntensity?: 'light' | 'medium';
}

const ornamentConfig = [
  { id: 'orn-1', size: 82, top: '10%', left: '-3rem', variant: 'accent', delay: '0s' },
  { id: 'orn-2', size: 56, top: '65%', left: '-2rem', variant: 'default', delay: '1s' },
  { id: 'orn-3', size: 64, top: '18%', right: '-2rem', variant: 'default', delay: '0.5s' },
  { id: 'orn-4', size: 88, bottom: '8%', right: '-3.5rem', variant: 'accent', delay: '1.4s' },
];

export default function Hero({ enableMacyTheme = false, snowfallIntensity = 'light' }: HeroProps) {
  const snowfallClass = snowfallIntensity === 'medium' ? 'macy-snowfall--medium' : 'macy-snowfall--light';

  return (
    <section className="relative isolate overflow-hidden bg-slate-900 text-white shadow-xl">
      <div className="absolute inset-0 hero-grid-overlay" aria-hidden="true" />
      <div className="sparkle-layer sparkle-layer--hero" aria-hidden="true" />
      {enableMacyTheme && (
        <>
          <div className={`macy-snowfall ${snowfallClass}`} aria-hidden="true" />
          {snowfallIntensity === 'medium' && (
            <div className="macy-snowfall macy-snowfall--light" aria-hidden="true" />
          )}
          <div className="macy-snowflake-parallax" aria-hidden="true" />
          <div className="macy-gold-dust" aria-hidden="true" />
          <div className="macy-ribbon-frame" aria-hidden="true" />
          <div className="macy-ornaments-wrapper" aria-hidden="true">
            {ornamentConfig.map((ornament) => (
              <span
                key={ornament.id}
                className={`macy-ornament ${ornament.variant === 'accent' ? 'macy-ornament--accent' : ''}`}
                style={{
                  width: ornament.size,
                  height: ornament.size,
                  top: ornament.top,
                  left: ornament.left,
                  right: ornament.right,
                  bottom: ornament.bottom,
                  animationDelay: ornament.delay,
                }}
              />
            ))}
          </div>
        </>
      )}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-0 left-0 w-80 h-80 bg-amber-300 rounded-full mix-blend-multiply blur-3xl animate-blob" />
        <div className="absolute top-0 right-0 w-[28rem] h-[28rem] bg-rose-400 rounded-full mix-blend-multiply blur-[140px] animate-blob animation-delay-2000" />
        <div className="absolute bottom-[-8rem] left-1/3 w-[30rem] h-[30rem] bg-orange-500 rounded-full mix-blend-multiply blur-3xl animate-blob animation-delay-4000" />
      </div>

      <div className="relative z-10 mx-auto flex max-w-7xl flex-col gap-12 px-6 py-14 tablet:flex-row tablet:items-center tablet:py-20">
        <div className="space-y-6 tablet:max-w-xl">
          <div className="inline-flex items-center gap-2 rounded-full bg-black/30 px-4 py-2 text-xs font-bold uppercase tracking-[0.2em] backdrop-blur">
            Lightning catalog • tablet tuned
          </div>
          <div className="space-y-4 text-pretty">
            <h1 className="text-4xl font-black leading-tight tablet:text-5xl laptop:text-6xl">
              Stock Your Store
              <span className="block bg-gradient-to-r from-amber-200 via-orange-100 to-pink-100 bg-clip-text text-transparent">
                With Bestsellers
              </span>
            </h1>

            <p className="text-lg font-semibold text-white/90 tablet:text-xl">
              Authentic Mexican products your customers crave!
            </p>
          </div>

          <div className="flex flex-wrap gap-4">
            <div className="price-tier" data-tier="premium">
              <span className="text-xs uppercase tracking-wider text-slate-600">Average Order Value</span>
              <span className="text-2xl font-black text-slate-900">$485 / stop</span>
            </div>
            <div className="price-tier" data-tier="elite">
              <span className="text-xs uppercase tracking-wider text-slate-600">Rewards Multiplier</span>
              <span className="text-2xl font-black text-slate-900">2.5x</span>
            </div>
          </div>
        </div>

        <div className="relative hidden w-full flex-1 tablet:block">
          <div className="shimmer-border kenburns-frame shadow-hero-ambient shadow-pulse">
            <div className="absolute inset-0 rounded-[1.75rem] bg-gradient-to-tr from-white/10 via-white/0 to-white/30 opacity-60" aria-hidden="true" />
            <div className="relative rounded-[1.75rem] overflow-hidden">
              <img
                src="https://images.pexels.com/photos/50593/coca-cola-cold-drink-soft-drink-coke-50593.jpeg?auto=compress&cs=tinysrgb&w=1200"
                alt="Premium Products"
                className="kenburns-media"
              />
              <div className="reflection-overlay rounded-[1.75rem]" aria-hidden="true" />
            </div>
          </div>

          <div className="neon-deal-tag shadow-neon-tag" style={{ '--deal-color': '#F97316' } as CSSProperties}>
            <span className="flex items-center gap-1 text-slate-900">
              Flash 15%
              <Percent size={14} />
            </span>
          </div>

          <div className="absolute -bottom-8 left-6 flex items-center gap-4 rounded-2xl bg-white/90 px-6 py-4 text-slate-900 shadow-2xl backdrop-blur">
            <div>
              <p className="text-xs font-semibold text-slate-500">Live Inventory</p>
              <p className="text-3xl font-black leading-none text-slate-900">1,280+</p>
              <p className="text-xs font-bold text-emerald-600">Products stocked</p>
            </div>
          </div>
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-white to-transparent" />
    </section>
  );
}
