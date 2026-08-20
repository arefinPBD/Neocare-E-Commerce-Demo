'use client';

import { useCart } from '@/components/cart/CartContext';

/**
 * BUILD_SPEC v3.0 §5.2 item 5 — the cart affordance becomes the reference
 * kit's: glyph plus a bare count, not a badge.
 *
 * Before hydration the count is unknown (it lives in localStorage), so instead
 * of rendering nothing and letting the row jump when the number arrives, a
 * skeleton exactly the size of one digit holds the space. §8 sizes it at
 * `h-4 w-3` and fills it with --nc-ink-100, the neutral that reads as absent
 * content rather than as a colour block.
 *
 * The glyph sits at --nc-ink-500, not --nc-ink-300. DESIGN.md §1.5 is explicit
 * about this: a cart icon is a meaningful UI component, WCAG 1.4.11 puts the
 * floor at 3:1, and --nc-ink-300 measures 2.2:1 on white. --nc-ink-500 is
 * 4.6:1.
 *
 * This opens the drawer (§7.1). It does not navigate.
 */
export function CartButton({ label }: { label: string }) {
  const { itemCount, hydrated, openCart } = useCart();

  return (
    <button
      type="button"
      onClick={openCart}
      aria-label={label}
      className="group -m-2 flex min-h-11 items-center p-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
    >
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
        className="h-6 w-6 flex-shrink-0 text-ink-500 transition-colors duration-[--dur-fast] group-hover:text-fg-muted"
      >
        <path d="M3 6h2l2.4 12.2a2 2 0 0 0 2 1.8h8.2a2 2 0 0 0 2-1.6L21 8H6" />
        <circle cx="10" cy="21" r="1" />
        <circle cx="17" cy="21" r="1" />
      </svg>

      {hydrated ? (
        <span
          aria-live="polite"
          className="ml-2 min-w-3 type-small font-semibold text-fg-muted transition-colors duration-[--dur-fast] group-hover:text-fg"
        >
          {itemCount}
        </span>
      ) : (
        <span
          aria-hidden="true"
          className="ml-2 h-4 w-3 rounded-tight bg-ink-100"
        />
      )}
    </button>
  );
}
