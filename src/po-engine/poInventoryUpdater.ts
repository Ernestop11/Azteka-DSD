// PO Inventory Updater - stub implementation
// TODO: Implement inventory update building from PO

interface InventoryUpdate {
  productId: string
  quantityToAdd: number
}

export const poInventoryUpdater = {
  buildUpdates(items: any[]): InventoryUpdate[] {
    // Stub - no updates
    return []
  }
}
