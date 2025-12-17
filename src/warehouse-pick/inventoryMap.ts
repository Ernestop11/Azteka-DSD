type BinLocation = {
  binId: string;
  aisle: string;
  level: number;
};

const inventoryMapStore = new Map<string, BinLocation>();

export const inventoryMap = {
  setLocation(productId: string, location: BinLocation) {
    inventoryMapStore.set(productId, location);
  },
  getLocation(productId: string) {
    return inventoryMapStore.get(productId);
  },
};
