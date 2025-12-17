import type { SalesPayload } from './salesSignals';
import { salesSignals } from './salesSignals';

export type SalesBehaviorProfile =
  | 'Weekly Buyer'
  | 'Deal Hunter'
  | 'Routine Buyer'
  | 'Seasonal Buyer'
  | 'Exploration Mode';

type CustomerScores = Record<string, Record<SalesBehaviorProfile, number>>;

const scoreTable: CustomerScores = {};

const ensureCustomer = (customerId: string) => {
  if (!scoreTable[customerId]) {
    scoreTable[customerId] = {
      'Weekly Buyer': 0,
      'Deal Hunter': 0,
      'Routine Buyer': 0,
      'Seasonal Buyer': 0,
      'Exploration Mode': 0,
    };
  }
  return scoreTable[customerId];
};

const adjustScore = (customerId: string, profile: SalesBehaviorProfile, delta = 1) => {
  const table = ensureCustomer(customerId);
  table[profile] = (table[profile] ?? 0) + delta;
};

const extractCustomerId = (payload?: SalesPayload) => (payload?.customerId as string) ?? 'anon';

salesSignals.subscribe('addToCart', payload => adjustScore(extractCustomerId(payload), 'Routine Buyer', 2));
salesSignals.subscribe('removeFromCart', payload => adjustScore(extractCustomerId(payload), 'Exploration Mode', 1));
salesSignals.subscribe('longView', payload => adjustScore(extractCustomerId(payload), 'Exploration Mode', 2));
salesSignals.subscribe('fastScroll', payload => adjustScore(extractCustomerId(payload), 'Seasonal Buyer', 1));
salesSignals.subscribe('reorderClick', payload => adjustScore(extractCustomerId(payload), 'Weekly Buyer', 3));
salesSignals.subscribe('dealInterest', payload => adjustScore(extractCustomerId(payload), 'Deal Hunter', 2));

export const salesBehaviorModel = {
  getSalesBehaviorProfile(customerId: string): SalesBehaviorProfile {
    const table = ensureCustomer(customerId);
    return (Object.entries(table).sort((a, b) => b[1] - a[1])[0] ?? ['Routine Buyer'])[0] as SalesBehaviorProfile;
  },
  reset(customerId?: string) {
    if (customerId) {
      delete scoreTable[customerId];
    } else {
      Object.keys(scoreTable).forEach(key => delete scoreTable[key]);
    }
  },
};
