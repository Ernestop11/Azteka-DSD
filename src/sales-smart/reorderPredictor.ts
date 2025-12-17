type ReorderHistory = {
  productId: string;
  frequencyDays: number;
  lastOrderedAt: number;
  avgQuantity: number;
};

const reorderTable = new Map<string, ReorderHistory[]>();

export const reorderPredictor = {
  setHistory(customerId: string, history: ReorderHistory[]) {
    reorderTable.set(customerId, history);
  },
  predict(customerId: string) {
    const history = reorderTable.get(customerId) ?? [];
    const now = Date.now();
    return history.map(item => {
      const daysSince = (now - item.lastOrderedAt) / (1000 * 60 * 60 * 24);
      const dueSoon = daysSince >= item.frequencyDays - 1;
      return {
        productId: item.productId,
        suggestedQuantity: dueSoon ? Math.max(Math.round(item.avgQuantity), 1) : 0,
        dueSoon,
      };
    });
  },
};
