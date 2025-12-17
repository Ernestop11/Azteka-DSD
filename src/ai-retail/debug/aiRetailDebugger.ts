import { aiRetailEngine } from '../aiRetailEngine';
import { retailSuggestions } from '../../retail/retailSuggestions';
import { perfBudget } from '../../perf/perfBudget';
import { retailLayoutEngine } from '../../retail-layout';
import { aiBehaviorModel } from '../aiBehaviorModel';

export const aiRetailDebugger = {
  log() {
    const plan = aiRetailEngine.generate();
    const layoutPattern = retailLayoutEngine.generateLayoutPattern(plan.config);

    console.groupCollapsed('[AI Retail Debugger]');
    console.log('Behavior Profile:', aiBehaviorModel.getBehaviorProfile());
    console.log('Layout Pattern:', layoutPattern);
    console.log('Showcase Picks:', plan.recommendedShowcaseProducts);
    console.log('Promo Themes:', plan.recommendedPromoThemes);
    console.log('FX Stack:', plan.recommendedFXConfig);
    console.log('Performance Budget:', perfBudget.getBudget());
    console.log('Retail Suggestions:', retailSuggestions.getBundleRecommendations());
    console.log('Explanation:', plan.explanation);
    console.groupEnd();
  },
};
