'use client';

import Image from 'next/image';
import { useCallback, useEffect, useRef, useState } from 'react';

import { useCart } from '@/components/cart/CartContext';
import type { Dictionary, Locale } from '@/lib/i18n';
import { lineTotal, type CartItem } from '@/lib/cart';
import { fmtMoney } from '@/lib/numerals';
import { findProduct, productName } from '@/lib/catalogue';

/**
 * BUILD_SPEC v3.0 §7.1 — one row, shared by the drawer and the cart page.
 *
 * §7.2 says to extract this once and use it in both, so the two surfaces
 * cannot drift. The list wrapper is CartItemList below, which owns the
 * `-my-6 divide-y` that the row's `py-6` depends on.
 *
 * The quantity stepper keeps its v2.1 construction unchanged per §7.1: a
 * rounded-pill group of real <button>s with aria-labels, and aria-live on the
 * value so a change is announced.
 *
 * `animation` is passed in rather than decided here. DESIGN.md §5 is strict
 * that motion on a commerce surface exists only to absorb latency and that an
 * animation not covering a visitor-caused state change should be deleted — so
 * a row that was already in the cart when the page loaded must NOT animate in.
 * CartItemList decides which rows are genuinely new.
 */
export function CartItemRow({
  item,
  t,
  locale,
  animation = '',
  onRemove,
}: {
  item: CartItem;
  t: Dictionary;
  locale: Locale;
  animation?: string;
  onRemove?: () => void;
}) {
  const { setQuantity, removeItem } = useCart();
  const size = findProduct(item.sizeKey);
  if (!size) return null;

  const name = productName(t, size);

  return (
    <li className={`flex py-6 ${animation}`}>
      <div className="hover-zoom size-24 shrink-0 overflow-hidden rounded-tight border border-hairline bg-surface-alt">
        {size.image ? (
          <Image
            src={size.image}
            alt=""
            width={size.imageW}
            height={size.imageH}
            sizes="96px"
            className="size-full object-contain"
          />
        ) : (
          /* §7.1 — a missing thumbnail falls back to the surface box with the
             cart glyph centred in it, at ink-500 rather than ink-300 (WCAG
             1.4.11; DESIGN.md §1.5). */
          <div className="flex size-full items-center justify-center text-ink-500">
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
            >
              <path d="M3 6h2l2.4 12.2a2 2 0 0 0 2 1.8h8.2a2 2 0 0 0 2-1.6L21 8H6" />
              <circle cx="10" cy="21" r="1" />
              <circle cx="17" cy="21" r="1" />
            </svg>
          </div>
        )}
      </div>

      <div className="ml-4 flex flex-1 flex-col">
        <div className="flex justify-between gap-4 type-body font-semibold text-fg">
          <h3 className="min-w-0">{name}</h3>
          <p className="shrink-0">{fmtMoney(lineTotal(item), locale)}</p>
        </div>

        <p className="mt-1 type-small text-fg-muted">
          {t.cart.packLabel} {item.pack} {t.sizes.packUnit}
        </p>

        <div className="mt-4 flex flex-1 items-end justify-between gap-4 type-small">
          <div className="flex items-center gap-2 rounded-pill border border-hairline">
            <button
              type="button"
              aria-label={t.cart.decreaseQty}
              onClick={() =>
                setQuantity(item.sizeKey, item.pack, item.quantity - 1)
              }
              className="flex min-h-9 min-w-9 items-center justify-center type-body font-semibold text-fg transition-colors duration-[--dur-fast] hover:bg-surface-brand"
            >
              −
            </button>
            <span
              className="min-w-4 text-center type-small text-fg"
              aria-live="polite"
            >
              {item.quantity}
            </span>
            <button
              type="button"
              aria-label={t.cart.increaseQty}
              onClick={() =>
                setQuantity(item.sizeKey, item.pack, item.quantity + 1)
              }
              className="flex min-h-9 min-w-9 items-center justify-center type-body font-semibold text-fg transition-colors duration-[--dur-fast] hover:bg-surface-brand"
            >
              +
            </button>
          </div>

          {/* §7.1 / DESIGN.md §6.1 — the inline text button. The gap-2 flex row
              is the spinner slot: if removal ever becomes asynchronous, a
              spinner mounts beside the label without displacing it. It stays
              empty today because removal is a synchronous localStorage write,
              and rendering a spinner that never spins would be theatre. */}
          <button
            type="button"
            onClick={() =>
              onRemove
                ? onRemove()
                : removeItem(item.sizeKey, item.pack)
            }
            className="flex items-center gap-2 font-semibold text-brand transition-colors duration-[--dur-fast] hover:text-brand-hover disabled:opacity-70"
          >
            {t.cart.remove}
          </button>
        </div>
      </div>
    </li>
  );
}

/**
 * The list wrapper. `-my-6` is load-bearing, not decoration: without it the
 * first row sits 24px below the panel edge and the cart list no longer aligns
 * with the summary panel beside it (DESIGN.md §3.1).
 *
 * It also owns the §7.1 enter/exit motion, because it is the only place that
 * can tell a genuinely new row from one that was already there:
 *
 *   - Rows present on the first render are recorded as "seen" during that
 *     render, so nothing animates on page load. Only a row added afterwards —
 *     a visitor-caused state change — gets `cart-row-enter`.
 *   - Removal is deferred by one animation so `cart-row-exit` can play, then
 *     committed. Under prefers-reduced-motion the removal is immediate: the
 *     global rule in globals.css collapses the animation to ~0ms, and waiting
 *     300ms for an invisible animation would just make the UI feel broken.
 */
export function CartItemList({
  items,
  t,
  locale,
}: {
  items: CartItem[];
  t: Dictionary;
  locale: Locale;
}) {
  const { removeItem } = useCart();
  const seen = useRef<Set<string> | null>(null);
  const [exiting, setExiting] = useState<string[]>([]);

  const keyOf = (item: CartItem) => `${item.sizeKey}:${item.pack}`;

  // First render: everything already in the cart counts as seen, so the
  // initial paint is still.
  if (seen.current === null) {
    seen.current = new Set(items.map(keyOf));
  }

  const isNew = (key: string) => !seen.current!.has(key);

  useEffect(() => {
    for (const item of items) seen.current!.add(keyOf(item));
  }, [items]);

  const handleRemove = useCallback(
    (item: CartItem) => {
      const key = keyOf(item);
      const reduced = window.matchMedia(
        '(prefers-reduced-motion: reduce)',
      ).matches;

      if (reduced) {
        removeItem(item.sizeKey, item.pack);
        return;
      }

      setExiting((prev) => [...prev, key]);
      window.setTimeout(() => {
        removeItem(item.sizeKey, item.pack);
        setExiting((prev) => prev.filter((k) => k !== key));
        seen.current!.delete(key);
      }, 300);
    },
    [removeItem],
  );

  return (
    <ul className="-my-6 divide-y divide-hairline">
      {items.map((item) => {
        const key = keyOf(item);
        const animation = exiting.includes(key)
          ? 'cart-row-exit'
          : isNew(key)
            ? 'cart-row-enter'
            : '';

        return (
          <CartItemRow
            key={key}
            item={item}
            t={t}
            locale={locale}
            animation={animation}
            onRemove={() => handleRemove(item)}
          />
        );
      })}
    </ul>
  );
}
