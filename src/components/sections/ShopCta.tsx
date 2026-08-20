import Link from 'next/link';

import { ProductCard } from '@/components/product/ProductCard';
import type { Dictionary, Locale } from '@/lib/i18n';
import { fmtMoney } from '@/lib/numerals';
import { priceRange, SIZES } from '@/lib/sizes';

/**
 * The homepage shop slot, as of v3.0.
 *
 * v2.1 put the full five-product `ProductGrid` here. Measured, that section
 * cost 135vh on desktop and 306vh on mobile to render exactly the five
 * products `/products` already renders, against a 900vh page budget that
 * `NeoCare_Rebuild_Plan.md` §4.2 wrote for a page whose shop slot was a CTA
 * button. See CLAUDE.md Stage 6 for the full attribution.
 *
 * So this keeps a real shopping entry point on the landing page at roughly a
 * third of the height: heading, one line, three tiles, and a link through to
 * the full catalogue. `ProductGrid` is untouched and still renders all five on
 * `/products`, which is where §6.2 wants it.
 *
 * WHICH three: the first three in catalogue order. Deliberately a mechanical
 * rule and not an editorial one — "most popular" or "best selling" would be an
 * invented figure, which §1 non-negotiable 7 forbids outright.
 *
 * Layout: `grid-cols-2 sm:grid-cols-3`, not §6.2's
 * `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3`. Two reasons, and §6.2's grid is
 * untouched on `/products` where it belongs:
 *   - Three tiles in a two-column grid leave an empty cell, which the taste
 *     skill's bento cell-count rule rightly calls a planning error.
 *   - One tile per row on mobile cost 204vh for this section alone. Two-up
 *     brings it to roughly two thirds of that, which is what lands the page
 *     inside its scroll budget on the primary viewport.
 * The card itself and the gap rhythm are §6.1/§6.2 unchanged.
 */
export function ShopCta({ t, locale }: { t: Dictionary; locale: Locale }) {
  const teaser = SIZES.slice(0, 3);

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
              {t.shop.title}
            </h2>
            <p className="type-body-lg measure mt-2 text-fg-muted">
              {t.shop.intro}
            </p>
          </div>

          <Link
            href={`/${locale}/products`}
            className="inline-flex min-h-11 items-center type-small font-semibold text-brand hover:text-brand-hover hover:underline"
          >
            {t.shop.viewAll}
          </Link>
        </div>

        <div className="mt-10 grid grid-cols-2 gap-x-6 gap-y-10 sm:grid-cols-3">
          {teaser.map((size) => {
            const [min, max] = priceRange(size);
            const priceDisplay =
              min === max
                ? fmtMoney(min, locale)
                : `${fmtMoney(min, locale)} – ${fmtMoney(max, locale)}`;

            return (
              <ProductCard
                key={size.key}
                size={size}
                name={t.sizes.names[size.key]}
                priceDisplay={priceDisplay}
                locale={locale}
                quickAddLabel={t.shop.quickAdd}
              />
            );
          })}
        </div>
      </div>
    </section>
  );
}
