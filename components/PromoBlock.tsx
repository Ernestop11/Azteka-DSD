export default function PromoBlock() {
  return (
    <section className="relative flex min-h-[320px] items-center overflow-hidden rounded-2xl bg-gray-900 text-white">
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: 'url(/images/promo-placeholder.jpg)' }}
        aria-hidden
      />
      <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/30 to-transparent" />
      <div className="relative z-10 space-y-4 px-10 py-12">
        <p className="text-sm uppercase tracking-widest text-white/70">Seasonal Spotlight</p>
        <h2 className="text-4xl font-bold leading-tight">
          Headline For The Big Promo Moment
        </h2>
        <p className="max-w-xl text-lg text-white/80">
          Subheadline to tease featured collections or limited-time drops. Replace with
          real merchandising copy.
        </p>
        <button className="inline-flex items-center rounded-full bg-white px-6 py-3 text-sm font-semibold text-gray-900 transition hover:bg-white/90">
          Shop Featured
        </button>
      </div>
    </section>
  )
}
