import { pickPathOptimizer } from '../warehouse-pick/pickPathOptimizer';
import { pickBatcher } from '../warehouse-pick/pickBatcher';

export const warehousePickDebugger = {
  logPickPath(request: { orderId: string; productIds: string[] }) {
    console.groupCollapsed('[WarehousePickDebugger]');
    console.log('Pick Path:', pickPathOptimizer.optimize(request));
    console.groupEnd();
  },
  logBatches(orders: { orderId: string; productIds: string[] }[]) {
    console.groupCollapsed('[PickBatchDebugger]');
    console.log('Batches:', pickBatcher.batchOrders(orders));
    console.groupEnd();
  },
};
