export default function PromoBanner() {
  return (
    <section className="relative overflow-hidden rounded-2xl border border-rose-100 bg-gradient-to-br from-rose-50 via-white to-rose-100 p-8 shadow-lg">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(244,114,182,0.2),_transparent_60%)]" />
      <div className="relative flex min-h-[260px] flex-col justify-between gap-6 sm:flex-row sm:items-center">
        <div className="space-y-3 text-rose-900">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-rose-500">
            Holiday Edit
          </p>
          <h2 className="text-3xl font-bold">Festive Banner Headline</h2>
          <p className="max-w-md text-rose-700">
            Placeholder copy for an elevated holiday campaign moment. Use this space for
            high-level messaging and promotional details.
          </p>
          <button className="inline-flex items-center rounded-full bg-rose-600 px-5 py-2.5 text-sm font-semibold text-white shadow-rose-200 transition hover:-translate-y-0.5 hover:bg-rose-500">
            Discover Now
          </button>
        </div>
        <div className="relative flex h-48 w-full items-center justify-center overflow-hidden rounded-2xl bg-white/80 shadow-inner sm:w-72">
          <div className="absolute inset-0 animate-pulse bg-gradient-to-br from-rose-100 via-transparent to-rose-100 opacity-70" />
          <p className="relative text-xs uppercase tracking-widest text-rose-400">
            PNG Collage Placeholder
          </p>
        </div>
      </div>
    </section>
  )
}
