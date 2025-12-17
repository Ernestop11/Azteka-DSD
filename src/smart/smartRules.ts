import { smartPerformanceEngine } from './smartPerformanceEngine';
import { detectHoliday, detectEventDays, choosePreset, chooseBackground, resolvePresetFromTheme } from './smartThemeEngine';
import { detectPerformanceTier, chooseGrid, chooseAnimationBudget } from './smartDeviceEngine';
import { getCustomerProfile, choosePriceMode, choosePromoByRegion } from './smartCustomerEngine';
import type { SmartCatalogConfig } from './types';

export const applySmartMode = (requestContext?: { editorTheme?: string; overrides?: Record<string, unknown> }): SmartCatalogConfig => {
  const holiday = detectHoliday();
  const event = detectEventDays();
  const deviceProfile = detectPerformanceTier();
  const customer = getCustomerProfile();

  const timeOfDay = new Date().getHours();
  const presetName = requestContext?.editorTheme
    ? resolvePresetFromTheme(requestContext.editorTheme)
    : choosePreset(timeOfDay, holiday.season, holiday.theme);

  const background = chooseBackground(holiday.theme, deviceProfile.device);
  const animationBudget = chooseAnimationBudget(deviceProfile.performanceTier);
  const effectivePriceTier = choosePriceMode(customer.tier);

  const config: SmartCatalogConfig = {
    theme: requestContext?.editorTheme ?? holiday.theme,
    preset: presetName,
    fxLayers: [],
    backgroundClass: requestContext?.editorTheme ? chooseBackground(requestContext.editorTheme, deviceProfile.device) : background,
    gridVariant: chooseGrid(deviceProfile.device),
    animationBudget,
    performanceTier: deviceProfile.performanceTier,
    isTablet: deviceProfile.isTablet,
    isSamsungTab: deviceProfile.isSamsungTab,
    effectivePriceTier,
    editorOverrides: requestContext?.overrides,
  };

  const regionBackground = choosePromoByRegion(customer.region);
  if (regionBackground) {
    config.backgroundClass = regionBackground;
  }

  smartPerformanceEngine.autoSwitch();

  return config;
};
