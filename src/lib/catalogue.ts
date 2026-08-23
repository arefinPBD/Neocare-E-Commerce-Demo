import type { Dictionary, Locale } from '@/lib/i18n';
import { fmtMoney } from '@/lib/numerals';

/**
 * BUILD_SPEC v3.1 §4 — the single product catalogue.
 *
 * v3.0 had two sources: `sizes.ts` (five real diaper sizes) and
 * `placeholderCatalogue.ts` (nine invented products for the three side
 * categories, illustrated with diaper photography because nothing else
 * existed). Real packshot photography now exists for every side category, so
 * `placeholderCatalogue.ts` is deleted and every product — diapers included —
 * lives here.
 *
 * §4.3 DEDUPLICATION. One entry per unique physical product. Where `../Media`
 * holds several files of the same product (a byte-identical `(1)` copy, or a
 * second crop of the same pack), the copies collapse into one entry and the
 * usable second crop becomes a `gallery` image. No product appears twice.
 *
 * §4.4 NAMING. Adult and Face Wipes photography is Aspire, Lumera and Viva
 * packaging — sister brands of Incepta, not NeoCare. Product NAMES here carry
 * no brand word ("Adult Pant Diaper — M, 8 pcs"), while the packshot shows the
 * real pack as photographed. Nothing is retouched to remove or add a mark.
 *
 * §4.1 PRICES. Every `priceByPack` value is a placeholder — integer poisha,
 * round numbers, none client-confirmed. Same rule as v2.1. Nothing here ships
 * to production unreplaced.
 */

export type CategorySlug =
  | 'diapers'
  | 'adult-diapers'
  | 'baby-wipes'
  | 'face-wipes';

export type SizeKey = 'newBorn' | 'small' | 'medium' | 'large' | 'xl';

export type ProductKey =
  | SizeKey
  | 'adultDiaperM'
  | 'adultDiaperL'
  | 'adultPantM'
  | 'adultPantL'
  | 'underpads'
  | 'babyWipes80'
  | 'babyWipes120'
  | 'babyWipes180'
  | 'adultWetTowel'
  | 'makeupRemoverWipes'
  | 'refreshingWipes';

export interface Product {
  /** Cart identity and content key. Stable — it is persisted in localStorage. */
  key: ProductKey;
  /** '/product/{slug}' route segment. Unique across the whole catalogue. */
  slug: string;
  category: CategorySlug;
  /** The card, size-finder and PDP hero image. */
  image: string;
  /** Intrinsic size of `image`. Declared so the box never shifts on load. */
  imageW: number;
  imageH: number;
  /**
   * Further real photography of THIS product, shown on its PDP only. A second
   * crop of the same pack, never another product and never a generated image.
   */
  gallery?: { src: string; w: number; h: number }[];
  packs: number[];
  // TODO: client — placeholder prices, not confirmed. BUILD_SPEC §4.1.
  priceByPack: Record<number, number>;
}

/** Weight-banded product. Diapers only; the bands drive the size finder. */
export interface SizeRow extends Product {
  key: SizeKey;
  category: 'diapers';
  min: number;
  max: number;
}

/* The studio packshot family. All five sizes were shot the same way, so the
 * grid and the size finder read as one set. `product/packs/medium-{30,50}`
 * are the older high-resolution renders — they stay, as Medium's PDP gallery,
 * because they are the same product photographed twice (§4.3). */
const PACK = { imageW: 300, imageH: 300 } as const;

export const SIZES: SizeRow[] = [
  {
    key: 'newBorn',
    category: 'diapers',
    slug: 'new-born',
    min: 0,
    max: 4,
    packs: [20],
    image: '/product/packs/new-born.webp',
    ...PACK,
    priceByPack: { 20: 35000 },
  },
  {
    key: 'small',
    category: 'diapers',
    slug: 'small',
    min: 3,
    max: 6,
    packs: [50],
    image: '/product/packs/small.webp',
    ...PACK,
    priceByPack: { 50: 65000 },
  },
  {
    key: 'medium',
    category: 'diapers',
    slug: 'medium',
    min: 4,
    max: 9,
    packs: [30, 50],
    image: '/product/packs/medium.webp',
    ...PACK,
    gallery: [
      { src: '/product/packs/medium-50.webp', w: 720, h: 999 },
      { src: '/product/packs/medium-30.webp', w: 720, h: 636 },
    ],
    priceByPack: { 30: 45000, 50: 70000 },
  },
  {
    key: 'large',
    category: 'diapers',
    slug: 'large',
    min: 7,
    max: 18,
    packs: [50],
    image: '/product/packs/large.webp',
    ...PACK,
    priceByPack: { 50: 75000 },
  },
  {
    key: 'xl',
    category: 'diapers',
    slug: 'xl',
    min: 11,
    max: 25,
    packs: [50],
    image: '/product/packs/xl.webp',
    ...PACK,
    priceByPack: { 50: 80000 },
  },
];

const SIDE_PRODUCTS: Product[] = [
  /* --- Adult Diapers ------------------------------------------------- */
  {
    key: 'adultDiaperM',
    category: 'adult-diapers',
    slug: 'adult-diaper-m',
    packs: [8],
    image: '/product/adult/diaper-m.webp',
    ...PACK,
    // Second crop of the same M pack — the front-on thumb (§4.3).
    gallery: [{ src: '/product/adult/diaper-m-alt.webp', w: 330, h: 300 }],
    priceByPack: { 8: 45000 },
  },
  {
    key: 'adultDiaperL',
    category: 'adult-diapers',
    slug: 'adult-diaper-l',
    packs: [8],
    image: '/product/adult/diaper-l.webp',
    ...PACK,
    priceByPack: { 8: 50000 },
  },
  {
    key: 'adultPantM',
    category: 'adult-diapers',
    slug: 'adult-pant-diaper-m',
    packs: [8],
    image: '/product/adult/pant-m.webp',
    ...PACK,
    priceByPack: { 8: 50000 },
  },
  {
    key: 'adultPantL',
    category: 'adult-diapers',
    slug: 'adult-pant-diaper-l',
    packs: [8],
    image: '/product/adult/pant-l.webp',
    ...PACK,
    priceByPack: { 8: 55000 },
  },
  {
    key: 'underpads',
    category: 'adult-diapers',
    slug: 'underpads',
    packs: [10],
    image: '/product/adult/underpads.webp',
    ...PACK,
    priceByPack: { 10: 40000 },
  },

  /* --- Baby Wipes ---------------------------------------------------- */
  {
    key: 'babyWipes80',
    category: 'baby-wipes',
    slug: 'baby-wipes-80',
    packs: [80],
    image: '/product/wipes/baby-80.webp',
    ...PACK,
    priceByPack: { 80: 15000 },
  },
  {
    key: 'babyWipes120',
    category: 'baby-wipes',
    slug: 'baby-wipes-120',
    packs: [120],
    image: '/product/wipes/baby-120.webp',
    imageW: 330,
    imageH: 300,
    // Second crop of the same 120 pack (§4.3).
    gallery: [{ src: '/product/wipes/baby-120-alt.webp', w: 300, h: 300 }],
    priceByPack: { 120: 20000 },
  },
  {
    key: 'babyWipes180',
    category: 'baby-wipes',
    slug: 'baby-wipes-180',
    packs: [180],
    image: '/product/wipes/baby-180.webp',
    ...PACK,
    priceByPack: { 180: 25000 },
  },
  {
    /* Filed under Baby Wipes by product form, per the 2026-08-23 decision:
     * it is a wet towel, and the Adult Diapers page is diapers and underpads.
     * The name says "Adult" so the listing is not misleading. */
    key: 'adultWetTowel',
    category: 'baby-wipes',
    slug: 'adult-wet-towel-80',
    packs: [80],
    image: '/product/wipes/adult-wet-towel.webp',
    ...PACK,
    priceByPack: { 80: 20000 },
  },

  /* --- Face Wipes ----------------------------------------------------
   * TODO: client — the pack count on both face-wipe packshots is too small to
   * read at the supplied 300px. 25 is a placeholder carried the same way §4.1
   * carries a placeholder price: shown plainly in the UI, marked here in code.
   * Confirm both figures, and the two product names, before launch. */
  {
    key: 'makeupRemoverWipes',
    category: 'face-wipes',
    slug: 'makeup-remover-wipes',
    packs: [25],
    image: '/product/face/makeup-remover.webp',
    ...PACK,
    priceByPack: { 25: 15000 },
  },
  {
    key: 'refreshingWipes',
    category: 'face-wipes',
    slug: 'refreshing-wipes',
    packs: [25],
    image: '/product/face/refreshing.webp',
    ...PACK,
    gallery: [{ src: '/product/face/refreshing-alt.webp', w: 330, h: 300 }],
    priceByPack: { 25: 15000 },
  },
];

/** Every product, in catalogue order. Diapers first. */
export const PRODUCTS: Product[] = [...SIZES, ...SIDE_PRODUCTS];

/**
 * §5.3a — "Our Best Sellers": exactly one product per dropdown category, in
 * dropdown order.
 *
 * These four are a CLIENT-SUPPLIED editorial selection (2026-08-23), not a
 * computed figure. Non-negotiable 7 bars inventing a sales number, and none is
 * invented here: no rank, no units-sold and no "#1" appears anywhere in the
 * UI. If the client withdraws the selection, the heading and this list go
 * together — do not substitute a mechanical rule and keep the heading.
 */
// TODO: client — confirm these four remain the best sellers before launch.
export const BEST_SELLER_KEYS: ProductKey[] = [
  'medium',
  'adultPantM',
  'babyWipes120',
  'refreshingWipes',
];

/** Dropdown order, and the order categories appear on the homepage. */
export const CATEGORY_ORDER: CategorySlug[] = [
  'diapers',
  'adult-diapers',
  'baby-wipes',
  'face-wipes',
];

/** Diapers Line lives at /products; the other three at /category/{slug}. */
export function categoryHref(category: CategorySlug, locale: string): string {
  return category === 'diapers'
    ? `/${locale}/products`
    : `/${locale}/category/${category}`;
}

export function findProduct(key: string): Product | undefined {
  return PRODUCTS.find((p) => p.key === key);
}

export function findProductBySlug(slug: string): Product | undefined {
  return PRODUCTS.find((p) => p.slug === slug);
}

export function productsInCategory(category: CategorySlug): Product[] {
  return PRODUCTS.filter((p) => p.category === category);
}

export function bestSellers(): Product[] {
  return BEST_SELLER_KEYS.map((k) => findProduct(k)).filter(
    (p): p is Product => p !== undefined,
  );
}

export function isSizeRow(product: Product): product is SizeRow {
  return product.category === 'diapers';
}

/**
 * Diaper names stay under `sizes.names` — they are the size finder's labels
 * too, and moving them would reword approved copy for no reason. Everything
 * else is under `products.names`.
 */
export function productName(t: Dictionary, product: Product): string {
  return isSizeRow(product)
    ? t.sizes.names[product.key]
    : t.products.names[product.key as keyof Dictionary['products']['names']];
}

/**
 * Whether a packshot should bypass `next/image`'s optimizer.
 *
 * BUILD_SPEC v3.1 §11.1. The packshots are supplied at 300x300 (a few at
 * 330x300) and `scripts/build-assets.mjs` already emits them as tuned WebP at
 * 5-19 KB. Asking the optimizer for a w=384/640/750 variant makes it UPSCALE a
 * 300px source: measured on `adult-wet-towel`, the w=640 variant is 5,382
 * bytes against the original's 6,344 — no meaningful saving, for a re-encode
 * per width per format, on a landing page that now shows eleven of them.
 *
 * Serving the original costs the server nothing, removes eleven on-demand
 * optimizer round-trips from the landing page, and is the same number of
 * bytes. It is also the right resolution: a card is ~160 CSS px on a 375px
 * screen, which is 320px at 2x — 300px native lands almost exactly there.
 *
 * The threshold is a width, not a flag, so a future higher-resolution packshot
 * automatically goes back through the optimizer where it belongs.
 */
export function servesOriginal(product: Product): boolean {
  return product.imageW <= 400;
}

/** Category heading, reusing the approved dropdown labels rather than new copy. */
export function categoryLabel(t: Dictionary, category: CategorySlug): string {
  switch (category) {
    case 'diapers':
      return t.nav.productsDiaperLine;
    case 'adult-diapers':
      return t.nav.productsAdultDiapers;
    case 'baby-wipes':
      return t.nav.productsBabyWipes;
    case 'face-wipes':
      return t.nav.productsFaceWipes;
  }
}

/** Alt text for a packshot. Diapers keep their existing approved string. */
export function packAlt(t: Dictionary, product: Product): string {
  return isSizeRow(product)
    ? t.sizes.packAlt.replace('{size}', productName(t, product))
    : t.products.packAlt.replace('{product}', productName(t, product));
}

/** Single value when a product has one pack size; a [min, max] pair otherwise. */
export function priceRange(product: Product): [number, number] {
  const prices = product.packs.map((p) => product.priceByPack[p] ?? 0);
  return [Math.min(...prices), Math.max(...prices)];
}

/**
 * One price, or `min – max` across pack variants. Extracted in v3.1 because
 * five call sites had grown their own identical copy of it and DESIGN.md §6.3
 * governs how it reads.
 *
 * The en dash is the existing v2.1 rendering, kept byte-identical.
 */
export function priceDisplay(product: Product, locale: Locale): string {
  const [min, max] = priceRange(product);
  return min === max
    ? fmtMoney(min, locale)
    : `${fmtMoney(min, locale)} – ${fmtMoney(max, locale)}`;
}
