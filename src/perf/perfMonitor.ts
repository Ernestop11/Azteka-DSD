type BlockListener = (duration: number) => void;

const blockListeners: BlockListener[] = [];

export const perfMonitor = {
  observeMainThreadBlocking() {
    if (typeof PerformanceObserver === 'undefined') return;
    const observer = new PerformanceObserver(list => {
      list.getEntries().forEach(entry => {
        if (entry.duration > 16) {
          blockListeners.forEach(listener => listener(entry.duration));
        }
      });
    });
    observer.observe({ entryTypes: ['longtask'] });
  },
  trackAnimationTiming(callback: (timestamp: number) => void) {
    const raf = () => {
      callback(performance.now());
      requestAnimationFrame(raf);
    };
    requestAnimationFrame(raf);
  },
  trackComponentMount(componentName: string, mountCallback: () => void) {
    const start = performance.now();
    mountCallback();
    const duration = performance.now() - start;
    console.info(`[perf] ${componentName} mounted in ${duration.toFixed(2)}ms`);
  },
  onBlock(listener: BlockListener) {
    blockListeners.push(listener);
    return () => {
      const index = blockListeners.indexOf(listener);
      if (index >= 0) blockListeners.splice(index, 1);
    };
  },
};
