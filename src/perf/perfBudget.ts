import { perfFPS } from './perfFPS';

type BudgetConfig = {
  animationBudget: 'high' | 'medium' | 'low';
  maxActiveFx: number;
};

let currentBudget: BudgetConfig = {
  animationBudget: 'high',
  maxActiveFx: 12,
};

export const perfBudget = {
  getBudget: () => currentBudget,
  setBudget: (budget: BudgetConfig) => {
    currentBudget = budget;
  },
  adjustBasedOnFPS() {
    const fps = perfFPS.getAverage();
    if (fps > 50) {
      currentBudget = { animationBudget: 'high', maxActiveFx: 12 };
    } else if (fps > 35) {
      currentBudget = { animationBudget: 'medium', maxActiveFx: 8 };
    } else {
      currentBudget = { animationBudget: 'low', maxActiveFx: 4 };
    }
  },
};

perfFPS.subscribe(() => perfBudget.adjustBasedOnFPS());
