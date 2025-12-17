export type CardThemeId = 'basic' | 'gradient' | 'splash'

export type CardTheme = {
  id: CardThemeId
  name: 'Basic' | 'Gradient' | 'Splash'
  description: string
  sampleClasses: string
  recommended: boolean
}

export const CARD_THEMES: CardTheme[] = [
  {
    id: 'basic',
    name: 'Basic',
    description: 'Minimal layout with solid background color, ideal for fast menu creation.',
    sampleClasses: 'bg-white text-gray-900 border border-gray-200 shadow-sm',
    recommended: true,
  },
  {
    id: 'gradient',
    name: 'Gradient',
    description: 'Layered gradients perfect for candy aisles, premium packs, or holiday drops.',
    sampleClasses: 'bg-gradient-to-br from-rose-100 via-orange-200 to-amber-200 text-gray-900',
    recommended: true,
  },
  {
    id: 'splash',
    name: 'Splash',
    description: 'Overlay treatment for PNG product collages with playful glow and motion.',
    sampleClasses: 'bg-slate-900 text-white shadow-2xl border border-white/10',
    recommended: false,
  },
]

export const GRADIENT_PRESETS: string[] = [
  'from-amber-200 via-orange-300 to-rose-400',
  'from-lime-200 via-emerald-300 to-teal-400',
  'from-sky-200 via-blue-300 to-indigo-400',
  'from-rose-200 via-pink-200 to-fuchsia-300',
  'from-yellow-200 via-amber-200 to-orange-300',
  'from-red-200 via-rose-300 to-amber-200',
  'from-emerald-200 via-green-300 to-lime-200',
  'from-cyan-200 via-teal-300 to-emerald-300',
  'from-purple-200 via-fuchsia-300 to-pink-300',
  'from-blue-200 via-indigo-300 to-purple-300',
  'from-amber-100 via-lime-200 to-emerald-200',
  'from-pink-100 via-rose-200 to-red-200',
  'from-slate-100 via-gray-200 to-zinc-200',
  'from-orange-100 via-amber-200 to-yellow-200',
  'from-teal-100 via-cyan-200 to-blue-200',
  'from-lime-100 via-amber-100 to-rose-100',
  'from-emerald-100 via-teal-200 to-cyan-200',
]

export type SplashPreset = {
  id: string
  label: string
  hint: string
  sampleOverlay: string
}

export const SPLASH_PRESETS: SplashPreset[] = [
  {
    id: 'paleta-drip',
    label: 'Paleta Drip',
    hint: 'Use for popsicles and frozen treats; upload watercolor drip overlays.',
    sampleOverlay: '/overlays/paleta-drip.png',
  },
  {
    id: 'aguas-splash',
    label: 'Aguas Frescas Splash',
    hint: 'Great for beverages and agua fresca menu cards.',
    sampleOverlay: '/overlays/aguas-frescas.png',
  },
  {
    id: 'dulceria-confetti',
    label: 'Dulcería Confetti',
    hint: 'Candy bursts and confetti overlays for snack bundles.',
    sampleOverlay: '/overlays/dulceria-confetti.png',
  },
  {
    id: 'neon-soda',
    label: 'Neon Soda Burst',
    hint: 'Highlights specialty sodas with neon fizz effects.',
    sampleOverlay: '/overlays/neon-soda.png',
  },
  {
    id: 'tamarind-splash',
    label: 'Tamarind Splash',
    hint: 'Bold tamarind powder splash for spicy candy.',
    sampleOverlay: '/overlays/tamarind-splash.png',
  },
  {
    id: 'sparkling-powder',
    label: 'Sparkling Powder',
    hint: 'Glitter dust overlay for premium bundles.',
    sampleOverlay: '/overlays/sparkling-powder.png',
  },
]

export type GlowPreset = {
  id: string
  label: string
  classes: string
}

export const GLOW_PRESETS: GlowPreset[] = [
  {
    id: 'citrus-pop',
    label: 'Citrus Pop',
    classes: 'shadow-[0_15px_45px_rgba(251,191,36,0.45)] drop-shadow-[0_0_25px_rgba(249,115,22,0.65)]',
  },
  {
    id: 'cool-blue',
    label: 'Cool Blue',
    classes: 'shadow-[0_18px_60px_rgba(59,130,246,0.35)] drop-shadow-[0_0_35px_rgba(14,165,233,0.5)]',
  },
  {
    id: 'sugar-rush',
    label: 'Sugar Rush',
    classes: 'shadow-[0_12px_35px_rgba(236,72,153,0.4)] drop-shadow-[0_0_30px_rgba(244,114,182,0.45)]',
  },
  {
    id: 'botanical',
    label: 'Botanical',
    classes: 'shadow-[0_12px_40px_rgba(34,197,94,0.35)] drop-shadow-[0_0_28px_rgba(16,185,129,0.45)]',
  },
  {
    id: 'midnight',
    label: 'Midnight Glow',
    classes: 'shadow-[0_18px_60px_rgba(15,23,42,0.4)] drop-shadow-[0_0_30px_rgba(59,130,246,0.4)]',
  },
]
