import { retailAnalytics } from '../retail/retailAnalytics';
import { retailRanker } from '../retail/retailRanker';
import { aiBehaviorModel } from './aiBehaviorModel';

type ProductScore = {
  productId: string;
  score: number;
};

export const aiRanker = {
  rankProducts(): ProductScore[] {
    const behavior = aiBehaviorModel.getBehaviorProfile();
    const clickEvents = retailAnalytics.getEvents().filter(event => event.name === 'click');
    const dwellEvents = retailAnalytics.getEvents().filter(event => event.name === 'dwell');

    const scores: Record<string, number> = {};

    clickEvents.forEach(event => {
      const id = (event.payload?.productId as string) ?? 'unknown';
      scores[id] = (scores[id] ?? 0) + 2;
    });

    dwellEvents.forEach(event => {
      const id = (event.payload?.productId as string) ?? 'unknown';
      scores[id] = (scores[id] ?? 0) + 1;
    });

    retailRanker.getTrendingProducts().forEach((productId, index) => {
      scores[productId] = (scores[productId] ?? 0) + Math.max(3 - index, 1);
    });

    Object.keys(scores).forEach(productId => {
      if (behavior === 'Deal Hunter') scores[productId] += 1;
      if (behavior === 'Exploration Mode') scores[productId] += 0.5;
    });

    return Object.entries(scores)
      .map(([productId, score]) => ({ productId, score }))
      .sort((a, b) => b.score - a.score);
  },
};
