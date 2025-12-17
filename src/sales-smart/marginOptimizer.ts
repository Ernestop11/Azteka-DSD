type MarginRecord = {
  productId: string;
  margin: number;
};

const marginTable = new Map<string, MarginRecord>();

export const marginOptimizer = {
  setMargin(productId: string, margin: number) {
    marginTable.set(productId, { productId, margin });
  },
  getHighMarginProducts(limit = 5) {
    return Array.from(marginTable.values())
      .sort((a, b) => b.margin - a.margin)
      .slice(0, limit)
      .map(record => record.productId);
  },
  shouldRecommend(productId: string, threshold = 0.2) {
    const record = marginTable.get(productId);
    return (record?.margin ?? 0) >= threshold;
  },
};
