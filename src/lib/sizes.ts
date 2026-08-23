import { SIZES, type SizeRow } from '@/lib/catalogue';

/**
 * The size finder's weight logic.
 *
 * BUILD_SPEC v3.1 §4 — the DATA moved to `catalogue.ts`, which is now the one
 * catalogue for every product rather than for diapers alone. This module keeps
 * the diaper-only weight-band behaviour and re-exports the diaper slice, so
 * every existing `@/lib/sizes` import continues to resolve unchanged.
 */
export { SIZES, priceRange } from '@/lib/catalogue';
export type { SizeKey, SizeRow } from '@/lib/catalogue';

export function findBySlug(slug: string): SizeRow | undefined {
  return SIZES.find((row) => row.slug === slug);
}

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
