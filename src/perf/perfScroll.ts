type ScrollListener = (velocity: number) => void;

const scrollListeners: ScrollListener[] = [];

let lastScrollY = 0;
let lastTime = 0;

const onScroll = () => {
  const now = performance.now();
  const deltaY = Math.abs(window.scrollY - lastScrollY);
  const deltaT = now - lastTime || 16;
  const velocity = deltaY / deltaT;

  scrollListeners.forEach(listener => listener(velocity));
  lastScrollY = window.scrollY;
  lastTime = now;
};

export const perfScroll = {
  start() {
    if (typeof window === 'undefined') return;
    window.addEventListener('scroll', onScroll, { passive: true });
  },
  stop() {
    if (typeof window === 'undefined') return;
    window.removeEventListener('scroll', onScroll);
  },
  onFastScroll(callback: ScrollListener, threshold = 1.2) {
    const listener = (velocity: number) => {
      if (velocity > threshold) callback(velocity);
    };
    scrollListeners.push(listener);
    return () => {
      const index = scrollListeners.indexOf(listener);
      if (index >= 0) scrollListeners.splice(index, 1);
    };
  },
};
