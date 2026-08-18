import { SIZES, type SizeKey } from './sizes';

/**
 * BUILD_SPEC §6 — client-side cart only, no backend. An item is identified by
 * its size + pack (Medium's 30-pack and 50-pack are separate line items, same
 * as two different variants would be on a real commerce site).
 */
export interface CartItem {
  sizeKey: SizeKey;
  pack: number;
  quantity: number;
}

export const CART_STORAGE_KEY = 'neocare-cart-v1';

export function lineKey(sizeKey: SizeKey, pack: number): string {
  return `${sizeKey}:${pack}`;
}

export function lineTotal(item: CartItem): number {
  const size = SIZES.find((row) => row.key === item.sizeKey);
  const unitPrice = size?.priceByPack[item.pack] ?? 0;
  return unitPrice * item.quantity;
}

export function subtotal(items: CartItem[]): number {
  return items.reduce((sum, item) => sum + lineTotal(item), 0);
}

export function itemCount(items: CartItem[]): number {
  return items.reduce((sum, item) => sum + item.quantity, 0);
}

/** Type guard for whatever `localStorage` handed back — never trust it blindly. */
export function isCartItem(value: unknown): value is CartItem {
  if (!value || typeof value !== 'object') return false;
  const v = value as Record<string, unknown>;
  return (
    typeof v.sizeKey === 'string' &&
    typeof v.pack === 'number' &&
    typeof v.quantity === 'number' &&
    v.quantity > 0
  );
}
