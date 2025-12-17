export type FrameType = 'neonFrame' | 'goldFrame' | 'floatingPanelFrame' | 'festiveFrameOutline';

export interface FrameDescriptor {
  type: FrameType;
  appliesTo: string;
  className?: string;
  fxLayers?: string[];
}
