import type { SmartCatalogConfig } from '../smart/types';
import { mapScenarioToFx } from './superFXMap';
import { superFXBudget } from './superFXBudget';
import { enableFx } from '../fx/fxEngine';

export const superFXMode = {
  apply(config: SmartCatalogConfig) {
    const stack = mapScenarioToFx(config);
    const filtered = superFXBudget.filterFxStack(stack);
    filtered.forEach(layerClass => enableFx(layerClass));
  },
};
