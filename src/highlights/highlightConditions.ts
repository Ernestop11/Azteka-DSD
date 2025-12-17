import type { HighlightSuggestion } from './highlightTypes';

type Condition = {
  profile?: string;
  season?: string;
  suggestion: HighlightSuggestion;
};

export const highlightConditions: Condition[] = [
  {
    profile: 'Deal Hunter',
    suggestion: { instruction: 'spotlightSavings', reason: 'user price sensitivity detected' },
  },
  {
    profile: 'Exploration Mode',
    suggestion: { instruction: 'highlightCategories', reason: 'user exploring multiple categories' },
  },
  {
    profile: 'Retail Tourist',
    suggestion: { instruction: 'highlightVisuals', reason: 'user engaged with visuals and stories' },
  },
  {
    season: 'christmas',
    suggestion: { instruction: 'highlightSeasonal', reason: 'seasonal campaign active' },
  },
  {
    profile: 'Value Buyer',
    suggestion: { instruction: 'highlightTierC', reason: 'value tier interest' },
  },
];
