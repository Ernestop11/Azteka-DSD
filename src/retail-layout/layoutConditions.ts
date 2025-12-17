import type { SmartCatalogConfig } from '../smart/types';

export type LayoutCondition = {
  match: (config: SmartCatalogConfig) => boolean;
  layouts: string[];
};

export const layoutConditions: LayoutCondition[] = [
  {
    match: config => ['premiumSeasonal', 'fiestaLatina'].includes(config.preset),
    layouts: ['Showcase', 'MidPromoRow', 'DualHeroRow'],
  },
  {
    match: config => config.preset === 'speedMode',
    layouts: ['MasonryLight', 'MasonryGrid'],
  },
  {
    match: config => config.theme === 'christmas',
    layouts: ['Showcase', 'WideSpotlight', 'PromoPanels'],
  },
  {
    match: config => config.theme === 'posadas',
    layouts: ['ShoppableStory', 'MidPromoRow'],
  },
  {
    match: config => config.editorOverrides?.newCustomer === true,
    layouts: ['ShoppableStory', 'DualHeroRow'],
  },
];
