import { retailRanker } from '../retail/retailRanker';
import { aiBehaviorModel } from '../ai-retail/aiBehaviorModel';
import { getCustomerProfile } from '../smart/smartCustomerEngine';

export type ShowcasePlan = {
  heroSpotlight: string[];
  trendingRow: string[];
  bundleFocus: string[];
};

export const autoShowcaseEngine = {
  buildShowcase(): ShowcasePlan {
    const ranking = retailRanker.getTrendingProducts();
    const behavior = aiBehaviorModel.getBehaviorProfile();
    const customer = getCustomerProfile();

    const heroSpotlight = ranking.slice(0, 2);
    const trendingRow = ranking.slice(0, 6);
    const bundleFocus =
      behavior === 'Deal Hunter' || customer.tier === 'C'
        ? ranking.slice(0, 4)
        : ranking.slice(2, 6);

    return { heroSpotlight, trendingRow, bundleFocus };
  },
};
