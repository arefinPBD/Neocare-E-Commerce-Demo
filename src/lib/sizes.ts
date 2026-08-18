export type SizeKey = 'newBorn' | 'small' | 'medium' | 'large' | 'xl';

export interface SizeRow {
  key: SizeKey;
  min: number;
  max: number;
  packs: number[];
  /** Real pack photography where it exists; otherwise the product cutout. */
  image: string;
  /** Intrinsic size of `image`. Declared so the box never shifts on load. */
  imageW: number;
  imageH: number;
}

const CUTOUT = { image: '/product/hero-frame.webp', imageW: 1400, imageH: 1089 };

/* BUILD_SPEC §5 S10. Ranges taken from the live site — client to confirm.
 * Overlaps are intentional; they exist on the current site too. */
export const SIZES: SizeRow[] = [
  { key: 'newBorn', min: 0, max: 4, packs: [20], ...CUTOUT },
  { key: 'small', min: 3, max: 6, packs: [50], ...CUTOUT },
  {
    key: 'medium',
    min: 4,
    max: 9,
    packs: [30, 50],
    // The only size with real pack photography. The rest show the product
    // cutout — the diaper is the same across sizes, so this is accurate.
    image: '/product/packs/medium-50.webp',
    imageW: 720,
    imageH: 999,
  },
  { key: 'large', min: 7, max: 18, packs: [50], ...CUTOUT },
  { key: 'xl', min: 11, max: 25, packs: [50], ...CUTOUT },
];

export const WEIGHT_MIN = 3;
export const WEIGHT_MAX = 25;
export const WEIGHT_STEP = 0.5;

/**
 * How centrally a weight sits inside a size's band. 1.0 at the midpoint,
 * 0 at either edge.
 *
 * The ranges overlap by design, so a weight can match two or three sizes at
 * once (4.0 kg matches New Born, Small AND Medium). Picking the smaller size
 * risks leaks; picking the larger reads as an upsell and fits loosely. Ranking
 * by centrality picks the band the baby sits most comfortably inside, and is
 * stable as the slider drags — so the card does not flicker between sizes.
 */
export function centrality(weight: number, row: SizeRow): number {
  const half = (row.max - row.min) / 2;
  if (half <= 0) return weight === row.min ? 1 : 0;
  const mid = (row.min + row.max) / 2;
  return 1 - Math.abs(weight - mid) / half;
}

export function matches(weight: number, row: SizeRow): boolean {
  return weight >= row.min && weight <= row.max;
}

export interface Recommendation {
  primary: SizeRow;
  /** Every other size whose range also covers this weight. Never hidden. */
  alternates: SizeRow[];
}

/**
 * Highest centrality wins the recommended card. Ties break to the larger size —
 * on a growing baby the bigger of two equally-central sizes lasts longer.
 *
 * Every other matching size is returned as an alternate so no valid option is
 * hidden from the user (BUILD_SPEC §8).
 */
export function recommendFor(weight: number): Recommendation {
  const hits = SIZES.filter((row) => matches(weight, row));

  // Outside every band (not reachable from the slider, but keep it total).
  if (hits.length === 0) {
    const nearest = [...SIZES].sort(
      (a, b) =>
        Math.min(Math.abs(weight - a.min), Math.abs(weight - a.max)) -
        Math.min(Math.abs(weight - b.min), Math.abs(weight - b.max)),
    )[0];
    return { primary: nearest, alternates: [] };
  }

  const ranked = [...hits].sort((a, b) => {
    const diff = centrality(weight, b) - centrality(weight, a);
    if (Math.abs(diff) > 1e-9) return diff;
    return b.max - a.max; // tie -> larger size
  });

  return { primary: ranked[0], alternates: ranked.slice(1) };
}
