type FxPreset = {
  name: string;
  layers: string[];
  backgroundClass?: string;
  notes?: string;
  highPerformance?: boolean;
};

export const fxPresets: Record<string, FxPreset> = {
  premiumSeasonal: {
    name: 'premiumSeasonal',
    backgroundClass: 'bg-holiday-red-deep',
    layers: ['snowDriftLayer', 'sparkleGlowLayer', 'confettiLayer'],
    notes: 'Full holiday stack with deep red gradient + sparkles.',
  },
  retailPromo: {
    name: 'retailPromo',
    backgroundClass: 'bg-retail-orange',
    layers: ['neonTubeLayer', 'stringLightsLayer'],
  },
  walmartBlue: {
    name: 'walmartBlue',
    backgroundClass: 'bg-catalog-blue',
    layers: ['sparkleGlowLayer'],
    highPerformance: true,
  },
  fiestaLatina: {
    name: 'fiestaLatina',
    backgroundClass: 'bg-latin-fiesta',
    layers: ['papelPicadoLayer', 'confettiLayer'],
  },
  wholesaleMode: {
    name: 'wholesaleMode',
    backgroundClass: 'bg-gradient-radial-spotlight',
    layers: [],
    notes: 'No animations; static glossy frames.',
    highPerformance: true,
  },
  speedMode: {
    name: 'speedMode',
    layers: ['goldDustLayer'],
    backgroundClass: 'bg-foil-green',
    notes: 'Minimal GPU impact; only static shimmer.',
    highPerformance: true,
  },
};

export const listPresets = () => Object.values(fxPresets);
export const getPreset = (name: string) => fxPresets[name];
