import { salesBehaviorModel } from './salesBehaviorModel';
import { marginOptimizer } from './marginOptimizer';
import { reorderPredictor } from './reorderPredictor';

type BundleSuggestion = {
  title: string;
  productIds: string[];
  reason: string;
};

export const bundleSuggestor = {
  suggestBundles(customerId: string): BundleSuggestion[] {
    const profile = salesBehaviorModel.getSalesBehaviorProfile(customerId);
    const highMargin = marginOptimizer.getHighMarginProducts(4);
    const reorderDue = reorderPredictor
      .predict(customerId)
      .filter(item => item.dueSoon)
      .map(item => item.productId);

    const suggestions: BundleSuggestion[] = [];

    if (profile === 'Deal Hunter') {
      suggestions.push({
        title: 'Value Bundle',
        productIds: [...reorderDue, ...highMargin].slice(0, 4),
        reason: 'Combining frequently ordered SKUs with high-margin incentives.',
      });
    } else {
      suggestions.push({
        title: 'Seasonal Spotlight',
        productIds: highMargin.slice(0, 3),
        reason: 'Highlighting profitable SKUs aligned with current campaign.',
      });
    }

    return suggestions;
  },
};
