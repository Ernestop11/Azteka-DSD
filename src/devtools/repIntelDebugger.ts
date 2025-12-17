import { repRouteRanker } from '../sales-rep-intel/repRouteRanker';
import { repCartAdvisor } from '../sales-rep-intel/repCartAdvisor';

export const repIntelDebugger = {
  logRoute(stops: Parameters<typeof repRouteRanker.rankRoute>[0]) {
    console.groupCollapsed('[RepIntelDebugger]');
    console.log('Ranked Route:', repRouteRanker.rankRoute(stops));
    console.groupEnd();
  },
  logAdvisor(context: Parameters<typeof repCartAdvisor.buildAdvisor>[0]) {
    console.groupCollapsed('[RepIntelAdvisor]');
    console.log('Advisor:', repCartAdvisor.buildAdvisor(context));
    console.groupEnd();
  },
};
