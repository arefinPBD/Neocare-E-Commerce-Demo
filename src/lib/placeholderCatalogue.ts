/**
 * BUILD_SPEC v2.0 §4.2 — placeholder catalogue for the "Our Products"
 * categories that have no real inventory yet (Adult Diapers, Baby Wipes,
 * Face Wipes). Every image here is real NeoCare diaper photography already
 * used elsewhere on the site (non-negotiable 3 still holds — nothing
 * AI-generated, nothing stock) standing in for the category's own,
 * not-yet-shot product photography.
 *
 * TODO: client — every entry in this file is placeholder photography, a
 * placeholder name, and a placeholder price. Replace wholesale with real
 * Adult Diapers / Baby Wipes / Face Wipes product data once it exists;
 * nothing here should ship to production as-is.
 */
export interface PlaceholderItem {
  slug: string;
  /** Content key under category.items.{categorySlug}.{itemKey} */
  key: string;
  image: string;
  imageW: number;
  imageH: number;
  /** Poisha, placeholder — same convention as sizes.ts. */
  price: number;
}

export interface PlaceholderCategory {
  slug: 'adult-diapers' | 'baby-wipes' | 'face-wipes';
  items: PlaceholderItem[];
}

export const PLACEHOLDER_CATEGORIES: PlaceholderCategory[] = [
  {
    slug: 'adult-diapers',
    items: [
      { slug: 'regular', key: 'regular', image: '/product/features/backsheet.webp', imageW: 720, imageH: 560, price: 55000 },
      { slug: 'overnight', key: 'overnight', image: '/product/features/cuff.webp', imageW: 720, imageH: 560, price: 65000 },
      { slug: 'maxi', key: 'maxi', image: '/product/packs/medium-50.webp', imageW: 720, imageH: 999, price: 75000 },
    ],
  },
  {
    slug: 'baby-wipes',
    items: [
      { slug: 'pack-80', key: 'pack80', image: '/product/prints/print-01.webp', imageW: 720, imageH: 560, price: 12000 },
      { slug: 'pack-120', key: 'pack120', image: '/product/prints/print-02.webp', imageW: 720, imageH: 560, price: 16000 },
      { slug: 'pack-3x80', key: 'pack3x80', image: '/product/prints/print-03.webp', imageW: 720, imageH: 560, price: 32000 },
    ],
  },
  {
    slug: 'face-wipes',
    items: [
      { slug: 'pack-30', key: 'pack30', image: '/product/prints/print-04.webp', imageW: 720, imageH: 560, price: 9000 },
      { slug: 'pack-60', key: 'pack60', image: '/product/prints/print-05.webp', imageW: 720, imageH: 560, price: 15000 },
      { slug: 'pack-90', key: 'pack90', image: '/product/prints/print-06.webp', imageW: 720, imageH: 560, price: 20000 },
    ],
  },
];

export function findCategory(slug: string): PlaceholderCategory | undefined {
  return PLACEHOLDER_CATEGORIES.find((c) => c.slug === slug);
}
