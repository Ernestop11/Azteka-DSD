import { listThemes, getTheme } from './fxThemes';
import { listPresets, getPreset } from './fxPresets';
import { applyTheme, applyPreset } from './fxRuntime';

export const listAvailableThemes = () => listThemes();
export const listAvailablePresets = () => listPresets();

export const previewTheme = (themeName: string) => getTheme(themeName);
export const previewPreset = (presetName: string) => getPreset(presetName);

export const safeApplyTheme = (themeName: string) => {
  if (!getTheme(themeName)) return;
  applyTheme(themeName);
};

export const safeApplyPreset = (presetName: string) => {
  if (!getPreset(presetName)) return;
  applyPreset(presetName);
};

export const getThemeMetadata = () =>
  listThemes().map(theme => ({
    ...theme,
    preset: previewPreset(theme.preset),
  }));
