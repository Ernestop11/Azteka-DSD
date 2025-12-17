type SyncAction =
  | { type: 'addToCart'; payload: { productId: string; quantity: number } }
  | { type: 'removeFromCart'; payload: { productId: string } }
  | { type: 'updateQty'; payload: { productId: string; quantity: number } }
  | { type: 'submitOrder'; payload: { cart: Array<{ productId: string; quantity: number }> } };

const queue: SyncAction[] = [];

export const syncQueue = {
  enqueue(action: SyncAction) {
    queue.push(action);
  },
  dequeue() {
    return queue.shift();
  },
  peekAll() {
    return [...queue];
  },
  clear() {
    queue.length = 0;
  },
};
