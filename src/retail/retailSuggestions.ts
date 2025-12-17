import { retailSession } from './retailSession';
import { retailRanker } from './retailRanker';

export const retailSuggestions = {
  getBundleRecommendations() {
    const session = retailSession.getSession();
    const trending = retailRanker.getTrendingProducts();
    return {
      region: session.region,
      bundles: trending.slice(0, 3),
    };
  },
};
