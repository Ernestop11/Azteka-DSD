export type AnimationBudget = 'high' | 'medium' | 'low';
export type PerformanceTier = 'high' | 'mid' | 'low';
export type PriceTier = 'A' | 'B' | 'C';

export interface SmartCatalogConfig {
  theme: string;
  preset: string;
  fxLayers: string[];
  backgroundClass: string;
  gridVariant: string;
  animationBudget: AnimationBudget;
  performanceTier: PerformanceTier;
  isTablet: boolean;
  isSamsungTab: boolean;
  effectivePriceTier: PriceTier;
  editorOverrides?: Record<string, unknown>;
}
