'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useId, useState } from 'react';

import { AddToCartButton } from '@/components/product/AddToCartButton';
import type { Dictionary, Locale } from '@/lib/i18n';
import { fmt, fmtWeight } from '@/lib/numerals';
import {
  recommendFor,
  WEIGHT_MAX,
  WEIGHT_MIN,
  WEIGHT_STEP,
  type SizeRow,
} from '@/lib/sizes';

/**
 * S10 — real <input type="range">, never a div with drag handlers (§5 S10).
 * aria-valuetext carries the spoken value; a visible numeric readout sits
 * beside it. Keyboard-operable for free.
 *
 * Overlapping ranges are resolved by band centrality — see lib/sizes.ts. The
 * primary card is one size; every other size that also covers the weight is
 * listed underneath rather than hidden.
 *
 * BUILD_SPEC v3.0 §6.6 — the range input, recommendFor logic, aria-valuetext
 * and numeric readout are all unchanged. Two things do change:
 *
 *   - The alternate-size chips take §6.4's styling, so both chip rows on the
 *     site match. `uppercase` sits on the size name only, not on the whole
 *     chip: §6.4 uppercases size names, and running "For 4-9 kg" through it
 *     reads as shouting rather than as a label. globals.css neutralises it on
 *     /bn either way.
 *   - They also become links. They already carried hover styling while being
 *     inert <span>s, which promises an interaction that never happens; §6.4
 *     specifies hover and selected states, which presuppose something
 *     interactive. They now go where SizeRowChips goes, the size's own PDP.
 *
 * §6.6 describes the recommended card as keeping "its AddToCartButton and its
 * View details link". Neither existed — v2.1 shipped the card as a static
 * panel — so both are added here to match the spec's described end state.
 * Add-to-cart is gated to single-pack sizes exactly as ProductCard gates
 * quick-add (DESIGN.md §6.3): a multi-pack size routes through the PDP so the
 * visitor picks a pack rather than having one chosen for them.
 */
export function SizeSelector({ t, locale }: { t: Dictionary; locale: Locale }) {
  const [weight, setWeight] = useState(6);
  const sliderId = useId();
  const { primary, alternates } = recommendFor(weight);

  const name = (row: SizeRow) => t.sizes.names[row.key];
  const range = (row: SizeRow) =>
    t.sizes.weightRange
      .replace('{min}', fmtWeight(row.min, locale))
      .replace('{max}', fmtWeight(row.max, locale));

  const pct = Math.max(
    0,
    Math.min(100, ((weight - WEIGHT_MIN) / (WEIGHT_MAX - WEIGHT_MIN)) * 100)
  );

  const handleWeightChange = (val: string) => {
    const parsed = parseFloat(val);
    if (!isNaN(parsed)) {
      setWeight(parsed);
    }
  };

  return (
    <section
      id="sizes"
      aria-labelledby="sizes-heading"
      className="section-rhythm bg-surface"
    >
      <div className="mx-auto max-w-(--container-content) px-4 md:px-6">
        <h2 id="sizes-heading" className="type-h1 measure text-fg">
          {t.sizes.title}
        </h2>
        <p className="type-body-lg measure mt-4 text-fg-muted">
          {t.sizes.intro}
        </p>

        <div className="mt-8">
          <label htmlFor={sliderId} className="type-body font-semibold text-fg">
            {t.sizes.sliderLabel}
          </label>

          <output
            htmlFor={sliderId}
            aria-live="polite"
            className="mt-2 block type-h2 font-semibold text-brand"
          >
            {fmtWeight(weight, locale)} {t.sizes.unit}
          </output>

          <input
            id={sliderId}
            type="range"
            min={WEIGHT_MIN}
            max={WEIGHT_MAX}
            step={WEIGHT_STEP}
            value={weight}
            onChange={(e) => handleWeightChange(e.target.value)}
            onInput={(e) => handleWeightChange((e.target as HTMLInputElement).value)}
            aria-valuetext={`${fmtWeight(weight, locale)} ${t.sizes.unitLong}`}
            className="size-slider mt-4 h-3 w-full cursor-pointer rounded-pill accent-[var(--color-primary)]"
            style={{
              background: `linear-gradient(to right, var(--color-primary) 0%, var(--color-primary) ${pct}%, var(--color-hairline) ${pct}%, var(--color-hairline) 100%)`,
            }}
          />

          <div className="flex justify-between type-small text-fg-muted">
            <span>
              {fmtWeight(WEIGHT_MIN, locale)} {t.sizes.unit}
            </span>
            <span>
              {fmtWeight(WEIGHT_MAX, locale)} {t.sizes.unit}
            </span>
          </div>
        </div>

        {/* Recommended size */}
        <article className="hover-card mt-8 overflow-hidden rounded-card border border-hairline bg-surface-alt shadow-card">
          <div className="flex items-center gap-4 p-6">
            <div className="hover-zoom h-24 w-24 shrink-0 overflow-hidden rounded-soft">
              <Image
                src={primary.image}
                alt={t.sizes.packAlt.replace('{size}', name(primary))}
                width={primary.imageW}
                height={primary.imageH}
                sizes="96px"
                loading="lazy"
                className="h-24 w-24 object-contain"
              />
            </div>
            <div className="min-w-0">
              <p className="type-small font-semibold uppercase text-green-700">
                {t.sizes.recommended}
              </p>
              <p className="type-h2 font-semibold text-fg">{name(primary)}</p>
              <p className="type-body text-fg-muted">{range(primary)}</p>
              <p className="type-small mt-1 text-fg-muted">
                {t.sizes.packLabel}:{' '}
                {primary.packs.map((p) => fmt(p, locale)).join(' · ')}{' '}
                {t.sizes.packUnit}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-4 border-t border-hairline px-6 py-4">
            {primary.packs.length === 1 && (
              <AddToCartButton sizeKey={primary.key} pack={primary.packs[0]!}>
                {t.pdp.addToCart}
              </AddToCartButton>
            )}
            <Link
              href={`/${locale}/product/${primary.slug}`}
              className="inline-flex min-h-11 items-center type-small font-semibold text-brand transition-colors duration-[--dur-fast] hover:text-brand-hover hover:underline"
            >
              {t.sizes.viewDetails}
            </Link>
          </div>
        </article>

        {/* Every other size whose range also covers this weight. */}
        {alternates.length > 0 && (
          <div className="mt-4">
            <p className="type-small font-semibold text-fg-muted">
              {t.sizes.alsoFits}
            </p>
            <ul className="mt-2 flex flex-wrap gap-3">
              {alternates.map((row) => (
                <li key={row.key}>
                  <Link
                    href={`/${locale}/product/${row.slug}`}
                    className="inline-flex min-h-11 items-center gap-2 rounded-pill border border-hairline bg-surface px-3 py-3 type-small font-semibold text-fg transition-colors duration-[--dur-fast] ease-[--ease-out] hover:bg-surface-brand focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  >
                    <span className="uppercase">{name(row)}</span>
                    <span className="font-normal text-fg-muted">
                      {range(row)}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}

        <p className="type-small measure mt-6 text-fg-muted">
          {t.sizes.confirmNote}
        </p>
      </div>
    </section>
  );
}
