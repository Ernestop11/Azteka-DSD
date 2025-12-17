import { retailAnalytics } from './retailAnalytics';

export const retailRanker = {
  getTrendingProducts() {
    const events = retailAnalytics.getEvents().filter(event => event.name === 'click');
    const counts = events.reduce<Record<string, number>>((acc, event) => {
      const id = (event.payload?.productId as string) ?? 'unknown';
      acc[id] = (acc[id] ?? 0) + 1;
      return acc;
    }, {});
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .map(([productId]) => productId);
  },
  selectShowcaseProducts() {
    return this.getTrendingProducts().slice(0, 4);
  },
};
