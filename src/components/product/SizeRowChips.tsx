import Link from 'next/link';

import type { Dictionary, Locale } from '@/lib/i18n';
import { SIZES, type SizeKey } from '@/lib/sizes';

const CHIP =
  'flex items-center justify-center rounded-pill border border-hairline px-3 py-3 ' +
  'type-small font-semibold uppercase transition-colors duration-[--dur-fast] ' +
  'focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2';

/**
 * BUILD_SPEC v3.0 §6.4 — the size row.
 *
 * The reference kit's colour-swatch row becomes real cross-navigation: the
 * five sizes, with the current one in the selected state and the other four as
 * links to their own product pages. It earns the slot rather than decorating
 * it — a visitor who landed on Large from search reaches Medium without going
 * back to the grid.
 *
 * §10 — a chip that navigates is a <Link>, not a radio. Only the pack row
 * (PackPicker) has radio-group semantics, because only the pack row is a
 * choice within this page.
 *
 * Widths: `grid-cols-3 sm:grid-cols-5` per §6.4. Nothing is fixed to English
 * text; "New Born" is three times the width of "XL" before Bangla adds
 * 15-30%. `uppercase` is neutralised on /bn by globals.css (DESIGN.md §2.3).
 */
export function SizeRowChips({
  current,
  locale,
  t,
}: {
  current: SizeKey;
  locale: Locale;
  t: Dictionary;
}) {
  return (
    <div>
      <h2 className="type-small font-semibold text-fg">{t.pdp.sizeLabel}</h2>

      <div className="mt-2 grid grid-cols-3 gap-3 sm:grid-cols-5">
        {SIZES.map((size) => {
          const name = t.sizes.names[size.key];

          if (size.key === current) {
            return (
              <span
                key={size.key}
                aria-current="page"
                className={`${CHIP} border-transparent bg-brand text-fg-inverse`}
              >
                {name}
              </span>
            );
          }

          return (
            <Link
              key={size.key}
              href={`/${locale}/product/${size.slug}`}
              className={`${CHIP} bg-surface text-fg hover:bg-surface-brand`}
            >
              {name}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
