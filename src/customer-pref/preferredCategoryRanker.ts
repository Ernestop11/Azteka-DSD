import { preferenceProfile } from './preferenceProfile';

export const preferredCategoryRanker = {
  rank(customerId: string) {
    const profile = preferenceProfile.getCustomerPreferenceProfile(customerId);
    return profile.favoriteCategories;
  },
};
