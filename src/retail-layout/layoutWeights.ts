import type { SmartCatalogConfig } from '../smart/types';

export type WeightMap = Record<string, number>;

export const tierWeights: Record<SmartCatalogConfig['effectivePriceTier'], WeightMap> = {
  A: { WideSpotlight: 3, DualHeroRow: 2, MasonryGrid: 1 },
  B: { WideSpotlight: 2, MasonryGrid: 2, MidPromoRow: 2 },
  C: { MasonryGrid: 3, MidPromoRow: 2, ShoppableStory: 1 },
};

export const performanceWeights: Record<SmartCatalogConfig['performanceTier'], WeightMap> = {
  high: { WideSpotlight: 2, DualHeroRow: 2, ShoppableStory: 2 },
  mid: { MidPromoRow: 2, MasonryGrid: 2 },
  low: { MasonryGrid: 3, MidPromoRow: 2, MasonryLight: 3 },
};

export const seasonalWeights: Record<string, WeightMap> = {
  christmas: { WideSpotlight: 3, MidPromoRow: 2, Showcase: 3 },
  posadas: { Showcase: 3, ShoppableStory: 2, MidPromoRow: 2 },
  summer: { DualHeroRow: 2, WideSpotlight: 1, MasonryGrid: 2 },
  default: { MasonryGrid: 2, MidPromoRow: 2 },
};
