/**
 * Offline Cart Management
 *
 * Delta patch system for offline cart synchronization with conflict resolution.
 * Supports optimistic updates and server reconciliation.
 */

import { z } from 'zod';

// ============================================================================
// TYPES & SCHEMAS
// ============================================================================

export const CartItemSchema = z.object({
  product_id: z.number().int().positive(),
  sku: z.string(),
  name: z.string(),
  quantity: z.number().int().positive(),
  price_case: z.number().positive(),
  price_unit: z.number().positive().optional().nullable(),
  added_at: z.date(),
  updated_at: z.date(),
});

export const CartDeltaSchema = z.object({
  operation: z.enum(['add', 'update', 'remove']),
  product_id: z.number().int().positive(),
  quantity: z.number().int().optional(),
  timestamp: z.date(),
  client_id: z.string(), // Unique client identifier
});

export type CartItem = z.infer<typeof CartItemSchema>;
export type CartDelta = z.infer<typeof CartDeltaSchema>;

export interface Cart {
  customer_id: number;
  items: CartItem[];
  last_synced: Date | null;
  pending_deltas: CartDelta[];
}

// ============================================================================
// CART OPERATIONS
// ============================================================================

/**
 * Adds item to cart (creates delta)
 */
export function addToCart(
  cart: Cart,
  product: { id: number; sku: string; name: string; price_case: number; price_unit?: number | null },
  quantity: number,
  clientId: string
): { cart: Cart; delta: CartDelta } {
  const existingIndex = cart.items.findIndex((item) => item.product_id === product.id);

  const delta: CartDelta = {
    operation: existingIndex >= 0 ? 'update' : 'add',
    product_id: product.id,
    quantity: existingIndex >= 0 ? cart.items[existingIndex].quantity + quantity : quantity,
    timestamp: new Date(),
    client_id: clientId,
  };

  const updatedCart = { ...cart };

  if (existingIndex >= 0) {
    updatedCart.items[existingIndex] = {
      ...updatedCart.items[existingIndex],
      quantity: delta.quantity!,
      updated_at: new Date(),
    };
  } else {
    updatedCart.items.push({
      product_id: product.id,
      sku: product.sku,
      name: product.name,
      quantity,
      price_case: product.price_case,
      price_unit: product.price_unit,
      added_at: new Date(),
      updated_at: new Date(),
    });
  }

  updatedCart.pending_deltas.push(delta);

  return { cart: updatedCart, delta };
}

/**
 * Updates cart item quantity
 */
export function updateCartItem(
  cart: Cart,
  productId: number,
  newQuantity: number,
  clientId: string
): { cart: Cart; delta: CartDelta } {
  const itemIndex = cart.items.findIndex((item) => item.product_id === productId);

  if (itemIndex === -1) {
    throw new Error(`Product ${productId} not in cart`);
  }

  const delta: CartDelta = {
    operation: 'update',
    product_id: productId,
    quantity: newQuantity,
    timestamp: new Date(),
    client_id: clientId,
  };

  const updatedCart = { ...cart };
  updatedCart.items[itemIndex] = {
    ...updatedCart.items[itemIndex],
    quantity: newQuantity,
    updated_at: new Date(),
  };

  updatedCart.pending_deltas.push(delta);

  return { cart: updatedCart, delta };
}

/**
 * Removes item from cart
 */
export function removeFromCart(
  cart: Cart,
  productId: number,
  clientId: string
): { cart: Cart; delta: CartDelta } {
  const delta: CartDelta = {
    operation: 'remove',
    product_id: productId,
    timestamp: new Date(),
    client_id: clientId,
  };

  const updatedCart = {
    ...cart,
    items: cart.items.filter((item) => item.product_id !== productId),
    pending_deltas: [...cart.pending_deltas, delta],
  };

  return { cart: updatedCart, delta };
}

// ============================================================================
// DELTA SYNCHRONIZATION
// ============================================================================

/**
 * Applies server deltas to local cart (conflict resolution)
 */
export function applyServerDeltas(
  localCart: Cart,
  serverDeltas: CartDelta[]
): { cart: Cart; conflicts: Array<{ delta: CartDelta; reason: string }> } {
  const conflicts: Array<{ delta: CartDelta; reason: string }> = [];
  let cart = { ...localCart };

  serverDeltas.forEach((serverDelta) => {
    // Check for conflicts
    const localDelta = cart.pending_deltas.find(
      (d) => d.product_id === serverDelta.product_id && d.timestamp > serverDelta.timestamp
    );

    if (localDelta) {
      // Local change is newer, server delta is outdated
      conflicts.push({
        delta: serverDelta,
        reason: 'Local change is newer',
      });
      return;
    }

    // Apply server delta
    switch (serverDelta.operation) {
      case 'add':
      case 'update':
        const itemIndex = cart.items.findIndex((item) => item.product_id === serverDelta.product_id);
        if (itemIndex >= 0) {
          cart.items[itemIndex].quantity = serverDelta.quantity!;
          cart.items[itemIndex].updated_at = serverDelta.timestamp;
        }
        break;

      case 'remove':
        cart.items = cart.items.filter((item) => item.product_id !== serverDelta.product_id);
        break;
    }
  });

  // Mark as synced
  cart.last_synced = new Date();
  cart.pending_deltas = cart.pending_deltas.filter(
    (d) => !serverDeltas.some((sd) => sd.product_id === d.product_id && sd.timestamp >= d.timestamp)
  );

  return { cart, conflicts };
}

/**
 * Generates delta patch to send to server
 */
export function generateDeltaPatch(cart: Cart): CartDelta[] {
  return cart.pending_deltas;
}

/**
 * Clears pending deltas after successful sync
 */
export function clearPendingDeltas(cart: Cart): Cart {
  return {
    ...cart,
    pending_deltas: [],
    last_synced: new Date(),
  };
}

// ============================================================================
// PERSISTENCE
// ============================================================================

const CART_STORAGE_KEY = 'azteka_offline_cart';

/**
 * Saves cart to localStorage
 */
export function saveCartToStorage(cart: Cart): boolean {
  try {
    const serialized = {
      ...cart,
      items: cart.items.map((item) => ({
        ...item,
        added_at: item.added_at.toISOString(),
        updated_at: item.updated_at.toISOString(),
      })),
      pending_deltas: cart.pending_deltas.map((delta) => ({
        ...delta,
        timestamp: delta.timestamp.toISOString(),
      })),
      last_synced: cart.last_synced?.toISOString() || null,
    };

    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(serialized));
    return true;
  } catch (error) {
    console.error('Failed to save cart:', error);
    return false;
  }
}

/**
 * Loads cart from localStorage
 */
export function loadCartFromStorage(): Cart | null {
  try {
    const stored = localStorage.getItem(CART_STORAGE_KEY);
    if (!stored) return null;

    const parsed = JSON.parse(stored);

    return {
      ...parsed,
      items: parsed.items.map((item: any) => ({
        ...item,
        added_at: new Date(item.added_at),
        updated_at: new Date(item.updated_at),
      })),
      pending_deltas: parsed.pending_deltas.map((delta: any) => ({
        ...delta,
        timestamp: new Date(delta.timestamp),
      })),
      last_synced: parsed.last_synced ? new Date(parsed.last_synced) : null,
    };
  } catch (error) {
    console.error('Failed to load cart:', error);
    return null;
  }
}

/**
 * Clears cart from storage
 */
export function clearCartStorage(): boolean {
  try {
    localStorage.removeItem(CART_STORAGE_KEY);
    return true;
  } catch (error) {
    console.error('Failed to clear cart:', error);
    return false;
  }
}
