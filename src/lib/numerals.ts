import type { Locale } from './i18n';

/**
 * DESIGN.md §8 left this unresolved: `৳ 920` or `৳ ৯২০`?
 *
 * DECISION: Western digits in both locales.
 *
 *  1. The physical product disagrees with the alternative — the pack prints
 *     "M" and "50 pcs" in Western digits. A page rendering ৫০ beside a pack
 *     printed 50 creates friction at the point of recognition.
 *  2. Hind Siliguri's Bengali digits are not tabular and vary in width; the
 *     size-selector readout would visibly reflow on every slider step.
 *  3. Bengali digit coverage in TalkBack/NVDA speech synthesis is inconsistent,
 *     so aria-valuetext reads more reliably with Western digits.
 *  4. `bn-BD-u-nu-latn` keeps Bangla grouping and separator conventions — this
 *     is locale-correct formatting, not an English fallback.
 *
 * TO REVERSE: drop `-u-nu-latn` below. Nothing else changes.
 */
const NUMBER_LOCALE: Record<Locale, string> = {
  en: 'en-US',
  bn: 'bn-BD-u-nu-latn',
};

export function fmt(
  value: number,
  locale: Locale,
  options?: Intl.NumberFormatOptions,
): string {
  return new Intl.NumberFormat(NUMBER_LOCALE[locale], options).format(value);
}

/** Weights carry one decimal only when they have a fractional part. */
export function fmtWeight(kg: number, locale: Locale): string {
  return fmt(kg, locale, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 1,
  });
}

/**
 * `poisha` -> "৳ {taka}", no decimals (every placeholder price in sizes.ts is
 * a whole-taka amount). BUILD_SPEC §4.1 — every value passed through this is
 * a placeholder until the client confirms real prices.
 */
export function fmtMoney(poisha: number, locale: Locale): string {
  return `৳ ${fmt(Math.round(poisha / 100), locale)}`;
}
