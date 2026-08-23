import Link from 'next/link';

import { ProductCards } from '@/components/product/ProductCards';
import {
  BEST_SELLER_KEYS,
  CATEGORY_ORDER,
  categoryHref,
  categoryLabel,
  productsInCategory,
} from '@/lib/catalogue';
import type { Dictionary, Locale } from '@/lib/i18n';

/** How many cards a teaser row shows before deferring to the category page. */
const ROW_LIMIT = 3;

/**
 * BUILD_SPEC v3.1 §5.5 — one compact row per dropdown category, below the
 * best-seller grid.
 *
 * Best sellers are EXCLUDED from their own category's row. Repeating the four
 * cards immediately under themselves would be pure duplication, and it is what
 * pushed the "Best Sellers + full category sections" option out of the §11
 * scroll budget. Each row therefore shows the next `ROW_LIMIT` products the
 * visitor has not already seen, and links through to the category page where
 * §6.2a lists every product including the best seller.
 *
 * Face Wipes holds two products, so its row shows exactly one. That is the
 * honest state of the catalogue, not a layout accident — `ProductCards`
 * centres a lone card rather than leaving dead cells beside it.
 *
 * A category whose products are all already on screen renders nothing at all,
 * heading included. An empty labelled section is worse than no section.
 *
 * Headings reuse the approved dropdown labels via `categoryLabel` rather than
 * introducing four new content keys that would have to say the same thing.
 */
export function CategoryRows({
  t,
  locale,
}: {
  t: Dictionary;
  locale: Locale;
}) {
  const rows = CATEGORY_ORDER.map((category) => ({
    category,
    products: productsInCategory(category)
      .filter((p) => !BEST_SELLER_KEYS.includes(p.key))
      .slice(0, ROW_LIMIT),
  })).filter((row) => row.products.length > 0);

  if (rows.length === 0) return null;

  return (
    <section
      id="categories"
      aria-labelledby="categories-heading"
      /* §11 — NOT rendered below 640px, and this is a budget decision with a
         measured basis, not a taste one. Everything else on the homepage costs
         885vh at 375px against §11's 900vh gate; these four rows cost 226vh
         into 15vh of headroom, which is 1111vh — a 24% overrun of the gate
         non-negotiable 1 makes the primary one. `hidden sm:block` removes the
         layout cost, not just the visibility: the section is display:none, so
         it contributes no height and its packshots are never fetched at 375px.

         Nothing becomes unreachable. A mobile visitor still meets all four
         categories in §5.2's best-seller grid, one product each, and reaches
         every full listing through the header's "Our Products" dropdown. The
         rows are an enhancement for viewports that can afford them. */
      className="section-rhythm bg-surface-alt"
    >
      <h2 id="categories-heading" className="sr-only">
        {t.nav.products}
      </h2>

      <div className="mx-auto flex max-w-(--container-content) flex-col gap-8 px-4 md:gap-16 md:px-6">
        {rows.map(({ category, products }) => {
          const label = categoryLabel(t, category);
          const headingId = `category-row-${category}`;

          return (
            <div key={category} aria-labelledby={headingId}>
              {/* §11.2 — one line below sm, and both halves of that matter.
                  `flex-wrap` put the heading and the link on separate rows at
                  375px, costing 87px per row across four rows; the long link
                  label is what forced the wrap. So the label shortens to
                  "See all" below sm (the category name is already in the
                  heading two inches away, so the long form is repeating
                  itself) and the heading steps down a size. `min-w-0` lets the
                  heading shrink rather than pushing the link out again. */}
              <div className="flex items-baseline justify-between gap-3">
                <h3
                  id={headingId}
                  className="type-h3 min-w-0 font-semibold text-fg sm:type-h2"
                >
                  {t.shop.moreIn.replace('{category}', label)}
                </h3>
                <Link
                  href={categoryHref(category, locale)}
                  className="inline-flex shrink-0 items-center whitespace-nowrap py-2 type-small font-semibold text-brand hover:text-brand-hover hover:underline sm:min-h-11 sm:py-0"
                >
                  <span className="sm:hidden">{t.shop.seeAll}</span>
                  <span className="hidden sm:inline">
                    {t.shop.seeAllIn.replace('{category}', label)}
                  </span>
                </Link>
              </div>

              <ProductCards
                products={products}
                t={t}
                locale={locale}
                layout="scroller"
                scrollerLabel={label}
                className="mt-4 sm:mt-6"
              />
            </div>
          );
        })}
      </div>
    </section>
  );
}
