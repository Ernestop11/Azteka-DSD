import type { FrameDescriptor, FrameType } from './frameTypes';

export const frameRegistry: Record<FrameType, (context: Record<string, unknown>) => FrameDescriptor> = {
  neonFrame: context => ({
    type: 'neonFrame',
    appliesTo: context.section as string,
    className: 'fx-neon-tube',
  }),
  goldFrame: context => ({
    type: 'goldFrame',
    appliesTo: context.section as string,
    className: 'bg-foil-green',
  }),
  floatingPanelFrame: context => ({
    type: 'floatingPanelFrame',
    appliesTo: context.section as string,
  }),
  festiveFrameOutline: context => ({
    type: 'festiveFrameOutline',
    appliesTo: context.section as string,
    fxLayers: ['fx-papel-picado'],
  }),
};
