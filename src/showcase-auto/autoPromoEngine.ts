import { getCustomerProfile } from '../smart/smartCustomerEngine';
import { detectHoliday } from '../smart/smartThemeEngine';

export type PromoCardModel = {
  title: string;
  subtitle: string;
  accentClass: string;
};

export const autoPromoEngine = {
  buildPromos(): PromoCardModel[] {
    const profile = getCustomerProfile();
    const holiday = detectHoliday();
    const promos: PromoCardModel[] = [];

    if (holiday.theme === 'christmas') {
      promos.push({
        title: 'Holiday Doorbusters',
        subtitle: 'Seasonal must-haves for your shoppers',
        accentClass: 'bg-holiday-red-deep',
      });
    }

    if (profile.tier === 'A') {
      promos.push({
        title: 'Premium Partner Perks',
        subtitle: 'Exclusive incentives for top-tier retailers',
        accentClass: 'bg-gradient-radial-spotlight',
      });
    } else if (profile.tier === 'C') {
      promos.push({
        title: 'Value Stack',
        subtitle: 'Maximize margins with curated bundles',
        accentClass: 'bg-retail-orange',
      });
    }

    return promos;
  },
};
