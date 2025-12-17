import { missingSkuDetector } from './missingSkuDetector';
import { bundleSuggestor } from '../sales-smart/bundleSuggestor';
import { marginOptimizer } from '../sales-smart/marginOptimizer';

type AdvisorContext = {
  customerId: string;
  cartSkus: string[];
};

export const repCartAdvisor = {
  buildAdvisor(context: AdvisorContext) {
    return {
      missingSkus: missingSkuDetector.detect(context),
      bundleSuggestions: bundleSuggestor.suggestBundles(context.customerId),
      highMarginSkus: marginOptimizer.getHighMarginProducts(),
    };
  },
};
