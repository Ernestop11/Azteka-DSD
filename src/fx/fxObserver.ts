type SpotlightCallback = (entry: IntersectionObserverEntry) => void;

const observers: Array<IntersectionObserver> = [];

export const createLazyFxObserver = (className: string, rootMargin = '0px') => {
  if (typeof window === 'undefined') return;
  const observer = new IntersectionObserver(
    entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add(className);
          observer.unobserve(entry.target);
        }
      });
    },
    { rootMargin }
  );

  observers.push(observer);
  return observer;
};

export const createSpotlightObserver = (callback: SpotlightCallback, options?: IntersectionObserverInit) => {
  if (typeof window === 'undefined') return;
  const observer = new IntersectionObserver(entries => entries.forEach(callback), options);
  observers.push(observer);
  return observer;
};

let fpsSamples: number[] = [];

const measureFPS = () => {
  let last = performance.now();
  const step = (now: number) => {
    const delta = now - last;
    last = now;
    fpsSamples.push(1000 / delta);
    if (fpsSamples.length > 60) fpsSamples = fpsSamples.slice(-60);
    requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
};

measureFPS();

export const getAverageFPS = () => {
  if (!fpsSamples.length) return 60;
  return fpsSamples.reduce((acc, val) => acc + val, 0) / fpsSamples.length;
};

export const shouldLimitFx = (threshold = 40) => getAverageFPS() < threshold;

export const disconnectObservers = () => {
  observers.forEach(observer => observer.disconnect());
  observers.length = 0;
};
