import { perfBudget } from '../perf/perfBudget';
import { detectPerformanceTier } from '../smart/smartDeviceEngine';

export const superFXBudget = {
  allowFullStack() {
    const perfTier = detectPerformanceTier();
    return perfTier.performanceTier === 'high';
  },
  shouldLimitFX() {
    const budget = perfBudget.getBudget();
    return budget.animationBudget === 'low';
  },
  filterFxStack(stack: string[]) {
    if (this.allowFullStack() && !this.shouldLimitFX()) return stack;
    return stack.filter(layer => !layer.includes('neon'));
  },
};
