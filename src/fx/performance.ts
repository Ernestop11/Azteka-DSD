const gpuStyle = (element: HTMLElement) => {
  element.style.transform = `${element.style.transform || ''} translateZ(0)`;
  element.style.willChange = 'transform, opacity';
};

export const performanceTools = {
  forceLayer(element: HTMLElement) {
    gpuStyle(element);
  },
  forceTransform(element: HTMLElement, transform = 'translateZ(0)') {
    element.style.transform = transform;
    element.style.willChange = 'transform';
  },
  applyTabS9Optimizations() {
    document.body.classList.add('tab-s9-scroll-boost');
  },
  motionReductionFallback(element: HTMLElement) {
    element.classList.add('motion-safe-animate');
  },
  renderThrottle(callback: () => void, limit = 200) {
    let inThrottle: boolean;
    return () => {
      if (inThrottle) return;
      callback();
      inThrottle = true;
      setTimeout(() => {
        inThrottle = false;
      }, limit);
    };
  },
  animationBudget(maxAnimatedItems = 8) {
    const animated = Array.from(document.querySelectorAll('[data-animated="true"]'));
    animated.slice(maxAnimatedItems).forEach(element => element.removeAttribute('data-animated'));
  },
  gradientFix(element: HTMLElement) {
    element.classList.add('gradient-mobile-fix');
  },
};
