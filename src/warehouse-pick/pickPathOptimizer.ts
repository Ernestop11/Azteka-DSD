import { inventoryMap } from './inventoryMap';

type PickRequest = {
  orderId: string;
  productIds: string[];
};

type PickStep = {
  productId: string;
  binId: string;
  aisle: string;
  level: number;
};

export const pickPathOptimizer = {
  optimize(request: PickRequest) {
    const steps: PickStep[] = [];
    request.productIds.forEach(productId => {
      const location = inventoryMap.getLocation(productId);
      if (location) {
        steps.push({ productId, ...location });
      }
    });
    return steps;
  },
};
