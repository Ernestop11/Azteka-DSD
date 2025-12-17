import { performanceTools } from '../fx/performance';
import { shouldLimitFx } from '../fx/fxObserver';
import { applyPreset } from '../fx/fxRuntime';

let throttled = false;

export const smartPerformanceEngine = {
  monitorFPS() {
    return shouldLimitFx(40);
  },
  throttleFxIfNeeded() {
    if (this.monitorFPS() && !throttled) {
      throttled = true;
      applyPreset('speedMode');
    }
  },
  disableSnowfallOnLowPerf() {
    if (this.monitorFPS()) {
      performanceTools.animationBudget(4);
    }
  },
  autoSwitch() {
    this.throttleFxIfNeeded();
    this.disableSnowfallOnLowPerf();
  },
};
