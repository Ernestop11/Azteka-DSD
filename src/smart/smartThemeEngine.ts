import { getPreset } from '../fx/fxPresets';

type ThemeDetectionResult = {
  theme: string;
  season: 'holiday' | 'summer' | 'fall' | 'spring';
  event?: string;
};

const nowDate = () => new Date();

const isBetween = (month: number, start: number, end: number) => month >= start && month <= end;

export const detectHoliday = (): ThemeDetectionResult => {
  const now = nowDate();
  const month = now.getUTCMonth(); // 0-based
  const day = now.getUTCDate();

  if (month === 11 && day >= 16 && day <= 24) {
    return { theme: 'posadas', season: 'holiday', event: 'posadas' };
  }
  if (month === 11) {
    return { theme: 'christmas', season: 'holiday' };
  }
  if (month === 9) {
    return { theme: 'fiestaLatina', season: 'fall', event: 'diaDeMuertos' };
  }
  if (isBetween(month, 4, 7)) {
    return { theme: 'summer', season: 'summer' };
  }
  return { theme: 'backToSchool', season: 'fall' };
};

export const detectEventDays = () => {
  const now = nowDate();
  const month = now.getUTCMonth();
  const day = now.getUTCDate();

  if (month === 10 && day >= 22 && day <= 28) return 'blackFriday';
  if (month === 10 && day >= 29) return 'cyberMonday';
  if (month === 7 && day >= 1 && day <= 15) return 'backToSchool';
  return undefined;
};

export const choosePreset = (timeOfDay: number, season: string, holidayTheme: string) => {
  if (holidayTheme === 'christmas' || holidayTheme === 'posadas') {
    return 'premiumSeasonal';
  }
  if (season === 'summer') {
    return 'retailPromo';
  }
  if (timeOfDay >= 18 || timeOfDay <= 6) {
    return 'walmartBlue';
  }
  return 'speedMode';
};

export const chooseBackground = (theme: string, device: string) => {
  if (theme === 'posadas') return 'bg-latin-fiesta';
  if (theme === 'christmas') return 'bg-holiday-red-deep';
  if (theme === 'summer') return 'bg-summer-splash';
  if (device === 'galaxy-tab-s9-fe') return 'bg-gradient-radial-spotlight';
  return 'bg-retail-orange';
};

export const resolvePresetFromTheme = (theme: string) => {
  const preset = getPreset(theme);
  if (preset) return theme;
  if (theme === 'posadas') return 'fiestaLatina';
  if (theme === 'christmas') return 'premiumSeasonal';
  if (theme === 'summer') return 'retailPromo';
  if (theme === 'backToSchool') return 'walmartBlue';
  return 'speedMode';
};
