import { lang } from 'next/root-params';
import { notFound } from 'next/navigation';
import Image from 'next/image';

import { AddToCartButton } from '@/components/product/AddToCartButton';
import { getDictionary, isLocale } from '@/lib/i18n';
import { fmt, fmtWeight, fmtMoney } from '@/lib/numerals';
import { findBySlug, SIZES } from '@/lib/sizes';

/* BUILD_SPEC v2.0 §5.2b — static PDP for each of the five real diaper-size
 * products. `slug` is a regular route parameter (not root); `lang` is read
 * as a root parameter per next/root-params. */
export function generateStaticParams() {
  return SIZES.map((s) => ({ slug: s.slug }));
}

export default async function ProductPage(
  props: PageProps<'/[lang]/product/[slug]'>,
) {
  const { slug } = await props.params;
  const current = await lang();
  if (!current || !isLocale(current)) return null;

  const size = findBySlug(slug);
  if (!size) notFound();

  const t = getDictionary(current);
  const name = t.sizes.names[size.key];
  const range = t.sizes.weightRange
    .replace('{min}', fmtWeight(size.min, current))
    .replace('{max}', fmtWeight(size.max, current));

  return (
    <main id="main" className="section-rhythm mx-auto max-w-(--container-content) px-4 md:px-6">
      <div className="grid grid-cols-1 gap-10 md:grid-cols-2 md:gap-12">
        <div className="relative aspect-square overflow-hidden rounded-tight border border-hairline bg-surface-alt">
          <Image
            src={size.image}
            alt={t.sizes.packAlt.replace('{size}', name)}
            fill
            sizes="(min-width: 768px) 50vw, 100vw"
            priority
            className="object-contain p-10"
          />
        </div>

        <div>
          <h1 className="type-h1 text-fg">{name}</h1>
          <p className="type-body-lg mt-2 text-fg-muted">{range}</p>

          {size.packs.length === 1 ? (
            <p className="type-h2 mt-6 font-semibold text-brand">
              {fmtMoney(size.priceByPack[size.packs[0]!]!, current)}
            </p>
          ) : (
            <div className="mt-6 space-y-3">
              <p className="type-small font-semibold text-fg">{t.pdp.choosePack}</p>
              {size.packs.map((pack) => (
                <div
                  key={pack}
                  className="flex items-center justify-between gap-4 rounded-card border border-hairline p-4"
                >
                  <div>
                    <p className="type-body font-semibold text-fg">
                      {fmt(pack, current)} {t.sizes.packUnit}
                    </p>
                    <p className="type-small text-fg-muted">
                      {fmtMoney(size.priceByPack[pack]!, current)}
                    </p>
                  </div>
                  <AddToCartButton sizeKey={size.key} pack={pack} variant="secondary">
                    {t.pdp.addToCart}
                  </AddToCartButton>
                </div>
              ))}
            </div>
          )}

          {size.packs.length === 1 && (
            <AddToCartButton sizeKey={size.key} pack={size.packs[0]!} className="mt-6 w-full sm:w-auto">
              {t.pdp.addToCart}
            </AddToCartButton>
          )}

          <p className="type-small measure mt-8 text-fg-muted">
            {t.sizes.packLabel}: {size.packs.map((p) => fmt(p, current)).join(' · ')}{' '}
            {t.sizes.packUnit}
          </p>

          <a
            href={`/${current}#sizes`}
            className="mt-4 inline-block type-small font-semibold text-brand hover:underline"
          >
            {t.pdp.backToFinder}
          </a>
        </div>
      </div>
    </main>
  );
}
