import { preferenceProfile } from './preferenceProfile';
import { preferredCategoryRanker } from './preferredCategoryRanker';

export type CustomerSuggestion = {
  title: string;
  description: string;
  category?: string;
};

export const customerSuggestor = {
  buildSuggestions(customerId: string): CustomerSuggestion[] {
    const profile = preferenceProfile.getCustomerPreferenceProfile(customerId);
    const categories = preferredCategoryRanker.rank(customerId);

    const suggestions: CustomerSuggestion[] = [
      {
        title: 'Recommended For You',
        description: 'Personalized picks based on your browsing',
        category: categories[0],
      },
    ];

    if (profile.priceSensitivity === 'high') {
      suggestions.push({
        title: 'Value Options',
        description: 'Top savings in your favorite categories',
      });
    }

    return suggestions;
  },
};
