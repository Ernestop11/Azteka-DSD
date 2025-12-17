import { poTextExtractor, RawLine } from './poTextExtractor';

export type ParsedPO = {
  supplier: string;
  items: RawLine[];
};

export const poParser = {
  parse(content: string, supplierHint?: string): ParsedPO {
    const items = poTextExtractor.normalize(content).filter(item => item.sku && item.quantity);
    return {
      supplier: supplierHint ?? 'unknown',
      items,
    };
  },
};
