type ReorderEntry = {
  sku: string;
  averageDays: number;
};

const reorderHistory = new Map<string, ReorderEntry[]>();

export const reorderHistoryModel = {
  setHistory(customerId: string, entries: ReorderEntry[]) {
    reorderHistory.set(customerId, entries);
  },
  getHistory(customerId: string) {
    return reorderHistory.get(customerId) ?? [];
  },
};
