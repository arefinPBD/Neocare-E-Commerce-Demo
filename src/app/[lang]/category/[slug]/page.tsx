import { lang } from 'next/root-params';
import { notFound } from 'next/navigation';

import { ProductCards } from '@/components/product/ProductCards';
import {
  CATEGORY_ORDER,
  productsInCategory,
  type CategorySlug,
} from '@/lib/catalogue';
import { getDictionary, isLocale } from '@/lib/i18n';

/**
 * BUILD_SPEC v3.1 §6.2a — the category listing. Every product in the category,
 * including the one the homepage shows as a best seller: this page is the
 * complete list, so nothing is filtered out of it.
 *
 * v3.0 rendered nine invented products behind a "Coming soon" badge with
 * add-to-cart disabled, illustrated with diaper photography, because no real
 * inventory data existed. Real packshots and a real product list now exist for
 * all three categories (§4.3), so the badge, the disabled button and
 * `placeholderCatalogue.ts` are all gone. Prices remain placeholders under
 * §4.1's rule — shown plainly, marked in code — exactly as the diapers are.
 *
 * `brandNote` stays: §4.4 names these products without a brand word while the
 * packshot shows real Aspire, Lumera and Viva packaging, and a visitor is owed
 * that context on the page rather than only in a code comment.
 *
 * "Diapers Line" is not routed here. It has its own page at `/products` with
 * the five-size `ProductGrid`, and `categoryHref` sends it there.
 */
type RoutedCategory = Exclude<CategorySlug, 'diapers'>;

const ROUTED: RoutedCategory[] = CATEGORY_ORDER.filter(
  (c): c is RoutedCategory => c !== 'diapers',
);

export function generateStaticParams() {
  return ROUTED.map((slug) => ({ slug }));
}

export default async function CategoryPage(
  props: PageProps<'/[lang]/category/[slug]'>,
) {
  const { slug } = await props.params;
  const current = await lang();
  if (!current || !isLocale(current)) return null;

  const category = ROUTED.find((c) => c === slug);
  if (!category) notFound();

  const t = getDictionary(current);
  const copy = t.category.items[category];
  const products = productsInCategory(category);

  return (
    <main
      id="main"
      className="section-rhythm mx-auto max-w-(--container-content) px-4 md:px-6"
    >
      <h1 className="type-h1 measure text-fg">{copy.title}</h1>
      <p className="type-body-lg measure mt-4 text-fg-muted">{copy.intro}</p>

      <ProductCards
        products={products}
        t={t}
        locale={current}
        className="mt-10"
      />

      <p className="type-small measure mt-12 text-fg-muted">
        {t.category.brandNote}
      </p>
    </main>
  );
}
