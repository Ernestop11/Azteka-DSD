/**
 * Sales Module - Barrel Exports
 *
 * Clean imports for all sales app functionality.
 *
 * Usage:
 * ```typescript
 * import { resolveProductPricing, addToCart, prepareOrderPayload, calculateCustomerAnalytics } from '@/lib/sales';
 * ```
 */

// Customer Pricing
export {
  resolveProductPricing,
  calculateCartPricing,
  type PriceOverride,
  type Promo,
  type ProductPricing,
  PriceOverrideSchema,
  PromoSchema,
} from './customerPricing';

// Offline Cart
export {
  addToCart,
  updateCartItem,
  removeFromCart,
  applyServerDeltas,
  generateDeltaPatch,
  clearPendingDeltas,
  saveCartToStorage,
  loadCartFromStorage,
  clearCartStorage,
  type Cart,
  type CartItem,
  type CartDelta,
  CartItemSchema,
  CartDeltaSchema,
} from './offlineCart';

// Order Preparation
export {
  prepareOrderPayload,
  validateOrder,
  calculateOrderSummary,
  type OrderItemPayload,
  type OrderPayload,
  OrderItemPayloadSchema,
  OrderPayloadSchema,
} from './orderPreparation';

// Sales Analytics
export {
  calculateCustomerAnalytics,
  calculateRFMScore,
  type OrderHistory,
  type CustomerAnalytics,
  OrderHistorySchema,
} from './salesAnalytics';
