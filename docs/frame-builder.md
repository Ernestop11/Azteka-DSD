# Advanced Frame Builder

## Files
- `src/frames-advanced/frameTypes.ts` — defines `FrameDescriptor`.
- `frameRegistry.ts` — registers `neonFrame`, `goldFrame`, `floatingPanelFrame`, `festiveFrameOutline`.
- `frameBuilder.ts` — builds frame descriptors per layout section, FX stack, and device/theme context.

## Usage
```ts
import { frameBuilder } from '@/frames-advanced';
const frames = frameBuilder.buildFrames({ layoutPattern, fxStack, config });
```

Each descriptor references the frame type and the section it applies to; Cursor can map to actual wrappers without touching components.
