import { useEffect, useState } from 'react';
import { applySmartMode } from './smartRules';
import type { SmartCatalogConfig } from './types';

const defaultConfig: SmartCatalogConfig = {
  theme: 'speedMode',
  preset: 'speedMode',
  fxLayers: [],
  backgroundClass: 'bg-retail-orange',
  gridVariant: 'desktop',
  animationBudget: 'medium',
  performanceTier: 'high',
  isTablet: false,
  isSamsungTab: false,
  effectivePriceTier: 'B',
};

type HookOverrides = {
  theme?: string;
  preset?: string;
  backgroundClass?: string;
};

export const useSmartCatalog = (overrides?: HookOverrides) => {
  const [config, setConfig] = useState<SmartCatalogConfig>(defaultConfig);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const result = applySmartMode({ editorTheme: overrides?.theme, overrides });
    setConfig(prev => ({
      ...prev,
      ...result,
      ...(overrides ?? {}),
    }));
  }, [overrides]);

  return config;
};
