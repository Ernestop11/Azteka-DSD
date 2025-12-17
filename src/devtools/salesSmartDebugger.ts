import { salesBehaviorModel } from '../sales-smart/salesBehaviorModel';
import { bundleSuggestor } from '../sales-smart/bundleSuggestor';

export const salesSmartDebugger = {
  log(customerId: string) {
    console.groupCollapsed(`[SalesSmartDebugger] ${customerId}`);
    console.log('Behavior Profile:', salesBehaviorModel.getSalesBehaviorProfile(customerId));
    console.log('Bundle Suggestions:', bundleSuggestor.suggestBundles(customerId));
    console.groupEnd();
  },
};
