import type { SmartCatalogConfig } from '../smart/types';
import { aiBehaviorModel } from './aiBehaviorModel';

export const aiExplain = {
  generate(config: SmartCatalogConfig, context: { fxStack: string[]; layoutPattern: string[] }) {
    const profile = aiBehaviorModel.getBehaviorProfile();
    if (profile === 'Deal Hunter') {
      return 'Showing more bundles because user exhibits Deal Hunter pattern.';
    }
    if (profile === 'Exploration Mode') {
      return 'Adding varied categories due to exploration behavior.';
    }
    if (profile === 'Retail Tourist') {
      return 'Highlighting visuals and Posadas themes for seasonal interest.';
    }
    if (config.animationBudget === 'low') {
      return 'Reduced FX due to performance budget.';
    }
    if (context.layoutPattern.includes('Showcase')) {
      return 'Boosting showcase sections for current seasonal campaign.';
    }
    return 'Applying balanced layout and FX based on current signals.';
  },
};
