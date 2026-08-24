import { lang } from 'next/root-params';
import { notFound } from 'next/navigation';
import Image from 'next/image';

import { PackPicker } from '@/components/product/PackPicker';
import { SizeRowChips } from '@/components/product/SizeRowChips';
import {
  categoryLabel,
  findProductBySlug,
  isSizeRow,
  packAlt,
  priceDisplay,
  productName,
  PRODUCTS,
  servesOriginal,
  type Product,
} from '@/lib/catalogue';
import { getDictionary, isLocale, type Dictionary } from '@/lib/i18n';
import { fmt, fmtWeight } from '@/lib/numerals';

/* BUILD_SPEC v3.1 §6.3 — the product detail page, on the reference kit's
 * 12-column gallery-overlap grid. Fully static, no data fetching; `slug` is a
 * regular route parameter and `lang` a root parameter.
 *
 * v3.1 — the route now covers the whole catalogue, not the five diaper sizes.
 * Everything diaper-specific is gated on `isSizeRow`, and the gate is a
 * correctness requirement rather than a layout preference:
 *
 *   - FEATURE_IMAGES are five close-ups of the NeoCare diaper. The diaper is
 *     identical across sizes, so showing them on any SIZE's page is accurate.
 *     Showing them on a wipes or adult-diaper page would attach a product
 *     claim to photography of a different product — non-negotiable 3.
 *   - The five feature bullets are the same claim in text form, so they are
 *     gated with the images.
 *   - The weight range in the facts row (§6.5) and the size chips (§6.4) are
 *     baby-diaper sizing. Nothing else in the catalogue is weight-banded.
 *   - "Not sure which size? Use the size finder" points at a finder that only
 *     covers diapers, so it goes with them.
 *
 * `gallery` carries further REAL photography of the product itself — a second
 * crop of the same pack (§4.3). Nothing is generated, upscaled, mirrored or
 * recoloured to fill a grid cell. `public/newborn/cutout-flatlay.*` stays out
 * entirely: the navel cutout appears in the New Born section only
 * (non-negotiable 4).
 */
const FEATURE_IMAGES = [
  { key: 'sap', src: '/product/features/sap.webp' },
  { key: 'cuff', src: '/product/features/cuff.webp' },
  { key: 'ear', src: '/product/features/ear.webp' },
  { key: 'velcro', src: '/product/features/velcro.webp' },
  { key: 'backsheet', src: '/product/features/backsheet.webp' },
] as const;

export function generateStaticParams() {
  return PRODUCTS.map((p) => ({ slug: p.slug }));
}

/** Secondary gallery tiles: the product's own extra crops, then — for a
 *  diaper only — the five shared feature close-ups. */
function secondaryImages(
  product: Product,
  t: Dictionary,
): { key: string; src: string; alt: string }[] {
  const own = (product.gallery ?? []).map((g, i) => ({
    key: `own-${i}`,
    src: g.src,
    alt: packAlt(t, product),
  }));

  if (!isSizeRow(product)) return own;

  return [
    ...own,
    ...FEATURE_IMAGES.map((img) => ({
      key: img.key,
      src: img.src,
      alt: t.features[img.key].imageAlt,
    })),
  ];
}

export default async function ProductPage(
  props: PageProps<'/[lang]/product/[slug]'>,
) {
  const { slug } = await props.params;
  const current = await lang();
  if (!current || !isLocale(current)) return null;

  const product = findProductBySlug(slug);
  if (!product) notFound();

  const t = getDictionary(current);
  const name = productName(t, product);
  const isDiaper = isSizeRow(product);

  /* §6.5 replaces the kit's rating row, so there is no single "the price" to
   * show beside the title on a multi-pack product. A range here, and each
   * pack's own price on its chip below, keeps every figure attached to the
   * thing it prices. Matches DESIGN.md §6.3's treatment on the product card.
   * Every one of these is a placeholder (§4.1), marked at the data source. */
  const packList = product.packs.map((p) => fmt(p, current)).join(', ');
  const gallery = secondaryImages(product, t);

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
              {priceDisplay(product, current)}
            </p>
          </div>

          {/* §6.5 — the rating slot, carrying the product's real facts.
              NeoCare has no rating or review data and will not fabricate
              either (non-negotiable 7): no stars, no --color-rating token, no
              review count, no "See all N reviews" link. Same position, same
              type-small, same mt-4 the kit gives its rating row. */}
          <p className="type-small mt-4 text-fg-muted">
            {isDiaper && (
              <>
                {t.sizes.weightRange
                  .replace('{min}', fmtWeight(product.min, current))
                  .replace('{max}', fmtWeight(product.max, current))}
                <span aria-hidden="true" className="ml-4 text-ink-300">
                  ·
                </span>{' '}
              </>
            )}
            {packList} {t.sizes.packUnit}
          </p>
        </div>

        {/* --- Gallery ------------------------------------------------- */}
        <div className="mt-8 lg:col-span-7 lg:col-start-1 lg:row-span-3 lg:row-start-1 lg:mt-0">
          <div className="grid grid-cols-1 lg:grid-cols-2 lg:grid-rows-3 lg:gap-8">
            <div className="hover-zoom relative aspect-square overflow-hidden rounded-soft border border-hairline bg-surface-alt lg:col-span-2 lg:row-span-2">
              <Image
                src={product.image}
                alt={packAlt(t, product)}
                fill
                /* Only image one is ever visible below lg, so it is the only
                   one that should be fetched there (§11). */
                sizes="(min-width: 1024px) 58vw, 100vw"
                priority
                unoptimized={servesOriginal(product)}
                className="object-contain p-10"
              />
            </div>

            {gallery.map((img) => (
              <div
                key={img.key}
                /* hidden below lg — and `sizes` is declared so next/image
                   does not request it on a phone. Verified at 375px. */
                className="hover-zoom relative hidden aspect-square overflow-hidden rounded-soft border border-hairline bg-surface-alt lg:block"
              >
                <Image
                  src={img.src}
                  alt={img.alt}
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
          {isDiaper && (
            <SizeRowChips current={product.key} locale={current} t={t} />
          )}

          <div className={isDiaper ? 'mt-8' : ''}>
            <PackPicker
              sizeKey={product.key}
              packs={product.packs}
              priceByPack={product.priceByPack}
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
              {t.pdp.description[product.key]}
            </p>
          </div>

          {/* §9 — the label and the five bullets are existing approved copy
              (product.featuresTitle, features.*.title), reused rather than
              rewritten. Diapers only: they describe the diaper. */}
          {isDiaper && (
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
          )}

          {isDiaper ? (
            <a
              href={`/${current}#sizes`}
              className="mt-8 inline-block type-small font-semibold text-brand hover:underline"
            >
              {t.pdp.backToFinder}
            </a>
          ) : (
            <a
              href={`/${current}/category/${product.category}`}
              className="mt-8 inline-block type-small font-semibold text-brand hover:underline"
            >
              {t.shop.seeAllIn.replace('{category}', categoryLabel(t, product.category))}
            </a>
          )}
        </div>
      </div>
    </main>
  );
}
