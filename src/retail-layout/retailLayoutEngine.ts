import type { SmartCatalogConfig } from '../smart/types';
import { layoutConditions } from './layoutConditions';
import { retailLayoutRegistry } from './retailLayoutRegistry';
import { tierWeights, performanceWeights, seasonalWeights } from './layoutWeights';

const pickWeighted = (weights: Record<string, number>) => {
  const entries = Object.entries(weights);
  const total = entries.reduce((acc, [, weight]) => acc + weight, 0);
  const rand = Math.random() * total;
  let cumulative = 0;
  for (const [key, weight] of entries) {
    cumulative += weight;
    if (rand <= cumulative) return key;
  }
  return entries[0]?.[0];
};

const buildWeightMap = (config: SmartCatalogConfig) => {
  const map: Record<string, number> = {};
  const addWeights = (weights?: Record<string, number>) => {
    if (!weights) return;
    Object.entries(weights).forEach(([key, weight]) => {
      map[key] = (map[key] ?? 0) + weight;
    });
  };

  addWeights(tierWeights[config.effectivePriceTier]);
  addWeights(performanceWeights[config.performanceTier]);
  addWeights(seasonalWeights[config.theme] ?? seasonalWeights.default);
  layoutConditions.forEach(condition => {
    if (condition.match(config)) {
      condition.layouts.forEach(layout => {
        map[layout] = (map[layout] ?? 0) + 2;
      });
    }
  });
  return map;
};

export const retailLayoutEngine = {
  generateLayoutPattern(config: SmartCatalogConfig) {
    const sequence: string[] = [];
    const weights = buildWeightMap(config);
    const budget =
      config.animationBudget === 'high' ? 6 : config.animationBudget === 'medium' ? 4 : 3;
    for (let i = 0; i < budget; i += 1) {
      const choice = pickWeighted(weights);
      if (!choice) break;
      sequence.push(choice);
      weights[choice] = Math.max((weights[choice] ?? 1) - 1, 1);
    }
    return sequence.filter(layout => retailLayoutRegistry[layout]);
  },
};
