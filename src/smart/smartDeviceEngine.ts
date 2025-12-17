type DeviceProfile = {
  device: string;
  isTablet: boolean;
  isSamsungTab: boolean;
  performanceTier: 'high' | 'mid' | 'low';
};

const getUA = () => (typeof navigator !== 'undefined' ? navigator.userAgent : '');

export const detectSamsungTab = () => /SM-X5\d{2}/i.test(getUA());
export const detectiPad = () => /iPad/.test(getUA());

export const detectLowEndAndroid = () => {
  if (typeof navigator === 'undefined') return false;
  return /Android/.test(navigator.userAgent) && (navigator.hardwareConcurrency ?? 4) <= 4;
};

export const detectPerformanceTier = (): DeviceProfile => {
  const isSamsung = detectSamsungTab();
  const isTablet = isSamsung || detectiPad();
  const lowEnd = detectLowEndAndroid();

  const tier: DeviceProfile['performanceTier'] = lowEnd ? 'low' : isSamsung ? 'mid' : 'high';

  return {
    device: isSamsung ? 'galaxy-tab-s9-fe' : isTablet ? 'tablet' : 'desktop',
    isTablet,
    isSamsungTab: isSamsung,
    performanceTier: tier,
  };
};

export const chooseGrid = (device: string) => {
  if (device === 'galaxy-tab-s9-fe') return 'tablet-wide';
  if (device === 'tablet') return 'tablet';
  return 'desktop';
};

export const chooseAnimationBudget = (performanceTier: DeviceProfile['performanceTier']) => {
  if (performanceTier === 'high') return 'high';
  if (performanceTier === 'mid') return 'medium';
  return 'low';
};
