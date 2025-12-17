import type { PriceTier } from '../smart/types';

type OverrideRecord = {
  productId: string;
  customerId: string;
  price: number;
};

const overrideTable = new Map<string, OverrideRecord>();

export const priceOverrideEngine = {
  setOverride(record: OverrideRecord) {
    overrideTable.set(`${record.customerId}:${record.productId}`, record);
  },
  getEffectivePrice(product: { id: string; basePrice: number }, customer: { id: string; tier: PriceTier }) {
    const override = overrideTable.get(`${customer.id}:${product.id}`);
    if (override) return override.price;
    const tierMultiplier = customer.tier === 'A' ? 0.95 : customer.tier === 'C' ? 1.05 : 1;
    return product.basePrice * tierMultiplier;
  },
};
