export type HighlightInstruction =
  | 'spotlightSavings'
  | 'highlightCategories'
  | 'highlightTierC'
  | 'highlightVisuals'
  | 'highlightSeasonal';

export interface HighlightSuggestion {
  instruction: HighlightInstruction;
  reason: string;
}
