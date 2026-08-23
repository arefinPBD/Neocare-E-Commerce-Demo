import Link from 'next/link';

import { ProductCards } from '@/components/product/ProductCards';
import { bestSellers } from '@/lib/catalogue';
import type { Dictionary, Locale } from '@/lib/i18n';

/**
 * BUILD_SPEC v3.1 §5.3a — the homepage shop slot. Four products, one from each
 * item in the header's "Our Products" dropdown, in dropdown order.
 *
 * REPLACES `ShopCta`, which showed the first three diaper sizes and nothing
 * else — three cards from one of four categories, chosen by array position. A
 * visitor who landed on the homepage had no way to learn that adult diapers,
 * baby wipes or face wipes existed without opening the dropdown.
 *
 * The four picks are client-supplied (see `BEST_SELLER_KEYS` in
 * `lib/catalogue.ts`). Non-negotiable 7 bars inventing a figure, and none is
 * invented here: no rank, no units sold, no "#1" badge, no review count. The
 * heading is the client's own claim about their own catalogue. If the client
 * withdraws it, the heading and the four-product list go together — do not
 * keep the heading over a mechanically-chosen list.
 *
 * Layout: four cards divide evenly into both `grid-cols-2` and
 * `sm:grid-cols-4`, so neither breakpoint leaves a dead cell.
 */
export function BestSellers({ t, locale }: { t: Dictionary; locale: Locale }) {
  return (
    <section
      id="shop"
      aria-labelledby="shop-heading"
      className="section-rhythm bg-surface"
    >
      <div className="mx-auto max-w-(--container-content) px-4 md:px-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 id="shop-heading" className="type-h1 text-fg">
              {t.shop.bestSellersTitle}
            </h2>
            <p className="type-body-lg measure mt-2 text-fg-muted">
              {t.shop.bestSellersIntro}
            </p>
          </div>

          <Link
            href={`/${locale}/products`}
            className="inline-flex min-h-11 items-center type-small font-semibold text-brand hover:text-brand-hover hover:underline"
          >
            {t.shop.viewAll}
          </Link>
        </div>

        <ProductCards
          products={bestSellers()}
          t={t}
          locale={locale}
          className="mt-10"
        />
      </div>
    </section>
  );
}
