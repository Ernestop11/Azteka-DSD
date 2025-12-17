export type RawLine = {
  sku?: string;
  description?: string;
  quantity?: number;
  price?: number;
};

export const poTextExtractor = {
  normalize(text: string): RawLine[] {
    const lines = text.split('\n').map(line => line.trim()).filter(Boolean);
    return lines.map(line => {
      const parts = line.split(/\s{2,}|\t|,/).map(part => part.trim());
      const [sku, description, quantityStr, priceStr] = parts;
      return {
        sku,
        description,
        quantity: Number(quantityStr) || undefined,
        price: Number(priceStr) || undefined,
      };
    });
  },
};
