type CustomerMemory = {
  customerId: string;
  frequentSkus: string[];
};

const memoryStore = new Map<string, CustomerMemory>();

export const repProductMemory = {
  setCustomerUsuals(customerId: string, skus: string[]) {
    memoryStore.set(customerId, { customerId, frequentSkus: skus });
  },
  getCustomerUsuals(customerId: string) {
    return memoryStore.get(customerId)?.frequentSkus ?? [];
  },
};
