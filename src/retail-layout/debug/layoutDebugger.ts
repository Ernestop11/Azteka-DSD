import type { SmartCatalogConfig } from '../../smart/types';
import { retailSuggestions } from '../../retail/retailSuggestions';
import { perfHeatmap } from '../../perf/perfHeatmap';

export const layoutDebugger = {
  log(config: SmartCatalogConfig, layoutPattern: string[], fxStack: string[]) {
    console.groupCollapsed('[RetailLayoutDebugger]');
    console.log('Theme:', config.theme);
    console.log('Preset:', config.preset);
    console.log('Performance Tier:', config.performanceTier);
    console.log('Animation Budget:', config.animationBudget);
    console.log('Layout Pattern:', layoutPattern);
    console.log('FX Stack:', fxStack);
    console.log('Retail Suggestions:', retailSuggestions.getBundleRecommendations());
    console.log('Heatmap Hotspots:', perfHeatmap.getHotspots());
    console.groupEnd();
  },
};
