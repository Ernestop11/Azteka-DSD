type BatchInput = {
  orderId: string;
  productIds: string[];
};

export const pickBatcher = {
  batchOrders(orders: BatchInput[]) {
    const batches: BatchInput[][] = [];
    const zoneBuckets = new Map<string, BatchInput[]>();

    orders.forEach(order => {
      const zoneKey = order.productIds.slice(0, 2).sort().join('-');
      if (!zoneBuckets.has(zoneKey)) zoneBuckets.set(zoneKey, []);
      zoneBuckets.get(zoneKey)!.push(order);
    });

    zoneBuckets.forEach(bucket => batches.push(bucket));

    return batches;
  },
};
