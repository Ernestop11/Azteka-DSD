import { enableFx, clearAllFx } from './fxEngine';
import { getPreset } from './fxPresets';
import { getTheme } from './fxThemes';
import { performanceTools } from './performance';

const bodyBackgroundClasses = new Set<string>();

const applyBackground = (className?: string) => {
  if (typeof document === 'undefined' || !className) return;
  bodyBackgroundClasses.forEach(cls => document.body.classList.remove(cls));
  document.body.classList.add(className);
  bodyBackgroundClasses.clear();
  bodyBackgroundClasses.add(className);
};

const applyPresetLayers = (presetName: string) => {
  const preset = getPreset(presetName);
  if (!preset) return;

  clearAllFx();
  preset.layers.forEach(layer => enableFx(layer));
  applyBackground(preset.backgroundClass);
};

export const applyTheme = (themeName: string) => {
  const theme = getTheme(themeName);
  if (!theme) return;
  applyPreset(theme.preset);
};

export const applyPreset = (presetName: string) => {
  applyPresetLayers(presetName);
};

export const autoReduceMotion = () => {
  if (typeof window === 'undefined') return false;
  const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
  return mediaQuery.matches;
};

export const detectDevice = () => {
  if (typeof navigator === 'undefined') return 'desktop';
  if (/SM-X5\d{2}/i.test(navigator.userAgent)) {
    return 'galaxy-tab-s9-fe';
  }
  if (/Android|iPhone|iPad/i.test(navigator.userAgent)) {
    return 'mobile';
  }
  return 'desktop';
};

export const attachToPage = () => {
  if (autoReduceMotion()) {
    applyPreset('speedMode');
  }
  const device = detectDevice();
  if (device === 'galaxy-tab-s9-fe') {
    performanceTools.applyTabS9Optimizations();
  }
};
