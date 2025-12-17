export type FxLayer = {
  name: string;
  className: string;
  intensityOptions?: Array<'low' | 'medium' | 'high'>;
  motionReductionFallback?: string;
};

const base = (name: string, className: string, fallback = 'reduce-opacity'): FxLayer => ({
  name,
  className,
  intensityOptions: ['low', 'medium', 'high'],
  motionReductionFallback: fallback,
});

export const fxLayers: Record<string, FxLayer> = {
  confettiLayer: base('confettiLayer', 'fx-confetti'),
  snowDriftLayer: base('snowDriftLayer', 'fx-snow-drift'),
  sparkleGlowLayer: base('sparkleGlowLayer', 'fx-sparkle-glow'),
  papelPicadoLayer: base('papelPicadoLayer', 'fx-papel-picado'),
  neonTubeLayer: base('neonTubeLayer', 'fx-neon-tube'),
  stringLightsLayer: base('stringLightsLayer', 'fx-string-lights'),
  goldDustLayer: base('goldDustLayer', 'macy-gold-dust'),
  snowfallParallaxLayer: base('snowfallParallaxLayer', 'macy-snowflake-parallax'),
};

export const getLayer = (name: string) => fxLayers[name];
export const listLayers = () => Object.values(fxLayers);
