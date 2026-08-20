'use client';

import Link from 'next/link';

import { CartItemList } from '@/components/cart/CartItemRow';
import { useCart } from '@/components/cart/CartContext';
import type { Dictionary, Locale } from '@/lib/i18n';
import { fmtMoney } from '@/lib/numerals';

/**
 * BUILD_SPEC v3.0 §7.2 — the cart page, on the reference kit's 7/5 layout.
 *
 * `/cart` and `/checkout` are deliberately ONE route, per §7.2's default and
 * confirmed by the client. Splitting them would mean shipping a `/checkout`
 * that exists only to say it does not work.
 *
 * Non-negotiable 6 governs everything below: nothing on this page may imply
 * money changed hands or an order was placed. So the summary panel's CTA slot
 * holds `checkout.notLive` as static copy — NOT a disabled button, which reads
 * as "temporarily unavailable" rather than "not built". There are no form
 * fields and no "Proceed to checkout" button anywhere on this page.
 *
 * Summary rows, per §7.2:
 *   - Subtotal is real, summed through lib/cart.ts.
 *   - Shipping renders `cart.shippingNote` as its VALUE, not a figure.
 *     Non-negotiable 7 forbids a delivery cost the client has not confirmed.
 *   - Total equals subtotal until a real shipping figure exists.
 *   - There is no tax row. No VAT treatment has been confirmed.
 *
 * Muted text inside the panel resolves to --nc-ink-700 automatically via the
 * `.bg-surface-brand` rule in globals.css (DESIGN.md §1.6). Do not hand-set a
 * muted colour in here.
 */
export function CheckoutSummary({
  t,
  locale,
}: {
  t: Dictionary;
  locale: Locale;
}) {
  const { items, subtotal, hydrated } = useCart();

  /* §7.2 asks for a centred "or Continue shopping" link. Rendered as the
     single approved string rather than composed from two: pairing
     checkout.backToShopping with cart.continueShopping produces "Back to
     shopping Continue shopping", and §9 forbids rewording approved copy to
     fit a layout. */
  const continueShopping = (
    <p className="mt-6 text-center type-small">
      <Link
        href={`/${locale}/products`}
        className="font-semibold text-brand transition-colors duration-[--dur-fast] hover:text-brand-hover"
      >
        {t.cart.continueShopping}
      </Link>
    </p>
  );

  return (
    /* §5.3 — the commerce page container, same as the PDP. */
    <main
      id="main"
      className="mx-auto max-w-2xl px-4 pb-16 pt-12 sm:px-6 sm:pb-24 lg:max-w-7xl lg:px-8"
    >
      <h1 className="mb-8 type-h3 font-semibold text-fg">{t.cart.title}</h1>

      {/* lg:items-start is required, or the panel stretches to the list's
          height (DESIGN.md §7.3). */}
      <div className="lg:grid lg:grid-cols-12 lg:items-start lg:gap-x-12 xl:gap-x-16">
        <section aria-labelledby="cart-list-heading" className="lg:col-span-7">
          <h2 id="cart-list-heading" className="sr-only">
            {t.checkout.orderSummary}
          </h2>

          <div className="border-t border-hairline pt-8">
            {/* Before hydration the cart contents are unknown, so neither the
                list nor "your cart is empty" is true yet. §8's skeleton holds
                the row's box until localStorage has been read. */}
            {!hydrated ? (
              <CartRowSkeleton />
            ) : items.length === 0 ? (
              <p className="type-body text-fg-muted">{t.checkout.emptyCart}</p>
            ) : (
              <div className="flow-root">
                <CartItemList items={items} t={t} locale={locale} />
              </div>
            )}
          </div>
        </section>

        <section
          aria-labelledby="summary-heading"
          /* §6.6 / DESIGN.md §4.2 — fill and radius, no shadow. The flatness
             is what makes the panel read as part of the page rather than
             floating over it. Resist adding an elevation. */
          className="mt-16 rounded-soft bg-surface-brand px-6 py-6 sm:p-6 lg:col-span-5 lg:mt-0 lg:p-8"
        >
          <h2 id="summary-heading" className="type-body-lg font-semibold text-fg">
            {t.checkout.orderSummary}
          </h2>

          {/* §6.6 — the CTA slot sits ABOVE the line items. That ordering is
              the kit's and it is deliberate: someone who already knows what
              they want should not have to read past the arithmetic to act.
              Here the slot carries the not-live notice instead of a button. */}
          <p className="mt-6 type-small text-fg-muted">{t.checkout.notLive}</p>

          {hydrated ? (
            <dl className="mt-6 space-y-4">
              <div className="flex items-center justify-between gap-4">
                <dt className="type-small text-fg-muted">{t.cart.subtotal}</dt>
                <dd className="type-small font-semibold text-fg">
                  {fmtMoney(subtotal, locale)}
                </dd>
              </div>

              <div className="flex items-center justify-between gap-4 border-t border-hairline pt-4">
                <dt className="type-small text-fg-muted">
                  {t.cart.shippingLabel}
                </dt>
                {/* A note, not a figure. */}
                <dd className="type-small text-right font-semibold text-fg">
                  {t.cart.shippingNote}
                </dd>
              </div>

              <div className="flex items-center justify-between gap-4 border-t border-hairline pt-4">
                <dt className="type-body font-semibold text-fg">
                  {t.cart.total}
                </dt>
                <dd className="type-body font-semibold text-fg">
                  {fmtMoney(subtotal, locale)}
                </dd>
              </div>
            </dl>
          ) : (
            <OrderSummarySkeleton />
          )}

          {continueShopping}
        </section>
      </div>
    </main>
  );
}

/**
 * BUILD_SPEC v3.0 §8 — a hand-built skeleton matching the real row's box:
 * same list offsets, same thumbnail size, same border and radius, bars at the
 * widths the real content occupies. A skeleton whose box does not match the
 * loaded node causes a layout shift, which costs CLS against §11.
 */
function CartRowSkeleton() {
  return (
    <div className="-my-6 divide-y divide-hairline" aria-hidden="true">
      <div className="flex animate-pulse py-6">
        <div className="size-24 shrink-0 rounded-tight border border-hairline bg-ink-100" />
        <div className="ml-4 flex flex-1 flex-col">
          <div className="flex justify-between gap-4">
            <div className="h-5 w-24 rounded-tight bg-ink-100" />
            <div className="h-5 w-20 rounded-tight bg-ink-100" />
          </div>
          <div className="mt-1 h-4 w-32 rounded-tight bg-ink-100" />
          <div className="mt-4 flex flex-1 items-end justify-between gap-4">
            <div className="h-4 w-16 rounded-tight bg-ink-100" />
            <div className="h-4 w-14 rounded-tight bg-ink-100" />
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * BUILD_SPEC v3.0 §8 — the order-summary skeleton, sized from §8's own bar
 * widths and matching the row boxes above it exactly: same mt-6 space-y-4
 * rhythm, same border-t pt-4 on every row after the first, total row a step
 * taller. Bars are ink-100, the neutral that reads as absent content;
 * bg-surface-brand would read as a deliberate colour block (DESIGN.md §1.5).
 */
function OrderSummarySkeleton() {
  return (
    <div className="mt-6 space-y-4" aria-hidden="true">
      <div className="flex animate-pulse items-center justify-between">
        <div className="h-5 w-24 rounded-tight bg-ink-100" />
        <div className="h-5 w-16 rounded-tight bg-ink-100" />
      </div>
      <div className="flex animate-pulse items-center justify-between border-t border-hairline pt-4">
        <div className="h-5 w-24 rounded-tight bg-ink-100" />
        <div className="h-5 w-16 rounded-tight bg-ink-100" />
      </div>
      <div className="flex animate-pulse items-center justify-between border-t border-hairline pt-4">
        <div className="h-6 w-24 rounded-tight bg-ink-100" />
        <div className="h-6 w-16 rounded-tight bg-ink-100" />
      </div>
    </div>
  );
}
