import { applySmartMode } from '../smart/smartRules';
import { getCustomerProfile } from '../smart/smartCustomerEngine';
import { perfHeatmap } from '../perf/perfHeatmap';
import { retailLayoutEngine } from '../retail-layout';
import { mapScenarioToFx } from '../superfx/superFXMap';
import { aiBehaviorModel } from './aiBehaviorModel';
import { aiRanker } from './aiRanker';
import { aiExplain } from './aiExplain';
import type { SmartCatalogConfig } from '../smart/types';

export interface AiRetailOutput {
  config: SmartCatalogConfig;
  recommendedLayouts: string[];
  recommendedShowcaseProducts: string[];
  recommendedPromoThemes: string[];
  recommendedFXConfig: string[];
  explanation: string;
}

export const aiRetailEngine = {
  generate(requestContext?: { editorTheme?: string }): AiRetailOutput {
    const config = applySmartMode({ editorTheme: requestContext?.editorTheme });
    const behavior = aiBehaviorModel.getBehaviorProfile();
    const ranked = aiRanker.rankProducts();
    const recommendedLayouts = retailLayoutEngine.generateLayoutPattern(config);
    const recommendedShowcaseProducts = ranked.slice(0, 5).map(item => item.productId);
    const recommendedPromoThemes = [config.theme, behavior];
    const fxStack = mapScenarioToFx(config);
    const explanation = aiExplain.generate(config, {
      fxStack,
      layoutPattern: recommendedLayouts,
    });

    return {
      config,
      recommendedLayouts,
      recommendedShowcaseProducts,
      recommendedPromoThemes,
      recommendedFXConfig: fxStack,
      explanation,
    };
  },
};
