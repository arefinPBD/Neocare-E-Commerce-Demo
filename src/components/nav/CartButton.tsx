'use client';

import { useCart } from '@/components/cart/CartContext';

export function CartButton({ label }: { label: string }) {
  const { itemCount, openCart } = useCart();

  return (
    <button
      type="button"
      onClick={openCart}
      aria-label={label}
      className="relative flex min-h-11 min-w-11 items-center justify-center rounded-pill text-brand transition-colors duration-[--dur-fast] hover:bg-surface-brand"
    >
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M3 6h2l2.4 12.2a2 2 0 0 0 2 1.8h8.2a2 2 0 0 0 2-1.6L21 8H6" />
        <circle cx="10" cy="21" r="1" />
        <circle cx="17" cy="21" r="1" />
      </svg>
      {itemCount > 0 && (
        <span
          aria-live="polite"
          className="absolute -right-0.5 -top-0.5 flex h-4.5 min-w-4.5 items-center justify-center rounded-full bg-brand px-1 type-small text-[10px] font-semibold text-fg-inverse"
        >
          {itemCount}
        </span>
      )}
    </button>
  );
}
