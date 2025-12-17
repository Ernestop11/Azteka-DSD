import type { SmartCatalogConfig } from '../smart/types';

type FxStack = string[];

export const superFXMap: Record<string, FxStack> = {
  christmas: ['fx-snow-drift', 'fx-sparkle-glow', 'bg-gradient-radial-spotlight'],
  posadas: ['fx-confetti', 'fx-papel-picado', 'bg-posada-purple'],
  summer: ['fx-neon-tube', 'bg-summer-splash'],
  diaDeMuertos: ['fx-papel-picado', 'macy-gold-dust', 'bg-latin-fiesta'],
  default: ['fx-sparkle-glow'],
};

export const mapScenarioToFx = (config: SmartCatalogConfig) => {
  if (config.theme === 'christmas') return superFXMap.christmas;
  if (config.theme === 'posadas') return superFXMap.posadas;
  if (config.theme === 'summer') return superFXMap.summer;
  if (config.theme === 'fiestaLatina') return superFXMap.diaDeMuertos;
  return superFXMap.default;
};
