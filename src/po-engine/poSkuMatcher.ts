import { poSupplierMap } from './poSupplierMap';

export type MatchedSku = {
  supplierSku: string;
  internalSku?: string;
  confidence: number;
};

export const poSkuMatcher = {
  match(supplierSku: string): MatchedSku {
    const internal = poSupplierMap.match(supplierSku);
    if (internal) {
      return { supplierSku, internalSku: internal, confidence: 0.95 };
    }
    return { supplierSku, confidence: 0.4 };
  },
};
