import { perfScroll } from '../perf/perfScroll';
import { perfBudget } from '../perf/perfBudget';
import { applyPreset } from '../fx/fxRuntime';

export const dynamicUI = {
  init() {
    if (typeof window === 'undefined') return;
    perfScroll.onFastScroll(() => this.autoDisableSnowfall(), 1.5);
  },
  autoDisableSnowfall() {
    applyPreset('speedMode');
  },
  adjustGridDensity() {
    const budget = perfBudget.getBudget();
    if (budget.animationBudget === 'low') {
      document.body.dataset.gridDensity = 'tight';
    } else {
      document.body.dataset.gridDensity = 'comfortable';
    }
  },
  boostDuringCartInteraction() {
    document.body.classList.add('gpu-boost');
  },
};
