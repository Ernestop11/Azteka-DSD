import type { RawLine } from './poTextExtractor';

export type InventoryUpdate = {
  sku: string;
  quantityDelta: number;
};

export const poInventoryUpdater = {
  buildUpdates(items: RawLine[]): InventoryUpdate[] {
    return items
      .filter(item => item.sku && item.quantity)
      .map(item => ({
        sku: item.sku!,
        quantityDelta: item.quantity ?? 0,
      }));
  },
};
