import type { SmartCatalogConfig } from '../smart/types';
import type { FrameDescriptor, FrameType } from './frameTypes';
import { frameRegistry } from './frameRegistry';

type BuildContext = {
  layoutPattern: string[];
  fxStack: string[];
  config: SmartCatalogConfig;
};

const frameMap: Record<string, FrameType> = {
  WideSpotlight: 'goldFrame',
  DualHeroRow: 'neonFrame',
  MasonryGrid: 'floatingPanelFrame',
  Showcase: 'festiveFrameOutline',
};

export const frameBuilder = {
  buildFrames(context: BuildContext) {
    return context.layoutPattern.map(section => {
      const frameType = frameMap[section] ?? 'floatingPanelFrame';
      const builder = frameRegistry[frameType];
      return builder({ section, fxStack: context.fxStack, config: context.config });
    }) as FrameDescriptor[];
  },
};
