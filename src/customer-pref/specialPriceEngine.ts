import { priceOverrideEngine } from '../sales-smart/priceOverrideEngine';

export const specialPriceEngine = {
  getPrice(product: { id: string; basePrice: number }, customer: { id: string; tier: 'A' | 'B' | 'C' }) {
    return priceOverrideEngine.getEffectivePrice(product, customer);
  },
};
