import type { RawLine } from './poTextExtractor';

export type NewProductCandidate = {
  sku: string;
  description: string;
  defaultPrice: number;
  imagePlaceholder: string;
};

const knownSkus = new Set<string>();

export const poNewProductDetector = {
  registerExistingSku(sku: string) {
    knownSkus.add(sku);
  },
  detect(lineItems: RawLine[]): NewProductCandidate[] {
    return lineItems
      .filter(item => item.sku && !knownSkus.has(item.sku))
      .map(item => ({
        sku: item.sku!,
        description: item.description ?? 'New Product',
        defaultPrice: item.price ?? 0,
        imagePlaceholder: '/assets/new-product.png',
      }));
  },
};
