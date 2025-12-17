import { detectPerformanceTier } from '../smart/smartDeviceEngine';
import { queueSectionPreload } from './preloadSections';

type PredictiveContext = {
  sections: Array<{ id: string; top: number; imageUrls: string[] }>;
};

export const preloadPredictor = {
  predictNextSections(context: PredictiveContext, currentScroll: number) {
    const direction = window.scrollY > currentScroll ? 'down' : 'up';
    const viewportHeight = window.innerHeight;

    const nextSections = context.sections.filter(section => {
      if (direction === 'down') {
        return section.top > currentScroll && section.top < currentScroll + viewportHeight * 2;
      }
      return section.top < currentScroll && section.top > currentScroll - viewportHeight * 2;
    });

    const performanceTier = detectPerformanceTier();
    if (performanceTier.performanceTier === 'low') {
      return;
    }
    nextSections.forEach(section =>
      queueSectionPreload({ id: section.id, imageUrls: section.imageUrls })
    );
  },
};
