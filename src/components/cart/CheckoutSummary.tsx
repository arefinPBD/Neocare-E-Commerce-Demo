'use client';

import Image from 'next/image';

import { useCart } from '@/components/cart/CartContext';
import { Button } from '@/components/ui/Button';
import type { Dictionary, Locale } from '@/lib/i18n';
import { lineTotal } from '@/lib/cart';
import { fmtMoney } from '@/lib/numerals';
import { SIZES } from '@/lib/sizes';

/**
 * BUILD_SPEC §6.4 — a static summary, not a payment flow. Non-negotiable 6:
 * nothing here may imply money changed hands or an order was placed.
 */
export function CheckoutSummary({ t, locale }: { t: Dictionary; locale: Locale }) {
  const { items, subtotal } = useCart();

  return (
    <main id="main" className="section-rhythm mx-auto max-w-(--container-content) px-4 md:px-6">
      <h1 className="type-h1 text-fg">{t.checkout.title}</h1>
      <p className="type-body-lg measure mt-4 text-fg-muted">{t.checkout.notLive}</p>

      {items.length === 0 ? (
        <p className="type-body mt-8 text-fg-muted">{t.checkout.emptyCart}</p>
      ) : (
        <div className="mt-8 max-w-lg">
          <h2 className="type-h2 font-semibold text-fg">{t.checkout.orderSummary}</h2>
          <div className="mt-4 divide-y divide-hairline border-y border-hairline">
            {items.map((item) => {
              const size = SIZES.find((row) => row.key === item.sizeKey);
              if (!size) return null;
              return (
                <div key={`${item.sizeKey}:${item.pack}`} className="flex items-center gap-4 py-4">
                  <div className="h-16 w-16 shrink-0 overflow-hidden rounded-soft bg-surface-alt">
                    <Image
                      src={size.image}
                      alt=""
                      width={size.imageW}
                      height={size.imageH}
                      sizes="64px"
                      className="h-16 w-16 object-contain"
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="type-body font-semibold text-fg">
                      {t.sizes.names[item.sizeKey]}
                    </p>
                    <p className="type-small text-fg-muted">
                      {t.cart.packLabel} {item.pack} {t.sizes.packUnit} × {item.quantity}
                    </p>
                  </div>
                  <p className="type-body font-semibold text-fg">
                    {fmtMoney(lineTotal(item), locale)}
                  </p>
                </div>
              );
            })}
          </div>
          <div className="mt-4 flex items-center justify-between type-body">
            <span className="font-semibold text-fg">{t.cart.subtotal}</span>
            <span className="font-semibold text-fg">{fmtMoney(subtotal, locale)}</span>
          </div>
        </div>
      )}

      <Button href={`/${locale}`} variant="secondary" className="mt-8">
        {t.checkout.backToShopping}
      </Button>
    </main>
  );
}
