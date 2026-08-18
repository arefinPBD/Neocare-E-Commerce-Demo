import { lang } from 'next/root-params';
import { notFound } from 'next/navigation';
import Image from 'next/image';

import { getDictionary, isLocale } from '@/lib/i18n';
import { fmtMoney } from '@/lib/numerals';
import { findCategory, PLACEHOLDER_CATEGORIES } from '@/lib/placeholderCatalogue';

/**
 * BUILD_SPEC v2.0 §4.2 — placeholder grids for the three "Our Products"
 * categories with no real inventory yet. Every card is marked "Coming soon"
 * and add-to-cart is a disabled, non-functional button by default (§4.2:
 * do not let a visitor "buy" a product that doesn't exist).
 */
export function generateStaticParams() {
  return PLACEHOLDER_CATEGORIES.map((c) => ({ slug: c.slug }));
}

export default async function CategoryPage(
  props: PageProps<'/[lang]/category/[slug]'>,
) {
  const { slug } = await props.params;
  const current = await lang();
  if (!current || !isLocale(current)) return null;

  const category = findCategory(slug);
  if (!category) notFound();

  const t = getDictionary(current);
  const copy = t.category.items[category.slug];
  const itemCopy = copy.items as Record<string, string>;

  return (
    <main id="main" className="section-rhythm mx-auto max-w-(--container-content) px-4 md:px-6">
      <span className="inline-flex items-center rounded-pill bg-surface-alt px-4 py-2 type-small font-semibold text-fg-muted">
        {t.category.comingSoon}
      </span>
      <h1 className="type-h1 measure mt-4 text-fg">{copy.title}</h1>
      <p className="type-body-lg measure mt-4 text-fg-muted">{copy.intro}</p>

      <div className="mt-10 grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
        {category.items.map((item) => (
          <div key={item.slug}>
            <div className="relative aspect-square overflow-hidden rounded-tight border border-hairline bg-surface-alt">
              <span className="absolute left-3 top-3 z-10 rounded-pill bg-surface px-3 py-1 type-small font-semibold text-fg-muted shadow-card">
                {t.category.comingSoon}
              </span>
              <Image
                src={item.image}
                alt=""
                fill
                sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                className="object-contain p-8"
              />
            </div>
            <div className="mt-3">
              <p className="type-body font-semibold text-fg">
                {itemCopy[item.key]}
              </p>
              <p className="type-body text-fg-muted">{fmtMoney(item.price, current)}</p>
            </div>
            <button
              type="button"
              disabled
              className="mt-3 inline-flex min-h-11 w-full cursor-not-allowed items-center justify-center rounded-pill bg-surface-alt px-6 py-3 type-small font-semibold text-fg-muted"
            >
              {t.category.comingSoon}
            </button>
          </div>
        ))}
      </div>
    </main>
  );
}
