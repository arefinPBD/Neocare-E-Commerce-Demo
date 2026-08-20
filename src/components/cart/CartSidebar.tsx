'use client';

import { useEffect, useRef } from 'react';

import { CartItemList } from '@/components/cart/CartItemRow';
import { useCart } from '@/components/cart/CartContext';
import { Button } from '@/components/ui/Button';
import type { Dictionary, Locale } from '@/lib/i18n';
import { fmtMoney } from '@/lib/numerals';

/**
 * BUILD_SPEC §6.3 — slide-out drawer, modeled on the reference site's
 * Sheet/CartSidebar: backdrop + panel, item list, subtotal, checkout CTA.
 *
 * §9 a11y: focus-trapped while open (a native <dialog> gives this for free —
 * simpler and more robust than hand-rolling a focus trap), Escape closes it
 * (native <dialog> behaviour), focus returns to the cart button on close.
 *
 * BUILD_SPEC v3.0 §7.1 — the drawer itself is kept: the header cart icon opens
 * a drawer, not a page, and the reference kit has no header-cart pattern to
 * contradict that. Only the internals are restyled, and the row list is now
 * CartItemList, shared verbatim with the cart page (§7.2) so the two surfaces
 * cannot drift apart.
 *
 * The `px-6` on the scroll container is what CartItemList's `-my-6` is
 * cancelling against — see DESIGN.md §3.1.
 */
export function CartSidebar({ t, locale }: { t: Dictionary; locale: Locale }) {
  const { items, itemCount, subtotal, isOpen, closeCart } = useCart();
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (isOpen && !dialog.open) dialog.showModal();
    if (!isOpen && dialog.open) dialog.close();
  }, [isOpen]);

  return (
    <dialog
      ref={dialogRef}
      aria-label={t.cart.title}
      onClose={closeCart}
      onCancel={closeCart}
      onClick={(e) => {
        if (e.target === dialogRef.current) closeCart();
      }}
      className="m-0 h-dvh max-h-none w-full max-w-md border-0 bg-transparent p-0 backdrop:bg-[rgb(0_0_0/.4)] ml-auto"
    >
      <div className="flex h-full flex-col bg-surface">
        <div className="flex items-center justify-between border-b border-hairline px-4 py-4 md:px-6">
          <h2 className="type-h2 font-semibold text-fg">
            {t.cart.title}
            {itemCount > 0 && (
              <span className="type-small ml-2 font-normal text-fg-muted">
                ({itemCount})
              </span>
            )}
          </h2>
          <button
            type="button"
            aria-label={t.cart.close}
            onClick={closeCart}
            className="flex min-h-11 min-w-11 items-center justify-center rounded-pill text-fg transition-colors duration-[--dur-fast] hover:bg-surface-brand"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" aria-hidden="true">
              <path d="M6 6l12 12M18 6L6 18" />
            </svg>
          </button>
        </div>

        {items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-surface-alt">
              {/* §7.1 — the empty-state glyph moves to ink-500. */}
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="text-ink-500">
                <path d="M3 6h2l2.4 12.2a2 2 0 0 0 2 1.8h8.2a2 2 0 0 0 2-1.6L21 8H6" />
                <circle cx="10" cy="21" r="1" />
                <circle cx="17" cy="21" r="1" />
              </svg>
            </div>
            <div>
              <p className="type-body font-semibold text-fg">{t.cart.emptyTitle}</p>
              <p className="type-small mt-1 text-fg-muted">{t.cart.emptyBody}</p>
            </div>
            <button
              type="button"
              onClick={closeCart}
              className="type-small font-semibold text-brand transition-colors duration-[--dur-fast] hover:underline"
            >
              {t.cart.continueShopping}
            </button>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto px-4 py-6 md:px-6">
              <CartItemList items={items} t={t} locale={locale} />
            </div>

            <div className="border-t border-hairline px-4 py-4 md:px-6">
              <div className="flex items-center justify-between type-body">
                <span className="font-semibold text-fg">{t.cart.subtotal}</span>
                <span className="font-semibold text-fg">{fmtMoney(subtotal, locale)}</span>
              </div>
              <p className="type-small mt-1 text-fg-muted">{t.cart.shippingNote}</p>
              <Button href={`/${locale}/checkout`} className="mt-4 w-full" onClick={closeCart}>
                {t.cart.checkout}
              </Button>
              <button
                type="button"
                onClick={closeCart}
                className="mt-3 w-full type-small text-fg-muted transition-colors duration-[--dur-fast] hover:text-fg"
              >
                {t.cart.continueShopping}
              </button>
            </div>
          </>
        )}
      </div>
    </dialog>
  );
}
