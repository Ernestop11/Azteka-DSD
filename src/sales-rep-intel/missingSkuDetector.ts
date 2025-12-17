import { repProductMemory } from './repProductMemory';

type CartContext = {
  customerId: string;
  cartSkus: string[];
};

export const missingSkuDetector = {
  detect(context: CartContext) {
    const usuals = repProductMemory.getCustomerUsuals(context.customerId);
    return usuals.filter(sku => !context.cartSkus.includes(sku));
  },
};
