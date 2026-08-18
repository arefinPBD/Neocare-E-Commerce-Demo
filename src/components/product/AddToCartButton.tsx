'use client';

import type { ComponentPropsWithoutRef } from 'react';

import { useCart } from '@/components/cart/CartContext';
import type { SizeKey } from '@/lib/sizes';

const VARIANTS = {
  primary: 'bg-brand text-fg-inverse hover:bg-brand-hover',
  secondary:
    'bg-surface text-brand border-[1.5px] border-brand hover:bg-surface-brand',
} as const;

type Variant = keyof typeof VARIANTS;

/**
 * BUILD_SPEC §6 — adds straight to the client-side cart (no navigation, no
 * backend call). `disabled` covers §4.2's placeholder categories, where
 * add-to-cart is intentionally inert until real products exist.
 */
export function AddToCartButton({
  sizeKey,
  pack,
  variant = 'primary',
  className = '',
  disabled = false,
  ...props
}: Omit<ComponentPropsWithoutRef<'button'>, 'type' | 'onClick'> & {
  sizeKey: SizeKey;
  pack: number;
  variant?: Variant;
  disabled?: boolean;
}) {
  const { addItem } = useCart();

  return (
    <button
      {...props}
      type="button"
      disabled={disabled}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        addItem(sizeKey, pack);
      }}
      className={
        'inline-flex min-h-11 min-w-11 items-center justify-center gap-2 rounded-pill px-6 py-3 text-center font-semibold ' +
        'transition-[background-color,transform,filter] duration-[--dur-fast] ease-[--ease-out] active:scale-[.98] ' +
        'disabled:cursor-not-allowed disabled:opacity-50 disabled:active:scale-100 ' +
        `${VARIANTS[variant]} ${className}`
      }
    />
  );
}
