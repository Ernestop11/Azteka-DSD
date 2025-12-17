import { preferenceProfile } from '../customer-pref/preferenceProfile';
import { customerSuggestor } from '../customer-pref/customerSuggestor';

export const customerPrefDebugger = {
  log(customerId: string) {
    console.groupCollapsed(`[CustomerPrefDebugger] ${customerId}`);
    console.log('Preference Profile:', preferenceProfile.getCustomerPreferenceProfile(customerId));
    console.log('Suggestions:', customerSuggestor.buildSuggestions(customerId));
    console.groupEnd();
  },
};
