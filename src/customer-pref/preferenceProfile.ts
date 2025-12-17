import { preferenceSignals } from './preferenceSignals';

export type PreferenceProfile = {
  customerId: string;
  favoriteCategories: string[];
  favoriteBrands: string[];
  priceSensitivity: 'high' | 'medium' | 'low';
};

const profileStore = new Map<string, PreferenceProfile>();

const ensureProfile = (customerId: string) => {
  if (!profileStore.has(customerId)) {
    profileStore.set(customerId, {
      customerId,
      favoriteCategories: [],
      favoriteBrands: [],
      priceSensitivity: 'medium',
    });
  }
  return profileStore.get(customerId)!;
};

preferenceSignals.subscribe('likedProduct', payload => {
  const customerId = (payload?.customerId as string) ?? 'anon';
  const category = (payload?.category as string) ?? 'general';
  const profile = ensureProfile(customerId);
  if (!profile.favoriteCategories.includes(category)) {
    profile.favoriteCategories.push(category);
  }
});

preferenceSignals.subscribe('promoInterest', payload => {
  const customerId = (payload?.customerId as string) ?? 'anon';
  const profile = ensureProfile(customerId);
  profile.priceSensitivity = 'high';
});

export const preferenceProfile = {
  getCustomerPreferenceProfile(customerId: string) {
    return ensureProfile(customerId);
  },
};
