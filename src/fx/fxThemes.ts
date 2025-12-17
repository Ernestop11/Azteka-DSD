type Theme = {
  name: string;
  preset: string;
  description: string;
};

export const fxThemes: Record<string, Theme> = {
  christmas: {
    name: 'christmas',
    preset: 'premiumSeasonal',
    description: 'Classic holiday treatment with snow + sparkles.',
  },
  posadas: {
    name: 'posadas',
    preset: 'fiestaLatina',
    description: 'Posada-inspired papel picado + fiesta gradient.',
  },
  summer: {
    name: 'summer',
    preset: 'retailPromo',
    description: 'Bright oranges + neon for summer beverage pushes.',
  },
  newYear: {
    name: 'newYear',
    preset: 'premiumSeasonal',
    description: 'Sparkle-heavy, deep red or blue backgrounds.',
  },
  backToSchool: {
    name: 'backToSchool',
    preset: 'walmartBlue',
    description: 'Calm blue gradient with minimal glow.',
  },
};

export const listThemes = () => Object.values(fxThemes);
export const getTheme = (name: string) => fxThemes[name];
