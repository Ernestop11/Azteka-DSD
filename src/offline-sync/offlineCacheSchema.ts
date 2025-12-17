export interface OfflineCartItem {
  productId: string;
  quantity: number;
}

export interface OfflineCustomerPref {
  customerId: string;
  favoriteCategories: string[];
}

export interface OfflineProductSnapshot {
  id: string;
  name: string;
  price: number;
}

export interface OfflineCacheSchema {
  version: number;
  cart: OfflineCartItem[];
  customerPrefs: OfflineCustomerPref[];
  productSnapshots: OfflineProductSnapshot[];
}
