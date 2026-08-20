import { lang } from 'next/root-params';
import { notFound } from 'next/navigation';
import Image from 'next/image';

import { PackPicker } from '@/components/product/PackPicker';
import { SizeRowChips } from '@/components/product/SizeRowChips';
import { getDictionary, isLocale } from '@/lib/i18n';
import { fmt, fmtWeight, fmtMoney } from '@/lib/numerals';
import { findBySlug, priceRange, SIZES } from '@/lib/sizes';

/* BUILD_SPEC v3.0 §6.3 — the product detail page, re-laid out on the
 * reference kit's 12-column gallery-overlap grid. Fully static, no data
 * fetching; `slug` is a regular route parameter and `lang` a root parameter.
 *
 * FEATURE_IMAGES — §6.3 is explicit about which images may appear here, and
 * non-negotiable 3 is behind it. Image one is the product's own photograph.
 * Every subsequent image comes ONLY from public/product/features/*.webp: five
 * real close-up crops of the real diaper, already captioned in en.json as
 * `features.*.imageAlt`, reused with those exact alt strings.
 *
 * The diaper itself is identical across sizes, so showing these crops on any
 * size's page is accurate. They are NOT presented as alternate angles of the
 * pack, and nothing here is generated, upscaled, mirrored or recoloured to
 * fill a grid cell. public/newborn/cutout-flatlay.* stays out entirely: the
 * navel cutout appears in the New Born section only (non-negotiable 4).
 */
const FEATURE_IMAGES = [
  { key: 'sap', src: '/product/features/sap.webp' },
  { key: 'cuff', src: '/product/features/cuff.webp' },
  { key: 'ear', src: '/product/features/ear.webp' },
  { key: 'velcro', src: '/product/features/velcro.webp' },
  { key: 'backsheet', src: '/product/features/backsheet.webp' },
] as const;

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

  /* §6.5 replaces the kit's rating row, so there is no single "the price" to
   * show beside the title on a multi-pack product. A range here, and each
   * pack's own price on its chip below, keeps every figure attached to the
   * thing it prices. Matches DESIGN.md §6.3's treatment on the product card.
   * Every one of these is a placeholder (§4.1), marked at the data source. */
  const [minPrice, maxPrice] = priceRange(size);
  const priceDisplay =
    minPrice === maxPrice
      ? fmtMoney(minPrice, current)
      : `${fmtMoney(minPrice, current)} – ${fmtMoney(maxPrice, current)}`;

  const packList = size.packs.map((p) => fmt(p, current)).join(', ');

  return (
    /* §5.3 — the commerce page container. Narrower than the marketing
       container below lg by design; do not unify the two (§7.1). */
    <main
      id="main"
      className="mx-auto max-w-2xl px-4 pb-16 pt-12 sm:px-6 sm:pb-24 lg:max-w-7xl lg:px-8"
    >
      {/* §6.3 — DOM order is header, gallery, controls. The grid places the
          gallery on the left visually while the product name stays first in
          the reading order, so a screen reader hears the name before the
          images (§10). Do not reorder the DOM to match the visual layout. */}
      <div className="lg:grid lg:auto-rows-min lg:grid-cols-12 lg:gap-x-8">
        {/* --- Header block ------------------------------------------- */}
        <div className="lg:col-span-5 lg:col-start-8">
          <div className="flex items-start justify-between gap-4">
            <h1 className="type-h3 font-semibold text-fg">{name}</h1>
            <p className="type-h3 shrink-0 text-right font-semibold text-fg">
              {priceDisplay}
            </p>
          </div>

          {/* §6.5 — the rating slot, carrying the product's real facts.
              NeoCare has no rating or review data and will not fabricate
              either (non-negotiable 7): no stars, no --color-rating token, no
              review count, no "See all N reviews" link. Same position, same
              type-small, same mt-4 the kit gives its rating row. */}
          <p className="type-small mt-4 text-fg-muted">
            {range}
            <span aria-hidden="true" className="ml-4 text-ink-300">
              ·
            </span>{' '}
            {packList} {t.sizes.packUnit}
          </p>
        </div>

        {/* --- Gallery ------------------------------------------------- */}
        <div className="mt-8 lg:col-span-7 lg:col-start-1 lg:row-span-3 lg:row-start-1 lg:mt-0">
          <div className="grid grid-cols-1 lg:grid-cols-2 lg:grid-rows-3 lg:gap-8">
            <div className="relative aspect-square overflow-hidden rounded-soft border border-hairline bg-surface-alt lg:col-span-2 lg:row-span-2">
              <Image
                src={size.image}
                alt={t.sizes.packAlt.replace('{size}', name)}
                fill
                /* Only image one is ever visible below lg, so it is the only
                   one that should be fetched there (§11). */
                sizes="(min-width: 1024px) 58vw, 100vw"
                priority
                className="object-contain p-10"
              />
            </div>

            {FEATURE_IMAGES.map((img) => (
              <div
                key={img.key}
                /* hidden below lg — and `sizes` is declared so next/image
                   does not request it on a phone. Verified at 375px. */
                className="relative hidden aspect-square overflow-hidden rounded-soft border border-hairline bg-surface-alt lg:block"
              >
                <Image
                  src={img.src}
                  alt={t.features[img.key].imageAlt}
                  fill
                  sizes="(min-width: 1024px) 29vw, 1px"
                  className="object-contain p-6"
                />
              </div>
            ))}
          </div>
        </div>

        {/* --- Controls ------------------------------------------------ */}
        <div className="mt-8 lg:col-span-5">
          <SizeRowChips current={size.key} locale={current} t={t} />

          <div className="mt-8">
            <PackPicker
              sizeKey={size.key}
              packs={size.packs}
              priceByPack={size.priceByPack}
              locale={current}
              label={t.pdp.choosePack}
              packUnit={t.sizes.packUnit}
              addToCartLabel={t.pdp.addToCart}
            />
          </div>

          <div className="mt-10">
            <h2 className="type-small font-semibold text-fg">
              {t.pdp.descriptionTitle}
            </h2>
            <p className="type-body measure mt-4 text-fg-muted">
              {t.pdp.description[size.key]}
            </p>
          </div>

          {/* §9 — the label and the five bullets are existing approved copy
              (product.featuresTitle, features.*.title), reused rather than
              rewritten. */}
          <div className="mt-8 border-t border-hairline pt-8">
            <h2 className="type-small font-semibold text-fg">
              {t.product.featuresTitle}
            </h2>
            <ul className="mt-4 list-disc space-y-1 pl-5 type-body text-fg-muted marker:text-ink-300">
              {FEATURE_IMAGES.map((f) => (
                <li key={f.key} className="pl-2">
                  {t.features[f.key].title}
                </li>
              ))}
            </ul>
          </div>

          <a
            href={`/${current}#sizes`}
            className="mt-8 inline-block type-small font-semibold text-brand hover:underline"
          >
            {t.pdp.backToFinder}
          </a>
        </div>
      </div>
    </main>
  );
}
