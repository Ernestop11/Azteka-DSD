import { preloadImages } from './preloadImages';

export type SectionInfo = {
  id: string;
  imageUrls: string[];
};

const sectionQueue: SectionInfo[] = [];

export const queueSectionPreload = (section: SectionInfo) => {
  sectionQueue.push(section);
};

export const processPreloads = (budget = 2) => {
  const nextSections = sectionQueue.splice(0, budget);
  nextSections.forEach(section => preloadImages(section.imageUrls));
};
