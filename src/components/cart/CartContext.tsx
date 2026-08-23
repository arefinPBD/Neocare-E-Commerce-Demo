'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

import {
  CART_STORAGE_KEY,
  isCartItem,
  itemCount as computeItemCount,
  lineKey,
  subtotal as computeSubtotal,
  type CartItem,
} from '@/lib/cart';
import type { ProductKey } from '@/lib/catalogue';

interface CartContextValue {
  items: CartItem[];
  itemCount: number;
  /**
   * False until localStorage has been read on the client.
   *
   * BUILD_SPEC v3.0 §5.2 needs this: the header renders a digit-sized skeleton
   * in the count's place before hydration so the row does not shift when the
   * real number arrives. Consumers must not treat `itemCount === 0` as "empty"
   * while this is false — it only means "not read yet".
   */
  hydrated: boolean;
  subtotal: number;
  isOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  addItem: (sizeKey: ProductKey, pack: number, quantity?: number) => void;
  removeItem: (sizeKey: ProductKey, pack: number) => void;
  setQuantity: (sizeKey: ProductKey, pack: number, quantity: number) => void;
}

const CartContext = createContext<CartContextValue | null>(null);

/**
 * BUILD_SPEC §6.1 — a plain React Context backed by localStorage. No server,
 * no database, no payment SDK. Hydration guard mirrors the pattern already
 * used for client-only state elsewhere (e.g. Header's scroll position): read
 * localStorage only after mount, so server and first-paint HTML always agree
 * (an empty cart), and a stored cart appears a moment later without a
 * hydration mismatch.
 */
export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(CART_STORAGE_KEY);
      if (raw) {
        const parsed: unknown = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          setItems(parsed.filter(isCartItem));
        }
      }
    } catch {
      // Corrupt or inaccessible storage: start from an empty cart.
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
    } catch {
      // Storage full/unavailable (private browsing): cart still works for
      // this tab session, it just won't persist across reloads.
    }
  }, [items, hydrated]);

  const addItem = useCallback(
    (sizeKey: ProductKey, pack: number, quantity = 1) => {
      setItems((prev) => {
        const key = lineKey(sizeKey, pack);
        const existing = prev.find((i) => lineKey(i.sizeKey, i.pack) === key);
        if (existing) {
          return prev.map((i) =>
            lineKey(i.sizeKey, i.pack) === key
              ? { ...i, quantity: i.quantity + quantity }
              : i,
          );
        }
        return [...prev, { sizeKey, pack, quantity }];
      });
      setIsOpen(true);
    },
    [],
  );

  const removeItem = useCallback((sizeKey: ProductKey, pack: number) => {
    const key = lineKey(sizeKey, pack);
    setItems((prev) => prev.filter((i) => lineKey(i.sizeKey, i.pack) !== key));
  }, []);

  const setQuantity = useCallback(
    (sizeKey: ProductKey, pack: number, quantity: number) => {
      const key = lineKey(sizeKey, pack);
      if (quantity <= 0) {
        setItems((prev) => prev.filter((i) => lineKey(i.sizeKey, i.pack) !== key));
        return;
      }
      setItems((prev) =>
        prev.map((i) => (lineKey(i.sizeKey, i.pack) === key ? { ...i, quantity } : i)),
      );
    },
    [],
  );

  const value = useMemo<CartContextValue>(
    () => ({
      items,
      itemCount: computeItemCount(items),
      subtotal: computeSubtotal(items),
      hydrated,
      isOpen,
      openCart: () => setIsOpen(true),
      closeCart: () => setIsOpen(false),
      addItem,
      removeItem,
      setQuantity,
    }),
    [items, isOpen, hydrated, addItem, removeItem, setQuantity],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within a CartProvider');
  return ctx;
}
