import { detectHoliday, detectEventDays } from '../smart/smartThemeEngine';

export const autoSeasonEngine = {
  resolveSeasonalHero() {
    const holiday = detectHoliday();
    const event = detectEventDays();
    return {
      theme: holiday.theme,
      event,
      backgroundClass:
        holiday.theme === 'christmas'
          ? 'bg-holiday-red-deep'
          : holiday.theme === 'posadas'
            ? 'bg-posada-purple'
            : 'bg-summer-splash',
    };
  },
};
