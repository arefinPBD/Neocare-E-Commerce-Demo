import { ProductCard } from '@/components/product/ProductCard';
import type { Dictionary, Locale } from '@/lib/i18n';
import { fmtMoney } from '@/lib/numerals';
import { priceRange, SIZES } from '@/lib/sizes';

/**
 * BUILD_SPEC §5.2 — the homepage "Shop" section, directly below the hero.
 * Real catalogue: the five diaper sizes as products (§4). Nothing here is a
 * placeholder — prices are the only unconfirmed part (§4.1), and that's
 * marked at the data source, not in this component.
 *
 * §5.2a (v2.1) — heading row is `flex items-end justify-between`, mirroring
 * the reference site's product-grid.tsx (title+intro grouped in one div).
 * No "View all" link: the reference's links through to a larger catalogue
 * behind a `limit`; this grid already renders the entire five-product
 * catalogue, so an identical-list link would be redundant (deliberate
 * omission, not an oversight — see §5.2a).
 */
export function ProductGrid({ t, locale }: { t: Dictionary; locale: Locale }) {
  return (
    <section
      id="shop"
      aria-labelledby="shop-heading"
      className="section-rhythm bg-surface"
    >
      <div className="mx-auto max-w-(--container-content) px-4 md:px-6">
        <div className="flex items-end justify-between">
          <div>
            <h2 id="shop-heading" className="type-h1 text-fg">
              {t.shop.title}
            </h2>
            <p className="type-body-lg mt-2 text-fg-muted">{t.shop.intro}</p>
          </div>
        </div>

        <div className="mt-10 grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
          {SIZES.map((size) => {
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
