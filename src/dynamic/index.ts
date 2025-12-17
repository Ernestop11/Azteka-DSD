import { dynamicUI } from './dynamicUI';
import { retailSuggestions } from '../retail/retailSuggestions';
import { perfBudget } from '../perf/perfBudget';
import { perfHeatmap } from '../perf/perfHeatmap';
import { preloadPredictor } from '../preload/preloadPredictor';

export const useRetailSuggestions = () => retailSuggestions.getBundleRecommendations();
export const usePerformanceBudget = () => perfBudget.getBudget();
export const usePredictivePreload = () => preloadPredictor;
export const useHeatmapAnalytics = () => perfHeatmap;

export { dynamicUI };
