type FPSListener = (fps: number) => void;

const listeners: FPSListener[] = [];
let fpsSamples: number[] = [];
let rafId: number | null = null;

const loop = () => {
  let last = performance.now();
  const step = (now: number) => {
    const delta = now - last;
    last = now;
    const fps = 1000 / delta;
    fpsSamples.push(fps);
    if (fpsSamples.length > 60) fpsSamples = fpsSamples.slice(-60);
    const avg = fpsSamples.reduce((sum, value) => sum + value, 0) / fpsSamples.length;
    listeners.forEach(listener => listener(avg));
    rafId = requestAnimationFrame(step);
  };
  rafId = requestAnimationFrame(step);
};

export const perfFPS = {
  start() {
    if (typeof window === 'undefined' || rafId) return;
    loop();
  },
  stop() {
    if (rafId) cancelAnimationFrame(rafId);
    rafId = null;
  },
  subscribe(listener: FPSListener) {
    listeners.push(listener);
    return () => {
      const index = listeners.indexOf(listener);
      if (index >= 0) listeners.splice(index, 1);
    };
  },
  getAverage() {
    if (!fpsSamples.length) return 60;
    return fpsSamples.reduce((sum, value) => sum + value, 0) / fpsSamples.length;
  },
  onLowFPS(callback: (fps: number) => void, threshold = 40) {
    return this.subscribe(fps => {
      if (fps < threshold) callback(fps);
    });
  },
};
