type CartContext = {
  customerId: string;
  cartProductIds: string[];
};

const usualSkuMap = new Map<string, string[]>();

export const cartAssistEngine = {
  setUsualSkus(customerId: string, skus: string[]) {
    usualSkuMap.set(customerId, skus);
  },
  suggestMissingSkus(context: CartContext) {
    const usual = usualSkuMap.get(context.customerId) ?? [];
    return usual.filter(sku => !context.cartProductIds.includes(sku));
  },
};
