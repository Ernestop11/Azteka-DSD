import { aiSignals } from './aiSignals';

export type BehaviorProfile = 'Deal Hunter' | 'Exploration Mode' | 'Repeat Buyer' | 'Retail Tourist';

const scores: Record<BehaviorProfile, number> = {
  'Deal Hunter': 0,
  'Exploration Mode': 0,
  'Repeat Buyer': 0,
  'Retail Tourist': 0,
};

const adjust = (profile: BehaviorProfile, delta = 1) => {
  scores[profile] = (scores[profile] ?? 0) + delta;
};

aiSignals.subscribe('addToCart', () => adjust('Repeat Buyer', 2));
aiSignals.subscribe('productLongView', () => adjust('Exploration Mode', 1));
aiSignals.subscribe('fastScroll', () => adjust('Retail Tourist', 1));
aiSignals.subscribe('seasonalInterest', () => adjust('Retail Tourist', 1));
aiSignals.subscribe('categoryAffinity', () => adjust('Exploration Mode', 1));
aiSignals.subscribe('priceSensitivity', () => adjust('Deal Hunter', 2));

const orderProfiles = (): BehaviorProfile => {
  return (Object.entries(scores).sort((a, b) => b[1] - a[1])[0] ?? ['Deal Hunter'])[0] as BehaviorProfile;
};

export const aiBehaviorModel = {
  getBehaviorProfile(): BehaviorProfile {
    return orderProfiles();
  },
  reset() {
    (Object.keys(scores) as BehaviorProfile[]).forEach(key => {
      scores[key] = 0;
    });
  },
};
