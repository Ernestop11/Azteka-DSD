import type { HighlightSuggestion } from './highlightTypes';
import { highlightConditions } from './highlightConditions';
import { aiBehaviorModel } from '../ai-retail/aiBehaviorModel';
import { detectHoliday } from '../smart/smartThemeEngine';
import { perfBudget } from '../perf/perfBudget';

type HighlightInput = {
  performanceTier: string;
};

export const highlightEngine = {
  generate(input?: HighlightInput): HighlightSuggestion[] {
    const profile = aiBehaviorModel.getBehaviorProfile();
    const holiday = detectHoliday();
    const budget = perfBudget.getBudget();

    const suggestions = highlightConditions.filter(condition => {
      if (condition.profile && condition.profile !== profile) return false;
      if (condition.season && condition.season !== holiday.theme) return false;
      return true;
    }).map(condition => condition.suggestion);

    if (budget.animationBudget === 'low') {
      suggestions.push({
        instruction: 'spotlightSavings',
        reason: 'Reducing FX, focusing on value messaging.',
      });
    }

    return suggestions;
  },
};
